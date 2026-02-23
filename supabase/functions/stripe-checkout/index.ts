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
/*  Price ID lookup                                                    */
/* ------------------------------------------------------------------ */

/**
 * Resolve the Stripe Price ID for a given plan + period combination.
 *
 * Priority:
 *   1. Env-var based lookup (STRIPE_PRICE_MEMBER_MONTHLY, etc.)
 *   2. Legacy env-var names  (STRIPE_PRICE_PRO_MONTHLY, etc.)
 *   3. Hardcoded fallbacks   (from frontend PLANS definition)
 */
function getPriceId(plan: string, period: string): string | null {
  // Map current plan names → env-var prefix (+ legacy aliases)
  const envPrefixes: Record<string, string[]> = {
    member:     ["MEMBER", "PRO"],
    expert:     ["EXPERT", "ENTERPRISE"],
    // Legacy names (backward compat)
    pro:        ["PRO", "MEMBER"],
    enterprise: ["ENTERPRISE", "EXPERT"],
  };

  const prefixes = envPrefixes[plan];
  if (!prefixes) return null;

  const periodUpper = period.toUpperCase(); // MONTHLY | YEARLY

  // Try each env-var prefix
  for (const prefix of prefixes) {
    const val = Deno.env.get(`STRIPE_PRICE_${prefix}_${periodUpper}`);
    if (val) return val;
  }

  // Hardcoded fallbacks (mirrors src/lib/stripe.ts PLANS)
  const hardcoded: Record<string, string> = {
    member_monthly:  "price_1T3nfmGxmyz5JooX0eHr5UID",
    member_yearly:   "price_1T3nfnGxmyz5JooXt3KF9w7O",
    expert_monthly:  "price_1T3nfoGxmyz5JooXGE1vzOMQ",
    expert_yearly:   "price_1T3nfpGxmyz5JooXrBWeSha0",
  };

  return hardcoded[`${plan}_${period}`] ?? null;
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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? supabaseServiceKey;

    // Use anon key + user JWT (recommended Supabase pattern for Edge Functions)
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      console.error("Auth verification failed:", authError?.message ?? "no user");
      return jsonResponse({ error: "Invalid token" }, 401);
    }

    // Admin client for DB operations (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ---- 2. Parse body ----
    const body = await req.json();
    const {
      plan,
      period,
      organization_id,
      success_url,
      cancel_url,
    }: {
      plan: string;
      period: string;
      organization_id: string;
      success_url: string;
      cancel_url: string;
    } = body;

    if (!plan || !period || !organization_id || !success_url || !cancel_url) {
      return jsonResponse({ error: "Missing required fields: plan, period, organization_id, success_url, cancel_url" }, 400);
    }

    // ---- 3. Resolve Stripe price ID ----
    const priceId = getPriceId(plan, period);
    if (!priceId) {
      return jsonResponse({ error: `Invalid plan/period combination: ${plan}/${period}` }, 400);
    }

    // ---- 4. Lookup existing subscription row ----
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("organization_id", organization_id)
      .single();

    if (subError && subError.code !== "PGRST116") {
      // PGRST116 = no rows found, which is acceptable
      console.error("Subscription lookup error:", subError);
      return jsonResponse({ error: "Failed to lookup subscription" }, 500);
    }

    let stripeCustomerId = subscription?.stripe_customer_id;

    // ---- 5. Create Stripe customer if needed ----
    if (!stripeCustomerId) {
      // Fetch organization name
      const { data: org } = await supabase
        .from("organizations")
        .select("name")
        .eq("id", organization_id)
        .single();

      const customerParams = new URLSearchParams();
      customerParams.append("email", user.email ?? "");
      customerParams.append("name", org?.name ?? "");
      customerParams.append("metadata[organization_id]", organization_id);

      const customerRes = await fetch(`${STRIPE_API}/customers`, {
        method: "POST",
        headers: stripeHeaders(),
        body: customerParams.toString(),
      });

      if (!customerRes.ok) {
        const errText = await customerRes.text();
        console.error("Stripe customer creation error:", errText);
        return jsonResponse({ error: "Failed to create Stripe customer" }, 502);
      }

      const customer = await customerRes.json();
      stripeCustomerId = customer.id;

      // ---- 6. Save stripe_customer_id back to subscriptions ----
      const { error: upsertError } = await supabase
        .from("subscriptions")
        .upsert(
          {
            organization_id,
            stripe_customer_id: stripeCustomerId,
          },
          { onConflict: "organization_id" }
        );

      if (upsertError) {
        console.error("Failed to save stripe_customer_id:", upsertError);
        // Non-fatal: continue to create checkout session
      }
    }

    // ---- 7. Create Checkout Session ----
    const sessionParams = new URLSearchParams();
    sessionParams.append("mode", "subscription");
    sessionParams.append("customer", stripeCustomerId!);
    sessionParams.append("line_items[0][price]", priceId);
    sessionParams.append("line_items[0][quantity]", "1");
    sessionParams.append("success_url", success_url);
    sessionParams.append("cancel_url", cancel_url);
    sessionParams.append("allow_promotion_codes", "true");
    sessionParams.append("metadata[organization_id]", organization_id);
    sessionParams.append("metadata[plan]", plan);
    sessionParams.append("subscription_data[metadata][organization_id]", organization_id);
    sessionParams.append("subscription_data[metadata][plan]", plan);

    const sessionRes = await fetch(`${STRIPE_API}/checkout/sessions`, {
      method: "POST",
      headers: stripeHeaders(),
      body: sessionParams.toString(),
    });

    if (!sessionRes.ok) {
      const errText = await sessionRes.text();
      console.error("Stripe checkout session error:", errText);
      return jsonResponse({ error: "Failed to create checkout session" }, 502);
    }

    const session = await sessionRes.json();

    return jsonResponse({ url: session.url });
  } catch (err) {
    console.error("Unexpected error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
