import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Database,
  Plus,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

import {
  useDatasets,
  useCreateDataset,
  useUpdateDataset,
  useDeleteDataset,
} from "@/hooks/useData";
import type { Dataset } from "@/types/database";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { DATA_STATUS_COLORS } from "@/portail/constants/colors";
import { DEMO_DATASETS } from "@/portail/demo";
import { Search } from "lucide-react";

/* ================================================================== */
/*  CONSTANTS                                                          */
/* ================================================================== */

const ALL = "__all__";
const NONE = "__none__";

const SOURCES = [
  "internal_db", "client_provided", "vendor_api", "public_dataset",
  "web_scraping", "synthetic", "third_party", "other",
] as const;

const DATA_CATEGORIES = [
  "identifiers", "demographic", "financial", "health", "biometric",
  "location", "behavioral", "professional", "opinions", "judicial", "non_personal",
] as const;

const CLASSIFICATIONS = ["none", "personal", "sensitive"] as const;
const VOLUMES = ["lt_1k", "1k_10k", "10k_100k", "100k_1m", "gt_1m"] as const;
const QUALITIES = ["high", "medium", "low", "unknown"] as const;
const FRESHNESSES = ["realtime", "daily", "weekly", "monthly", "static"] as const;
const FORMATS = ["structured_db", "csv", "json", "images", "text", "audio", "video", "mixed"] as const;
const LEGAL_BASES = ["consent", "contract", "legal_obligation", "legitimate_interest", "vital_interest", "public_interest"] as const;
const DESTRUCTION_POLICIES = ["auto_delete", "manual_review", "anonymization", "archival"] as const;
const RETENTION_UNITS = ["days", "months", "years"] as const;
const DATASET_STATUSES = ["active", "archived", "pending_deletion"] as const;

const CLASSIFICATION_VARIANTS: Record<string, "secondary" | "default" | "destructive"> = {
  none: "secondary",
  personal: "default",
  sensitive: "destructive",
};

const STATUS_COLORS = DATA_STATUS_COLORS;

/* ================================================================== */
/*  PROPS                                                              */
/* ================================================================== */

interface DatasetsTabProps {
  readOnly: boolean;
  isPreview: boolean;
  aiSystems: { id: string; name: string }[];
  getSystemName: (ids: string[]) => string;
}

/* ================================================================== */
/*  COMPONENT                                                          */
/* ================================================================== */

export function DatasetsTab({ readOnly, isPreview, aiSystems, getSystemName }: DatasetsTabProps) {
  const { t } = useTranslation("data");

  /* ---- filters ---- */
  const [dsSearchQuery, setDsSearchQuery] = useState("");
  const [dsSourceFilter, setDsSourceFilter] = useState(ALL);
  const [dsClassFilter, setDsClassFilter] = useState(ALL);

  /* ---- dialog state ---- */
  const [dsDialogOpen, setDsDialogOpen] = useState(false);
  const [editingDataset, setEditingDataset] = useState<Dataset | null>(null);
  const [viewingDataset, setViewingDataset] = useState<Dataset | null>(null);
  const [dsDeleteConfirm, setDsDeleteConfirm] = useState<string | null>(null);

  /* ---- data ---- */
  const { data: rawDatasets = [], isLoading: dsLoading } = useDatasets({
    source: dsSourceFilter === ALL ? undefined : dsSourceFilter,
    classification: dsClassFilter === ALL ? undefined : dsClassFilter,
    search: dsSearchQuery || undefined,
  });
  const datasets = isPreview ? DEMO_DATASETS : rawDatasets;
  const createDataset = useCreateDataset();
  const updateDataset = useUpdateDataset();
  const deleteDataset = useDeleteDataset();

  /* ---- form state ---- */
  const [formDsName, setFormDsName] = useState("");
  const [formDsDescription, setFormDsDescription] = useState("");
  const [formDsSource, setFormDsSource] = useState("");
  const [formDsCategories, setFormDsCategories] = useState<string[]>([]);
  const [formDsClassification, setFormDsClassification] = useState("none");
  const [formDsVolume, setFormDsVolume] = useState(NONE);
  const [formDsQuality, setFormDsQuality] = useState(NONE);
  const [formDsFreshness, setFormDsFreshness] = useState(NONE);
  const [formDsStorageLocations, setFormDsStorageLocations] = useState("");
  const [formDsFormat, setFormDsFormat] = useState(NONE);
  const [formDsLegalBasis, setFormDsLegalBasis] = useState(NONE);
  const [formDsDeclaredPurpose, setFormDsDeclaredPurpose] = useState("");
  const [formDsConsentObtained, setFormDsConsentObtained] = useState(false);
  const [formDsRetentionDuration, setFormDsRetentionDuration] = useState("");
  const [formDsRetentionUnit, setFormDsRetentionUnit] = useState(NONE);
  const [formDsDestructionPolicy, setFormDsDestructionPolicy] = useState(NONE);
  const [formDsAiSystemIds, setFormDsAiSystemIds] = useState<string[]>([]);
  const [formDsStatus, setFormDsStatus] = useState("active");

  /* ---- helpers ---- */
  const toggleDsCategory = (cat: string) => {
    setFormDsCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleDsAiSystem = (sysId: string) => {
    setFormDsAiSystemIds((prev) =>
      prev.includes(sysId) ? prev.filter((x) => x !== sysId) : [...prev, sysId]
    );
  };

  const resetDsForm = () => {
    setFormDsName(""); setFormDsDescription(""); setFormDsSource("");
    setFormDsCategories([]); setFormDsClassification("none");
    setFormDsVolume(NONE); setFormDsQuality(NONE); setFormDsFreshness(NONE);
    setFormDsStorageLocations(""); setFormDsFormat(NONE);
    setFormDsLegalBasis(NONE); setFormDsDeclaredPurpose("");
    setFormDsConsentObtained(false); setFormDsRetentionDuration("");
    setFormDsRetentionUnit(NONE); setFormDsDestructionPolicy(NONE);
    setFormDsAiSystemIds([]); setFormDsStatus("active");
  };

  const openDsCreate = () => {
    setEditingDataset(null);
    resetDsForm();
    setDsDialogOpen(true);
  };

  const openDsEdit = (ds: Dataset) => {
    setEditingDataset(ds);
    setFormDsName(ds.name);
    setFormDsDescription(ds.description ?? "");
    setFormDsSource(ds.source);
    setFormDsCategories(ds.data_categories ?? []);
    setFormDsClassification(ds.classification);
    setFormDsVolume(ds.volume ?? NONE);
    setFormDsQuality(ds.quality ?? NONE);
    setFormDsFreshness(ds.freshness ?? NONE);
    setFormDsStorageLocations((ds.storage_locations ?? []).join(", "));
    setFormDsFormat(ds.format ?? NONE);
    setFormDsLegalBasis(ds.legal_basis ?? NONE);
    setFormDsDeclaredPurpose(ds.declared_purpose ?? "");
    setFormDsConsentObtained(ds.consent_obtained);
    setFormDsRetentionDuration(ds.retention_duration != null ? String(ds.retention_duration) : "");
    setFormDsRetentionUnit(ds.retention_unit ?? NONE);
    setFormDsDestructionPolicy(ds.destruction_policy ?? NONE);
    setFormDsAiSystemIds(ds.ai_system_ids ?? []);
    setFormDsStatus(ds.status);
    setDsDialogOpen(true);
  };

  const handleDsSubmit = () => {
    if (!formDsName.trim() || !formDsSource) return;

    const payload = {
      name: formDsName.trim(),
      description: formDsDescription.trim() || null,
      source: formDsSource,
      data_categories: formDsCategories,
      classification: formDsClassification,
      volume: formDsVolume === NONE ? null : formDsVolume,
      quality: formDsQuality === NONE ? null : formDsQuality,
      freshness: formDsFreshness === NONE ? null : formDsFreshness,
      storage_locations: formDsStorageLocations.split(",").map((s) => s.trim()).filter(Boolean),
      format: formDsFormat === NONE ? null : formDsFormat,
      legal_basis: formDsLegalBasis === NONE ? null : formDsLegalBasis,
      declared_purpose: formDsDeclaredPurpose.trim() || null,
      consent_obtained: formDsConsentObtained,
      retention_duration: formDsRetentionDuration ? Number(formDsRetentionDuration) : null,
      retention_unit: formDsRetentionUnit === NONE ? null : formDsRetentionUnit,
      destruction_policy: formDsDestructionPolicy === NONE ? null : formDsDestructionPolicy,
      ai_system_ids: formDsAiSystemIds,
      status: formDsStatus,
    };

    if (editingDataset) {
      updateDataset.mutate(
        { id: editingDataset.id, ...payload },
        { onSuccess: () => { toast.success(t("messages.datasetUpdated")); setDsDialogOpen(false); } }
      );
    } else {
      createDataset.mutate(payload, {
        onSuccess: () => { toast.success(t("messages.datasetCreated")); setDsDialogOpen(false); },
      });
    }
  };

  const handleDsDelete = (id: string) => {
    deleteDataset.mutate(
      { id },
      { onSuccess: () => { toast.success(t("messages.datasetDeleted")); setDsDeleteConfirm(null); } }
    );
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("search")} value={dsSearchQuery} onChange={(e) => setDsSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={dsSourceFilter} onValueChange={setDsSourceFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder={t("filters.filterBySource")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("filters.allSources")}</SelectItem>
            {SOURCES.map((s) => <SelectItem key={s} value={s}>{t(`sources.${s}`)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={dsClassFilter} onValueChange={setDsClassFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder={t("filters.filterByClassification")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("filters.allClassifications")}</SelectItem>
            {CLASSIFICATIONS.map((c) => <SelectItem key={c} value={c}>{t(`classifications.${c}`)}</SelectItem>)}
          </SelectContent>
        </Select>
        {!readOnly && (
          <Button size="sm" className="ml-auto gap-1.5" onClick={openDsCreate}>
            <Plus className="h-4 w-4" />{t("create")}
          </Button>
        )}
      </div>

      {/* Dataset table */}
      {dsLoading && !isPreview ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : datasets.length === 0 ? (
        <Card className="p-8 text-center">
          <Database className="h-10 w-10 mx-auto text-muted-foreground/40 mb-4" />
          <p className="font-medium text-muted-foreground">{t("noDatasets")}</p>
          <p className="text-sm text-muted-foreground/70 mt-1">{t("noDatasetsDescription")}</p>
          {!readOnly && (
            <Button size="sm" className="mt-4 gap-1.5" onClick={openDsCreate}>
              <Plus className="h-4 w-4" />{t("create")}
            </Button>
          )}
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.name")}</TableHead>
                <TableHead className="w-[160px]">{t("table.source")}</TableHead>
                <TableHead className="w-[140px]">{t("table.classification")}</TableHead>
                <TableHead className="w-[120px]">{t("table.volume")}</TableHead>
                <TableHead className="w-[130px]">{t("table.status")}</TableHead>
                <TableHead className="w-[100px]">{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datasets.map((ds) => (
                <TableRow key={ds.id}>
                  <TableCell>
                    <button className="text-sm font-medium text-left hover:text-brand-forest transition-colors" onClick={() => setViewingDataset(ds)}>
                      {ds.name}
                    </button>
                  </TableCell>
                  <TableCell className="text-sm">{t(`sources.${ds.source}`)}</TableCell>
                  <TableCell>
                    <Badge variant={CLASSIFICATION_VARIANTS[ds.classification] ?? "secondary"}>
                      {t(`classifications.${ds.classification}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {ds.volume ? t(`volumes.${ds.volume}`) : "\u2014"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_COLORS[ds.status] ?? ""}>
                      {t(`statuses.${ds.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewingDataset(ds)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {!readOnly && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openDsEdit(ds)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDsDeleteConfirm(ds.id)}>
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

      {/* Dataset Create / Edit Dialog */}
      <Dialog open={dsDialogOpen} onOpenChange={setDsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDataset ? t("edit") : t("create")}</DialogTitle>
            <DialogDescription>{t("pageDescription")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div><Label>{t("form.name")}</Label><Input value={formDsName} onChange={(e) => setFormDsName(e.target.value)} /></div>
            <div><Label>{t("form.description")}</Label><Textarea value={formDsDescription} onChange={(e) => setFormDsDescription(e.target.value)} rows={2} placeholder={t("form.descriptionPlaceholder")} /></div>
            <div>
              <Label>{t("form.source")}</Label>
              <Select value={formDsSource} onValueChange={setFormDsSource}>
                <SelectTrigger><SelectValue placeholder={t("form.selectSource")} /></SelectTrigger>
                <SelectContent>{SOURCES.map((s) => <SelectItem key={s} value={s}>{t(`sources.${s}`)}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t("form.dataCategories")}</Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {DATA_CATEGORIES.map((cat) => (
                  <Badge key={cat} variant={formDsCategories.includes(cat) ? "default" : "outline"} className="cursor-pointer select-none" onClick={() => toggleDsCategory(cat)}>
                    {t(`dataCategories.${cat}`)}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("form.classification")}</Label>
                <Select value={formDsClassification} onValueChange={setFormDsClassification}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CLASSIFICATIONS.map((c) => <SelectItem key={c} value={c}>{t(`classifications.${c}`)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("form.volume")}</Label>
                <Select value={formDsVolume} onValueChange={setFormDsVolume}>
                  <SelectTrigger><SelectValue placeholder={"\u2014"} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>{"\u2014"}</SelectItem>
                    {VOLUMES.map((v) => <SelectItem key={v} value={v}>{t(`volumes.${v}`)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("form.quality")}</Label>
                <Select value={formDsQuality} onValueChange={setFormDsQuality}>
                  <SelectTrigger><SelectValue placeholder={"\u2014"} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>{"\u2014"}</SelectItem>
                    {QUALITIES.map((q) => <SelectItem key={q} value={q}>{t(`qualities.${q}`)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("form.freshness")}</Label>
                <Select value={formDsFreshness} onValueChange={setFormDsFreshness}>
                  <SelectTrigger><SelectValue placeholder={"\u2014"} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>{"\u2014"}</SelectItem>
                    {FRESHNESSES.map((f) => <SelectItem key={f} value={f}>{t(`freshnesses.${f}`)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t("form.storageLocations")}</Label><Input value={formDsStorageLocations} onChange={(e) => setFormDsStorageLocations(e.target.value)} placeholder="AWS S3, Azure Blob..." /></div>
              <div>
                <Label>{t("form.format")}</Label>
                <Select value={formDsFormat} onValueChange={setFormDsFormat}>
                  <SelectTrigger><SelectValue placeholder={"\u2014"} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>{"\u2014"}</SelectItem>
                    {FORMATS.map((f) => <SelectItem key={f} value={f}>{t(`formats.${f}`)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>{t("form.legalBasis")}</Label>
              <Select value={formDsLegalBasis} onValueChange={setFormDsLegalBasis}>
                <SelectTrigger><SelectValue placeholder={t("form.selectLegalBasis")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>{"\u2014"}</SelectItem>
                  {LEGAL_BASES.map((lb) => <SelectItem key={lb} value={lb}>{t(`legalBases.${lb}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div><Label>{t("form.declaredPurpose")}</Label><Textarea value={formDsDeclaredPurpose} onChange={(e) => setFormDsDeclaredPurpose(e.target.value)} rows={2} placeholder={t("form.declaredPurposePlaceholder")} /></div>

            <div className="flex items-center gap-3">
              <Switch checked={formDsConsentObtained} onCheckedChange={setFormDsConsentObtained} />
              <Label>{t("form.consentObtained")}</Label>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div><Label>{t("form.retentionDuration")}</Label><Input type="number" value={formDsRetentionDuration} onChange={(e) => setFormDsRetentionDuration(e.target.value)} /></div>
              <div>
                <Label>{t("form.retentionUnit")}</Label>
                <Select value={formDsRetentionUnit} onValueChange={setFormDsRetentionUnit}>
                  <SelectTrigger><SelectValue placeholder={"\u2014"} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>{"\u2014"}</SelectItem>
                    {RETENTION_UNITS.map((u) => <SelectItem key={u} value={u}>{t(`retentionUnits.${u}`)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("form.destructionPolicy")}</Label>
                <Select value={formDsDestructionPolicy} onValueChange={setFormDsDestructionPolicy}>
                  <SelectTrigger><SelectValue placeholder={t("form.selectDestructionPolicy")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>{"\u2014"}</SelectItem>
                    {DESTRUCTION_POLICIES.map((dp) => <SelectItem key={dp} value={dp}>{t(`destructionPolicies.${dp}`)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {aiSystems.length > 0 && (
              <div>
                <Label>{t("form.aiSystems")}</Label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {aiSystems.map((sys) => (
                    <Badge key={sys.id} variant={formDsAiSystemIds.includes(sys.id) ? "default" : "outline"} className="cursor-pointer select-none" onClick={() => toggleDsAiSystem(sys.id)}>
                      {sys.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label>{t("table.status")}</Label>
              <Select value={formDsStatus} onValueChange={setFormDsStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DATASET_STATUSES.map((s) => <SelectItem key={s} value={s}>{t(`statuses.${s}`)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDsDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleDsSubmit} disabled={!formDsName.trim() || !formDsSource || createDataset.isPending || updateDataset.isPending}>
              {editingDataset ? t("edit") : t("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dataset Detail Sheet */}
      <Sheet open={!!viewingDataset} onOpenChange={() => setViewingDataset(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {viewingDataset && (
            <>
              <SheetHeader>
                <SheetTitle>{viewingDataset.name}</SheetTitle>
                <SheetDescription>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <Badge variant={CLASSIFICATION_VARIANTS[viewingDataset.classification] ?? "secondary"}>
                      {t(`classifications.${viewingDataset.classification}`)}
                    </Badge>
                    <Badge variant="outline" className={STATUS_COLORS[viewingDataset.status] ?? ""}>
                      {t(`statuses.${viewingDataset.status}`)}
                    </Badge>
                  </div>
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-5">
                {viewingDataset.description && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{t("form.description")}</h4>
                    <p className="text-sm whitespace-pre-wrap">{viewingDataset.description}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{t("form.source")}</h4>
                  <p className="text-sm">{t(`sources.${viewingDataset.source}`)}</p>
                </div>
                {(viewingDataset.data_categories ?? []).length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{t("form.dataCategories")}</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingDataset.data_categories.map((cat) => (
                        <Badge key={cat} variant="outline" className="text-xs">{t(`dataCategories.${cat}`)}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {viewingDataset.volume && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{t("form.volume")}</h4>
                      <p className="text-sm">{t(`volumes.${viewingDataset.volume}`)}</p>
                    </div>
                  )}
                  {viewingDataset.quality && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{t("form.quality")}</h4>
                      <p className="text-sm">{t(`qualities.${viewingDataset.quality}`)}</p>
                    </div>
                  )}
                  {viewingDataset.freshness && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{t("form.freshness")}</h4>
                      <p className="text-sm">{t(`freshnesses.${viewingDataset.freshness}`)}</p>
                    </div>
                  )}
                  {viewingDataset.format && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{t("form.format")}</h4>
                      <p className="text-sm">{t(`formats.${viewingDataset.format}`)}</p>
                    </div>
                  )}
                </div>

                {(viewingDataset.storage_locations ?? []).length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{t("form.storageLocations")}</h4>
                    <p className="text-sm">{viewingDataset.storage_locations.join(", ")}</p>
                  </div>
                )}

                {viewingDataset.legal_basis && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{t("form.legalBasis")}</h4>
                    <p className="text-sm">{t(`legalBases.${viewingDataset.legal_basis}`)}</p>
                  </div>
                )}

                {viewingDataset.declared_purpose && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{t("form.declaredPurpose")}</h4>
                    <p className="text-sm whitespace-pre-wrap">{viewingDataset.declared_purpose}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{t("form.consentObtained")}</h4>
                  <Badge variant={viewingDataset.consent_obtained ? "default" : "secondary"}>
                    {viewingDataset.consent_obtained ? "Oui" : "Non"}
                  </Badge>
                </div>

                {viewingDataset.retention_duration != null && (
                  <div className="p-3 rounded-lg bg-muted/50 border space-y-1">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t("form.retentionDuration")}</h4>
                    <p className="text-sm">
                      {viewingDataset.retention_duration}{" "}
                      {viewingDataset.retention_unit ? t(`retentionUnits.${viewingDataset.retention_unit}`) : ""}
                    </p>
                    {viewingDataset.destruction_policy && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">{t("form.destructionPolicy")}:</span>{" "}
                        {t(`destructionPolicies.${viewingDataset.destruction_policy}`)}
                      </p>
                    )}
                  </div>
                )}

                {(viewingDataset.ai_system_ids ?? []).length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{t("form.aiSystems")}</h4>
                    <p className="text-sm">{getSystemName(viewingDataset.ai_system_ids)}</p>
                  </div>
                )}

                <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
                  <p>{"Cree le "}{new Date(viewingDataset.created_at).toLocaleDateString("fr-CA")}</p>
                  <p>{"Mis a jour le "}{new Date(viewingDataset.updated_at).toLocaleDateString("fr-CA")}</p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Dataset Delete Confirmation */}
      <Dialog open={!!dsDeleteConfirm} onOpenChange={() => setDsDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("delete")}</DialogTitle>
            <DialogDescription>{t("messages.deleteDatasetConfirm")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDsDeleteConfirm(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => dsDeleteConfirm && handleDsDelete(dsDeleteConfirm)} disabled={deleteDataset.isPending}>
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
