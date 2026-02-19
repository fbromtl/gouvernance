import { useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useCurrentRole } from "@/hooks/useCurrentRole";
import type { PageContext } from "@/hooks/usePageContext";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface UseAiChatReturn {
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  isStreaming: boolean;
  error: string | null;
  resetChat: () => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

/* ------------------------------------------------------------------ */
/*  Hook                                                                */
/* ------------------------------------------------------------------ */

export function useAiChat(pageContext: PageContext): UseAiChatReturn {
  const { t } = useTranslation("aiChat");
  const { data: role } = useCurrentRole();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Welcome message generated client-side (no API call)
    const welcomeText = pageContext.pageTitle
      ? `${t("welcomePrefix")} **${pageContext.pageTitle}**. ${t("welcomeSuffix")}`
      : t("welcomeFallback");

    return [
      {
        id: generateId(),
        role: "assistant" as const,
        content: welcomeText,
        timestamp: Date.now(),
      },
    ];
  });

  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  /* ---- Send a message ---- */
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      setError(null);

      // Add user message
      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content: text.trim(),
        timestamp: Date.now(),
      };

      // Prepare placeholder for assistant
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      // Abort controller for cancellation
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        // Get current session token
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error("not_authenticated");
        }

        // Build message history for the API (last 20, user + assistant only, no empty)
        const historyForApi = [...messages, userMsg]
          .filter((m) => m.content.trim())
          .slice(-20)
          .map((m) => ({ role: m.role, content: m.content }));

        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/ai-chat`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: historyForApi,
              context: {
                pageTitle: pageContext.pageTitle,
                pageDescription: pageContext.pageDescription,
                namespace: pageContext.namespace,
                language: pageContext.language,
                userRole: role ?? "member",
              },
            }),
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`http_${response.status}`);
        }

        // Read SSE stream
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

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
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.id === assistantMsg.id) {
                    updated[updated.length - 1] = {
                      ...last,
                      content: last.content + parsed.content,
                    };
                  }
                  return updated;
                });
              }
            } catch {
              // Skip malformed chunks
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          // User cancelled — do nothing
          return;
        }

        const message =
          err instanceof Error && err.message === "not_authenticated"
            ? t("errorGeneric")
            : err instanceof Error && err.message.startsWith("http_")
              ? t("errorGeneric")
              : t("errorNetwork");

        setError(message);

        // Remove the empty assistant placeholder on error
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.id === assistantMsg.id && !last.content) {
            return prev.slice(0, -1);
          }
          return prev;
        });
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming, messages, pageContext, role, t]
  );

  /* ---- Reset conversation ---- */
  const resetChat = useCallback(() => {
    // Cancel any in-flight stream
    abortRef.current?.abort();

    const welcomeText = pageContext.pageTitle
      ? `${t("welcomePrefix")} **${pageContext.pageTitle}**. ${t("welcomeSuffix")}`
      : t("welcomeFallback");

    setMessages([
      {
        id: generateId(),
        role: "assistant",
        content: welcomeText,
        timestamp: Date.now(),
      },
    ]);
    setIsStreaming(false);
    setError(null);
  }, [pageContext.pageTitle, t]);

  return { messages, sendMessage, isStreaming, error, resetChat };
}
