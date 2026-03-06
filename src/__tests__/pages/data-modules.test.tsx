import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { SUPABASE_URL } from "../mocks/handlers";
import { renderWithProviders } from "../mocks/utils";
import { mockDocuments } from "../mocks/fixtures/documents";
import { mockMonitoringMetrics } from "../mocks/fixtures/monitoring";
import { mockDatasets, mockDataTransfers } from "../mocks/fixtures/data";
import { mockVendors } from "../mocks/fixtures/vendors";

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
// 1. DocumentsPage
// ==========================================================================
import DocumentsPage from "@/portail/pages/DocumentsPage";

describe("DocumentsPage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<DocumentsPage />);
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("displays drive title", async () => {
    renderWithProviders(<DocumentsPage />);
    await waitFor(() => {
      // t("drive.title", { defaultValue: "Espace documentaire" }) returns "drive.title"
      expect(screen.getByText("drive.title")).toBeInTheDocument();
    });
  });

  it("displays drive description", async () => {
    renderWithProviders(<DocumentsPage />);
    await waitFor(() => {
      expect(screen.getByText("drive.description")).toBeInTheDocument();
    });
  });

  it("shows FeatureGate overlay in observer mode", async () => {
    renderWithProviders(<DocumentsPage />);
    await waitFor(() => {
      const disabledDiv = document.querySelector('[aria-disabled="true"]');
      expect(disabledDiv).toBeTruthy();
    });
  });

  it("renders search input", async () => {
    renderWithProviders(<DocumentsPage />);
    await waitFor(() => {
      const inputs = document.querySelectorAll("input");
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  it("renders filter buttons/selects", async () => {
    renderWithProviders(<DocumentsPage />);
    await waitFor(() => {
      const buttons = document.querySelectorAll("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});

// ==========================================================================
// 2. MonitoringPage
// ==========================================================================
import MonitoringPage from "@/portail/pages/MonitoringPage";

describe("MonitoringPage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<MonitoringPage />);
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("displays page title and description", async () => {
    renderWithProviders(<MonitoringPage />);
    await waitFor(() => {
      expect(screen.getByText("pageTitle")).toBeInTheDocument();
      expect(screen.getByText("pageDescription")).toBeInTheDocument();
    });
  });

  it("shows tabs for metrics and data points", async () => {
    renderWithProviders(<MonitoringPage />);
    await waitFor(() => {
      expect(screen.getByText("tabs.metrics")).toBeInTheDocument();
      expect(screen.getByText("tabs.dataPoints")).toBeInTheDocument();
    });
  });

  it("shows FeatureGate overlay in observer mode", async () => {
    renderWithProviders(<MonitoringPage />);
    await waitFor(() => {
      const disabledDiv = document.querySelector('[aria-disabled="true"]');
      expect(disabledDiv).toBeTruthy();
    });
  });

  it("renders search input", async () => {
    renderWithProviders(<MonitoringPage />);
    await waitFor(() => {
      const inputs = document.querySelectorAll("input");
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  it("renders filter selects", async () => {
    renderWithProviders(<MonitoringPage />);
    await waitFor(() => {
      const buttons = document.querySelectorAll("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});

// ==========================================================================
// 3. DataPage
// ==========================================================================
import DataPage from "@/portail/pages/DataPage";

describe("DataPage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<DataPage />);
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("displays page title and description", async () => {
    renderWithProviders(<DataPage />);
    await waitFor(() => {
      expect(screen.getByText("pageTitle")).toBeInTheDocument();
      expect(screen.getByText("pageDescription")).toBeInTheDocument();
    });
  });

  it("shows tabs for datasets and transfers", async () => {
    renderWithProviders(<DataPage />);
    await waitFor(() => {
      expect(screen.getByText("tabs.datasets")).toBeInTheDocument();
      expect(screen.getByText("tabs.transfers")).toBeInTheDocument();
    });
  });

  it("shows FeatureGate overlay in observer mode", async () => {
    renderWithProviders(<DataPage />);
    await waitFor(() => {
      const disabledDiv = document.querySelector('[aria-disabled="true"]');
      expect(disabledDiv).toBeTruthy();
    });
  });

  it("renders search inputs", async () => {
    renderWithProviders(<DataPage />);
    await waitFor(() => {
      const inputs = document.querySelectorAll("input");
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  it("renders action buttons", async () => {
    renderWithProviders(<DataPage />);
    await waitFor(() => {
      const buttons = document.querySelectorAll("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});

// ==========================================================================
// 4. VendorsPage
// ==========================================================================
import VendorsPage from "@/portail/pages/VendorsPage";

describe("VendorsPage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<VendorsPage />);
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("displays page title and description", async () => {
    renderWithProviders(<VendorsPage />);
    await waitFor(() => {
      expect(screen.getByText("pageTitle")).toBeInTheDocument();
      expect(screen.getByText("pageDescription")).toBeInTheDocument();
    });
  });

  it("shows FeatureGate overlay in observer mode", async () => {
    renderWithProviders(<VendorsPage />);
    await waitFor(() => {
      const disabledDiv = document.querySelector('[aria-disabled="true"]');
      expect(disabledDiv).toBeTruthy();
    });
  });

  it("renders search input", async () => {
    renderWithProviders(<VendorsPage />);
    await waitFor(() => {
      const inputs = document.querySelectorAll("input");
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  it("renders action buttons", async () => {
    renderWithProviders(<VendorsPage />);
    await waitFor(() => {
      const buttons = document.querySelectorAll("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it("shows demo vendor data in preview mode", async () => {
    // In preview mode (no plan features), demo data is used
    renderWithProviders(<VendorsPage />);
    await waitFor(() => {
      // Demo vendors include "OpenAI"
      expect(screen.getByText("OpenAI")).toBeInTheDocument();
    });
  });
});
