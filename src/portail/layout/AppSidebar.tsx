import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ExternalLink, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { navGroups, type NavItem, type NavGroup } from "./nav-config";


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

    const linkContent = (
      <Link
        to={item.path}
        className={cn(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
          active
            ? "bg-[#ab54f3]/8 text-[#ab54f3] shadow-[inset_0_0_0_1px_rgba(171,84,243,0.10)]"
            : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900",
          collapsed && "justify-center px-2"
        )}
      >
        {/* Active indicator bar */}
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-brand-purple shadow-[2px_0_8px_rgba(171,84,243,0.3)]" />
        )}

        <Icon
          className={cn(
            "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
            active ? "text-[#ab54f3]" : "text-neutral-400 group-hover:text-neutral-700"
          )}
        />

        {!collapsed && (
          <>
            <span className="flex-1 truncate">{t(`nav.${item.key}`)}</span>
            {item.badge && (
              <Badge className="ml-auto bg-brand-purple/15 text-brand-purple border-brand-purple/30 text-[9px] font-bold tracking-wider px-1.5 py-0 h-4">
                {item.badge}
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
          <TooltipContent side="right" sideOffset={8} className="font-medium">
            {t(`nav.${item.key}`)}
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
          <div className="px-3 pt-5 pb-1.5 first:pt-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-300">
              {t(group.labelKey)}
            </span>
          </div>
        )}
        {collapsed && idx > 0 && (
          <div className="mx-3 my-2.5 border-t border-neutral-100" />
        )}
        {visibleItems.map(renderItem)}
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col border-r border-neutral-100 bg-white transition-all duration-300 ease-in-out",
          collapsed ? "w-[60px]" : "w-[250px]"
        )}
      >
        {/* ---- Brand Header ---- */}
        <div
          className={cn(
            "flex items-center gap-3 border-b border-neutral-100 px-3 h-14 shrink-0",
            collapsed && "justify-center"
          )}
        >
          <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-brand-purple to-brand-purple-dark flex items-center justify-center shrink-0 shadow-sm shadow-brand-purple/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm tracking-tight truncate text-neutral-900">
                {t("brandName")}
              </span>
              <span className="text-[10px] text-neutral-400 -mt-0.5 font-medium">
                {t("brandTagline")}
              </span>
            </div>
          )}
        </div>

        {/* ---- Navigation ---- */}
        <ScrollArea className="flex-1 py-1.5">
          <nav className="flex flex-col px-2">
            {navGroups.map(renderGroup)}
          </nav>
        </ScrollArea>

        {/* ---- Footer ---- */}
        <div className="border-t border-neutral-100 p-2 space-y-0.5">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 transition-all duration-200",
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
              "w-full h-8 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50",
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
