import { describe, it, expect } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { SUPABASE_URL } from "../mocks/handlers";
import { createWrapper } from "../mocks/utils";
import { mockDecisions } from "../mocks/fixtures";
import {
  useDecisions,
  useDecision,
  useCreateDecision,
  useUpdateDecision,
  useDeleteDecision,
  useSubmitDecision,
  useApproveDecision,
  useRejectDecision,
} from "@/hooks/useDecisions";

/* ------------------------------------------------------------------ */
/*  useDecisions — list query                                          */
/* ------------------------------------------------------------------ */

describe("useDecisions", () => {
  it("returns an empty array by default", async () => {
    const { result } = renderHook(() => useDecisions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("fetches decisions list", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/decisions`, () => {
        return HttpResponse.json(mockDecisions);
      }),
    );

    const { result } = renderHook(() => useDecisions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(mockDecisions.length);
  });

  it("filters by status", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/decisions`, () => {
        return HttpResponse.json([mockDecisions[2]]);
      }),
    );

    const { result } = renderHook(
      () => useDecisions({ status: "draft" }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].status).toBe("draft");
  });
});

/* ------------------------------------------------------------------ */
/*  useDecision — single query                                         */
/* ------------------------------------------------------------------ */

describe("useDecision", () => {
  it("does not fetch when id is undefined", async () => {
    const { result } = renderHook(() => useDecision(undefined), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(result.current.data).toBeUndefined();
  });

  it("fetches a single decision by id", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/decisions`, () => {
        return HttpResponse.json(mockDecisions[0]);
      }),
    );

    const { result } = renderHook(() => useDecision("dec-001"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data!.id).toBe("dec-001");
  });
});

/* ------------------------------------------------------------------ */
/*  useCreateDecision — mutation                                       */
/* ------------------------------------------------------------------ */

describe("useCreateDecision", () => {
  it("creates a decision", async () => {
    const created = { ...mockDecisions[2], id: "dec-new" };
    server.use(
      http.post(`${SUPABASE_URL}/rest/v1/decisions`, () => {
        return HttpResponse.json(created, { status: 201 });
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useCreateDecision(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        title: "Nouvelle décision",
        decision_type: "deployment",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useUpdateDecision — mutation                                       */
/* ------------------------------------------------------------------ */

describe("useUpdateDecision", () => {
  it("updates a decision", async () => {
    const updated = { ...mockDecisions[2], title: "Updated Title" };
    server.use(
      http.patch(`${SUPABASE_URL}/rest/v1/decisions`, () => {
        return HttpResponse.json(updated);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useUpdateDecision(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        id: "dec-003",
        title: "Updated Title",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useDeleteDecision — mutation                                       */
/* ------------------------------------------------------------------ */

describe("useDeleteDecision", () => {
  it("deletes a decision", async () => {
    server.use(
      http.delete(`${SUPABASE_URL}/rest/v1/decisions`, () => {
        return HttpResponse.json([{}]);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useDeleteDecision(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ id: "dec-003" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useSubmitDecision — status transition                              */
/* ------------------------------------------------------------------ */

describe("useSubmitDecision", () => {
  it("submits a decision (draft -> submitted)", async () => {
    const submitted = { ...mockDecisions[2], status: "submitted" };
    server.use(
      http.patch(`${SUPABASE_URL}/rest/v1/decisions`, () => {
        return HttpResponse.json(submitted);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useSubmitDecision(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ id: "dec-003" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useApproveDecision — status transition                             */
/* ------------------------------------------------------------------ */

describe("useApproveDecision", () => {
  it("approves a decision (submitted -> approved)", async () => {
    const approved = {
      ...mockDecisions[1],
      id: "dec-002",
      status: "approved",
      approved_at: "2025-06-01T10:00:00Z",
    };
    server.use(
      http.patch(`${SUPABASE_URL}/rest/v1/decisions`, () => {
        return HttpResponse.json(approved);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useApproveDecision(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ id: "dec-002" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useRejectDecision — status transition                              */
/* ------------------------------------------------------------------ */

describe("useRejectDecision", () => {
  it("rejects a decision with reason", async () => {
    const rejected = {
      ...mockDecisions[1],
      id: "dec-002",
      status: "rejected",
      rejection_reason: "Risque trop élevé",
    };
    server.use(
      http.patch(`${SUPABASE_URL}/rest/v1/decisions`, () => {
        return HttpResponse.json(rejected);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useRejectDecision(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        id: "dec-002",
        rejection_reason: "Risque trop élevé",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
