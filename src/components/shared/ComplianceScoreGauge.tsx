import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { getScoreColor, getScoreLabel } from "@/lib/compliance-frameworks";

interface ComplianceScoreGaugeProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const SIZES: Record<NonNullable<ComplianceScoreGaugeProps["size"]>, number> = {
  sm: 64,
  md: 96,
  lg: 128,
};

/*
 * Arc geometry — 270-degree arc centred on the bottom.
 * Spans from 135 deg to 405 deg.
 * ViewBox 100x100 with centre at (50,50) and radius 40.
 */
const RADIUS = 40;
const CX = 50;
const CY = 50;
const STROKE_WIDTH = 8;
const ARC_DEGREES = 270;
const START_ANGLE_DEG = 135;

function polarToCartesian(angleDeg: number): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CX + RADIUS * Math.cos(rad),
    y: CY + RADIUS * Math.sin(rad),
  };
}

function describeArc(startAngle: number, sweep: number): string {
  if (sweep <= 0) return "";
  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(startAngle + sweep);
  const largeArc = sweep > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export function ComplianceScoreGauge({
  score,
  size = "md",
  showLabel = false,
  className,
}: ComplianceScoreGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const color = getScoreColor(clampedScore);
  const label = getScoreLabel(clampedScore);
  const px = SIZES[size];

  const fillSweep = (clampedScore / 100) * ARC_DEGREES;
  const bgPath = describeArc(START_ANGLE_DEG, ARC_DEGREES);
  const fgPath = describeArc(START_ANGLE_DEG, fillSweep);

  const fgRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const el = fgRef.current;
    if (!el) return;
    const pathLength = el.getTotalLength();
    el.style.strokeDasharray = `${pathLength}`;
    el.style.strokeDashoffset = `${pathLength}`;
    el.getBoundingClientRect();
    el.style.transition = "stroke-dashoffset 0.8s ease-out";
    el.style.strokeDashoffset = "0";
  }, [clampedScore, fillSweep]);

  const labelFontSize = size === "sm" ? "text-[10px]" : size === "md" ? "text-xs" : "text-sm";

  return (
    <div className={cn("inline-flex flex-col items-center gap-1", className)}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 100 100"
        role="img"
        aria-label={`Score de conformité : ${clampedScore} sur 100 — ${label}`}
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
