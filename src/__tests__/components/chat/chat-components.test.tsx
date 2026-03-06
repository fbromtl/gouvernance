import { describe, it, expect, vi, beforeAll } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../mocks/utils";
import type { ChatMessage } from "@/hooks/useAiChat";

// ScrollArea uses ResizeObserver
beforeAll(() => {
  if (typeof globalThis.ResizeObserver === "undefined") {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as any;
  }
});

// Mock the sheet UI components — AiChatPanel uses SheetHeader/SheetTitle/SheetDescription
// outside of a Sheet context, so we provide simple passthrough elements
vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: any) => <div>{children}</div>,
  SheetContent: ({ children }: any) => <div>{children}</div>,
  SheetHeader: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  SheetTitle: ({ children, className }: any) => (
    <h2 className={className}>{children}</h2>
  ),
  SheetDescription: ({ children, className }: any) => (
    <p className={className}>{children}</p>
  ),
  SheetFooter: ({ children }: any) => <div>{children}</div>,
  SheetTrigger: ({ children }: any) => <div>{children}</div>,
  SheetClose: ({ children }: any) => <div>{children}</div>,
}));

// Mock ScrollArea as a simple div since we don't test scroll behavior
vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  ScrollBar: () => null,
}));

// ==========================================================================
// Fixtures
// ==========================================================================

const mockMessages: ChatMessage[] = [
  {
    id: "msg-1",
    role: "user",
    content: "Hello, I need help with governance.",
    timestamp: Date.now() - 60000,
  },
  {
    id: "msg-2",
    role: "assistant",
    content: "I can help you with AI governance questions.",
    timestamp: Date.now() - 30000,
  },
];

// ==========================================================================
// 1. FloatingChat
// ==========================================================================

import { FloatingChat } from "@/portail/components/FloatingChat";

describe("FloatingChat", () => {
  const defaultProps = {
    messages: [] as ChatMessage[],
    onSend: vi.fn(),
    isStreaming: false,
    error: null,
    onReset: vi.fn(),
  };

  it("renders the floating bubble button", () => {
    renderWithProviders(<FloatingChat {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /chat/i }),
    ).toBeInTheDocument();
  });

  it("opens chat panel when bubble is clicked", async () => {
    renderWithProviders(<FloatingChat {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: /chat/i }));
    // Panel header should now be visible
    expect(screen.getByText("title")).toBeInTheDocument();
    expect(screen.getByText("description")).toBeInTheDocument();
  });

  it("displays messages when panel is open", async () => {
    renderWithProviders(
      <FloatingChat {...defaultProps} messages={mockMessages} />,
    );
    await userEvent.click(screen.getByRole("button", { name: /chat/i }));
    expect(
      screen.getByText("Hello, I need help with governance."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("I can help you with AI governance questions."),
    ).toBeInTheDocument();
  });

  it("shows streaming indicator when streaming with empty content", async () => {
    const streamingMessages: ChatMessage[] = [
      ...mockMessages,
      { id: "msg-3", role: "assistant", content: "", timestamp: Date.now() },
    ];
    renderWithProviders(
      <FloatingChat
        {...defaultProps}
        messages={streamingMessages}
        isStreaming={true}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /chat/i }));
    expect(screen.getByText("thinking")).toBeInTheDocument();
  });

  it("shows error message", async () => {
    renderWithProviders(
      <FloatingChat {...defaultProps} error="Connection failed" />,
    );
    await userEvent.click(screen.getByRole("button", { name: /chat/i }));
    expect(screen.getByText("Connection failed")).toBeInTheDocument();
    expect(screen.getByText("retry")).toBeInTheDocument();
  });

  it("disables textarea when streaming", async () => {
    renderWithProviders(
      <FloatingChat {...defaultProps} isStreaming={true} />,
    );
    await userEvent.click(screen.getByRole("button", { name: /chat/i }));
    expect(screen.getByPlaceholderText("placeholder")).toBeDisabled();
  });

  it("shows unread indicator when there are unread assistant messages", () => {
    // Panel is NOT open, and last message is from assistant
    const { container } = renderWithProviders(
      <FloatingChat {...defaultProps} messages={mockMessages} />,
    );
    // The unread dot is a span with bg-green-500
    const dot = container.querySelector(".bg-green-500");
    expect(dot).toBeInTheDocument();
  });
});

// ==========================================================================
// 2. AiChatPanel
// ==========================================================================

import { AiChatPanel } from "@/portail/components/AiChatPanel";

describe("AiChatPanel", () => {
  const defaultProps = {
    messages: [] as ChatMessage[],
    onSend: vi.fn(),
    isStreaming: false,
    error: null,
    onReset: vi.fn(),
  };

  it("renders header with title and description", () => {
    renderWithProviders(<AiChatPanel {...defaultProps} />);
    expect(screen.getByText("title")).toBeInTheDocument();
    expect(screen.getByText("description")).toBeInTheDocument();
  });

  it("renders reset button", () => {
    renderWithProviders(<AiChatPanel {...defaultProps} />);
    expect(screen.getByTitle("newConversation")).toBeInTheDocument();
  });

  it("calls onReset when reset button clicked", async () => {
    const onReset = vi.fn();
    renderWithProviders(<AiChatPanel {...defaultProps} onReset={onReset} />);
    await userEvent.click(screen.getByTitle("newConversation"));
    expect(onReset).toHaveBeenCalled();
  });

  it("renders messages", () => {
    renderWithProviders(
      <AiChatPanel {...defaultProps} messages={mockMessages} />,
    );
    expect(
      screen.getByText("Hello, I need help with governance."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("I can help you with AI governance questions."),
    ).toBeInTheDocument();
  });

  it("shows streaming indicator", () => {
    const streamingMessages: ChatMessage[] = [
      ...mockMessages,
      { id: "msg-3", role: "assistant", content: "", timestamp: Date.now() },
    ];
    renderWithProviders(
      <AiChatPanel
        {...defaultProps}
        messages={streamingMessages}
        isStreaming={true}
      />,
    );
    expect(screen.getByText("thinking")).toBeInTheDocument();
  });

  it("shows error with retry button", () => {
    renderWithProviders(
      <AiChatPanel {...defaultProps} error="Something went wrong" />,
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("retry")).toBeInTheDocument();
  });

  it("renders placeholder text in textarea", () => {
    renderWithProviders(<AiChatPanel {...defaultProps} />);
    expect(screen.getByPlaceholderText("placeholder")).toBeInTheDocument();
  });

  it("disables textarea when streaming", () => {
    renderWithProviders(
      <AiChatPanel {...defaultProps} isStreaming={true} />,
    );
    expect(screen.getByPlaceholderText("placeholder")).toBeDisabled();
  });
});
