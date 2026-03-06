import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  navGroups,
  CATEGORY_ICONS,
  CATEGORY_DEFAULT_ROUTES,
  getCategoryForPath,
} from "./nav-config";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function BottomTabBar() {
  const { t } = useTranslation("portail");
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [subpagesOpen, setSubpagesOpen] = useState(false);
  const [sheetCategory, setSheetCategory] = useState<string | null>(null);

  const activeCategory = getCategoryForPath(pathname);

  const handleTabClick = (category: string) => {
    if (category === activeCategory) {
      setSheetCategory(category);
      setSubpagesOpen(true);
    } else {
      navigate(CATEGORY_DEFAULT_ROUTES[category] ?? "/dashboard");
    }
  };

  const sheetGroup = sheetCategory
    ? navGroups.find((g) => g.category === sheetCategory)
    : null;

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-white lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex h-16 items-stretch">
          {navGroups.map((group) => {
            const Icon = CATEGORY_ICONS[group.category];
            const isActive = activeCategory === group.category;

            return (
              <button
                key={group.category}
                type="button"
                onClick={() => handleTabClick(group.category)}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors",
                  isActive
                    ? "text-brand-forest"
                    : "text-neutral-400 active:text-neutral-600"
                )}
              >
                {Icon && (
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      isActive && "drop-shadow-[0_0_4px_rgba(87,136,108,0.4)]"
                    )}
                  />
                )}
                <span className="text-[10px] font-medium leading-tight">
                  {t(`rail.${group.category}`)}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-brand-forest" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <Sheet open={subpagesOpen} onOpenChange={setSubpagesOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-base">
              {sheetGroup ? t(sheetGroup.labelKey) : t("mobileNav.subpagesTitle")}
            </SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-2">
            {sheetGroup?.items.map((item) => {
              const Icon = item.icon;
              const isItemActive = pathname === item.path || pathname.startsWith(item.path + "/");
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    navigate(item.path);
                    setSubpagesOpen(false);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center transition-colors",
                    isItemActive
                      ? "bg-brand-forest/10 text-brand-forest"
                      : "text-neutral-600 active:bg-neutral-100"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium leading-tight">
                    {t(`nav.${item.key}`)}
                  </span>
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
