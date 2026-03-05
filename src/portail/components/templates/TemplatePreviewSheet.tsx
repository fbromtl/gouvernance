import { useEffect, useState } from "react";
import { Download, Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TemplateDoc } from "@/types/template";

interface TemplatePreviewSheetProps {
  template: TemplateDoc | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplatePreviewSheet({
  template,
  open,
  onOpenChange,
}: TemplatePreviewSheetProps) {
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!template || !open) return;
    setLoading(true);
    fetch(template.htmlPath)
      .then((r) => r.text())
      .then((html) => {
        setHtmlContent(html);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [template?.id, open]);

  const formattedNumber = template
    ? `#${String(template.number).padStart(2, "0")}`
    : "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-2xl w-full flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-lg">
            {formattedNumber} {template?.title}
          </SheetTitle>
          <SheetDescription asChild>
            <div className="flex flex-wrap gap-2">
              {template?.categoryLabel && (
                <Badge variant="secondary">{template.categoryLabel}</Badge>
              )}
              {template?.typeLabel && (
                <Badge variant="outline">{template.typeLabel}</Badge>
              )}
              {template?.frameworks.map((fw) => (
                <Badge
                  key={fw}
                  variant="outline"
                  className="text-brand-forest border-brand-forest/30"
                >
                  {fw}
                </Badge>
              ))}
            </div>
          </SheetDescription>
          <div className="border-b border-border" />
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-4 pb-4">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                Chargement...
              </div>
            ) : (
              <div
                className="template-preview prose prose-sm max-w-none
                  prose-headings:font-serif prose-headings:text-foreground
                  prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4 prose-h1:mt-6
                  prose-h2:text-xl prose-h2:font-semibold prose-h2:mb-3 prose-h2:mt-5
                  prose-h3:text-lg prose-h3:font-medium prose-h3:mb-2 prose-h3:mt-4
                  prose-p:text-sm prose-p:text-foreground/80 prose-p:mb-3 prose-p:leading-relaxed
                  prose-li:text-sm prose-li:text-foreground/80
                  prose-table:text-sm prose-table:border-collapse
                  prose-th:border prose-th:border-border prose-th:px-3 prose-th:py-2 prose-th:bg-muted prose-th:text-left prose-th:font-medium
                  prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="border-t border-border flex-row gap-3">
          {template && (
            <>
              <Button asChild variant="default">
                <a href={template.docxPath} download>
                  <Download />
                  Télécharger DOCX
                </a>
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span tabIndex={0}>
                      <Button variant="outline" disabled>
                        <Sparkles />
                        Démarrer la personnalisation
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Bientôt disponible</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
