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
