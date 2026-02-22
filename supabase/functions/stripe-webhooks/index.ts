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
/*  Webhook signature verification (HMAC-SHA256)                       */
/* ------------------------------------------------------------------ */

async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string
): Promise<boolean> {
  // Parse the Stripe-Signature header
  const parts = sigHeader.split(",").reduce(
    (acc, part) => {
      const [key, value] = part.split("=");
      acc[key.trim()] = value;
      return acc;
    },
    {} as Record<string, string>
  );

  const timestamp = parts["t"];
  const signature = parts["v1"];

  if (!timestamp || !signature) {
    return false;
  }

  // Reject events older than 5 minutes (tolerance for clock skew)
  const currentTime = Math.floor(Date.now() / 1000);
  if (currentTime - parseInt(timestamp) > 300) {
    return false;
  }

  // Build the signed payload: timestamp + "." + payload
  const signedPayload = `${timestamp}.${payload}`;

  // Compute HMAC-SHA256
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signedPayload)
  );

  // Convert to hex
  const computedSig = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time comparison
  if (computedSig.length !== signature.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < computedSig.length; i++) {
    mismatch |= computedSig.charCodeAt(i) ^ signature.charCodeAt(i);
  }

  return mismatch === 0;
}

/* ------------------------------------------------------------------ */
/*  Fetch subscription details from Stripe                             */
/* ------------------------------------------------------------------ */

async function fetchStripeSubscription(subscriptionId: string) {
  const res = await fetch(`${STRIPE_API}/subscriptions/${subscriptionId}`, {
    method: "GET",
    headers: stripeHeaders(),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Failed to fetch Stripe subscription:", errText);
    return null;
  }

  return await res.json();
}

/* ------------------------------------------------------------------ */
/*  Event handlers                                                     */
/* ------------------------------------------------------------------ */

async function handleCheckoutCompleted(
  event: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>
) {
  const session = event.data as Record<string, unknown>;
  const sessionObj = session.object as Record<string, unknown>;
  const metadata = sessionObj.metadata as Record<string, string>;

  const organizationId = metadata?.organization_id;
  const plan = metadata?.plan;

  if (!organizationId || !plan) {
    console.error("checkout.session.completed: missing metadata", metadata);
    return;
  }

  const stripeSubscriptionId = sessionObj.subscription as string;
  const stripeCustomerId = sessionObj.customer as string;

  // Fetch subscription details from Stripe to get period dates
  const stripeSub = await fetchStripeSubscription(stripeSubscriptionId);
  if (!stripeSub) {
    console.error("Failed to fetch subscription details for:", stripeSubscriptionId);
    return;
  }

  const billingPeriod = stripeSub.items?.data?.[0]?.price?.recurring?.interval === "year"
    ? "yearly"
    : "monthly";

  const { error } = await supabase
    .from("subscriptions")
    .upsert(
      {
        organization_id: organizationId,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        plan,
        billing_period: billingPeriod,
        status: "active",
        current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
        current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
        cancel_at_period_end: false,
      },
      { onConflict: "organization_id" }
    );

  if (error) {
    console.error("checkout.session.completed: upsert error", error);
  }
}

async function handleSubscriptionUpdated(
  event: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>
) {
  const data = event.data as Record<string, unknown>;
  const subscription = data.object as Record<string, unknown>;
  const metadata = subscription.metadata as Record<string, string>;

  const organizationId = metadata?.organization_id;
  if (!organizationId) {
    console.error("customer.subscription.updated: missing organization_id in metadata");
    return;
  }

  const status = subscription.status as string;
  const cancelAtPeriodEnd = subscription.cancel_at_period_end as boolean;
  const currentPeriodStart = subscription.current_period_start as number;
  const currentPeriodEnd = subscription.current_period_end as number;

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status,
      cancel_at_period_end: cancelAtPeriodEnd,
      current_period_start: new Date(currentPeriodStart * 1000).toISOString(),
      current_period_end: new Date(currentPeriodEnd * 1000).toISOString(),
    })
    .eq("organization_id", organizationId);

  if (error) {
    console.error("customer.subscription.updated: update error", error);
  }
}

async function handleSubscriptionDeleted(
  event: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>
) {
  const data = event.data as Record<string, unknown>;
  const subscription = data.object as Record<string, unknown>;
  const metadata = subscription.metadata as Record<string, string>;

  const organizationId = metadata?.organization_id;
  if (!organizationId) {
    console.error("customer.subscription.deleted: missing organization_id in metadata");
    return;
  }

  const { error } = await supabase
    .from("subscriptions")
    .update({
      plan: "observer",
      status: "canceled",
      stripe_subscription_id: null,
      cancel_at_period_end: false,
    })
    .eq("organization_id", organizationId);

  if (error) {
    console.error("customer.subscription.deleted: update error", error);
  }
}

async function handleInvoicePaymentFailed(
  event: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>
) {
  const data = event.data as Record<string, unknown>;
  const invoice = data.object as Record<string, unknown>;
  const stripeSubscriptionId = invoice.subscription as string;

  if (!stripeSubscriptionId) {
    console.error("invoice.payment_failed: missing subscription ID");
    return;
  }

  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "past_due" })
    .eq("stripe_subscription_id", stripeSubscriptionId);

  if (error) {
    console.error("invoice.payment_failed: update error", error);
  }
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
    // ---- 1. Read raw body and signature ----
    const rawBody = await req.text();
    const sigHeader = req.headers.get("stripe-signature");

    if (!sigHeader) {
      return jsonResponse({ error: "Missing stripe-signature header" }, 400);
    }

    // ---- 2. Verify webhook signature ----
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
    const isValid = await verifyStripeSignature(rawBody, sigHeader, webhookSecret);

    if (!isValid) {
      console.error("Webhook signature verification failed");
      return jsonResponse({ error: "Invalid signature" }, 401);
    }

    // ---- 3. Parse event ----
    const event = JSON.parse(rawBody);
    const eventType = event.type as string;

    console.log("Stripe webhook received:", eventType);

    // ---- 4. Initialize Supabase with service role ----
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ---- 5. Route event to handler ----
    switch (eventType) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event, supabase);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event, supabase);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event, supabase);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event, supabase);
        break;

      default:
        console.log("Unhandled event type:", eventType);
    }

    return jsonResponse({ received: true });
  } catch (err) {
    console.error("Unexpected error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
