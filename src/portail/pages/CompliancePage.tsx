import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircle,
  AlertTriangle,
  ArrowUpCircle,
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

import { usePermissions } from "@/hooks/usePermissions";
import { useOrgMembers } from "@/hooks/useOrgMembers";
import {
  useComplianceAssessments,
  useComplianceScores,
  useRemediationActions,
  useSeedFramework,
  useSeedAllFrameworks,
  useUpdateAssessment,
  useCreateRemediation,
  useUpdateRemediation,
  useDeleteRemediation,
} from "@/hooks/useCompliance";
import {
  FRAMEWORK_CODES,
  REQUIREMENTS_BY_FRAMEWORK,
  ALL_REQUIREMENTS,
  getScoreColor,
  type FrameworkCode,
} from "@/lib/compliance-frameworks";
import type { ComplianceAssessment, RemediationAction } from "@/types/database";

import { ComplianceScoreGauge } from "@/components/shared/ComplianceScoreGauge";
import { SectionHelpButton } from "@/components/shared/SectionHelpButton";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { FeatureGate } from "@/components/shared/FeatureGate";

/* ================================================================== */
/*  STATUS BADGE HELPER                                                */
/* ================================================================== */

const STATUS_COLORS: Record<string, string> = {
  compliant: "bg-green-100 text-green-800 border-green-200",
  partially_compliant: "bg-yellow-100 text-yellow-800 border-yellow-200",
  non_compliant: "bg-red-100 text-red-800 border-red-200",
  not_applicable: "bg-gray-100 text-gray-600 border-gray-200",
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-blue-100 text-blue-800 border-blue-200",
};

const ALL = "__all__";

const ACTION_STATUS_COLORS: Record<string, string> = {
  planned: "bg-gray-100 text-gray-800 border-gray-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  deferred: "bg-orange-100 text-orange-800 border-orange-200",
};

/* ================================================================== */
/*  MAIN PAGE                                                          */
/* ================================================================== */

export default function CompliancePage() {
  const { t } = useTranslation("compliance");
  const { can } = usePermissions();
  const readOnly = !can("manage_compliance");

  return (
    <FeatureGate feature="compliance">
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl font-bold tracking-tight">{t("pageTitle")}</h1>
            <SectionHelpButton ns="compliance" />
          </div>
          <p className="text-muted-foreground">{t("pageDescription")}</p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard" className="gap-1.5">
              <BarChart3 className="h-4 w-4" />
              {t("tabs.dashboard")}
            </TabsTrigger>
            <TabsTrigger value="frameworks" className="gap-1.5">
              <CheckCircle className="h-4 w-4" />
              {t("tabs.frameworks")}
            </TabsTrigger>
            <TabsTrigger value="remediation" className="gap-1.5">
              <ArrowUpCircle className="h-4 w-4" />
              {t("tabs.remediation")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab />
          </TabsContent>
          <TabsContent value="frameworks">
            <FrameworksTab readOnly={readOnly} />
          </TabsContent>
          <TabsContent value="remediation">
            <RemediationTab readOnly={readOnly} />
          </TabsContent>
        </Tabs>
      </div>
    </FeatureGate>
  );
}

/* ================================================================== */
/*  DASHBOARD TAB                                                      */
/* ================================================================== */

function DashboardTab() {
  const { t } = useTranslation("compliance");
  const { data: scores, isLoading } = useComplianceScores();
  const { data: remediations = [] } = useRemediationActions();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!scores || !scores.frameworks || scores.frameworks.every((f) => f.compliant + f.partial + f.nonCompliant + f.notApplicable === 0)) {
    return (
      <Card className="p-8 text-center">
        <Sparkles className="h-10 w-10 mx-auto text-muted-foreground/40 mb-4" />
        <p className="text-muted-foreground">{t("dashboard.noData")}</p>
      </Card>
    );
  }

  const frameworks = scores.frameworks ?? [];
  const totalCompliant = frameworks.reduce((s, f) => s + f.compliant, 0);
  const totalNonCompliant = frameworks.reduce((s, f) => s + f.nonCompliant, 0);
  const activeActions = remediations.filter((a) => a.status === "in_progress" || a.status === "planned").length;

  const kpis = [
    { key: "globalScore", icon: CheckCircle, value: `${scores.global}%`, color: getScoreColor(scores.global) },
    { key: "compliantCount", icon: CheckCircle, value: String(totalCompliant), color: "#22c55e" },
    { key: "criticalGaps", icon: AlertTriangle, value: String(totalNonCompliant), color: "#ef4444" },
    { key: "activeActions", icon: ArrowUpCircle, value: String(activeActions), color: "#3b82f6" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.key}>
              <CardContent className="flex items-center gap-4 pt-6">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${kpi.color}15` }}
                >
                  <Icon className="h-5 w-5" style={{ color: kpi.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{t(`kpis.${kpi.key}`)}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Score Gauges */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-semibold mb-4">{t("dashboard.scoreByFramework")}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {frameworks.map((fw) => {
              const hasData = fw.compliant + fw.partial + fw.nonCompliant + fw.notApplicable > 0;
              return (
                <div key={fw.framework} className="flex flex-col items-center gap-2">
                  <ComplianceScoreGauge
                    score={hasData ? fw.score : 0}
                    size="md"
                    showLabel
                  />
                  <span className="text-xs font-medium text-center">
                    {t(`frameworks.${fw.framework}`)}
                  </span>
                  {!hasData && (
                    <span className="text-[10px] text-muted-foreground">Non initialisé</span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-semibold mb-4">{t("dashboard.statusDistribution")}</h3>
          <div className="space-y-3">
            {frameworks.filter((f) => f.compliant + f.partial + f.nonCompliant + f.notApplicable > 0).map((fw) => {
              const total = fw.compliant + fw.partial + fw.nonCompliant + fw.notApplicable;
              return (
                <div key={fw.framework}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium">{t(`frameworks.${fw.framework}`)}</span>
                    <span className="text-muted-foreground">{fw.score}%</span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
                    {fw.compliant > 0 && (
                      <div className="bg-green-500" style={{ width: `${(fw.compliant / total) * 100}%` }} />
                    )}
                    {fw.partial > 0 && (
                      <div className="bg-yellow-500" style={{ width: `${(fw.partial / total) * 100}%` }} />
                    )}
                    {fw.nonCompliant > 0 && (
                      <div className="bg-red-500" style={{ width: `${(fw.nonCompliant / total) * 100}%` }} />
                    )}
                    {fw.notApplicable > 0 && (
                      <div className="bg-gray-300" style={{ width: `${(fw.notApplicable / total) * 100}%` }} />
                    )}
                  </div>
                </div>
              );
            })}
            {/* Legend */}
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-[11px]">
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                {t("statuses.compliant")}
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                {t("statuses.partially_compliant")}
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                {t("statuses.non_compliant")}
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                {t("statuses.not_applicable")}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ================================================================== */
/*  FRAMEWORKS TAB                                                     */
/* ================================================================== */

function FrameworksTab({ readOnly }: { readOnly: boolean }) {
  const { t } = useTranslation("compliance");
  const [selectedFramework, setSelectedFramework] = useState<FrameworkCode | "all">("all");
  const { data: assessments = [], isLoading } = useComplianceAssessments(
    selectedFramework !== "all" ? { framework_code: selectedFramework } : undefined
  );
  const seedFramework = useSeedFramework();
  const seedAll = useSeedAllFrameworks();
  const updateAssessment = useUpdateAssessment();

  // Map assessments by (framework, requirement_code)
  const assessmentMap = useMemo(() => {
    const map = new Map<string, ComplianceAssessment>();
    assessments.forEach((a) => map.set(`${a.framework_code}:${a.requirement_code}`, a));
    return map;
  }, [assessments]);

  // Get visible requirements
  const visibleRequirements = useMemo(() => {
    if (selectedFramework === "all") return ALL_REQUIREMENTS;
    return REQUIREMENTS_BY_FRAMEWORK[selectedFramework] ?? [];
  }, [selectedFramework]);

  const handleSeedFramework = (fw: FrameworkCode) => {
    seedFramework.mutate(
      { frameworkCode: fw },
      { onSuccess: () => toast.success(`${t(`frameworks.${fw}`)} initialisé`) }
    );
  };

  const handleSeedAll = () => {
    seedAll.mutate(undefined, {
      onSuccess: () => toast.success(t("matrix.initAll")),
    });
  };

  const handleStatusChange = (assessmentId: string, newStatus: string) => {
    updateAssessment.mutate(
      { id: assessmentId, status: newStatus, last_verified_at: new Date().toISOString() },
      { onSuccess: () => toast.success(t("matrix.saved")) }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={selectedFramework}
          onValueChange={(v) => setSelectedFramework(v as FrameworkCode | "all")}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder={t("matrix.selectFramework")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("matrix.allFrameworks")}</SelectItem>
            {FRAMEWORK_CODES.map((fw) => (
              <SelectItem key={fw} value={fw}>
                {t(`frameworks.${fw}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!readOnly && (
          <div className="flex gap-2 ml-auto">
            {selectedFramework !== "all" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSeedFramework(selectedFramework)}
                disabled={seedFramework.isPending}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                {seedFramework.isPending ? t("matrix.initializing") : t("matrix.initFramework")}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedAll}
              disabled={seedAll.isPending}
            >
              <Sparkles className="h-4 w-4 mr-1" />
              {seedAll.isPending ? t("matrix.initializing") : t("matrix.initAll")}
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">{t("matrix.code")}</TableHead>
              <TableHead>{t("matrix.requirement")}</TableHead>
              <TableHead className="w-[100px]">{t("matrix.article")}</TableHead>
              <TableHead className="w-[100px]">{t("matrix.module")}</TableHead>
              <TableHead className="w-[180px]">{t("matrix.status")}</TableHead>
              <TableHead className="w-[120px]">{t("matrix.lastVerified")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRequirements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {t("matrix.noAssessments")}
                </TableCell>
              </TableRow>
            ) : (
              visibleRequirements.map((req) => {
                const assessment = assessmentMap.get(`${req.framework}:${req.code}`);
                return (
                  <TableRow key={`${req.framework}:${req.code}`}>
                    <TableCell className="font-mono text-xs font-medium">{req.code}</TableCell>
                    <TableCell className="text-sm">{req.titleFr}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{req.articleRef ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{req.moduleSource}</TableCell>
                    <TableCell>
                      {assessment ? (
                        readOnly ? (
                          <Badge variant="outline" className={STATUS_COLORS[assessment.status] ?? ""}>
                            {t(`statuses.${assessment.status}`)}
                          </Badge>
                        ) : (
                          <Select
                            value={assessment.status}
                            onValueChange={(v) => handleStatusChange(assessment.id, v)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(["compliant", "partially_compliant", "non_compliant", "not_applicable"] as const).map((s) => (
                                <SelectItem key={s} value={s}>
                                  {t(`statuses.${s}`)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )
                      ) : (
                        <span className="text-xs text-muted-foreground/60">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {assessment?.last_verified_at
                        ? new Date(assessment.last_verified_at).toLocaleDateString("fr-CA")
                        : t("matrix.notVerified")}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

/* ================================================================== */
/*  REMEDIATION TAB                                                    */
/* ================================================================== */

function RemediationTab({ readOnly }: { readOnly: boolean }) {
  const { t } = useTranslation("compliance");
  const [priorityFilter, setPriorityFilter] = useState<string>(ALL);
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<RemediationAction | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: actions = [], isLoading } = useRemediationActions({
    priority: priorityFilter === ALL ? undefined : priorityFilter,
    status: statusFilter === ALL ? undefined : statusFilter,
  });
  const { data: assessments = [] } = useComplianceAssessments();
  const { data: members = [] } = useOrgMembers();
  const createRemediation = useCreateRemediation();
  const updateRemediation = useUpdateRemediation();
  const deleteRemediation = useDeleteRemediation();

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formAssessmentId, setFormAssessmentId] = useState("");
  const [formResponsible, setFormResponsible] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formPriority, setFormPriority] = useState("medium");
  const [formStatus, setFormStatus] = useState("planned");
  const [formNotes, setFormNotes] = useState("");

  const nonCompliantAssessments = useMemo(
    () => assessments.filter((a) => a.status === "non_compliant" || a.status === "partially_compliant"),
    [assessments]
  );

  const openCreateDialog = () => {
    setEditingAction(null);
    setFormTitle("");
    setFormDescription("");
    setFormAssessmentId(nonCompliantAssessments[0]?.id ?? "");
    setFormResponsible("");
    setFormDueDate("");
    setFormPriority("medium");
    setFormStatus("planned");
    setFormNotes("");
    setDialogOpen(true);
  };

  const openEditDialog = (action: typeof actions[number]) => {
    setEditingAction(action);
    setFormTitle(action.title);
    setFormDescription(action.description ?? "");
    setFormAssessmentId(action.assessment_id);
    setFormResponsible(action.responsible_user_id ?? "");
    setFormDueDate(action.due_date ?? "");
    setFormPriority(action.priority);
    setFormStatus(action.status);
    setFormNotes(action.notes ?? "");
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formTitle.trim() || !formAssessmentId) return;

    const payload = {
      title: formTitle.trim(),
      description: formDescription.trim() || null,
      assessment_id: formAssessmentId,
      responsible_user_id: formResponsible || null,
      due_date: formDueDate || null,
      priority: formPriority,
      status: formStatus,
      notes: formNotes.trim() || null,
    };

    if (editingAction) {
      updateRemediation.mutate(
        { id: editingAction.id, ...payload },
        {
          onSuccess: () => {
            toast.success(t("remediation.updateSuccess"));
            setDialogOpen(false);
          },
        }
      );
    } else {
      createRemediation.mutate(payload, {
        onSuccess: () => {
          toast.success(t("remediation.createSuccess"));
          setDialogOpen(false);
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteRemediation.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success(t("remediation.deleteSuccess"));
          setDeleteConfirm(null);
        },
      }
    );
  };

  const getRequirementLabel = (assessmentId: string) => {
    const assessment = assessments.find((a) => a.id === assessmentId);
    if (!assessment) return "—";
    const req = ALL_REQUIREMENTS.find((r) => r.framework === assessment.framework_code && r.code === assessment.requirement_code);
    return req ? `${req.code} — ${req.titleFr}` : assessment.requirement_code;
  };

  const getMemberName = (userId: string | null) => {
    if (!userId) return t("remediation.responsible");
    const member = members.find((m) => m.user_id === userId);
    return member?.full_name ?? member?.email ?? userId;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("remediation.filterByPriority")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("remediation.allPriorities")}</SelectItem>
            {(["critical", "high", "medium", "low"] as const).map((p) => (
              <SelectItem key={p} value={p}>
                {t(`priorities.${p}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("remediation.filterByStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("remediation.allStatuses")}</SelectItem>
            {(["planned", "in_progress", "completed", "deferred"] as const).map((s) => (
              <SelectItem key={s} value={s}>
                {t(`actionStatuses.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!readOnly && (
          <Button size="sm" className="ml-auto gap-1.5" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            {t("remediation.create")}
          </Button>
        )}
      </div>

      {/* Table */}
      {actions.length === 0 ? (
        <Card className="p-8 text-center">
          <ArrowUpCircle className="h-10 w-10 mx-auto text-muted-foreground/40 mb-4" />
          <p className="font-medium text-muted-foreground">{t("remediation.noActions")}</p>
          <p className="text-sm text-muted-foreground/70 mt-1">{t("remediation.noActionsDescription")}</p>
          {!readOnly && (
            <Button size="sm" className="mt-4 gap-1.5" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              {t("remediation.create")}
            </Button>
          )}
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("remediation.actionTitle")}</TableHead>
                <TableHead>{t("remediation.linkedRequirement")}</TableHead>
                <TableHead className="w-[100px]">{t("remediation.priority")}</TableHead>
                <TableHead className="w-[120px]">{t("remediation.status")}</TableHead>
                <TableHead className="w-[120px]">{t("remediation.responsible")}</TableHead>
                <TableHead className="w-[110px]">{t("remediation.dueDate")}</TableHead>
                {!readOnly && <TableHead className="w-[80px]">{t("matrix.actions")}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {actions.map((action) => (
                <TableRow key={action.id}>
                  <TableCell className="text-sm font-medium">{action.title}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {getRequirementLabel(action.assessment_id)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={PRIORITY_COLORS[action.priority] ?? ""}>
                      {t(`priorities.${action.priority}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={ACTION_STATUS_COLORS[action.status] ?? ""}>
                      {t(`actionStatuses.${action.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{getMemberName(action.responsible_user_id)}</TableCell>
                  <TableCell className="text-xs">
                    {action.due_date ? new Date(action.due_date).toLocaleDateString("fr-CA") : "—"}
                  </TableCell>
                  {!readOnly && (
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openEditDialog(action)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteConfirm(action.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingAction ? t("remediation.edit") : t("remediation.create")}
            </DialogTitle>
            <DialogDescription>
              {t("remediation.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>{t("remediation.actionTitle")}</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
            </div>

            <div>
              <Label>{t("remediation.actionDescription")}</Label>
              <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={2} />
            </div>

            <div>
              <Label>{t("remediation.linkedRequirement")}</Label>
              <Select value={formAssessmentId} onValueChange={setFormAssessmentId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("remediation.linkedRequirement")} />
                </SelectTrigger>
                <SelectContent>
                  {nonCompliantAssessments.map((a) => {
                    const req = ALL_REQUIREMENTS.find(
                      (r) => r.framework === a.framework_code && r.code === a.requirement_code
                    );
                    return (
                      <SelectItem key={a.id} value={a.id}>
                        {req ? `${req.code} — ${req.titleFr}` : a.requirement_code}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("remediation.priority")}</Label>
                <Select value={formPriority} onValueChange={setFormPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["critical", "high", "medium", "low"] as const).map((p) => (
                      <SelectItem key={p} value={p}>
                        {t(`priorities.${p}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("remediation.status")}</Label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["planned", "in_progress", "completed", "deferred"] as const).map((s) => (
                      <SelectItem key={s} value={s}>
                        {t(`actionStatuses.${s}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("remediation.responsible")}</Label>
                <Select value={formResponsible} onValueChange={setFormResponsible}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("matrix.noResponsible")} />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m.user_id} value={m.user_id}>
                        {m.full_name ?? m.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("remediation.dueDate")}</Label>
                <Input type="date" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} />
              </div>
            </div>

            <div>
              <Label>{t("remediation.notes")}</Label>
              <Textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} rows={2} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formTitle.trim() || !formAssessmentId || createRemediation.isPending || updateRemediation.isPending}
            >
              {editingAction ? t("remediation.updateAction") : t("remediation.createAction")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("remediation.delete")}</DialogTitle>
            <DialogDescription>{t("remediation.deleteConfirm")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={deleteRemediation.isPending}
            >
              {t("remediation.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
