import { useRef, useEffect, useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  RotateCcw,
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
/*  Typing indicator (3 bouncing dots)                                 */
/* ------------------------------------------------------------------ */

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-neutral-50 border border-neutral-200/60 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block h-2 w-2 rounded-full bg-[#ab54f3]/60"
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Internal link detection                                            */
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

/* ------------------------------------------------------------------ */
/*  Message bubble                                                     */
/* ------------------------------------------------------------------ */

function MessageBubble({
  message,
  index,
}: {
  message: ChatMessage;
  index: number;
}) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 20 : -20, y: 8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index === 0 ? 0 : 0.05,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-gradient-to-r from-[#ab54f3] to-[#9333ea] text-white rounded-br-md shadow-sm"
            : "bg-neutral-50 border border-neutral-200/60 text-neutral-900 rounded-bl-md"
        )}
      >
        {isUser ? (
          message.content
        ) : (
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="mb-2 last:mb-0">{children}</p>
              ),
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
    </motion.div>
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
    if (open) setTimeout(() => textareaRef.current?.focus(), 200);
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
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3">
      {/* ---- Chat Panel ---- */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className={cn(
              "flex flex-col bg-white border border-neutral-200/80 shadow-2xl overflow-hidden",
              // Mobile: fullscreen
              "fixed inset-0 rounded-none",
              // Desktop: floating panel
              "sm:static sm:inset-auto sm:w-[400px] sm:h-[580px] sm:rounded-2xl"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-[#ab54f3] to-[#7c2cd4] text-white shrink-0">
              <div className="flex items-center gap-3">
                {/* Animated avatar */}
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Sparkles className="h-4.5 w-4.5" />
                    </motion.div>
                  </div>
                  {/* Green online dot */}
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500 border-2 border-[#ab54f3]" />
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold leading-tight">
                    Assistant Gouvernance IA
                  </h3>
                  <p className="text-[11px] text-white/70 leading-tight mt-0.5">
                    En ligne
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={resetChat}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                  title="Nouvelle conversation"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 chat-scrollbar"
            >
              {messages.map((msg, i) => (
                <MessageBubble key={msg.id} message={msg} index={i} />
              ))}

              {/* Quick reply chips — visible only before first user message */}
              {messages.length === 1 && !isStreaming && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-2"
                >
                  {QUICK_REPLIES.map((text, i) => (
                    <motion.button
                      key={text}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.08 }}
                      onClick={() => sendMessage(text)}
                      className="border border-[#ab54f3]/40 text-[#ab54f3] rounded-full text-xs px-3 py-1.5 hover:bg-[#ab54f3]/10 hover:border-[#ab54f3] transition-all duration-200 cursor-pointer"
                    >
                      {text}
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {/* Typing indicator */}
              {isStreaming &&
                messages[messages.length - 1]?.content === "" && (
                  <TypingIndicator />
                )}
            </div>

            {/* Error */}
            {error && (
              <div className="mx-4 mb-2 flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-600">
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
            <div className="border-t border-neutral-100 p-4 shrink-0 bg-white">
              <div className="flex gap-2.5">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Posez votre question…"
                  className="min-h-[44px] max-h-[100px] resize-none text-sm rounded-xl border-neutral-200 bg-neutral-50 focus:bg-white transition-colors"
                  rows={1}
                  disabled={isStreaming}
                />
                <Button
                  size="icon"
                  className={cn(
                    "h-11 w-11 shrink-0 rounded-xl transition-all duration-200",
                    "bg-gradient-to-r from-[#ab54f3] to-[#9333ea] hover:shadow-md",
                    "disabled:opacity-40"
                  )}
                  onClick={handleSend}
                  disabled={!input.trim() || isStreaming}
                >
                  {isStreaming ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Sparkles className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Floating Bubble ---- */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "group relative flex h-14 w-14 items-center justify-center rounded-full transition-shadow duration-300",
          "bg-gradient-to-br from-[#ab54f3] to-[#9333ea] text-white shadow-xl hover:shadow-2xl",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ab54f3] focus-visible:ring-offset-2"
        )}
        aria-label={open ? "Fermer le chat" : "Ouvrir le chat"}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageSquare className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {hasUnread && !open && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-green-500 border-2 border-white" />
          </span>
        )}
      </motion.button>
    </div>
  );
}
