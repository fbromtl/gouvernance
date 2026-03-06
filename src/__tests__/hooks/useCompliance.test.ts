import { describe, it, expect } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { SUPABASE_URL } from "../mocks/handlers";
import { createWrapper } from "../mocks/utils";
import { mockComplianceAssessments, mockRemediationActions } from "../mocks/fixtures";
import {
  useComplianceAssessments,
  useComplianceScores,
  useRemediationActions,
  useSeedFramework,
  useUpdateAssessment,
  useCreateRemediation,
  useUpdateRemediation,
  useDeleteRemediation,
} from "@/hooks/useCompliance";

/* ------------------------------------------------------------------ */
/*  useComplianceAssessments — list query                              */
/* ------------------------------------------------------------------ */

describe("useComplianceAssessments", () => {
  it("returns an empty array by default", async () => {
    const { result } = renderHook(() => useComplianceAssessments(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("fetches compliance assessments list", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/compliance_assessments`, () => {
        return HttpResponse.json(mockComplianceAssessments);
      }),
    );

    const { result } = renderHook(() => useComplianceAssessments(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(mockComplianceAssessments.length);
  });

  it("filters by framework_code", async () => {
    const loi25Only = mockComplianceAssessments.filter(
      (a) => a.framework_code === "loi25",
    );
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/compliance_assessments`, () => {
        return HttpResponse.json(loi25Only);
      }),
    );

    const { result } = renderHook(
      () => useComplianceAssessments({ framework_code: "loi25" }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
  });
});

/* ------------------------------------------------------------------ */
/*  useComplianceScores — computed scores                              */
/* ------------------------------------------------------------------ */

describe("useComplianceScores", () => {
  it("returns default empty scores when no assessments exist", async () => {
    const { result } = renderHook(() => useComplianceScores(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data!.frameworks).toBeDefined();
    expect(result.current.data!.global).toBe(0);
  });

  it("computes scores from fetched assessments", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/compliance_assessments`, () => {
        return HttpResponse.json(mockComplianceAssessments);
      }),
    );

    const { result } = renderHook(() => useComplianceScores(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data!.frameworks.length).toBeGreaterThan(0);
  });
});

/* ------------------------------------------------------------------ */
/*  useRemediationActions — list query                                 */
/* ------------------------------------------------------------------ */

describe("useRemediationActions", () => {
  it("returns an empty array by default", async () => {
    const { result } = renderHook(() => useRemediationActions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("fetches remediation actions", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/remediation_actions`, () => {
        return HttpResponse.json(mockRemediationActions);
      }),
    );

    const { result } = renderHook(() => useRemediationActions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(mockRemediationActions.length);
  });
});

/* ------------------------------------------------------------------ */
/*  useSeedFramework — mutation                                        */
/* ------------------------------------------------------------------ */

describe("useSeedFramework", () => {
  it("seeds a framework and returns assessments", async () => {
    server.use(
      http.post(`${SUPABASE_URL}/rest/v1/compliance_assessments`, () => {
        return HttpResponse.json(mockComplianceAssessments, { status: 201 });
      }),
      // The audit_logs insert from useAuditLog
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useSeedFramework(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ frameworkCode: "loi25" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useUpdateAssessment — mutation                                     */
/* ------------------------------------------------------------------ */

describe("useUpdateAssessment", () => {
  it("updates an assessment status", async () => {
    const updated = { ...mockComplianceAssessments[0], status: "compliant" };
    server.use(
      http.patch(`${SUPABASE_URL}/rest/v1/compliance_assessments`, () => {
        return HttpResponse.json(updated);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useUpdateAssessment(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        id: "ca-001",
        status: "compliant",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useCreateRemediation — mutation                                    */
/* ------------------------------------------------------------------ */

describe("useCreateRemediation", () => {
  it("creates a remediation action", async () => {
    const created = { ...mockRemediationActions[0], id: "rem-new" };
    server.use(
      http.post(`${SUPABASE_URL}/rest/v1/remediation_actions`, () => {
        return HttpResponse.json(created, { status: 201 });
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useCreateRemediation(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        assessment_id: "ca-002",
        title: "Nouvelle action corrective",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useUpdateRemediation — mutation                                    */
/* ------------------------------------------------------------------ */

describe("useUpdateRemediation", () => {
  it("updates a remediation action", async () => {
    const updated = { ...mockRemediationActions[0], status: "completed" };
    server.use(
      http.patch(`${SUPABASE_URL}/rest/v1/remediation_actions`, () => {
        return HttpResponse.json(updated);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useUpdateRemediation(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        id: "rem-001",
        status: "completed",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useDeleteRemediation — mutation                                    */
/* ------------------------------------------------------------------ */

describe("useDeleteRemediation", () => {
  it("deletes a remediation action", async () => {
    server.use(
      http.delete(`${SUPABASE_URL}/rest/v1/remediation_actions`, () => {
        return HttpResponse.json([{}]);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useDeleteRemediation(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ id: "rem-001" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
