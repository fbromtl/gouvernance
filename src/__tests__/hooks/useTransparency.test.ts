import { describe, it, expect } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { SUPABASE_URL } from "../mocks/handlers";
import { createWrapper } from "../mocks/utils";
import { mockAutomatedDecisions, mockContestations } from "../mocks/fixtures";
import {
  useAutomatedDecisions,
  useCreateAutomatedDecision,
  useUpdateAutomatedDecision,
  useDeleteAutomatedDecision,
  useContestations,
  useCreateContestation,
  useUpdateContestation,
} from "@/hooks/useTransparency";

/* ------------------------------------------------------------------ */
/*  useAutomatedDecisions — list query                                 */
/* ------------------------------------------------------------------ */

describe("useAutomatedDecisions", () => {
  it("returns an empty array by default", async () => {
    const { result } = renderHook(() => useAutomatedDecisions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("fetches automated decisions", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/automated_decisions`, () => {
        return HttpResponse.json(mockAutomatedDecisions);
      }),
    );

    const { result } = renderHook(() => useAutomatedDecisions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(mockAutomatedDecisions.length);
  });
});

/* ------------------------------------------------------------------ */
/*  useCreateAutomatedDecision — mutation                              */
/* ------------------------------------------------------------------ */

describe("useCreateAutomatedDecision", () => {
  it("creates an automated decision", async () => {
    const created = { ...mockAutomatedDecisions[0], id: "ad-new" };
    server.use(
      http.post(`${SUPABASE_URL}/rest/v1/automated_decisions`, () => {
        return HttpResponse.json(created, { status: 201 });
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useCreateAutomatedDecision(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        ai_system_id: "ais-001",
        decision_type: "scoring",
      } as any);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useUpdateAutomatedDecision — mutation                              */
/* ------------------------------------------------------------------ */

describe("useUpdateAutomatedDecision", () => {
  it("updates an automated decision", async () => {
    const updated = { ...mockAutomatedDecisions[0], status: "inactive" };
    server.use(
      http.patch(`${SUPABASE_URL}/rest/v1/automated_decisions`, () => {
        return HttpResponse.json(updated);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useUpdateAutomatedDecision(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ id: "ad-001", status: "inactive" } as any);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useDeleteAutomatedDecision — mutation                              */
/* ------------------------------------------------------------------ */

describe("useDeleteAutomatedDecision", () => {
  it("deletes an automated decision", async () => {
    server.use(
      http.delete(`${SUPABASE_URL}/rest/v1/automated_decisions`, () => {
        return HttpResponse.json([{}]);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useDeleteAutomatedDecision(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ id: "ad-001" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useContestations — list query                                      */
/* ------------------------------------------------------------------ */

describe("useContestations", () => {
  it("returns an empty array by default", async () => {
    const { result } = renderHook(() => useContestations(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("fetches contestations", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/contestations`, () => {
        return HttpResponse.json(mockContestations);
      }),
    );

    const { result } = renderHook(() => useContestations(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(mockContestations.length);
  });
});

/* ------------------------------------------------------------------ */
/*  useCreateContestation — mutation                                   */
/* ------------------------------------------------------------------ */

describe("useCreateContestation", () => {
  it("creates a contestation", async () => {
    const created = { ...mockContestations[0], id: "cont-new" };
    server.use(
      http.post(`${SUPABASE_URL}/rest/v1/contestations`, () => {
        return HttpResponse.json(created, { status: 201 });
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useCreateContestation(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        ai_system_id: "ais-001",
        requester_name: "Test User",
        contested_decision_description: "Refus automatique",
      } as any);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useUpdateContestation — mutation                                   */
/* ------------------------------------------------------------------ */

describe("useUpdateContestation", () => {
  it("updates a contestation", async () => {
    const updated = { ...mockContestations[0], status: "processing" };
    server.use(
      http.patch(`${SUPABASE_URL}/rest/v1/contestations`, () => {
        return HttpResponse.json(updated);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useUpdateContestation(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ id: "cont-001", status: "processing" } as any);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
