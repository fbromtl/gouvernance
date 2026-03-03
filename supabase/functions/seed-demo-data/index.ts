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

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

/* ------------------------------------------------------------------ */
/*  Main handler                                                       */
/* ------------------------------------------------------------------ */

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
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
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return jsonResponse({ error: "Invalid token" }, 401);
    }

    // ---- 2. Get organization_id from profile ----
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (!profile?.organization_id) {
      return jsonResponse({ error: "No organization found" }, 400);
    }

    const orgId = profile.organization_id;

    // ---- 3. Check if demo data already exists ----
    const { count } = await supabaseAdmin
      .from("ai_systems")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("is_demo", true);

    if ((count ?? 0) > 0) {
      return jsonResponse({
        message: "Demo data already exists",
        seeded: false,
      });
    }

    // ---- 4. Insert demo data ----
    // All inserts use supabaseAdmin (service role) to bypass RLS.

    // ---- 4a. AI Systems ----
    const { data: aiSystems, error: aiError } = await supabaseAdmin
      .from("ai_systems")
      .insert([
        {
          organization_id: orgId,
          is_demo: true,
          name: "Chatbot Service Client",
          description:
            "Assistant conversationnel pour le support client utilisant GPT-4",
          system_type: "nlp",
          genai_subtype: "chatbot",
          departments: ["service_client"],
          purpose: "Automatiser les r\u00e9ponses aux questions fr\u00e9quentes du support client",
          autonomy_level: "human_in_the_loop",
          data_types: ["personal_data"],
          system_source: "vendor_saas",
          vendor_name: "OpenAI",
          lifecycle_status: "production",
          risk_level: "limited",
          risk_score: 35,
          status: "approved",
        },
        {
          organization_id: orgId,
          is_demo: true,
          name: "Scoring RH",
          description:
            "Syst\u00e8me de scoring automatis\u00e9 pour le recrutement et l\u2019\u00e9valuation",
          system_type: "decision_support",
          departments: ["ressources_humaines"],
          purpose: "Pr\u00e9-filtrage et scoring des candidatures entrantes",
          autonomy_level: "human_in_the_loop",
          data_types: ["personal_data", "sensitive_data"],
          sensitive_domains: ["employment", "profiling"],
          system_source: "internal",
          lifecycle_status: "production",
          risk_level: "high",
          risk_score: 65,
          status: "approved",
        },
        {
          organization_id: orgId,
          is_demo: true,
          name: "D\u00e9tection de Fraude",
          description:
            "Mod\u00e8le de d\u00e9tection d\u2019anomalies financi\u00e8res en temps r\u00e9el",
          system_type: "classification",
          departments: ["finance"],
          purpose: "D\u00e9tecter les transactions frauduleuses en temps r\u00e9el",
          autonomy_level: "human_on_the_loop",
          data_types: ["financial_data", "personal_data"],
          sensitive_domains: ["financial_credit"],
          system_source: "hybrid",
          lifecycle_status: "production",
          risk_level: "high",
          risk_score: 70,
          status: "approved",
        },
        {
          organization_id: orgId,
          is_demo: true,
          name: "Recommandation Produits",
          description:
            "Moteur de recommandation personnalis\u00e9e pour le e-commerce",
          system_type: "recommendation",
          departments: ["marketing"],
          purpose: "Am\u00e9liorer l\u2019exp\u00e9rience d\u2019achat avec des suggestions personnalis\u00e9es",
          autonomy_level: "full_auto",
          data_types: ["personal_data"],
          system_source: "vendor_saas",
          vendor_name: "Google Cloud AI",
          lifecycle_status: "production",
          risk_level: "minimal",
          risk_score: 15,
          status: "approved",
        },
        {
          organization_id: orgId,
          is_demo: true,
          name: "Analyse de Sentiments",
          description:
            "Analyse automatique du sentiment des avis clients",
          system_type: "nlp",
          departments: ["marketing", "service_client"],
          purpose: "Comprendre le sentiment g\u00e9n\u00e9ral des avis et retours clients",
          autonomy_level: "human_on_the_loop",
          data_types: ["personal_data"],
          system_source: "vendor_saas",
          vendor_name: "Anthropic",
          lifecycle_status: "pilot",
          risk_level: "limited",
          risk_score: 30,
          status: "submitted",
        },
      ])
      .select("id, name");

    if (aiError) {
      console.error("Error inserting AI systems:", aiError);
      return jsonResponse(
        { error: "Failed to seed AI systems", details: aiError.message },
        500,
      );
    }

    // Build a lookup map: name -> id
    const systemMap = new Map<string, string>();
    for (const sys of aiSystems ?? []) {
      systemMap.set(sys.name, sys.id);
    }

    const chatbotId = systemMap.get("Chatbot Service Client");
    const scoringId = systemMap.get("Scoring RH");
    const fraudeId = systemMap.get("D\u00e9tection de Fraude");

    // ---- 4b. Risk Assessments ----
    const { error: riskError } = await supabaseAdmin
      .from("risk_assessments")
      .insert([
        {
          organization_id: orgId,
          is_demo: true,
          ai_system_id: chatbotId,
          total_score: 35,
          risk_level: "limited",
          probability: "possible",
          impact: "moderate",
          status: "approved",
          answers: {
            data_sensitivity: "medium",
            autonomy: "human_in_the_loop",
            population_impact: "moderate",
          },
        },
        {
          organization_id: orgId,
          is_demo: true,
          ai_system_id: scoringId,
          total_score: 65,
          risk_level: "high",
          probability: "likely",
          impact: "major",
          status: "approved",
          answers: {
            data_sensitivity: "high",
            autonomy: "human_in_the_loop",
            population_impact: "significant",
            sensitive_domains: ["employment", "profiling"],
          },
        },
        {
          organization_id: orgId,
          is_demo: true,
          ai_system_id: fraudeId,
          total_score: 70,
          risk_level: "high",
          probability: "possible",
          impact: "catastrophic",
          status: "in_review",
          answers: {
            data_sensitivity: "high",
            autonomy: "human_on_the_loop",
            population_impact: "significant",
            sensitive_domains: ["financial_credit"],
          },
        },
      ]);

    if (riskError) {
      console.error("Error inserting risk assessments:", riskError);
    }

    // ---- 4c. Incidents ----
    const { error: incidentError } = await supabaseAdmin
      .from("incidents")
      .insert([
        {
          organization_id: orgId,
          is_demo: true,
          title: "Biais d\u00e9tect\u00e9 dans le scoring RH",
          category: "ai",
          incident_type: "bias_detected",
          ai_system_id: scoringId,
          description:
            "Le mod\u00e8le de scoring favorisait syst\u00e9matiquement certains profils d\u00e9mographiques",
          severity: "high",
          status: "resolved",
          detection_mode: "internal_audit",
          impact_description:
            "Discrimination potentielle dans le processus de recrutement sur 6 mois",
          affected_count: 342,
          root_cause:
            "Biais dans les donn\u00e9es d\u2019entra\u00eenement historiques refletant des pratiques pass\u00e9es",
          resolution_date: new Date(
            Date.now() - 15 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          lessons_learned:
            "Mettre en place un audit syst\u00e9matique des biais avant chaque d\u00e9ploiement",
        },
        {
          organization_id: orgId,
          is_demo: true,
          title: "Temps de r\u00e9ponse d\u00e9grad\u00e9 du chatbot",
          category: "ai",
          incident_type: "performance_degradation",
          ai_system_id: chatbotId,
          description:
            "Latence accrue de 300% sur le chatbot depuis la mise \u00e0 jour du mod\u00e8le",
          severity: "medium",
          status: "reported",
          detection_mode: "automated_monitoring",
          impact_description:
            "Exp\u00e9rience utilisateur d\u00e9grad\u00e9e, taux d\u2019abandon en hausse de 18%",
          affected_count: 1250,
        },
      ]);

    if (incidentError) {
      console.error("Error inserting incidents:", incidentError);
    }

    // ---- 4d. Vendors ----
    const { error: vendorError } = await supabaseAdmin
      .from("vendors")
      .insert([
        {
          organization_id: orgId,
          is_demo: true,
          name: "OpenAI",
          status: "active",
          risk_level: "medium_risk",
          service_types: ["GPT-4", "DALL-E", "Whisper"],
          website: "https://openai.com",
          country: "US",
          contract_type: "subscription",
        },
        {
          organization_id: orgId,
          is_demo: true,
          name: "Anthropic",
          status: "active",
          risk_level: "low_risk",
          service_types: ["Claude", "API Enterprise"],
          website: "https://anthropic.com",
          country: "US",
          contract_type: "subscription",
        },
        {
          organization_id: orgId,
          is_demo: true,
          name: "Google Cloud AI",
          status: "under_evaluation",
          risk_level: "medium_risk",
          service_types: ["Vertex AI", "AutoML", "Gemini"],
          website: "https://cloud.google.com/ai",
          country: "US",
          contract_type: "subscription",
        },
      ]);

    if (vendorError) {
      console.error("Error inserting vendors:", vendorError);
    }

    // ---- 4e. Decisions ----
    const { error: decisionError } = await supabaseAdmin
      .from("decisions")
      .insert([
        {
          organization_id: orgId,
          is_demo: true,
          title: "D\u00e9ploiement du chatbot en production",
          decision_type: "go_nogo",
          ai_system_ids: chatbotId ? [chatbotId] : [],
          context:
            "Le chatbot a pass\u00e9 avec succ\u00e8s la phase pilote de 3 mois avec un taux de satisfaction de 87%.",
          decision_made: "Go \u2014 d\u00e9ploiement approuv\u00e9",
          justification:
            "\u00c9valuation des risques compl\u00e9t\u00e9e, DPIA valid\u00e9e, seuils de performance atteints.",
          impact: "medium",
          status: "approved",
          approved_at: new Date(
            Date.now() - 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
        {
          organization_id: orgId,
          is_demo: true,
          title: "Exception DPIA pour recommandation produits",
          decision_type: "exception",
          ai_system_ids: systemMap.get("Recommandation Produits")
            ? [systemMap.get("Recommandation Produits")!]
            : [],
          context:
            "Le syst\u00e8me de recommandation n\u2019utilise que des donn\u00e9es agr\u00e9g\u00e9es anonymis\u00e9es.",
          decision_made:
            "Exception accord\u00e9e \u2014 DPIA compl\u00e8te non requise",
          justification:
            "Risque minimal confirm\u00e9 : pas de donn\u00e9es personnelles identifiables, pas de profilage individuel.",
          impact: "low",
          status: "approved",
          approved_at: new Date(
            Date.now() - 20 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
        {
          organization_id: orgId,
          is_demo: true,
          title: "Arbitrage \u00e9thique scoring RH",
          decision_type: "ethical_arbitration",
          ai_system_ids: scoringId ? [scoringId] : [],
          context:
            "Suite \u00e0 la d\u00e9tection de biais dans le scoring RH, un arbitrage \u00e9thique est n\u00e9cessaire.",
          options_considered:
            "1) Suspension imm\u00e9diate du syst\u00e8me\n2) Correction du mod\u00e8le et red\u00e9ploiement\n3) Passage en mode supervision humaine renforc\u00e9e",
          residual_risks:
            "Risque r\u00e9put\u00e9ationnel si la correction n\u2019est pas communiqu\u00e9e aux candidats affect\u00e9s.",
          impact: "high",
          status: "submitted",
        },
      ]);

    if (decisionError) {
      console.error("Error inserting decisions:", decisionError);
    }

    // ---- 4f. Bias Findings ----
    const { error: biasError } = await supabaseAdmin
      .from("bias_findings")
      .insert([
        {
          organization_id: orgId,
          is_demo: true,
          ai_system_id: scoringId!,
          title: "Impact disparate scoring RH",
          bias_type: "disparate_impact",
          detection_method: "internal_audit",
          severity: "high",
          likelihood: "certain",
          protected_dimensions: ["gender", "age", "ethnicity"],
          affected_groups:
            "Femmes 25-35 ans, candidats de plus de 50 ans",
          estimated_impact:
            "\u00c9cart de score moyen de 15% entre groupes d\u00e9mographiques",
          affected_count: 342,
          fairness_metric: "demographic_parity",
          measured_value: 0.72,
          acceptable_threshold: 0.8,
          remediation_measures: [
            "retraining",
            "data_augmentation",
            "threshold_adjustment",
          ],
          remediation_description:
            "R\u00e9-entra\u00eenement du mod\u00e8le avec donn\u00e9es \u00e9quilibr\u00e9es et ajustement des seuils de d\u00e9cision.",
          status: "in_remediation",
        },
        {
          organization_id: orgId,
          is_demo: true,
          ai_system_id: chatbotId!,
          title: "St\u00e9r\u00e9otypage chatbot",
          bias_type: "stereotyping",
          detection_method: "manual_audit",
          severity: "medium",
          likelihood: "likely",
          protected_dimensions: ["gender"],
          affected_groups: "Tous les utilisateurs du chatbot",
          estimated_impact:
            "Le chatbot utilise des formulations genr\u00e9es dans 23% des r\u00e9ponses",
          fairness_metric: "language_neutrality",
          measured_value: 0.77,
          acceptable_threshold: 0.95,
          remediation_measures: ["prompt_engineering", "content_filtering"],
          remediation_description:
            "Mise \u00e0 jour du prompt syst\u00e8me pour imposer un langage \u00e9picene et ajout d\u2019un filtre post-g\u00e9n\u00e9ration.",
          status: "identified",
        },
      ]);

    if (biasError) {
      console.error("Error inserting bias findings:", biasError);
    }

    // ---- 4g. Governance Policies ----
    const { error: policyError } = await supabaseAdmin
      .from("governance_policies")
      .insert([
        {
          organization_id: orgId,
          is_demo: true,
          title: "Charte IA de MonOrganisation",
          description:
            "Charte fondatrice d\u00e9finissant les principes \u00e9thiques et les engagements de MonOrganisation inc. en mati\u00e8re d\u2019intelligence artificielle.",
          policy_type: "ethics_charter",
          content: `# Charte IA de MonOrganisation inc.

## Pr\u00e9ambule
MonOrganisation inc. s\u2019engage \u00e0 d\u00e9velopper et utiliser l\u2019intelligence artificielle de mani\u00e8re responsable, \u00e9thique et transparente.

## Principes fondamentaux

### 1. Transparence
Nous nous engageons \u00e0 informer clairement nos parties prenantes lorsqu\u2019une d\u00e9cision est assist\u00e9e ou prise par un syst\u00e8me d\u2019IA.

### 2. \u00c9quit\u00e9
Nos syst\u00e8mes d\u2019IA sont con\u00e7us et audit\u00e9s pour \u00e9viter toute discrimination injustifi\u00e9e.

### 3. S\u00e9curit\u00e9
La protection des donn\u00e9es personnelles et la s\u00e9curit\u00e9 des syst\u00e8mes sont des priorit\u00e9s absolues.

### 4. Responsabilit\u00e9
Un humain reste responsable de toute d\u00e9cision finale ayant un impact significatif sur les individus.

### 5. Am\u00e9lioration continue
Nous nous engageons \u00e0 surveiller, \u00e9valuer et am\u00e9liorer continuellement nos syst\u00e8mes d\u2019IA.`,
          version: 1,
          status: "published",
          published_at: new Date(
            Date.now() - 60 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
        {
          organization_id: orgId,
          is_demo: true,
          title: "Proc\u00e9dure d\u2019approbation des syst\u00e8mes IA",
          description:
            "Proc\u00e9dure interne d\u00e9finissant les \u00e9tapes d\u2019\u00e9valuation et d\u2019approbation avant le d\u00e9ploiement d\u2019un syst\u00e8me d\u2019IA.",
          policy_type: "approval_procedure",
          content: `# Proc\u00e9dure d\u2019approbation des syst\u00e8mes IA

## Objectif
D\u00e9finir le processus standard d\u2019\u00e9valuation et d\u2019approbation pr\u00e9alable au d\u00e9ploiement de tout syst\u00e8me d\u2019IA.

## \u00c9tapes

### \u00c9tape 1 \u2014 Enregistrement
Tout nouveau syst\u00e8me d\u2019IA doit \u00eatre enregistr\u00e9 dans l\u2019inventaire avec sa fiche descriptive compl\u00e8te.

### \u00c9tape 2 \u2014 \u00c9valuation des risques
Une \u00e9valuation des risques (DPIA si applicable) doit \u00eatre compl\u00e9t\u00e9e selon la m\u00e9thodologie interne.

### \u00c9tape 3 \u2014 Revue \u00e9thique
Pour les syst\u00e8mes \u00e0 risque \u00e9lev\u00e9, une revue par le comit\u00e9 d\u2019\u00e9thique est requise.

### \u00c9tape 4 \u2014 Approbation
Le d\u00e9cision go/no-go est document\u00e9e dans le journal de d\u00e9cisions.

### \u00c9tape 5 \u2014 D\u00e9ploiement et suivi
Apr\u00e8s approbation, le syst\u00e8me est d\u00e9ploy\u00e9 avec un plan de monitoring d\u00e9fini.`,
          version: 1,
          status: "draft",
        },
      ]);

    if (policyError) {
      console.error("Error inserting governance policies:", policyError);
    }

    // ---- Summary ----
    const seeded = {
      ai_systems: aiSystems?.length ?? 0,
      risk_assessments: riskError ? 0 : 3,
      incidents: incidentError ? 0 : 2,
      vendors: vendorError ? 0 : 3,
      decisions: decisionError ? 0 : 3,
      bias_findings: biasError ? 0 : 2,
      governance_policies: policyError ? 0 : 2,
    };

    console.log(`Demo data seeded for organization ${orgId}:`, seeded);

    return jsonResponse({
      success: true,
      message: "Demo data seeded successfully",
      seeded,
    });
  } catch (err) {
    console.error("Unexpected error in seed-demo-data:", err);
    return jsonResponse(
      { error: "Internal server error", details: (err as Error).message },
      500,
    );
  }
});
