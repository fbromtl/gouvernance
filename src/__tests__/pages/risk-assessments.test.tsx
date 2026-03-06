import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { SUPABASE_URL } from "../mocks/handlers";
import { renderWithProviders } from "../mocks/utils";
import { mockRiskAssessments } from "../mocks/fixtures/risks";

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

// Mock RiskScoreGauge to avoid jsdom SVG issues (getTotalLength)
vi.mock("@/components/shared/RiskScoreGauge", () => ({
  RiskScoreGauge: ({ score, showLabel }: any) => (
    <div data-testid="risk-score-gauge">
      <span>{score}</span>
      {showLabel && <span>risk-label</span>}
    </div>
  ),
}));

// ==========================================================================
// 1. RiskAssessmentListPage
// ==========================================================================
import RiskAssessmentListPage from "@/portail/pages/RiskAssessmentListPage";

describe("RiskAssessmentListPage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<RiskAssessmentListPage />);
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("displays page title and description", async () => {
    renderWithProviders(<RiskAssessmentListPage />);
    await waitFor(() => {
      expect(screen.getByText("title")).toBeInTheDocument();
      expect(screen.getByText("description")).toBeInTheDocument();
    });
  });

  it("has new assessment button", async () => {
    renderWithProviders(<RiskAssessmentListPage />);
    await waitFor(() => {
      const buttons = screen.getAllByText("newAssessment");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it("renders filter selects when data loaded", async () => {
    renderWithProviders(<RiskAssessmentListPage />);
    await waitFor(() => {
      const buttons = document.querySelectorAll("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it("displays risk score gauges in preview mode", async () => {
    // isPreview=true by default (no plan_features), so demo data is shown
    renderWithProviders(<RiskAssessmentListPage />);
    await waitFor(() => {
      const gauges = screen.getAllByTestId("risk-score-gauge");
      expect(gauges.length).toBeGreaterThan(0);
    });
  });

  it("shows FeatureGate overlay in observer mode", async () => {
    renderWithProviders(<RiskAssessmentListPage />);
    await waitFor(() => {
      // FeatureGate renders content with aria-disabled when feature is missing
      const disabledDiv = document.querySelector('[aria-disabled="true"]');
      expect(disabledDiv).toBeTruthy();
    });
  });
});

// ==========================================================================
// 2. RiskAssessmentWizardPage
// ==========================================================================
import RiskAssessmentWizardPage from "@/portail/pages/RiskAssessmentWizardPage";

describe("RiskAssessmentWizardPage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<RiskAssessmentWizardPage />, { route: "/risks/new" });
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("shows page title and description", () => {
    renderWithProviders(<RiskAssessmentWizardPage />, { route: "/risks/new" });
    expect(screen.getByText("title")).toBeInTheDocument();
    expect(screen.getByText("description")).toBeInTheDocument();
  });

  it("renders risk score sidebar gauge", () => {
    renderWithProviders(<RiskAssessmentWizardPage />, { route: "/risks/new" });
    const gauges = screen.getAllByTestId("risk-score-gauge");
    expect(gauges.length).toBeGreaterThan(0);
  });

  it("renders radio group questions", () => {
    renderWithProviders(<RiskAssessmentWizardPage />, { route: "/risks/new" });
    const radios = document.querySelectorAll('[role="radio"]');
    expect(radios.length).toBeGreaterThan(0);
  });

  it("renders system selector label", () => {
    renderWithProviders(<RiskAssessmentWizardPage />, { route: "/risks/new" });
    // columns.system appears as label text
    const labels = screen.getAllByText("columns.system");
    expect(labels.length).toBeGreaterThan(0);
  });

  it("shows live score text", () => {
    renderWithProviders(<RiskAssessmentWizardPage />, { route: "/risks/new" });
    expect(screen.getByText("result.score")).toBeInTheDocument();
  });

  it("renders wizard step navigation buttons", () => {
    renderWithProviders(<RiskAssessmentWizardPage />, { route: "/risks/new" });
    const buttons = document.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});

// ==========================================================================
// 3. RiskAssessmentDetailPage
// ==========================================================================
import RiskAssessmentDetailPage from "@/portail/pages/RiskAssessmentDetailPage";

describe("RiskAssessmentDetailPage", () => {
  // Helper to create a valid detail assessment (requirements must be string[])
  const makeDetailAssessment = (overrides = {}) => ({
    ...mockRiskAssessments[0],
    requirements: ["Exigence HR-1", "Exigence HR-2"],
    ai_systems: { name: "Scoring Crédit" },
    ...overrides,
  });

  it("renders without crashing", () => {
    renderWithProviders(
      <Routes>
        <Route path="/risks/:id" element={<RiskAssessmentDetailPage />} />
      </Routes>,
      { route: "/risks/risk-001" },
    );
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("shows not found when assessment missing", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/risk_assessments`, ({ request }) => {
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
        <Route path="/risks/:id" element={<RiskAssessmentDetailPage />} />
      </Routes>,
      { route: "/risks/nonexistent" },
    );
    await waitFor(() => {
      expect(screen.getByText("detail.notFound")).toBeInTheDocument();
    });
  });

  it("displays assessment title when found", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/risk_assessments`, ({ request }) => {
        const accept = request.headers.get("accept") || "";
        if (accept.includes("vnd.pgrst.object")) {
          return HttpResponse.json(makeDetailAssessment());
        }
        return HttpResponse.json(mockRiskAssessments);
      }),
    );
    renderWithProviders(
      <Routes>
        <Route path="/risks/:id" element={<RiskAssessmentDetailPage />} />
      </Routes>,
      { route: "/risks/risk-001" },
    );
    await waitFor(() => {
      expect(screen.getByText("result.title")).toBeInTheDocument();
    });
  });

  it("shows workflow stepper with statuses", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/risk_assessments`, ({ request }) => {
        const accept = request.headers.get("accept") || "";
        if (accept.includes("vnd.pgrst.object")) {
          return HttpResponse.json(makeDetailAssessment({ status: "submitted" }));
        }
        return HttpResponse.json(mockRiskAssessments);
      }),
    );
    renderWithProviders(
      <Routes>
        <Route path="/risks/:id" element={<RiskAssessmentDetailPage />} />
      </Routes>,
      { route: "/risks/risk-001" },
    );
    await waitFor(() => {
      expect(screen.getByText("statuses.draft")).toBeInTheDocument();
      // "statuses.submitted" appears in both header badge and workflow stepper
      const submitted = screen.getAllByText("statuses.submitted");
      expect(submitted.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("shows back to list button", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/risk_assessments`, ({ request }) => {
        const accept = request.headers.get("accept") || "";
        if (accept.includes("vnd.pgrst.object")) {
          return HttpResponse.json(makeDetailAssessment());
        }
        return HttpResponse.json(mockRiskAssessments);
      }),
    );
    renderWithProviders(
      <Routes>
        <Route path="/risks/:id" element={<RiskAssessmentDetailPage />} />
      </Routes>,
      { route: "/risks/risk-001" },
    );
    await waitFor(() => {
      expect(screen.getByText("result.backToList")).toBeInTheDocument();
    });
  });

  it("shows score and level cards", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/risk_assessments`, ({ request }) => {
        const accept = request.headers.get("accept") || "";
        if (accept.includes("vnd.pgrst.object")) {
          return HttpResponse.json(makeDetailAssessment());
        }
        return HttpResponse.json(mockRiskAssessments);
      }),
    );
    renderWithProviders(
      <Routes>
        <Route path="/risks/:id" element={<RiskAssessmentDetailPage />} />
      </Routes>,
      { route: "/risks/risk-001" },
    );
    await waitFor(() => {
      expect(screen.getByText("result.score")).toBeInTheDocument();
      expect(screen.getByText("result.level")).toBeInTheDocument();
    });
  });

  it("shows requirements list", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/risk_assessments`, ({ request }) => {
        const accept = request.headers.get("accept") || "";
        if (accept.includes("vnd.pgrst.object")) {
          return HttpResponse.json(makeDetailAssessment());
        }
        return HttpResponse.json(mockRiskAssessments);
      }),
    );
    renderWithProviders(
      <Routes>
        <Route path="/risks/:id" element={<RiskAssessmentDetailPage />} />
      </Routes>,
      { route: "/risks/risk-001" },
    );
    await waitFor(() => {
      expect(screen.getByText("result.requirements")).toBeInTheDocument();
      expect(screen.getByText("Exigence HR-1")).toBeInTheDocument();
    });
  });

  it("shows answers section", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/risk_assessments`, ({ request }) => {
        const accept = request.headers.get("accept") || "";
        if (accept.includes("vnd.pgrst.object")) {
          return HttpResponse.json(makeDetailAssessment());
        }
        return HttpResponse.json(mockRiskAssessments);
      }),
    );
    renderWithProviders(
      <Routes>
        <Route path="/risks/:id" element={<RiskAssessmentDetailPage />} />
      </Routes>,
      { route: "/risks/risk-001" },
    );
    await waitFor(() => {
      expect(screen.getByText("detail.answersTitle")).toBeInTheDocument();
    });
  });
});
