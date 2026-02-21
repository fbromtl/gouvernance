import { useTranslation } from "react-i18next";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CHART_COLORS, TOOLTIP_STYLE } from "./chart-theme";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FrameworkScore {
  framework: string;
  score: number;
}

interface RadarDatum {
  framework: string;
  score: number;
  fullMark: 100;
}

interface Props {
  frameworks: FrameworkScore[];
}

// ---------------------------------------------------------------------------
// Custom tooltip
// ---------------------------------------------------------------------------

interface TooltipPayloadEntry {
  payload: RadarDatum;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const datum = payload[0].payload;

  return (
    <div style={TOOLTIP_STYLE.contentStyle}>
      <p className="font-semibold text-foreground mb-0.5">{datum.framework}</p>
      <p style={{ color: CHART_COLORS.purple }}>
        {datum.score}%
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ComplianceRadarChart({ frameworks }: Props) {
  const { t } = useTranslation("dashboard");

  // Empty-state guard
  const isEmpty = !frameworks || frameworks.length === 0;

  // Transform raw scores into radar-friendly shape with translated labels
  const radarData: RadarDatum[] = isEmpty
    ? []
    : frameworks.map((item) => ({
        framework: t(`frameworks.${item.framework}`, {
          defaultValue: item.framework,
        }),
        score: item.score,
        fullMark: 100,
      }));

  // Global score: weighted average across all frameworks
  const globalScore = isEmpty
    ? null
    : Math.round(
        frameworks.reduce((sum, item) => sum + item.score, 0) /
          frameworks.length
      );

  const badgeColor =
    globalScore === null
      ? ""
      : globalScore >= 80
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : globalScore >= 60
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-red-100 text-red-700 border-red-200";

  return (
    <Card className="min-h-[400px] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">
            {t("widgets.complianceRadar")}
          </CardTitle>
          {globalScore !== null && (
            <Badge
              variant="outline"
              className={`text-xs font-semibold px-2 py-0.5 ${badgeColor}`}
            >
              {globalScore}%
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex items-center justify-center">
        {isEmpty ? (
          <span className="text-2xl text-muted-foreground select-none">
            —
          </span>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart
              data={radarData}
              margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
            >
              <PolarGrid stroke="#e5e7eb" />

              <PolarAngleAxis
                dataKey="framework"
                tick={{ fontSize: 11, fill: "currentColor" }}
              />

              <PolarRadiusAxis
                domain={[0, 100]}
                tickCount={5}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
              />

              <Radar
                dataKey="score"
                fill={CHART_COLORS.purple}
                fillOpacity={0.15}
                stroke={CHART_COLORS.purple}
                strokeWidth={2}
                dot={{ r: 3, fill: CHART_COLORS.purple, strokeWidth: 0 }}
                activeDot={{ r: 4, fill: CHART_COLORS.purple, strokeWidth: 2, stroke: "white" }}
              />

              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default ComplianceRadarChart;
