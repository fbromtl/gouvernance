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

/* ------------------------------------------------------------------ */
/*  RAG vector stores (ChatKit workflow)                               */
/* ------------------------------------------------------------------ */

const VECTOR_STORE_IDS = [
  "vs_69a1d635c2488191b82704425591e783", // Québec
  "vs_69a1e30ade8c8191b0f551ad1c22080a", // France / Europe
  "vs_69a1e3460c8c8191b87e62b05a64a0e7", // USA
];

/* ------------------------------------------------------------------ */
/*  Build system prompt from context                                   */
/* ------------------------------------------------------------------ */

interface ChatContext {
  pageTitle?: string;
  pageDescription?: string;
  namespace?: string;
  language?: string;
  userRole?: string;
}

function buildSystemPrompt(ctx: ChatContext): string {
  const lang = ctx.language === "en" ? "English" : "French";
  const page = ctx.pageTitle || "la plateforme";
  const desc = ctx.pageDescription ? ` (${ctx.pageDescription})` : "";
  const role = ctx.userRole || "membre";

  return `Tu es l'assistant expert en gouvernance de l'IA de gouvernance.ai, la plateforme québécoise du Cercle de Gouvernance en Intelligence Artificielle.

## Contexte utilisateur
- Page actuelle : "${page}"${desc}
- Rôle dans l'organisation : ${role}
- Langue de réponse : ${lang}

## Ton expertise
Tu as accès à une base documentaire couvrant la gouvernance IA dans plusieurs juridictions :
- **Québec** : Loi 25, cadre québécois de gouvernance IA
- **France / Europe** : RGPD, AI Act européen, recommandations CNIL
- **USA** : Executive Order on AI, lois des États américains, NIST AI RMF
- **Canada fédéral** : C-27 / AIDA, directives fédérales
- Référentiels internationaux : ISO/IEC 42001, OECD AI Principles

## Directives
1. **Identifie la juridiction** pertinente dans la question de l'utilisateur. Si elle n'est pas claire, demande une précision polie.
2. **Cherche dans la documentation** pour fournir des réponses fondées sur des sources vérifiables.
3. **Cite tes sources** : mentionne les lois, articles, référentiels utilisés (ex: « conformément à l'article 5 du RGPD… »).
4. **Sois pratique et concis** : donne des réponses actionnables, pas des dissertations.
5. **Ne jamais inventer** de données, statistiques ou références. Si tu ne sais pas, dis-le clairement.
6. **Explique comment utiliser la section** de la plateforme quand la question porte sur l'outil.
7. **Formate** avec des listes, titres et paragraphes courts pour la lisibilité.
8. Pour les questions juridiques complexes nécessitant un avis personnalisé, invite l'utilisateur à consulter les experts et avocats membres du Cercle.
9. Réponds en ${lang}.`;
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
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    // ---- 1. Verify JWT ----
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
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
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // ---- 2. Parse body ----
    const body = await req.json();
    const messages: { role: string; content: string }[] = body.messages ?? [];
    const context: ChatContext = body.context ?? {};

    // ---- 3. Build OpenAI Responses API request ----
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    const instructions = buildSystemPrompt(context);

    // Format conversation history for Responses API (last 20 messages)
    const input = messages
      .filter((m) => m.content.trim())
      .slice(-20)
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    // ---- 4. Call OpenAI Responses API with file_search + streaming ----
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-5.2",
          instructions,
          input,
          tools: [
            {
              type: "file_search",
              vector_store_ids: VECTOR_STORE_IDS,
            },
          ],
          stream: true,
        }),
      }
    );

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      console.error("OpenAI Responses API error:", errText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        {
          status: 502,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    // ---- 5. Transform Responses API stream → client SSE format ----
    // The Responses API streams events like:
    //   event: response.output_text.delta
    //   data: {"type":"response.output_text.delta","delta":"text"}
    //
    // We transform to the format the frontend expects:
    //   data: {"content":"text"}
    //   data: [DONE]

    const reader = openaiResponse.body!.getReader();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let buffer = "";
        let completed = false;

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

              // Handle legacy [DONE] signal (just in case)
              if (data === "[DONE]") {
                if (!completed) {
                  completed = true;
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                }
                continue;
              }

              try {
                const parsed = JSON.parse(data);

                // Forward text delta events
                if (parsed.type === "response.output_text.delta") {
                  const delta = parsed.delta;
                  if (delta) {
                    // Strip file citation markers like 【4:0†source】
                    const cleaned = delta.replace(/【[^】]*】/g, "");
                    if (cleaned) {
                      controller.enqueue(
                        encoder.encode(
                          `data: ${JSON.stringify({ content: cleaned })}\n\n`
                        )
                      );
                    }
                  }
                }

                // Signal completion (success, incomplete, or failure)
                if (
                  (parsed.type === "response.completed" ||
                   parsed.type === "response.incomplete" ||
                   parsed.type === "response.failed" ||
                   parsed.type === "error") &&
                  !completed
                ) {
                  if (parsed.type === "response.failed" || parsed.type === "error") {
                    console.error("OpenAI stream error:", JSON.stringify(parsed));
                  }
                  completed = true;
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                }
              } catch {
                // Skip malformed JSON chunks
              }
            }
          }

          // Ensure we always send DONE
          if (!completed) {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
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
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  }
});
