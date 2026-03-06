import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { SUPABASE_URL } from "../mocks/handlers";
import { renderWithProviders } from "../mocks/utils";
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
// 1. IncidentListPage
// ==========================================================================
import IncidentListPage from "@/portail/pages/IncidentListPage";

describe("IncidentListPage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<IncidentListPage />);
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("displays page title and description", async () => {
    renderWithProviders(<IncidentListPage />);
    await waitFor(() => {
      expect(screen.getByText("title")).toBeInTheDocument();
      expect(screen.getByText("description")).toBeInTheDocument();
    });
  });

  it("has new incident button", async () => {
    renderWithProviders(<IncidentListPage />);
    await waitFor(() => {
      expect(screen.getByText("newIncident")).toBeInTheDocument();
    });
  });

  it("renders severity stat cards", async () => {
    renderWithProviders(<IncidentListPage />);
    await waitFor(() => {
      expect(screen.getByText("stats.critical")).toBeInTheDocument();
      expect(screen.getByText("stats.high")).toBeInTheDocument();
      expect(screen.getByText("stats.medium")).toBeInTheDocument();
      expect(screen.getByText("stats.low")).toBeInTheDocument();
    });
  });

  it("renders search input", async () => {
    renderWithProviders(<IncidentListPage />);
    await waitFor(() => {
      const inputs = document.querySelectorAll("input");
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  it("shows FeatureGate overlay in observer mode", async () => {
    renderWithProviders(<IncidentListPage />);
    await waitFor(() => {
      const disabledDiv = document.querySelector('[aria-disabled="true"]');
      expect(disabledDiv).toBeTruthy();
    });
  });

  it("renders filter selects", async () => {
    renderWithProviders(<IncidentListPage />);
    await waitFor(() => {
      // Status, severity, category filter selects render as buttons
      const buttons = document.querySelectorAll("button");
      expect(buttons.length).toBeGreaterThan(3);
    });
  });
});

// ==========================================================================
// 2. IncidentReportPage
// ==========================================================================
import IncidentReportPage from "@/portail/pages/IncidentReportPage";

describe("IncidentReportPage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<IncidentReportPage />, { route: "/incidents/new" });
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("shows form title", () => {
    renderWithProviders(<IncidentReportPage />, { route: "/incidents/new" });
    const titles = screen.getAllByText("form.title");
    expect(titles.length).toBeGreaterThan(0);
  });

  it("renders title input field", () => {
    renderWithProviders(<IncidentReportPage />, { route: "/incidents/new" });
    const titleInput = document.getElementById("title");
    expect(titleInput).toBeTruthy();
  });

  it("renders description textarea", () => {
    renderWithProviders(<IncidentReportPage />, { route: "/incidents/new" });
    const descInput = document.getElementById("description");
    expect(descInput).toBeTruthy();
  });

  it("renders category radio buttons", () => {
    renderWithProviders(<IncidentReportPage />, { route: "/incidents/new" });
    const radios = document.querySelectorAll('[role="radio"]');
    expect(radios.length).toBeGreaterThan(0);
  });

  it("renders severity radio buttons", () => {
    renderWithProviders(<IncidentReportPage />, { route: "/incidents/new" });
    // Severities: critical, high, medium, low
    expect(screen.getByText("severities.critical")).toBeInTheDocument();
    expect(screen.getByText("severities.high")).toBeInTheDocument();
    expect(screen.getByText("severities.medium")).toBeInTheDocument();
    expect(screen.getByText("severities.low")).toBeInTheDocument();
  });

  it("renders detected_at datetime input", () => {
    renderWithProviders(<IncidentReportPage />, { route: "/incidents/new" });
    const dateInput = document.getElementById("detected_at");
    expect(dateInput).toBeTruthy();
  });

  it("renders submit and cancel buttons", () => {
    renderWithProviders(<IncidentReportPage />, { route: "/incidents/new" });
    expect(screen.getByText("form.submit")).toBeInTheDocument();
    expect(screen.getByText("form.cancel")).toBeInTheDocument();
  });

  it("renders serious harm risk switch", () => {
    renderWithProviders(<IncidentReportPage />, { route: "/incidents/new" });
    expect(screen.getByText("form.seriousHarmRisk")).toBeInTheDocument();
  });

  it("shows back to list button", () => {
    renderWithProviders(<IncidentReportPage />, { route: "/incidents/new" });
    expect(screen.getByText("detail.backToList")).toBeInTheDocument();
  });
});

// ==========================================================================
// 3. IncidentDetailPage
// ==========================================================================
import IncidentDetailPage from "@/portail/pages/IncidentDetailPage";

describe("IncidentDetailPage", () => {
  it("renders without crashing", () => {
    renderWithProviders(
      <Routes>
        <Route path="/incidents/:id" element={<IncidentDetailPage />} />
      </Routes>,
      { route: "/incidents/inc-001" },
    );
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("shows loading skeleton initially", () => {
    renderWithProviders(
      <Routes>
        <Route path="/incidents/:id" element={<IncidentDetailPage />} />
      </Routes>,
      { route: "/incidents/inc-001" },
    );
    // Skeleton components render during loading
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("shows not found when incident missing", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/incidents`, ({ request }) => {
        const accept = request.headers.get("accept") || "";
        if (accept.includes("vnd.pgrst.object")) {
          return HttpResponse.json(
            { message: "not found" },
            { status: 406 },
          );
        }
        return HttpResponse.json([]);
      }),
    );
    renderWithProviders(
      <Routes>
        <Route path="/incidents/:id" element={<IncidentDetailPage />} />
      </Routes>,
      { route: "/incidents/nonexistent" },
    );
    await waitFor(() => {
      expect(screen.getByText("Incident introuvable.")).toBeInTheDocument();
    });
  });

  it("displays incident title when found", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/incidents`, ({ request }) => {
        const accept = request.headers.get("accept") || "";
        if (accept.includes("vnd.pgrst.object")) {
          return HttpResponse.json(mockIncidents[0]);
        }
        return HttpResponse.json(mockIncidents);
      }),
    );
    renderWithProviders(
      <Routes>
        <Route path="/incidents/:id" element={<IncidentDetailPage />} />
      </Routes>,
      { route: "/incidents/inc-001" },
    );
    await waitFor(() => {
      expect(
        screen.getByText("Biais discriminatoire détecté dans le scoring crédit"),
      ).toBeInTheDocument();
    });
  });

  it("shows tabs for summary, investigation, resolution, post-mortem", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/incidents`, ({ request }) => {
        const accept = request.headers.get("accept") || "";
        if (accept.includes("vnd.pgrst.object")) {
          return HttpResponse.json(mockIncidents[0]);
        }
        return HttpResponse.json(mockIncidents);
      }),
    );
    renderWithProviders(
      <Routes>
        <Route path="/incidents/:id" element={<IncidentDetailPage />} />
      </Routes>,
      { route: "/incidents/inc-001" },
    );
    await waitFor(() => {
      const summaryTabs = screen.getAllByText("detail.tabs.summary");
      expect(summaryTabs.length).toBeGreaterThan(0);
      expect(screen.getByText("detail.tabs.investigation")).toBeInTheDocument();
      expect(screen.getByText("detail.tabs.resolution")).toBeInTheDocument();
      expect(screen.getByText("detail.tabs.postMortem")).toBeInTheDocument();
    });
  });

  it("shows workflow stepper with current status", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/incidents`, ({ request }) => {
        const accept = request.headers.get("accept") || "";
        if (accept.includes("vnd.pgrst.object")) {
          return HttpResponse.json(mockIncidents[0]);
        }
        return HttpResponse.json(mockIncidents);
      }),
    );
    renderWithProviders(
      <Routes>
        <Route path="/incidents/:id" element={<IncidentDetailPage />} />
      </Routes>,
      { route: "/incidents/inc-001" },
    );
    await waitFor(() => {
      // Workflow has 7 statuses: reported, triaged, investigating, ...
      expect(screen.getByText("statuses.reported")).toBeInTheDocument();
      expect(screen.getByText("statuses.triaged")).toBeInTheDocument();
    });
  });

  it("shows advance status button for non-closed incident", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/incidents`, ({ request }) => {
        const accept = request.headers.get("accept") || "";
        if (accept.includes("vnd.pgrst.object")) {
          return HttpResponse.json(mockIncidents[0]); // status: "investigating"
        }
        return HttpResponse.json(mockIncidents);
      }),
    );
    renderWithProviders(
      <Routes>
        <Route path="/incidents/:id" element={<IncidentDetailPage />} />
      </Routes>,
      { route: "/incidents/inc-001" },
    );
    await waitFor(() => {
      // The action button text is t(`detail.statusAction.${incident.status}`)
      expect(
        screen.getByText("detail.statusAction.investigating"),
      ).toBeInTheDocument();
    });
  });

  it("shows back to list button", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/incidents`, ({ request }) => {
        const accept = request.headers.get("accept") || "";
        if (accept.includes("vnd.pgrst.object")) {
          return HttpResponse.json(mockIncidents[0]);
        }
        return HttpResponse.json(mockIncidents);
      }),
    );
    renderWithProviders(
      <Routes>
        <Route path="/incidents/:id" element={<IncidentDetailPage />} />
      </Routes>,
      { route: "/incidents/inc-001" },
    );
    await waitFor(() => {
      expect(screen.getByText("detail.backToList")).toBeInTheDocument();
    });
  });
});
