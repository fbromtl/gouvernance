import { useCallback, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Upload, FileUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  isUploading?: boolean;
  compact?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Accepted MIME types                                                */
/* ------------------------------------------------------------------ */

const ACCEPTED = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "image/png",
  "image/jpeg",
  "image/webp",
].join(",");

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DropZone({
  onFilesSelected,
  isUploading = false,
  compact = false,
  className,
}: DropZoneProps) {
  const { t } = useTranslation("documents");
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (isUploading) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onFilesSelected(files);
      }
    },
    [isUploading, onFilesSelected]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length > 0) {
        onFilesSelected(files);
      }
      // Reset input
      if (inputRef.current) inputRef.current.value = "";
    },
    [onFilesSelected]
  );

  if (compact) {
    return (
      <div className={cn("relative", className)}>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED}
          onChange={handleInputChange}
          className="hidden"
          disabled={isUploading}
        />
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex items-center gap-2 rounded-lg border-2 border-dashed px-4 py-2.5 cursor-pointer transition-colors",
            isDragOver
              ? "border-brand-purple bg-brand-purple/5"
              : "border-border/60 hover:border-brand-purple/50 hover:bg-muted/30"
          )}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin text-brand-purple" />
          ) : (
            <Upload className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm text-muted-foreground">
            {isUploading
              ? t("drive.uploading", { defaultValue: "Telechargement..." })
              : t("drive.dropCompact", {
                  defaultValue: "Deposer ou cliquer pour ajouter",
                })}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED}
        onChange={handleInputChange}
        className="hidden"
        disabled={isUploading}
      />
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all",
          isDragOver
            ? "border-brand-purple bg-brand-purple/5 scale-[1.01]"
            : "border-border/60 hover:border-brand-purple/50 hover:bg-muted/20"
        )}
      >
        <div
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full transition-colors",
            isDragOver ? "bg-brand-purple/10" : "bg-muted"
          )}
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-brand-purple" />
          ) : (
            <FileUp
              className={cn(
                "h-6 w-6 transition-colors",
                isDragOver ? "text-brand-purple" : "text-muted-foreground"
              )}
            />
          )}
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">
            {isUploading
              ? t("drive.uploading", { defaultValue: "Telechargement en cours..." })
              : t("drive.dropTitle", {
                  defaultValue: "Glissez-deposez vos fichiers ici",
                })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("drive.dropSubtitle", {
              defaultValue: "PDF, Word, Excel, images — max 50 Mo",
            })}
          </p>
        </div>
        {!isUploading && (
          <Button variant="outline" size="sm" className="mt-1">
            {t("drive.browse", { defaultValue: "Parcourir" })}
          </Button>
        )}
      </div>
    </div>
  );
}
