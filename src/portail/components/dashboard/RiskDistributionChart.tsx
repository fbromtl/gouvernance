import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RISK_COLORS, TOOLTIP_STYLE } from "./chart-theme";
import type { Database } from "@/types/database";

export type AiSystem = Database["public"]["Tables"]["ai_systems"]["Row"];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RiskSlice {
  name: string;
  value: number;
  fill: string;
  level: string;
}

interface Props {
  data: AiSystem[];
}

// ---------------------------------------------------------------------------
// Custom center label rendered inside the donut hole
// ---------------------------------------------------------------------------

interface CenterLabelProps {
  viewBox?: { cx: number; cy: number };
  total: number;
}

function CenterLabel({ viewBox, total }: CenterLabelProps) {
  if (!viewBox) return null;
  const { cx, cy } = viewBox;
  return (
    <g>
      <text
        x={cx}
        y={cy - 8}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-foreground text-2xl font-bold"
        style={{ fontSize: "1.5rem", fontWeight: 700 }}
      >
        {total}
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontSize: "0.7rem", fill: "#6b7280" }}
      >
        total
      </text>
    </g>
  );
}

// ---------------------------------------------------------------------------
// Custom tooltip
// ---------------------------------------------------------------------------

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: RiskSlice }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const { name, value, fill } = payload[0].payload;
  return (
    <div style={TOOLTIP_STYLE.contentStyle}>
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: fill }}
        />
        <span className="font-medium text-gray-800">{name}</span>
      </div>
      <p className="mt-0.5 text-gray-600">
        {value} système{value !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Risk order for deterministic slice ordering
// ---------------------------------------------------------------------------

const RISK_ORDER = ["critical", "high", "limited", "minimal", "prohibited"];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function RiskDistributionChart({ data }: Props) {
  const { t } = useTranslation("dashboard");

  const slices = useMemo<RiskSlice[]>(() => {
    const counts: Record<string, number> = {};
    for (const system of data) {
      const level = system.risk_level ?? "minimal";
      counts[level] = (counts[level] ?? 0) + 1;
    }

    return RISK_ORDER.filter((level) => (counts[level] ?? 0) > 0).map(
      (level) => ({
        level,
        name: t(`riskLevels.${level}`, { defaultValue: level }),
        value: counts[level],
        fill: RISK_COLORS[level] ?? "#9ca3af",
      })
    );
  }, [data, t]);

  const total = useMemo(
    () => slices.reduce((sum, s) => sum + s.value, 0),
    [slices]
  );

  const hasData = slices.length > 0;

  return (
    <Card className="flex flex-col" style={{ minHeight: "320px" }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">
          {t("widgets.riskDistribution")}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 pt-0">
        {!hasData ? (
          // Empty state
          <div className="flex flex-1 items-center justify-center text-gray-400 text-2xl font-light select-none">
            —
          </div>
        ) : (
          <>
            {/* Donut chart */}
            <div className="flex-1" style={{ minHeight: "180px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={slices}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="55%"
                    outerRadius="80%"
                    paddingAngle={2}
                    cornerRadius={4}
                    strokeWidth={0}
                    labelLine={false}
                    label={
                      <CenterLabel
                        total={total}
                        // viewBox is injected by Recharts at render time
                      />
                    }
                  >
                    {slices.map((slice) => (
                      <Cell key={slice.level} fill={slice.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom legend */}
            <ul className="flex flex-col gap-1.5">
              {slices.map((slice) => (
                <li
                  key={slice.level}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: slice.fill }}
                      aria-hidden="true"
                    />
                    <span className="truncate text-gray-700">{slice.name}</span>
                  </span>
                  <span className="shrink-0 font-semibold text-gray-900 tabular-nums">
                    {slice.value}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
