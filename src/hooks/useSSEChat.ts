import { useState, useCallback, useRef, useEffect } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface SSEChatConfig {
  /** Full URL of the SSE endpoint. */
  endpoint: string;
  /** Build the headers for the fetch request. May be async (e.g. to read a session token). */
  buildHeaders: () => Record<string, string> | Promise<Record<string, string>>;
  /** Build the JSON body from the message history. */
  buildBody: (history: { role: string; content: string }[]) => Record<string, unknown>;
  /** Initial welcome message shown before the user types anything. */
  welcomeMessage: string;
  /** Map an error to a user-facing message. */
  mapError: (err: Error) => string;
  /** Extra sendMessage deps that should trigger re-creation of the callback. */
  extraDeps?: unknown[];
}

interface UseSSEChatReturn {
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

/* ------------------------------------------------------------------ */
/*  Hook                                                                */
/* ------------------------------------------------------------------ */

export function useSSEChat(config: SSEChatConfig): UseSSEChatReturn {
  const {
    endpoint,
    buildHeaders,
    buildBody,
    welcomeMessage,
    mapError,
    extraDeps = [],
  } = config;

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: generateId(),
      role: "assistant" as const,
      content: welcomeMessage,
      timestamp: Date.now(),
    },
  ]);

  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Abort any in-flight stream on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

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
        const headers = await buildHeaders();

        // Build message history for the API (last 20, user + assistant only, no empty)
        const historyForApi = [...messages, userMsg]
          .filter((m) => m.content.trim())
          .slice(-20)
          .map((m) => ({ role: m.role, content: m.content }));

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify(buildBody(historyForApi)),
          signal: controller.signal,
        });

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

        const errorMessage = mapError(
          err instanceof Error ? err : new Error(String(err)),
        );

        setError(errorMessage);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isStreaming, messages, endpoint, buildHeaders, buildBody, mapError, ...extraDeps],
  );

  /* ---- Reset conversation ---- */
  const resetChat = useCallback(() => {
    // Cancel any in-flight stream
    abortRef.current?.abort();

    setMessages([
      {
        id: generateId(),
        role: "assistant",
        content: welcomeMessage,
        timestamp: Date.now(),
      },
    ]);
    setIsStreaming(false);
    setError(null);
  }, [welcomeMessage]);

  return { messages, sendMessage, isStreaming, error, resetChat };
}
