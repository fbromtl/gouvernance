import type { Permission } from "@/lib/permissions";
import {
  LayoutDashboard,
  Bot,
  Shield,
  AlertTriangle,
  ClipboardCheck,
  Scale,
  AlertCircle,
  Eye,
  RefreshCw,
  FileText,
  Activity,
  Database,
  Building2,
  CheckCircle,
  Newspaper,
  BookOpen,
  Users,
  CreditCard,
  Map,
} from "lucide-react";

export interface NavItem {
  key: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
  ready?: boolean;
  badge?: string;
}

export interface NavGroup {
  /** Translation key for the group label (e.g. "sections.overview") */
  labelKey: string;
  /** Category identifier used by the icon rail */
  category: string;
  items: NavItem[];
}

/** Icon used to represent each category in the icon rail */
export const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  overview: LayoutDashboard,
  inventory: Bot,
  governance: Shield,
  risks: AlertTriangle,
  operations: Activity,
  organization: Building2,
};

export const navGroups: NavGroup[] = [
  {
    labelKey: "sections.overview",
    category: "overview",
    items: [
      { key: "dashboard", path: "/dashboard", icon: LayoutDashboard, ready: true },
      { key: "veille", path: "/veille", icon: Newspaper, ready: true, badge: "IA" },
      { key: "bibliotheque", path: "/bibliotheque", icon: BookOpen, ready: true },
      { key: "roadmap", path: "/roadmap", icon: Map, ready: true },
    ],
  },
  {
    labelKey: "sections.inventory",
    category: "inventory",
    items: [
      { key: "aiSystems", path: "/ai-systems", icon: Bot, ready: true },
      { key: "lifecycle", path: "/lifecycle", icon: RefreshCw, ready: true },
      { key: "vendors", path: "/vendors", icon: Building2, permission: "manage_vendors", ready: true },
    ],
  },
  {
    labelKey: "sections.governance",
    category: "governance",
    items: [
      { key: "governance", path: "/governance", icon: Shield, permission: "manage_policies", ready: true },
      { key: "decisions", path: "/decisions", icon: ClipboardCheck, permission: "approve_decisions", ready: true },
      { key: "compliance", path: "/compliance", icon: CheckCircle, permission: "manage_compliance", ready: true },
      { key: "documents", path: "/documents", icon: FileText, ready: true },
    ],
  },
  {
    labelKey: "sections.risks",
    category: "risks",
    items: [
      { key: "risks", path: "/risks", icon: AlertTriangle, permission: "assess_risks", ready: true },
      { key: "incidents", path: "/incidents", icon: AlertCircle, ready: true },
      { key: "bias", path: "/bias", icon: Scale, permission: "manage_bias", ready: true },
    ],
  },
  {
    labelKey: "sections.operations",
    category: "operations",
    items: [
      { key: "transparency", path: "/transparency", icon: Eye, ready: true },
      { key: "monitoring", path: "/monitoring", icon: Activity, permission: "configure_monitoring", ready: true },
      { key: "data", path: "/data", icon: Database, ready: true },
      { key: "agents", path: "/agents", icon: Bot, ready: true },
      { key: "agentTraces", path: "/agent-traces", icon: Activity, ready: true },
    ],
  },
  {
    labelKey: "sections.organization",
    category: "organization",
    items: [
      { key: "members", path: "/membres", icon: Users, ready: true },
      { key: "admin", path: "/admin", icon: Building2, ready: true },
      { key: "billing", path: "/billing", icon: CreditCard, ready: true },
    ],
  },
];

/**
 * Given a pathname (e.g. "/risks/123"), returns the matching category key.
 * Falls back to "overview" if no match.
 */
export function getCategoryForPath(pathname: string): string {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (pathname === item.path || pathname.startsWith(item.path + "/")) {
        return group.category;
      }
    }
  }
  return "overview";
}
