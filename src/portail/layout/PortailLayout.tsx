import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppIconRail } from "./AppIconRail";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { getCategoryForPath } from "./nav-config";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { usePageContext } from "@/hooks/usePageContext";
import { useAiChat } from "@/hooks/useAiChat";
import { FloatingChat } from "@/portail/components/FloatingChat";

export function PortailLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  const [activeCategory, setActiveCategory] = useState(() => getCategoryForPath(pathname));
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Auto-sync: when route changes, update active category
  useEffect(() => {
    setActiveCategory(getCategoryForPath(pathname));
  }, [pathname]);

  // When clicking a category in the rail: select it and ensure sidebar is visible
  const handleCategoryChange = (category: string) => {
    if (category === activeCategory) {
      // Toggle sidebar visibility if clicking same category
      setSidebarVisible((v) => !v);
    } else {
      setActiveCategory(category);
      setSidebarVisible(true);
    }
  };

  const pageContext = usePageContext();
  const { messages, sendMessage, isStreaming, error, resetChat } =
    useAiChat(pageContext);

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50/50">
      {/* Desktop: Icon Rail + Detail Sidebar */}
      <div className="hidden lg:flex">
        <AppIconRail
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        {sidebarVisible && (
          <AppSidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            activeCategory={activeCategory}
            filteredMode
          />
        )}
      </div>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-[250px]">
          <AppSidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader
          onMobileMenuToggle={() => setMobileOpen(!mobileOpen)}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <ErrorBoundary key={pathname}>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Floating AI Chat Widget */}
      <FloatingChat
        messages={messages}
        onSend={sendMessage}
        isStreaming={isStreaming}
        error={error}
        onReset={resetChat}
      />
    </div>
  );
}
