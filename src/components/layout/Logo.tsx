import { cn } from "@/lib/utils";

/**
 * Inline SVG logo — renders with Crimson Text loaded on the page.
 * Using inline SVG instead of <img> avoids the font-loading sandbox issue.
 */
export function Logo({
  variant = "dark",
  className,
}: {
  variant?: "dark" | "light";
  className?: string;
}) {
  const textFill = variant === "dark" ? "#1a1a1a" : "#ffffff";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 280 40"
      fill="none"
      className={cn("h-8 sm:h-9 w-auto", className)}
      role="img"
      aria-label="Gouvernance"
    >
      <text
        x="0"
        y="32"
        fontFamily="'Crimson Text', Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="36"
        fill={textFill}
        letterSpacing="-0.5"
      >
        Gouvernance
      </text>
      <circle cx="263" cy="29" r="5" fill="#57886c" />
    </svg>
  );
}
