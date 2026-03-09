import { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useCurrentRole } from "@/hooks/useCurrentRole";
import { useSSEChat } from "@/hooks/useSSEChat";
import type { PageContext } from "@/hooks/usePageContext";

// Re-export ChatMessage so existing imports keep working
export type { ChatMessage } from "@/hooks/useSSEChat";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface UseAiChatReturn {
  messages: import("@/hooks/useSSEChat").ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  isStreaming: boolean;
  error: string | null;
  resetChat: () => void;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

/* ------------------------------------------------------------------ */
/*  Hook                                                                */
/* ------------------------------------------------------------------ */

export function useAiChat(pageContext: PageContext): UseAiChatReturn {
  const { t } = useTranslation("aiChat");
  const { data: role } = useCurrentRole();

  const welcomeMessage = useMemo(() => {
    return pageContext.pageTitle
      ? `${t("welcomePrefix")} **${pageContext.pageTitle}**. ${t("welcomeSuffix")}`
      : t("welcomeFallback");
  }, [pageContext.pageTitle, t]);

  const buildHeaders = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("not_authenticated");
    }

    return {
      Authorization: `Bearer ${session.access_token}`,
    };
  }, []);

  const buildBody = useCallback(
    (history: { role: string; content: string }[]) => ({
      messages: history,
      context: {
        pageTitle: pageContext.pageTitle,
        pageDescription: pageContext.pageDescription,
        namespace: pageContext.namespace,
        language: pageContext.language,
        userRole: role ?? "member",
      },
    }),
    [pageContext, role],
  );

  const mapError = useCallback(
    (err: Error) => {
      if (err.message === "not_authenticated") return t("errorGeneric");
      if (err.message.startsWith("http_")) return t("errorGeneric");
      return t("errorNetwork");
    },
    [t],
  );

  return useSSEChat({
    endpoint: `${SUPABASE_URL}/functions/v1/ai-chat`,
    buildHeaders,
    buildBody,
    welcomeMessage,
    mapError,
    extraDeps: [pageContext, role],
  });
}
