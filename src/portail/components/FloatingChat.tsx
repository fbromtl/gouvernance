import { useRef, useEffect, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  RotateCcw,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ChatMessage } from "@/hooks/useAiChat";
import { cn } from "@/lib/utils";

interface FloatingChatProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  isStreaming: boolean;
  error: string | null;
  onReset: () => void;
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-brand-forest text-white rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md"
        )}
      >
        {message.content}
      </div>
    </div>
  );
}

function ChatPanel({
  messages,
  onSend,
  isStreaming,
  error,
  onReset,
  onClose,
  className,
}: FloatingChatProps & { onClose: () => void; className?: string }) {
  const { t } = useTranslation("aiChat");
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, []);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("flex flex-col bg-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-brand-forest text-white shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold leading-tight">{t("title")}</h3>
            <p className="text-[11px] text-white/70 leading-tight">{t("description")}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onReset}
            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            title={t("newConversation")}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isStreaming && messages[messages.length - 1]?.content === "" && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            {t("thinking")}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-3 mb-2 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive shrink-0">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span className="flex-1 truncate">{error}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-2 py-1 text-xs shrink-0"
            onClick={() => {
              const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
              if (lastUserMsg) onSend(lastUserMsg.content);
            }}
          >
            {t("retry")}
          </Button>
        </div>
      )}

      {/* Input */}
      <div
        className="border-t border-border/60 p-3 shrink-0"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))" }}
      >
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("placeholder")}
            className="min-h-[40px] max-h-[100px] resize-none text-sm rounded-xl border-border/60"
            rows={1}
            disabled={isStreaming}
          />
          <Button
            size="icon"
            className="h-10 w-10 shrink-0 rounded-xl bg-brand-forest hover:bg-brand-forest/90"
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function FloatingChat(props: FloatingChatProps) {
  const [open, setOpen] = useState(false);
  const { messages } = props;

  useEffect(() => {
    const handleEsc = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open]);

  const hasUnread =
    !open && messages.length > 1 && messages[messages.length - 1]?.role === "assistant";

  return (
    <>
      {/* Desktop panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 hidden lg:flex w-[380px] h-[520px] rounded-2xl border border-border/60 shadow-2xl overflow-hidden"
          >
            <ChatPanel {...props} onClose={() => setOpen(false)} className="w-full" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile full-screen sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex lg:hidden"
          >
            <ChatPanel {...props} onClose={() => setOpen(false)} className="w-full h-full" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating bubble — only when chat is closed */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className={cn(
            "fixed right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200",
            "bg-brand-forest text-white hover:bg-brand-forest/90",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-offset-2",
            "bottom-[88px] lg:bottom-6"
          )}
          aria-label="Ouvrir le chat"
        >
          <MessageSquare className="h-6 w-6 transition-transform duration-200 hover:scale-110" />
          {hasUnread && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-green-500 border-2 border-white" />
            </span>
          )}
        </button>
      )}
    </>
  );
}
