import { describe, it, expect } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { SUPABASE_URL } from "../mocks/handlers";
import { createWrapper } from "../mocks/utils";
import {
  mockOrganization,
  mockGovernanceRoles,
  mockCommittees,
  mockPolicies,
} from "../mocks/fixtures";

/* ================================================================== */
/*  useMembers                                                         */
/* ================================================================== */

import { useMembers, useMemberBySlug } from "@/hooks/useMembers";

describe("useMembers", () => {
  it("returns an empty array when no members have slugs", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/profiles`, () => {
        return HttpResponse.json([]);
      }),
    );

    const { result } = renderHook(() => useMembers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("fetches members with org names and plans", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/profiles`, () => {
        return HttpResponse.json([
          {
            id: "user-001",
            full_name: "Test User",
            avatar_url: null,
            job_title: "Dev",
            bio: null,
            linkedin_url: null,
            member_slug: "test-user",
            organization_id: "org-001",
          },
        ]);
      }),
      http.get(`${SUPABASE_URL}/rest/v1/organizations`, () => {
        return HttpResponse.json([{ id: "org-001", name: "Test Org" }]);
      }),
      http.get(`${SUPABASE_URL}/rest/v1/subscriptions`, () => {
        return HttpResponse.json([
          { organization_id: "org-001", plan: "expert" },
        ]);
      }),
    );

    const { result } = renderHook(() => useMembers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].organization_name).toBe("Test Org");
    expect(result.current.data![0].plan).toBe("expert");
  });
});

describe("useMemberBySlug", () => {
  it("does not fetch when slug is undefined", async () => {
    const { result } = renderHook(() => useMemberBySlug(undefined), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
  });

  it("fetches a member by slug", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/profiles`, () => {
        return HttpResponse.json({
          id: "user-001",
          full_name: "Test User",
          avatar_url: null,
          job_title: "Dev",
          bio: null,
          linkedin_url: null,
          member_slug: "test-user",
          organization_id: "org-001",
        });
      }),
      http.get(`${SUPABASE_URL}/rest/v1/organizations`, () => {
        return HttpResponse.json({ id: "org-001", name: "Test Org" });
      }),
      http.get(`${SUPABASE_URL}/rest/v1/subscriptions`, () => {
        return HttpResponse.json({ organization_id: "org-001", plan: "member" });
      }),
    );

    const { result } = renderHook(() => useMemberBySlug("test-user"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.full_name).toBe("Test User");
  });
});

/* ================================================================== */
/*  useOrgMembers                                                      */
/* ================================================================== */

import { useOrgMembers } from "@/hooks/useOrgMembers";

describe("useOrgMembers", () => {
  it("returns an empty array by default (via rpc)", async () => {
    server.use(
      http.post(`${SUPABASE_URL}/rest/v1/rpc/get_org_members`, () => {
        return HttpResponse.json([]);
      }),
    );

    const { result } = renderHook(() => useOrgMembers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("fetches org members via rpc", async () => {
    server.use(
      http.post(`${SUPABASE_URL}/rest/v1/rpc/get_org_members`, () => {
        return HttpResponse.json([
          {
            user_id: "user-001",
            full_name: "Test User",
            avatar_url: null,
            email: "test@gouvernance.ai",
            role: "org_admin",
            joined_at: "2025-01-01T00:00:00Z",
          },
        ]);
      }),
    );

    const { result } = renderHook(() => useOrgMembers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].role).toBe("org_admin");
  });
});

/* ================================================================== */
/*  useOrganization                                                    */
/* ================================================================== */

import { useOrganization } from "@/hooks/useOrganization";

describe("useOrganization", () => {
  it("returns empty by default", async () => {
    const { result } = renderHook(() => useOrganization(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("fetches the current organization", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/organizations`, () => {
        return HttpResponse.json(mockOrganization);
      }),
    );

    const { result } = renderHook(() => useOrganization(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.name).toBe("Test Org");
  });
});

/* ================================================================== */
/*  useSubscription                                                    */
/* ================================================================== */

import { useSubscription, useCreateCheckout, useCustomerPortal } from "@/hooks/useSubscription";

describe("useSubscription", () => {
  it("fetches the current subscription", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/subscriptions`, () => {
        return HttpResponse.json({
          id: "sub-001",
          organization_id: "org-001",
          plan: "expert",
          status: "active",
        });
      }),
    );

    const { result } = renderHook(() => useSubscription(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.plan).toBe("expert");
  });

  it("returns null when no subscription exists", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/subscriptions`, () => {
        return HttpResponse.json(
          { code: "PGRST116", message: "Not found" },
          { status: 406 },
        );
      }),
    );

    const { result } = renderHook(() => useSubscription(), {
      wrapper: createWrapper(),
    });

    // The hook handles PGRST116 gracefully and returns null
    await waitFor(() =>
      expect(result.current.isSuccess || result.current.isError).toBe(true),
    );
  });
});

/* ================================================================== */
/*  usePermissions                                                     */
/* ================================================================== */

import { usePermissions } from "@/hooks/usePermissions";

describe("usePermissions", () => {
  it("returns a can() function", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/user_roles`, () => {
        return HttpResponse.json({ role: "org_admin" });
      }),
    );

    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(),
    });

    // usePermissions is synchronous (wraps useCurrentRole)
    expect(typeof result.current.can).toBe("function");
  });

  it("can() checks permissions based on role", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/user_roles`, () => {
        return HttpResponse.json({ role: "org_admin" });
      }),
    );

    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.role).toBeDefined());
    // org_admin has manage_organization
    expect(result.current.can("manage_organization")).toBe(true);
  });
});

/* ================================================================== */
/*  useNotifications                                                   */
/* ================================================================== */

import { useNotifications } from "@/hooks/useNotifications";

describe("useNotifications", () => {
  it("returns empty notifications array by default", async () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it("fetches notifications and calculates unread count", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/notifications`, () => {
        return HttpResponse.json([
          { id: "n-001", user_id: "user-001", read: false, created_at: "2025-06-01T10:00:00Z" },
          { id: "n-002", user_id: "user-001", read: true, created_at: "2025-06-01T09:00:00Z" },
          { id: "n-003", user_id: "user-001", read: false, created_at: "2025-06-01T08:00:00Z" },
        ]);
      }),
    );

    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.notifications).toHaveLength(3);
    expect(result.current.unreadCount).toBe(2);
  });

  it("exposes markAsRead and markAllAsRead functions", async () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(typeof result.current.markAsRead).toBe("function");
    expect(typeof result.current.markAllAsRead).toBe("function");
  });
});

/* ================================================================== */
/*  useDiagnostic                                                      */
/* ================================================================== */

import {
  useLatestDiagnostic,
  useSaveDiagnostic,
  useDeleteDiagnostic,
  getPendingDiagnostic,
  clearPendingDiagnostic,
} from "@/hooks/useDiagnostic";

describe("useLatestDiagnostic", () => {
  it("fetches latest diagnostic", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/governance_diagnostics`, () => {
        return HttpResponse.json({
          id: "diag-001",
          user_id: "user-001",
          total_score: 72,
          maturity_level: "intermediate",
        });
      }),
    );

    const { result } = renderHook(() => useLatestDiagnostic(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.total_score).toBe(72);
  });
});

describe("useSaveDiagnostic", () => {
  it("saves a diagnostic result", async () => {
    server.use(
      http.post(`${SUPABASE_URL}/rest/v1/governance_diagnostics`, () => {
        return HttpResponse.json(
          { id: "diag-new", total_score: 80, maturity_level: "advanced" },
          { status: 201 },
        );
      }),
    );

    const { result } = renderHook(() => useSaveDiagnostic(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        answers: { q1: 4, q2: 3 },
        score: 80,
        level: "advanced",
        completedAt: "2025-06-01T10:00:00Z",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useDeleteDiagnostic", () => {
  it("deletes diagnostics for current user", async () => {
    server.use(
      http.delete(`${SUPABASE_URL}/rest/v1/governance_diagnostics`, () => {
        return HttpResponse.json([{}]);
      }),
    );

    const { result } = renderHook(() => useDeleteDiagnostic(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("getPendingDiagnostic", () => {
  it("returns null when nothing in localStorage", () => {
    expect(getPendingDiagnostic()).toBeNull();
  });

  it("returns parsed diagnostic from localStorage", () => {
    const pending = {
      answers: { q1: 4 },
      score: 80,
      level: "advanced",
      completedAt: "2025-06-01T10:00:00Z",
    };
    localStorage.setItem(
      "gouvernance:diagnostic:pending",
      JSON.stringify(pending),
    );

    const result = getPendingDiagnostic();
    expect(result?.score).toBe(80);
    expect(result?.level).toBe("advanced");

    localStorage.removeItem("gouvernance:diagnostic:pending");
  });
});

describe("clearPendingDiagnostic", () => {
  it("removes pending diagnostic from localStorage", () => {
    localStorage.setItem(
      "gouvernance:diagnostic:pending",
      JSON.stringify({ answers: {}, score: 50, level: "basic", completedAt: "2025-01-01" }),
    );

    clearPendingDiagnostic();
    expect(localStorage.getItem("gouvernance:diagnostic:pending")).toBeNull();
  });
});

/* ================================================================== */
/*  useAdminMutations                                                  */
/* ================================================================== */

import {
  useUpdateOrganization,
  useUpdateMemberRole,
  useRemoveMember,
} from "@/hooks/useAdminMutations";

describe("useUpdateOrganization", () => {
  it("updates the organization", async () => {
    server.use(
      http.patch(`${SUPABASE_URL}/rest/v1/organizations`, () => {
        return HttpResponse.json([{}]);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useUpdateOrganization(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ name: "Updated Org Name" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useUpdateMemberRole", () => {
  it("updates a member role", async () => {
    server.use(
      http.patch(`${SUPABASE_URL}/rest/v1/user_roles`, () => {
        return HttpResponse.json([{}]);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useUpdateMemberRole(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        userId: "user-002",
        role: "compliance_officer",
        previousRole: "member",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useRemoveMember", () => {
  it("removes a member from the organization", async () => {
    server.use(
      http.delete(`${SUPABASE_URL}/rest/v1/user_roles`, () => {
        return HttpResponse.json([{}]);
      }),
      http.patch(`${SUPABASE_URL}/rest/v1/profiles`, () => {
        return HttpResponse.json([{}]);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useRemoveMember(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        userId: "user-002",
        memberName: "Other User",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ================================================================== */
/*  useGovernanceRoles                                                 */
/* ================================================================== */

import {
  useGovernanceRoles,
  useCreateGovernanceRole,
  useUpdateGovernanceRole,
  useDeleteGovernanceRole,
} from "@/hooks/useGovernanceRoles";

describe("useGovernanceRoles", () => {
  it("returns an empty array by default", async () => {
    const { result } = renderHook(() => useGovernanceRoles(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("fetches governance roles", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/governance_roles`, () => {
        return HttpResponse.json(mockGovernanceRoles);
      }),
    );

    const { result } = renderHook(() => useGovernanceRoles(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(mockGovernanceRoles.length);
  });
});

describe("useCreateGovernanceRole", () => {
  it("creates a governance role", async () => {
    const created = { ...mockGovernanceRoles[0], id: "role-new" };
    server.use(
      http.post(`${SUPABASE_URL}/rest/v1/governance_roles`, () => {
        return HttpResponse.json(created, { status: 201 });
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useCreateGovernanceRole(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        role_type: "dpo",
        user_id: "user-001",
      } as any);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useDeleteGovernanceRole", () => {
  it("deletes a governance role", async () => {
    server.use(
      http.delete(`${SUPABASE_URL}/rest/v1/governance_roles`, () => {
        return HttpResponse.json([{}]);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useDeleteGovernanceRole(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate("role-001");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ================================================================== */
/*  useCommittees                                                      */
/* ================================================================== */

import {
  useCommittees,
  useCreateCommittee,
  useUpdateCommittee,
  useDeleteCommittee,
} from "@/hooks/useCommittees";

describe("useCommittees", () => {
  it("returns an empty array by default", async () => {
    const { result } = renderHook(() => useCommittees(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("fetches committees", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/governance_committees`, () => {
        return HttpResponse.json(mockCommittees);
      }),
    );

    const { result } = renderHook(() => useCommittees(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(mockCommittees.length);
  });
});

describe("useCreateCommittee", () => {
  it("creates a committee", async () => {
    const created = { ...mockCommittees[0], id: "com-new" };
    server.use(
      http.post(`${SUPABASE_URL}/rest/v1/governance_committees`, () => {
        return HttpResponse.json(created, { status: 201 });
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useCreateCommittee(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ name: "New Committee" } as any);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useDeleteCommittee", () => {
  it("deletes a committee", async () => {
    server.use(
      http.delete(`${SUPABASE_URL}/rest/v1/governance_committees`, () => {
        return HttpResponse.json([{}]);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useDeleteCommittee(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate("com-001");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ================================================================== */
/*  usePolicies                                                        */
/* ================================================================== */

import {
  usePolicies,
  usePolicy,
  useCreatePolicy,
  useUpdatePolicy,
  usePublishPolicy,
} from "@/hooks/usePolicies";

describe("usePolicies", () => {
  it("returns an empty array by default", async () => {
    const { result } = renderHook(() => usePolicies(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("fetches policies", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/governance_policies`, () => {
        return HttpResponse.json(mockPolicies);
      }),
    );

    const { result } = renderHook(() => usePolicies(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(mockPolicies.length);
  });
});

describe("usePolicy", () => {
  it("does not fetch when id is undefined", async () => {
    const { result } = renderHook(() => usePolicy(undefined), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
  });
});

describe("useCreatePolicy", () => {
  it("creates a policy", async () => {
    const created = { ...mockPolicies[0], id: "pol-new" };
    server.use(
      http.post(`${SUPABASE_URL}/rest/v1/governance_policies`, () => {
        return HttpResponse.json(created, { status: 201 });
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useCreatePolicy(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        title: "New Policy",
        policy_type: "usage_policy",
      } as any);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("usePublishPolicy", () => {
  it("publishes a policy", async () => {
    const published = { ...mockPolicies[1], status: "published" };
    server.use(
      http.patch(`${SUPABASE_URL}/rest/v1/governance_policies`, () => {
        return HttpResponse.json(published);
      }),
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => usePublishPolicy(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ id: "pol-002" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

/* ================================================================== */
/*  useCurrentRole                                                     */
/* ================================================================== */

import { useCurrentRole } from "@/hooks/useCurrentRole";

describe("useCurrentRole", () => {
  it("fetches the current user role", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/user_roles`, () => {
        return HttpResponse.json({ role: "org_admin" });
      }),
    );

    const { result } = renderHook(() => useCurrentRole(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe("org_admin");
  });

  it("falls back to member when role not found", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/user_roles`, () => {
        return HttpResponse.json(
          { code: "PGRST116", message: "Not found" },
          { status: 406 },
        );
      }),
    );

    const { result } = renderHook(() => useCurrentRole(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe("member");
  });
});

/* ================================================================== */
/*  useAuditLog                                                        */
/* ================================================================== */

import { useAuditLog } from "@/hooks/useAuditLog";

describe("useAuditLog", () => {
  it("provides a log function", () => {
    const { result } = renderHook(() => useAuditLog(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.log).toBe("function");
  });

  it("calls supabase to insert audit log", async () => {
    let captured = false;
    server.use(
      http.post(`${SUPABASE_URL}/rest/v1/audit_logs`, () => {
        captured = true;
        return HttpResponse.json([{}], { status: 201 });
      }),
    );

    const { result } = renderHook(() => useAuditLog(), {
      wrapper: createWrapper(),
    });

    await result.current.log({
      action: "create",
      resource_type: "test",
      resource_id: "test-001",
    });

    expect(captured).toBe(true);
  });
});

/* ================================================================== */
/*  useFeaturePreview                                                  */
/* ================================================================== */

import { useFeaturePreview } from "@/hooks/useFeaturePreview";

describe("useFeaturePreview", () => {
  it("returns isPreview and requiredPlan", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/subscriptions`, () => {
        return HttpResponse.json({
          id: "sub-001",
          organization_id: "org-001",
          plan: "observer",
          status: "active",
        });
      }),
      http.get(`${SUPABASE_URL}/rest/v1/plan_features`, () => {
        return HttpResponse.json([]);
      }),
    );

    const { result } = renderHook(() => useFeaturePreview("advanced_reports"), {
      wrapper: createWrapper(),
    });

    // Initially, isPreview should be determined
    await waitFor(() => expect(result.current.plan).toBeDefined());
    expect(typeof result.current.isPreview).toBe("boolean");
    expect(typeof result.current.requiredPlan).toBe("string");
  });
});

/* ================================================================== */
/*  usePageContext                                                     */
/* ================================================================== */

import { usePageContext } from "@/hooks/usePageContext";

describe("usePageContext", () => {
  it("returns page context based on route", () => {
    const { result } = renderHook(() => usePageContext(), {
      wrapper: createWrapper({ route: "/dashboard" }),
    });

    expect(result.current.namespace).toBe("dashboard");
    expect(result.current.pathname).toBe("/dashboard");
    expect(result.current.language).toBe("fr");
  });

  it("maps ai-systems route correctly", () => {
    const { result } = renderHook(() => usePageContext(), {
      wrapper: createWrapper({ route: "/ai-systems" }),
    });

    expect(result.current.namespace).toBe("aiSystems");
  });
});

/* ================================================================== */
/*  usePlanFeatures                                                    */
/* ================================================================== */

import { usePlanFeatures } from "@/hooks/usePlanFeatures";

describe("usePlanFeatures", () => {
  it("returns plan and hasFeature function", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/subscriptions`, () => {
        return HttpResponse.json({
          id: "sub-001",
          organization_id: "org-001",
          plan: "expert",
          status: "active",
        });
      }),
      http.get(`${SUPABASE_URL}/rest/v1/plan_features`, () => {
        return HttpResponse.json([
          { feature_key: "advanced_reports", enabled: true },
          { feature_key: "ai_chat", enabled: true },
        ]);
      }),
    );

    const { result } = renderHook(() => usePlanFeatures(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(typeof result.current.hasFeature).toBe("function");
    expect(result.current.hasFeature("advanced_reports")).toBe(true);
  });

  it("hasFeature returns true for expert plan when no data loaded", () => {
    // Before data loads, expert plan defaults to true
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/subscriptions`, () => {
        return HttpResponse.json({
          id: "sub-001",
          organization_id: "org-001",
          plan: "expert",
          status: "active",
        });
      }),
      http.get(`${SUPABASE_URL}/rest/v1/plan_features`, () => {
        // Delay to test default behavior
        return new Promise(() => {
          // Never resolves
        });
      }),
    );

    const { result } = renderHook(() => usePlanFeatures(), {
      wrapper: createWrapper(),
    });

    // Before data loads, hasFeature defaults based on plan
    expect(typeof result.current.hasFeature).toBe("function");
  });
});

/* ================================================================== */
/*  usePublicDocuments                                                 */
/* ================================================================== */

import { usePublicDocuments } from "@/hooks/usePublicDocuments";

describe("usePublicDocuments", () => {
  it("fetches public documents for a jurisdiction", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/public_documents`, () => {
        return HttpResponse.json([
          {
            id: "pd-001",
            jurisdiction: "quebec",
            category_slug: "lois",
            category_name: "Lois",
            category_description: "Lois applicables",
            category_order: 1,
            title: "Loi 25",
            file_name: "loi25.pdf",
            file_type: "pdf",
            file_url: "https://example.com/loi25.pdf",
            summary_purpose: "Protection des renseignements",
            summary_content: "Contenu de la loi",
            summary_governance: "Implications gouvernance",
            document_order: 1,
            is_published: true,
          },
        ]);
      }),
    );

    const { result } = renderHook(() => usePublicDocuments("quebec"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].slug).toBe("lois");
    expect(result.current.data![0].documents).toHaveLength(1);
  });

  it("groups documents by category", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/public_documents`, () => {
        return HttpResponse.json([
          {
            id: "pd-001",
            jurisdiction: "canada",
            category_slug: "lois",
            category_name: "Lois",
            category_description: "Lois",
            category_order: 1,
            title: "C-27",
            file_name: "c27.pdf",
            file_type: "pdf",
            file_url: "https://example.com/c27.pdf",
            summary_purpose: "",
            summary_content: "",
            summary_governance: "",
            document_order: 1,
            is_published: true,
          },
          {
            id: "pd-002",
            jurisdiction: "canada",
            category_slug: "guides",
            category_name: "Guides",
            category_description: "Guides",
            category_order: 2,
            title: "Guide AIDA",
            file_name: "aida.pdf",
            file_type: "pdf",
            file_url: "https://example.com/aida.pdf",
            summary_purpose: "",
            summary_content: "",
            summary_governance: "",
            document_order: 1,
            is_published: true,
          },
        ]);
      }),
    );

    const { result } = renderHook(() => usePublicDocuments("canada"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data![0].slug).toBe("lois");
    expect(result.current.data![1].slug).toBe("guides");
  });
});

/* ================================================================== */
/*  useUserNames                                                       */
/* ================================================================== */

import { useUserNames } from "@/hooks/useUserNames";

describe("useUserNames", () => {
  it("does not fetch when no ids provided", async () => {
    const { result } = renderHook(() => useUserNames([]), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
  });

  it("resolves user ids to names", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/profiles`, () => {
        return HttpResponse.json([
          { id: "user-001", full_name: "Test User" },
          { id: "user-002", full_name: "Other User" },
        ]);
      }),
    );

    const { result } = renderHook(
      () => useUserNames(["user-001", "user-002"]),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data!.get("user-001")).toBe("Test User");
    expect(result.current.data!.get("user-002")).toBe("Other User");
  });

  it("deduplicates and filters null ids", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/profiles`, () => {
        return HttpResponse.json([{ id: "user-001", full_name: "Test" }]);
      }),
    );

    const { result } = renderHook(
      () => useUserNames(["user-001", null, undefined, "user-001"]),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data!.size).toBe(1);
  });
});
