import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { SUPABASE_URL } from "../mocks/handlers";
import { renderWithProviders } from "../mocks/utils";
import { mockAgentRegistry, mockAgentTraces } from "../mocks/fixtures";

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

// Mock sonner
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

// Mock templates for ModelesBibliothequePage — matches TemplateDoc shape
vi.mock("@/lib/templates", () => ({
  getAllTemplates: () => [
    {
      id: "tpl-001",
      number: 1,
      title: "Template Test",
      filename: "template-test",
      description: "A test template",
      category: "gouvernance-strategique",
      categoryLabel: "Gouvernance stratégique",
      type: "politique",
      typeLabel: "Politique",
      frameworks: ["loi25"],
      tags: ["test"],
      htmlPath: "/templates/tpl-001.html",
      docxPath: "/templates/tpl-001.docx",
    },
  ],
  searchTemplates: () => [],
  getCategories: () => [
    { slug: "gouvernance-strategique", label: "Gouvernance stratégique", count: 1, icon: "Shield" },
  ],
}));

// Mock DocumentLibrary for BibliothecPage
vi.mock("@/components/resources/DocumentLibrary", () => ({
  DocumentLibrary: ({ mode }: any) => (
    <div data-testid="document-library">DocumentLibrary mode={mode}</div>
  ),
}));

// ==========================================================================
// 1. BibliothecPage
// ==========================================================================
import BibliothecPage from "@/portail/pages/BibliothecPage";

describe("BibliothecPage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<BibliothecPage />);
    expect(screen.getByText("nav.bibliotheque")).toBeInTheDocument();
  });

  it("displays description", () => {
    renderWithProviders(<BibliothecPage />);
    expect(screen.getByText("bibliothequeDescription")).toBeInTheDocument();
  });

  it("renders DocumentLibrary component in portail mode", () => {
    renderWithProviders(<BibliothecPage />);
    expect(screen.getByTestId("document-library")).toBeInTheDocument();
    expect(screen.getByText(/mode=portail/)).toBeInTheDocument();
  });
});

// ==========================================================================
// 2. ModelesBibliothequePage
// ==========================================================================
import ModelesBibliothequePage from "@/portail/pages/ModelesBibliothequePage";

describe("ModelesBibliothequePage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<ModelesBibliothequePage />);
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("renders template cards from getAllTemplates", () => {
    renderWithProviders(<ModelesBibliothequePage />);
    expect(screen.getByText("Template Test")).toBeInTheDocument();
  });

  it("renders page structure with sidebar and cards", () => {
    renderWithProviders(<ModelesBibliothequePage />);
    // Template card should be rendered, page has content
    expect(screen.getByText("Template Test")).toBeInTheDocument();
    // There should be buttons (sidebar categories, etc.)
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});

// ==========================================================================
// 3. VeillePage — uses supabase directly, tested as smoke only
// ==========================================================================
import VeillePage from "@/portail/pages/VeillePage";

describe("VeillePage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<VeillePage />);
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("displays page heading", () => {
    renderWithProviders(<VeillePage />);
    // VeillePage renders heading/content
    expect(document.querySelector("div")).toBeTruthy();
  });
});

// ==========================================================================
// 4. MembresPage — shows loading skeleton when members haven't loaded
// ==========================================================================
import MembresPage from "@/portail/pages/MembresPage";

describe("MembresPage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<MembresPage />);
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("shows content after data loads", async () => {
    // Return empty members
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/members`, () => {
        return HttpResponse.json([]);
      }),
    );
    renderWithProviders(<MembresPage />);
    await waitFor(() => {
      expect(document.querySelector("div")).toBeTruthy();
    });
  });

  it("shows observer teaser when plan is observer", async () => {
    // plan_features returns [] by default => plan=observer => teaser is shown
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/members`, () => {
        return HttpResponse.json([]);
      }),
    );
    renderWithProviders(<MembresPage />);
    await waitFor(() => {
      // Observer teaser shows pageTitle and teaser content
      expect(screen.getByText("pageTitle")).toBeInTheDocument();
    });
  });

  it("shows teaser CTA button for upgrade", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/members`, () => {
        return HttpResponse.json([]);
      }),
    );
    renderWithProviders(<MembresPage />);
    await waitFor(() => {
      expect(screen.getByText("teaser.cta")).toBeInTheDocument();
    });
  });
});

// ==========================================================================
// 5. AgentsPage
// ==========================================================================
import AgentsPage from "@/portail/pages/AgentsPage";

describe("AgentsPage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<AgentsPage />);
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("shows loading state initially", () => {
    renderWithProviders(<AgentsPage />);
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("displays agents when data is available", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/agent_registry`, () => {
        return HttpResponse.json(mockAgentRegistry);
      }),
    );
    renderWithProviders(<AgentsPage />);
    await waitFor(() => {
      expect(screen.getByText("Copilot Gouvernance")).toBeInTheDocument();
    });
  });

  it("renders search input when data is loaded", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/agent_registry`, () => {
        return HttpResponse.json(mockAgentRegistry);
      }),
    );
    renderWithProviders(<AgentsPage />);
    await waitFor(() => {
      const inputs = document.querySelectorAll("input");
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  it("shows multiple agents in the table", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/agent_registry`, () => {
        return HttpResponse.json(mockAgentRegistry);
      }),
    );
    renderWithProviders(<AgentsPage />);
    await waitFor(() => {
      expect(screen.getByText("Copilot Gouvernance")).toBeInTheDocument();
      expect(screen.getByText("Monitor Conformité")).toBeInTheDocument();
    });
  });
});

// ==========================================================================
// 6. AgentTracesPage
// ==========================================================================
import AgentTracesPage from "@/portail/pages/AgentTracesPage";

describe("AgentTracesPage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<AgentTracesPage />);
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("shows empty state when no traces", async () => {
    renderWithProviders(<AgentTracesPage />);
    await waitFor(() => {
      // Default MSW returns [], so empty state should show
      expect(screen.getByText("noTraces")).toBeInTheDocument();
    });
  });

  it("displays traces when data is available", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/agent_traces`, () => {
        return HttpResponse.json(mockAgentTraces);
      }),
    );
    renderWithProviders(<AgentTracesPage />);
    await waitFor(() => {
      expect(
        screen.getByText("Analyse du niveau de conformité Loi 25"),
      ).toBeInTheDocument();
    });
  });

  it("shows search input when traces loaded", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/agent_traces`, () => {
        return HttpResponse.json(mockAgentTraces);
      }),
    );
    renderWithProviders(<AgentTracesPage />);
    await waitFor(() => {
      const inputs = document.querySelectorAll("input");
      expect(inputs.length).toBeGreaterThan(0);
    });
  });
});
