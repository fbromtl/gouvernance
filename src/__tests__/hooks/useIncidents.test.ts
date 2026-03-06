import { describe, it, expect } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { SUPABASE_URL } from "../mocks/handlers";
import { createWrapper } from "../mocks/utils";
import { mockIncidents } from "../mocks/fixtures";
import {
  useIncidents,
  useIncident,
  useCreateIncident,
  useUpdateIncident,
  useSoftDeleteIncident,
} from "@/hooks/useIncidents";

/* ------------------------------------------------------------------ */
/*  useIncidents — list query                                          */
/* ------------------------------------------------------------------ */

describe("useIncidents", () => {
  it("returns an empty array by default", async () => {
    const { result } = renderHook(() => useIncidents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("fetches the list of incidents", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/incidents`, () => {
        return HttpResponse.json(mockIncidents);
      }),
    );

    const { result } = renderHook(() => useIncidents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(mockIncidents.length);
    expect(result.current.data![0].title).toBe(
      "Biais discriminatoire détecté dans le scoring crédit",
    );
  });

  it("respects filters in query key", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/incidents`, () => {
        return HttpResponse.json([mockIncidents[0]]);
      }),
    );

    const { result } = renderHook(
      () => useIncidents({ severity: "critical" }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

/* ------------------------------------------------------------------ */
/*  useIncident — single query                                         */
/* ------------------------------------------------------------------ */

describe("useIncident", () => {
  it("does not fetch when id is undefined", async () => {
    const { result } = renderHook(() => useIncident(undefined), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(result.current.data).toBeUndefined();
  });

  it("fetches a single incident by id", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/incidents`, () => {
        return HttpResponse.json(mockIncidents[1]);
      }),
    );

    const { result } = renderHook(() => useIncident("inc-002"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data!.id).toBe("inc-002");
  });
});

/* ------------------------------------------------------------------ */
/*  useCreateIncident — mutation                                       */
/* ------------------------------------------------------------------ */

describe("useCreateIncident", () => {
  it("creates an incident", async () => {
    const created = { ...mockIncidents[0], id: "inc-new" };
    server.use(
      http.post(`${SUPABASE_URL}/rest/v1/incidents`, () => {
        return HttpResponse.json(created, { status: 201 });
      }),
    );

    const { result } = renderHook(() => useCreateIncident(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        title: "Nouvel incident",
        category: "performance",
        incident_type: "model_degradation",
        description: "Description du nouvel incident",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useUpdateIncident — mutation                                       */
/* ------------------------------------------------------------------ */

describe("useUpdateIncident", () => {
  it("updates an incident", async () => {
    const updated = { ...mockIncidents[0], status: "resolved" };
    server.use(
      http.patch(`${SUPABASE_URL}/rest/v1/incidents`, () => {
        return HttpResponse.json(updated);
      }),
    );

    const { result } = renderHook(() => useUpdateIncident(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        id: "inc-001",
        status: "resolved",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useSoftDeleteIncident — mutation                                   */
/* ------------------------------------------------------------------ */

describe("useSoftDeleteIncident", () => {
  it("soft deletes an incident (patch with deleted_at)", async () => {
    server.use(
      http.patch(`${SUPABASE_URL}/rest/v1/incidents`, () => {
        return HttpResponse.json([{}]);
      }),
    );

    const { result } = renderHook(() => useSoftDeleteIncident(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate("inc-001");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
