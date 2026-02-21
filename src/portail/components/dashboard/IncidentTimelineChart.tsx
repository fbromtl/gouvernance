import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useTranslation } from "react-i18next";
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  isAfter,
  isBefore,
  parseISO,
} from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEVERITY_COLORS, TOOLTIP_STYLE } from "./chart-theme";

interface IncidentTimelineChartProps {
  incidents: {
    severity: string;
    detected_at?: string | null;
    created_at: string;
  }[];
}

type SeverityKey = "critical" | "high" | "medium" | "low";

interface MonthBucket {
  month: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface TooltipPayloadEntry {
  dataKey: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  label?: string;
  payload?: TooltipPayloadEntry[];
}

function CustomTooltip({
  active,
  label,
  payload,
}: CustomTooltipProps) {
  const { t } = useTranslation("dashboard");
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const total = payload.reduce((sum, entry) => sum + (entry.value ?? 0), 0);
  if (total === 0) return null;

  return (
    <div style={TOOLTIP_STYLE.contentStyle}>
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      {payload
        .slice()
        .reverse()
        .map((entry) => {
          if (!entry.value && entry.value !== 0) return null;
          const key = entry.dataKey as SeverityKey;
          return (
            <div key={key} className="flex items-center gap-2 text-xs">
              <span
                className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">
                {t(`severity.${key}`, { defaultValue: key })}:
              </span>
              <span className="font-medium text-gray-800">{entry.value}</span>
            </div>
          );
        })}
      <div className="mt-1 pt-1 border-t border-gray-100 flex justify-between text-xs">
        <span className="text-gray-500">Total</span>
        <span className="font-semibold text-gray-800">{total}</span>
      </div>
    </div>
  );
}

export function IncidentTimelineChart({
  incidents,
}: IncidentTimelineChartProps) {
  const { t } = useTranslation("dashboard");

  const chartData = useMemo<MonthBucket[]>(() => {
    const now = new Date();

    const months: Date[] = Array.from({ length: 6 }, (_, i) =>
      startOfMonth(subMonths(now, 5 - i))
    );

    return months.map((monthStart) => {
      const monthEnd = endOfMonth(monthStart);

      const bucket: MonthBucket = {
        month: format(monthStart, "MMM yyyy", { locale: fr }),
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      };

      for (const incident of incidents) {
        const dateStr = incident.detected_at ?? incident.created_at;
        if (!dateStr) continue;

        let incidentDate: Date;
        try {
          incidentDate = parseISO(dateStr);
        } catch {
          continue;
        }

        if (isBefore(incidentDate, monthStart) || isAfter(incidentDate, monthEnd))
          continue;

        const sev = (incident.severity ?? "").toLowerCase();
        if (sev === "critical" || sev === "high" || sev === "medium" || sev === "low") {
          bucket[sev] += 1;
        }
      }

      return bucket;
    });
  }, [incidents]);

  const hasData = useMemo(
    () =>
      chartData.some(
        (b) => b.critical > 0 || b.high > 0 || b.medium > 0 || b.low > 0
      ),
    [chartData]
  );

  return (
    <Card className="min-h-[320px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          {t("widgets.incidentTimeline")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        {!hasData ? (
          <div className="flex items-center justify-center flex-1 min-h-[220px] text-gray-400 text-2xl font-light select-none">
            —
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              barCategoryGap="30%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6b7280" }}
              />
              <YAxis
                allowDecimals={false}
                fontSize={11}
                width={30}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6b7280" }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
              />
              <Bar
                dataKey="low"
                stackId="severity"
                fill={SEVERITY_COLORS.low}
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="medium"
                stackId="severity"
                fill={SEVERITY_COLORS.medium}
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="high"
                stackId="severity"
                fill={SEVERITY_COLORS.high}
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="critical"
                stackId="severity"
                fill={SEVERITY_COLORS.critical}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default IncidentTimelineChart;
