import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Activity,
  Plus,
  Pencil,
  Trash2,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import { usePermissions } from "@/hooks/usePermissions";
import { useAiSystems } from "@/hooks/useAiSystems";
import {
  useMonitoringMetrics,
  useCreateMonitoringMetric,
  useUpdateMonitoringMetric,
  useDeleteMonitoringMetric,
  useMonitoringDataPoints,
  useAddDataPoint,
} from "@/hooks/useMonitoring";
import type { MonitoringMetric } from "@/types/database";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

/* ------------------------------------------------------------------ */
/*  CONSTANTS                                                          */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
  "performance",
  "latency",
  "volume",
  "errors",
  "drift_data",
  "drift_model",
  "quality",
  "feedback",
  "custom",
] as const;

const DIRECTIONS = [
  "higher_is_better",
  "lower_is_better",
  "target_range",
] as const;

const FREQUENCIES = [
  "realtime",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "on_demand",
] as const;

const SOURCES = [
  "manual_input",
  "csv_import",
  "api_webhook",
  "scheduled_report",
] as const;

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

function alertBadgeClass(level: string | null) {
  switch (level) {
    case "ok":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "warning":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "critical":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

/* ------------------------------------------------------------------ */
/*  FORM TYPES                                                         */
/* ------------------------------------------------------------------ */

interface MetricFormData {
  ai_system_id: string;
  name: string;
  category: string;
  unit: string;
  direction: string;
  target_value: string;
  warning_threshold: string;
  critical_threshold: string;
  acceptable_min: string;
  acceptable_max: string;
  collection_frequency: string;
  source: string;
}

const emptyMetricForm: MetricFormData = {
  ai_system_id: "",
  name: "",
  category: "",
  unit: "",
  direction: "higher_is_better",
  target_value: "",
  warning_threshold: "",
  critical_threshold: "",
  acceptable_min: "",
  acceptable_max: "",
  collection_frequency: "daily",
  source: "manual_input",
};

interface DataPointFormData {
  value: string;
  recorded_at: string;
  notes: string;
}

const emptyDataPointForm: DataPointFormData = {
  value: "",
  recorded_at: new Date().toISOString().slice(0, 16),
  notes: "",
};

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export default function MonitoringPage() {
  const { t } = useTranslation("monitoring");
  const { can } = usePermissions();
  const readOnly = !can("configure_monitoring");

  /* --- filters --- */
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("__all__");
  const [filterSystem, setFilterSystem] = useState("__all__");

  /* --- data --- */
  const { data: metrics = [], isLoading, isError } = useMonitoringMetrics({
    category: filterCategory !== "__all__" ? filterCategory : undefined,
    ai_system_id: filterSystem !== "__all__" ? filterSystem : undefined,
    search: search || undefined,
  });
  const { data: systems = [] } = useAiSystems();

  const createMutation = useCreateMonitoringMetric();
  const updateMutation = useUpdateMonitoringMetric();
  const deleteMutation = useDeleteMonitoringMetric();
  const addDataPointMutation = useAddDataPoint();

  /* --- metric dialog state --- */
  const [metricDialogOpen, setMetricDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MonitoringMetric | null>(null);
  const [metricForm, setMetricForm] = useState<MetricFormData>(emptyMetricForm);
  const [deleting, setDeleting] = useState<MonitoringMetric | null>(null);

  /* --- data points state --- */
  const [selectedMetricId, setSelectedMetricId] = useState<string | null>(null);
  const { data: dataPoints = [] } = useMonitoringDataPoints(selectedMetricId);
  const [dataPointDialogOpen, setDataPointDialogOpen] = useState(false);
  const [dataPointForm, setDataPointForm] = useState<DataPointFormData>(emptyDataPointForm);

  /* --- helpers --- */
  function getSystemName(id: string) {
    return systems.find((s) => s.id === id)?.name ?? "—";
  }

  /* --- metric handlers --- */
  function openCreateMetric() {
    setEditing(null);
    setMetricForm(emptyMetricForm);
    setMetricDialogOpen(true);
  }

  function openEditMetric(m: MonitoringMetric) {
    setEditing(m);
    setMetricForm({
      ai_system_id: m.ai_system_id,
      name: m.name,
      category: m.category,
      unit: m.unit ?? "",
      direction: m.direction,
      target_value: m.target_value != null ? String(m.target_value) : "",
      warning_threshold: m.warning_threshold != null ? String(m.warning_threshold) : "",
      critical_threshold: m.critical_threshold != null ? String(m.critical_threshold) : "",
      acceptable_min: m.acceptable_min != null ? String(m.acceptable_min) : "",
      acceptable_max: m.acceptable_max != null ? String(m.acceptable_max) : "",
      collection_frequency: m.collection_frequency,
      source: m.source,
    });
    setMetricDialogOpen(true);
  }

  async function handleSaveMetric() {
    if (!metricForm.name || !metricForm.ai_system_id || !metricForm.category) return;

    const payload = {
      ai_system_id: metricForm.ai_system_id,
      name: metricForm.name,
      category: metricForm.category,
      unit: metricForm.unit || null,
      direction: metricForm.direction,
      target_value: metricForm.target_value ? Number(metricForm.target_value) : null,
      warning_threshold: metricForm.warning_threshold ? Number(metricForm.warning_threshold) : null,
      critical_threshold: metricForm.critical_threshold ? Number(metricForm.critical_threshold) : null,
      acceptable_min: metricForm.acceptable_min ? Number(metricForm.acceptable_min) : null,
      acceptable_max: metricForm.acceptable_max ? Number(metricForm.acceptable_max) : null,
      collection_frequency: metricForm.collection_frequency,
      source: metricForm.source,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, ...payload });
        toast.success(t("messages.metricUpdated"));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t("messages.metricCreated"));
      }
      setMetricDialogOpen(false);
    } catch {
      toast.error("Error");
    }
  }

  async function handleDeleteMetric() {
    if (!deleting) return;
    try {
      await deleteMutation.mutateAsync({ id: deleting.id });
      toast.success(t("messages.metricDeleted"));
      setDeleting(null);
    } catch {
      toast.error("Error");
    }
  }

  /* --- data point handlers --- */
  function openAddDataPoint() {
    setDataPointForm(emptyDataPointForm);
    setDataPointDialogOpen(true);
  }

  async function handleSaveDataPoint() {
    if (!selectedMetricId || !dataPointForm.value) return;

    try {
      await addDataPointMutation.mutateAsync({
        metric_id: selectedMetricId,
        value: Number(dataPointForm.value),
        recorded_at: dataPointForm.recorded_at
          ? new Date(dataPointForm.recorded_at).toISOString()
          : new Date().toISOString(),
        notes: dataPointForm.notes || null,
      });
      toast.success(t("messages.dataPointAdded"));
      setDataPointDialogOpen(false);
    } catch {
      toast.error("Error");
    }
  }

  /* --- render --- */
  if (isError) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <Activity className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {t("errorLoading", { defaultValue: "Erreur de chargement des données." })}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-brand-purple" />
            {t("pageTitle")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("pageDescription")}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="metrics">
        <TabsList>
          <TabsTrigger value="metrics">{t("tabs.metrics")}</TabsTrigger>
          <TabsTrigger value="dataPoints">{t("tabs.dataPoints")}</TabsTrigger>
        </TabsList>

        {/* ============================================================ */}
        {/*  TAB 1: METRICS CONFIGURATION                                */}
        {/* ============================================================ */}
        <TabsContent value="metrics" className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("filters.filterByCategory")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t("filters.allCategories")}</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {t(`categories.${c}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSystem} onValueChange={setFilterSystem}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("filters.filterBySystem")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t("filters.allSystems")}</SelectItem>
                {systems.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!readOnly && (
              <Button onClick={openCreateMetric}>
                <Plus className="h-4 w-4 mr-2" />
                {t("create")}
              </Button>
            )}
          </div>

          {/* Metrics Table */}
          {isLoading ? (
            <Card className="p-8 text-center text-muted-foreground">...</Card>
          ) : metrics.length === 0 ? (
            <Card className="p-12 text-center">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold text-lg">{t("noMetrics")}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t("noMetricsDescription")}
              </p>
              {!readOnly && (
                <Button className="mt-4" onClick={openCreateMetric}>
                  <Plus className="h-4 w-4 mr-2" />
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
                    <TableHead>{t("table.category")}</TableHead>
                    <TableHead>{t("table.system")}</TableHead>
                    <TableHead>{t("table.unit")}</TableHead>
                    <TableHead>{t("table.frequency")}</TableHead>
                    <TableHead>{t("table.status")}</TableHead>
                    <TableHead className="text-right">{t("table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium max-w-[250px] truncate">
                        {m.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {t(`categories.${m.category}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {getSystemName(m.ai_system_id)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {m.unit ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {t(`frequencies.${m.collection_frequency}`)}
                      </TableCell>
                      <TableCell>
                        {m.is_active ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!readOnly && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditMetric(m)}
                                title={t("edit")}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleting(m)}
                                title={t("delete")}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
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
        </TabsContent>

        {/* ============================================================ */}
        {/*  TAB 2: DATA ENTRY                                           */}
        {/* ============================================================ */}
        <TabsContent value="dataPoints" className="space-y-4">
          {/* Metric selector + add button */}
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={selectedMetricId ?? "__none__"}
              onValueChange={(v) =>
                setSelectedMetricId(v === "__none__" ? null : v)
              }
            >
              <SelectTrigger className="w-[350px]">
                <SelectValue placeholder={t("form.selectSystem")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">—</SelectItem>
                {metrics.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} ({getSystemName(m.ai_system_id)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!readOnly && selectedMetricId && (
              <Button onClick={openAddDataPoint}>
                <Plus className="h-4 w-4 mr-2" />
                {t("addDataPoint")}
              </Button>
            )}
          </div>

          {/* Data Points Table */}
          {!selectedMetricId ? (
            <Card className="p-12 text-center">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold text-lg">{t("noDataPoints")}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t("noDataPointsDescription")}
              </p>
            </Card>
          ) : dataPoints.length === 0 ? (
            <Card className="p-12 text-center">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold text-lg">{t("noDataPoints")}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t("noDataPointsDescription")}
              </p>
              {!readOnly && (
                <Button className="mt-4" onClick={openAddDataPoint}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("addDataPoint")}
                </Button>
              )}
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("table.value")}</TableHead>
                    <TableHead>{t("table.date")}</TableHead>
                    <TableHead>{t("table.alertLevel")}</TableHead>
                    <TableHead>{t("table.notes")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataPoints.map((dp) => (
                    <TableRow key={dp.id}>
                      <TableCell className="font-medium">
                        {dp.value}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {dp.recorded_at
                          ? new Date(dp.recorded_at).toLocaleString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {dp.alert_level ? (
                          <Badge className={alertBadgeClass(dp.alert_level)}>
                            {t(`alertLevels.${dp.alert_level}`)}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                        {dp.notes ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* ============================================================ */}
      {/*  CREATE / EDIT METRIC DIALOG                                  */}
      {/* ============================================================ */}
      <Dialog open={metricDialogOpen} onOpenChange={setMetricDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? t("edit") : t("create")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* AI System */}
            <div className="space-y-2">
              <Label>{t("form.aiSystem")}</Label>
              <Select
                value={metricForm.ai_system_id}
                onValueChange={(v) =>
                  setMetricForm({ ...metricForm, ai_system_id: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("form.selectSystem")} />
                </SelectTrigger>
                <SelectContent>
                  {systems.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label>{t("form.name")}</Label>
              <Input
                value={metricForm.name}
                onChange={(e) =>
                  setMetricForm({ ...metricForm, name: e.target.value })
                }
              />
            </div>

            {/* Category + Direction */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("form.category")}</Label>
                <Select
                  value={metricForm.category}
                  onValueChange={(v) =>
                    setMetricForm({ ...metricForm, category: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {t(`categories.${c}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("form.direction")}</Label>
                <Select
                  value={metricForm.direction}
                  onValueChange={(v) =>
                    setMetricForm({ ...metricForm, direction: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.selectDirection")} />
                  </SelectTrigger>
                  <SelectContent>
                    {DIRECTIONS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {t(`directions.${d}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Unit + Target Value */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("form.unit")}</Label>
                <Input
                  value={metricForm.unit}
                  onChange={(e) =>
                    setMetricForm({ ...metricForm, unit: e.target.value })
                  }
                  placeholder={t("form.unitPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("form.targetValue")}</Label>
                <Input
                  type="number"
                  value={metricForm.target_value}
                  onChange={(e) =>
                    setMetricForm({ ...metricForm, target_value: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Warning + Critical Thresholds */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("form.warningThreshold")}</Label>
                <Input
                  type="number"
                  value={metricForm.warning_threshold}
                  onChange={(e) =>
                    setMetricForm({
                      ...metricForm,
                      warning_threshold: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t("form.criticalThreshold")}</Label>
                <Input
                  type="number"
                  value={metricForm.critical_threshold}
                  onChange={(e) =>
                    setMetricForm({
                      ...metricForm,
                      critical_threshold: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Acceptable Min + Max (for target_range) */}
            {metricForm.direction === "target_range" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("form.acceptableMin")}</Label>
                  <Input
                    type="number"
                    value={metricForm.acceptable_min}
                    onChange={(e) =>
                      setMetricForm({
                        ...metricForm,
                        acceptable_min: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("form.acceptableMax")}</Label>
                  <Input
                    type="number"
                    value={metricForm.acceptable_max}
                    onChange={(e) =>
                      setMetricForm({
                        ...metricForm,
                        acceptable_max: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}

            {/* Frequency + Source */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("form.frequency")}</Label>
                <Select
                  value={metricForm.collection_frequency}
                  onValueChange={(v) =>
                    setMetricForm({ ...metricForm, collection_frequency: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.selectFrequency")} />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((f) => (
                      <SelectItem key={f} value={f}>
                        {t(`frequencies.${f}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("form.source")}</Label>
                <Select
                  value={metricForm.source}
                  onValueChange={(v) =>
                    setMetricForm({ ...metricForm, source: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.selectSource")} />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {t(`sources.${s}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMetricDialogOpen(false)}
            >
              {t("cancel", { ns: "common" })}
            </Button>
            <Button
              onClick={handleSaveMetric}
              disabled={
                createMutation.isPending || updateMutation.isPending
              }
            >
              {editing ? t("edit") : t("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/*  DELETE METRIC CONFIRMATION                                   */}
      {/* ============================================================ */}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("delete")}</DialogTitle>
            <DialogDescription>
              {t("messages.deleteConfirm")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              {t("cancel", { ns: "common" })}
            </Button>
            <Button variant="destructive" onClick={handleDeleteMetric}>
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/*  ADD DATA POINT DIALOG                                       */}
      {/* ============================================================ */}
      <Dialog open={dataPointDialogOpen} onOpenChange={setDataPointDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("addDataPoint")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t("form.value")}</Label>
              <Input
                type="number"
                value={dataPointForm.value}
                onChange={(e) =>
                  setDataPointForm({ ...dataPointForm, value: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t("form.recordedAt")}</Label>
              <Input
                type="datetime-local"
                value={dataPointForm.recorded_at}
                onChange={(e) =>
                  setDataPointForm({
                    ...dataPointForm,
                    recorded_at: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t("form.notes")}</Label>
              <Textarea
                value={dataPointForm.notes}
                onChange={(e) =>
                  setDataPointForm({ ...dataPointForm, notes: e.target.value })
                }
                placeholder={t("form.notesPlaceholder")}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDataPointDialogOpen(false)}
            >
              {t("cancel", { ns: "common" })}
            </Button>
            <Button
              onClick={handleSaveDataPoint}
              disabled={addDataPointMutation.isPending}
            >
              {t("addDataPoint")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
