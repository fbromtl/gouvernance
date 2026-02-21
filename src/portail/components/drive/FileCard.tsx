import { useTranslation } from "react-i18next";
import {
  FileText, FileSpreadsheet, FileImage, File,
  Download, Eye, Trash2, MoreVertical,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatFileSize, getFileExtension } from "./constants";
import type { GovDocument } from "@/types/database";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface FileCardProps {
  document: GovDocument;
  onView: (doc: GovDocument) => void;
  onDelete?: (doc: GovDocument) => void;
  onDownload?: (doc: GovDocument) => void;
}

/* ------------------------------------------------------------------ */
/*  File icon by mime type                                             */
/* ------------------------------------------------------------------ */

function FileIcon({ mimeType, className }: { mimeType: string | null; className?: string }) {
  const ext = getFileExtension(mimeType);

  if (ext === "pdf") {
    return <FileText className={cn("text-red-500", className)} />;
  }
  if (["doc", "docx"].includes(ext)) {
    return <FileText className={cn("text-blue-500", className)} />;
  }
  if (["xls", "xlsx", "csv"].includes(ext)) {
    return <FileSpreadsheet className={cn("text-green-500", className)} />;
  }
  if (["png", "jpg", "jpeg", "webp"].includes(ext)) {
    return <FileImage className={cn("text-purple-500", className)} />;
  }
  return <File className={cn("text-gray-400", className)} />;
}

/* ------------------------------------------------------------------ */
/*  Status badge                                                       */
/* ------------------------------------------------------------------ */

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600 border-gray-200",
  in_review: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  archived: "bg-gray-100 text-gray-500 border-gray-200",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FileCard({ document: doc, onView, onDelete, onDownload }: FileCardProps) {
  const { t } = useTranslation("documents");
  const ext = getFileExtension(doc.mime_type);

  return (
    <div
      onClick={() => onView(doc)}
      className={cn(
        "group relative flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-4 cursor-pointer",
        "transition-all hover:shadow-md hover:border-brand-purple/30 hover:-translate-y-0.5"
      )}
    >
      {/* Top row: icon + extension badge + menu */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <FileIcon mimeType={doc.mime_type} className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-brand-purple transition-colors">
              {doc.title}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {ext.toUpperCase()}
              {doc.file_size ? ` — ${formatFileSize(doc.file_size)}` : ""}
            </p>
          </div>
        </div>

        {/* Actions menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => onView(doc)}>
              <Eye className="h-3.5 w-3.5 mr-2" />
              {t("view")}
            </DropdownMenuItem>
            {onDownload && (
              <DropdownMenuItem onClick={() => onDownload(doc)}>
                <Download className="h-3.5 w-3.5 mr-2" />
                {t("download")}
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(doc)}
                className="text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                {t("delete")}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Summary (if available) */}
      {doc.summary && (
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {doc.summary}
        </p>
      )}

      {/* Bottom: badges */}
      <div className="flex items-center gap-1.5 flex-wrap mt-auto pt-1">
        {doc.category && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {t(`drive.categories.${doc.category}`, { defaultValue: doc.category })}
          </Badge>
        )}
        <Badge
          variant="outline"
          className={cn("text-[10px] px-1.5 py-0", STATUS_STYLES[doc.status])}
        >
          {t(`statuses.${doc.status}`)}
        </Badge>
        <span className="text-[10px] text-muted-foreground/50 ml-auto">
          {new Date(doc.created_at).toLocaleDateString("fr-CA")}
        </span>
      </div>
    </div>
  );
}
