#!/usr/bin/env node
/**
 * One-time script to create correct Stripe prices for the Member plan.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_live_xxx node scripts/update-stripe-prices.mjs
 *
 * What it does:
 *   1. Creates a product "Membre" (or reuses existing)
 *   2. Creates two prices: CA$199/month (yearly) and CA$249/month (monthly)
 *   3. Prints the new Price IDs to update in the codebase
 */

const STRIPE_API = "https://api.stripe.com/v1";
const SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!SECRET_KEY) {
  console.error("ERROR: Set STRIPE_SECRET_KEY environment variable");
  console.error("Usage: STRIPE_SECRET_KEY=sk_live_xxx node scripts/update-stripe-prices.mjs");
  process.exit(1);
}

const headers = {
  Authorization: `Basic ${Buffer.from(SECRET_KEY + ":").toString("base64")}`,
  "Content-Type": "application/x-www-form-urlencoded",
};

async function stripePost(endpoint, params) {
  const body = new URLSearchParams(params).toString();
  const res = await fetch(`${STRIPE_API}${endpoint}`, {
    method: "POST",
    headers,
    body,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Stripe ${endpoint} failed: ${err}`);
  }
  return res.json();
}

async function stripeGet(endpoint, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = qs ? `${STRIPE_API}${endpoint}?${qs}` : `${STRIPE_API}${endpoint}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Stripe GET ${endpoint} failed: ${err}`);
  }
  return res.json();
}

async function main() {
  console.log("=== Mise à jour des prix Stripe — Plan Membre ===\n");

  // 1. Find or create product
  console.log("1. Recherche du produit existant...");
  const products = await stripeGet("/products", { limit: "100", active: "true" });
  let product = products.data.find(
    (p) => p.name === "Membre" || p.name === "Pro" || p.name === "Member"
  );

  if (product) {
    console.log(`   Produit trouvé: ${product.name} (${product.id})`);
    // Rename to "Membre" if needed
    if (product.name !== "Membre") {
      await stripePost(`/products/${product.id}`, { name: "Membre", description: "Plan Membre — Cercle de Gouvernance IA" });
      console.log(`   Renommé en "Membre"`);
    }
  } else {
    console.log("   Aucun produit trouvé, création...");
    product = await stripePost("/products", {
      name: "Membre",
      description: "Plan Membre — Cercle de Gouvernance IA",
    });
    console.log(`   Produit créé: ${product.id}`);
  }

  // 2. Deactivate old prices on this product
  console.log("\n2. Désactivation des anciens prix...");
  const oldPrices = await stripeGet("/prices", {
    product: product.id,
    active: "true",
    limit: "100",
  });
  for (const p of oldPrices.data) {
    await stripePost(`/prices/${p.id}`, { active: "false" });
    console.log(`   Désactivé: ${p.id} (${p.unit_amount / 100} ${p.currency.toUpperCase()}/${p.recurring?.interval})`);
  }

  // 3. Create monthly price: CA$249/month
  console.log("\n3. Création du prix mensuel: CA$249/mois...");
  const monthlyPrice = await stripePost("/prices", {
    product: product.id,
    currency: "cad",
    unit_amount: "24900", // $249.00 in cents
    "recurring[interval]": "month",
    "metadata[plan]": "member",
    "metadata[period]": "monthly",
  });
  console.log(`   Prix mensuel créé: ${monthlyPrice.id}`);

  // 4. Create yearly price: CA$2388/year (= CA$199/month)
  console.log("\n4. Création du prix annuel: CA$2 388/an (CA$199/mois)...");
  const yearlyPrice = await stripePost("/prices", {
    product: product.id,
    currency: "cad",
    unit_amount: "238800", // $2388.00 in cents
    "recurring[interval]": "year",
    "metadata[plan]": "member",
    "metadata[period]": "yearly",
  });
  console.log(`   Prix annuel créé: ${yearlyPrice.id}`);

  // 5. Summary
  console.log("\n========================================");
  console.log("NOUVEAUX PRICE IDs À METTRE DANS LE CODE:");
  console.log("========================================");
  console.log(`member_monthly: "${monthlyPrice.id}"`);
  console.log(`member_yearly:  "${yearlyPrice.id}"`);
  console.log("\nFichiers à mettre à jour:");
  console.log("  - src/lib/stripe.ts (lignes monthlyPriceId / yearlyPriceId)");
  console.log("  - supabase/functions/stripe-checkout/index.ts (hardcoded fallbacks)");
  console.log("\nOu définir les variables d'environnement Supabase:");
  console.log(`  npx supabase secrets set STRIPE_PRICE_MEMBER_MONTHLY=${monthlyPrice.id}`);
  console.log(`  npx supabase secrets set STRIPE_PRICE_MEMBER_YEARLY=${yearlyPrice.id}`);
}

main().catch((err) => {
  console.error("Erreur:", err.message);
  process.exit(1);
});
