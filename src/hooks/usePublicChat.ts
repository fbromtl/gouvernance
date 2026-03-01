import { useState, useCallback, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface UsePublicChatReturn {
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

function getSessionId(): string {
  const KEY = "public-chat-session";
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = generateId();
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

const WELCOME_MESSAGE =
  "Bonjour ! 👋 Je suis l'assistant du Cercle de Gouvernance de l'IA. Posez-moi vos questions sur la gouvernance IA, nos outils ou notre plateforme — je suis là pour vous aider !";

/* ------------------------------------------------------------------ */
/*  Hook                                                                */
/* ------------------------------------------------------------------ */

export function usePublicChat(): UsePublicChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: generateId(),
      role: "assistant" as const,
      content: WELCOME_MESSAGE,
      timestamp: Date.now(),
    },
  ]);

  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      setError(null);

      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content: text.trim(),
        timestamp: Date.now(),
      };

      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        // Build message history (last 20, non-empty)
        const historyForApi = [...messages, userMsg]
          .filter((m) => m.content.trim())
          .slice(-20)
          .map((m) => ({ role: m.role, content: m.content }));

        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/public-chat`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: historyForApi,
              sessionId: getSessionId(),
            }),
            signal: controller.signal,
          }
        );

        if (response.status === 429) {
          throw new Error("rate_limited");
        }

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
        if (err instanceof Error && err.name === "AbortError") return;

        const message =
          err instanceof Error && err.message === "rate_limited"
            ? "Trop de messages envoyés. Veuillez patienter quelques instants."
            : "Une erreur est survenue. Veuillez réessayer.";

        setError(message);

        // Remove empty assistant placeholder on error
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
    [isStreaming, messages]
  );

  const resetChat = useCallback(() => {
    abortRef.current?.abort();
    setMessages([
      {
        id: generateId(),
        role: "assistant",
        content: WELCOME_MESSAGE,
        timestamp: Date.now(),
      },
    ]);
    setIsStreaming(false);
    setError(null);
  }, []);

  return { messages, sendMessage, isStreaming, error, resetChat };
}
