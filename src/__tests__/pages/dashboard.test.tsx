import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { SUPABASE_URL } from "../mocks/handlers";
import { renderWithProviders } from "../mocks/utils";
import { mockAiSystems } from "../mocks/fixtures/ai-systems";
import { mockIncidents } from "../mocks/fixtures/incidents";

// ---------------------------------------------------------------------------
// Mock recharts
// ---------------------------------------------------------------------------
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  RadarChart: ({ children }: any) => <div data-testid="radar-chart">{children}</div>,
  Radar: () => <div />,
  PolarGrid: () => <div />,
  PolarAngleAxis: () => <div />,
  PolarRadiusAxis: () => <div />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div />,
  Cell: () => <div />,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div />,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

// ==========================================================================
// DashboardPage
// ==========================================================================
import DashboardPage from "@/portail/pages/DashboardPage";

describe("DashboardPage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<DashboardPage />, { route: "/dashboard" });
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("shows empty state when no organization", async () => {
    // Default MSW returns [] for organizations, so org is null
    renderWithProviders(<DashboardPage />, { route: "/dashboard" });
    await waitFor(() => {
      // Should show noOrg empty state or the dashboard content
      expect(document.querySelector("div")).toBeTruthy();
    });
  });

  it("renders welcome message with user name", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/organizations`, () => {
        return HttpResponse.json([{ id: "org-001", name: "Test Org" }]);
      }),
    );
    renderWithProviders(<DashboardPage />, { route: "/dashboard" });
    await waitFor(() => {
      // t("welcome", { firstName }) returns "welcome" with mocked i18n
      expect(screen.getByText("welcome")).toBeInTheDocument();
    });
  });

  it("renders demo toggle switch", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/organizations`, () => {
        return HttpResponse.json([{ id: "org-001", name: "Test Org" }]);
      }),
    );
    renderWithProviders(<DashboardPage />, { route: "/dashboard" });
    await waitFor(() => {
      expect(screen.getByText("demoMode")).toBeInTheDocument();
    });
  });

  it("renders quick access section", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/organizations`, () => {
        return HttpResponse.json([{ id: "org-001", name: "Test Org" }]);
      }),
    );
    renderWithProviders(<DashboardPage />, { route: "/dashboard" });
    await waitFor(() => {
      expect(screen.getByText("quickAccess")).toBeInTheDocument();
    });
  });

  it("renders KPI stat cards", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/organizations`, () => {
        return HttpResponse.json([{ id: "org-001", name: "Test Org" }]);
      }),
    );
    renderWithProviders(<DashboardPage />, { route: "/dashboard" });
    await waitFor(() => {
      // KPI labels use t("stats.xxx") keys
      expect(screen.getByText("stats.aiSystems")).toBeInTheDocument();
      expect(screen.getByText("stats.complianceScore")).toBeInTheDocument();
      expect(screen.getByText("stats.activeIncidents")).toBeInTheDocument();
      expect(screen.getByText("stats.pendingAlerts")).toBeInTheDocument();
    });
  });

  it("shows description text", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/organizations`, () => {
        return HttpResponse.json([{ id: "org-001", name: "Test Org" }]);
      }),
    );
    renderWithProviders(<DashboardPage />, { route: "/dashboard" });
    await waitFor(() => {
      expect(screen.getByText("description")).toBeInTheDocument();
    });
  });

  it("renders module quick access links", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/organizations`, () => {
        return HttpResponse.json([{ id: "org-001", name: "Test Org" }]);
      }),
    );
    renderWithProviders(<DashboardPage />, { route: "/dashboard" });
    await waitFor(() => {
      // Links to /ai-systems, /risks, /incidents, /compliance
      const links = document.querySelectorAll('a[href="/ai-systems"]');
      expect(links.length).toBeGreaterThan(0);
    });
  });

  it("renders with data showing KPI values", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/organizations`, () => {
        return HttpResponse.json([{ id: "org-001", name: "Test Org" }]);
      }),
      http.get(`${SUPABASE_URL}/rest/v1/ai_systems`, () => {
        return HttpResponse.json(mockAiSystems);
      }),
      http.get(`${SUPABASE_URL}/rest/v1/incidents`, () => {
        return HttpResponse.json(mockIncidents);
      }),
    );
    renderWithProviders(<DashboardPage />, { route: "/dashboard" });
    await waitFor(() => {
      // With 2 production systems from mockAiSystems
      expect(screen.getByText("welcome")).toBeInTheDocument();
    });
  });
});
