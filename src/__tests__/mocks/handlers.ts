import { http, HttpResponse } from "msw";

const SUPABASE_URL = "https://test.supabase.co";

const tables = [
  "ai_systems", "incidents", "risk_assessments", "decisions",
  "compliance_assessments", "compliance_requirements", "remediation_actions",
  "bias_findings", "transparency_logs", "lifecycle_events",
  "documents", "monitoring_alerts", "monitoring_kpis",
  "data_sources", "vendors", "vendor_assessments",
  "agent_registry", "agent_traces", "agent_policies",
  "governance_roles", "committees", "policies",
  "members", "profiles", "organizations", "subscriptions",
  "notifications", "audit_log", "plan_features",
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
