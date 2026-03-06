import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { SUPABASE_URL } from "../mocks/handlers";
import { renderWithProviders } from "../mocks/utils";
import { mockAiSystems } from "../mocks/fixtures/ai-systems";

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
// 1. AiSystemsListPage
// ==========================================================================
import AiSystemsListPage from "@/portail/pages/AiSystemsListPage";

describe("AiSystemsListPage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<AiSystemsListPage />);
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("displays page title and description", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/ai_systems`, () => {
        return HttpResponse.json([]);
      }),
    );
    renderWithProviders(<AiSystemsListPage />);
    await waitFor(() => {
      expect(screen.getByText("title")).toBeInTheDocument();
      expect(screen.getByText("description")).toBeInTheDocument();
    });
  });

  it("shows empty state when no systems", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/ai_systems`, () => {
        return HttpResponse.json([]);
      }),
    );
    renderWithProviders(<AiSystemsListPage />);
    await waitFor(() => {
      expect(screen.getByText("empty.title")).toBeInTheDocument();
    });
  });

  it("has new system button", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/ai_systems`, () => {
        return HttpResponse.json([]);
      }),
    );
    renderWithProviders(<AiSystemsListPage />);
    await waitFor(() => {
      const buttons = screen.getAllByText("newSystem");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it("renders filter inputs when data loaded", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/ai_systems`, () => {
        return HttpResponse.json([]);
      }),
    );
    renderWithProviders(<AiSystemsListPage />);
    await waitFor(() => {
      const inputs = document.querySelectorAll("input");
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  it("displays system names when data available", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/ai_systems`, () => {
        return HttpResponse.json(mockAiSystems);
      }),
    );
    renderWithProviders(<AiSystemsListPage />);
    await waitFor(() => {
      expect(screen.getByText("Chatbot Service Client")).toBeInTheDocument();
    });
  });

  it("renders multiple systems in table", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/ai_systems`, () => {
        return HttpResponse.json(mockAiSystems);
      }),
    );
    renderWithProviders(<AiSystemsListPage />);
    await waitFor(() => {
      expect(screen.getByText("Scoring Crédit Automatisé")).toBeInTheDocument();
      expect(screen.getByText("Analyse Sentiments RH")).toBeInTheDocument();
    });
  });
});

// ==========================================================================
// 2. AiSystemWizardPage (create mode)
// ==========================================================================
import AiSystemWizardPage from "@/portail/pages/AiSystemWizardPage";

describe("AiSystemWizardPage", () => {
  it("renders create mode without crashing", () => {
    renderWithProviders(<AiSystemWizardPage />, { route: "/ai-systems/new" });
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("shows create title in new mode", () => {
    renderWithProviders(<AiSystemWizardPage />, { route: "/ai-systems/new" });
    expect(screen.getByText("wizard.createTitle")).toBeInTheDocument();
  });

  it("renders name and description input fields", () => {
    renderWithProviders(<AiSystemWizardPage />, { route: "/ai-systems/new" });
    const nameInput = document.getElementById("name");
    expect(nameInput).toBeTruthy();
    const descInput = document.getElementById("description");
    expect(descInput).toBeTruthy();
  });

  it("renders risk preview sidebar", () => {
    renderWithProviders(<AiSystemWizardPage />, { route: "/ai-systems/new" });
    expect(screen.getByText("wizard.riskPreview")).toBeInTheDocument();
  });

  it("renders system type radio buttons", () => {
    renderWithProviders(<AiSystemWizardPage />, { route: "/ai-systems/new" });
    const radioButtons = document.querySelectorAll('[role="radio"]');
    expect(radioButtons.length).toBeGreaterThan(0);
  });

  it("renders internal ref field", () => {
    renderWithProviders(<AiSystemWizardPage />, { route: "/ai-systems/new" });
    const refInput = document.getElementById("internal_ref");
    expect(refInput).toBeTruthy();
  });
});

// ==========================================================================
// 3. AiSystemDetailPage
// ==========================================================================
import AiSystemDetailPage from "@/portail/pages/AiSystemDetailPage";

describe("AiSystemDetailPage", () => {
  it("renders without crashing", () => {
    renderWithProviders(
      <Routes>
        <Route path="/ai-systems/:id" element={<AiSystemDetailPage />} />
      </Routes>,
      { route: "/ai-systems/ais-001" },
    );
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("shows not found when system not returned", async () => {
    // Return single() with error (no rows)
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/ai_systems`, ({ request }) => {
        const url = new URL(request.url);
        // If it's a single-row query (has id filter), return error
        if (url.searchParams.has("id")) {
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
        <Route path="/ai-systems/:id" element={<AiSystemDetailPage />} />
      </Routes>,
      { route: "/ai-systems/nonexistent" },
    );
    await waitFor(() => {
      expect(screen.getByText("detail.notFound")).toBeInTheDocument();
    });
  });

  it("displays system name when found", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/ai_systems`, ({ request }) => {
        const url = new URL(request.url);
        const accept = request.headers.get("accept") || "";
        // single() sets Accept: application/vnd.pgrst.object+json
        if (accept.includes("vnd.pgrst.object")) {
          return HttpResponse.json(mockAiSystems[0]);
        }
        return HttpResponse.json(mockAiSystems);
      }),
    );
    renderWithProviders(
      <Routes>
        <Route path="/ai-systems/:id" element={<AiSystemDetailPage />} />
      </Routes>,
      { route: "/ai-systems/ais-001" },
    );
    await waitFor(() => {
      expect(screen.getByText("Chatbot Service Client")).toBeInTheDocument();
    });
  });

  it("shows tabs when system is loaded", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/ai_systems`, ({ request }) => {
        const accept = request.headers.get("accept") || "";
        if (accept.includes("vnd.pgrst.object")) {
          return HttpResponse.json(mockAiSystems[0]);
        }
        return HttpResponse.json(mockAiSystems);
      }),
    );
    renderWithProviders(
      <Routes>
        <Route path="/ai-systems/:id" element={<AiSystemDetailPage />} />
      </Routes>,
      { route: "/ai-systems/ais-001" },
    );
    await waitFor(() => {
      expect(screen.getByText("detail.tabs.summary")).toBeInTheDocument();
      expect(screen.getByText("detail.tabs.risks")).toBeInTheDocument();
      expect(screen.getByText("detail.tabs.incidents")).toBeInTheDocument();
    });
  });

  it("shows edit and delete buttons", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/ai_systems`, ({ request }) => {
        const accept = request.headers.get("accept") || "";
        if (accept.includes("vnd.pgrst.object")) {
          return HttpResponse.json(mockAiSystems[0]);
        }
        return HttpResponse.json(mockAiSystems);
      }),
    );
    renderWithProviders(
      <Routes>
        <Route path="/ai-systems/:id" element={<AiSystemDetailPage />} />
      </Routes>,
      { route: "/ai-systems/ais-001" },
    );
    await waitFor(() => {
      expect(screen.getByText("detail.edit")).toBeInTheDocument();
      expect(screen.getByText("detail.delete")).toBeInTheDocument();
    });
  });
});
