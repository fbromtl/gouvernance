import { describe, it, expect } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { SUPABASE_URL } from "../mocks/handlers";
import { createWrapper } from "../mocks/utils";
import { mockRiskAssessments } from "../mocks/fixtures";
import {
  useRiskAssessments,
  useRiskAssessment,
  useCreateRiskAssessment,
  useUpdateRiskAssessment,
} from "@/hooks/useRiskAssessments";

/* ------------------------------------------------------------------ */
/*  useRiskAssessments — list query                                    */
/* ------------------------------------------------------------------ */

describe("useRiskAssessments", () => {
  it("returns an empty array by default", async () => {
    const { result } = renderHook(() => useRiskAssessments(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("fetches risk assessments list", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/risk_assessments`, () => {
        return HttpResponse.json(mockRiskAssessments);
      }),
    );

    const { result } = renderHook(() => useRiskAssessments(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(mockRiskAssessments.length);
  });

  it("filters by aiSystemId when provided", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/risk_assessments`, () => {
        return HttpResponse.json([mockRiskAssessments[0]]);
      }),
    );

    const { result } = renderHook(
      () => useRiskAssessments("ais-002"),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].ai_system_id).toBe("ais-002");
  });
});

/* ------------------------------------------------------------------ */
/*  useRiskAssessment — single query                                   */
/* ------------------------------------------------------------------ */

describe("useRiskAssessment", () => {
  it("does not fetch when id is undefined", async () => {
    const { result } = renderHook(() => useRiskAssessment(undefined), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(result.current.data).toBeUndefined();
  });

  it("fetches a single risk assessment by id", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/risk_assessments`, () => {
        return HttpResponse.json(mockRiskAssessments[0]);
      }),
    );

    const { result } = renderHook(() => useRiskAssessment("risk-001"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
    expect(result.current.data!.id).toBe("risk-001");
  });
});

/* ------------------------------------------------------------------ */
/*  useCreateRiskAssessment — mutation                                 */
/* ------------------------------------------------------------------ */

describe("useCreateRiskAssessment", () => {
  it("creates a risk assessment", async () => {
    const created = { ...mockRiskAssessments[0], id: "risk-new" };
    server.use(
      http.post(`${SUPABASE_URL}/rest/v1/risk_assessments`, () => {
        return HttpResponse.json(created, { status: 201 });
      }),
    );

    const { result } = renderHook(() => useCreateRiskAssessment(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        ai_system_id: "ais-002",
        total_score: 78,
        risk_level: "critical",
        answers: { q1: "oui_direct" },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useUpdateRiskAssessment — mutation                                 */
/* ------------------------------------------------------------------ */

describe("useUpdateRiskAssessment", () => {
  it("updates a risk assessment", async () => {
    const updated = { ...mockRiskAssessments[0], status: "approved" };
    server.use(
      http.patch(`${SUPABASE_URL}/rest/v1/risk_assessments`, () => {
        return HttpResponse.json(updated);
      }),
    );

    const { result } = renderHook(() => useUpdateRiskAssessment(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        id: "risk-001",
        status: "approved",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
