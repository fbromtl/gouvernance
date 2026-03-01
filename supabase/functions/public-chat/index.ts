import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/* ------------------------------------------------------------------ */
/*  CORS helpers                                                       */
/* ------------------------------------------------------------------ */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function corsJson(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

/* ------------------------------------------------------------------ */
/*  Rate limiting (in-memory)                                          */
/* ------------------------------------------------------------------ */

interface RateEntry {
  count: number;
  resetAt: number;
  lastMessage: number;
}

const rateLimitMap = new Map<string, RateEntry>();

const MAX_REQUESTS = 50;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const COOLDOWN_MS = 2000; // 2 seconds between messages

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();

  // Clean expired entries periodically
  if (Math.random() < 0.1) {
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key);
    }
  }

  let entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS, lastMessage: 0 };
    rateLimitMap.set(ip, entry);
  }

  // Cooldown check
  if (now - entry.lastMessage < COOLDOWN_MS) {
    return { allowed: false, retryAfter: Math.ceil((COOLDOWN_MS - (now - entry.lastMessage)) / 1000) };
  }

  // Count check
  if (entry.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count++;
  entry.lastMessage = now;
  return { allowed: true };
}

/* ------------------------------------------------------------------ */
/*  System prompt                                                      */
/* ------------------------------------------------------------------ */

const SYSTEM_PROMPT = `Tu es l'assistant virtuel du Cercle de Gouvernance de l'IA (gouvernance.ai), une plateforme québécoise dédiée à la gouvernance responsable de l'intelligence artificielle.

TON RÔLE :
Tu es un conseiller expert et accueillant. Tu réponds aux questions des visiteurs sur la plateforme, la gouvernance IA, et tu les guides vers l'inscription gratuite quand c'est pertinent.

OUTILS GRATUITS (plan Observateur — 0$) :
- Inventaire IA en 10 minutes : wizard guidé avec score de risque automatique (limité à 3 systèmes)
- Tableau de bord de gouvernance : vue d'ensemble de vos projets IA
- Cycle de vie IA : suivi des étapes de chaque système
- Veille réglementaire : lecture des mises à jour (Loi 25, C-27, AI Act, etc.)

OUTILS AVANCÉS (plan Membre — 249$ CAD/mois) :
- Systèmes IA illimités
- Évaluations de risques complètes
- Gestion des incidents
- Conformité multi-référentiels (Loi 25, AI Act, NIST, ISO 42001)
- Registre de décisions
- Gestion biais & équité
- Registre de transparence
- Gestion des fournisseurs IA avec questionnaires de sécurité automatisés
- Veille documentaire IA avec assistant réglementaire
- Assistant IA intégré au portail
- Export PDF
- Jusqu'à 10 membres
- Répertoire de membres, profil public, badge LinkedIn
- Support par courriel

OUTILS EXPERT (plan Expert — 879$ CAD/mois) :
- Tout le plan Membre, plus :
- Monitoring temps réel & gestion avancée des incidents
- Catalogue de données
- Structure de gouvernance organisationnelle
- Membres illimités
- Support dédié
- Visibilité prioritaire dans le répertoire

COMMUNAUTÉ :
- Cercle d'échange entre professionnels de l'IA (150+ experts, 15 disciplines)
- Diagnostic de maturité en gouvernance IA
- Networking structuré

DIRECTIVES :
- Réponds en français, de manière professionnelle, chaleureuse et concise
- Utilise des listes et paragraphes courts pour la lisibilité
- Ne jamais inventer de données ou de statistiques
- Si tu ne sais pas quelque chose, dis-le clairement
- Quand c'est pertinent, invite le visiteur à créer un compte gratuit : "Vous pouvez commencer gratuitement en vous inscrivant sur gouvernance.ai/inscription"
- Ne sois pas trop insistant sur l'inscription — reste naturel et utile d'abord
- Si on te pose des questions hors sujet (non liées à la gouvernance IA ou à la plateforme), redirige poliment vers ton domaine d'expertise
- Tu peux aussi mentionner la page /tarifs pour comparer les plans en détail`;

/* ------------------------------------------------------------------ */
/*  Main handler                                                       */
/* ------------------------------------------------------------------ */

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return corsJson({ error: "Method not allowed" }, 405);
  }

  try {
    // ---- 1. Rate limiting ----
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("cf-connecting-ip") ??
      "unknown";

    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: "Trop de messages. Veuillez patienter quelques instants.",
          retryAfter: rateCheck.retryAfter,
        }),
        {
          status: 429,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json",
            "Retry-After": String(rateCheck.retryAfter ?? 10),
          },
        }
      );
    }

    // ---- 2. Parse body ----
    const body = await req.json();
    const messages: { role: string; content: string }[] = body.messages ?? [];

    // Limit history
    const trimmedMessages = messages.slice(-20);

    // ---- 3. OpenAI key ----
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return corsJson({ error: "AI service not configured" }, 500);
    }

    // ---- 4. Build OpenAI request ----
    const openaiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...trimmedMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: openaiMessages,
          stream: true,
          max_tokens: 800,
          temperature: 0.7,
        }),
      }
    );

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      console.error("OpenAI error:", errText);
      return corsJson({ error: "AI service error" }, 502);
    }

    // ---- 5. Stream SSE back to client ----
    const reader = openaiResponse.body!.getReader();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith("data: ")) continue;

              const data = trimmed.slice(6);
              if (data === "[DONE]") {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                  );
                }
              } catch {
                // Skip malformed chunks
              }
            }
          }
        } catch (err) {
          console.error("Stream error:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return corsJson({ error: "Internal server error" }, 500);
  }
});
