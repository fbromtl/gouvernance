import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../mocks/utils";

vi.mock("@/hooks/useBugReports", () => ({
  useCreateBugReport: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  })),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

import BugReportDialog from "@/portail/components/BugReportDialog";

describe("BugReportDialog", () => {
  it("does not render content when closed", () => {
    renderWithProviders(
      <BugReportDialog open={false} onOpenChange={vi.fn()} />,
    );
    expect(screen.queryByText("Signaler un bug")).not.toBeInTheDocument();
  });

  it("renders dialog with form fields when open", () => {
    renderWithProviders(
      <BugReportDialog open={true} onOpenChange={vi.fn()} />,
    );
    expect(screen.getByText("Signaler un bug")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Résumé du problème")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Décrivez le bug rencontré...")).toBeInTheDocument();
  });

  it("calls onOpenChange(false) when cancel is clicked", async () => {
    const onOpenChange = vi.fn();
    renderWithProviders(
      <BugReportDialog open={true} onOpenChange={onOpenChange} />,
    );
    await userEvent.click(screen.getByText("Annuler"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("pre-fills page URL with current pathname", () => {
    renderWithProviders(
      <BugReportDialog open={true} onOpenChange={vi.fn()} />,
      { route: "/dashboard" },
    );
    const pageInput = screen.getByDisplayValue("/dashboard");
    expect(pageInput).toBeInTheDocument();
  });
});
