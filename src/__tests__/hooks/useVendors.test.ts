import { describe, it, expect } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { SUPABASE_URL } from "../mocks/handlers";
import { createWrapper } from "../mocks/utils";
import { mockVendors } from "../mocks/fixtures";
import {
  useVendors,
  useCreateVendor,
  useUpdateVendor,
  useDeleteVendor,
} from "@/hooks/useVendors";

/* ------------------------------------------------------------------ */
/*  useVendors — list query                                            */
/* ------------------------------------------------------------------ */

describe("useVendors", () => {
  it("returns an empty array by default", async () => {
    const { result } = renderHook(() => useVendors(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("fetches vendors list", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/vendors`, () => {
        return HttpResponse.json(mockVendors);
      }),
    );

    const { result } = renderHook(() => useVendors(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(mockVendors.length);
  });

  it("filters by status", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/vendors`, () => {
        return HttpResponse.json([mockVendors[0]]);
      }),
    );

    const { result } = renderHook(
      () => useVendors({ status: "active" }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it("filters by risk_level", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/vendors`, () => {
        return HttpResponse.json([mockVendors[1]]);
      }),
    );

    const { result } = renderHook(
      () => useVendors({ risk_level: "low" }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

/* ------------------------------------------------------------------ */
/*  useCreateVendor — mutation                                         */
/* ------------------------------------------------------------------ */

describe("useCreateVendor", () => {
  it("creates a vendor", async () => {
    const created = { ...mockVendors[0], id: "ven-new" };
    server.use(
      http.post(`${SUPABASE_URL}/rest/v1/vendors`, () => {
        return HttpResponse.json(created, { status: 201 });
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useCreateVendor(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        name: "New Vendor",
        status: "active",
      } as any);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useUpdateVendor — mutation                                         */
/* ------------------------------------------------------------------ */

describe("useUpdateVendor", () => {
  it("updates a vendor", async () => {
    const updated = { ...mockVendors[0], risk_level: "high" };
    server.use(
      http.patch(`${SUPABASE_URL}/rest/v1/vendors`, () => {
        return HttpResponse.json(updated);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useUpdateVendor(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ id: "ven-001", risk_level: "high" } as any);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useDeleteVendor — mutation                                         */
/* ------------------------------------------------------------------ */

describe("useDeleteVendor", () => {
  it("deletes a vendor", async () => {
    server.use(
      http.delete(`${SUPABASE_URL}/rest/v1/vendors`, () => {
        return HttpResponse.json([{}]);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useDeleteVendor(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ id: "ven-001" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
