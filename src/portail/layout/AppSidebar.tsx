import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { Permission } from "@/lib/permissions";
import {
  LayoutDashboard,
  Bot,
  Shield,
  AlertTriangle,
  ClipboardCheck,
  Scale,
  AlertCircle,
  Eye,
  RefreshCw,
  FileText,
  Activity,
  Database,
  Building2,
  CheckCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

interface NavItem {
  key: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
  ready?: boolean; // true = module built, false/undefined = placeholder
}

interface NavGroup {
  labelKey: string;
  items: NavItem[];
}

/* ------------------------------------------------------------------ */
/*  NAV CONFIG                                                         */
/* ------------------------------------------------------------------ */

const navGroups: NavGroup[] = [
  {
    labelKey: "sections.overview",
    items: [
      {
        key: "dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
        ready: true,
      },
    ],
  },
  {
    labelKey: "sections.inventory",
    items: [
      {
        key: "aiSystems",
        path: "/ai-systems",
        icon: Bot,
        ready: true,
      },
      {
        key: "lifecycle",
        path: "/lifecycle",
        icon: RefreshCw,
      },
      {
        key: "vendors",
        path: "/vendors",
        icon: Building2,
        permission: "manage_vendors",
      },
    ],
  },
  {
    labelKey: "sections.governance",
    items: [
      {
        key: "governance",
        path: "/governance",
        icon: Shield,
        permission: "manage_policies",
        ready: true,
      },
      {
        key: "decisions",
        path: "/decisions",
        icon: ClipboardCheck,
        permission: "approve_decisions",
      },
      {
        key: "compliance",
        path: "/compliance",
        icon: CheckCircle,
        permission: "manage_compliance",
      },
      {
        key: "documents",
        path: "/documents",
        icon: FileText,
      },
    ],
  },
  {
    labelKey: "sections.risks",
    items: [
      {
        key: "risks",
        path: "/risks",
        icon: AlertTriangle,
        permission: "assess_risks",
        ready: true,
      },
      {
        key: "incidents",
        path: "/incidents",
        icon: AlertCircle,
        ready: true,
      },
      {
        key: "bias",
        path: "/bias",
        icon: Scale,
        permission: "manage_bias",
      },
    ],
  },
  {
    labelKey: "sections.operations",
    items: [
      {
        key: "transparency",
        path: "/transparency",
        icon: Eye,
      },
      {
        key: "monitoring",
        path: "/monitoring",
        icon: Activity,
        permission: "configure_monitoring",
      },
      {
        key: "data",
        path: "/data",
        icon: Database,
      },
    ],
  },
];

const settingsItems: NavItem[] = [
  {
    key: "admin",
    path: "/admin",
    icon: Settings,
    permission: "manage_organization",
    ready: true,
  },
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const { t } = useTranslation("portail");
  const location = useLocation();
  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  /* ------ render a single nav link ------ */
  function renderItem(item: NavItem) {
    const Icon = item.icon;
    const active = isActive(item.path);
    const isPlaceholder = !item.ready;

    const linkContent = (
      <Link
        to={item.path}
        className={cn(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150",
          active
            ? "bg-brand-purple/10 text-brand-purple"
            : isPlaceholder
              ? "text-muted-foreground/50 hover:bg-muted/50 hover:text-muted-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          collapsed && "justify-center px-2"
        )}
      >
        {/* Active indicator bar */}
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-brand-purple" />
        )}

        <Icon
          className={cn(
            "h-4 w-4 shrink-0 transition-colors",
            active && "text-brand-purple"
          )}
        />

        {!collapsed && (
          <>
            <span className="flex-1 truncate">{t(`nav.${item.key}`)}</span>
            {isPlaceholder && (
              <Badge
                variant="outline"
                className="ml-auto h-[18px] px-1.5 text-[9px] font-medium uppercase tracking-wide border-muted-foreground/20 text-muted-foreground/50"
              >
                {t("soon")}
              </Badge>
            )}
          </>
        )}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.key}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {t(`nav.${item.key}`)}
            {isPlaceholder && (
              <span className="text-[10px] text-muted-foreground">
                ({t("soon")})
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return <div key={item.key}>{linkContent}</div>;
  }

  /* ------ render a nav group ------ */
  function renderGroup(group: NavGroup, idx: number) {
    const visibleItems = group.items;
    if (visibleItems.length === 0) return null;

    return (
      <div key={idx} className="space-y-0.5">
        {!collapsed && (
          <div className="px-3 pt-4 pb-1.5 first:pt-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
              {t(group.labelKey)}
            </span>
          </div>
        )}
        {collapsed && idx > 0 && (
          <div className="mx-2 my-2 border-t border-border/50" />
        )}
        {visibleItems.map(renderItem)}
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col border-r bg-card/80 backdrop-blur-sm transition-all duration-200",
          collapsed ? "w-[60px]" : "w-[250px]"
        )}
      >
        {/* ---- Brand Header ---- */}
        <div
          className={cn(
            "flex items-center gap-2.5 border-b px-3 h-14",
            collapsed && "justify-center"
          )}
        >
          <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-brand-purple to-brand-purple/70 flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm tracking-tight truncate">
                {t("brandName")}
              </span>
              <span className="text-[10px] text-muted-foreground/60 -mt-0.5">
                {t("brandTagline")}
              </span>
            </div>
          )}
        </div>

        {/* ---- Navigation ---- */}
        <ScrollArea className="flex-1 py-1">
          <nav className="flex flex-col px-2">
            {navGroups.map(renderGroup)}

            {/* Settings section */}
            {(() => {
              const visibleSettings = settingsItems;
              if (visibleSettings.length === 0) return null;
              return (
                <div className="space-y-0.5">
                  {!collapsed && (
                    <div className="px-3 pt-4 pb-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
                        {t("sections.settings")}
                      </span>
                    </div>
                  )}
                  {collapsed && (
                    <div className="mx-2 my-2 border-t border-border/50" />
                  )}
                  {visibleSettings.map(renderItem)}
                </div>
              );
            })()}
          </nav>
        </ScrollArea>

        {/* ---- Footer ---- */}
        <div className="border-t p-2 space-y-1">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-muted-foreground/70 hover:text-foreground transition-colors",
              collapsed && "justify-center px-2"
            )}
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && <span>{t("backToSite")}</span>}
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              "w-full h-8 text-muted-foreground/60 hover:text-foreground",
              collapsed && "px-0"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="ml-2 text-xs">{t("collapseMenu")}</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
