import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../mocks/utils";
import { mockAiSystems } from "../../mocks/fixtures/ai-systems";
import { mockDecisions } from "../../mocks/fixtures/decisions";
import { mockBiasFindings } from "../../mocks/fixtures/bias";
import { mockIncidents } from "../../mocks/fixtures/incidents";

// ---------------------------------------------------------------------------
// Mock recharts — jsdom has no SVG layout engine
// ---------------------------------------------------------------------------

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  RadarChart: ({ children }: any) => (
    <div data-testid="radar-chart">{children}</div>
  ),
  Radar: () => <div />,
  PolarGrid: () => <div />,
  PolarAngleAxis: () => <div />,
  PolarRadiusAxis: () => <div />,
  BarChart: ({ children }: any) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  LineChart: ({ children }: any) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div />,
  PieChart: ({ children }: any) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: () => <div />,
  Cell: () => <div />,
  AreaChart: ({ children }: any) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => <div />,
}));

// ==========================================================================
// 1. ComplianceRadarChart
// ==========================================================================

import { ComplianceRadarChart } from "@/portail/components/dashboard/ComplianceRadarChart";

describe("ComplianceRadarChart", () => {
  it("renders empty state when no frameworks", () => {
    renderWithProviders(<ComplianceRadarChart frameworks={[]} />);
    expect(screen.getByText("widgets.complianceRadar")).toBeInTheDocument();
    // em dash empty indicator
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders chart when frameworks provided", () => {
    const frameworks = [
      { framework: "LOI_25", score: 80 },
      { framework: "EU_AI_ACT", score: 60 },
    ];
    renderWithProviders(<ComplianceRadarChart frameworks={frameworks} />);
    expect(screen.getByTestId("radar-chart")).toBeInTheDocument();
  });

  it("displays global score badge", () => {
    const frameworks = [
      { framework: "LOI_25", score: 80 },
      { framework: "EU_AI_ACT", score: 60 },
    ];
    renderWithProviders(<ComplianceRadarChart frameworks={frameworks} />);
    // Average: (80 + 60) / 2 = 70
    expect(screen.getByText("70%")).toBeInTheDocument();
  });

  it("applies green badge for high scores", () => {
    const frameworks = [{ framework: "LOI_25", score: 90 }];
    renderWithProviders(<ComplianceRadarChart frameworks={frameworks} />);
    const badge = screen.getByText("90%");
    expect(badge).toHaveClass("bg-emerald-100");
  });

  it("applies red badge for low scores", () => {
    const frameworks = [{ framework: "LOI_25", score: 30 }];
    renderWithProviders(<ComplianceRadarChart frameworks={frameworks} />);
    const badge = screen.getByText("30%");
    expect(badge).toHaveClass("bg-red-100");
  });
});

// ==========================================================================
// 2. RiskDistributionChart
// ==========================================================================

import RiskDistributionChart from "@/portail/components/dashboard/RiskDistributionChart";

describe("RiskDistributionChart", () => {
  it("renders empty state when no data", () => {
    renderWithProviders(<RiskDistributionChart data={[]} />);
    expect(screen.getByText("widgets.riskDistribution")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders chart when data provided", () => {
    renderWithProviders(<RiskDistributionChart data={mockAiSystems as any} />);
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
  });

  it("renders legend with risk level names", () => {
    renderWithProviders(<RiskDistributionChart data={mockAiSystems as any} />);
    // The mock has "limited" and "critical" risk levels
    expect(screen.getByText("riskLevels.limited")).toBeInTheDocument();
    expect(screen.getByText("riskLevels.critical")).toBeInTheDocument();
  });
});

// ==========================================================================
// 3. IncidentTimelineChart
// ==========================================================================

import { IncidentTimelineChart } from "@/portail/components/dashboard/IncidentTimelineChart";

describe("IncidentTimelineChart", () => {
  it("renders empty state when no incidents", () => {
    renderWithProviders(<IncidentTimelineChart incidents={[]} />);
    expect(screen.getByText("widgets.incidentTimeline")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders chart when incidents with current-month dates provided", () => {
    // Create an incident in the current month
    const now = new Date();
    const recentIncidents = [
      {
        severity: "high",
        detected_at: now.toISOString(),
        created_at: now.toISOString(),
      },
    ];
    renderWithProviders(
      <IncidentTimelineChart incidents={recentIncidents} />,
    );
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("renders empty state for old incidents outside the 6-month window", () => {
    const oldIncidents = [
      {
        severity: "low",
        detected_at: "2020-01-01T00:00:00Z",
        created_at: "2020-01-01T00:00:00Z",
      },
    ];
    renderWithProviders(
      <IncidentTimelineChart incidents={oldIncidents} />,
    );
    // These are too old, so should show empty
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});

// ==========================================================================
// 4. SystemsByTypeChart
// ==========================================================================

import SystemsByTypeChart from "@/portail/components/dashboard/SystemsByTypeChart";

describe("SystemsByTypeChart", () => {
  it("renders empty state when no systems", () => {
    renderWithProviders(<SystemsByTypeChart systems={[]} />);
    expect(screen.getByText("widgets.systemsByType")).toBeInTheDocument();
    expect(screen.getByText("widgets.noSystems")).toBeInTheDocument();
  });

  it("renders chart when systems provided", () => {
    const systems = [
      { system_type: "generative_ai" },
      { system_type: "predictive" },
      { system_type: "generative_ai" },
    ];
    renderWithProviders(<SystemsByTypeChart systems={systems} />);
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
  });

  it("renders legend entries for each type", () => {
    const systems = [
      { system_type: "generative_ai" },
      { system_type: "predictive" },
    ];
    renderWithProviders(<SystemsByTypeChart systems={systems} />);
    // i18n mock returns the key directly
    expect(screen.getByText("systemTypes.generative_ai")).toBeInTheDocument();
    expect(screen.getByText("systemTypes.predictive")).toBeInTheDocument();
  });
});

// ==========================================================================
// 5. TopRiskSystemsTable
// ==========================================================================

import TopRiskSystemsTable from "@/portail/components/dashboard/TopRiskSystemsTable";

describe("TopRiskSystemsTable", () => {
  it("renders empty state when no systems", () => {
    renderWithProviders(<TopRiskSystemsTable systems={[]} />);
    expect(screen.getByText("widgets.topRiskSystems")).toBeInTheDocument();
    expect(screen.getByText("widgets.noSystems")).toBeInTheDocument();
  });

  it("renders systems sorted by risk score", () => {
    const systems = [
      { id: "1", name: "Low Risk", risk_score: 10, risk_level: "minimal", lifecycle_status: "production" },
      { id: "2", name: "High Risk", risk_score: 90, risk_level: "critical", lifecycle_status: "production" },
      { id: "3", name: "Med Risk", risk_score: 50, risk_level: "limited", lifecycle_status: "development" },
    ];
    renderWithProviders(<TopRiskSystemsTable systems={systems} />);

    const links = screen.getAllByRole("link");
    // First link should be the highest risk
    expect(links[0]).toHaveTextContent("High Risk");
    expect(links[1]).toHaveTextContent("Med Risk");
    expect(links[2]).toHaveTextContent("Low Risk");
  });

  it("limits to 5 systems", () => {
    const systems = Array.from({ length: 8 }, (_, i) => ({
      id: `s-${i}`,
      name: `System ${i}`,
      risk_score: 90 - i * 10,
      risk_level: "high",
      lifecycle_status: "production",
    }));
    renderWithProviders(<TopRiskSystemsTable systems={systems} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(5);
  });

  it("renders risk scores with correct color classes", () => {
    const systems = [
      { id: "1", name: "Critical", risk_score: 95, risk_level: "critical", lifecycle_status: "production" },
    ];
    renderWithProviders(<TopRiskSystemsTable systems={systems} />);
    const scoreEl = screen.getByText("95");
    expect(scoreEl).toHaveClass("text-red-600");
  });
});

// ==========================================================================
// 6. PendingActionsWidget
// ==========================================================================

import PendingActionsWidget from "@/portail/components/dashboard/PendingActionsWidget";

describe("PendingActionsWidget", () => {
  it("renders empty state when no pending actions", () => {
    renderWithProviders(
      <PendingActionsWidget decisions={[]} biasFindings={[]} />,
    );
    expect(screen.getByText("widgets.pendingActions")).toBeInTheDocument();
    expect(screen.getByText("widgets.noPendingActions")).toBeInTheDocument();
  });

  it("renders pending decisions", () => {
    // dec-002 has status "submitted" which is a pending action
    renderWithProviders(
      <PendingActionsWidget decisions={mockDecisions} biasFindings={[]} />,
    );
    expect(screen.getByText("Suspension temporaire du scoring crédit")).toBeInTheDocument();
  });

  it("renders pending bias findings", () => {
    // bf-001 has status "open" — which is NOT "identified" or "in_remediation"
    // bf-002 has status "investigating" — also not pending
    // Let's create explicit fixtures
    const biasFindings = [
      {
        ...mockBiasFindings[0],
        status: "identified",
      },
    ];
    renderWithProviders(
      <PendingActionsWidget decisions={[]} biasFindings={biasFindings as any} />,
    );
    expect(screen.getByText("Biais de genre dans le scoring")).toBeInTheDocument();
  });

  it("shows count badge when there are pending actions", () => {
    const decisions = [{ ...mockDecisions[1] }]; // submitted
    renderWithProviders(
      <PendingActionsWidget decisions={decisions} biasFindings={[]} />,
    );
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});

// ==========================================================================
// 7. ReviewsDueWidget
// ==========================================================================

import ReviewsDueWidget from "@/portail/components/dashboard/ReviewsDueWidget";

describe("ReviewsDueWidget", () => {
  it("renders empty state when no systems with review dates", () => {
    renderWithProviders(<ReviewsDueWidget systems={[]} />);
    expect(screen.getByText("widgets.reviewsDue")).toBeInTheDocument();
    expect(screen.getByText("widgets.noReviewsDue")).toBeInTheDocument();
  });

  it("renders empty state for systems without review dates", () => {
    const systems = [
      { id: "1", name: "System A", next_review_date: null },
    ];
    renderWithProviders(<ReviewsDueWidget systems={systems} />);
    expect(screen.getByText("widgets.noReviewsDue")).toBeInTheDocument();
  });

  it("renders systems with upcoming review dates", () => {
    const future = new Date();
    future.setDate(future.getDate() + 15);
    const systems = [
      { id: "1", name: "Soon System", next_review_date: future.toISOString().split("T")[0] },
    ];
    renderWithProviders(<ReviewsDueWidget systems={systems} />);
    expect(screen.getByText("Soon System")).toBeInTheDocument();
  });

  it("shows overdue badge for past review dates", () => {
    const past = new Date();
    past.setDate(past.getDate() - 10);
    const systems = [
      { id: "1", name: "Overdue System", next_review_date: past.toISOString().split("T")[0] },
    ];
    renderWithProviders(<ReviewsDueWidget systems={systems} />);
    expect(screen.getByText("Overdue System")).toBeInTheDocument();
    // Should show "En retard" text in a badge
    expect(screen.getByText(/En retard/)).toBeInTheDocument();
  });
});

// ==========================================================================
// 8. RecentDecisionsWidget
// ==========================================================================

import RecentDecisionsWidget from "@/portail/components/dashboard/RecentDecisionsWidget";

describe("RecentDecisionsWidget", () => {
  it("renders empty state when no decisions", () => {
    renderWithProviders(<RecentDecisionsWidget decisions={[]} />);
    expect(screen.getByText("widgets.recentDecisions")).toBeInTheDocument();
    expect(screen.getByText("widgets.noDecisions")).toBeInTheDocument();
  });

  it("renders decision titles", () => {
    const decisions = mockDecisions.map((d) => ({
      id: d.id,
      title: d.title,
      decision_type: d.decision_type,
      status: d.status,
      created_at: d.created_at,
    }));
    renderWithProviders(<RecentDecisionsWidget decisions={decisions} />);
    expect(
      screen.getByText("Ajout de la fonctionnalité d'explicabilité"),
    ).toBeInTheDocument();
  });

  it("limits to 5 decisions", () => {
    const decisions = Array.from({ length: 8 }, (_, i) => ({
      id: `d-${i}`,
      title: `Decision ${i}`,
      decision_type: "deployment",
      status: "draft",
      created_at: new Date(2025, 0, i + 1).toISOString(),
    }));
    renderWithProviders(<RecentDecisionsWidget decisions={decisions} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(5);
  });
});

// ==========================================================================
// 9. BiasDebtWidget
// ==========================================================================

import BiasDebtWidget from "@/portail/components/dashboard/BiasDebtWidget";

describe("BiasDebtWidget", () => {
  it("renders zero state when all findings are resolved", () => {
    const findings = [
      { ...mockBiasFindings[0], status: "resolved" },
    ];
    renderWithProviders(<BiasDebtWidget findings={findings as any} />);
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("Aucun biais ouvert")).toBeInTheDocument();
  });

  it("renders zero state when no findings", () => {
    renderWithProviders(<BiasDebtWidget findings={[]} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders count of open findings", () => {
    renderWithProviders(<BiasDebtWidget findings={mockBiasFindings as any} />);
    // Both findings are open (status: "open" and "investigating")
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows severity breakdown labels", () => {
    renderWithProviders(<BiasDebtWidget findings={mockBiasFindings as any} />);
    expect(screen.getByText("Critique")).toBeInTheDocument();
    expect(screen.getByText("Élevé")).toBeInTheDocument();
    expect(screen.getByText("Moyen")).toBeInTheDocument();
    expect(screen.getByText("Faible")).toBeInTheDocument();
  });
});

// ==========================================================================
// 10. AgentActivityWidget
// ==========================================================================

// Must mock the hook used internally
vi.mock("@/hooks/useAgentTraces", () => ({
  useRecentAgentTraces: vi.fn(),
}));

// Must mock CreateAgentDialog to avoid complexity
vi.mock("@/portail/components/agents/CreateAgentDialog", () => ({
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="create-agent-dialog">Dialog</div> : null,
}));

import AgentActivityWidget from "@/portail/components/dashboard/AgentActivityWidget";
import { useRecentAgentTraces } from "@/hooks/useAgentTraces";

describe("AgentActivityWidget", () => {
  it("renders empty state when no traces", () => {
    vi.mocked(useRecentAgentTraces).mockReturnValue({
      data: [],
    } as any);
    renderWithProviders(<AgentActivityWidget />);
    expect(screen.getByText("widgets.agentActivity.title")).toBeInTheDocument();
    expect(screen.getByText("widgets.agentActivity.noTraces")).toBeInTheDocument();
  });

  it("renders traces when available", () => {
    vi.mocked(useRecentAgentTraces).mockReturnValue({
      data: [
        {
          id: "t1",
          agent_id: "agent-001",
          event_type: "decision",
          classification_code: "A1",
          created_at: new Date().toISOString(),
        },
      ],
    } as any);
    renderWithProviders(<AgentActivityWidget />);
    expect(screen.getByText("agent-001")).toBeInTheDocument();
    expect(screen.getByText("A1")).toBeInTheDocument();
  });

  it("shows trace count", () => {
    vi.mocked(useRecentAgentTraces).mockReturnValue({
      data: [
        { id: "t1", agent_id: "a1", event_type: "decision", created_at: new Date().toISOString(), classification_code: null },
      ],
    } as any);
    renderWithProviders(<AgentActivityWidget />);
    expect(screen.getByText(/1.*widgets.agentActivity.traces/)).toBeInTheDocument();
  });
});

// ==========================================================================
// 11. DiagnosticResultWidget
// ==========================================================================

vi.mock("@/hooks/useDiagnostic", () => ({
  useLatestDiagnostic: vi.fn(),
  useSaveDiagnostic: vi.fn(() => ({ isPending: false, mutate: vi.fn() })),
  useDeleteDiagnostic: vi.fn(() => ({ isPending: false, mutate: vi.fn() })),
  getPendingDiagnostic: vi.fn(() => null),
  clearPendingDiagnostic: vi.fn(),
}));

import DiagnosticResultWidget from "@/portail/components/dashboard/DiagnosticResultWidget";
import { useLatestDiagnostic } from "@/hooks/useDiagnostic";

describe("DiagnosticResultWidget", () => {
  it("renders nothing when loading", () => {
    vi.mocked(useLatestDiagnostic).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);
    const { container } = renderWithProviders(<DiagnosticResultWidget />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when no diagnostic", () => {
    vi.mocked(useLatestDiagnostic).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);
    const { container } = renderWithProviders(<DiagnosticResultWidget />);
    expect(container.innerHTML).toBe("");
  });

  it("renders diagnostic results when data available", () => {
    vi.mocked(useLatestDiagnostic).mockReturnValue({
      data: {
        id: "diag-1",
        total_score: 21,
        maturity_level: "intermediaire",
        answers: {
          inventory: 2,
          risk_assessment: 3,
          data_protection: 2,
          bias_fairness: 2,
          transparency: 2,
          human_oversight: 2,
          regulatory_compliance: 2,
          incident_management: 2,
          organizational_governance: 2,
          training_awareness: 2,
        },
        completed_at: "2025-06-01T10:00:00Z",
      },
      isLoading: false,
    } as any);
    renderWithProviders(<DiagnosticResultWidget />);
    expect(screen.getByText("widget.title")).toBeInTheDocument();
    expect(screen.getByText("21")).toBeInTheDocument();
    expect(screen.getByText("21 / 30")).toBeInTheDocument();
    expect(screen.getByText("levels.intermediaire")).toBeInTheDocument();
  });

  it("renders domain breakdown", () => {
    vi.mocked(useLatestDiagnostic).mockReturnValue({
      data: {
        id: "diag-1",
        total_score: 15,
        maturity_level: "emergent",
        answers: {
          inventory: 1,
          risk_assessment: 2,
          data_protection: 1,
          bias_fairness: 2,
          transparency: 1,
          human_oversight: 2,
          regulatory_compliance: 1,
          incident_management: 2,
          organizational_governance: 1,
          training_awareness: 2,
        },
        completed_at: "2025-06-01T10:00:00Z",
      },
      isLoading: false,
    } as any);
    renderWithProviders(<DiagnosticResultWidget />);
    expect(screen.getByText("results.domains.inventory")).toBeInTheDocument();
    expect(screen.getByText("results.domains.risk_assessment")).toBeInTheDocument();
  });
});
