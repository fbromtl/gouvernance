import { describe, it, expect } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { SUPABASE_URL } from "../mocks/handlers";
import { createWrapper } from "../mocks/utils";
import { mockAgentRegistry } from "../mocks/fixtures";
import {
  useAgentRegistry,
  useCreateAgent,
  useUpdateAgent,
} from "@/hooks/useAgentRegistry";

/* ------------------------------------------------------------------ */
/*  useAgentRegistry — list query                                      */
/* ------------------------------------------------------------------ */

describe("useAgentRegistry", () => {
  it("returns an empty array by default", async () => {
    const { result } = renderHook(() => useAgentRegistry(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("fetches agent registry list", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/agent_registry`, () => {
        return HttpResponse.json(mockAgentRegistry);
      }),
    );

    const { result } = renderHook(() => useAgentRegistry(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(mockAgentRegistry.length);
  });
});

/* ------------------------------------------------------------------ */
/*  useCreateAgent — mutation (calls edge function)                    */
/* ------------------------------------------------------------------ */

describe("useCreateAgent", () => {
  it("creates an agent via edge function", async () => {
    server.use(
      http.post(`${SUPABASE_URL}/functions/v1/adp-mcp`, () => {
        return HttpResponse.json({
          agent_id: "agent-new-001",
          api_key: "test-api-key",
          status: "active",
          autonomy_level: "supervised",
        });
      }),
    );

    const { result } = renderHook(() => useCreateAgent(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        agent_id: "agent-new-001",
        name: "New Agent",
        autonomy_level: "supervised",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data!.agent_id).toBe("agent-new-001");
  });
});

/* ------------------------------------------------------------------ */
/*  useUpdateAgent — mutation                                          */
/* ------------------------------------------------------------------ */

describe("useUpdateAgent", () => {
  it("updates an agent", async () => {
    const updated = { ...mockAgentRegistry[0], status: "inactive" };
    server.use(
      http.patch(`${SUPABASE_URL}/rest/v1/agent_registry`, () => {
        return HttpResponse.json(updated);
      }),
    );

    const { result } = renderHook(() => useUpdateAgent(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ id: "ar-001", status: "inactive" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
