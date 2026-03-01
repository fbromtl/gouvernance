import { useRef, useEffect, useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  MessageSquare,
  X,
  Send,
  RotateCcw,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { usePublicChat, type ChatMessage } from "@/hooks/usePublicChat";

/* ------------------------------------------------------------------ */
/*  Quick reply suggestions                                            */
/* ------------------------------------------------------------------ */

const QUICK_REPLIES = [
  "Quels outils sont gratuits ?",
  "Comment fonctionne le diagnostic ?",
  "Quels sont vos plans tarifaires ?",
  "J'ai des questions sur la gouvernance IA",
];

/* ------------------------------------------------------------------ */
/*  Message bubble                                                     */
/* ------------------------------------------------------------------ */

function isInternalLink(href: string): string | null {
  try {
    const url = new URL(href, "https://gouvernance.ai");
    if (
      url.hostname === "gouvernance.ai" ||
      url.hostname === "www.gouvernance.ai"
    ) {
      return url.pathname;
    }
  } catch {
    if (href.startsWith("/")) return href;
  }
  return null;
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
          isUser
            ? "bg-[#ab54f3] text-white rounded-br-md"
            : "bg-neutral-100 text-neutral-900 rounded-bl-md"
        )}
      >
        {isUser ? (
          message.content
        ) : (
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              strong: ({ children }) => (
                <strong className="font-semibold">{children}</strong>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-2 space-y-1 last:mb-0">
                  {children}
                </ol>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-2 space-y-1 last:mb-0">
                  {children}
                </ul>
              ),
              li: ({ children }) => <li>{children}</li>,
              a: ({ href, children }) => {
                if (!href) return <>{children}</>;
                const internal = isInternalLink(href);
                if (internal) {
                  return (
                    <Link
                      to={internal}
                      className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 rounded-full bg-[#ab54f3] text-white text-xs font-medium hover:bg-[#ab54f3]/90 transition-colors no-underline"
                    >
                      {children}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  );
                }
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#ab54f3] underline hover:text-[#ab54f3]/80"
                  >
                    {children}
                  </a>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Public Chat Widget                                                  */
/* ------------------------------------------------------------------ */

export function PublicChat() {
  const { messages, sendMessage, isStreaming, error, resetChat } =
    usePublicChat();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Focus textarea when panel opens
  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 100);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    sendMessage(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasUnread =
    !open &&
    messages.length > 1 &&
    messages[messages.length - 1]?.role === "assistant";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* ---- Chat Panel ---- */}
      {open && (
        <div
          className={cn(
            "flex flex-col bg-white border border-neutral-200 rounded-2xl shadow-2xl",
            "w-[380px] h-[520px]",
            "animate-in slide-in-from-bottom-4 fade-in-0 duration-200"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 rounded-t-2xl bg-[#ab54f3] text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold leading-tight">
                  Assistant Gouvernance IA
                </h3>
                <p className="text-[11px] text-white/70 leading-tight">
                  Posez vos questions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                title="Nouvelle conversation"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3"
          >
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {/* Quick reply chips — visible only before first user message */}
            {messages.length === 1 && !isStreaming && (
              <div className="flex flex-wrap gap-2">
                {QUICK_REPLIES.map((text) => (
                  <button
                    key={text}
                    onClick={() => sendMessage(text)}
                    className="border border-[#ab54f3] text-[#ab54f3] rounded-full text-xs px-3 py-1.5 hover:bg-[#ab54f3]/10 transition-colors cursor-pointer"
                  >
                    {text}
                  </button>
                ))}
              </div>
            )}

            {isStreaming &&
              messages[messages.length - 1]?.content === "" && (
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Réflexion en cours…
                </div>
              )}
          </div>

          {/* Error */}
          {error && (
            <div className="mx-3 mb-2 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span className="flex-1 truncate">{error}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs shrink-0"
                onClick={() => {
                  const lastUserMsg = [...messages]
                    .reverse()
                    .find((m) => m.role === "user");
                  if (lastUserMsg) sendMessage(lastUserMsg.content);
                }}
              >
                Réessayer
              </Button>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-neutral-200 p-3">
            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question…"
                className="min-h-[40px] max-h-[100px] resize-none text-sm rounded-xl border-neutral-200"
                rows={1}
                disabled={isStreaming}
              />
              <Button
                size="icon"
                className="h-10 w-10 shrink-0 rounded-xl bg-[#ab54f3] hover:bg-[#ab54f3]/90"
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
      )}

      {/* ---- Floating Bubble ---- */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "group flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200",
          "bg-[#ab54f3] text-white hover:bg-[#ab54f3]/90 hover:shadow-xl hover:scale-105",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ab54f3] focus-visible:ring-offset-2"
        )}
        aria-label={open ? "Fermer le chat" : "Ouvrir le chat"}
      >
        {open ? (
          <X className="h-6 w-6 transition-transform duration-200" />
        ) : (
          <MessageSquare className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
        )}

        {hasUnread && !open && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-green-500 border-2 border-white" />
          </span>
        )}
      </button>
    </div>
  );
}
