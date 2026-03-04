import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Bot,
  RefreshCw,
  Building2,
  AlertTriangle,
  AlertCircle,
  Scale,
  CheckCircle,
  Shield,
  ClipboardCheck,
  FileText,
  Eye,
  Activity,
  Database,
  Newspaper,
  LayoutDashboard,
  MessageSquare,
  Users,
  UserCircle,
  BookOpen,
  ArrowRight,
  Circle,
  Sparkles,
  Send,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Globe,
  Link2,
  MapPin,
  Zap,
  BookOpenCheck,
  Mail,
  ClipboardList,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Server,
  Cpu,
  ScrollText,
  Plug,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { SEO, JsonLd } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ------------------------------------------------------------------ */
/*  TYPES                                                               */
/* ------------------------------------------------------------------ */

interface Feature {
  key: string;
  icon: LucideIcon;
  mockup?: () => ReactNode;
}

interface Category {
  id: string;
  features: Feature[];
}

/* ------------------------------------------------------------------ */
/*  MOCKUP COMPONENTS                                                   */
/* ------------------------------------------------------------------ */

/** Shared mockup card wrapper */
function MockupCard({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="w-full rounded-2xl border border-neutral-200 bg-white shadow-xl overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-[#57886c]/10">
            <Icon className="size-3.5 text-[#57886c]" />
          </div>
          <span className="text-sm font-semibold text-neutral-800">{title}</span>
        </div>
        <Badge className="bg-[#57886c]/10 text-[#57886c] border-[#57886c]/20 text-[9px] font-bold tracking-wider px-1.5 py-0 h-4">
          <Sparkles className="size-2.5 mr-0.5" />
          IA
        </Badge>
      </div>
      {/* Body */}
      <div className="px-5 py-4">
        {children}
      </div>
    </div>
  );
}

/** Risk score bar */
function RiskBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-neutral-100">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-[11px] font-semibold tabular-nums text-neutral-500">{score}</span>
    </div>
  );
}

function AiSystemsMockup() {
  const systems = [
    { name: "Assistant RH", type: "GenAI", status: "Production", score: 62, color: "#f59e0b" },
    { name: "Détection fraude", type: "ML Prédictif", status: "Production", score: 78, color: "#ef4444" },
    { name: "Moteur reco", type: "Recommandation", status: "Pilote", score: 25, color: "#22c55e" },
    { name: "Tri CV", type: "NLP", status: "Production", score: 85, color: "#ef4444" },
  ];
  return (
    <MockupCard title="Inventaire des systèmes IA" icon={Bot}>
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-neutral-100 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            <th className="pb-2.5 pr-3">Système</th>
            <th className="pb-2.5 pr-3">Type</th>
            <th className="pb-2.5 pr-3">Statut</th>
            <th className="pb-2.5">Risque</th>
          </tr>
        </thead>
        <tbody>
          {systems.map((s) => (
            <tr key={s.name} className="border-b border-neutral-50 last:border-0">
              <td className="py-2.5 pr-3 font-medium text-neutral-800">{s.name}</td>
              <td className="py-2.5 pr-3">
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">{s.type}</span>
              </td>
              <td className="py-2.5 pr-3">
                <span className="inline-flex items-center gap-1">
                  <Circle className="size-1.5 fill-current text-emerald-500" />
                  <span className="text-neutral-600">{s.status}</span>
                </span>
              </td>
              <td className="py-2.5">
                <RiskBar score={s.score} color={s.color} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </MockupCard>
  );
}

function LifecycleMockup() {
  const events = [
    { date: "28 fév", type: "Mise à jour modèle", label: "GPT-4o → GPT-4.5", color: "bg-[#57886c]" },
    { date: "15 fév", type: "Changement fournisseur", label: "Migration Azure → AWS", color: "bg-blue-500" },
    { date: "02 fév", type: "Audit interne", label: "Revue trimestrielle complétée", color: "bg-emerald-500" },
    { date: "18 jan", type: "Extension périmètre", label: "Ajout département Marketing", color: "bg-amber-500" },
  ];
  return (
    <MockupCard title="Journal du cycle de vie" icon={RefreshCw}>
      <div className="space-y-0">
        {events.map((ev, i) => (
          <div key={i} className="relative flex gap-3 pb-4 last:pb-0">
            {/* Timeline line */}
            {i < events.length - 1 && (
              <div className="absolute left-[7px] top-4 bottom-0 w-px bg-neutral-200" />
            )}
            {/* Dot */}
            <div className={`relative mt-1 size-[15px] shrink-0 rounded-full ${ev.color} ring-4 ring-white`} />
            {/* Content */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-neutral-400">{ev.date}</span>
                <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600">{ev.type}</span>
              </div>
              <p className="mt-0.5 text-xs text-neutral-700">{ev.label}</p>
            </div>
          </div>
        ))}
      </div>
    </MockupCard>
  );
}

function VendorsMockup() {
  const vendors = [
    { name: "OpenAI", type: "API / Modèle", risk: "Élevé", riskColor: "text-red-600 bg-red-50", contract: "Actif", cert: "SOC 2" },
    { name: "Azure AI", type: "Infrastructure", risk: "Moyen", riskColor: "text-amber-600 bg-amber-50", contract: "Actif", cert: "ISO 27001" },
    { name: "Dataiku", type: "Plateforme SaaS", risk: "Faible", riskColor: "text-emerald-600 bg-emerald-50", contract: "Évaluation", cert: "SOC 2, ISO" },
  ];
  return (
    <MockupCard title="Fournisseurs IA" icon={Building2}>
      <div className="space-y-3">
        {vendors.map((v) => (
          <div key={v.name} className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50/50 px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-neutral-800">{v.name}</p>
              <p className="text-[10px] text-neutral-500">{v.type}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${v.riskColor}`}>{v.risk}</span>
              <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-500">{v.cert}</span>
            </div>
          </div>
        ))}
      </div>
    </MockupCard>
  );
}

/* ── Risks category mockups ── */

function RisksMockup() {
  const sections = [
    { label: "A. Portée et impact", done: true },
    { label: "B. Données et vie privée", done: true },
    { label: "C. Transparence", done: true },
    { label: "D. Fiabilité", progress: 60 },
    { label: "E. Gouvernance", progress: 0 },
    { label: "F. Droits fondamentaux", progress: 0 },
  ];
  return (
    <MockupCard title="Évaluation des risques" icon={AlertTriangle}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Score de risque</p>
          <p className="text-2xl font-bold text-amber-500">68<span className="text-sm font-normal text-neutral-400">/100</span></p>
        </div>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">Élevé</span>
      </div>
      <div className="space-y-2">
        {sections.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <div className="h-1.5 w-full rounded-full bg-neutral-100">
              <div
                className={`h-full rounded-full ${s.done ? "bg-emerald-500" : s.progress ? "bg-amber-400" : "bg-neutral-200"}`}
                style={{ width: s.done ? "100%" : `${s.progress}%` }}
              />
            </div>
            <span className="shrink-0 text-[10px] text-neutral-500 w-40 truncate">{s.label}</span>
          </div>
        ))}
      </div>
    </MockupCard>
  );
}

function IncidentsMockup() {
  const incidents = [
    { title: "Hallucination chatbot client", severity: "Critique", sevColor: "text-red-600 bg-red-50", status: "Investigation", date: "28 fév" },
    { title: "Fuite données entraînement", severity: "Élevé", sevColor: "text-amber-600 bg-amber-50", status: "Résolution", date: "25 fév" },
    { title: "Biais détecté scoring crédit", severity: "Élevé", sevColor: "text-amber-600 bg-amber-50", status: "Post-mortem", date: "20 fév" },
    { title: "Latence API recommandation", severity: "Moyen", sevColor: "text-blue-600 bg-blue-50", status: "Résolu", date: "15 fév" },
  ];
  return (
    <MockupCard title="Incidents" icon={AlertCircle}>
      <div className="space-y-2.5">
        {incidents.map((inc) => (
          <div key={inc.title} className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-xs font-medium text-neutral-800 truncate">{inc.title}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${inc.sevColor}`}>{inc.severity}</span>
                <span className="text-[10px] text-neutral-400">{inc.date}</span>
              </div>
            </div>
            <span className="shrink-0 rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">{inc.status}</span>
          </div>
        ))}
      </div>
    </MockupCard>
  );
}

function BiasMockup() {
  const findings = [
    { type: "Impact disparate", system: "Tri CV", severity: "Critique", method: "Audit", status: "Remédiation", statusColor: "text-amber-600 bg-amber-50" },
    { type: "Stéréotypage", system: "Chatbot RH", severity: "Élevé", method: "Test auto", status: "Identifié", statusColor: "text-red-600 bg-red-50" },
    { type: "Hallucination", system: "Assistant", severity: "Moyen", method: "Plainte", status: "Résolu", statusColor: "text-emerald-600 bg-emerald-50" },
  ];
  return (
    <MockupCard title="Analyse des biais" icon={Scale}>
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-neutral-100 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            <th className="pb-2 pr-2">Type</th>
            <th className="pb-2 pr-2">Système</th>
            <th className="pb-2 pr-2">Détection</th>
            <th className="pb-2">Statut</th>
          </tr>
        </thead>
        <tbody>
          {findings.map((f, i) => (
            <tr key={i} className="border-b border-neutral-50 last:border-0">
              <td className="py-2 pr-2 font-medium text-neutral-800">{f.type}</td>
              <td className="py-2 pr-2 text-neutral-600">{f.system}</td>
              <td className="py-2 pr-2">
                <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600">{f.method}</span>
              </td>
              <td className="py-2">
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${f.statusColor}`}>{f.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </MockupCard>
  );
}

/* ── Compliance category mockups ── */

function ComplianceMockup() {
  const frameworks = [
    { name: "Loi 25", score: 85, color: "#22c55e" },
    { name: "EU AI Act", score: 62, color: "#f59e0b" },
    { name: "NIST AI RMF", score: 78, color: "#22c55e" },
    { name: "ISO 42001", score: 45, color: "#ef4444" },
    { name: "RGPD", score: 91, color: "#22c55e" },
  ];
  return (
    <MockupCard title="Conformité multi-cadres" icon={CheckCircle}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Score global</p>
          <p className="text-2xl font-bold text-emerald-500">72<span className="text-sm font-normal text-neutral-400">%</span></p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">Conforme</span>
      </div>
      <div className="space-y-2.5">
        {frameworks.map((fw) => (
          <div key={fw.name} className="flex items-center gap-3">
            <span className="w-20 shrink-0 text-[11px] font-medium text-neutral-700">{fw.name}</span>
            <div className="h-2 flex-1 rounded-full bg-neutral-100">
              <div className="h-full rounded-full transition-all" style={{ width: `${fw.score}%`, backgroundColor: fw.color }} />
            </div>
            <span className="w-8 shrink-0 text-right text-[11px] font-semibold tabular-nums" style={{ color: fw.color }}>{fw.score}%</span>
          </div>
        ))}
      </div>
    </MockupCard>
  );
}

function PoliciesMockup() {
  const policies = [
    { name: "Charte IA générative", type: "GenAI", status: "Publié", statusColor: "text-emerald-600 bg-emerald-50", version: "v2.1" },
    { name: "Procédure d'approbation", type: "Procédure", status: "En révision", statusColor: "text-amber-600 bg-amber-50", version: "v1.3" },
    { name: "Politique de confidentialité IA", type: "Vie privée", status: "Brouillon", statusColor: "text-neutral-500 bg-neutral-100", version: "v0.2" },
  ];
  return (
    <MockupCard title="Politiques & Procédures" icon={Shield}>
      <div className="space-y-2.5">
        {policies.map((p) => (
          <div key={p.name} className="rounded-xl border border-neutral-100 bg-neutral-50/50 px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-neutral-800">{p.name}</p>
              <span className="text-[10px] text-neutral-400">{p.version}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600">{p.type}</span>
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${p.statusColor}`}>{p.status}</span>
            </div>
          </div>
        ))}
      </div>
    </MockupCard>
  );
}

function DecisionsMockup() {
  const decisions = [
    { title: "Go production : Chatbot V2", type: "Go/No-Go", impact: "Élevé", impactColor: "text-red-600 bg-red-50", status: "Approuvé", statusColor: "text-emerald-600" },
    { title: "Exception RGPD : Pilote ML", type: "Exception", impact: "Moyen", impactColor: "text-amber-600 bg-amber-50", status: "En attente", statusColor: "text-amber-600" },
    { title: "Suspension : Scoring V1", type: "Suspension", impact: "Critique", impactColor: "text-red-600 bg-red-50", status: "Implémenté", statusColor: "text-blue-600" },
  ];
  return (
    <MockupCard title="Registre des décisions" icon={ClipboardCheck}>
      <div className="space-y-2.5">
        {decisions.map((d) => (
          <div key={d.title} className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-xs font-medium text-neutral-800 truncate">{d.title}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600">{d.type}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${d.impactColor}`}>{d.impact}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className={`size-3 ${d.statusColor}`} />
              <span className={`text-[10px] font-medium ${d.statusColor}`}>{d.status}</span>
            </div>
          </div>
        ))}
      </div>
    </MockupCard>
  );
}

function DocumentsMockup() {
  const docs = [
    { name: "PIA_Assistant_RH.pdf", category: "Évaluation d'impact", size: "2.4 MB", date: "28 fév", icon: "📄" },
    { name: "Audit_Biais_Q4.pdf", category: "Rapport d'audit", size: "1.8 MB", date: "15 fév", icon: "📊" },
    { name: "Charte_IA_v2.docx", category: "Politique", size: "156 KB", date: "10 fév", icon: "📋" },
    { name: "Formation_Loi25.pptx", category: "Formation", size: "5.1 MB", date: "02 fév", icon: "🎓" },
  ];
  return (
    <MockupCard title="Documents" icon={FileText}>
      <div className="space-y-2">
        {docs.map((d) => (
          <div key={d.name} className="flex items-center gap-3 rounded-lg border border-neutral-100 px-3 py-2">
            <span className="text-lg">{d.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-neutral-800 truncate">{d.name}</p>
              <p className="text-[10px] text-neutral-400">{d.category} · {d.size}</p>
            </div>
            <span className="text-[10px] text-neutral-400 shrink-0">{d.date}</span>
          </div>
        ))}
      </div>
    </MockupCard>
  );
}

function AgentsMockup() {
  const agents = [
    { name: "Agent Conformité", autonomy: "A3", autonomyLabel: "Conditionnelle", risk: "R2", status: "Actif", statusColor: "text-emerald-600" },
    { name: "Agent Veille", autonomy: "A2", autonomyLabel: "Limitée", risk: "R1", status: "Actif", statusColor: "text-emerald-600" },
    { name: "Agent Audit", autonomy: "A4", autonomyLabel: "Haute", risk: "R3", status: "Suspendu", statusColor: "text-amber-600" },
  ];
  return (
    <MockupCard title="Registre des agents IA" icon={Bot}>
      <div className="space-y-2.5">
        {agents.map((a) => (
          <div key={a.name} className="rounded-xl border border-neutral-100 bg-neutral-50/50 px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-neutral-800">{a.name}</p>
              <span className="flex items-center gap-1">
                <Circle className={`size-1.5 fill-current ${a.statusColor}`} />
                <span className={`text-[10px] font-medium ${a.statusColor}`}>{a.status}</span>
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="rounded bg-[#57886c]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#57886c]">{a.autonomy}</span>
              <span className="text-[10px] text-neutral-500">{a.autonomyLabel}</span>
              <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600">Risque {a.risk}</span>
            </div>
          </div>
        ))}
      </div>
    </MockupCard>
  );
}

/* ── Operations category mockups ── */

function TransparencyMockup() {
  const entries = [
    { type: "Scoring crédit", basis: "Consentement", level: "Automatisé", impact: "Élevé", impactColor: "text-red-600 bg-red-50" },
    { type: "Tri candidatures", basis: "Intérêt légitime", level: "Semi-auto", impact: "Élevé", impactColor: "text-red-600 bg-red-50" },
    { type: "Recommandation", basis: "Contrat", level: "Assisté", impact: "Faible", impactColor: "text-emerald-600 bg-emerald-50" },
  ];
  return (
    <MockupCard title="Décisions automatisées" icon={Eye}>
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-neutral-100 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            <th className="pb-2 pr-2">Décision</th>
            <th className="pb-2 pr-2">Base légale</th>
            <th className="pb-2 pr-2">Niveau</th>
            <th className="pb-2">Impact</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => (
            <tr key={i} className="border-b border-neutral-50 last:border-0">
              <td className="py-2 pr-2 font-medium text-neutral-800">{e.type}</td>
              <td className="py-2 pr-2 text-neutral-600">{e.basis}</td>
              <td className="py-2 pr-2">
                <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600">{e.level}</span>
              </td>
              <td className="py-2">
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${e.impactColor}`}>{e.impact}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </MockupCard>
  );
}

function MonitoringMockup() {
  const metrics = [
    { name: "Précision modèle", value: "94.2%", trend: "up" as const, delta: "+1.3%" },
    { name: "Latence P95", value: "234ms", trend: "down" as const, delta: "-12ms" },
    { name: "Dérive données", value: "0.08", trend: "stable" as const, delta: "±0.01" },
    { name: "Volume requêtes", value: "12.4K", trend: "up" as const, delta: "+8%" },
  ];
  const TrendIcon = { up: TrendingUp, down: TrendingDown, stable: Minus };
  const trendColor = { up: "text-emerald-500", down: "text-emerald-500", stable: "text-neutral-400" };
  return (
    <MockupCard title="Monitoring" icon={Activity}>
      <div className="grid grid-cols-2 gap-2.5">
        {metrics.map((m) => {
          const TIcon = TrendIcon[m.trend];
          return (
            <div key={m.name} className="rounded-xl border border-neutral-100 bg-neutral-50/50 px-3 py-2.5">
              <p className="text-[10px] text-neutral-400">{m.name}</p>
              <p className="mt-0.5 text-lg font-bold text-neutral-800">{m.value}</p>
              <div className="mt-0.5 flex items-center gap-1">
                <TIcon className={`size-3 ${trendColor[m.trend]}`} />
                <span className={`text-[10px] font-medium ${trendColor[m.trend]}`}>{m.delta}</span>
              </div>
            </div>
          );
        })}
      </div>
    </MockupCard>
  );
}

function DataMockup() {
  const datasets = [
    { name: "Données clients CRM", source: "Interne", sensitivity: "Personnel", records: "145K", pii: true },
    { name: "Historique transactions", source: "Interne", sensitivity: "Financier", records: "2.3M", pii: true },
    { name: "Dataset entraînement NLP", source: "Synthétique", sensitivity: "Public", records: "500K", pii: false },
  ];
  return (
    <MockupCard title="Catalogue de données" icon={Database}>
      <div className="space-y-2.5">
        {datasets.map((d) => (
          <div key={d.name} className="rounded-xl border border-neutral-100 bg-neutral-50/50 px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-neutral-800">{d.name}</p>
              <span className="text-[10px] tabular-nums text-neutral-400">{d.records} enreg.</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600">{d.source}</span>
              <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600">{d.sensitivity}</span>
              {d.pii && <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[9px] font-semibold text-red-600">DCP</span>}
            </div>
          </div>
        ))}
      </div>
    </MockupCard>
  );
}

function VeilleMockup() {
  const articles = [
    { title: "Loi 25 : nouvelles obligations pour les systèmes de décision automatisée", source: "Gazette officielle", date: "1 mars", tag: "Québec", tagColor: "text-blue-600 bg-blue-50" },
    { title: "EU AI Act : entrée en vigueur des exigences pour les systèmes à haut risque", source: "EUR-Lex", date: "28 fév", tag: "EU", tagColor: "text-[#57886c] bg-[#57886c]/10" },
    { title: "NIST publie la mise à jour du AI RMF Playbook", source: "NIST", date: "25 fév", tag: "USA", tagColor: "text-emerald-600 bg-emerald-50" },
  ];
  return (
    <MockupCard title="Veille réglementaire" icon={Newspaper}>
      <div className="space-y-2.5">
        {articles.map((a) => (
          <div key={a.title} className="rounded-lg border border-neutral-100 px-3 py-2.5">
            <div className="flex items-center gap-2 mb-1">
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${a.tagColor}`}>{a.tag}</span>
              <span className="text-[10px] text-neutral-400">{a.date}</span>
            </div>
            <p className="text-xs font-medium text-neutral-800 leading-snug">{a.title}</p>
            <p className="mt-0.5 text-[10px] text-neutral-400">{a.source}</p>
          </div>
        ))}
      </div>
    </MockupCard>
  );
}

/* ── Intelligence category mockups ── */

function DashboardMockup() {
  const kpis = [
    { label: "Systèmes en production", value: "12", icon: Bot, trend: "+2", trendColor: "text-emerald-500" },
    { label: "Score conformité", value: "72%", icon: CheckCircle, trend: "+5%", trendColor: "text-emerald-500" },
    { label: "Incidents actifs", value: "3", icon: AlertCircle, trend: "-1", trendColor: "text-emerald-500" },
    { label: "Systèmes haut risque", value: "4", icon: AlertTriangle, trend: "+1", trendColor: "text-red-500" },
  ];
  return (
    <MockupCard title="Tableau de bord" icon={LayoutDashboard}>
      <div className="grid grid-cols-2 gap-2.5">
        {kpis.map((k) => {
          const KIcon = k.icon;
          return (
            <div key={k.label} className="rounded-xl border border-neutral-100 bg-neutral-50/50 px-3 py-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <KIcon className="size-3 text-[#57886c]" />
                <p className="text-[10px] text-neutral-400 truncate">{k.label}</p>
              </div>
              <div className="flex items-baseline gap-1.5">
                <p className="text-xl font-bold text-neutral-800">{k.value}</p>
                <span className={`text-[10px] font-medium ${k.trendColor}`}>{k.trend}</span>
              </div>
            </div>
          );
        })}
      </div>
    </MockupCard>
  );
}

function AiChatMockup() {
  return (
    <MockupCard title="Assistant IA" icon={MessageSquare}>
      <div className="space-y-3">
        {/* User message */}
        <div className="flex justify-end">
          <div className="rounded-2xl rounded-br-md bg-[#57886c] px-3.5 py-2 max-w-[80%]">
            <p className="text-xs text-white">Quelles sont nos obligations sous la Loi 25 pour notre chatbot IA ?</p>
          </div>
        </div>
        {/* AI response */}
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-bl-md bg-neutral-100 px-3.5 py-2 max-w-[85%]">
            <p className="text-xs text-neutral-700 leading-relaxed">
              Pour votre chatbot IA, la Loi 25 exige : <strong>transparence</strong> (informer que c'est une IA), <strong>consentement</strong> pour les données personnelles, et un <strong>mécanisme de contestation</strong> des décisions.
            </p>
          </div>
        </div>
        {/* Input */}
        <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2">
          <span className="flex-1 text-[11px] text-neutral-400">Posez votre question...</span>
          <Send className="size-3.5 text-[#57886c]" />
        </div>
      </div>
    </MockupCard>
  );
}

/* ── Community category mockups ── */

function MembersMockup() {
  const members = [
    { name: "Marie-Claude Trudel", role: "DPO", org: "Desjardins", tier: "Expert", tierColor: "text-[#57886c] bg-[#57886c]/10" },
    { name: "Jean-François Roy", role: "VP Technologie", org: "Hydro-Québec", tier: "Membre", tierColor: "text-blue-600 bg-blue-50" },
    { name: "Sophie Lavoie", role: "Dir. Conformité", org: "BNC", tier: "Expert", tierColor: "text-[#57886c] bg-[#57886c]/10" },
  ];
  return (
    <MockupCard title="Répertoire des membres" icon={Users}>
      <div className="space-y-2.5">
        {members.map((m) => (
          <div key={m.name} className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50/50 px-4 py-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-[#57886c] text-white text-xs font-bold">
              {m.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-neutral-800">{m.name}</p>
              <p className="text-[10px] text-neutral-500">{m.role} · {m.org}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold ${m.tierColor}`}>{m.tier}</span>
          </div>
        ))}
      </div>
    </MockupCard>
  );
}

function ProfileMockup() {
  return (
    <MockupCard title="Profil professionnel" icon={UserCircle}>
      <div className="text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#57886c] text-white text-lg font-bold">
          MC
        </div>
        <p className="mt-2.5 text-sm font-bold text-neutral-800">Marie-Claude Trudel</p>
        <p className="text-[11px] text-neutral-500">Déléguée à la protection des données</p>
        <p className="text-[10px] text-neutral-400">Desjardins · Montréal</p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="rounded-full bg-[#57886c]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#57886c]">Expert</span>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-600">Loi 25</span>
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600">RGPD</span>
        </div>
        <div className="mt-3 flex items-center justify-center gap-3 text-[10px] text-neutral-400">
          <span className="flex items-center gap-1"><Star className="size-3 text-amber-400 fill-amber-400" /> 4.9</span>
          <span className="flex items-center gap-1"><Link2 className="size-3" /> LinkedIn</span>
          <span className="flex items-center gap-1"><Globe className="size-3" /> Site web</span>
        </div>
      </div>
    </MockupCard>
  );
}

function LibraryMockup() {
  const resources = [
    { name: "Guide Loi 25 & IA", type: "Guide", icon: "📘", downloads: "1.2K" },
    { name: "Template PIA", type: "Modèle", icon: "📝", downloads: "890" },
    { name: "Checklist EU AI Act", type: "Checklist", icon: "✅", downloads: "2.1K" },
    { name: "Matrice de risques IA", type: "Outil", icon: "📊", downloads: "1.5K" },
  ];
  return (
    <MockupCard title="Bibliothèque" icon={BookOpen}>
      <div className="grid grid-cols-2 gap-2">
        {resources.map((r) => (
          <div key={r.name} className="rounded-xl border border-neutral-100 bg-neutral-50/50 px-3 py-2.5 text-center">
            <span className="text-xl">{r.icon}</span>
            <p className="mt-1 text-[11px] font-semibold text-neutral-800 leading-tight">{r.name}</p>
            <p className="mt-0.5 text-[10px] text-neutral-400">{r.type} · {r.downloads}</p>
          </div>
        ))}
      </div>
    </MockupCard>
  );
}

/* ── Nouveautés mockup ── */

function LegalChatbotMockup() {
  const jurisdictions = [
    { code: "QC", label: "Québec", active: true },
    { code: "CA", label: "Canada", active: true },
    { code: "EU", label: "Union européenne", active: false },
    { code: "FR", label: "France", active: false },
  ];
  return (
    <div className="w-full rounded-2xl border border-neutral-200 bg-white shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-[#57886c]">
            <BookOpenCheck className="size-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-neutral-800">Assistant juridique IA</span>
        </div>
        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[9px] font-bold tracking-wider px-1.5 py-0 h-4">
          <Zap className="size-2.5 mr-0.5" />
          NOUVEAU
        </Badge>
      </div>

      {/* Jurisdiction selector */}
      <div className="border-b border-neutral-100 px-5 py-3">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="size-3 text-neutral-400" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Juridictions sélectionnées</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {jurisdictions.map((j) => (
            <button
              key={j.code}
              type="button"
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                j.active
                  ? "bg-[#57886c]/10 text-[#57886c] ring-1 ring-[#57886c]/20"
                  : "bg-neutral-100 text-neutral-400"
              }`}
            >
              {j.code} - {j.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat body */}
      <div className="px-5 py-4 space-y-3">
        {/* User question */}
        <div className="flex justify-end">
          <div className="rounded-2xl rounded-br-md bg-[#57886c] px-3.5 py-2 max-w-[80%]">
            <p className="text-xs text-white">Quelles sont les obligations de transparence pour les décisions automatisées au Québec ?</p>
          </div>
        </div>
        {/* AI answer with source badges */}
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-bl-md bg-neutral-100 px-3.5 py-2.5 max-w-[85%]">
            <p className="text-xs text-neutral-700 leading-relaxed">
              En vertu de la <strong>Loi 25</strong> (art. 12.1), toute décision fondée exclusivement sur un traitement automatisé doit être communiquée à la personne concernée, avec le droit de <strong>soumettre des observations</strong> et de <strong>demander une révision humaine</strong>.
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-600">
                <FileText className="size-2.5" /> Loi 25, art. 12.1
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-600">
                <FileText className="size-2.5" /> RLRQ c. P-39.1
              </span>
            </div>
          </div>
        </div>
        {/* Input */}
        <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2">
          <span className="flex-1 text-[11px] text-neutral-400">Posez une question juridique...</span>
          <Send className="size-3.5 text-[#57886c]" />
        </div>
      </div>
    </div>
  );
}

/* ── Questionnaire fournisseur mockup ── */

function VendorQuestionnaireMockup() {
  const vendors = [
    { name: "OpenAI", email: "security@openai.com", status: "completed", score: 92, certs: ["SOC 2", "ISO 27001"] },
    { name: "Anthropic", email: "compliance@anthropic.com", status: "pending", score: null, certs: [] },
    { name: "Mistral AI", email: "dpo@mistral.ai", status: "in_progress", score: null, certs: ["ISO 27001"] },
  ];

  const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
    completed: { label: "Complété", bg: "bg-emerald-50", text: "text-emerald-600" },
    pending: { label: "En attente", bg: "bg-amber-50", text: "text-amber-600" },
    in_progress: { label: "En cours", bg: "bg-blue-50", text: "text-blue-600" },
  };

  return (
    <div className="w-full rounded-2xl border border-neutral-200 bg-white shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-[#57886c]">
            <ClipboardList className="size-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-neutral-800">Questionnaire fournisseur</span>
        </div>
        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[9px] font-bold tracking-wider px-1.5 py-0 h-4">
          <Zap className="size-2.5 mr-0.5" />
          NOUVEAU
        </Badge>
      </div>

      {/* Vendor rows */}
      <div className="divide-y divide-neutral-100">
        {vendors.map((v) => {
          const st = statusConfig[v.status];
          return (
            <div key={v.name} className="px-5 py-3 flex items-center gap-3">
              {/* Avatar */}
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[11px] font-bold text-neutral-600">
                {v.name.charAt(0)}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-800 truncate">{v.name}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${st.bg} ${st.text}`}>
                    {st.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Mail className="size-2.5 text-neutral-400" />
                  <span className="text-[10px] text-neutral-400 truncate">{v.email}</span>
                </div>
              </div>
              {/* Score or certs */}
              <div className="shrink-0 text-right">
                {v.score !== null ? (
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1">
                      <BarChart3 className="size-3 text-emerald-500" />
                      <span className="text-xs font-bold text-emerald-600">{v.score}/100</span>
                    </div>
                  </div>
                ) : v.certs.length > 0 ? (
                  <div className="flex gap-1">
                    {v.certs.map((c) => (
                      <span key={c} className="rounded bg-neutral-100 px-1.5 py-0.5 text-[9px] font-medium text-neutral-500">{c}</span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] text-neutral-300">-</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer action */}
      <div className="border-t border-neutral-100 px-5 py-3 flex items-center justify-between">
        <span className="text-[10px] text-neutral-400">3 fournisseurs · 1 complété</span>
        <div className="flex items-center gap-1.5 text-[#57886c]">
          <Send className="size-3" />
          <span className="text-[10px] font-semibold">Envoyer un rappel</span>
        </div>
      </div>
    </div>
  );
}

/* ── Serveur MCP mockup ── */

function McpServerMockup() {
  const events = [
    {
      time: "14:32:07",
      agent: "Agent-Compliance",
      type: "decision",
      label: "Décision algorithmique",
      detail: "Classification risque → Élevé (score 0.87)",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
      Icon: Cpu,
    },
    {
      time: "14:31:42",
      agent: "Agent-Monitoring",
      type: "change",
      label: "Changement mécanisme",
      detail: "Seuil de dérive mis à jour : 0.05 → 0.03",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      Icon: ScrollText,
    },
    {
      time: "14:30:15",
      agent: "Agent-Audit",
      type: "declaration",
      label: "Déclaration autonome",
      detail: "Post-mortem incident #847 généré automatiquement",
      iconBg: "bg-emerald-50",
      iconColor: "text-[#57886c]",
      Icon: ShieldCheck,
    },
  ];

  return (
    <div className="w-full rounded-2xl border border-neutral-200 bg-white shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-[#57886c]">
            <Server className="size-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-neutral-800">Serveur MCP</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Connecté
          </span>
          <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[9px] font-bold tracking-wider px-1.5 py-0 h-4">
            <Zap className="size-2.5 mr-0.5" />
            NOUVEAU
          </Badge>
        </div>
      </div>

      {/* Protocol info bar */}
      <div className="border-b border-neutral-100 px-5 py-2.5 flex items-center justify-between bg-neutral-50/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Plug className="size-3 text-neutral-400" />
            <span className="text-[10px] font-mono text-neutral-500">mcp://gouvernance.ai/v1</span>
          </div>
        </div>
        <span className="text-[10px] text-neutral-400">3 agents connectés</span>
      </div>

      {/* Event log */}
      <div className="divide-y divide-neutral-50">
        {events.map((e, i) => (
          <div key={i} className="px-5 py-3 flex items-start gap-3">
            <div className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${e.iconBg} mt-0.5`}>
              <e.Icon className={`size-3.5 ${e.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-neutral-400">{e.time}</span>
                <span className="text-[10px] font-semibold text-neutral-600">{e.agent}</span>
              </div>
              <p className="text-[11px] font-semibold text-neutral-800 mt-0.5">{e.label}</p>
              <p className="text-[10px] text-neutral-500 mt-0.5">{e.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-100 px-5 py-2.5 flex items-center justify-between bg-neutral-50/30">
        <span className="text-[10px] text-neutral-400">Journal temps réel · 847 événements aujourd'hui</span>
        <span className="text-[10px] font-semibold text-[#57886c]">Voir l'audit complet →</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  NOUVEAUTÉS SLIDES DATA                                              */
/* ------------------------------------------------------------------ */

interface NewFeatureSlide {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  secondaryDescription?: string;
  tags: string[];
  mockup: () => ReactNode;
}

const NOUVEAUTES_SLIDES: NewFeatureSlide[] = [
  {
    id: "legal-chatbot",
    icon: BookOpenCheck,
    title: "Assistant juridique IA",
    description:
      "Un chatbot spécialisé qui travaille exclusivement avec les textes de loi et documents juridiques officiels. Sélectionnez vos juridictions (Québec, Canada, Union européenne, France) et posez vos questions en langage naturel.",
    secondaryDescription:
      "Chaque réponse cite ses sources légales avec les articles de loi pertinents. Idéal pour vérifier rapidement vos obligations réglementaires en matière d'IA.",
    tags: ["Loi 25", "C-27 / AIDA", "EU AI Act", "RGPD", "RLRQ"],
    mockup: LegalChatbotMockup,
  },
  {
    id: "vendor-questionnaire",
    icon: ClipboardList,
    title: "Questionnaire fournisseur automatique",
    description:
      "Envoi automatique d'un questionnaire de sécurité aux fournisseurs d'IA. Collecte des certifications (ISO 27001, SOC 2…), des mesures de protection des données et des engagements de conformité, le tout sans intervention manuelle.",
    tags: ["Envoi automatique par courriel", "Formulaire personnalisable", "Suivi en temps réel", "Scoring automatique"],
    mockup: VendorQuestionnaireMockup,
  },
  {
    id: "mcp-server",
    icon: Server,
    title: "Serveur MCP pour agents IA",
    description:
      "Un serveur MCP (Model Context Protocol) permettant aux agents IA autonomes de déclarer leurs décisions algorithmiques et les changements dans leurs mécanismes. Traçabilité complète pour une gouvernance de l'autonomie IA.",
    tags: ["Déclaration des décisions algorithmiques", "Journal des changements autonomes", "Intégration native agents IA", "Conformité et auditabilité"],
    mockup: McpServerMockup,
  },
];

/* ------------------------------------------------------------------ */
/*  STATIC DATA                                                         */
/* ------------------------------------------------------------------ */

const CATEGORIES: Category[] = [
  {
    id: "inventory",
    features: [
      { key: "aiSystems", icon: Bot, mockup: AiSystemsMockup },
      { key: "lifecycle", icon: RefreshCw, mockup: LifecycleMockup },
      { key: "vendors", icon: Building2, mockup: VendorsMockup },
    ],
  },
  {
    id: "risks",
    features: [
      { key: "risks", icon: AlertTriangle, mockup: RisksMockup },
      { key: "incidents", icon: AlertCircle, mockup: IncidentsMockup },
      { key: "bias", icon: Scale, mockup: BiasMockup },
    ],
  },
  {
    id: "compliance",
    features: [
      { key: "compliance", icon: CheckCircle, mockup: ComplianceMockup },
      { key: "policies", icon: Shield, mockup: PoliciesMockup },
      { key: "decisions", icon: ClipboardCheck, mockup: DecisionsMockup },
      { key: "documents", icon: FileText, mockup: DocumentsMockup },
      { key: "agents", icon: Bot, mockup: AgentsMockup },
    ],
  },
  {
    id: "operations",
    features: [
      { key: "transparency", icon: Eye, mockup: TransparencyMockup },
      { key: "monitoring", icon: Activity, mockup: MonitoringMockup },
      { key: "data", icon: Database, mockup: DataMockup },
      { key: "veille", icon: Newspaper, mockup: VeilleMockup },
    ],
  },
  {
    id: "intelligence",
    features: [
      { key: "dashboard", icon: LayoutDashboard, mockup: DashboardMockup },
      { key: "aiChat", icon: MessageSquare, mockup: AiChatMockup },
    ],
  },
  {
    id: "community",
    features: [
      { key: "members", icon: Users, mockup: MembersMockup },
      { key: "profile", icon: UserCircle, mockup: ProfileMockup },
      { key: "library", icon: BookOpen, mockup: LibraryMockup },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  ANIMATION VARIANTS                                                  */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const slideFromLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const slideFromRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

/* ------------------------------------------------------------------ */
/*  NOUVEAUTÉS SLIDER                                                   */
/* ------------------------------------------------------------------ */

const SLIDE_INTERVAL = 7000; // 7s per slide

function NouveautesSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = NOUVEAUTES_SLIDES.length;

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [paused, total]);

  const goTo = (idx: number) => setCurrent(idx);
  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  const slide = NOUVEAUTES_SLIDES[current];
  const SlideIcon = slide.icon;
  const SlideMockup = slide.mockup;

  return (
    <section
      className="relative overflow-hidden bg-[#0e0f19] py-16 sm:py-24"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Subtle glow */}
      <div className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 size-[400px] rounded-full bg-[#57886c]/8 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Section header ── */}
        <div className="mb-12 sm:mb-14">
          {/* Top label */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#57886c]/15 ring-1 ring-[#57886c]/25">
              <Zap className="size-5 text-[#81a684]" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#81a684]">
                Nouveautés
              </span>
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-[#57886c]/20 px-2 py-0.5 text-[10px] font-bold text-[#81a684]">
                {total}
              </span>
            </div>
          </div>

          {/* Title + nav row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Dernières fonctionnalités
              </h2>
              <p className="mt-2 text-sm sm:text-base text-white/50 max-w-md">
                Découvrez les modules récemment ajoutés à la plateforme.
              </p>
            </div>

            {/* Navigation controls */}
            <div className="flex items-center gap-4 shrink-0">
              {/* Slide titles as pills */}
              <div className="hidden md:flex items-center gap-1.5">
                {NOUVEAUTES_SLIDES.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => goTo(i)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-300 ${
                      i === current
                        ? "bg-[#57886c]/20 text-[#81a684] ring-1 ring-[#57886c]/30"
                        : "text-white/30 hover:text-white/60 hover:bg-white/5"
                    }`}
                  >
                    {s.title.length > 22 ? `${s.title.slice(0, 22)}…` : s.title}
                  </button>
                ))}
              </div>

              {/* Dots (mobile) */}
              <div className="flex md:hidden items-center gap-1.5">
                {NOUVEAUTES_SLIDES.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => goTo(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === current
                        ? "w-6 h-2 bg-[#81a684]"
                        : "size-2 bg-white/20 hover:bg-white/40"
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>

              {/* Arrows */}
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={prev}
                  className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label="Précédent"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label="Suivant"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Slide content */}
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16"
        >
          {/* Text */}
          <div>
            <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-[#57886c]">
              <SlideIcon className="size-6 text-white" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {slide.title}
            </h2>
            <p className="mt-4 text-base text-white/60 leading-relaxed max-w-lg">
              {slide.description}
            </p>
            {slide.secondaryDescription && (
              <p className="mt-3 text-base text-white/60 leading-relaxed max-w-lg">
                {slide.secondaryDescription}
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-2">
              {slide.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Mockup */}
          <div>
            <SlideMockup />
          </div>
        </motion.div>

        {/* Progress bar */}
        <div className="mt-10 h-0.5 w-full rounded-full bg-white/5">
          <motion.div
            key={`progress-${current}`}
            className="h-full rounded-full bg-gradient-to-r from-[#81a684] to-[#57886c]"
            initial={{ width: "0%" }}
            animate={{ width: paused ? undefined : "100%" }}
            transition={{ duration: SLIDE_INTERVAL / 1000, ease: "linear" }}
          />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                           */
/* ------------------------------------------------------------------ */

export function FonctionnalitesPage() {
  const { t } = useTranslation("fonctionnalites");

  /* ---- IntersectionObserver for active nav pill ---- */
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id);
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );

    for (const cat of CATEGORIES) {
      const el = sectionRefs.current[cat.id];
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  /** Scroll the active pill into view inside the horizontal nav */
  useEffect(() => {
    if (!navRef.current) return;
    const active = navRef.current.querySelector(
      `[data-cat="${activeCategory}"]`,
    ) as HTMLElement | null;
    if (active) {
      active.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    }
  }, [activeCategory]);

  const scrollToSection = (id: string) => {
    const el = sectionRefs.current[id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <SEO title={t("seo.title")} description={t("seo.description")} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Fonctionnalites -- Cercle de Gouvernance en Intelligence Artificielle",
          description: t("seo.description"),
          url: "https://gouvernance.ai/fonctionnalites",
        }}
      />

      {/* ============================================================ */}
      {/*  HERO                                                         */}
      {/* ============================================================ */}
      <section
        className="relative overflow-hidden pt-32 pb-20 sm:pt-36 sm:pb-24"
        style={{
          backgroundColor: "#ffffff",
          backgroundImage: `
            radial-gradient(at 0% 0%, #E9E0D1 0, transparent 50%),
            radial-gradient(at 100% 0%, #E9E0D1 0, transparent 50%),
            radial-gradient(at 100% 100%, #E9E0D1 0, transparent 50%),
            radial-gradient(at 0% 100%, #E9E0D1 0, transparent 50%)
          `,
        }}
      >
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-950 tracking-tight"
          >
            {t("hero.title")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="mt-4 text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed"
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button
              asChild
              size="lg"
              className="bg-[#57886c] hover:bg-[#466060] text-white px-7 h-11 text-sm font-semibold"
            >
              <Link to="/inscription">
                {t("hero.cta")}
                <ArrowRight className="size-3.5 ml-1.5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-neutral-300 text-neutral-700 hover:bg-neutral-100 px-7 h-11 text-sm font-semibold"
            >
              <Link to="/tarifs">{t("hero.ctaSecondary")}</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  NOUVEAUTÉS — auto-sliding carousel                            */}
      {/* ============================================================ */}
      <NouveautesSlider />

      {/* ============================================================ */}
      {/*  STICKY CATEGORY NAV                                          */}
      {/* ============================================================ */}
      <nav className="sticky top-16 z-30 bg-white/80 backdrop-blur-lg border-b border-border/40">
        <div
          ref={navRef}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex gap-2 overflow-x-auto py-3 scrollbar-hide"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              data-cat={cat.id}
              onClick={() => scrollToSection(cat.id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.id
                  ? "bg-[#57886c]/10 text-[#57886c] shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {t(`categories.${cat.id}.title`)}
            </button>
          ))}
        </div>
      </nav>

      {/* ============================================================ */}
      {/*  FEATURE SECTIONS                                             */}
      {/* ============================================================ */}
      {CATEGORIES.map((cat, catIdx) => {
        const hasMockups = cat.features.some((f) => f.mockup);

        return (
          <section
            key={cat.id}
            id={cat.id}
            ref={(el) => {
              sectionRefs.current[cat.id] = el;
            }}
            className={`scroll-mt-28 py-16 sm:py-24 ${
              catIdx % 2 === 0 ? "bg-white" : "bg-neutral-50/60"
            }`}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Section header */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
                  {t(`categories.${cat.id}.title`)}
                </h2>
                <p className="mt-3 text-muted-foreground text-base max-w-xl mx-auto">
                  {t(`categories.${cat.id}.subtitle`)}
                </p>
              </motion.div>

              {hasMockups ? (
                /* ── Stacked layout: text left, mockup right ── */
                <div className="space-y-20 sm:space-y-28">
                  {cat.features.map((feat) => {
                    const Icon = feat.icon;
                    const Mockup = feat.mockup;
                    return (
                      <div
                        key={feat.key}
                        className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16"
                      >
                        {/* Text side */}
                        <motion.div
                          variants={slideFromLeft}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true, margin: "-60px" }}
                        >
                          <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-[#57886c]/10">
                            <Icon className="size-6 text-[#57886c]" />
                          </div>
                          <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                            {t(`features.${feat.key}.title`)}
                          </h3>
                          <p className="mt-3 text-base text-muted-foreground leading-relaxed max-w-lg">
                            {t(`features.${feat.key}.description`)}
                          </p>
                        </motion.div>

                        {/* Mockup side */}
                        <motion.div
                          variants={slideFromRight}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true, margin: "-60px" }}
                        >
                          {Mockup ? <Mockup /> : null}
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* ── Grid layout (categories without mockups) ── */
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                  {cat.features.map((feat) => {
                    const Icon = feat.icon;
                    return (
                      <motion.div
                        key={feat.key}
                        variants={cardVariants}
                        className="group rounded-2xl border border-border/60 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#57886c]/40 hover:shadow-lg hover:shadow-[#57886c]/5"
                      >
                        <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-[#57886c]/10">
                          <Icon className="size-5 text-[#57886c]" />
                        </div>
                        <h3 className="text-base font-bold text-foreground mb-2">
                          {t(`features.${feat.key}.title`)}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {t(`features.${feat.key}.description`)}
                        </p>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </section>
        );
      })}

      {/* ============================================================ */}
      {/*  BOTTOM CTA                                                   */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-[#0e0f19] py-16 sm:py-24">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 size-[500px] rounded-full bg-[#57886c]/10 blur-[120px]" />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            {t("cta.title")}
          </h2>
          <p className="mt-4 text-base text-white/65 max-w-xl mx-auto leading-relaxed">
            {t("cta.subtitle")}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-[#57886c] hover:bg-[#466060] text-white px-7 h-11 text-sm font-semibold"
            >
              <Link to="/inscription">
                {t("cta.primary")}
                <ArrowRight className="size-3.5 ml-1.5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 hover:text-white px-7 h-11 text-sm font-semibold"
            >
              <Link to="/tarifs">{t("cta.secondary")}</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </>
  );
}
