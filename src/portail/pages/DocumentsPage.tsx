import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  FileText, Search, LayoutGrid, List, ChevronRight,
  FolderOpen, Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { usePermissions } from "@/hooks/usePermissions";
import {
  useDocuments,
  useDocumentCounts,
  useUploadDocument,
  useAnalyzeDocument,
  useUpdateDocument,
  useDeleteDocument,
  type AiAnalysisResult,
} from "@/hooks/useDocuments";
import type { GovDocument } from "@/types/database";
import { useAuth } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

import { DropZone } from "@/portail/components/drive/DropZone";
import { CategorySidebar } from "@/portail/components/drive/CategorySidebar";
import { FileCard } from "@/portail/components/drive/FileCard";
import { FileDetail } from "@/portail/components/drive/FileDetail";
import { ClassificationReview } from "@/portail/components/drive/ClassificationReview";
import { DRIVE_CATEGORIES, formatFileSize } from "@/portail/components/drive/constants";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ALL = "__all__";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600 border-gray-200",
  in_review: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  archived: "bg-gray-100 text-gray-500 border-gray-200",
};

/* ------------------------------------------------------------------ */
/*  Pending file type for classification                               */
/* ------------------------------------------------------------------ */

interface PendingFile {
  document: GovDocument;
  storagePath: string;
  analysis: AiAnalysisResult | null;
  isAnalyzing: boolean;
  error: string | null;
}

/* ================================================================== */
/*  MAIN PAGE                                                          */
/* ================================================================== */

export default function DocumentsPage() {
  const { t } = useTranslation("documents");
  const { t: ti18n } = useTranslation();
  const { can } = usePermissions();
  const { profile } = useAuth();
  const readOnly = !can("export_data");

  /* ---- View state ---- */
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState(ALL);

  /* ---- Dialogs ---- */
  const [viewingDoc, setViewingDoc] = useState<GovDocument | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<GovDocument | null>(null);
  const [showClassification, setShowClassification] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* ---- Data ---- */
  const filters = {
    category:
      selectedCategory === "__uncategorized__"
        ? undefined
        : selectedCategory ?? undefined,
    subcategory: selectedSubcategory ?? undefined,
    status: statusFilter === ALL ? undefined : statusFilter,
    search: searchQuery || undefined,
  };

  const { data: documents = [], isLoading, isError } = useDocuments(filters);
  const { data: counts = {} } = useDocumentCounts();

  // Filter uncategorized manually if needed
  const filteredDocs =
    selectedCategory === "__uncategorized__"
      ? documents.filter((d) => !d.category)
      : documents;

  /* ---- Mutations ---- */
  const uploadDocument = useUploadDocument();
  const analyzeDocument = useAnalyzeDocument();
  const updateDocument = useUpdateDocument();
  const deleteDocument = useDeleteDocument();

  /* ---- Upload + analyze flow ---- */
  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      const newPending: PendingFile[] = [];

      // Upload all files first
      for (const file of files) {
        try {
          const result = await uploadDocument.mutateAsync(file);
          const pending: PendingFile = {
            document: result.document,
            storagePath: result.storagePath,
            analysis: null,
            isAnalyzing: true,
            error: null,
          };
          newPending.push(pending);
        } catch (err) {
          toast.error(
            t("drive.uploadError", {
              defaultValue: "Erreur lors du telechargement de {{name}}",
              name: file.name,
            })
          );
        }
      }

      if (newPending.length === 0) return;

      // Show classification dialog
      setPendingFiles(newPending);
      setShowClassification(true);

      // Analyze each file in parallel
      const language =
        ti18n("language", { defaultValue: "fr" }) === "en" ? "en" : "fr";

      for (const pending of newPending) {
        analyzeDocument
          .mutateAsync({
            storagePath: pending.storagePath,
            fileName: pending.document.file_name ?? "",
            mimeType: pending.document.mime_type ?? "",
            language,
          })
          .then((result) => {
            setPendingFiles((prev) =>
              prev.map((f) =>
                f.document.id === pending.document.id
                  ? { ...f, analysis: result, isAnalyzing: false }
                  : f
              )
            );
          })
          .catch(() => {
            setPendingFiles((prev) =>
              prev.map((f) =>
                f.document.id === pending.document.id
                  ? {
                      ...f,
                      isAnalyzing: false,
                      error: t("drive.analysisError", {
                        defaultValue: "Erreur d'analyse IA",
                      }),
                    }
                  : f
              )
            );
          });
      }
    },
    [uploadDocument, analyzeDocument, t, ti18n]
  );

  /* ---- Confirm classification ---- */
  const handleConfirmClassification = useCallback(
    (
      docId: string,
      data: {
        title: string;
        category: string;
        subcategory: string;
        summary: string;
        tags: string[];
      }
    ) => {
      const pending = pendingFiles.find((f) => f.document.id === docId);

      updateDocument.mutate(
        {
          id: docId,
          title: data.title,
          category: data.category,
          subcategory: data.subcategory,
          summary: data.summary,
          tags: data.tags,
          ai_analysis: pending?.analysis as any,
        },
        {
          onSuccess: () => {
            toast.success(
              t("drive.classified", {
                defaultValue: "Document classifie avec succes",
              })
            );
          },
        }
      );
    },
    [pendingFiles, updateDocument, t]
  );

  /* ---- Delete ---- */
  const handleDelete = useCallback(
    (doc: GovDocument) => {
      const orgId = profile?.organization_id;
      const storagePath = orgId
        ? `${orgId}/${doc.id}/${doc.file_name}`
        : undefined;

      deleteDocument.mutate(
        { id: doc.id, storagePath },
        {
          onSuccess: () => {
            toast.success(t("messages.deleted"));
            setDeleteConfirm(null);
            setViewingDoc(null);
          },
        }
      );
    },
    [deleteDocument, profile, t]
  );

  /* ---- Download ---- */
  const handleDownload = useCallback(
    async (doc: GovDocument) => {
      if (!doc.file_url) return;
      const orgId = profile?.organization_id;
      if (!orgId) return;

      const storagePath = `${orgId}/${doc.id}/${doc.file_name}`;
      const { data, error } = await supabase.storage
        .from("documents")
        .download(storagePath);

      if (error || !data) {
        toast.error(
          t("drive.downloadError", {
            defaultValue: "Erreur de telechargement",
          })
        );
        return;
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.file_name ?? "document";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    [profile, t]
  );

  /* ---- Category selection ---- */
  const handleCategorySelect = useCallback(
    (category: string | null, subcategory: string | null) => {
      setSelectedCategory(category);
      setSelectedSubcategory(subcategory);
    },
    []
  );

  /* ---- Breadcrumb ---- */
  const breadcrumbParts: { label: string; onClick?: () => void }[] = [
    {
      label: t("drive.allDocuments", { defaultValue: "Tous les documents" }),
      onClick: () => handleCategorySelect(null, null),
    },
  ];

  if (selectedCategory && selectedCategory !== "__uncategorized__") {
    breadcrumbParts.push({
      label: t(`drive.categories.${selectedCategory}`, {
        defaultValue: selectedCategory,
      }),
      onClick: () => handleCategorySelect(selectedCategory, null),
    });

    if (selectedSubcategory) {
      breadcrumbParts.push({
        label: t(`drive.subcategories.${selectedSubcategory}`, {
          defaultValue: selectedSubcategory,
        }),
      });
    }
  } else if (selectedCategory === "__uncategorized__") {
    breadcrumbParts.push({
      label: t("drive.uncategorized", { defaultValue: "Non classe" }),
    });
  }

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  if (isError) {
    return (
      <div className="p-4 md:p-6">
        <Card className="p-8 text-center">
          <FileText className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {t("errorLoading", {
              defaultValue: "Erreur de chargement des donnees.",
            })}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 -mx-4 sm:-mx-6 lg:-mx-8 -my-6 lg:-my-8">
      {/* ---- Header ---- */}
      <div className="flex items-start justify-between gap-3 px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8">
        <div className="flex items-start gap-3">
          <FolderOpen className="h-7 w-7 text-brand-purple mt-0.5" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("drive.title", { defaultValue: "Espace documentaire" })}
            </h1>
            <p className="text-muted-foreground">
              {t("drive.description", {
                defaultValue:
                  "Centralisez, classifiez et retrouvez tous vos documents de gouvernance IA.",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* ---- Upload zone ---- */}
      {!readOnly && (
        <div className="px-4 sm:px-6 lg:px-8">
          <DropZone
            onFilesSelected={handleFilesSelected}
            isUploading={uploadDocument.isPending}
          />
        </div>
      )}

      {/* ---- Main content: sidebar + files ---- */}
      <div className="flex flex-1 min-h-0 px-4 sm:px-6 lg:px-8 pb-6 lg:pb-8">
        {/* Sidebar - Desktop */}
        <div
          className={cn(
            "hidden lg:block shrink-0 transition-all duration-200",
            sidebarOpen ? "w-[250px] mr-6" : "w-0 mr-0 overflow-hidden"
          )}
        >
          <Card className="sticky top-0 p-2 h-fit max-h-[calc(100vh-260px)] overflow-y-auto">
            <CategorySidebar
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onSelect={handleCategorySelect}
              counts={counts}
            />
          </Card>
        </div>

        {/* Files area */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sidebar toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex h-8 w-8"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FolderOpen className="h-4 w-4" />
            </Button>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-sm min-w-0 mr-auto">
              {breadcrumbParts.map((part, i) => (
                <div key={i} className="flex items-center gap-1">
                  {i > 0 && (
                    <ChevronRight className="h-3.5 w-3.5 text-foreground/25 shrink-0" />
                  )}
                  {part.onClick && i < breadcrumbParts.length - 1 ? (
                    <button
                      onClick={part.onClick}
                      className="text-foreground/50 hover:text-foreground transition-colors truncate"
                    >
                      {part.label}
                    </button>
                  ) : (
                    <span className="font-semibold text-foreground truncate">
                      {part.label}
                    </span>
                  )}
                </div>
              ))}
            </nav>

            {/* Search */}
            <div className="relative w-full sm:w-auto sm:min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8"
              />
            </div>

            {/* Status filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue placeholder={t("filters.filterByStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{t("filters.allStatuses")}</SelectItem>
                <SelectItem value="draft">{t("statuses.draft")}</SelectItem>
                <SelectItem value="in_review">
                  {t("statuses.in_review")}
                </SelectItem>
                <SelectItem value="approved">
                  {t("statuses.approved")}
                </SelectItem>
                <SelectItem value="archived">
                  {t("statuses.archived")}
                </SelectItem>
              </SelectContent>
            </Select>

            {/* View toggle */}
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8 rounded-none"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8 rounded-none"
                onClick={() => setViewMode("list")}
              >
                <List className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Mobile category pills */}
          <div className="flex lg:hidden gap-2 overflow-x-auto pb-1">
            <Badge
              variant={selectedCategory === null ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => handleCategorySelect(null, null)}
            >
              {t("drive.allDocuments", { defaultValue: "Tous" })}
            </Badge>
            {DRIVE_CATEGORIES.map((cat) => (
              <Badge
                key={cat.key}
                variant={selectedCategory === cat.key ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => handleCategorySelect(cat.key, null)}
              >
                {t(`drive.categories.${cat.labelKey}`, {
                  defaultValue: cat.labelKey,
                })}
              </Badge>
            ))}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-36 rounded-xl" />
              ))}
            </div>
          ) : filteredDocs.length === 0 ? (
            <Card className="p-10 text-center">
              <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
              <p className="font-medium text-muted-foreground">
                {t("drive.noDocuments", {
                  defaultValue: "Aucun document dans cette categorie",
                })}
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                {t("drive.noDocumentsHint", {
                  defaultValue:
                    "Glissez-deposez des fichiers ci-dessus pour commencer.",
                })}
              </p>
            </Card>
          ) : viewMode === "grid" ? (
            /* ---- Grid view ---- */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredDocs.map((doc) => (
                <FileCard
                  key={doc.id}
                  document={doc}
                  onView={setViewingDoc}
                  onDelete={readOnly ? undefined : setDeleteConfirm}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          ) : (
            /* ---- List view ---- */
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("table.title")}</TableHead>
                    <TableHead className="w-[160px]">
                      {t("drive.category", { defaultValue: "Categorie" })}
                    </TableHead>
                    <TableHead className="w-[120px]">
                      {t("table.status")}
                    </TableHead>
                    <TableHead className="w-[80px]">
                      {t("drive.size", { defaultValue: "Taille" })}
                    </TableHead>
                    <TableHead className="w-[100px]">
                      {t("table.date")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocs.map((doc) => (
                    <TableRow
                      key={doc.id}
                      className="cursor-pointer"
                      onClick={() => setViewingDoc(doc)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm font-medium truncate">
                            {doc.title}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {doc.category ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {t(`drive.categories.${doc.category}`, {
                              defaultValue: doc.category,
                            })}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] px-1.5 py-0",
                            STATUS_STYLES[doc.status]
                          )}
                        >
                          {t(`statuses.${doc.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatFileSize(doc.file_size)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString("fr-CA")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/*  FILE DETAIL SHEET                                            */}
      {/* ============================================================ */}
      <FileDetail
        document={viewingDoc}
        onClose={() => setViewingDoc(null)}
        onDelete={readOnly ? undefined : (doc) => setDeleteConfirm(doc)}
        onDownload={handleDownload}
        readOnly={readOnly}
      />

      {/* ============================================================ */}
      {/*  CLASSIFICATION REVIEW DIALOG                                 */}
      {/* ============================================================ */}
      <ClassificationReview
        files={pendingFiles}
        onConfirm={handleConfirmClassification}
        onCancel={() => setShowClassification(false)}
        open={showClassification}
      />

      {/* ============================================================ */}
      {/*  DELETE CONFIRMATION                                          */}
      {/* ============================================================ */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("delete")}</DialogTitle>
            <DialogDescription>
              {t("messages.deleteConfirm")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              {t("drive.cancel", { defaultValue: "Annuler" })}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={deleteDocument.isPending}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
