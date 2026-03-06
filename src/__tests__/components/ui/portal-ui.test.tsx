import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../mocks/utils";
import { PortalCard } from "@/portail/components/ui/PortalCard";
import { PortalCardHeader } from "@/portail/components/ui/PortalCardHeader";
import { PortalChartContainer } from "@/portail/components/ui/PortalChartContainer";
import { PortalKPI } from "@/portail/components/ui/PortalKPI";
import { Shield } from "lucide-react";

// ==========================================================================
// PortalCard
// ==========================================================================

describe("PortalCard", () => {
  it("renders children", () => {
    renderWithProviders(<PortalCard>Hello Card</PortalCard>);
    expect(screen.getByText("Hello Card")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(
      <PortalCard className="custom-class">Content</PortalCard>,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("applies hover styles by default", () => {
    const { container } = renderWithProviders(
      <PortalCard>Content</PortalCard>,
    );
    expect(container.firstChild).toHaveClass("hover:shadow-lg");
  });

  it("disables hover when hoverable=false", () => {
    const { container } = renderWithProviders(
      <PortalCard hoverable={false}>Content</PortalCard>,
    );
    expect(container.firstChild).not.toHaveClass("hover:shadow-lg");
  });
});

// ==========================================================================
// PortalCardHeader
// ==========================================================================

describe("PortalCardHeader", () => {
  it("renders title text", () => {
    renderWithProviders(<PortalCardHeader>My Title</PortalCardHeader>);
    expect(screen.getByText("My Title")).toBeInTheDocument();
  });

  it("renders action slot", () => {
    renderWithProviders(
      <PortalCardHeader action={<button>Click</button>}>
        Title
      </PortalCardHeader>,
    );
    expect(screen.getByRole("button", { name: "Click" })).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(
      <PortalCardHeader className="my-custom">Header</PortalCardHeader>,
    );
    expect(container.firstChild).toHaveClass("my-custom");
  });

  it("renders header in uppercase tracking style", () => {
    renderWithProviders(<PortalCardHeader>Stats</PortalCardHeader>);
    const h3 = screen.getByText("Stats");
    expect(h3.tagName).toBe("H3");
    expect(h3).toHaveClass("uppercase");
  });
});

// ==========================================================================
// PortalChartContainer
// ==========================================================================

describe("PortalChartContainer", () => {
  it("renders title and children", () => {
    renderWithProviders(
      <PortalChartContainer title="Risk Chart">
        <div>Chart Content</div>
      </PortalChartContainer>,
    );
    expect(screen.getByText("Risk Chart")).toBeInTheDocument();
    expect(screen.getByText("Chart Content")).toBeInTheDocument();
  });

  it("renders action slot", () => {
    renderWithProviders(
      <PortalChartContainer title="Title" action={<span>75%</span>}>
        <div />
      </PortalChartContainer>,
    );
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("applies default minHeight", () => {
    const { container } = renderWithProviders(
      <PortalChartContainer title="Chart">
        <div />
      </PortalChartContainer>,
    );
    expect(container.firstChild).toHaveStyle({ minHeight: "320px" });
  });

  it("applies custom minHeight", () => {
    const { container } = renderWithProviders(
      <PortalChartContainer title="Chart" minHeight="400px">
        <div />
      </PortalChartContainer>,
    );
    expect(container.firstChild).toHaveStyle({ minHeight: "400px" });
  });
});

// ==========================================================================
// PortalKPI
// ==========================================================================

describe("PortalKPI", () => {
  const baseProps = {
    icon: Shield,
    label: "Total Systems",
    value: "42",
    color: "text-brand-forest",
    bgColor: "bg-brand-forest/10",
  };

  it("renders label and value", () => {
    renderWithProviders(<PortalKPI {...baseProps} />);
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Total Systems")).toBeInTheDocument();
  });

  it("renders without link when no href", () => {
    const { container } = renderWithProviders(<PortalKPI {...baseProps} />);
    expect(container.querySelector("a")).toBeNull();
  });

  it("renders as a link when href is provided", () => {
    renderWithProviders(<PortalKPI {...baseProps} href="/ai-systems" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/ai-systems");
  });

  it("renders up trend icon", () => {
    const { container } = renderWithProviders(
      <PortalKPI {...baseProps} trend="up" />,
    );
    // TrendingUp icon renders an SVG
    const svgs = container.querySelectorAll("svg");
    // Should have the KPI icon + trend icon = 2 SVGs
    expect(svgs.length).toBe(2);
  });

  it("renders down trend icon", () => {
    const { container } = renderWithProviders(
      <PortalKPI {...baseProps} trend="down" />,
    );
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(2);
  });

  it("renders no trend icon when trend is null", () => {
    const { container } = renderWithProviders(
      <PortalKPI {...baseProps} trend={null} />,
    );
    const svgs = container.querySelectorAll("svg");
    // Only the main icon, no trend icon
    expect(svgs.length).toBe(1);
  });
});
