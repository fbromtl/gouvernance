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
/*  Build system prompt from context                                    */
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
  const page = ctx.pageTitle || "the platform";
  const desc = ctx.pageDescription ? ` (${ctx.pageDescription})` : "";
  const role = ctx.userRole || "member";

  return `Tu es l'assistant IA de gouvernance.ai, une plateforme québécoise de gouvernance responsable de l'intelligence artificielle.

L'utilisateur est actuellement sur la page "${page}"${desc}.
Son rôle dans l'organisation : ${role}.

Tes directives :
- Explique comment utiliser cette section de la plateforme de manière pratique
- Réponds aux questions sur la gouvernance IA, la conformité, les risques, la Loi 25, et les bonnes pratiques
- Sois concis, professionnel et pratique
- Réponds en ${lang}
- Ne jamais inventer de données ou de statistiques
- Si tu ne sais pas, dis-le clairement
- Formate tes réponses avec des listes et paragraphes courts pour la lisibilité`;
}

/* ------------------------------------------------------------------ */
/*  Main handler                                                        */
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

    // Limit to last 20 messages
    const trimmedMessages = messages.slice(-20);

    // ---- 3. Build OpenAI request ----
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

    const systemPrompt = buildSystemPrompt(context);

    const openaiMessages = [
      { role: "system", content: systemPrompt },
      ...trimmedMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    // ---- 4. Call OpenAI with streaming ----
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
          max_tokens: 1024,
          temperature: 0.7,
        }),
      }
    );

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      console.error("OpenAI error:", errText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        {
          status: 502,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
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
                    encoder.encode(
                      `data: ${JSON.stringify({ content })}\n\n`
                    )
                  );
                }
              } catch {
                // Skip malformed JSON chunks
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
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  }
});
