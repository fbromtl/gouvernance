import { describe, it, expect } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { SUPABASE_URL } from "../mocks/handlers";
import { createWrapper } from "../mocks/utils";
import { mockBiasFindings } from "../mocks/fixtures";
import {
  useBiasFindings,
  useBiasFinding,
  useCreateBiasFinding,
  useUpdateBiasFinding,
  useDeleteBiasFinding,
} from "@/hooks/useBiasFindings";

/* ------------------------------------------------------------------ */
/*  useBiasFindings — list query                                       */
/* ------------------------------------------------------------------ */

describe("useBiasFindings", () => {
  it("returns an empty array by default", async () => {
    const { result } = renderHook(() => useBiasFindings(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("fetches bias findings list", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/bias_findings`, () => {
        return HttpResponse.json(mockBiasFindings);
      }),
    );

    const { result } = renderHook(() => useBiasFindings(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(mockBiasFindings.length);
  });

  it("filters by severity", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/bias_findings`, () => {
        return HttpResponse.json([mockBiasFindings[0]]);
      }),
    );

    const { result } = renderHook(
      () => useBiasFindings({ severity: "high" }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

/* ------------------------------------------------------------------ */
/*  useBiasFinding — single query                                      */
/* ------------------------------------------------------------------ */

describe("useBiasFinding", () => {
  it("does not fetch when id is undefined", async () => {
    const { result } = renderHook(() => useBiasFinding(undefined), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(result.current.data).toBeUndefined();
  });

  it("fetches a single bias finding by id", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/bias_findings`, () => {
        return HttpResponse.json(mockBiasFindings[0]);
      }),
    );

    const { result } = renderHook(() => useBiasFinding("bf-001"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data!.id).toBe("bf-001");
  });
});

/* ------------------------------------------------------------------ */
/*  useCreateBiasFinding — mutation                                    */
/* ------------------------------------------------------------------ */

describe("useCreateBiasFinding", () => {
  it("creates a bias finding", async () => {
    const created = { ...mockBiasFindings[0], id: "bf-new" };
    server.use(
      http.post(`${SUPABASE_URL}/rest/v1/bias_findings`, () => {
        return HttpResponse.json(created, { status: 201 });
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useCreateBiasFinding(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        ai_system_id: "ais-001",
        title: "New bias finding",
        bias_type: "demographic",
        detection_method: "statistical_analysis",
        protected_dimensions: ["gender"],
        severity: "high",
        status: "open",
        detected_at: "2025-06-01T10:00:00Z",
        remediation_measures: [],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useUpdateBiasFinding — mutation                                    */
/* ------------------------------------------------------------------ */

describe("useUpdateBiasFinding", () => {
  it("updates a bias finding", async () => {
    const updated = { ...mockBiasFindings[0], status: "mitigated" };
    server.use(
      http.patch(`${SUPABASE_URL}/rest/v1/bias_findings`, () => {
        return HttpResponse.json(updated);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useUpdateBiasFinding(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ id: "bf-001", status: "mitigated" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useDeleteBiasFinding — mutation                                    */
/* ------------------------------------------------------------------ */

describe("useDeleteBiasFinding", () => {
  it("deletes a bias finding", async () => {
    server.use(
      http.delete(`${SUPABASE_URL}/rest/v1/bias_findings`, () => {
        return HttpResponse.json([{}]);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useDeleteBiasFinding(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ id: "bf-001" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
