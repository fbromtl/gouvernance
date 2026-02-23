# ADP MCP Server — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Supabase Edge Function implementing the Agent Decision Protocol (ADP) as an MCP server with 8 tools, 4 database tables, API key authentication, and frontend pages for agent registry and trace journal.

**Architecture:** Single Supabase Edge Function (`adp-mcp`) receiving HTTPS requests with API key auth. Persists to 4 PostgreSQL tables. Frontend React pages read these tables via Supabase client. Compatible with [agent-decision-protocol](https://github.com/OpenAgentGovernance/agent-decision-protocol) v0.3.0.

**Tech Stack:** Deno (Edge Function), Supabase PostgreSQL + RLS, React 19 + TypeScript + Tailwind + shadcn/ui, react-i18next (FR/EN), TanStack React Query.

**Supabase Project ID:** `tpaqkfuwiihesjmguqne`

**Design Doc:** `docs/plans/2026-02-23-adp-mcp-server-design.md`

---

## Phase 1 — Database Foundation

### Task 1: Create `agent_registry` table

**Files:**
- Migration via Supabase MCP `apply_migration`

**Step 1: Apply migration**

Use the Supabase MCP tool `apply_migration` with project_id `tpaqkfuwiihesjmguqne`:

```sql
-- Table: agent_registry
CREATE TABLE IF NOT EXISTS public.agent_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  autonomy_level TEXT NOT NULL CHECK (autonomy_level IN ('A1','A2','A3','A4','A5')),
  allowed_types TEXT[] NOT NULL DEFAULT '{}',
  max_risk TEXT NOT NULL DEFAULT 'R2' CHECK (max_risk IN ('R1','R2','R3','R4')),
  owner_name TEXT,
  owner_email TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','revoked')),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique agent_id per organization
CREATE UNIQUE INDEX idx_agent_registry_agent_id ON public.agent_registry(organization_id, agent_id);
CREATE INDEX idx_agent_registry_org ON public.agent_registry(organization_id);
CREATE INDEX idx_agent_registry_status ON public.agent_registry(organization_id, status);

-- RLS
ALTER TABLE public.agent_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view agents in their org"
  ON public.agent_registry FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert agents in their org"
  ON public.agent_registry FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update agents in their org"
  ON public.agent_registry FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete agents in their org"
  ON public.agent_registry FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));
```

Migration name: `create_agent_registry`

**Step 2: Verify migration**

Run SQL via Supabase MCP `execute_sql`:
```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'agent_registry' ORDER BY ordinal_position;
```

Expected: 14 columns returned (id through updated_at).

---

### Task 2: Create `agent_api_keys` table

**Step 1: Apply migration**

Migration name: `create_agent_api_keys`

```sql
CREATE TABLE IF NOT EXISTS public.agent_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_registry_id UUID NOT NULL REFERENCES public.agent_registry(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_api_keys_hash ON public.agent_api_keys(key_hash) WHERE revoked_at IS NULL;
CREATE INDEX idx_agent_api_keys_agent ON public.agent_api_keys(agent_registry_id);

-- RLS: only service_role can access this table (Edge Function)
ALTER TABLE public.agent_api_keys ENABLE ROW LEVEL SECURITY;

-- No user-facing policies — only service_role key can read/write
-- The Edge Function uses service_role to validate API keys
```

**Step 2: Verify migration**

```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'agent_api_keys' ORDER BY ordinal_position;
```

Expected: 7 columns returned.

---

### Task 3: Create `agent_traces` table

**Step 1: Apply migration**

Migration name: `create_agent_traces`

```sql
CREATE TABLE IF NOT EXISTS public.agent_traces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  trace_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('decision','approval','escalation')),
  decision_type TEXT CHECK (decision_type IN ('D1','D2','D3','D4')),
  risk_level TEXT CHECK (risk_level IN ('R1','R2','R3','R4')),
  reversibility TEXT CHECK (reversibility IN ('total','partial','irreversible')),
  classification_code TEXT,
  description TEXT,
  reasoning TEXT,
  authorization JSONB,
  context JSONB NOT NULL DEFAULT '{}',
  previous_hash TEXT,
  event_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_agent_traces_trace_id ON public.agent_traces(trace_id);
CREATE INDEX idx_agent_traces_org ON public.agent_traces(organization_id);
CREATE INDEX idx_agent_traces_agent ON public.agent_traces(organization_id, agent_id);
CREATE INDEX idx_agent_traces_created ON public.agent_traces(organization_id, created_at DESC);
CREATE INDEX idx_agent_traces_chain ON public.agent_traces(agent_id, created_at ASC);

ALTER TABLE public.agent_traces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view traces in their org"
  ON public.agent_traces FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- INSERT only via service_role (Edge Function)
-- No user INSERT/UPDATE/DELETE policies
```

**Step 2: Verify migration**

```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'agent_traces' ORDER BY ordinal_position;
```

Expected: 16 columns returned.

---

### Task 4: Create `agent_policies` table

**Step 1: Apply migration**

Migration name: `create_agent_policies`

```sql
CREATE TABLE IF NOT EXISTS public.agent_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  policy_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  severity TEXT CHECK (severity IS NULL OR severity IN ('low','medium','high','critical')),
  rule JSONB NOT NULL,
  regulatory_mapping TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_agent_policies_policy_id ON public.agent_policies(organization_id, policy_id);
CREATE INDEX idx_agent_policies_org ON public.agent_policies(organization_id);
CREATE INDEX idx_agent_policies_active ON public.agent_policies(organization_id, active) WHERE active = true;

ALTER TABLE public.agent_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view policies in their org"
  ON public.agent_policies FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can manage policies in their org"
  ON public.agent_policies FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update policies in their org"
  ON public.agent_policies FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));
```

**Step 2: Verify migration**

```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'agent_policies' ORDER BY ordinal_position;
```

Expected: 11 columns returned.

**Step 3: Commit phase 1**

```bash
git add docs/plans/2026-02-23-adp-mcp-server-implementation.md
git commit -m "docs: add ADP MCP server implementation plan"
```

---

## Phase 2 — Update TypeScript Database Types

### Task 5: Add ADP types to database.ts

**Files:**
- Modify: `src/types/database.ts` — Add the 4 new table types in the `Tables` interface

**Step 1: Add `agent_registry` types**

Inside `Database["public"]["Tables"]`, add:

```typescript
agent_registry: {
  Row: {
    id: string;
    organization_id: string;
    agent_id: string;
    name: string;
    description: string | null;
    autonomy_level: string;
    allowed_types: string[];
    max_risk: string;
    owner_name: string | null;
    owner_email: string | null;
    status: string;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    organization_id: string;
    agent_id: string;
    name: string;
    description?: string | null;
    autonomy_level: string;
    allowed_types?: string[];
    max_risk?: string;
    owner_name?: string | null;
    owner_email?: string | null;
    status?: string;
    metadata?: Record<string, unknown>;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    organization_id?: string;
    agent_id?: string;
    name?: string;
    description?: string | null;
    autonomy_level?: string;
    allowed_types?: string[];
    max_risk?: string;
    owner_name?: string | null;
    owner_email?: string | null;
    status?: string;
    metadata?: Record<string, unknown>;
    created_at?: string;
    updated_at?: string;
  };
};
```

**Step 2: Add `agent_traces` types**

```typescript
agent_traces: {
  Row: {
    id: string;
    organization_id: string;
    trace_id: string;
    agent_id: string;
    event_type: string;
    decision_type: string | null;
    risk_level: string | null;
    reversibility: string | null;
    classification_code: string | null;
    description: string | null;
    reasoning: string | null;
    authorization: Record<string, unknown> | null;
    context: Record<string, unknown>;
    previous_hash: string | null;
    event_hash: string;
    created_at: string;
  };
  Insert: {
    id?: string;
    organization_id: string;
    trace_id: string;
    agent_id: string;
    event_type: string;
    decision_type?: string | null;
    risk_level?: string | null;
    reversibility?: string | null;
    classification_code?: string | null;
    description?: string | null;
    reasoning?: string | null;
    authorization?: Record<string, unknown> | null;
    context?: Record<string, unknown>;
    previous_hash?: string | null;
    event_hash: string;
    created_at?: string;
  };
  Update: {
    [K in keyof agent_traces["Insert"]]?: agent_traces["Insert"][K];
  };
};
```

**Step 3: Add `agent_policies` types**

```typescript
agent_policies: {
  Row: {
    id: string;
    organization_id: string;
    policy_id: string;
    name: string;
    category: string | null;
    severity: string | null;
    rule: Record<string, unknown>;
    regulatory_mapping: string[];
    active: boolean;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    organization_id: string;
    policy_id: string;
    name: string;
    category?: string | null;
    severity?: string | null;
    rule: Record<string, unknown>;
    regulatory_mapping?: string[];
    active?: boolean;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    [K in keyof agent_policies["Insert"]]?: agent_policies["Insert"][K];
  };
};
```

**Step 4: Add convenience type aliases**

At the bottom of `database.ts`, add:

```typescript
export type AgentRegistry = Database["public"]["Tables"]["agent_registry"]["Row"];
export type AgentRegistryInsert = Database["public"]["Tables"]["agent_registry"]["Insert"];
export type AgentTrace = Database["public"]["Tables"]["agent_traces"]["Row"];
export type AgentTraceInsert = Database["public"]["Tables"]["agent_traces"]["Insert"];
export type AgentPolicy = Database["public"]["Tables"]["agent_policies"]["Row"];
export type AgentPolicyInsert = Database["public"]["Tables"]["agent_policies"]["Insert"];
```

**Step 5: Build to verify types compile**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors.

**Step 6: Commit**

```bash
git add src/types/database.ts
git commit -m "feat: add ADP table types to database.ts"
```

---

## Phase 3 — Edge Function: ADP MCP Server

### Task 6: Create Edge Function scaffold with auth middleware

**Files:**
- Create: `supabase/functions/adp-mcp/index.ts`

**Step 1: Create the Edge Function file**

The function handles API key authentication and routes to 8 tool handlers.

Follow the existing pattern from `ai-chat/index.ts`:
- Same CORS headers
- Same `Deno.serve()` pattern
- Same Supabase client creation via `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status: number) {
  return jsonResponse({ error: message }, status);
}

// ──────────────────────────────────────────────
//  SHA-256 helpers
// ──────────────────────────────────────────────
async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function canonicalJson(obj: Record<string, unknown>): string {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

// ──────────────────────────────────────────────
//  Authorization Matrix (ADP spec)
// ──────────────────────────────────────────────
type AuthResult = "authorized" | "approval_required" | "prohibited";

const MATRIX: Record<string, Record<string, AuthResult>> = {
  A1: { D1: "authorized", D2: "approval_required", D3: "prohibited", D4: "prohibited" },
  A2: { D1: "authorized", D2: "approval_required", D3: "prohibited", D4: "prohibited" },
  A3: { D1: "authorized", D2: "authorized", D3: "approval_required", D4: "prohibited" },
  A4: { D1: "authorized", D2: "authorized", D3: "authorized", D4: "approval_required" },
  A5: { D1: "authorized", D2: "authorized", D3: "authorized", D4: "approval_required" },
};

// ──────────────────────────────────────────────
//  API Key Authentication
// ──────────────────────────────────────────────
interface AuthContext {
  agentRegistryId: string;
  agentId: string;
  organizationId: string;
  autonomyLevel: string;
  allowedTypes: string[];
  maxRisk: string;
}

async function authenticateApiKey(
  apiKey: string,
  supabase: ReturnType<typeof createClient>
): Promise<AuthContext | null> {
  const keyHash = await sha256(apiKey);

  const { data: keyRow } = await supabase
    .from("agent_api_keys")
    .select("id, agent_registry_id, revoked_at")
    .eq("key_hash", keyHash)
    .is("revoked_at", null)
    .single();

  if (!keyRow) return null;

  // Update last_used_at
  await supabase
    .from("agent_api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", keyRow.id);

  const { data: agent } = await supabase
    .from("agent_registry")
    .select("*")
    .eq("id", keyRow.agent_registry_id)
    .eq("status", "active")
    .single();

  if (!agent) return null;

  return {
    agentRegistryId: agent.id,
    agentId: agent.agent_id,
    organizationId: agent.organization_id,
    autonomyLevel: agent.autonomy_level,
    allowedTypes: agent.allowed_types ?? [],
    maxRisk: agent.max_risk,
  };
}

// ──────────────────────────────────────────────
//  Tool: adp_register_agent
// ──────────────────────────────────────────────
async function handleRegisterAgent(
  body: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>,
  orgId: string
) {
  const { agent_id, name, autonomy_level, allowed_types, max_risk, owner, description } = body as {
    agent_id: string; name: string; autonomy_level: string;
    allowed_types?: string[]; max_risk?: string;
    owner?: { name?: string; email?: string }; description?: string;
  };

  if (!agent_id || !name || !autonomy_level) {
    return errorResponse("Missing required fields: agent_id, name, autonomy_level", 400);
  }

  // Insert agent
  const { data: agent, error } = await supabase
    .from("agent_registry")
    .insert({
      organization_id: orgId,
      agent_id,
      name,
      description: description ?? null,
      autonomy_level,
      allowed_types: allowed_types ?? [],
      max_risk: max_risk ?? "R2",
      owner_name: owner?.name ?? null,
      owner_email: owner?.email ?? null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return errorResponse("Agent ID already exists", 409);
    return errorResponse(error.message, 500);
  }

  // Generate API key
  const rawKey = `adp_sk_${crypto.randomUUID().replace(/-/g, "")}`;
  const keyHash = await sha256(rawKey);
  const keyPrefix = rawKey.slice(0, 12);

  await supabase.from("agent_api_keys").insert({
    agent_registry_id: agent.id,
    key_hash: keyHash,
    key_prefix: keyPrefix,
  });

  return jsonResponse({
    agent_id: agent.agent_id,
    api_key: rawKey,
    status: agent.status,
    autonomy_level: agent.autonomy_level,
  }, 201);
}

// ──────────────────────────────────────────────
//  Tool: adp_classify
// ──────────────────────────────────────────────
function handleClassify(body: Record<string, unknown>) {
  const { type, risk_level, reversibility } = body as {
    type: string; risk_level: string; reversibility: string;
  };

  if (!type || !risk_level || !reversibility) {
    return errorResponse("Missing required fields: type, risk_level, reversibility", 400);
  }

  const validTypes = ["D1", "D2", "D3", "D4"];
  const validRisks = ["R1", "R2", "R3", "R4"];
  const validReversibility = ["total", "partial", "irreversible"];

  if (!validTypes.includes(type)) return errorResponse(`Invalid type: ${type}`, 400);
  if (!validRisks.includes(risk_level)) return errorResponse(`Invalid risk_level: ${risk_level}`, 400);
  if (!validReversibility.includes(reversibility)) return errorResponse(`Invalid reversibility: ${reversibility}`, 400);

  const classificationCode = `${type}-${risk_level}-${reversibility}`;
  const riskOverride = risk_level === "R3" || risk_level === "R4";
  const requiresEscalation = type === "D4" || riskOverride;

  return jsonResponse({
    classification_code: classificationCode,
    risk_override: riskOverride,
    requires_escalation: requiresEscalation,
  });
}

// ──────────────────────────────────────────────
//  Tool: adp_authorize
// ──────────────────────────────────────────────
async function handleAuthorize(
  body: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>,
  orgId: string
) {
  const { agent_id, decision_type, risk_level } = body as {
    agent_id: string; decision_type: string; risk_level?: string;
  };

  if (!agent_id || !decision_type) {
    return errorResponse("Missing required fields: agent_id, decision_type", 400);
  }

  const { data: agent } = await supabase
    .from("agent_registry")
    .select("autonomy_level")
    .eq("organization_id", orgId)
    .eq("agent_id", agent_id)
    .eq("status", "active")
    .single();

  if (!agent) return errorResponse("Agent not found or inactive", 404);

  const level = agent.autonomy_level;
  const matrixResult = MATRIX[level]?.[decision_type];

  if (!matrixResult) return errorResponse("Invalid autonomy/decision combination", 400);

  const overrides: string[] = [];
  let finalResult = matrixResult;

  // D4 always requires approval
  if (decision_type === "D4" && matrixResult === "authorized") {
    finalResult = "approval_required";
    overrides.push("D4 self-modification always requires human approval");
  }

  // R3-R4 always escalate
  if (risk_level && (risk_level === "R3" || risk_level === "R4")) {
    if (finalResult === "authorized") {
      finalResult = "approval_required";
    }
    overrides.push(`Risk ${risk_level} triggers mandatory escalation`);
  }

  return jsonResponse({
    result: finalResult,
    override_applied: overrides.length > 0,
    reasons: overrides,
    matrix_cell: `${level} × ${decision_type} = ${matrixResult.toUpperCase()}`,
  });
}

// ──────────────────────────────────────────────
//  Tool: adp_log_trace
// ──────────────────────────────────────────────
async function handleLogTrace(
  body: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>,
  orgId: string
) {
  const { agent_id, event_type, decision, authorization, context: ctx } = body as {
    agent_id: string;
    event_type: string;
    decision?: {
      type?: string; risk_level?: string; reversibility?: string;
      classification_code?: string; description?: string; reasoning?: string;
    };
    authorization?: { required?: boolean; matrix_result?: string };
    context?: Record<string, unknown>;
  };

  if (!agent_id || !event_type) {
    return errorResponse("Missing required fields: agent_id, event_type", 400);
  }

  // Get previous hash for chain
  const { data: lastTrace } = await supabase
    .from("agent_traces")
    .select("event_hash")
    .eq("agent_id", agent_id)
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const previousHash = lastTrace?.event_hash ?? null;
  const traceId = `trc_${crypto.randomUUID().replace(/-/g, "")}`;

  // Build event object for hashing (everything except event_hash)
  const eventPayload: Record<string, unknown> = {
    trace_id: traceId,
    agent_id,
    event_type,
    decision_type: decision?.type ?? null,
    risk_level: decision?.risk_level ?? null,
    reversibility: decision?.reversibility ?? null,
    classification_code: decision?.classification_code ?? null,
    description: decision?.description ?? null,
    reasoning: decision?.reasoning ?? null,
    authorization: authorization ?? null,
    context: ctx ?? {},
    previous_hash: previousHash,
    timestamp: new Date().toISOString(),
  };

  const eventHash = await sha256(canonicalJson(eventPayload));

  const { error } = await supabase.from("agent_traces").insert({
    organization_id: orgId,
    trace_id: traceId,
    agent_id,
    event_type,
    decision_type: decision?.type ?? null,
    risk_level: decision?.risk_level ?? null,
    reversibility: decision?.reversibility ?? null,
    classification_code: decision?.classification_code ?? null,
    description: decision?.description ?? null,
    reasoning: decision?.reasoning ?? null,
    authorization: authorization ?? null,
    context: ctx ?? {},
    previous_hash: previousHash,
    event_hash: eventHash,
  });

  if (error) return errorResponse(error.message, 500);

  // Get chain length
  const { count } = await supabase
    .from("agent_traces")
    .select("id", { count: "exact", head: true })
    .eq("agent_id", agent_id)
    .eq("organization_id", orgId);

  return jsonResponse({
    trace_id: traceId,
    event_hash: eventHash,
    previous_hash: previousHash,
    chain_length: count ?? 1,
  }, 201);
}

// ──────────────────────────────────────────────
//  Tool: adp_evaluate_policy
// ──────────────────────────────────────────────
async function handleEvaluatePolicy(
  body: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>,
  orgId: string
) {
  const { agent_id, decision_type, risk_level, context: ctx } = body as {
    agent_id: string; decision_type: string; risk_level?: string;
    context?: Record<string, unknown>;
  };

  if (!agent_id || !decision_type) {
    return errorResponse("Missing required fields: agent_id, decision_type", 400);
  }

  const { data: policies } = await supabase
    .from("agent_policies")
    .select("*")
    .eq("organization_id", orgId)
    .eq("active", true);

  const violations: { policy_id: string; name: string; requirement: string }[] = [];
  const applicable: string[] = [];

  for (const policy of policies ?? []) {
    const rule = policy.rule as { condition?: Record<string, unknown>; requirement?: string };
    if (!rule?.condition) continue;

    // Simple condition matching: check if context matches condition keys
    const cond = rule.condition;
    let matches = true;

    for (const [key, value] of Object.entries(cond)) {
      if (key === "decision_types" && Array.isArray(value)) {
        if (!value.includes(decision_type)) { matches = false; break; }
      } else if (key === "min_risk_level" && typeof value === "string" && risk_level) {
        const riskOrder = ["R1", "R2", "R3", "R4"];
        if (riskOrder.indexOf(risk_level) < riskOrder.indexOf(value)) { matches = false; break; }
      } else if (key === "action_type" && ctx) {
        if (ctx.action_type !== value) { matches = false; break; }
      }
    }

    if (matches) {
      applicable.push(policy.policy_id);
      if (rule.requirement === "human_approval" || rule.requirement === "prohibited") {
        violations.push({
          policy_id: policy.policy_id,
          name: policy.name,
          requirement: rule.requirement,
        });
      }
    }
  }

  return jsonResponse({
    compliant: violations.length === 0,
    violations,
    applicable_policies: applicable,
  });
}

// ──────────────────────────────────────────────
//  Tool: adp_validate
// ──────────────────────────────────────────────
function handleValidate(body: Record<string, unknown>) {
  const trace = body.trace_data as Record<string, unknown> | undefined;
  if (!trace) return errorResponse("Missing trace_data", 400);

  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  const required = ["agent_id", "event_type"];
  for (const field of required) {
    if (!trace[field]) errors.push(`Missing required field: ${field}`);
  }

  // Enum validation
  const validEventTypes = ["decision", "approval", "escalation"];
  if (trace.event_type && !validEventTypes.includes(trace.event_type as string)) {
    errors.push(`Invalid event_type: ${trace.event_type}. Must be one of: ${validEventTypes.join(", ")}`);
  }

  const validTypes = ["D1", "D2", "D3", "D4"];
  if (trace.decision_type && !validTypes.includes(trace.decision_type as string)) {
    errors.push(`Invalid decision_type: ${trace.decision_type}`);
  }

  const validRisks = ["R1", "R2", "R3", "R4"];
  if (trace.risk_level && !validRisks.includes(trace.risk_level as string)) {
    errors.push(`Invalid risk_level: ${trace.risk_level}`);
  }

  const validReversibility = ["total", "partial", "irreversible"];
  if (trace.reversibility && !validReversibility.includes(trace.reversibility as string)) {
    errors.push(`Invalid reversibility: ${trace.reversibility}`);
  }

  // Hash format
  if (trace.event_hash && !/^[a-f0-9]{64}$/.test(trace.event_hash as string)) {
    errors.push("event_hash must be a valid SHA-256 hex string (64 chars)");
  }

  // Warnings
  if (!trace.description) warnings.push("Missing description — recommended for auditability");
  if (!trace.reasoning) warnings.push("Missing reasoning — recommended for compliance");

  return jsonResponse({ valid: errors.length === 0, errors, warnings });
}

// ──────────────────────────────────────────────
//  Tool: adp_add_policy
// ──────────────────────────────────────────────
async function handleAddPolicy(
  body: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>,
  orgId: string
) {
  const { policy_id, name, category, severity, rule, regulatory_mapping } = body as {
    policy_id: string; name: string; category?: string; severity?: string;
    rule: Record<string, unknown>; regulatory_mapping?: string[];
  };

  if (!policy_id || !name || !rule) {
    return errorResponse("Missing required fields: policy_id, name, rule", 400);
  }

  const { data, error } = await supabase
    .from("agent_policies")
    .insert({
      organization_id: orgId,
      policy_id,
      name,
      category: category ?? null,
      severity: severity ?? null,
      rule,
      regulatory_mapping: regulatory_mapping ?? [],
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return errorResponse("Policy ID already exists", 409);
    return errorResponse(error.message, 500);
  }

  return jsonResponse({ policy_id: data.policy_id, active: data.active }, 201);
}

// ──────────────────────────────────────────────
//  Tool: adp_verify_chain
// ──────────────────────────────────────────────
async function handleVerifyChain(
  body: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>,
  orgId: string
) {
  const { agent_id, limit: maxTraces } = body as { agent_id: string; limit?: number };

  if (!agent_id) return errorResponse("Missing required field: agent_id", 400);

  const { data: traces } = await supabase
    .from("agent_traces")
    .select("trace_id, event_hash, previous_hash, created_at")
    .eq("agent_id", agent_id)
    .eq("organization_id", orgId)
    .order("created_at", { ascending: true })
    .limit(maxTraces ?? 1000);

  if (!traces || traces.length === 0) {
    return jsonResponse({ valid: true, chain_length: 0, first_trace: null, last_trace: null, broken_at: null });
  }

  let brokenAt: string | null = null;

  for (let i = 1; i < traces.length; i++) {
    if (traces[i].previous_hash !== traces[i - 1].event_hash) {
      brokenAt = traces[i].trace_id;
      break;
    }
  }

  // First event should have null previous_hash
  if (traces[0].previous_hash !== null) {
    brokenAt = brokenAt ?? traces[0].trace_id;
  }

  return jsonResponse({
    valid: brokenAt === null,
    chain_length: traces.length,
    first_trace: traces[0].trace_id,
    last_trace: traces[traces.length - 1].trace_id,
    broken_at: brokenAt,
  });
}

// ──────────────────────────────────────────────
//  MCP Resources (GET)
// ──────────────────────────────────────────────
async function handleResource(
  resource: string,
  supabase: ReturnType<typeof createClient>,
  orgId: string
) {
  switch (resource) {
    case "registry": {
      const { data } = await supabase
        .from("agent_registry")
        .select("*")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false });
      return jsonResponse({ agents: data ?? [] });
    }
    case "policies": {
      const { data } = await supabase
        .from("agent_policies")
        .select("*")
        .eq("organization_id", orgId)
        .eq("active", true)
        .order("created_at", { ascending: false });
      return jsonResponse({ policies: data ?? [] });
    }
    case "traces": {
      const { data } = await supabase
        .from("agent_traces")
        .select("*")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false })
        .limit(100);
      return jsonResponse({ traces: data ?? [] });
    }
    case "matrix": {
      return jsonResponse({
        matrix: MATRIX,
        overrides: [
          "D4 (self-modification) ALWAYS requires human approval",
          "R3-R4 risk ALWAYS triggers escalation regardless of matrix",
        ],
      });
    }
    default:
      return errorResponse(`Unknown resource: ${resource}`, 404);
  }
}

// ──────────────────────────────────────────────
//  Main Router
// ──────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);

    // ── GET: MCP Resources ──
    if (req.method === "GET") {
      const resource = url.searchParams.get("resource");
      if (!resource) return errorResponse("Missing ?resource= parameter", 400);

      // GET requests need API key or JWT for org context
      const apiKey = req.headers.get("x-api-key");
      if (!apiKey) return errorResponse("Missing x-api-key header", 401);

      const auth = await authenticateApiKey(apiKey, supabase);
      if (!auth) return errorResponse("Invalid API key", 401);

      return handleResource(resource, supabase, auth.organizationId);
    }

    // ── POST: MCP Tools ──
    if (req.method !== "POST") {
      return errorResponse("Method not allowed", 405);
    }

    const body = await req.json() as Record<string, unknown>;
    const tool = body.tool as string | undefined;

    if (!tool) return errorResponse("Missing 'tool' field in request body", 400);

    // adp_register_agent uses JWT auth (user must be logged in)
    if (tool === "adp_register_agent") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) return errorResponse("Missing Authorization header", 401);

      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) return errorResponse("Invalid token", 401);

      // Get user's org
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      if (!profile?.organization_id) return errorResponse("User has no organization", 403);

      return handleRegisterAgent(body, supabase, profile.organization_id);
    }

    // All other tools use API key auth
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) return errorResponse("Missing x-api-key header", 401);

    const auth = await authenticateApiKey(apiKey, supabase);
    if (!auth) return errorResponse("Invalid or revoked API key", 401);

    switch (tool) {
      case "adp_classify":
        return handleClassify(body);
      case "adp_authorize":
        return handleAuthorize(body, supabase, auth.organizationId);
      case "adp_log_trace":
        return handleLogTrace(body, supabase, auth.organizationId);
      case "adp_evaluate_policy":
        return handleEvaluatePolicy(body, supabase, auth.organizationId);
      case "adp_validate":
        return handleValidate(body);
      case "adp_add_policy":
        return handleAddPolicy(body, supabase, auth.organizationId);
      case "adp_verify_chain":
        return handleVerifyChain(body, supabase, auth.organizationId);
      default:
        return errorResponse(`Unknown tool: ${tool}. Available: adp_register_agent, adp_classify, adp_authorize, adp_log_trace, adp_evaluate_policy, adp_validate, adp_add_policy, adp_verify_chain`, 400);
    }
  } catch (err) {
    console.error("ADP MCP Error:", err);
    return errorResponse("Internal server error", 500);
  }
});
```

**Step 2: Deploy the Edge Function**

Use Supabase MCP `deploy_edge_function`:
- name: `adp-mcp`
- project_id: `tpaqkfuwiihesjmguqne`
- verify_jwt: false (we handle auth ourselves via API keys)
- files: the index.ts content above

**Step 3: Test with curl**

Register an agent (using JWT from Supabase dashboard):
```bash
curl -X POST https://tpaqkfuwiihesjmguqne.supabase.co/functions/v1/adp-mcp \
  -H "Authorization: Bearer <user-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"tool":"adp_register_agent","agent_id":"test-agent-001","name":"Test Agent","autonomy_level":"A3","allowed_types":["D1","D2"]}'
```

Expected: 201 with `api_key` in response.

Test classify (using the API key from above):
```bash
curl -X POST https://tpaqkfuwiihesjmguqne.supabase.co/functions/v1/adp-mcp \
  -H "x-api-key: adp_sk_..." \
  -H "Content-Type: application/json" \
  -d '{"tool":"adp_classify","type":"D2","risk_level":"R2","reversibility":"partial"}'
```

Expected: 200 with `classification_code: "D2-R2-partial"`.

**Step 4: Commit**

```bash
git add supabase/functions/adp-mcp/index.ts
git commit -m "feat: add ADP MCP server Edge Function with 8 tools"
```

---

## Phase 4 — Frontend: React Query Hooks

### Task 7: Create useAgentRegistry hook

**Files:**
- Create: `src/hooks/useAgentRegistry.ts`

Create hooks for CRUD on agent_registry table, following the pattern from `src/hooks/useDecisions.ts`:
- `useAgentRegistry()` — list agents (with org filter)
- `useCreateAgent()` — mutation to register agent via Edge Function
- `useDeleteAgent()` — soft-delete (set status to 'revoked')
- Query key: `["agent-registry"]`

**Step 1: Write the hook**

Follow the exact same pattern as `useDecisions.ts`:
- Use `useQuery` with org filter
- Use `useMutation` with `queryClient.invalidateQueries`
- For `useCreateAgent`, call the Edge Function instead of direct Supabase insert (to get the API key back)

**Step 2: Commit**

```bash
git add src/hooks/useAgentRegistry.ts
git commit -m "feat: add useAgentRegistry React Query hooks"
```

---

### Task 8: Create useAgentTraces hook

**Files:**
- Create: `src/hooks/useAgentTraces.ts`

Hooks for reading traces:
- `useAgentTraces(filters?)` — list traces with pagination (org-scoped)
- `useAgentTracesByAgent(agentId)` — traces for a specific agent
- Query key: `["agent-traces"]`

Read-only (traces are only written by the Edge Function).

**Step 1: Write the hook**
**Step 2: Commit**

```bash
git add src/hooks/useAgentTraces.ts
git commit -m "feat: add useAgentTraces React Query hooks"
```

---

### Task 9: Create useAgentPolicies hook

**Files:**
- Create: `src/hooks/useAgentPolicies.ts`

Hooks for managing policies:
- `useAgentPolicies()` — list active policies
- `useCreateAgentPolicy()` — create policy
- `useToggleAgentPolicy(id)` — toggle active/inactive
- Query key: `["agent-policies"]`

**Step 1: Write the hook**
**Step 2: Commit**

```bash
git add src/hooks/useAgentPolicies.ts
git commit -m "feat: add useAgentPolicies React Query hooks"
```

---

## Phase 5 — Frontend Pages

### Task 10: Create Agent Registry page (`/agents`)

**Files:**
- Create: `src/portail/pages/AgentsPage.tsx`
- Modify: `src/portail/PortailRoutes.tsx` — add route
- Modify: `src/portail/layout/Sidebar.tsx` — add nav item
- Create: `src/i18n/locales/fr/agents.json`
- Create: `src/i18n/locales/en/agents.json`

**Page structure:**
- Page header: "Registre des Agents IA" + "Nouvel Agent" button
- Table: agent_id, name, autonomy_level (badge), status, last_used_at, allowed_types
- Click row → detail panel or dialog showing full agent info
- "Générer une clé API" button (calls Edge Function)
- API key shown once in a copyable alert

Follow the exact layout pattern of `DecisionsPage.tsx` (table + filters + create dialog).

Add the page under the COMMUNAUTÉ section in the sidebar, after "Membres du Cercle".

**i18n keys needed (fr/en):**
- Page title, description
- Table headers (columns)
- Autonomy level labels (A1-A5)
- Status labels
- Dialog labels for create/edit
- API key generation messages

**Step 1: Create i18n files**
**Step 2: Create the page component**
**Step 3: Add route and sidebar nav item**
**Step 4: Build and verify**
**Step 5: Commit**

```bash
git add src/portail/pages/AgentsPage.tsx src/portail/PortailRoutes.tsx \
       src/portail/layout/Sidebar.tsx \
       src/i18n/locales/fr/agents.json src/i18n/locales/en/agents.json
git commit -m "feat: add Agent Registry page (/agents)"
```

---

### Task 11: Create Agent Traces page (`/agent-traces`)

**Files:**
- Create: `src/portail/pages/AgentTracesPage.tsx`
- Modify: `src/portail/PortailRoutes.tsx` — add route
- Modify: `src/portail/layout/Sidebar.tsx` — add nav item
- Create: `src/i18n/locales/fr/agent-traces.json`
- Create: `src/i18n/locales/en/agent-traces.json`

**Page structure:**
- Page header: "Journal des Traces" with help button
- Filters: by agent_id (select), by decision_type (D1-D4), by risk_level (R1-R4)
- Timeline/table view of traces:
  - trace_id, agent_id, event_type badge, classification_code, description
  - Hash chain indicator: ✅ (green) if previous_hash matches, ❌ (red) if broken
  - Timestamp
- Click row → detail dialog showing:
  - Full description and reasoning
  - Authorization result
  - event_hash + previous_hash (monospace, copyable)
  - Context JSON

**Step 1: Create i18n files**
**Step 2: Create the page component**
**Step 3: Add route and sidebar nav item**
**Step 4: Build and verify**
**Step 5: Commit**

```bash
git add src/portail/pages/AgentTracesPage.tsx src/portail/PortailRoutes.tsx \
       src/portail/layout/Sidebar.tsx \
       src/i18n/locales/fr/agent-traces.json src/i18n/locales/en/agent-traces.json
git commit -m "feat: add Agent Traces Journal page (/agent-traces)"
```

---

### Task 12: Add "Agent Activity" widget to dashboard

**Files:**
- Create: `src/portail/components/dashboard/AgentActivityWidget.tsx`
- Modify: `src/portail/pages/DashboardPage.tsx` — import and render widget

**Widget structure (Card):**
- Title: "Activité des Agents"
- Stat: trace count (last 24h)
- Last 3 traces with: agent_id, classification_code badge, timestamp
- Link: "Voir le journal →" → `/agent-traces`
- Empty state if no traces yet

Place it after the membership widget, before the KPI cards.

**Step 1: Create widget component**
**Step 2: Add to DashboardPage**
**Step 3: Add i18n keys to dashboard.json (fr + en)**
**Step 4: Build and verify**
**Step 5: Commit**

```bash
git add src/portail/components/dashboard/AgentActivityWidget.tsx \
       src/portail/pages/DashboardPage.tsx \
       src/i18n/locales/fr/dashboard.json src/i18n/locales/en/dashboard.json
git commit -m "feat: add Agent Activity dashboard widget"
```

---

## Phase 6 — Final verification

### Task 13: End-to-end verification

**Step 1:** Run full build: `npm run build` — must succeed

**Step 2:** Deploy to production: `git push` → Netlify auto-deploy

**Step 3:** Test Edge Function end-to-end:
1. Register agent via curl (JWT auth)
2. Classify a decision (API key)
3. Check authorization (API key)
4. Log a trace (API key)
5. Verify chain integrity (API key)
6. Add a policy (API key)
7. Evaluate policy (API key)
8. Read resources (API key)

**Step 4:** Verify frontend pages on production:
- `/agents` — agent registry loads
- `/agent-traces` — trace journal loads
- Dashboard — agent activity widget renders

**Step 5: Final commit if needed**
