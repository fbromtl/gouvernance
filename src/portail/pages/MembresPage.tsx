import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Search, Users, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MemberCard } from "@/components/shared/MemberCard";
import { useMembers } from "@/hooks/useMembers";
import { usePlanFeatures } from "@/hooks/usePlanFeatures";
import type { MemberProfile } from "@/components/shared/MemberCard";
import type { PlanId } from "@/lib/stripe";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

type FilterTab = "all" | "member" | "expert" | "honorary";

const FILTER_TABS: { key: FilterTab; i18nKey: string }[] = [
  { key: "all", i18nKey: "filterAll" },
  { key: "member", i18nKey: "filterMember" },
  { key: "expert", i18nKey: "filterExpert" },
  { key: "honorary", i18nKey: "filterHonorary" },
];

/** Sort priority: honorary first (most prestige), then expert, then member */
const PLAN_PRESTIGE: Record<PlanId, number> = {
  honorary: 0,
  expert: 1,
  member: 2,
  observer: 3,
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function MembresPage() {
  const { t } = useTranslation("members");
  const navigate = useNavigate();
  const { data: members = [], isLoading } = useMembers();
  const { plan } = usePlanFeatures();

  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const isObserver = plan === "observer";

  /* ---- Filtered + sorted members ---- */
  const filteredMembers = useMemo(() => {
    let result: MemberProfile[] = [...members];

    // Filter by tab
    if (activeTab !== "all") {
      result = result.filter((m) => m.plan === activeTab);
    }

    // Filter by search query
    const query = search.toLowerCase().trim();
    if (query) {
      result = result.filter(
        (m) =>
          m.full_name?.toLowerCase().includes(query) ||
          m.job_title?.toLowerCase().includes(query) ||
          m.organization_name?.toLowerCase().includes(query)
      );
    }

    // Sort by prestige (honorary first)
    result.sort(
      (a, b) => (PLAN_PRESTIGE[a.plan] ?? 3) - (PLAN_PRESTIGE[b.plan] ?? 3)
    );

    return result;
  }, [members, activeTab, search]);

  /* ================================================================ */
  /*  Loading state                                                    */
  /* ================================================================ */

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Skeleton header */}
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-4 w-80 bg-muted/60 animate-pulse rounded-lg" />
        </div>
        {/* Skeleton tabs + search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-9 w-24 bg-muted/50 animate-pulse rounded-lg" />
            ))}
          </div>
          <div className="h-9 w-64 bg-muted/50 animate-pulse rounded-lg" />
        </div>
        {/* Skeleton grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 bg-muted/40 animate-pulse rounded-xl border border-border/50" />
          ))}
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  Observer FOMO teaser                                             */
  /* ================================================================ */

  if (isObserver) {
    return (
      <div className="space-y-8">
        {/* Page header */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t("pageTitle")}
            </h1>
            <Badge variant="secondary" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {t("memberCount", { count: members.length })}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {t("pageDescription")}
          </p>
        </div>

        {/* Blurred member cards with overlay */}
        <div className="relative">
          {/* Blurred cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 select-none" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <MemberCard
                key={i}
                blurred
                member={{
                  id: `placeholder-${i}`,
                  full_name: null,
                  avatar_url: null,
                  job_title: null,
                  bio: null,
                  linkedin_url: null,
                  member_slug: null,
                  organization_name: null,
                  plan: "member",
                }}
              />
            ))}
          </div>

          {/* Centered overlay CTA */}
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-xl">
            <Card className="w-full max-w-md mx-4 shadow-xl border-brand-purple/20">
              <CardContent className="flex flex-col items-center text-center p-8 space-y-4">
                <div className="h-12 w-12 rounded-full bg-brand-purple/10 flex items-center justify-center">
                  <Lock className="h-6 w-6 text-brand-purple" />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  {t("teaser.title")}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("teaser.description", { count: members.length })}
                </p>
                <Button
                  className="bg-brand-purple hover:bg-brand-purple-dark text-white mt-2"
                  onClick={() => navigate("/billing")}
                >
                  {t("teaser.cta")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  Full member directory                                            */
  /* ================================================================ */

  return (
    <div className="space-y-8">
      {/* ---- Page header ---- */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("pageTitle")}
          </h1>
          <Badge variant="secondary" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {t("memberCount", { count: members.length })}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {t("pageDescription")}
        </p>
      </div>

      {/* ---- Filter tabs + Search ---- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Tab buttons */}
        <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
          {FILTER_TABS.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "secondary" : "ghost"}
              size="sm"
              className={
                activeTab === tab.key
                  ? "bg-background shadow-sm font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }
              onClick={() => setActiveTab(tab.key)}
            >
              {t(tab.i18nKey)}
            </Button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* ---- Member grid ---- */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">
            {search
              ? t("searchPlaceholder")
              : t("filterAll")}
          </p>
        </div>
      )}
    </div>
  );
}
