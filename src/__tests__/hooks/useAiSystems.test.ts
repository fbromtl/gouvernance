import { describe, it, expect } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { SUPABASE_URL } from "../mocks/handlers";
import { createWrapper } from "../mocks/utils";
import { mockAiSystems } from "../mocks/fixtures";
import {
  useAiSystems,
  useAiSystem,
  useCreateAiSystem,
  useUpdateAiSystem,
  useDeleteAiSystem,
} from "@/hooks/useAiSystems";

/* ------------------------------------------------------------------ */
/*  useAiSystems — list query                                          */
/* ------------------------------------------------------------------ */

describe("useAiSystems", () => {
  it("returns an empty array by default (MSW default handler)", async () => {
    const { result } = renderHook(() => useAiSystems(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("fetches the list of AI systems when handler overridden", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/ai_systems`, () => {
        return HttpResponse.json(mockAiSystems);
      }),
    );

    const { result } = renderHook(() => useAiSystems(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(mockAiSystems.length);
    expect(result.current.data![0].name).toBe("Chatbot Service Client");
  });

  it("passes filters as query keys (different cache entries)", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/ai_systems`, () => {
        return HttpResponse.json([mockAiSystems[1]]);
      }),
    );

    const { result } = renderHook(
      () => useAiSystems({ risk_level: "critical" }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].risk_level).toBe("critical");
  });
});

/* ------------------------------------------------------------------ */
/*  useAiSystem — single query                                         */
/* ------------------------------------------------------------------ */

describe("useAiSystem", () => {
  it("does not fetch when id is undefined", async () => {
    const { result } = renderHook(() => useAiSystem(undefined), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(result.current.data).toBeUndefined();
  });

  it("fetches a single AI system by id", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/ai_systems`, () => {
        return HttpResponse.json(mockAiSystems[0]);
      }),
    );

    const { result } = renderHook(() => useAiSystem("ais-001"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
    expect(result.current.data!.id).toBe("ais-001");
  });
});

/* ------------------------------------------------------------------ */
/*  useCreateAiSystem — mutation                                       */
/* ------------------------------------------------------------------ */

describe("useCreateAiSystem", () => {
  it("creates an AI system and returns data", async () => {
    const created = { ...mockAiSystems[0], id: "ais-new" };
    server.use(
      http.post(`${SUPABASE_URL}/rest/v1/ai_systems`, () => {
        return HttpResponse.json(created, { status: 201 });
      }),
    );

    const { result } = renderHook(() => useCreateAiSystem(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        name: "Nouveau Système",
        description: "Description du nouveau système",
        system_type: "generative_ai",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useUpdateAiSystem — mutation                                       */
/* ------------------------------------------------------------------ */

describe("useUpdateAiSystem", () => {
  it("updates an AI system", async () => {
    const updated = { ...mockAiSystems[0], name: "Updated Name" };
    server.use(
      http.patch(`${SUPABASE_URL}/rest/v1/ai_systems`, () => {
        return HttpResponse.json(updated);
      }),
    );

    const { result } = renderHook(() => useUpdateAiSystem(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        id: "ais-001",
        name: "Updated Name",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useDeleteAiSystem — soft delete mutation                           */
/* ------------------------------------------------------------------ */

describe("useDeleteAiSystem", () => {
  it("soft deletes an AI system (patch with deleted_at)", async () => {
    server.use(
      http.patch(`${SUPABASE_URL}/rest/v1/ai_systems`, () => {
        return HttpResponse.json([{}]);
      }),
    );

    const { result } = renderHook(() => useDeleteAiSystem(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate("ais-001");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
