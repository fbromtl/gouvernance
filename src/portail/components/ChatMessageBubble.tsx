import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface ChatMessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  variant?: "floating" | "panel";
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ChatMessageBubble({
  role,
  content,
  variant = "floating",
}: ChatMessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={cn(
          "max-w-[85%] px-3 py-2 text-sm whitespace-pre-wrap",
          variant === "floating"
            ? cn(
                "rounded-2xl px-3.5 leading-relaxed",
                isUser
                  ? "bg-brand-forest text-white rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md",
              )
            : cn(
                "rounded-lg",
                isUser
                  ? "bg-brand-forest/10 text-foreground"
                  : "bg-muted text-foreground",
              ),
        )}
      >
        {content}
      </div>
    </div>
  );
}
