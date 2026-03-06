import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../mocks/utils";
import { mockDocuments } from "../../mocks/fixtures/documents";

// ==========================================================================
// 1. FileCard
// ==========================================================================

import { FileCard } from "@/portail/components/drive/FileCard";

describe("FileCard", () => {
  const baseDoc = mockDocuments[0]; // PDF doc with title, summary, category

  it("renders document title", () => {
    renderWithProviders(
      <FileCard document={baseDoc} onView={vi.fn()} />,
    );
    expect(screen.getByText(baseDoc.title)).toBeInTheDocument();
  });

  it("renders file extension and size", () => {
    renderWithProviders(
      <FileCard document={baseDoc} onView={vi.fn()} />,
    );
    // PDF extension shown uppercase
    expect(screen.getByText(/PDF/)).toBeInTheDocument();
  });

  it("renders summary when available", () => {
    renderWithProviders(
      <FileCard document={baseDoc} onView={vi.fn()} />,
    );
    expect(
      screen.getByText(baseDoc.summary!),
    ).toBeInTheDocument();
  });

  it("renders category badge", () => {
    renderWithProviders(
      <FileCard document={baseDoc} onView={vi.fn()} />,
    );
    expect(
      screen.getByText(`drive.categories.${baseDoc.category}`),
    ).toBeInTheDocument();
  });

  it("calls onView when clicked", async () => {
    const onView = vi.fn();
    renderWithProviders(
      <FileCard document={baseDoc} onView={onView} />,
    );
    // Click the card (the outer div)
    const card = screen.getByText(baseDoc.title).closest("div[class*='cursor-pointer']");
    if (card) fireEvent.click(card);
    expect(onView).toHaveBeenCalledWith(baseDoc);
  });

  it("renders status badge", () => {
    renderWithProviders(
      <FileCard document={baseDoc} onView={vi.fn()} />,
    );
    expect(screen.getByText(`statuses.${baseDoc.status}`)).toBeInTheDocument();
  });

  it("renders date", () => {
    renderWithProviders(
      <FileCard document={baseDoc} onView={vi.fn()} />,
    );
    // The date is formatted as fr-CA locale: YYYY-MM-DD
    expect(screen.getByText("2025-02-15")).toBeInTheDocument();
  });
});

// ==========================================================================
// 2. DropZone
// ==========================================================================

import { DropZone } from "@/portail/components/drive/DropZone";

describe("DropZone", () => {
  it("renders default (full) drop zone", () => {
    renderWithProviders(<DropZone onFilesSelected={vi.fn()} />);
    expect(screen.getByText("drive.dropTitle")).toBeInTheDocument();
    expect(screen.getByText("drive.dropSubtitle")).toBeInTheDocument();
  });

  it("renders browse button", () => {
    renderWithProviders(<DropZone onFilesSelected={vi.fn()} />);
    expect(screen.getByText("drive.browse")).toBeInTheDocument();
  });

  it("renders compact mode", () => {
    renderWithProviders(
      <DropZone onFilesSelected={vi.fn()} compact />,
    );
    expect(screen.getByText("drive.dropCompact")).toBeInTheDocument();
  });

  it("shows uploading state", () => {
    renderWithProviders(
      <DropZone onFilesSelected={vi.fn()} isUploading />,
    );
    expect(screen.getByText("drive.uploading")).toBeInTheDocument();
  });

  it("hides browse button during upload", () => {
    renderWithProviders(
      <DropZone onFilesSelected={vi.fn()} isUploading />,
    );
    expect(screen.queryByText("drive.browse")).not.toBeInTheDocument();
  });

  it("shows compact uploading state", () => {
    renderWithProviders(
      <DropZone onFilesSelected={vi.fn()} compact isUploading />,
    );
    expect(screen.getByText("drive.uploading")).toBeInTheDocument();
  });
});

// ==========================================================================
// 3. CategorySidebar
// ==========================================================================

import { CategorySidebar } from "@/portail/components/drive/CategorySidebar";

describe("CategorySidebar", () => {
  const defaultProps = {
    selectedCategory: null,
    selectedSubcategory: null,
    onSelect: vi.fn(),
    counts: { __all__: 10, __uncategorized__: 3, policies: 5 },
  };

  it("renders 'All documents' button", () => {
    renderWithProviders(<CategorySidebar {...defaultProps} />);
    expect(screen.getByText("drive.allDocuments")).toBeInTheDocument();
  });

  it("renders 'Uncategorized' button", () => {
    renderWithProviders(<CategorySidebar {...defaultProps} />);
    expect(screen.getByText("drive.uncategorized")).toBeInTheDocument();
  });

  it("renders total count", () => {
    renderWithProviders(<CategorySidebar {...defaultProps} />);
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("renders uncategorized count", () => {
    renderWithProviders(<CategorySidebar {...defaultProps} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("highlights selected category", () => {
    renderWithProviders(
      <CategorySidebar
        {...defaultProps}
        selectedCategory={null}
      />,
    );
    const allDocsButton = screen.getByText("drive.allDocuments").closest("button");
    expect(allDocsButton).toHaveClass("bg-brand-forest/10");
  });

  it("calls onSelect when 'All documents' clicked", async () => {
    const onSelect = vi.fn();
    renderWithProviders(
      <CategorySidebar
        {...defaultProps}
        selectedCategory="policies"
        onSelect={onSelect}
      />,
    );
    const allDocsButton = screen.getByText("drive.allDocuments");
    await userEvent.click(allDocsButton);
    expect(onSelect).toHaveBeenCalledWith(null, null);
  });
});

// ==========================================================================
// 4. FileDetail
// ==========================================================================

import { FileDetail } from "@/portail/components/drive/FileDetail";

describe("FileDetail", () => {
  it("renders nothing when document is null (sheet closed)", () => {
    const { container } = renderWithProviders(
      <FileDetail document={null} onClose={vi.fn()} />,
    );
    // Sheet should not render content when document is null
    // It may still render the sheet container
    expect(screen.queryByText("Classification")).not.toBeInTheDocument();
  });

  it("renders document details when document provided", () => {
    const doc = mockDocuments[0];
    renderWithProviders(
      <FileDetail document={doc} onClose={vi.fn()} />,
    );
    expect(screen.getByText(doc.title)).toBeInTheDocument();
    expect(screen.getByText("Classification")).toBeInTheDocument();
  });

  it("renders tags when available", () => {
    const doc = mockDocuments[0]; // has tags: ["loi25", "efvp", "chatbot"]
    renderWithProviders(
      <FileDetail document={doc} onClose={vi.fn()} />,
    );
    expect(screen.getByText("loi25")).toBeInTheDocument();
    expect(screen.getByText("efvp")).toBeInTheDocument();
    expect(screen.getByText("chatbot")).toBeInTheDocument();
  });

  it("renders download button when onDownload provided and file has URL", () => {
    const doc = mockDocuments[0]; // has file_url
    renderWithProviders(
      <FileDetail
        document={doc}
        onClose={vi.fn()}
        onDownload={vi.fn()}
      />,
    );
    expect(screen.getByText("download")).toBeInTheDocument();
  });

  it("renders edit button when onEdit provided and not readOnly", () => {
    const doc = mockDocuments[0];
    renderWithProviders(
      <FileDetail
        document={doc}
        onClose={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByText("edit")).toBeInTheDocument();
  });

  it("hides edit and delete in readOnly mode", () => {
    const doc = mockDocuments[0];
    renderWithProviders(
      <FileDetail
        document={doc}
        onClose={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        readOnly
      />,
    );
    expect(screen.queryByText("edit")).not.toBeInTheDocument();
    expect(screen.queryByText("delete")).not.toBeInTheDocument();
  });
});

// ==========================================================================
// 5. ClassificationReview
// ==========================================================================

import { ClassificationReview } from "@/portail/components/drive/ClassificationReview";

describe("ClassificationReview", () => {
  it("does not render when open is false", () => {
    renderWithProviders(
      <ClassificationReview
        files={[]}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        open={false}
      />,
    );
    expect(screen.queryByText("drive.classificationTitle")).not.toBeInTheDocument();
  });

  it("renders dialog when open", () => {
    renderWithProviders(
      <ClassificationReview
        files={[]}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        open={true}
      />,
    );
    expect(screen.getByText("drive.classificationTitle")).toBeInTheDocument();
  });

  it("shows analyzing message when files are being analyzed", () => {
    const files = [
      {
        document: mockDocuments[0],
        storagePath: "path/file.pdf",
        analysis: null,
        isAnalyzing: true,
        error: null,
      },
    ];
    renderWithProviders(
      <ClassificationReview
        files={files as any}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        open={true}
      />,
    );
    expect(screen.getByText("drive.classificationAnalyzing")).toBeInTheDocument();
  });

  it("shows error state for failed analysis", () => {
    const files = [
      {
        document: mockDocuments[0],
        storagePath: "path/file.pdf",
        analysis: null,
        isAnalyzing: false,
        error: "Analysis failed",
      },
    ];
    renderWithProviders(
      <ClassificationReview
        files={files as any}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        open={true}
      />,
    );
    expect(screen.getByText("Analysis failed")).toBeInTheDocument();
  });
});
