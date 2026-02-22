import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/* ------------------------------------------------------------------ */
/*  CORS helpers                                                       */
/* ------------------------------------------------------------------ */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function corsResponse(status = 200) {
  return new Response(null, { status, headers: CORS_HEADERS });
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

/* ------------------------------------------------------------------ */
/*  Stripe helpers                                                     */
/* ------------------------------------------------------------------ */

const STRIPE_API = "https://api.stripe.com/v1";

function stripeHeaders(): Record<string, string> {
  const secret = Deno.env.get("STRIPE_SECRET_KEY")!;
  const encoded = btoa(secret + ":");
  return {
    Authorization: `Basic ${encoded}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
}

/* ------------------------------------------------------------------ */
/*  Main handler                                                       */
/* ------------------------------------------------------------------ */

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return corsResponse(204);
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    // ---- 1. Verify JWT ----
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing authorization" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return jsonResponse({ error: "Invalid token" }, 401);
    }

    // ---- 2. Parse body ----
    const body = await req.json();
    const { organization_id, return_url }: { organization_id: string; return_url: string } = body;

    if (!organization_id || !return_url) {
      return jsonResponse({ error: "Missing required fields: organization_id, return_url" }, 400);
    }

    // ---- 3. Lookup stripe_customer_id ----
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("organization_id", organization_id)
      .single();

    if (subError || !subscription?.stripe_customer_id) {
      return jsonResponse({ error: "No Stripe customer found for this organization" }, 404);
    }

    // ---- 4. Create billing portal session ----
    const portalParams = new URLSearchParams();
    portalParams.append("customer", subscription.stripe_customer_id);
    portalParams.append("return_url", return_url);

    const portalRes = await fetch(`${STRIPE_API}/billing_portal/sessions`, {
      method: "POST",
      headers: stripeHeaders(),
      body: portalParams.toString(),
    });

    if (!portalRes.ok) {
      const errText = await portalRes.text();
      console.error("Stripe portal session error:", errText);
      return jsonResponse({ error: "Failed to create portal session" }, 502);
    }

    const portalSession = await portalRes.json();

    // ---- 5. Return portal URL ----
    return jsonResponse({ url: portalSession.url });
  } catch (err) {
    console.error("Unexpected error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
