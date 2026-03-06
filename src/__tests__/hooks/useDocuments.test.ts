import { describe, it, expect } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { SUPABASE_URL } from "../mocks/handlers";
import { createWrapper } from "../mocks/utils";
import { mockDocuments } from "../mocks/fixtures";
import {
  useDocuments,
  useDocumentCounts,
  useCreateDocument,
  useUpdateDocument,
  useDeleteDocument,
} from "@/hooks/useDocuments";

/* ------------------------------------------------------------------ */
/*  useDocuments — list query                                          */
/* ------------------------------------------------------------------ */

describe("useDocuments", () => {
  it("returns an empty array by default", async () => {
    const { result } = renderHook(() => useDocuments(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("fetches documents list", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/documents`, () => {
        return HttpResponse.json(mockDocuments);
      }),
    );

    const { result } = renderHook(() => useDocuments(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(mockDocuments.length);
  });

  it("filters by status", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/documents`, () => {
        return HttpResponse.json([mockDocuments[2]]);
      }),
    );

    const { result } = renderHook(
      () => useDocuments({ status: "draft" }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

/* ------------------------------------------------------------------ */
/*  useDocumentCounts — category counts                                */
/* ------------------------------------------------------------------ */

describe("useDocumentCounts", () => {
  it("returns counts with zero when no documents", async () => {
    const { result } = renderHook(() => useDocumentCounts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data!.__all__).toBe(0);
    expect(result.current.data!.__uncategorized__).toBe(0);
  });

  it("counts documents by category", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/documents`, () => {
        return HttpResponse.json([
          { category: "conformite", subcategory: "efvp" },
          { category: "conformite", subcategory: "audits" },
          { category: "gouvernance", subcategory: "politiques" },
        ]);
      }),
    );

    const { result } = renderHook(() => useDocumentCounts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data!.__all__).toBe(3);
    expect(result.current.data!.conformite).toBe(2);
    expect(result.current.data!.gouvernance).toBe(1);
  });
});

/* ------------------------------------------------------------------ */
/*  useCreateDocument — mutation                                       */
/* ------------------------------------------------------------------ */

describe("useCreateDocument", () => {
  it("creates a document", async () => {
    const created = { ...mockDocuments[2], id: "doc-new" };
    server.use(
      http.post(`${SUPABASE_URL}/rest/v1/documents`, () => {
        return HttpResponse.json(created, { status: 201 });
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useCreateDocument(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        title: "New document",
        document_type: "policy",
        status: "draft",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useUpdateDocument — mutation                                       */
/* ------------------------------------------------------------------ */

describe("useUpdateDocument", () => {
  it("updates a document", async () => {
    const updated = { ...mockDocuments[0], status: "published" };
    server.use(
      http.patch(`${SUPABASE_URL}/rest/v1/documents`, () => {
        return HttpResponse.json(updated);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useUpdateDocument(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ id: "doc-001", status: "published" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ------------------------------------------------------------------ */
/*  useDeleteDocument — mutation                                       */
/* ------------------------------------------------------------------ */

describe("useDeleteDocument", () => {
  it("deletes a document", async () => {
    server.use(
      http.delete(`${SUPABASE_URL}/rest/v1/documents`, () => {
        return HttpResponse.json([{}]);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useDeleteDocument(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ id: "doc-003" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
