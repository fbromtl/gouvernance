import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../mocks/utils";

// ---------------------------------------------------------------------------
// Mock recharts (some pages may import dashboard widgets that use recharts)
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

// Mock sonner (toast)
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

// Mock date-fns to avoid locale issues
vi.mock("date-fns", () => ({
  format: (d: any, fmt: string) => String(d),
  formatDistanceToNow: () => "il y a 1 jour",
}));
vi.mock("date-fns/locale", () => ({
  fr: {},
}));

// ==========================================================================
// 1. PlaceholderPage
// ==========================================================================
import PlaceholderPage from "@/portail/pages/PlaceholderPage";

describe("PlaceholderPage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<PlaceholderPage />, { route: "/governance" });
    expect(screen.getByText("placeholder.description")).toBeInTheDocument();
  });

  it("displays module name from route path", () => {
    renderWithProviders(<PlaceholderPage />, { route: "/governance" });
    // The page extracts the last path segment and uses it as module name
    // With i18n mocked, t("nav.governance") returns "nav.governance"
    expect(screen.getByText("nav.governance")).toBeInTheDocument();
  });

  it("shows construction icon container", () => {
    renderWithProviders(<PlaceholderPage />, { route: "/monitoring" });
    expect(screen.getByText("nav.monitoring")).toBeInTheDocument();
  });

  it("renders unknown segment as-is when not in map", () => {
    renderWithProviders(<PlaceholderPage />, { route: "/unknown-module" });
    expect(screen.getByText("unknown-module")).toBeInTheDocument();
  });
});

// ==========================================================================
// 2. ConditionsPage
// ==========================================================================
import ConditionsPage from "@/portail/pages/ConditionsPage";

describe("ConditionsPage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<ConditionsPage />);
    expect(screen.getByText("title")).toBeInTheDocument();
  });

  it("displays CGU section titles", () => {
    renderWithProviders(<ConditionsPage />);
    expect(screen.getByText("sections.s1.title")).toBeInTheDocument();
    expect(screen.getByText("sections.s2.title")).toBeInTheDocument();
    expect(screen.getByText("sections.s7.title")).toBeInTheDocument();
  });

  it("has a checkbox for accepting conditions", () => {
    renderWithProviders(<ConditionsPage />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it("has a disabled submit button when checkbox is unchecked", () => {
    renderWithProviders(<ConditionsPage />);
    const button = screen.getByRole("button", { name: "submitButton" });
    expect(button).toBeDisabled();
  });

  it("enables submit button when checkbox is checked", async () => {
    const { user } = renderWithProviders(<ConditionsPage />) as any;
    const checkbox = screen.getByRole("checkbox");
    // Click using fireEvent since userEvent may not be available
    checkbox.click();
    const button = screen.getByRole("button", { name: "submitButton" });
    expect(button).not.toBeDisabled();
  });

  it("displays description text", () => {
    renderWithProviders(<ConditionsPage />);
    expect(screen.getByText("description")).toBeInTheDocument();
  });

  it("displays lastStep label", () => {
    renderWithProviders(<ConditionsPage />);
    expect(screen.getByText("lastStep")).toBeInTheDocument();
  });
});

// ==========================================================================
// 3. OnboardingPage
// ==========================================================================
import OnboardingPage from "@/portail/pages/OnboardingPage";

describe("OnboardingPage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<OnboardingPage />);
    // OnboardingPage should render some form elements
    expect(document.querySelector("input")).toBeTruthy();
  });

  it("displays form fields for organization setup", () => {
    renderWithProviders(<OnboardingPage />);
    // Should have inputs for org name, sector, etc.
    const inputs = document.querySelectorAll("input");
    expect(inputs.length).toBeGreaterThan(0);
  });

  it("has a submit/continue button", () => {
    renderWithProviders(<OnboardingPage />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});

// ==========================================================================
// 4. RoadmapPage
// ==========================================================================
import RoadmapPage from "@/portail/pages/RoadmapPage";

describe("RoadmapPage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<RoadmapPage />);
    // RoadmapPage renders cards with available modules and upcoming features
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("renders module cards", () => {
    renderWithProviders(<RoadmapPage />);
    // Should render links for available modules — look for key-based t() calls
    const links = document.querySelectorAll("a");
    expect(links.length).toBeGreaterThan(0);
  });
});

// ==========================================================================
// 5. ProfilPage
// ==========================================================================
import ProfilPage from "@/portail/pages/ProfilPage";

describe("ProfilPage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<ProfilPage />);
    // Profile page uses useAuth which returns mockAuthValue
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("displays user profile form fields", () => {
    renderWithProviders(<ProfilPage />);
    // Should have input fields for profile editing
    const inputs = document.querySelectorAll("input");
    expect(inputs.length).toBeGreaterThan(0);
  });

  it("renders logout or save buttons", () => {
    renderWithProviders(<ProfilPage />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});

// ==========================================================================
// 6. AdminPage
// ==========================================================================
import AdminPage from "@/portail/pages/AdminPage";

describe("AdminPage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<AdminPage />);
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("renders tabs or sections for organization admin", () => {
    renderWithProviders(<AdminPage />);
    // AdminPage uses Tabs component with org and members tabs
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});

// ==========================================================================
// 7. BillingPage
// ==========================================================================
import BillingPage from "@/portail/pages/BillingPage";

describe("BillingPage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<BillingPage />);
    expect(document.querySelector("div")).toBeTruthy();
  });

  it("displays plan information or pricing", () => {
    renderWithProviders(<BillingPage />);
    // BillingPage shows plans/pricing — with mocked i18n, keys are rendered as-is
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
