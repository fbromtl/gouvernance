import { useTranslation } from "react-i18next";
import {
  FileText, Download, Pencil, Trash2, Calendar, HardDrive,
  Tag, FolderOpen, Sparkles, ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { formatFileSize, getFileExtension } from "./constants";
import type { GovDocument } from "@/types/database";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface FileDetailProps {
  document: GovDocument | null;
  onClose: () => void;
  onDelete?: (doc: GovDocument) => void;
  onDownload?: (doc: GovDocument) => void;
  onEdit?: (doc: GovDocument) => void;
  readOnly?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Status badge styles                                                */
/* ------------------------------------------------------------------ */

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  in_review: "bg-amber-50 text-amber-700",
  approved: "bg-green-50 text-green-700",
  archived: "bg-gray-100 text-gray-500",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FileDetail({
  document: doc,
  onClose,
  onDelete,
  onDownload,
  onEdit,
  readOnly = false,
}: FileDetailProps) {
  const { t } = useTranslation("documents");

  return (
    <Sheet open={!!doc} onOpenChange={() => onClose()}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        {doc && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-brand-purple shrink-0 mt-0.5" />
                <span>{doc.title}</span>
              </SheetTitle>
              <SheetDescription>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <Badge
                    variant="outline"
                    className={STATUS_STYLES[doc.status]}
                  >
                    {t(`statuses.${doc.status}`)}
                  </Badge>
                  {doc.category && (
                    <Badge variant="outline">
                      {t(`drive.categories.${doc.category}`, {
                        defaultValue: doc.category,
                      })}
                    </Badge>
                  )}
                  {doc.subcategory && (
                    <Badge variant="outline" className="text-xs">
                      {t(`drive.subcategories.${doc.subcategory}`, {
                        defaultValue: doc.subcategory,
                      })}
                    </Badge>
                  )}
                </div>
              </SheetDescription>
            </SheetHeader>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              {onDownload && doc.file_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => onDownload(doc)}
                >
                  <Download className="h-3.5 w-3.5" />
                  {t("download")}
                </Button>
              )}
              {doc.file_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  asChild
                >
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                    {t("view")}
                  </a>
                </Button>
              )}
              {!readOnly && onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => onEdit(doc)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {t("edit")}
                </Button>
              )}
              {!readOnly && onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-destructive hover:text-destructive"
                  onClick={() => onDelete(doc)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("delete")}
                </Button>
              )}
            </div>

            <Separator className="my-5" />

            <div className="space-y-5">
              {/* Summary */}
              {doc.summary && (
                <div>
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    <Sparkles className="h-3 w-3" />
                    {t("drive.aiSummary", { defaultValue: "Resume IA" })}
                  </h4>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/50 rounded-lg p-3">
                    {doc.summary}
                  </p>
                </div>
              )}

              {/* Description */}
              {doc.description && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    {t("detail.description")}
                  </h4>
                  <p className="text-sm whitespace-pre-wrap">
                    {doc.description}
                  </p>
                </div>
              )}

              {/* Classification */}
              <div>
                <h4 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  <FolderOpen className="h-3 w-3" />
                  Classification
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground">
                      {t("drive.category", { defaultValue: "Categorie" })}
                    </span>
                    <p className="font-medium">
                      {doc.category
                        ? t(`drive.categories.${doc.category}`, {
                            defaultValue: doc.category,
                          })
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      {t("drive.subcategory", { defaultValue: "Sous-categorie" })}
                    </span>
                    <p className="font-medium">
                      {doc.subcategory
                        ? t(`drive.subcategories.${doc.subcategory}`, {
                            defaultValue: doc.subcategory,
                          })
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {(doc.tags ?? []).length > 0 && (
                <div>
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    <Tag className="h-3 w-3" />
                    {t("detail.tags")}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* File info */}
              <div>
                <h4 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  <HardDrive className="h-3 w-3" />
                  {t("detail.file")}
                </h4>
                <div className="space-y-1 text-sm">
                  {doc.file_name && <p>{doc.file_name}</p>}
                  <p className="text-muted-foreground">
                    {getFileExtension(doc.mime_type).toUpperCase()}
                    {doc.file_size
                      ? ` — ${formatFileSize(doc.file_size)}`
                      : ""}
                  </p>
                  <p className="text-muted-foreground">
                    v{doc.version}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
                <p className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  {t("drive.createdAt", { defaultValue: "Cree le" })}{" "}
                  {new Date(doc.created_at).toLocaleDateString("fr-CA")}
                </p>
                <p className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  {t("drive.updatedAt", { defaultValue: "Mis a jour le" })}{" "}
                  {new Date(doc.updated_at).toLocaleDateString("fr-CA")}
                </p>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
