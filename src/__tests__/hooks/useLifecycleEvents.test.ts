import { describe, it, expect } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { SUPABASE_URL } from "../mocks/handlers";
import { createWrapper } from "../mocks/utils";
import { mockLifecycleEvents } from "../mocks/fixtures";
import {
  useLifecycleEvents,
  useCreateLifecycleEvent,
  useUpdateLifecycleEvent,
  useDeleteLifecycleEvent,
} from "@/hooks/useLifecycleEvents";

/* ------------------------------------------------------------------ */
/*  useLifecycleEvents — list query                                    */
/* ------------------------------------------------------------------ */

describe("useLifecycleEvents", () => {
  it("returns an empty array by default", async () => {
    const { result } = renderHook(() => useLifecycleEvents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("fetches lifecycle events list", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/lifecycle_events`, () => {
        return HttpResponse.json(mockLifecycleEvents);
      }),
    );

    const { result } = renderHook(() => useLifecycleEvents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(mockLifecycleEvents.length);
  });

  it("filters by event_type", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/lifecycle_events`, () => {
        return HttpResponse.json([mockLifecycleEvents[0]]);
      }),
    );

    const { result } = renderHook(
      () => useLifecycleEvents({ event_type: "deployment" }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

/* ------------------------------------------------------------------ */
/*  useCreateLifecycleEvent — mutation                                 */
/* ------------------------------------------------------------------ */

describe("useCreateLifecycleEvent", () => {
  it("creates a lifecycle event", async () => {
    const created = { ...mockLifecycleEvents[0], id: "lce-new" };
    server.use(
      http.post(`${SUPABASE_URL}/rest/v1/lifecycle_events`, () => {
        return HttpResponse.json(created, { status: 201 });
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useCreateLifecycleEvent(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        ai_system_id: "ais-001",
        event_type: "deployment",
        title: "New deployment",
        change_date: "2025-06-01",
        impact: "medium",
        is_substantial: false,
        risk_reassessment_required: false,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useUpdateLifecycleEvent — mutation                                 */
/* ------------------------------------------------------------------ */

describe("useUpdateLifecycleEvent", () => {
  it("updates a lifecycle event", async () => {
    const updated = { ...mockLifecycleEvents[0], impact: "low" };
    server.use(
      http.patch(`${SUPABASE_URL}/rest/v1/lifecycle_events`, () => {
        return HttpResponse.json(updated);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useUpdateLifecycleEvent(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ id: "lce-001", impact: "low" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useDeleteLifecycleEvent — mutation                                 */
/* ------------------------------------------------------------------ */

describe("useDeleteLifecycleEvent", () => {
  it("deletes a lifecycle event", async () => {
    server.use(
      http.delete(`${SUPABASE_URL}/rest/v1/lifecycle_events`, () => {
        return HttpResponse.json([{}]);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useDeleteLifecycleEvent(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ id: "lce-001" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
