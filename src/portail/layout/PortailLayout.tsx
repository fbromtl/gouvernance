import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Target,
  BarChart3,
  User,
  LogOut,
  ChevronLeft,
  Menu,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import LanguageSwitcher from "@/portail/components/LanguageSwitcher";

/* ------------------------------------------------------------------ */
/*  NAV ITEMS                                                          */
/* ------------------------------------------------------------------ */

const navItems = [
  { to: "/portail", labelKey: "nav.dashboard", icon: LayoutDashboard, end: true },
  { to: "/portail/diagnostic", labelKey: "nav.diagnostic", icon: Target, end: false },
  { to: "/portail/resultats", labelKey: "nav.results", icon: BarChart3, end: false },
  { to: "/portail/profil", labelKey: "nav.profile", icon: User, end: false },
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export function PortailLayout() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const { t } = useTranslation("portail");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isActive = (path: string, end: boolean) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const displayName =
    profile?.full_name ??
    user?.user_metadata?.full_name ??
    user?.email ??
    t("common:user");

  const avatarUrl =
    profile?.avatar_url ??
    user?.user_metadata?.avatar_url ??
    user?.user_metadata?.picture ??
    null;

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  /* ---------------------------------------------------------------- */
  /*  SIDEBAR                                                          */
  /* ---------------------------------------------------------------- */

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/logo.svg" alt="Gouvernance IA" className="h-7 w-auto" />
          {sidebarOpen && (
            <span className="text-sm font-bold text-foreground tracking-tight">
              {t("brandName")}
            </span>
          )}
        </Link>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setMobileSidebarOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive(item.to, item.end)
                ? "bg-brand-purple/10 text-brand-purple"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <item.icon className="size-5 shrink-0" />
            {sidebarOpen && <span>{t(item.labelKey)}</span>}
          </Link>
        ))}
      </nav>

      <Separator />

      {/* Back to site */}
      <div className="p-3">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="size-5 shrink-0" />
          {sidebarOpen && <span>{t("backToSite")}</span>}
        </Link>
      </div>
    </div>
  );

  /* ---------------------------------------------------------------- */
  /*  RENDER                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-border/50 bg-card transition-all duration-300 shrink-0",
          sidebarOpen ? "w-64" : "w-[72px]"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border/50 transition-transform duration-300 lg:hidden",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 border-b border-border/50 bg-card/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              type="button"
              className="lg:hidden flex items-center justify-center size-9 rounded-full hover:bg-muted transition-colors"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label={t("openMenu")}
            >
              <Menu className="size-5" />
            </button>

            {/* Desktop collapse toggle */}
            <button
              type="button"
              className="hidden lg:flex items-center justify-center size-9 rounded-full hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={t("collapseMenu")}
            >
              <ChevronLeft
                className={cn(
                  "size-5 transition-transform duration-200",
                  !sidebarOpen && "rotate-180"
                )}
              />
            </button>
          </div>

          {/* User */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium text-foreground leading-tight">
                {displayName}
              </div>
              <div className="text-xs text-muted-foreground">{user?.email}</div>
            </div>

            {/* Avatar */}
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="size-9 rounded-full object-cover border-2 border-border/50"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex size-9 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple text-sm font-bold">
                {initials}
              </div>
            )}

            {/* Sign out */}
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground gap-1.5"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">{t("common:signOutShort")}</span>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
