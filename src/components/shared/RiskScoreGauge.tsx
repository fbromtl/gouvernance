import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface RiskScoreGaugeProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const SIZES: Record<NonNullable<RiskScoreGaugeProps["size"]>, number> = {
  sm: 64,
  md: 96,
  lg: 128,
};

/** Return the color hex for a given risk score. */
function getColor(score: number): string {
  if (score <= 25) return "#22c55e";
  if (score <= 50) return "#eab308";
  if (score <= 75) return "#f97316";
  return "#ef4444";
}

/** Return the French risk label for a given risk score. */
function getLabel(score: number): string {
  if (score <= 25) return "Minimal";
  if (score <= 50) return "Limité";
  if (score <= 75) return "Élevé";
  return "Critique";
}

/*
 * Arc geometry
 * We draw a 270-degree arc (3/4 of a circle) centred on the bottom.
 * The arc spans from 135 deg to 405 deg (or equivalently -225 deg to 45 deg).
 *
 * All calculations use a viewBox of 100x100 with centre at (50,50) and
 * a radius of 40 so there is room for the stroke.
 */
const RADIUS = 40;
const CX = 50;
const CY = 50;
const STROKE_WIDTH = 8;

// Total arc length (270 degrees)
const ARC_DEGREES = 270;
const ARC_RADIANS = (ARC_DEGREES * Math.PI) / 180;
const CIRCUMFERENCE = ARC_RADIANS * RADIUS; // arc length in SVG units

// Start angle: 135 degrees (bottom-left)
const START_ANGLE_DEG = 135;

/** Convert polar to cartesian for SVG path. */
function polarToCartesian(angleDeg: number): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CX + RADIUS * Math.cos(rad),
    y: CY + RADIUS * Math.sin(rad),
  };
}

/** Build an SVG arc path string from startAngle spanning `sweep` degrees. */
function describeArc(startAngle: number, sweep: number): string {
  if (sweep <= 0) return "";
  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(startAngle + sweep);
  const largeArc = sweep > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export function RiskScoreGauge({
  score,
  size = "md",
  showLabel = false,
  className,
}: RiskScoreGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const color = getColor(clampedScore);
  const label = getLabel(clampedScore);
  const px = SIZES[size];

  // For the filled arc we compute the sweep in degrees proportional to score
  const fillSweep = (clampedScore / 100) * ARC_DEGREES;

  // Background arc path (always full 270 degrees)
  const bgPath = describeArc(START_ANGLE_DEG, ARC_DEGREES);
  // Foreground arc path
  const fgPath = describeArc(START_ANGLE_DEG, fillSweep);

  // Animate via stroke-dashoffset on mount
  const fgRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const el = fgRef.current;
    if (!el) return;
    // Measure the actual path length for the filled arc
    const pathLength = el.getTotalLength();
    // Start fully hidden then transition to visible
    el.style.strokeDasharray = `${pathLength}`;
    el.style.strokeDashoffset = `${pathLength}`;
    // Force reflow so the browser registers the initial state
    el.getBoundingClientRect();
    el.style.transition = "stroke-dashoffset 0.8s ease-out";
    el.style.strokeDashoffset = "0";
  }, [clampedScore, fillSweep]);

  // Font sizes relative to the gauge size
  const scoreFontSize = size === "sm" ? "text-sm" : size === "md" ? "text-lg" : "text-2xl";
  const labelFontSize = size === "sm" ? "text-[10px]" : size === "md" ? "text-xs" : "text-sm";

  return (
    <div className={cn("inline-flex flex-col items-center gap-1", className)}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 100 100"
        role="img"
        aria-label={`Score de risque : ${clampedScore} sur 100 — ${label}`}
      >
        {/* Background arc */}
        <path
          d={bgPath}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
        />

        {/* Filled arc */}
        {fillSweep > 0 && (
          <path
            ref={fgRef}
            d={fgPath}
            fill="none"
            stroke={color}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
          />
        )}

        {/* Score number in centre */}
        <text
          x={CX}
          y={CY + 2}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-bold"
          style={{
            fontSize: size === "sm" ? 18 : size === "md" ? 22 : 28,
            fill: "currentColor",
          }}
        >
          {clampedScore}
        </text>
      </svg>

      {showLabel && (
        <span
          className={cn("font-medium", labelFontSize)}
          style={{ color }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
