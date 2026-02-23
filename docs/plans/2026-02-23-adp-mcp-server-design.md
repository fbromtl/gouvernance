# ADP MCP Server — Design Document

**Date:** 2026-02-23
**Status:** Approved
**Compatibility:** [agent-decision-protocol](https://github.com/OpenAgentGovernance/agent-decision-protocol) v0.3.0

## Summary

A Supabase Edge Function implementing the Agent Decision Protocol (ADP) as an MCP server. AI agents authenticate via API keys and use 8 MCP tools to classify decisions, check authorization, log hash-chained traces, and evaluate governance policies. All data persists in Supabase PostgreSQL alongside the existing gouvernance.ai platform.

## Architecture

```
Agent IA ──── HTTPS + API Key ────▶ Edge Function (adp-mcp/index.ts)
                                          │
                                          ├─ adp_register_agent
                                          ├─ adp_classify
                                          ├─ adp_authorize
                                          ├─ adp_log_trace
                                          ├─ adp_evaluate_policy
                                          ├─ adp_validate
                                          ├─ adp_add_policy
                                          └─ adp_verify_chain
                                          │
                                          ▼ service_role
                                   Supabase PostgreSQL
                                   ├─ agent_registry
                                   ├─ agent_api_keys
                                   ├─ agent_traces
                                   └─ agent_policies
```

**Runtime:** Supabase Edge Function (Deno)
**Auth:** API key per agent (SHA-256 hashed, stored in `agent_api_keys`)
**Storage:** 4 new Supabase tables, organization-scoped

## Database Schema

### Table `agent_registry`

Agent inventory with autonomy classification.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Internal ID |
| organization_id | UUID | NOT NULL, FK → organizations(id) | Org scope |
| agent_id | TEXT | NOT NULL, UNIQUE | Public agent identifier |
| name | TEXT | NOT NULL | Human-readable name |
| description | TEXT | | Agent purpose |
| autonomy_level | TEXT | NOT NULL, CHECK (A1-A5) | ADP autonomy level |
| allowed_types | TEXT[] | DEFAULT '{}' | Allowed decision types (D1-D4) |
| max_risk | TEXT | DEFAULT 'R2', CHECK (R1-R4) | Maximum risk level |
| owner_name | TEXT | | Responsible person/team |
| owner_email | TEXT | | Contact email |
| status | TEXT | DEFAULT 'active', CHECK (active/suspended/revoked) | Agent status |
| metadata | JSONB | DEFAULT '{}' | Extensible metadata |
| created_at | TIMESTAMPTZ | DEFAULT now() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Last update |

### Table `agent_api_keys`

API keys for agent authentication (keys never stored in plaintext).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Key ID |
| agent_registry_id | UUID | FK → agent_registry(id) ON DELETE CASCADE | Linked agent |
| key_hash | TEXT | NOT NULL | SHA-256 hash of the full key |
| key_prefix | TEXT | NOT NULL | First 8 chars for identification |
| last_used_at | TIMESTAMPTZ | | Last usage timestamp |
| revoked_at | TIMESTAMPTZ | | Revocation timestamp (null = active) |
| created_at | TIMESTAMPTZ | DEFAULT now() | Creation time |

### Table `agent_traces`

Hash-chained decision traces (ADP Trace Format).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Internal ID |
| organization_id | UUID | FK → organizations(id) | Org scope |
| trace_id | TEXT | NOT NULL, UNIQUE | ADP trace identifier |
| agent_id | TEXT | NOT NULL | Agent who made the decision |
| event_type | TEXT | NOT NULL, CHECK (decision/approval/escalation) | Event category |
| decision_type | TEXT | CHECK (D1-D4) | ADP decision type |
| risk_level | TEXT | CHECK (R1-R4) | Risk classification |
| reversibility | TEXT | CHECK (total/partial/irreversible) | Reversibility class |
| classification_code | TEXT | | Combined code (e.g., D2-R2-partial) |
| description | TEXT | | Decision description |
| reasoning | TEXT | | Decision reasoning |
| authorization | JSONB | | {required, matrix_result, overrides} |
| context | JSONB | DEFAULT '{}' | Freeform context metadata |
| previous_hash | TEXT | | SHA-256 of previous event in chain |
| event_hash | TEXT | NOT NULL | SHA-256 of this event |
| created_at | TIMESTAMPTZ | DEFAULT now() | Event timestamp |

### Table `agent_policies`

Governance rules for agent behavior.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Policy ID |
| organization_id | UUID | FK → organizations(id) | Org scope |
| policy_id | TEXT | NOT NULL, UNIQUE | ADP policy identifier |
| name | TEXT | NOT NULL | Policy name |
| category | TEXT | | communication, financial, data, etc. |
| severity | TEXT | CHECK (low/medium/high/critical) | Severity level |
| rule | JSONB | NOT NULL | {condition, requirement, max_response_time} |
| regulatory_mapping | TEXT[] | DEFAULT '{}' | Regulatory references |
| active | BOOLEAN | DEFAULT true | Active flag |
| created_at | TIMESTAMPTZ | DEFAULT now() | Creation time |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Last update |

## MCP Tools Specification

### 1. `adp_register_agent`

Register an AI agent in the organization's registry.

**Input:**
```json
{
  "agent_id": "agent-billing-001",
  "name": "Billing Reconciliation Agent",
  "autonomy_level": "A3",
  "allowed_types": ["D1", "D2"],
  "max_risk": "R2",
  "owner": { "name": "Finance Team", "email": "finance@company.com" },
  "description": "Handles monthly billing reconciliation"
}
```

**Output:**
```json
{
  "agent_id": "agent-billing-001",
  "api_key": "adp_sk_a1b2c3d4e5f6...",
  "status": "active",
  "autonomy_level": "A3"
}
```

**Logic:** INSERT into `agent_registry`, generate crypto-random API key, hash and store in `agent_api_keys`, return plaintext key (only time it's shown).

### 2. `adp_classify`

Classify a decision along the ADP axes.

**Input:**
```json
{
  "type": "D2",
  "risk_level": "R2",
  "reversibility": "partial"
}
```

**Output:**
```json
{
  "classification_code": "D2-R2-partial",
  "risk_override": false,
  "requires_escalation": false
}
```

**Logic:** Pure function. Generates classification code. Flags `risk_override: true` if R3-R4. Flags `requires_escalation` based on D4 or high risk.

### 3. `adp_authorize`

Check the 5x4 authorization matrix.

**Input:**
```json
{
  "agent_id": "agent-billing-001",
  "decision_type": "D2",
  "risk_level": "R2"
}
```

**Output:**
```json
{
  "result": "authorized",
  "override_applied": false,
  "reasons": [],
  "matrix_cell": "A3 x D2 = AUTHORIZED"
}
```

**Logic:** Lookup agent autonomy level from `agent_registry`. Apply 5x4 matrix. Apply immutable overrides: D4 always requires approval; R3-R4 always escalate.

### 4. `adp_log_trace`

Log a hash-chained decision trace.

**Input:**
```json
{
  "agent_id": "agent-billing-001",
  "event_type": "decision",
  "decision": {
    "type": "D2",
    "risk_level": "R2",
    "reversibility": "partial",
    "classification_code": "D2-R2-partial",
    "description": "Selected vendor B over vendor A",
    "reasoning": "Vendor B offers 15% lower fees with equivalent SLA"
  },
  "authorization": {
    "required": false,
    "matrix_result": "A3 x D2 = AUTHORIZED"
  },
  "context": {}
}
```

**Output:**
```json
{
  "trace_id": "trc_abc123...",
  "event_hash": "sha256:...",
  "previous_hash": "sha256:...",
  "chain_length": 42
}
```

**Logic:** Fetch last trace for agent (get `event_hash` as `previous_hash`). Generate `trace_id`. Compute SHA-256 of canonical JSON (all fields except `event_hash`). INSERT into `agent_traces`.

### 5. `adp_evaluate_policy`

Evaluate a decision against active governance policies.

**Input:**
```json
{
  "agent_id": "agent-billing-001",
  "decision_type": "D2",
  "risk_level": "R2",
  "context": { "action_type": "vendor_selection", "amount": 50000 }
}
```

**Output:**
```json
{
  "compliant": true,
  "violations": [],
  "applicable_policies": ["POL-FIN-001"],
  "warnings": []
}
```

**Logic:** Load active `agent_policies` for the org. For each policy, evaluate `rule.condition` against the input context. Return violations and applicable policies.

### 6. `adp_validate`

Validate a trace event against ADP schemas.

**Input:** A complete trace event object.

**Output:**
```json
{
  "valid": true,
  "errors": [],
  "warnings": []
}
```

**Logic:** JSON schema validation — required fields, enum values, hash format, ISO timestamps.

### 7. `adp_add_policy`

Add a governance policy rule.

**Input:**
```json
{
  "policy_id": "POL-COM-001",
  "name": "External Communication Control",
  "category": "communication",
  "severity": "high",
  "rule": {
    "condition": { "action_type": "external_communication" },
    "requirement": "human_approval",
    "max_response_time": "PT1H"
  },
  "regulatory_mapping": ["loi25_art12", "eu_ai_act_art14"]
}
```

**Output:**
```json
{
  "policy_id": "POL-COM-001",
  "active": true
}
```

**Logic:** INSERT into `agent_policies`.

### 8. `adp_verify_chain`

Verify SHA-256 hash chain integrity.

**Input:**
```json
{
  "agent_id": "agent-billing-001",
  "limit": 100
}
```

**Output:**
```json
{
  "valid": true,
  "chain_length": 42,
  "first_trace": "trc_...",
  "last_trace": "trc_...",
  "broken_at": null
}
```

**Logic:** Fetch traces ordered by `created_at`. For each trace, recompute SHA-256 from canonical JSON. Verify `previous_hash` matches prior event's `event_hash`. Report first break if found.

## MCP Resources (Read-only endpoints)

| Resource URI | Description | Data |
|--------------|-------------|------|
| `adp://registry` | All registered agents | agent_registry rows |
| `adp://policies` | Active governance policies | agent_policies where active=true |
| `adp://traces` | Recent traces (last 100) | agent_traces ordered by created_at DESC |
| `adp://matrix` | Authorization matrix config | Static 5x4 matrix JSON |
| `adp://specs/{name}` | ADP specification documents | Embedded spec text |

## Frontend Integration

### Dashboard widget: "Agent Activity"
- Trace count (last 24h)
- Latest agent decisions (type, risk, agent_id)
- Alerts: escalated decisions (R3-R4) or prohibited actions

### New page: `/agents` (Agent Registry)
- List of registered agents (name, autonomy level, status, last activity)
- Agent detail: traces, policies, hash chain integrity
- "Generate API Key" button per agent

### New page: `/agent-traces` (Trace Journal)
- Timeline of hash-chained traces
- Filters: by agent, decision type, risk level
- Visual chain integrity indicator (green/red)
- Detail view with previous/next hash links

### Policies page enrichment
- New "Agent Policies" tab for ADP governance rules
- Regulatory mapping display (EU AI Act, Loi 25, NIST, etc.)

## Security

- API keys hashed with SHA-256 before storage
- Keys shown only once at creation (never retrievable)
- Organization-scoped RLS on all tables
- Rate limiting on Edge Function (100 req/min per agent)
- D4 (self-modification) always requires human approval
- R3-R4 risk decisions always trigger escalation

## Implementation Order

1. Supabase migrations (4 tables + RLS + indexes)
2. Edge Function scaffold (`adp-mcp/index.ts`)
3. Auth middleware (API key validation)
4. Core tools: `register_agent`, `classify`, `authorize`
5. Trace tools: `log_trace`, `validate`, `verify_chain`
6. Policy tools: `add_policy`, `evaluate_policy`
7. MCP Resources (read endpoints)
8. Frontend: Agent Registry page
9. Frontend: Trace Journal page
10. Frontend: Dashboard widget
11. Frontend: Policies tab enrichment
