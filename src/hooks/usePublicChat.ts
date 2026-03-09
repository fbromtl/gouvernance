import { useCallback } from "react";
import { useSSEChat } from "@/hooks/useSSEChat";

// Re-export ChatMessage so existing imports keep working
export type { ChatMessage } from "@/hooks/useSSEChat";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface UsePublicChatReturn {
  messages: import("@/hooks/useSSEChat").ChatMessage[];
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

let _tempSessionId: string | null = null;

function getSessionId(): string {
  const KEY = "public-chat-session";

  // Check functional cookie consent before persisting to sessionStorage
  try {
    const consentRaw = localStorage.getItem('cookie_consent');
    if (consentRaw) {
      const consent = JSON.parse(consentRaw);
      if (consent.functional === true) {
        let id = sessionStorage.getItem(KEY);
        if (!id) {
          id = generateId();
          sessionStorage.setItem(KEY, id);
        }
        return id;
      }
    }
  } catch {
    // Fall through to non-persisted ID
  }

  // No functional consent — use non-persisted ID
  if (!_tempSessionId) {
    _tempSessionId = generateId();
  }
  return _tempSessionId;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const WELCOME_MESSAGE =
  "Bonjour ! \u{1F44B} Je suis l'assistant du Cercle de Gouvernance de l'IA. Posez-moi vos questions sur la gouvernance IA, nos outils ou notre plateforme \u2014 je suis l\u00E0 pour vous aider !";

/* ------------------------------------------------------------------ */
/*  Hook                                                                */
/* ------------------------------------------------------------------ */

export function usePublicChat(): UsePublicChatReturn {
  const buildHeaders = useCallback(
    () => ({
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    }),
    [],
  );

  const buildBody = useCallback(
    (history: { role: string; content: string }[]) => ({
      messages: history,
      sessionId: getSessionId(),
    }),
    [],
  );

  const mapError = useCallback((err: Error) => {
    if (err.message === "http_429") {
      return "Trop de messages envoy\u00E9s. Veuillez patienter quelques instants.";
    }
    return "Une erreur est survenue. Veuillez r\u00E9essayer.";
  }, []);

  return useSSEChat({
    endpoint: `${SUPABASE_URL}/functions/v1/public-chat`,
    buildHeaders,
    buildBody,
    welcomeMessage: WELCOME_MESSAGE,
    mapError,
  });
}
