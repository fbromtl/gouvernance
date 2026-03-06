import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { SUPABASE_URL } from "../mocks/handlers";
import { renderWithProviders } from "../mocks/utils";
import {
  mockGovernanceRoles,
  mockCommittees,
  mockPolicies,
} from "../mocks/fixtures/governance";
import { mockDecisions } from "../mocks/fixtures/decisions";
import { mockBiasFindings } from "../mocks/fixtures/bias";
import {
  mockAutomatedDecisions,
  mockContestations,
} from "../mocks/fixtures/transparency";
import { mockLifecycleEvents } from "../mocks/fixtures/lifecycle";
import { mockComplianceAssessments } from "../mocks/fixtures/compliance";

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

// Mock RiskScoreGauge
vi.mock("@/components/shared/RiskScoreGauge", () => ({
  RiskScoreGauge: ({ score }: any) => (
    <div data-testid="risk-score-gauge">{score}</div>
  ),
}));

// Mock ComplianceScoreGauge to avoid jsdom SVG issues (getTotalLength)
vi.mock("@/components/shared/ComplianceScoreGauge", () => ({
  ComplianceScoreGauge: ({ score, showLabel }: any) => (
    <div data-testid="compliance-score-gauge">
      <span>{score}</span>
      {showLabel && <span>compliance-label</span>}
    </div>
  ),
}));

// ==========================================================================
// 1. GovernancePage
// ==========================================================================
import GovernancePage from "@/portail/pages/GovernancePage";

describe("GovernancePage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<GovernancePage />);
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("displays page title and description", async () => {
    renderWithProviders(<GovernancePage />);
    await waitFor(() => {
      expect(screen.getByText("pageTitle")).toBeInTheDocument();
      expect(screen.getByText("pageDescription")).toBeInTheDocument();
    });
  });

  it("shows tabs for policies, roles, committees", async () => {
    renderWithProviders(<GovernancePage />);
    await waitFor(() => {
      expect(screen.getByText("tabs.policies")).toBeInTheDocument();
      expect(screen.getByText("tabs.roles")).toBeInTheDocument();
      expect(screen.getByText("tabs.committees")).toBeInTheDocument();
    });
  });

  it("shows FeatureGate overlay in observer mode", async () => {
    renderWithProviders(<GovernancePage />);
    await waitFor(() => {
      const disabledDiv = document.querySelector('[aria-disabled="true"]');
      expect(disabledDiv).toBeTruthy();
    });
  });

  it("renders buttons for actions", async () => {
    renderWithProviders(<GovernancePage />);
    await waitFor(() => {
      const buttons = document.querySelectorAll("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});

// ==========================================================================
// 2. DecisionsPage
// ==========================================================================
import DecisionsPage from "@/portail/pages/DecisionsPage";

describe("DecisionsPage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<DecisionsPage />);
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("displays page title and description", async () => {
    renderWithProviders(<DecisionsPage />);
    await waitFor(() => {
      const titles = screen.getAllByText("pageTitle");
      expect(titles.length).toBeGreaterThan(0);
      const descriptions = screen.getAllByText("pageDescription");
      expect(descriptions.length).toBeGreaterThan(0);
    });
  });

  it("shows FeatureGate overlay in observer mode", async () => {
    renderWithProviders(<DecisionsPage />);
    await waitFor(() => {
      const disabledDiv = document.querySelector('[aria-disabled="true"]');
      expect(disabledDiv).toBeTruthy();
    });
  });

  it("renders search input", async () => {
    renderWithProviders(<DecisionsPage />);
    await waitFor(() => {
      const inputs = document.querySelectorAll("input");
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  it("renders action buttons", async () => {
    renderWithProviders(<DecisionsPage />);
    await waitFor(() => {
      const buttons = document.querySelectorAll("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});

// ==========================================================================
// 3. CompliancePage
// ==========================================================================
import CompliancePage from "@/portail/pages/CompliancePage";

describe("CompliancePage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<CompliancePage />);
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("displays page title and description", async () => {
    renderWithProviders(<CompliancePage />);
    await waitFor(() => {
      expect(screen.getByText("pageTitle")).toBeInTheDocument();
      expect(screen.getByText("pageDescription")).toBeInTheDocument();
    });
  });

  it("shows compliance tabs", async () => {
    renderWithProviders(<CompliancePage />);
    await waitFor(() => {
      expect(screen.getByText("tabs.dashboard")).toBeInTheDocument();
      expect(screen.getByText("tabs.frameworks")).toBeInTheDocument();
      expect(screen.getByText("tabs.remediation")).toBeInTheDocument();
    });
  });

  it("shows FeatureGate overlay in observer mode", async () => {
    renderWithProviders(<CompliancePage />);
    await waitFor(() => {
      const disabledDiv = document.querySelector('[aria-disabled="true"]');
      expect(disabledDiv).toBeTruthy();
    });
  });

  it("renders buttons", async () => {
    renderWithProviders(<CompliancePage />);
    await waitFor(() => {
      const buttons = document.querySelectorAll("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});

// ==========================================================================
// 4. BiasPage
// ==========================================================================
import BiasPage from "@/portail/pages/BiasPage";

describe("BiasPage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<BiasPage />);
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("displays page title and description", async () => {
    renderWithProviders(<BiasPage />);
    await waitFor(() => {
      expect(screen.getByText("pageTitle")).toBeInTheDocument();
      expect(screen.getByText("pageDescription")).toBeInTheDocument();
    });
  });

  it("shows FeatureGate overlay in observer mode", async () => {
    renderWithProviders(<BiasPage />);
    await waitFor(() => {
      const disabledDiv = document.querySelector('[aria-disabled="true"]');
      expect(disabledDiv).toBeTruthy();
    });
  });

  it("renders action buttons", async () => {
    renderWithProviders(<BiasPage />);
    await waitFor(() => {
      const buttons = document.querySelectorAll("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});

// ==========================================================================
// 5. TransparencyPage
// ==========================================================================
import TransparencyPage from "@/portail/pages/TransparencyPage";

describe("TransparencyPage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<TransparencyPage />);
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("displays page title and description", async () => {
    renderWithProviders(<TransparencyPage />);
    await waitFor(() => {
      expect(screen.getByText("pageTitle")).toBeInTheDocument();
      expect(screen.getByText("pageDescription")).toBeInTheDocument();
    });
  });

  it("shows tabs for registry and contestations", async () => {
    renderWithProviders(<TransparencyPage />);
    await waitFor(() => {
      expect(screen.getByText("tabs.registry")).toBeInTheDocument();
      expect(screen.getByText("tabs.contestations")).toBeInTheDocument();
    });
  });

  it("shows FeatureGate overlay in observer mode", async () => {
    renderWithProviders(<TransparencyPage />);
    await waitFor(() => {
      const disabledDiv = document.querySelector('[aria-disabled="true"]');
      expect(disabledDiv).toBeTruthy();
    });
  });

  it("renders action buttons", async () => {
    renderWithProviders(<TransparencyPage />);
    await waitFor(() => {
      const buttons = document.querySelectorAll("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});

// ==========================================================================
// 6. LifecyclePage
// ==========================================================================
import LifecyclePage from "@/portail/pages/LifecyclePage";

describe("LifecyclePage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<LifecyclePage />);
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("displays page title and description", async () => {
    renderWithProviders(<LifecyclePage />);
    await waitFor(() => {
      expect(screen.getByText("pageTitle")).toBeInTheDocument();
      expect(screen.getByText("pageDescription")).toBeInTheDocument();
    });
  });

  it("shows empty state when no events", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/lifecycle_events`, () => {
        return HttpResponse.json([]);
      }),
    );
    renderWithProviders(<LifecyclePage />);
    await waitFor(() => {
      expect(screen.getByText("noEvents")).toBeInTheDocument();
    });
  });

  it("renders search input", async () => {
    renderWithProviders(<LifecyclePage />);
    await waitFor(() => {
      const inputs = document.querySelectorAll("input");
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  it("renders filter select for event type", async () => {
    renderWithProviders(<LifecyclePage />);
    await waitFor(() => {
      // Filter select renders as a button trigger
      const buttons = document.querySelectorAll("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it("displays events when data available", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/lifecycle_events`, () => {
        return HttpResponse.json(mockLifecycleEvents);
      }),
    );
    renderWithProviders(<LifecyclePage />);
    await waitFor(() => {
      expect(
        screen.getByText("Mise en production v2.0"),
      ).toBeInTheDocument();
    });
  });
});
