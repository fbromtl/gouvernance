import { describe, it, expect } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { SUPABASE_URL } from "../mocks/handlers";
import { createWrapper } from "../mocks/utils";
import { mockDatasets, mockDataTransfers } from "../mocks/fixtures";
import {
  useDatasets,
  useCreateDataset,
  useUpdateDataset,
  useDeleteDataset,
  useDataTransfers,
  useCreateDataTransfer,
  useUpdateDataTransfer,
  useDeleteDataTransfer,
} from "@/hooks/useData";

/* ------------------------------------------------------------------ */
/*  useDatasets — list query                                           */
/* ------------------------------------------------------------------ */

describe("useDatasets", () => {
  it("returns an empty array by default", async () => {
    const { result } = renderHook(() => useDatasets(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("fetches datasets list", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/datasets`, () => {
        return HttpResponse.json(mockDatasets);
      }),
    );

    const { result } = renderHook(() => useDatasets(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(mockDatasets.length);
  });
});

/* ------------------------------------------------------------------ */
/*  useCreateDataset — mutation                                        */
/* ------------------------------------------------------------------ */

describe("useCreateDataset", () => {
  it("creates a dataset", async () => {
    const created = { ...mockDatasets[0], id: "ds-new" };
    server.use(
      http.post(`${SUPABASE_URL}/rest/v1/datasets`, () => {
        return HttpResponse.json(created, { status: 201 });
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useCreateDataset(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ name: "New dataset" } as any);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useUpdateDataset — mutation                                        */
/* ------------------------------------------------------------------ */

describe("useUpdateDataset", () => {
  it("updates a dataset", async () => {
    const updated = { ...mockDatasets[0], name: "Updated Dataset" };
    server.use(
      http.patch(`${SUPABASE_URL}/rest/v1/datasets`, () => {
        return HttpResponse.json(updated);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useUpdateDataset(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ id: "ds-001", name: "Updated Dataset" } as any);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useDeleteDataset — mutation                                        */
/* ------------------------------------------------------------------ */

describe("useDeleteDataset", () => {
  it("deletes a dataset", async () => {
    server.use(
      http.delete(`${SUPABASE_URL}/rest/v1/datasets`, () => {
        return HttpResponse.json([{}]);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useDeleteDataset(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ id: "ds-001" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useDataTransfers — list query                                      */
/* ------------------------------------------------------------------ */

describe("useDataTransfers", () => {
  it("returns an empty array by default", async () => {
    const { result } = renderHook(() => useDataTransfers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("fetches data transfers list", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/data_transfers`, () => {
        return HttpResponse.json(mockDataTransfers);
      }),
    );

    const { result } = renderHook(() => useDataTransfers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(mockDataTransfers.length);
  });
});

/* ------------------------------------------------------------------ */
/*  useCreateDataTransfer — mutation                                   */
/* ------------------------------------------------------------------ */

describe("useCreateDataTransfer", () => {
  it("creates a data transfer", async () => {
    const created = { ...mockDataTransfers[0], id: "dt-new" };
    server.use(
      http.post(`${SUPABASE_URL}/rest/v1/data_transfers`, () => {
        return HttpResponse.json(created, { status: 201 });
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useCreateDataTransfer(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        dataset_id: "ds-001",
        destination_country: "EU",
      } as any);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useUpdateDataTransfer — mutation                                   */
/* ------------------------------------------------------------------ */

describe("useUpdateDataTransfer", () => {
  it("updates a data transfer", async () => {
    const updated = { ...mockDataTransfers[0], status: "revoked" };
    server.use(
      http.patch(`${SUPABASE_URL}/rest/v1/data_transfers`, () => {
        return HttpResponse.json(updated);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useUpdateDataTransfer(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ id: "dt-001", status: "revoked" } as any);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useDeleteDataTransfer — mutation                                   */
/* ------------------------------------------------------------------ */

describe("useDeleteDataTransfer", () => {
  it("deletes a data transfer", async () => {
    server.use(
      http.delete(`${SUPABASE_URL}/rest/v1/data_transfers`, () => {
        return HttpResponse.json([{}]);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useDeleteDataTransfer(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ id: "dt-001" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
