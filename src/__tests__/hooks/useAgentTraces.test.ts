import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { SUPABASE_URL } from "../mocks/handlers";
import { createWrapper } from "../mocks/utils";
import { mockAgentTraces } from "../mocks/fixtures";
import {
  useAgentTraces,
  useRecentAgentTraces,
} from "@/hooks/useAgentTraces";

/* ------------------------------------------------------------------ */
/*  useAgentTraces — list query                                        */
/* ------------------------------------------------------------------ */

describe("useAgentTraces", () => {
  it("returns an empty array by default", async () => {
    const { result } = renderHook(() => useAgentTraces(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("fetches agent traces list", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/agent_traces`, () => {
        return HttpResponse.json(mockAgentTraces);
      }),
    );

    const { result } = renderHook(() => useAgentTraces(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(mockAgentTraces.length);
  });

  it("filters by agent_id", async () => {
    const filtered = mockAgentTraces.filter(
      (t) => t.agent_id === "agent-copilot-001",
    );
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/agent_traces`, () => {
        return HttpResponse.json(filtered);
      }),
    );

    const { result } = renderHook(
      () => useAgentTraces({ agent_id: "agent-copilot-001" }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(filtered.length);
  });
});

/* ------------------------------------------------------------------ */
/*  useRecentAgentTraces — recent traces query                         */
/* ------------------------------------------------------------------ */

describe("useRecentAgentTraces", () => {
  it("returns recent traces with default limit", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/agent_traces`, () => {
        return HttpResponse.json(mockAgentTraces);
      }),
    );

    const { result } = renderHook(() => useRecentAgentTraces(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(mockAgentTraces.length);
  });
});
