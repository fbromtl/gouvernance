import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Sparkles, Check, Loader2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DRIVE_CATEGORIES, getSubcategories } from "./constants";
import type { AiAnalysisResult } from "@/hooks/useDocuments";
import type { GovDocument } from "@/types/database";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface PendingFile {
  document: GovDocument;
  storagePath: string;
  analysis: AiAnalysisResult | null;
  isAnalyzing: boolean;
  error: string | null;
}

interface ClassificationReviewProps {
  files: PendingFile[];
  onConfirm: (
    docId: string,
    data: {
      title: string;
      category: string;
      subcategory: string;
      summary: string;
      tags: string[];
    }
  ) => void;
  onCancel: () => void;
  open: boolean;
}

/* ------------------------------------------------------------------ */
/*  Single file classification form                                    */
/* ------------------------------------------------------------------ */

function FileClassificationForm({
  file,
  onConfirm,
  t,
}: {
  file: PendingFile;
  onConfirm: ClassificationReviewProps["onConfirm"];
  t: (key: string, opts?: any) => string;
}) {
  const [title, setTitle] = useState(file.analysis?.title ?? file.document.title);
  const [category, setCategory] = useState(file.analysis?.category ?? "");
  const [subcategory, setSubcategory] = useState(file.analysis?.subcategory ?? "");
  const [summary, setSummary] = useState(file.analysis?.summary ?? "");
  const [tagsInput, setTagsInput] = useState(
    (file.analysis?.tags ?? []).join(", ")
  );
  const [confirmed, setConfirmed] = useState(false);

  // Update form when analysis arrives
  useEffect(() => {
    if (file.analysis) {
      setTitle(file.analysis.title);
      setCategory(file.analysis.category);
      setSubcategory(file.analysis.subcategory);
      setSummary(file.analysis.summary);
      setTagsInput(file.analysis.tags.join(", "));
    }
  }, [file.analysis]);

  const subcategories = getSubcategories(category);

  // Reset subcategory when category changes (if not matching)
  useEffect(() => {
    if (category && subcategory) {
      const valid = subcategories.some((s) => s.key === subcategory);
      if (!valid) setSubcategory(subcategories[0]?.key ?? "");
    }
  }, [category]);

  const handleConfirm = () => {
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    onConfirm(file.document.id, {
      title: title.trim(),
      category,
      subcategory,
      summary: summary.trim(),
      tags,
    });
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
        <Check className="h-5 w-5 text-green-600 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-green-800">{title}</p>
          <p className="text-xs text-green-600">
            {t(`drive.categories.${category}`, { defaultValue: category })}
            {" / "}
            {t(`drive.subcategories.${subcategory}`, { defaultValue: subcategory })}
          </p>
        </div>
      </div>
    );
  }

  if (file.isAnalyzing) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-4">
        <Loader2 className="h-5 w-5 animate-spin text-brand-purple shrink-0" />
        <div>
          <p className="text-sm font-medium">{file.document.file_name}</p>
          <p className="text-xs text-muted-foreground">
            {t("drive.analyzing", { defaultValue: "Analyse IA en cours..." })}
          </p>
        </div>
      </div>
    );
  }

  if (file.error) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{file.document.file_name}</p>
          <p className="text-xs text-destructive">{file.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/60 p-4 space-y-3">
      {/* File name + confidence */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-medium">
          {file.document.file_name}
        </p>
        {file.analysis && (
          <Badge
            variant="outline"
            className={
              file.analysis.confidence >= 0.7
                ? "text-green-600 border-green-200"
                : file.analysis.confidence >= 0.4
                  ? "text-amber-600 border-amber-200"
                  : "text-red-600 border-red-200"
            }
          >
            <Sparkles className="h-3 w-3 mr-1" />
            {Math.round(file.analysis.confidence * 100)}%
          </Badge>
        )}
      </div>

      {/* Title */}
      <div>
        <Label className="text-xs">
          {t("form.title")}
        </Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1"
        />
      </div>

      {/* Category + Subcategory */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">
            {t("drive.category", { defaultValue: "Categorie" })}
          </Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="mt-1">
              <SelectValue
                placeholder={t("drive.selectCategory", {
                  defaultValue: "Selectionner...",
                })}
              />
            </SelectTrigger>
            <SelectContent>
              {DRIVE_CATEGORIES.map((cat) => (
                <SelectItem key={cat.key} value={cat.key}>
                  {t(`drive.categories.${cat.labelKey}`, {
                    defaultValue: cat.labelKey,
                  })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">
            {t("drive.subcategory", { defaultValue: "Sous-categorie" })}
          </Label>
          <Select
            value={subcategory}
            onValueChange={setSubcategory}
            disabled={!category}
          >
            <SelectTrigger className="mt-1">
              <SelectValue
                placeholder={t("drive.selectSubcategory", {
                  defaultValue: "Selectionner...",
                })}
              />
            </SelectTrigger>
            <SelectContent>
              {subcategories.map((sub) => (
                <SelectItem key={sub.key} value={sub.key}>
                  {t(`drive.subcategories.${sub.labelKey}`, {
                    defaultValue: sub.labelKey,
                  })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary */}
      <div>
        <Label className="text-xs">
          {t("drive.summary", { defaultValue: "Resume" })}
        </Label>
        <Textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          className="mt-1 text-sm"
        />
      </div>

      {/* Tags */}
      <div>
        <Label className="text-xs">{t("form.tags")}</Label>
        <Input
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className="mt-1"
          placeholder={t("form.tagsPlaceholder")}
        />
      </div>

      {/* Confirm button */}
      <Button
        className="w-full gap-1.5"
        onClick={handleConfirm}
        disabled={!title.trim() || !category || !subcategory}
      >
        <Check className="h-4 w-4" />
        {t("drive.confirmClassification", { defaultValue: "Confirmer la classification" })}
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main dialog                                                        */
/* ------------------------------------------------------------------ */

export function ClassificationReview({
  files,
  onConfirm,
  onCancel,
  open,
}: ClassificationReviewProps) {
  const { t } = useTranslation("documents");

  const analyzingCount = files.filter((f) => f.isAnalyzing).length;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-purple" />
            {t("drive.classificationTitle", {
              defaultValue: "Classification des documents",
            })}
          </DialogTitle>
          <DialogDescription>
            {analyzingCount > 0
              ? t("drive.classificationAnalyzing", {
                  defaultValue: "Analyse IA en cours... ({{count}} restant)",
                  count: analyzingCount,
                })
              : t("drive.classificationDescription", {
                  defaultValue:
                    "L'IA a analyse vos documents et propose une classification. Verifiez et ajustez si necessaire.",
                })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {files.map((file) => (
            <FileClassificationForm
              key={file.document.id}
              file={file}
              onConfirm={onConfirm}
              t={t}
            />
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {t("drive.close", { defaultValue: "Fermer" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
