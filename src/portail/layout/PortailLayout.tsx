import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppIconRail } from "./AppIconRail";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { BottomTabBar } from "./BottomTabBar";
import { getCategoryForPath } from "./nav-config";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { OfflineBanner } from "@/components/OfflineBanner";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { usePageContext } from "@/hooks/usePageContext";
import { useAiChat } from "@/hooks/useAiChat";
import { FloatingChat } from "@/portail/components/FloatingChat";

export function PortailLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { pathname } = useLocation();

  const [activeCategory, setActiveCategory] = useState(() => getCategoryForPath(pathname));
  const [sidebarVisible, setSidebarVisible] = useState(true);

  useEffect(() => {
    setActiveCategory(getCategoryForPath(pathname));
  }, [pathname]);

  const handleCategoryChange = (category: string) => {
    if (category === activeCategory) {
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

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <PWAInstallPrompt />
        <OfflineBanner />
        <AppHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-4 pb-20 lg:py-8 lg:pb-8">
            <ErrorBoundary key={pathname}>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <BottomTabBar />

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
