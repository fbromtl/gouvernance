import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { usePageContext } from "@/hooks/usePageContext";
import { useAiChat } from "@/hooks/useAiChat";
import { AiChatPanel } from "@/portail/components/AiChatPanel";

export function PortailLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const { pathname } = useLocation();

  const pageContext = usePageContext();
  const { messages, sendMessage, isStreaming, error, resetChat } =
    useAiChat(pageContext);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-[250px]">
          <AppSidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* AI Chat panel */}
      <Sheet open={aiOpen} onOpenChange={setAiOpen}>
        <SheetContent
          side="right"
          className="w-[420px] sm:max-w-[420px] p-0"
          showCloseButton={false}
        >
          <AiChatPanel
            messages={messages}
            onSend={sendMessage}
            isStreaming={isStreaming}
            error={error}
            onReset={resetChat}
          />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader
          onMobileMenuToggle={() => setMobileOpen(!mobileOpen)}
          onAiToggle={() => setAiOpen(!aiOpen)}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <ErrorBoundary key={pathname}>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
