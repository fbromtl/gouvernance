import { describe, it, expect, vi, beforeAll } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../mocks/utils";
import type { TemplateDoc, TemplateCategoryInfo } from "@/types/template";

// ScrollArea (Radix) uses ResizeObserver internally
beforeAll(() => {
  if (typeof globalThis.ResizeObserver === "undefined") {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as any;
  }
});

// ==========================================================================
// Fixtures
// ==========================================================================

const mockTemplate: TemplateDoc = {
  id: "tpl-001",
  number: 1,
  title: "Politique de gouvernance IA",
  filename: "politique-gouvernance-ia",
  category: "gouvernance-strategique",
  categoryLabel: "Gouvernance stratégique",
  type: "politique",
  typeLabel: "Politique",
  description: "Document cadre définissant la gouvernance IA de l'organisation",
  frameworks: ["ISO 42001", "EU AI Act", "Loi 25"],
  tags: ["gouvernance", "politique"],
  htmlPath: "/templates/politique-gouvernance-ia.html",
  docxPath: "/templates/politique-gouvernance-ia.docx",
};

const mockTemplate2: TemplateDoc = {
  id: "tpl-002",
  number: 12,
  title: "Registre des systèmes IA",
  filename: "registre-systemes-ia",
  category: "gouvernance-strategique",
  categoryLabel: "Gouvernance stratégique",
  type: "registre",
  typeLabel: "Registre",
  description: "Inventaire complet de tous les systèmes IA",
  frameworks: ["ISO 42001"],
  tags: ["registre", "inventaire"],
  htmlPath: "/templates/registre-systemes-ia.html",
  docxPath: "/templates/registre-systemes-ia.docx",
};

const mockCategories: TemplateCategoryInfo[] = [
  { slug: "gouvernance-strategique", label: "Gouvernance stratégique", count: 5, icon: "Building2" },
  { slug: "ethique-valeurs", label: "Éthique et valeurs", count: 3, icon: "Heart" },
  { slug: "gestion-risques", label: "Gestion des risques", count: 2, icon: "AlertTriangle" },
];

// ==========================================================================
// 1. TemplateCard
// ==========================================================================

import { TemplateCard } from "@/portail/components/templates/TemplateCard";

describe("TemplateCard", () => {
  it("renders template title and description", () => {
    renderWithProviders(
      <TemplateCard template={mockTemplate} onClick={vi.fn()} />,
    );
    expect(screen.getByText("Politique de gouvernance IA")).toBeInTheDocument();
    expect(
      screen.getByText("Document cadre définissant la gouvernance IA de l'organisation"),
    ).toBeInTheDocument();
  });

  it("renders number badge", () => {
    renderWithProviders(
      <TemplateCard template={mockTemplate} onClick={vi.fn()} />,
    );
    expect(screen.getByText("#01")).toBeInTheDocument();
  });

  it("renders number with leading zero for single digits", () => {
    renderWithProviders(
      <TemplateCard template={mockTemplate2} onClick={vi.fn()} />,
    );
    expect(screen.getByText("#12")).toBeInTheDocument();
  });

  it("renders category label badge", () => {
    renderWithProviders(
      <TemplateCard template={mockTemplate} onClick={vi.fn()} />,
    );
    expect(screen.getByText("Gouvernance stratégique")).toBeInTheDocument();
  });

  it("renders first 2 frameworks", () => {
    renderWithProviders(
      <TemplateCard template={mockTemplate} onClick={vi.fn()} />,
    );
    expect(screen.getByText("ISO 42001")).toBeInTheDocument();
    expect(screen.getByText("EU AI Act")).toBeInTheDocument();
  });

  it("shows +N for extra frameworks beyond 2", () => {
    renderWithProviders(
      <TemplateCard template={mockTemplate} onClick={vi.fn()} />,
    );
    // 3 frameworks, showing 2, so +1
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    renderWithProviders(
      <TemplateCard template={mockTemplate} onClick={onClick} />,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledWith(mockTemplate);
  });
});

// ==========================================================================
// 2. TemplatePreviewSheet
// ==========================================================================

import { TemplatePreviewSheet } from "@/portail/components/templates/TemplatePreviewSheet";

describe("TemplatePreviewSheet", () => {
  it("renders nothing visible when closed", () => {
    renderWithProviders(
      <TemplatePreviewSheet
        template={mockTemplate}
        open={false}
        onOpenChange={vi.fn()}
      />,
    );
    expect(screen.queryByText("Politique de gouvernance IA")).not.toBeInTheDocument();
  });

  it("renders template info when open", () => {
    renderWithProviders(
      <TemplatePreviewSheet
        template={mockTemplate}
        open={true}
        onOpenChange={vi.fn()}
      />,
    );
    expect(screen.getByText(/Politique de gouvernance IA/)).toBeInTheDocument();
    expect(screen.getByText("Gouvernance stratégique")).toBeInTheDocument();
    expect(screen.getByText("Politique")).toBeInTheDocument();
  });

  it("renders download button", () => {
    renderWithProviders(
      <TemplatePreviewSheet
        template={mockTemplate}
        open={true}
        onOpenChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Télécharger DOCX")).toBeInTheDocument();
  });

  it("renders disabled customization button", () => {
    renderWithProviders(
      <TemplatePreviewSheet
        template={mockTemplate}
        open={true}
        onOpenChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Démarrer la personnalisation")).toBeInTheDocument();
  });

  it("renders framework badges", () => {
    renderWithProviders(
      <TemplatePreviewSheet
        template={mockTemplate}
        open={true}
        onOpenChange={vi.fn()}
      />,
    );
    expect(screen.getByText("ISO 42001")).toBeInTheDocument();
    expect(screen.getByText("EU AI Act")).toBeInTheDocument();
    expect(screen.getByText("Loi 25")).toBeInTheDocument();
  });
});

// ==========================================================================
// 3. TemplateSidebar
// ==========================================================================

import { TemplateSidebar } from "@/portail/components/templates/TemplateSidebar";

describe("TemplateSidebar", () => {
  it("renders 'All templates' button", () => {
    renderWithProviders(
      <TemplateSidebar
        categories={mockCategories}
        activeCategory={null}
        onSelect={vi.fn()}
        totalCount={10}
      />,
    );
    expect(screen.getByText("Tous les modeles")).toBeInTheDocument();
  });

  it("renders total count", () => {
    renderWithProviders(
      <TemplateSidebar
        categories={mockCategories}
        activeCategory={null}
        onSelect={vi.fn()}
        totalCount={10}
      />,
    );
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("renders all category labels", () => {
    renderWithProviders(
      <TemplateSidebar
        categories={mockCategories}
        activeCategory={null}
        onSelect={vi.fn()}
        totalCount={10}
      />,
    );
    expect(screen.getByText("Gouvernance stratégique")).toBeInTheDocument();
    expect(screen.getByText("Éthique et valeurs")).toBeInTheDocument();
    expect(screen.getByText("Gestion des risques")).toBeInTheDocument();
  });

  it("renders category counts", () => {
    renderWithProviders(
      <TemplateSidebar
        categories={mockCategories}
        activeCategory={null}
        onSelect={vi.fn()}
        totalCount={10}
      />,
    );
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("highlights 'All' when no category selected", () => {
    renderWithProviders(
      <TemplateSidebar
        categories={mockCategories}
        activeCategory={null}
        onSelect={vi.fn()}
        totalCount={10}
      />,
    );
    const allBtn = screen.getByText("Tous les modeles").closest("button");
    expect(allBtn).toHaveClass("bg-brand-forest/10");
  });

  it("highlights active category", () => {
    renderWithProviders(
      <TemplateSidebar
        categories={mockCategories}
        activeCategory="ethique-valeurs"
        onSelect={vi.fn()}
        totalCount={10}
      />,
    );
    const catBtn = screen.getByText("Éthique et valeurs").closest("button");
    expect(catBtn).toHaveClass("bg-brand-forest/10");
  });

  it("calls onSelect with null when 'All' clicked", async () => {
    const onSelect = vi.fn();
    renderWithProviders(
      <TemplateSidebar
        categories={mockCategories}
        activeCategory="ethique-valeurs"
        onSelect={onSelect}
        totalCount={10}
      />,
    );
    await userEvent.click(screen.getByText("Tous les modeles"));
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it("calls onSelect with category slug when category clicked", async () => {
    const onSelect = vi.fn();
    renderWithProviders(
      <TemplateSidebar
        categories={mockCategories}
        activeCategory={null}
        onSelect={onSelect}
        totalCount={10}
      />,
    );
    await userEvent.click(screen.getByText("Gestion des risques"));
    expect(onSelect).toHaveBeenCalledWith("gestion-risques");
  });
});
