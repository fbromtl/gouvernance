import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieChartIcon } from "lucide-react";
import { SERIES_COLORS, TOOLTIP_STYLE } from "./chart-theme";

interface SystemsByTypeChartProps {
  systems: { system_type: string }[];
}

interface ChartEntry {
  type: string;
  count: number;
  color: string;
}

export default function SystemsByTypeChart({ systems }: SystemsByTypeChartProps) {
  const { t } = useTranslation("dashboard");
  const { t: tSystems } = useTranslation("aiSystems");

  const data = useMemo<ChartEntry[]>(() => {
    const counts = new Map<string, number>();
    for (const system of systems) {
      const type = system.system_type;
      counts.set(type, (counts.get(type) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([type, count], index) => ({
        type,
        count,
        color: SERIES_COLORS[index % SERIES_COLORS.length],
      }));
  }, [systems]);

  if (systems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            {t("widgets.systemsByType")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="h-12 w-12 rounded-xl bg-muted/80 flex items-center justify-center mb-3">
              <PieChartIcon className="h-5 w-5 text-muted-foreground/60" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("widgets.noSystems")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">
          {t("widgets.systemsByType")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="type"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.type} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              {...TOOLTIP_STYLE}
              formatter={((value: number | string | undefined, _name: string | undefined, props: { payload: ChartEntry }) => [
                value ?? 0,
                tSystems(`systemTypes.${props.payload.type}`),
              ]) as never}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend - scrollable when many types */}
        <div className="max-h-[120px] overflow-y-auto mt-2 -mx-1 px-1">
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {data.map((entry) => (
              <div
                key={entry.type}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="truncate max-w-[120px]">
                  {tSystems(`systemTypes.${entry.type}`)}
                </span>
                <span className="font-medium text-foreground">
                  {entry.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
