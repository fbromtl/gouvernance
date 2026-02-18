import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import type { Permission } from "@/lib/permissions";
import {
  LayoutDashboard, Bot, Users, AlertTriangle, ClipboardList,
  Scale, AlertCircle, Eye, RefreshCw, FileText, Activity,
  Database, Building2, CheckCircle, Settings, ChevronLeft,
  ChevronRight, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  key: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
  section: "main" | "modules" | "settings";
}

const navItems: NavItem[] = [
  { key: "dashboard", path: "/dashboard", icon: LayoutDashboard, section: "main" },
  { key: "aiSystems", path: "/ai-systems", icon: Bot, section: "modules" },
  { key: "governance", path: "/governance", icon: Users, section: "modules", permission: "manage_policies" },
  { key: "risks", path: "/risks", icon: AlertTriangle, section: "modules", permission: "assess_risks" },
  { key: "decisions", path: "/decisions", icon: ClipboardList, section: "modules", permission: "approve_decisions" },
  { key: "bias", path: "/bias", icon: Scale, section: "modules", permission: "manage_bias" },
  { key: "incidents", path: "/incidents", icon: AlertCircle, section: "modules" },
  { key: "transparency", path: "/transparency", icon: Eye, section: "modules" },
  { key: "lifecycle", path: "/lifecycle", icon: RefreshCw, section: "modules" },
  { key: "documents", path: "/documents", icon: FileText, section: "modules" },
  { key: "monitoring", path: "/monitoring", icon: Activity, section: "modules", permission: "configure_monitoring" },
  { key: "data", path: "/data", icon: Database, section: "modules" },
  { key: "vendors", path: "/vendors", icon: Building2, section: "modules", permission: "manage_vendors" },
  { key: "compliance", path: "/compliance", icon: CheckCircle, section: "modules", permission: "manage_compliance" },
  { key: "admin", path: "/admin", icon: Settings, section: "settings", permission: "manage_organization" },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const { t } = useTranslation("portail");
  const location = useLocation();
  const { can } = usePermissions();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const renderSection = (section: "main" | "modules" | "settings") => {
    const items = navItems.filter((item) => {
      if (item.section !== section) return false;
      if (item.permission && !can(item.permission)) return false;
      return true;
    });

    return items.map((item) => {
      const Icon = item.icon;
      const active = isActive(item.path);

      const linkContent = (
        <Link
          to={item.path}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            active
              ? "bg-brand-purple/10 text-brand-purple font-medium"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-2"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">{t(`nav.${item.key}`)}</span>}
        </Link>
      );

      if (collapsed) {
        return (
          <Tooltip key={item.key}>
            <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
            <TooltipContent side="right">{t(`nav.${item.key}`)}</TooltipContent>
          </Tooltip>
        );
      }

      return <div key={item.key}>{linkContent}</div>;
    });
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col border-r bg-card transition-all duration-200",
          collapsed ? "w-[60px]" : "w-[240px]"
        )}
      >
        {/* Brand */}
        <div className={cn("flex items-center gap-2 border-b px-3 h-14", collapsed && "justify-center")}>
          <div className="h-7 w-7 rounded-lg bg-brand-purple flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">G</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-sm truncate">{t("brandName")}</span>
          )}
        </div>

        <ScrollArea className="flex-1 py-2">
          <div className="flex flex-col gap-1 px-2">
            {renderSection("main")}

            <Separator className="my-2" />

            {!collapsed && (
              <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1">
                {t("sections.modules")}
              </span>
            )}
            {renderSection("modules")}

            <Separator className="my-2" />

            {renderSection("settings")}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-2">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors",
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
            className="w-full mt-1"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span className="ml-2 text-xs">{t("collapseMenu")}</span>}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
