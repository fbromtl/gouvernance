import { http, HttpResponse } from "msw";

const SUPABASE_URL = "https://test.supabase.co";

const tables = [
  "ai_systems", "incidents", "risk_assessments", "decisions",
  "compliance_assessments", "compliance_requirements", "remediation_actions",
  "compliance_snapshots",
  "bias_findings", "transparency_logs", "lifecycle_events",
  "documents", "monitoring_metrics", "monitoring_data_points",
  "datasets", "data_transfers", "vendors", "vendor_assessments",
  "agent_registry", "agent_traces", "agent_policies",
  "governance_roles", "governance_committees", "governance_policies",
  "governance_diagnostics", "automated_decisions", "contestations",
  "members", "profiles", "organizations", "subscriptions",
  "notifications", "audit_logs", "plan_features",
  // Legacy aliases (kept for any remaining references)
  "monitoring_alerts", "monitoring_kpis",
  "data_sources", "committees", "policies", "audit_log",
  "user_roles",
];

export const handlers = tables.flatMap((table) => [
  http.get(`${SUPABASE_URL}/rest/v1/${table}`, () => {
    return HttpResponse.json([]);
  }),
  http.post(`${SUPABASE_URL}/rest/v1/${table}`, () => {
    return HttpResponse.json([{}], { status: 201 });
  }),
  http.patch(`${SUPABASE_URL}/rest/v1/${table}`, () => {
    return HttpResponse.json([{}]);
  }),
  http.delete(`${SUPABASE_URL}/rest/v1/${table}`, () => {
    return HttpResponse.json([{}]);
  }),
]);

export { SUPABASE_URL };
