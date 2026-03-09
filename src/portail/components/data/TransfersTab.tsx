import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Database,
  Plus,
  Pencil,
  Trash2,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import {
  useDataTransfers,
  useCreateDataTransfer,
  useUpdateDataTransfer,
  useDeleteDataTransfer,
} from "@/hooks/useData";
import type { DataTransfer } from "@/types/database";

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
import { DATA_STATUS_COLORS } from "@/portail/constants/colors";
import { DEMO_DATA_TRANSFERS } from "@/portail/demo";

/* ================================================================== */
/*  CONSTANTS                                                          */
/* ================================================================== */

const ALL = "__all__";
const NONE = "__none__";

const TRANSFER_STATUSES = ["active", "suspended", "terminated"] as const;

const CONTRACTUAL_BASES = [
  "contractual_clause", "compliance_commitment", "consent",
] as const;

const STATUS_COLORS = DATA_STATUS_COLORS;

/* ================================================================== */
/*  PROPS                                                              */
/* ================================================================== */

interface TransfersTabProps {
  readOnly: boolean;
  isPreview: boolean;
  datasets: { id: string; name: string }[];
}

/* ================================================================== */
/*  COMPONENT                                                          */
/* ================================================================== */

export function TransfersTab({ readOnly, isPreview, datasets }: TransfersTabProps) {
  const { t } = useTranslation("data");

  /* ---- filters ---- */
  const [trStatusFilter, setTrStatusFilter] = useState(ALL);
  const [trSearchQuery, setTrSearchQuery] = useState("");

  /* ---- dialog state ---- */
  const [trDialogOpen, setTrDialogOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<DataTransfer | null>(null);
  const [trDeleteConfirm, setTrDeleteConfirm] = useState<string | null>(null);

  /* ---- data ---- */
  const { data: rawTransfers = [], isLoading: trLoading } = useDataTransfers({
    status: trStatusFilter === ALL ? undefined : trStatusFilter,
    search: trSearchQuery || undefined,
  });
  const transfers = isPreview ? DEMO_DATA_TRANSFERS : rawTransfers;
  const createTransfer = useCreateDataTransfer();
  const updateTransfer = useUpdateDataTransfer();
  const deleteTransfer = useDeleteDataTransfer();

  /* ---- form state ---- */
  const [formTrDatasetId, setFormTrDatasetId] = useState("");
  const [formTrCountry, setFormTrCountry] = useState("");
  const [formTrEntity, setFormTrEntity] = useState("");
  const [formTrPurpose, setFormTrPurpose] = useState("");
  const [formTrContractualBasis, setFormTrContractualBasis] = useState(NONE);
  const [formTrEfvpCompleted, setFormTrEfvpCompleted] = useState(false);
  const [formTrProtection, setFormTrProtection] = useState("");
  const [formTrStatus, setFormTrStatus] = useState("active");

  const resetTrForm = () => {
    setFormTrDatasetId(""); setFormTrCountry(""); setFormTrEntity("");
    setFormTrPurpose(""); setFormTrContractualBasis(NONE);
    setFormTrEfvpCompleted(false); setFormTrProtection(""); setFormTrStatus("active");
  };

  const openTrCreate = () => {
    setEditingTransfer(null);
    resetTrForm();
    setTrDialogOpen(true);
  };

  const openTrEdit = (tr: DataTransfer) => {
    setEditingTransfer(tr);
    setFormTrDatasetId(tr.dataset_id);
    setFormTrCountry(tr.destination_country);
    setFormTrEntity(tr.destination_entity ?? "");
    setFormTrPurpose(tr.transfer_purpose);
    setFormTrContractualBasis(tr.contractual_basis ?? NONE);
    setFormTrEfvpCompleted(tr.efvp_completed);
    setFormTrProtection(tr.protection_measures ?? "");
    setFormTrStatus(tr.status);
    setTrDialogOpen(true);
  };

  const handleTrSubmit = () => {
    if (!formTrDatasetId || !formTrCountry.trim() || !formTrPurpose.trim()) return;

    const payload = {
      dataset_id: formTrDatasetId,
      destination_country: formTrCountry.trim(),
      destination_entity: formTrEntity.trim() || null,
      transfer_purpose: formTrPurpose.trim(),
      contractual_basis: formTrContractualBasis === NONE ? null : formTrContractualBasis,
      efvp_completed: formTrEfvpCompleted,
      protection_measures: formTrProtection.trim() || null,
      status: formTrStatus,
    };

    if (editingTransfer) {
      updateTransfer.mutate(
        { id: editingTransfer.id, ...payload },
        { onSuccess: () => { toast.success(t("messages.transferUpdated")); setTrDialogOpen(false); } }
      );
    } else {
      createTransfer.mutate(payload, {
        onSuccess: () => { toast.success(t("messages.transferCreated")); setTrDialogOpen(false); },
      });
    }
  };

  const handleTrDelete = (id: string) => {
    deleteTransfer.mutate(
      { id },
      { onSuccess: () => { toast.success(t("messages.transferDeleted")); setTrDeleteConfirm(null); } }
    );
  };

  const getDatasetName = (datasetId: string) => {
    const ds = datasets.find((d) => d.id === datasetId);
    return ds?.name ?? "\u2014";
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("search")} value={trSearchQuery} onChange={(e) => setTrSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={trStatusFilter} onValueChange={setTrStatusFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder={t("filters.filterByStatus")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("filters.allStatuses")}</SelectItem>
            {TRANSFER_STATUSES.map((s) => <SelectItem key={s} value={s}>{t(`statuses.${s}`)}</SelectItem>)}
          </SelectContent>
        </Select>
        {!readOnly && (
          <Button size="sm" className="ml-auto gap-1.5" onClick={openTrCreate}>
            <Plus className="h-4 w-4" />{t("createTransfer")}
          </Button>
        )}
      </div>

      {/* Transfer table */}
      {trLoading && !isPreview ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : transfers.length === 0 ? (
        <Card className="p-8 text-center">
          <Database className="h-10 w-10 mx-auto text-muted-foreground/40 mb-4" />
          <p className="font-medium text-muted-foreground">{t("noTransfers")}</p>
          <p className="text-sm text-muted-foreground/70 mt-1">{t("noTransfersDescription")}</p>
          {!readOnly && (
            <Button size="sm" className="mt-4 gap-1.5" onClick={openTrCreate}>
              <Plus className="h-4 w-4" />{t("createTransfer")}
            </Button>
          )}
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.dataset")}</TableHead>
                <TableHead className="w-[160px]">{t("table.destination")}</TableHead>
                <TableHead>{t("table.purpose")}</TableHead>
                <TableHead className="w-[90px]">{t("table.efvp")}</TableHead>
                <TableHead className="w-[130px]">{t("table.status")}</TableHead>
                <TableHead className="w-[100px]">{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.map((tr) => (
                <TableRow key={tr.id}>
                  <TableCell className="text-sm font-medium">{getDatasetName(tr.dataset_id)}</TableCell>
                  <TableCell className="text-sm">{tr.destination_country}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{tr.transfer_purpose}</TableCell>
                  <TableCell>
                    <Badge variant={tr.efvp_completed ? "default" : "secondary"}>
                      {tr.efvp_completed ? "Oui" : "Non"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_COLORS[tr.status] ?? ""}>
                      {t(`statuses.${tr.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {!readOnly && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openTrEdit(tr)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setTrDeleteConfirm(tr.id)}>
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

      {/* Transfer Create / Edit Dialog */}
      <Dialog open={trDialogOpen} onOpenChange={setTrDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTransfer ? t("edit") : t("createTransfer")}</DialogTitle>
            <DialogDescription>{t("pageDescription")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>{t("table.dataset")}</Label>
              <Select value={formTrDatasetId} onValueChange={setFormTrDatasetId}>
                <SelectTrigger><SelectValue placeholder={t("form.selectDataset")} /></SelectTrigger>
                <SelectContent>
                  {datasets.map((ds) => <SelectItem key={ds.id} value={ds.id}>{ds.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t("form.destinationCountry")}</Label><Input value={formTrCountry} onChange={(e) => setFormTrCountry(e.target.value)} /></div>
              <div><Label>{t("form.destinationEntity")}</Label><Input value={formTrEntity} onChange={(e) => setFormTrEntity(e.target.value)} /></div>
            </div>

            <div><Label>{t("form.transferPurpose")}</Label><Textarea value={formTrPurpose} onChange={(e) => setFormTrPurpose(e.target.value)} rows={2} placeholder={t("form.transferPurposePlaceholder")} /></div>

            <div>
              <Label>{t("form.contractualBasis")}</Label>
              <Select value={formTrContractualBasis} onValueChange={setFormTrContractualBasis}>
                <SelectTrigger><SelectValue placeholder={t("form.selectContractualBasis")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>{"\u2014"}</SelectItem>
                  {CONTRACTUAL_BASES.map((cb) => <SelectItem key={cb} value={cb}>{t(`contractualBases.${cb}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={formTrEfvpCompleted} onCheckedChange={setFormTrEfvpCompleted} />
              <Label>{t("form.efvpCompleted")}</Label>
            </div>

            <div><Label>{t("form.protectionMeasures")}</Label><Textarea value={formTrProtection} onChange={(e) => setFormTrProtection(e.target.value)} rows={2} placeholder={t("form.protectionPlaceholder")} /></div>

            <div>
              <Label>{t("table.status")}</Label>
              <Select value={formTrStatus} onValueChange={setFormTrStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRANSFER_STATUSES.map((s) => <SelectItem key={s} value={s}>{t(`statuses.${s}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTrDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleTrSubmit} disabled={!formTrDatasetId || !formTrCountry.trim() || !formTrPurpose.trim() || createTransfer.isPending || updateTransfer.isPending}>
              {editingTransfer ? t("edit") : t("createTransfer")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Delete Confirmation */}
      <Dialog open={!!trDeleteConfirm} onOpenChange={() => setTrDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("delete")}</DialogTitle>
            <DialogDescription>{t("messages.deleteTransferConfirm")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrDeleteConfirm(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => trDeleteConfirm && handleTrDelete(trDeleteConfirm)} disabled={deleteTransfer.isPending}>
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
