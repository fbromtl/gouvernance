import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

interface ApplicationPayload {
  fullName: string;
  email: string;
  jobTitle: string;
  organization: string;
  expertise: string;
  linkedin?: string;
  motivation: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const body = (await req.json()) as ApplicationPayload;

    // Basic server-side validation
    if (!body.fullName || !body.email || !body.jobTitle || !body.organization || !body.expertise || !body.motivation) {
      return jsonResponse({ error: "Missing required fields" }, 400);
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "admin@gouvernance.ai";

    if (!RESEND_API_KEY) {
      // Graceful fallback: log the application
      console.log("RESEND_API_KEY not set. Application logged:", JSON.stringify(body));
      return jsonResponse({ success: true, method: "logged" });
    }

    const expertiseLabels: Record<string, string> = {
      nlp: "NLP",
      vision: "Vision par ordinateur",
      mlops: "MLOps",
      ethics: "Éthique IA",
      compliance: "Conformité",
      data_science: "Data Science",
      research: "Recherche",
      other: "Autre",
    };

    const htmlBody = `
      <h2>Nouvelle candidature — Membre Honoraire</h2>
      <table style="border-collapse:collapse;width:100%;max-width:600px;">
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Nom</td><td style="padding:8px;border-bottom:1px solid #eee;">${body.fullName}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${body.email}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Poste</td><td style="padding:8px;border-bottom:1px solid #eee;">${body.jobTitle}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Organisation</td><td style="padding:8px;border-bottom:1px solid #eee;">${body.organization}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Expertise</td><td style="padding:8px;border-bottom:1px solid #eee;">${expertiseLabels[body.expertise] ?? body.expertise}</td></tr>
        ${body.linkedin ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">LinkedIn</td><td style="padding:8px;border-bottom:1px solid #eee;"><a href="${body.linkedin}">${body.linkedin}</a></td></tr>` : ""}
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Motivation</td><td style="padding:8px;border-bottom:1px solid #eee;">${body.motivation}</td></tr>
      </table>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Cercle de Gouvernance IA <noreply@gouvernance.ai>",
        to: [ADMIN_EMAIL],
        reply_to: body.email,
        subject: `Candidature Membre Honoraire — ${body.fullName}`,
        html: htmlBody,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Resend error:", errText);
      return jsonResponse({ error: "Failed to send email" }, 502);
    }

    return jsonResponse({ success: true });
  } catch (err) {
    console.error("Unexpected error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
