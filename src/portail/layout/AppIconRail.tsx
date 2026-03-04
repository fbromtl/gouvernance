import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { ExternalLink, Settings } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { navGroups, CATEGORY_ICONS } from "./nav-config";

interface AppIconRailProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function AppIconRail({ activeCategory, onCategoryChange }: AppIconRailProps) {
  const { t } = useTranslation("portail");
  const location = useLocation();

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="flex w-16 flex-col items-center bg-gradient-to-b from-[#7c2cd4] via-[#ab54f3] to-[#7c2cd4] py-3 shrink-0">
        {/* ---- Logo ---- */}
        <Link
          to="/dashboard"
          className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white font-bold text-lg hover:bg-white/20 transition-colors duration-200"
        >
          G
        </Link>

        {/* ---- Category Buttons ---- */}
        <nav className="flex flex-1 flex-col items-center gap-1 w-full px-1.5">
          {navGroups.map((group) => {
            const Icon = CATEGORY_ICONS[group.category];
            const isActive = activeCategory === group.category;

            return (
              <Tooltip key={group.category}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onCategoryChange(group.category)}
                    className={cn(
                      "relative flex w-full flex-col items-center gap-0.5 rounded-lg px-1 py-2.5 transition-all duration-200",
                      isActive
                        ? "bg-white/15 text-white"
                        : "text-white/60 hover:text-white/80 hover:bg-white/8"
                    )}
                  >
                    {/* Active indicator — left bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-white shadow-[2px_0_8px_rgba(255,255,255,0.3)]" />
                    )}

                    {Icon && <Icon className="h-[22px] w-[22px]" />}
                    <span className="text-[10px] font-medium leading-tight">
                      {t(`rail.${group.category}`)}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8} className="font-medium">
                  {t(group.labelKey)}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* ---- Footer ---- */}
        <div className="flex flex-col items-center gap-1 w-full px-1.5 pt-2 border-t border-white/10 mt-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/"
                className="flex w-full flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-white/60 hover:text-white/80 hover:bg-white/8 transition-all duration-200"
              >
                <ExternalLink className="h-[18px] w-[18px]" />
                <span className="text-[10px] font-medium">{t("rail.backToSite")}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8} className="font-medium">
              {t("backToSite")}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/profile"
                className={cn(
                  "flex w-full flex-col items-center gap-0.5 rounded-lg px-1 py-2 transition-all duration-200",
                  location.pathname === "/profile"
                    ? "bg-white/15 text-white"
                    : "text-white/60 hover:text-white/80 hover:bg-white/8"
                )}
              >
                <Settings className="h-[18px] w-[18px]" />
                <span className="text-[10px] font-medium">{t("rail.settings")}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8} className="font-medium">
              {t("nav.profile")}
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
