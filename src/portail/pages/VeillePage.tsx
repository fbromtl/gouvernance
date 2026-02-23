import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Newspaper,
  Sparkles,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { SectionHelpButton } from "@/components/shared/SectionHelpButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Article {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  snippet: string;
}

/* ------------------------------------------------------------------ */
/*  Helper: call Edge Function                                         */
/* ------------------------------------------------------------------ */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

async function fetchRSS(): Promise<Article[]> {
  if (!supabaseConfigured) throw new Error("Supabase not configured");
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Not authenticated");
  const res = await fetch(
    `${SUPABASE_URL}/functions/v1/regulatory-watch`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
  const data = await res.json();
  return data.articles ?? [];
}

async function callAI(
  action: string,
  payload: Record<string, unknown>
): Promise<string> {
  if (!supabaseConfigured) throw new Error("Supabase not configured");
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Not authenticated");
  const res = await fetch(
    `${SUPABASE_URL}/functions/v1/regulatory-watch`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, ...payload }),
    }
  );
  if (!res.ok) throw new Error(`AI call failed: ${res.status}`);
  const data = await res.json();
  return data.summary ?? "";
}

/* ------------------------------------------------------------------ */
/*  Format date                                                        */
/* ------------------------------------------------------------------ */

function formatDate(dateStr: string, lang: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function VeillePage() {
  const { t, i18n } = useTranslation("veille");
  const lang = i18n.language?.startsWith("en") ? "en" : "fr";

  // Articles state
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [articlesError, setArticlesError] = useState("");

  // Weekly summary state
  const [weeklySummary, setWeeklySummary] = useState("");
  const [loadingWeekly, setLoadingWeekly] = useState(false);
  const [weeklyError, setWeeklyError] = useState("");

  // Article summary dialog
  const [summaryDialog, setSummaryDialog] = useState<{
    open: boolean;
    title: string;
    summary: string;
    loading: boolean;
  }>({ open: false, title: "", summary: "", loading: false });

  /* ------ Fetch articles ------ */
  const loadArticles = useCallback(async () => {
    setLoadingArticles(true);
    setArticlesError("");
    try {
      const arts = await fetchRSS();
      setArticles(arts);
      return arts;
    } catch (err) {
      console.error("RSS error:", err);
      setArticlesError(t("articles.error"));
      return [];
    } finally {
      setLoadingArticles(false);
    }
  }, [t]);

  /* ------ Generate weekly summary ------ */
  const generateWeeklySummary = useCallback(
    async (arts: Article[]) => {
      if (arts.length === 0) {
        setWeeklySummary("");
        return;
      }
      setLoadingWeekly(true);
      setWeeklyError("");
      try {
        const summary = await callAI("weekly-summary", {
          articles: arts,
          language: lang,
        });
        setWeeklySummary(summary);
      } catch (err) {
        console.error("Weekly summary error:", err);
        setWeeklyError(t("weeklySummary.error"));
      } finally {
        setLoadingWeekly(false);
      }
    },
    [lang, t]
  );

  /* ------ Initial load (articles only – summary is on-demand) ------ */
  useEffect(() => {
    loadArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------ Summarize single article ------ */
  const handleSummarize = async (article: Article) => {
    setSummaryDialog({
      open: true,
      title: article.title,
      summary: "",
      loading: true,
    });
    try {
      const summary = await callAI("summarize", {
        title: article.title,
        url: article.link,
        snippet: article.snippet,
        language: lang,
      });
      setSummaryDialog((prev) => ({ ...prev, summary, loading: false }));
    } catch (err) {
      console.error("Article summary error:", err);
      setSummaryDialog((prev) => ({
        ...prev,
        summary: t("articles.error"),
        loading: false,
      }));
    }
  };

  /* ------ Strip HTML from snippet ------ */
  const stripHtml = (html: string) => {
    // 1. Decode HTML entities (&lt; &gt; &amp; &quot; &#39; &#xxx;)
    const decoded = html
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
      .replace(/&nbsp;/g, " ");
    // 2. Strip HTML tags
    return decoded.replace(/<[^>]*>/g, "").trim();
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* ---- Header ---- */}
      <div>
        <div className="flex items-center gap-1.5">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("pageTitle")}
          </h1>
          <Badge className="bg-brand-purple/15 text-brand-purple border-brand-purple/30 text-[10px] font-bold tracking-wider">
            IA
          </Badge>
          <SectionHelpButton ns="veille" />
        </div>
        <p className="text-muted-foreground">{t("pageDescription")}</p>
      </div>

      {/* ---- Weekly AI Summary ---- */}
      <Card className="border-brand-purple/20 bg-gradient-to-br from-brand-purple/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-purple/10">
                <Sparkles className="h-4 w-4 text-brand-purple" />
              </div>
              {t("weeklySummary.title")}
            </CardTitle>
            {/* Show regenerate only when a summary already exists */}
            {weeklySummary && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateWeeklySummary(articles)}
                disabled={loadingWeekly || articles.length === 0}
                className="gap-1.5"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${loadingWeekly ? "animate-spin" : ""}`}
                />
                {t("weeklySummary.regenerate")}
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {t("weeklySummary.subtitle")}
          </p>
        </CardHeader>
        <CardContent>
          {loadingWeekly && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("weeklySummary.loading")}
            </div>
          )}
          {weeklyError && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {weeklyError}
            </div>
          )}
          {!loadingWeekly && !weeklyError && weeklySummary && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {weeklySummary.split("\n").map((line, i) => (
                <p key={i} className="text-sm leading-relaxed text-foreground/85">
                  {line}
                </p>
              ))}
            </div>
          )}
          {!loadingWeekly && !weeklyError && !weeklySummary && articles.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t("weeklySummary.empty")}
            </p>
          )}
          {/* CTA: generate on demand (shown when no summary yet & articles available) */}
          {!loadingWeekly && !weeklyError && !weeklySummary && articles.length > 0 && (
            <div className="flex flex-col items-center gap-3 py-4">
              <p className="text-sm text-muted-foreground text-center">
                {t("weeklySummary.prompt")}
              </p>
              <Button
                onClick={() => generateWeeklySummary(articles)}
                className="gap-2 bg-brand-purple hover:bg-brand-purple/90"
              >
                <Sparkles className="h-4 w-4" />
                {t("weeklySummary.generate")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---- Articles List ---- */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="h-5 w-5 text-foreground/60" />
          <h2 className="text-lg font-semibold">{t("articles.title")}</h2>
        </div>

        {loadingArticles && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="py-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-3" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {articlesError && (
          <Card>
            <CardContent className="py-6 flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8 text-destructive/60" />
              <p className="text-sm text-destructive">{articlesError}</p>
              <Button variant="outline" size="sm" onClick={loadArticles}>
                {t("weeklySummary.regenerate")}
              </Button>
            </CardContent>
          </Card>
        )}

        {!loadingArticles && !articlesError && articles.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Newspaper className="h-10 w-10 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm">{t("articles.empty")}</p>
            </CardContent>
          </Card>
        )}

        {!loadingArticles && !articlesError && articles.length > 0 && (
          <div className="space-y-3">
            {articles.map((article) => (
              <Card
                key={article.link}
                className="group hover:shadow-md transition-shadow duration-200"
              >
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm leading-snug mb-1 group-hover:text-brand-purple transition-colors">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0">
                          {article.source}
                        </Badge>
                        <span>{formatDate(article.pubDate, lang)}</span>
                      </div>
                      {article.snippet && (
                        <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                          {stripHtml(article.snippet)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/40">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs h-7"
                      onClick={() => handleSummarize(article)}
                    >
                      <Sparkles className="h-3 w-3" />
                      {t("articles.summarize")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-xs h-7"
                      asChild
                    >
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {t("articles.readArticle")}
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ---- Summary Dialog ---- */}
      <Dialog
        open={summaryDialog.open}
        onOpenChange={(open) =>
          setSummaryDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-purple/10">
                <FileText className="h-3.5 w-3.5 text-brand-purple" />
              </div>
              {t("articles.summaryTitle")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <p className="text-sm font-medium text-foreground/80">
              {summaryDialog.title}
            </p>

            {summaryDialog.loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("articles.summarizing")}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
                {summaryDialog.summary.split("\n").map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() =>
                setSummaryDialog((prev) => ({ ...prev, open: false }))
              }
              variant="outline"
            >
              {t("articles.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
