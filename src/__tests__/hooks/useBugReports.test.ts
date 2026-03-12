import { describe, it, expect } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { SUPABASE_URL } from "../mocks/handlers";
import { createWrapper } from "../mocks/utils";
import { useCreateBugReport } from "@/hooks/useBugReports";

describe("useCreateBugReport", () => {
  it("creates a bug report", async () => {
    const created = {
      id: "bug-001",
      title: "Test bug",
      description: "Description",
      severity: "minor",
      page_url: "/dashboard",
      organization_id: "org-001",
      user_id: "user-001",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      screenshot_url: null,
    };

    server.use(
      http.post(`${SUPABASE_URL}/rest/v1/bug_reports`, () => {
        return HttpResponse.json(created, { status: 201 });
      }),
    );

    const { result } = renderHook(() => useCreateBugReport(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        title: "Test bug",
        description: "Description",
        severity: "minor",
        page_url: "/dashboard",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
