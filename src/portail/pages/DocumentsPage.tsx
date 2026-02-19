import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

import { usePermissions } from "@/hooks/usePermissions";
import { useAiSystems } from "@/hooks/useAiSystems";
import {
  useDocuments,
  useCreateDocument,
  useUpdateDocument,
  useDeleteDocument,
} from "@/hooks/useDocuments";
import type { GovDocument } from "@/types/database";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

/* ================================================================== */
/*  CONSTANTS                                                          */
/* ================================================================== */

/** Sentinel value for "all" in filter selects (Radix forbids value=""). */
const ALL = "__all__";
/** Sentinel value for "none selected" in form selects (Radix forbids value=""). */
const NONE = "__none__";

const DOCUMENT_TYPES = [
  "system_card",
  "monitoring_plan",
  "risk_summary",
  "decisions_report",
  "incidents_report",
  "bias_report",
  "eu_ai_act_annex_iv",
  "compliance_report",
  "fria_report",
  "efvp_report",
  "manual_upload",
] as const;

const STATUSES = ["draft", "in_review", "approved", "archived"] as const;

const STATUS_BADGE_VARIANT: Record<string, string> = {
  draft: "secondary",
  in_review: "default",
  approved: "outline",
  archived: "secondary",
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  approved: "border-green-300 bg-green-50 text-green-700",
};

/* ================================================================== */
/*  MAIN PAGE                                                          */
/* ================================================================== */

export default function DocumentsPage() {
  const { t } = useTranslation("documents");
  const { can } = usePermissions();
  const readOnly = !can("export_data");

  /* ---- list filters ---- */
  const [typeFilter, setTypeFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [searchQuery, setSearchQuery] = useState("");

  /* ---- dialogs ---- */
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<GovDocument | null>(null);
  const [viewingDoc, setViewingDoc] = useState<GovDocument | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  /* ---- data ---- */
  const { data: documents = [], isLoading, isError } = useDocuments({
    document_type: typeFilter === ALL ? undefined : typeFilter,
    status: statusFilter === ALL ? undefined : statusFilter,
    search: searchQuery || undefined,
  });
  const { data: aiSystems = [] } = useAiSystems();
  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument();
  const deleteDocument = useDeleteDocument();

  /* ---- form state ---- */
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState("");
  const [formAiSystemId, setFormAiSystemId] = useState(NONE);
  const [formDescription, setFormDescription] = useState("");
  const [formTags, setFormTags] = useState("");

  /* ---- helpers ---- */
  const getSystemName = (id: string | null) => {
    if (!id) return "\u2014";
    const sys = aiSystems.find((s) => s.id === id);
    return sys?.name ?? "\u2014";
  };

  const getStatusBadge = (status: string) => {
    const variant = STATUS_BADGE_VARIANT[status] ?? "secondary";
    const className = STATUS_BADGE_CLASS[status] ?? "";
    return (
      <Badge variant={variant as any} className={className}>
        {t(`statuses.${status}`)}
      </Badge>
    );
  };

  /* ---- dialog openers ---- */
  const resetForm = () => {
    setFormTitle("");
    setFormType("");
    setFormAiSystemId(NONE);
    setFormDescription("");
    setFormTags("");
  };

  const openCreateDialog = () => {
    setEditingDoc(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (doc: GovDocument) => {
    setEditingDoc(doc);
    setFormTitle(doc.title);
    setFormType(doc.document_type);
    setFormAiSystemId(doc.ai_system_id ?? NONE);
    setFormDescription(doc.description ?? "");
    setFormTags((doc.tags ?? []).join(", "));
    setDialogOpen(true);
  };

  /* ---- submit ---- */
  const handleSubmit = () => {
    if (!formTitle.trim() || !formType) return;

    const tags = formTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: formTitle.trim(),
      document_type: formType,
      ai_system_id: formAiSystemId === NONE ? null : formAiSystemId,
      description: formDescription.trim() || null,
      tags,
    };

    if (editingDoc) {
      updateDocument.mutate(
        { id: editingDoc.id, ...payload },
        {
          onSuccess: () => {
            toast.success(t("messages.updated"));
            setDialogOpen(false);
          },
        }
      );
    } else {
      createDocument.mutate(payload, {
        onSuccess: () => {
          toast.success(t("messages.created"));
          setDialogOpen(false);
        },
      });
    }
  };

  /* ---- delete ---- */
  const handleDelete = (id: string) => {
    deleteDocument.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success(t("messages.deleted"));
          setDeleteConfirm(null);
        },
      }
    );
  };

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  if (isError) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Card className="p-8 text-center">
          <FileText className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {t("errorLoading", { defaultValue: "Erreur de chargement des données." })}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <FileText className="h-7 w-7 text-brand-purple mt-0.5" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("pageTitle")}</h1>
          <p className="text-muted-foreground">{t("pageDescription")}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder={t("filters.filterByType")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("filters.allTypes")}</SelectItem>
            {DOCUMENT_TYPES.map((dt) => (
              <SelectItem key={dt} value={dt}>
                {t(`types.${dt}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t("filters.filterByStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("filters.allStatuses")}</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`statuses.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!readOnly && (
          <Button size="sm" className="ml-auto gap-1.5" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            {t("create")}
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-4" />
          <p className="font-medium text-muted-foreground">{t("noDocuments")}</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {t("noDocumentsDescription")}
          </p>
          {!readOnly && (
            <Button size="sm" className="mt-4 gap-1.5" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              {t("create")}
            </Button>
          )}
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.title")}</TableHead>
                <TableHead className="w-[200px]">{t("table.type")}</TableHead>
                <TableHead className="w-[160px]">{t("table.system")}</TableHead>
                <TableHead className="w-[120px]">{t("table.status")}</TableHead>
                <TableHead className="w-[80px]">{t("table.version")}</TableHead>
                <TableHead className="w-[110px]">{t("table.date")}</TableHead>
                <TableHead className="w-[100px]">{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <button
                      className="text-sm font-medium text-left hover:text-brand-purple transition-colors"
                      onClick={() => setViewingDoc(doc)}
                    >
                      {doc.title}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {t(`types.${doc.document_type}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {getSystemName(doc.ai_system_id)}
                  </TableCell>
                  <TableCell>{getStatusBadge(doc.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground text-center">
                    v{doc.version}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(doc.created_at).toLocaleDateString("fr-CA")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setViewingDoc(doc)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {!readOnly && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEditDialog(doc)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => setDeleteConfirm(doc.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* ============================================================ */}
      {/*  CREATE / EDIT DIALOG                                         */}
      {/* ============================================================ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDoc ? t("edit") : t("create")}
            </DialogTitle>
            <DialogDescription>{t("pageDescription")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <Label>{t("form.title")}</Label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>

            {/* Document type */}
            <div>
              <Label>{t("form.type")}</Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger>
                  <SelectValue placeholder={t("form.selectType")} />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((dt) => (
                    <SelectItem key={dt} value={dt}>
                      {t(`types.${dt}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* AI System */}
            {aiSystems.length > 0 && (
              <div>
                <Label>{t("form.aiSystem")}</Label>
                <Select value={formAiSystemId} onValueChange={setFormAiSystemId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.selectSystem")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>{"\u2014"}</SelectItem>
                    {aiSystems.map((sys) => (
                      <SelectItem key={sys.id} value={sys.id}>
                        {sys.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Description */}
            <div>
              <Label>{t("form.description")}</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                placeholder={t("form.descriptionPlaceholder")}
              />
            </div>

            {/* Tags */}
            <div>
              <Label>{t("form.tags")}</Label>
              <Input
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder={t("form.tagsPlaceholder")}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Separating tags with commas
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formTitle.trim() ||
                !formType ||
                createDocument.isPending ||
                updateDocument.isPending
              }
            >
              {editingDoc ? t("edit") : t("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/*  DETAIL SHEET                                                 */}
      {/* ============================================================ */}
      <Sheet open={!!viewingDoc} onOpenChange={() => setViewingDoc(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {viewingDoc && (
            <>
              <SheetHeader>
                <SheetTitle>{viewingDoc.title}</SheetTitle>
                <SheetDescription>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {getStatusBadge(viewingDoc.status)}
                    <Badge variant="outline">
                      {t(`types.${viewingDoc.document_type}`)}
                    </Badge>
                    <Badge variant="outline">v{viewingDoc.version}</Badge>
                  </div>
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-5">
                {/* AI System */}
                {viewingDoc.ai_system_id && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      {t("table.system")}
                    </h4>
                    <p className="text-sm">{getSystemName(viewingDoc.ai_system_id)}</p>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    {t("detail.description")}
                  </h4>
                  <p className="text-sm whitespace-pre-wrap">
                    {viewingDoc.description || t("detail.noContent")}
                  </p>
                </div>

                {/* Tags */}
                {(viewingDoc.tags ?? []).length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      {t("detail.tags")}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingDoc.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* File */}
                {viewingDoc.file_name && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      {t("detail.file")}
                    </h4>
                    <p className="text-sm">
                      {viewingDoc.file_name}
                      {viewingDoc.file_size && (
                        <span className="text-muted-foreground ml-2">
                          ({Math.round(viewingDoc.file_size / 1024)} KB)
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {/* Approved by */}
                {viewingDoc.approved_at && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      {t("detail.approvedBy")}
                    </h4>
                    <p className="text-sm">
                      {new Date(viewingDoc.approved_at).toLocaleDateString("fr-CA")}
                    </p>
                  </div>
                )}

                {/* Metadata */}
                <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
                  <p>
                    {"Cr\u00e9\u00e9 le "}
                    {new Date(viewingDoc.created_at).toLocaleDateString("fr-CA")}
                  </p>
                  <p>
                    {"Mis \u00e0 jour le "}
                    {new Date(viewingDoc.updated_at).toLocaleDateString("fr-CA")}
                  </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ============================================================ */}
      {/*  DELETE CONFIRMATION                                          */}
      {/* ============================================================ */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("delete")}</DialogTitle>
            <DialogDescription>{t("messages.deleteConfirm")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={deleteDocument.isPending}
            >
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
