import { describe, it, expect } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { SUPABASE_URL } from "../mocks/handlers";
import { createWrapper } from "../mocks/utils";
import { mockMonitoringMetrics, mockMonitoringDataPoints } from "../mocks/fixtures";
import {
  useMonitoringMetrics,
  useMonitoringDataPoints,
  useCreateMonitoringMetric,
  useUpdateMonitoringMetric,
  useDeleteMonitoringMetric,
  useAddDataPoint,
} from "@/hooks/useMonitoring";

/* ------------------------------------------------------------------ */
/*  useMonitoringMetrics — list query                                  */
/* ------------------------------------------------------------------ */

describe("useMonitoringMetrics", () => {
  it("returns an empty array by default", async () => {
    const { result } = renderHook(() => useMonitoringMetrics(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("fetches monitoring metrics list", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/monitoring_metrics`, () => {
        return HttpResponse.json(mockMonitoringMetrics);
      }),
    );

    const { result } = renderHook(() => useMonitoringMetrics(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(mockMonitoringMetrics.length);
  });

  it("filters by category", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/monitoring_metrics`, () => {
        return HttpResponse.json([mockMonitoringMetrics[0]]);
      }),
    );

    const { result } = renderHook(
      () => useMonitoringMetrics({ category: "performance" }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

/* ------------------------------------------------------------------ */
/*  useMonitoringDataPoints — data points for metric                   */
/* ------------------------------------------------------------------ */

describe("useMonitoringDataPoints", () => {
  it("does not fetch when metricId is null", async () => {
    const { result } = renderHook(() => useMonitoringDataPoints(null), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
  });

  it("fetches data points for a metric", async () => {
    const metricDps = mockMonitoringDataPoints.filter(
      (dp) => dp.metric_id === "met-001",
    );
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/monitoring_data_points`, () => {
        return HttpResponse.json(metricDps);
      }),
    );

    const { result } = renderHook(
      () => useMonitoringDataPoints("met-001"),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(metricDps.length);
  });
});

/* ------------------------------------------------------------------ */
/*  useCreateMonitoringMetric — mutation                               */
/* ------------------------------------------------------------------ */

describe("useCreateMonitoringMetric", () => {
  it("creates a monitoring metric", async () => {
    const created = { ...mockMonitoringMetrics[0], id: "met-new" };
    server.use(
      http.post(`${SUPABASE_URL}/rest/v1/monitoring_metrics`, () => {
        return HttpResponse.json(created, { status: 201 });
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useCreateMonitoringMetric(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        ai_system_id: "ais-001",
        name: "New metric",
        category: "performance",
        unit: "%",
        direction: "higher_is_better",
      } as any);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useUpdateMonitoringMetric — mutation                               */
/* ------------------------------------------------------------------ */

describe("useUpdateMonitoringMetric", () => {
  it("updates a monitoring metric", async () => {
    const updated = { ...mockMonitoringMetrics[0], target_value: 95 };
    server.use(
      http.patch(`${SUPABASE_URL}/rest/v1/monitoring_metrics`, () => {
        return HttpResponse.json(updated);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useUpdateMonitoringMetric(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ id: "met-001", target_value: 95 } as any);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useDeleteMonitoringMetric — mutation                               */
/* ------------------------------------------------------------------ */

describe("useDeleteMonitoringMetric", () => {
  it("deletes a monitoring metric", async () => {
    server.use(
      http.delete(`${SUPABASE_URL}/rest/v1/monitoring_metrics`, () => {
        return HttpResponse.json([{}]);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useDeleteMonitoringMetric(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ id: "met-001" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useAddDataPoint — mutation with alert level calculation            */
/* ------------------------------------------------------------------ */

describe("useAddDataPoint", () => {
  it("adds a data point with auto-calculated alert level", async () => {
    // First the hook fetches the metric to get thresholds
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/monitoring_metrics`, () => {
        return HttpResponse.json(mockMonitoringMetrics[0]);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/monitoring_data_points`, () => {
        return HttpResponse.json(
          { id: "dp-new", value: 85, alert_level: "ok" },
          { status: 201 },
        );
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useAddDataPoint(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        metric_id: "met-001",
        value: 85,
        recorded_at: "2025-06-10T08:00:00Z",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
