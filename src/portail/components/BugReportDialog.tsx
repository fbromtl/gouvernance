import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCreateBugReport } from "@/hooks/useBugReports";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const bugReportSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(1, "La description est requise"),
  page_url: z.string().optional(),
  severity: z.enum(["blocking", "annoying", "minor"], {
    message: "La sévérité est requise",
  }),
});

type BugReportFormData = z.infer<typeof bugReportSchema>;

const SEVERITY_LABELS: Record<string, string> = {
  blocking: "Bloquant",
  annoying: "Gênant",
  minor: "Mineur",
};

interface BugReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BugReportDialog({ open, onOpenChange }: BugReportDialogProps) {
  const { pathname } = useLocation();
  const createBugReport = useCreateBugReport();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BugReportFormData>({
    resolver: zodResolver(bugReportSchema) as never,
    defaultValues: {
      title: "",
      description: "",
      page_url: pathname,
      severity: "minor",
    },
  });

  // Update page_url when pathname changes and dialog is closed
  useEffect(() => {
    if (!open) {
      reset({
        title: "",
        description: "",
        page_url: pathname,
        severity: "minor",
      });
    }
  }, [open, pathname, reset]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = async (data: BugReportFormData) => {
    // Get screenshot file if selected
    const fileInput = document.getElementById("screenshot") as HTMLInputElement;
    const screenshot = fileInput?.files?.[0] ?? undefined;

    // Client-side file validation
    if (screenshot) {
      if (!ACCEPTED_IMAGE_TYPES.includes(screenshot.type)) {
        toast.error("Format d'image non supporté. Utilisez JPEG, PNG ou WebP.");
        return;
      }
      if (screenshot.size > MAX_FILE_SIZE) {
        toast.error("La capture d'écran ne doit pas dépasser 5 Mo.");
        return;
      }
    }

    try {
      await createBugReport.mutateAsync({ ...data, screenshot });
      toast.success("Bug signalé avec succès. Merci pour votre retour !");
      handleOpenChange(false);
    } catch {
      toast.error("Erreur lors de l'envoi du rapport. Veuillez réessayer.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Signaler un bug</DialogTitle>
          <DialogDescription>
            Décrivez le problème rencontré. Notre équipe analysera votre rapport.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              placeholder="Résumé du problème"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Décrivez le bug rencontré..."
              rows={4}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Page URL */}
          <div className="space-y-2">
            <Label htmlFor="page_url">Page concernée</Label>
            <Input
              id="page_url"
              {...register("page_url")}
            />
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label>Sévérité *</Label>
            <Controller
              name="severity"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.severity && (
              <p className="text-sm text-destructive">{errors.severity.message}</p>
            )}
          </div>

          {/* Screenshot */}
          <div className="space-y-2">
            <Label htmlFor="screenshot">Capture d'écran</Label>
            <Input
              id="screenshot"
              type="file"
              accept="image/jpeg,image/png,image/webp"
            />
            <p className="text-xs text-muted-foreground">
              JPEG, PNG ou WebP. Max 5 Mo.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createBugReport.isPending}
            >
              {createBugReport.isPending ? "Envoi..." : "Envoyer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
