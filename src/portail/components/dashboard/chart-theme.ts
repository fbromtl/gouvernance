// Brand-aligned chart colors for Recharts
export const CHART_COLORS = {
  purple: "#ab54f3",
  purpleLight: "#c084fc",
  teal: "#14b8a6",
  amber: "#f59e0b",
  red: "#ef4444",
  blue: "#3b82f6",
  emerald: "#10b981",
  orange: "#f97316",
  indigo: "#6366f1",
  pink: "#ec4899",
} as const;

// Risk level colors (consistent across all charts)
export const RISK_COLORS: Record<string, string> = {
  prohibited: "#991b1b",
  critical: "#ef4444",
  high: "#f97316",
  limited: "#f59e0b",
  minimal: "#10b981",
};

// Severity colors for incidents/bias
export const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#10b981",
};

// Status colors for decisions
export const STATUS_COLORS: Record<string, string> = {
  draft: "#9ca3af",
  submitted: "#3b82f6",
  in_review: "#6366f1",
  approved: "#10b981",
  rejected: "#ef4444",
  implemented: "#14b8a6",
};

// Compliance framework colors for radar
export const FRAMEWORK_COLORS: Record<string, string> = {
  LOI_25: "#ab54f3",
  EU_AI_ACT: "#3b82f6",
  NIST_AI_RMF: "#14b8a6",
  ISO_42001: "#f59e0b",
  RGPD: "#ec4899",
};

// Color palette for generic series (system types, departments, etc.)
export const SERIES_COLORS = [
  "#ab54f3", "#3b82f6", "#14b8a6", "#f59e0b", "#ef4444",
  "#ec4899", "#6366f1", "#f97316", "#10b981", "#8b5cf6",
  "#06b6d4", "#84cc16",
] as const;

// Shared Recharts tooltip style
export const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "white",
    border: "1px solid #f5f5f5",
    borderRadius: "12px",
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
    fontSize: "12px",
    padding: "12px 16px",
  },
};

// Upgraded Recharts shared styles (homepage-aligned)
export const RECHARTS_STYLE = {
  grid: { stroke: "#f5f5f5", strokeDasharray: "3 3" },
  axis: {
    tick: { fill: "#a3a3a3", fontSize: 11 },
    tickLine: false,
    axisLine: false,
  },
  tooltip: {
    contentStyle: {
      backgroundColor: "white",
      border: "1px solid #f5f5f5",
      borderRadius: "12px",
      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
      padding: "12px 16px",
      fontSize: "12px",
    },
    labelStyle: {
      fontSize: "10px",
      fontWeight: 700,
      textTransform: "uppercase" as const,
      letterSpacing: "0.1em",
      color: "#a3a3a3",
      marginBottom: "6px",
    },
    cursor: { fill: "rgba(0,0,0,0.03)" },
  },
  bar: { radius: [4, 4, 0, 0] as [number, number, number, number] },
} as const;
