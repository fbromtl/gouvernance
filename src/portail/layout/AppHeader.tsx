import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/auth";
import { useNotifications } from "@/hooks/useNotifications";
import { Bell, Menu, LogOut, User, Settings, Check, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import LanguageSwitcher from "@/portail/components/LanguageSwitcher";
import { Link, useNavigate, useLocation } from "react-router-dom";

interface AppHeaderProps {
  onMobileMenuToggle: () => void;
  onAiToggle?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Relative time helper                                                */
/* ------------------------------------------------------------------ */

function timeAgo(dateStr: string, t: (k: string, opts?: any) => string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return t("timeAgo.justNow");
  if (minutes < 60) return t("timeAgo.minutes", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("timeAgo.hours", { count: hours });
  const days = Math.floor(hours / 24);
  return t("timeAgo.days", { count: days });
}

/* ------------------------------------------------------------------ */
/*  Notification type → dot color                                       */
/* ------------------------------------------------------------------ */

const DOT_COLOR: Record<string, string> = {
  alert: "bg-red-500",
  escalation: "bg-red-500",
  approval_request: "bg-orange-500",
  reminder: "bg-blue-500",
  info: "bg-gray-400",
};

/* ------------------------------------------------------------------ */
/*  Breadcrumb route mapping                                            */
/* ------------------------------------------------------------------ */

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "nav.dashboard",
  "ai-systems": "nav.aiSystems",
  lifecycle: "nav.lifecycle",
  vendors: "nav.vendors",
  governance: "nav.governance",
  decisions: "nav.decisions",
  compliance: "nav.compliance",
  documents: "nav.documents",
  risks: "nav.risks",
  incidents: "nav.incidents",
  bias: "nav.bias",
  transparency: "nav.transparency",
  monitoring: "nav.monitoring",
  data: "nav.data",
  roadmap: "nav.roadmap",
  admin: "nav.admin",
  profile: "nav.profile",
};

export function AppHeader({ onMobileMenuToggle, onAiToggle }: AppHeaderProps) {
  const { t } = useTranslation("portail");
  const { t: tc } = useTranslation("common");
  const { profile, signOut } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  /* ---- Breadcrumb segments ---- */
  const segments = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => {
    const path = "/" + segments.slice(0, i + 1).join("/");
    const labelKey = ROUTE_LABELS[seg];
    const label = labelKey ? t(labelKey) : seg;
    return { path, label, isLast: i === segments.length - 1 };
  });

  return (
    <header className="flex items-center justify-between border-b border-border/60 bg-card px-4 lg:px-6 h-14 shrink-0">
      {/* Left section: mobile menu + breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden shrink-0 h-8 w-8"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumbs — desktop only */}
        <nav className="hidden lg:flex items-center gap-1 text-sm min-w-0" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <div key={crumb.path} className="flex items-center gap-1 min-w-0">
              {i > 0 && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-foreground/25" />
              )}
              {crumb.isLast ? (
                <span className="font-semibold text-foreground truncate">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="text-foreground/50 hover:text-foreground transition-colors truncate"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Right section: actions */}
      <div className="flex items-center gap-1">
        <LanguageSwitcher />

        {onAiToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onAiToggle}
            className="h-8 w-8 text-foreground/50 hover:text-brand-purple"
            title={t("aiAssistant", { defaultValue: "Assistant IA" })}
          >
            <Sparkles className="h-4 w-4" />
          </Button>
        )}

        {/* Notifications */}
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8 text-foreground/50 hover:text-foreground">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-purple px-1 text-[10px] font-bold text-white shadow-sm shadow-brand-purple/30">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-semibold">{t("notifications")}</span>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto px-2 py-1 text-xs text-brand-purple hover:text-brand-purple"
                  onClick={() => markAllAsRead()}
                >
                  <Check className="mr-1 h-3 w-3" />
                  {t("markAllRead")}
                </Button>
              )}
            </div>
            <Separator />

            {/* Notification list */}
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="h-8 w-8 text-foreground/15 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {t("noNotifications")}
                </p>
              </div>
            ) : (
              <ScrollArea className="max-h-80">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                      !n.read ? "bg-brand-purple/[0.03]" : ""
                    }`}
                    onClick={() => {
                      if (!n.read) markAsRead(n.id);
                      if (n.link) navigate(n.link);
                      setPopoverOpen(false);
                    }}
                  >
                    {/* Colored dot */}
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        DOT_COLOR[n.type] ?? "bg-gray-400"
                      }`}
                    />
                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm leading-tight ${!n.read ? "font-semibold" : ""}`}>
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {n.body}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-muted-foreground/60">
                        {timeAgo(n.created_at, t)}
                      </p>
                    </div>
                  </button>
                ))}
              </ScrollArea>
            )}
          </PopoverContent>
        </Popover>

        {/* Separator */}
        <div className="h-5 w-px bg-border/60 mx-1.5 hidden sm:block" />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 h-8">
              <Avatar className="h-7 w-7">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs font-semibold bg-brand-purple/10 text-brand-purple">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline-block max-w-[120px] truncate">
                {profile?.full_name ?? tc("user")}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 shadow-lg">
            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {t("nav.profile")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t("nav.admin")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 text-destructive">
              <LogOut className="h-4 w-4" />
              {tc("signOutShort")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
