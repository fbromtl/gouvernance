import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Building2,
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
  useVendors,
  useCreateVendor,
  useUpdateVendor,
  useDeleteVendor,
} from "@/hooks/useVendors";
import type { Vendor } from "@/types/database";

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

const SERVICE_TYPES = [
  "model_api",
  "pretrained_model",
  "saas_platform",
  "data_provider",
  "infrastructure",
  "consulting",
  "labeling",
  "other",
] as const;

const CONTRACT_TYPES = [
  "subscription",
  "per_use",
  "license",
  "custom",
] as const;

const RISK_LEVELS = ["low_risk", "medium_risk", "high_risk"] as const;

const STATUSES = [
  "active",
  "under_evaluation",
  "suspended",
  "terminated",
] as const;

const RISK_COLORS: Record<string, string> = {
  low_risk: "bg-green-100 text-green-800 border-green-200",
  medium_risk: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high_risk: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800 border-green-200",
  under_evaluation: "bg-blue-100 text-blue-800 border-blue-200",
  suspended: "bg-orange-100 text-orange-800 border-orange-200",
  terminated: "bg-red-100 text-red-800 border-red-200",
};

/* ================================================================== */
/*  MAIN PAGE                                                          */
/* ================================================================== */

export default function VendorsPage() {
  const { t } = useTranslation("vendors");
  const { can } = usePermissions();
  const readOnly = !can("manage_vendors");

  /* ---- list filters ---- */
  const [statusFilter, setStatusFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  /* ---- dialogs ---- */
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [viewingVendor, setViewingVendor] = useState<Vendor | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  /* ---- data ---- */
  const { data: vendors = [], isLoading, isError } = useVendors({
    status: statusFilter || undefined,
    risk_level: riskFilter || undefined,
    search: searchQuery || undefined,
  });
  const { data: aiSystems = [] } = useAiSystems();
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();
  const deleteVendor = useDeleteVendor();

  /* ---- form state ---- */
  const [formName, setFormName] = useState("");
  const [formServiceTypes, setFormServiceTypes] = useState<string[]>([]);
  const [formWebsite, setFormWebsite] = useState("");
  const [formContactName, setFormContactName] = useState("");
  const [formContactEmail, setFormContactEmail] = useState("");
  const [formContactPhone, setFormContactPhone] = useState("");
  const [formCountry, setFormCountry] = useState("");
  const [formRegion, setFormRegion] = useState("");
  const [formKnownSubcontractors, setFormKnownSubcontractors] = useState("");
  const [formAiSystemIds, setFormAiSystemIds] = useState<string[]>([]);
  const [formContractStartDate, setFormContractStartDate] = useState("");
  const [formContractEndDate, setFormContractEndDate] = useState("");
  const [formContractType, setFormContractType] = useState("");
  const [formContractAmount, setFormContractAmount] = useState("");
  const [formContractClauses, setFormContractClauses] = useState("");
  const [formSlaDetails, setFormSlaDetails] = useState("");
  const [formRiskLevel, setFormRiskLevel] = useState("");
  const [formStatus, setFormStatus] = useState<string>("active");

  /* ---- helpers ---- */
  const getSystemName = (ids: string[]) => {
    if (!ids || ids.length === 0) return "\u2014";
    const names = ids
      .map((id) => aiSystems.find((s) => s.id === id)?.name)
      .filter(Boolean);
    return names.length > 0 ? names.join(", ") : "\u2014";
  };

  const toggleServiceType = (st: string) => {
    setFormServiceTypes((prev) =>
      prev.includes(st) ? prev.filter((x) => x !== st) : [...prev, st]
    );
  };

  const toggleAiSystem = (sysId: string) => {
    setFormAiSystemIds((prev) =>
      prev.includes(sysId) ? prev.filter((x) => x !== sysId) : [...prev, sysId]
    );
  };

  /* ---- dialog openers ---- */
  const resetForm = () => {
    setFormName("");
    setFormServiceTypes([]);
    setFormWebsite("");
    setFormContactName("");
    setFormContactEmail("");
    setFormContactPhone("");
    setFormCountry("");
    setFormRegion("");
    setFormKnownSubcontractors("");
    setFormAiSystemIds([]);
    setFormContractStartDate("");
    setFormContractEndDate("");
    setFormContractType("");
    setFormContractAmount("");
    setFormContractClauses("");
    setFormSlaDetails("");
    setFormRiskLevel("");
    setFormStatus("active");
  };

  const openCreateDialog = () => {
    setEditingVendor(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormName(vendor.name);
    setFormServiceTypes(vendor.service_types ?? []);
    setFormWebsite(vendor.website ?? "");
    setFormContactName(vendor.contact_name ?? "");
    setFormContactEmail(vendor.contact_email ?? "");
    setFormContactPhone(vendor.contact_phone ?? "");
    setFormCountry(vendor.country ?? "");
    setFormRegion(vendor.region ?? "");
    setFormKnownSubcontractors(vendor.known_subcontractors ?? "");
    setFormAiSystemIds(vendor.ai_system_ids ?? []);
    setFormContractStartDate(vendor.contract_start_date ?? "");
    setFormContractEndDate(vendor.contract_end_date ?? "");
    setFormContractType(vendor.contract_type ?? "");
    setFormContractAmount(vendor.contract_amount != null ? String(vendor.contract_amount) : "");
    setFormContractClauses(vendor.contract_clauses ?? "");
    setFormSlaDetails(vendor.sla_details ?? "");
    setFormRiskLevel(vendor.risk_level ?? "");
    setFormStatus(vendor.status);
    setDialogOpen(true);
  };

  /* ---- submit ---- */
  const handleSubmit = () => {
    if (!formName.trim()) return;

    const payload = {
      name: formName.trim(),
      service_types: formServiceTypes,
      website: formWebsite.trim() || null,
      contact_name: formContactName.trim() || null,
      contact_email: formContactEmail.trim() || null,
      contact_phone: formContactPhone.trim() || null,
      country: formCountry.trim() || null,
      region: formRegion.trim() || null,
      known_subcontractors: formKnownSubcontractors.trim() || null,
      ai_system_ids: formAiSystemIds,
      contract_start_date: formContractStartDate || null,
      contract_end_date: formContractEndDate || null,
      contract_type: formContractType || null,
      contract_amount: formContractAmount ? Number(formContractAmount) : null,
      contract_clauses: formContractClauses.trim() || null,
      sla_details: formSlaDetails.trim() || null,
      risk_level: formRiskLevel || null,
      status: formStatus,
    };

    if (editingVendor) {
      updateVendor.mutate(
        { id: editingVendor.id, ...payload },
        {
          onSuccess: () => {
            toast.success(t("messages.updated"));
            setDialogOpen(false);
          },
        }
      );
    } else {
      createVendor.mutate(payload, {
        onSuccess: () => {
          toast.success(t("messages.created"));
          setDialogOpen(false);
        },
      });
    }
  };

  /* ---- delete ---- */
  const handleDelete = (id: string) => {
    deleteVendor.mutate(
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
          <Building2 className="h-8 w-8 text-destructive mx-auto mb-2" />
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
        <Building2 className="h-7 w-7 text-brand-purple mt-0.5" />
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

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("filters.filterByStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t("filters.allStatuses")}</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`statuses.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t("filters.filterByRisk")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t("filters.allRisks")}</SelectItem>
            {RISK_LEVELS.map((r) => (
              <SelectItem key={r} value={r}>
                {t(`riskLevels.${r}`)}
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
      ) : vendors.length === 0 ? (
        <Card className="p-8 text-center">
          <Building2 className="h-10 w-10 mx-auto text-muted-foreground/40 mb-4" />
          <p className="font-medium text-muted-foreground">{t("noVendors")}</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {t("noVendorsDescription")}
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
                <TableHead>{t("table.name")}</TableHead>
                <TableHead className="w-[220px]">{t("table.services")}</TableHead>
                <TableHead className="w-[120px]">{t("table.riskLevel")}</TableHead>
                <TableHead className="w-[130px]">{t("table.status")}</TableHead>
                <TableHead className="w-[120px]">{t("table.contractEnd")}</TableHead>
                <TableHead className="w-[100px]">{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>
                    <button
                      className="text-sm font-medium text-left hover:text-brand-purple transition-colors"
                      onClick={() => setViewingVendor(v)}
                    >
                      {v.name}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(v.service_types ?? []).map((st) => (
                        <Badge
                          key={st}
                          variant="outline"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {t(`serviceTypes.${st}`)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {v.risk_level ? (
                      <Badge
                        variant="outline"
                        className={RISK_COLORS[v.risk_level] ?? ""}
                      >
                        {t(`riskLevels.${v.risk_level}`)}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">{"\u2014"}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={STATUS_COLORS[v.status] ?? ""}
                    >
                      {t(`statuses.${v.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {v.contract_end_date
                      ? new Date(v.contract_end_date).toLocaleDateString("fr-CA")
                      : "\u2014"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setViewingVendor(v)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {!readOnly && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEditDialog(v)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => setDeleteConfirm(v.id)}
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
              {editingVendor ? t("edit") : t("create")}
            </DialogTitle>
            <DialogDescription>{t("pageDescription")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <Label>{t("form.name")}</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            {/* Service Types (badge toggles) */}
            <div>
              <Label>{t("form.serviceTypes")}</Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {SERVICE_TYPES.map((st) => (
                  <Badge
                    key={st}
                    variant={formServiceTypes.includes(st) ? "default" : "outline"}
                    className="cursor-pointer select-none"
                    onClick={() => toggleServiceType(st)}
                  >
                    {t(`serviceTypes.${st}`)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Website */}
            <div>
              <Label>{t("form.website")}</Label>
              <Input
                value={formWebsite}
                onChange={(e) => setFormWebsite(e.target.value)}
                placeholder="https://..."
              />
            </div>

            {/* Contact */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>{t("form.contactName")}</Label>
                <Input
                  value={formContactName}
                  onChange={(e) => setFormContactName(e.target.value)}
                />
              </div>
              <div>
                <Label>{t("form.contactEmail")}</Label>
                <Input
                  type="email"
                  value={formContactEmail}
                  onChange={(e) => setFormContactEmail(e.target.value)}
                />
              </div>
              <div>
                <Label>{t("form.contactPhone")}</Label>
                <Input
                  value={formContactPhone}
                  onChange={(e) => setFormContactPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Country / Region */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("form.country")}</Label>
                <Input
                  value={formCountry}
                  onChange={(e) => setFormCountry(e.target.value)}
                />
              </div>
              <div>
                <Label>{t("form.region")}</Label>
                <Input
                  value={formRegion}
                  onChange={(e) => setFormRegion(e.target.value)}
                />
              </div>
            </div>

            {/* Known subcontractors */}
            <div>
              <Label>{t("form.knownSubcontractors")}</Label>
              <Textarea
                value={formKnownSubcontractors}
                onChange={(e) => setFormKnownSubcontractors(e.target.value)}
                rows={2}
                placeholder={t("form.knownSubcontractorsPlaceholder")}
              />
            </div>

            {/* Linked AI systems (badge toggles) */}
            {aiSystems.length > 0 && (
              <div>
                <Label>{t("form.aiSystems")}</Label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {aiSystems.map((sys) => (
                    <Badge
                      key={sys.id}
                      variant={formAiSystemIds.includes(sys.id) ? "default" : "outline"}
                      className="cursor-pointer select-none"
                      onClick={() => toggleAiSystem(sys.id)}
                    >
                      {sys.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Contract dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("form.contractStartDate")}</Label>
                <Input
                  type="date"
                  value={formContractStartDate}
                  onChange={(e) => setFormContractStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label>{t("form.contractEndDate")}</Label>
                <Input
                  type="date"
                  value={formContractEndDate}
                  onChange={(e) => setFormContractEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Contract type & amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("form.contractType")}</Label>
                <Select value={formContractType} onValueChange={setFormContractType}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.selectType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{"\u2014"}</SelectItem>
                    {CONTRACT_TYPES.map((ct) => (
                      <SelectItem key={ct} value={ct}>
                        {t(`contractTypes.${ct}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("form.contractAmount")}</Label>
                <Input
                  type="number"
                  value={formContractAmount}
                  onChange={(e) => setFormContractAmount(e.target.value)}
                />
              </div>
            </div>

            {/* Contract clauses */}
            <div>
              <Label>{t("form.contractClauses")}</Label>
              <Textarea
                value={formContractClauses}
                onChange={(e) => setFormContractClauses(e.target.value)}
                rows={3}
                placeholder={t("form.contractClausesPlaceholder")}
              />
            </div>

            {/* SLA */}
            <div>
              <Label>{t("form.slaDetails")}</Label>
              <Textarea
                value={formSlaDetails}
                onChange={(e) => setFormSlaDetails(e.target.value)}
                rows={2}
                placeholder={t("form.slaDetailsPlaceholder")}
              />
            </div>

            {/* Risk level & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("form.riskLevel")}</Label>
                <Select value={formRiskLevel} onValueChange={setFormRiskLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.selectRisk")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{"\u2014"}</SelectItem>
                    {RISK_LEVELS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {t(`riskLevels.${r}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("form.status")}</Label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.selectStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {t(`statuses.${s}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formName.trim() ||
                createVendor.isPending ||
                updateVendor.isPending
              }
            >
              {editingVendor ? t("edit") : t("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/*  DETAIL SHEET                                                 */}
      {/* ============================================================ */}
      <Sheet open={!!viewingVendor} onOpenChange={() => setViewingVendor(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {viewingVendor && (
            <>
              <SheetHeader>
                <SheetTitle>{viewingVendor.name}</SheetTitle>
                <SheetDescription>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <Badge
                      variant="outline"
                      className={STATUS_COLORS[viewingVendor.status] ?? ""}
                    >
                      {t(`statuses.${viewingVendor.status}`)}
                    </Badge>
                    {viewingVendor.risk_level && (
                      <Badge
                        variant="outline"
                        className={RISK_COLORS[viewingVendor.risk_level] ?? ""}
                      >
                        {t(`riskLevels.${viewingVendor.risk_level}`)}
                      </Badge>
                    )}
                  </div>
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-5">
                {/* Service types */}
                {(viewingVendor.service_types ?? []).length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      {t("form.serviceTypes")}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingVendor.service_types.map((st) => (
                        <Badge key={st} variant="outline" className="text-xs">
                          {t(`serviceTypes.${st}`)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Website */}
                {viewingVendor.website && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      {t("form.website")}
                    </h4>
                    <a
                      href={viewingVendor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {viewingVendor.website}
                    </a>
                  </div>
                )}

                {/* Contact */}
                {(viewingVendor.contact_name ||
                  viewingVendor.contact_email ||
                  viewingVendor.contact_phone) && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      {t("form.contactName")}
                    </h4>
                    <div className="text-sm space-y-0.5">
                      {viewingVendor.contact_name && (
                        <p>{viewingVendor.contact_name}</p>
                      )}
                      {viewingVendor.contact_email && (
                        <p className="text-muted-foreground">
                          {viewingVendor.contact_email}
                        </p>
                      )}
                      {viewingVendor.contact_phone && (
                        <p className="text-muted-foreground">
                          {viewingVendor.contact_phone}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Country / Region */}
                {(viewingVendor.country || viewingVendor.region) && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      {t("form.country")} / {t("form.region")}
                    </h4>
                    <p className="text-sm">
                      {[viewingVendor.country, viewingVendor.region]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                )}

                {/* Known subcontractors */}
                {viewingVendor.known_subcontractors && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      {t("form.knownSubcontractors")}
                    </h4>
                    <p className="text-sm whitespace-pre-wrap">
                      {viewingVendor.known_subcontractors}
                    </p>
                  </div>
                )}

                {/* AI Systems */}
                {(viewingVendor.ai_system_ids ?? []).length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      {t("form.aiSystems")}
                    </h4>
                    <p className="text-sm">
                      {getSystemName(viewingVendor.ai_system_ids)}
                    </p>
                  </div>
                )}

                {/* Contract details */}
                {(viewingVendor.contract_start_date ||
                  viewingVendor.contract_end_date ||
                  viewingVendor.contract_type ||
                  viewingVendor.contract_amount != null) && (
                  <div className="p-3 rounded-lg bg-muted/50 border space-y-1">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Contrat
                    </h4>
                    {viewingVendor.contract_type && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">
                          {t("form.contractType")}:
                        </span>{" "}
                        {t(`contractTypes.${viewingVendor.contract_type}`)}
                      </p>
                    )}
                    {viewingVendor.contract_amount != null && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">
                          {t("form.contractAmount")}:
                        </span>{" "}
                        {Number(viewingVendor.contract_amount).toLocaleString()} $
                      </p>
                    )}
                    {viewingVendor.contract_start_date && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">
                          {t("form.contractStartDate")}:
                        </span>{" "}
                        {new Date(
                          viewingVendor.contract_start_date
                        ).toLocaleDateString("fr-CA")}
                      </p>
                    )}
                    {viewingVendor.contract_end_date && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">
                          {t("form.contractEndDate")}:
                        </span>{" "}
                        {new Date(
                          viewingVendor.contract_end_date
                        ).toLocaleDateString("fr-CA")}
                      </p>
                    )}
                  </div>
                )}

                {/* Contract clauses */}
                {viewingVendor.contract_clauses && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      {t("form.contractClauses")}
                    </h4>
                    <p className="text-sm whitespace-pre-wrap">
                      {viewingVendor.contract_clauses}
                    </p>
                  </div>
                )}

                {/* SLA */}
                {viewingVendor.sla_details && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      {t("form.slaDetails")}
                    </h4>
                    <p className="text-sm whitespace-pre-wrap">
                      {viewingVendor.sla_details}
                    </p>
                  </div>
                )}

                {/* Metadata */}
                <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
                  <p>
                    {"Cr\u00e9\u00e9 le "}
                    {new Date(viewingVendor.created_at).toLocaleDateString(
                      "fr-CA"
                    )}
                  </p>
                  <p>
                    {"Mis \u00e0 jour le "}
                    {new Date(viewingVendor.updated_at).toLocaleDateString(
                      "fr-CA"
                    )}
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
              disabled={deleteVendor.isPending}
            >
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
