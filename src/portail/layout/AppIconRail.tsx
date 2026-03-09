import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { ExternalLink, LayoutDashboard, Settings } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function AppIconRail() {
  const { t } = useTranslation("portail");
  const location = useLocation();

  const items = [
    {
      key: "dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      label: t("rail.dashboard"),
      tooltip: t("nav.dashboard"),
    },
    {
      key: "site",
      path: "/",
      icon: ExternalLink,
      label: t("rail.backToSite"),
      tooltip: t("backToSite"),
      external: true,
    },
    {
      key: "profile",
      path: "/profile",
      icon: Settings,
      label: t("rail.settings"),
      tooltip: t("nav.profile"),
    },
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="flex w-16 flex-col items-center bg-[#0e0f19] py-3 shrink-0">
        {/* ---- Logo ---- */}
        <Link
          to="/dashboard"
          className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white font-bold text-lg hover:bg-white/20 transition-colors duration-200"
        >
          G
        </Link>

        {/* ---- Navigation ---- */}
        <nav className="flex flex-1 flex-col items-center gap-1 w-full px-1.5">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === "/"
                ? false
                : location.pathname === item.path ||
                  location.pathname.startsWith(item.path + "/");

            return (
              <Tooltip key={item.key}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.path}
                    className={cn(
                      "relative flex w-full flex-col items-center gap-0.5 rounded-lg px-1 py-2.5 transition-all duration-200",
                      isActive
                        ? "bg-white/15 text-white"
                        : "text-white/60 hover:text-white/80 hover:bg-white/8"
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-[#81a684] shadow-[2px_0_10px_rgba(129,166,132,0.55)]" />
                    )}
                    <Icon className="h-[22px] w-[22px]" />
                    <span className="text-[10px] font-medium leading-tight">
                      {item.label}
                    </span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8} className="font-medium">
                  {item.tooltip}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </aside>
    </TooltipProvider>
  );
}
