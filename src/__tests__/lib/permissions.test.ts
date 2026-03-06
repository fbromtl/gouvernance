import { describe, it, expect } from "vitest";
import { ROLES, PERMISSIONS, hasPermission, type Role, type Permission } from "@/lib/permissions";

/* ------------------------------------------------------------------ */
/*  ROLES                                                              */
/* ------------------------------------------------------------------ */

describe("ROLES", () => {
  it("contains exactly 8 roles", () => {
    expect(ROLES).toHaveLength(8);
  });

  it("includes super_admin and member", () => {
    expect(ROLES).toContain("super_admin");
    expect(ROLES).toContain("member");
  });

  it("includes all expected roles", () => {
    const expected = [
      "super_admin",
      "org_admin",
      "compliance_officer",
      "risk_manager",
      "data_scientist",
      "ethics_officer",
      "auditor",
      "member",
    ];
    for (const role of expected) {
      expect(ROLES).toContain(role);
    }
  });
});

/* ------------------------------------------------------------------ */
/*  hasPermission                                                      */
/* ------------------------------------------------------------------ */

describe("hasPermission", () => {
  it("super_admin can manage_organization", () => {
    expect(hasPermission("super_admin", "manage_organization")).toBe(true);
  });

  it("org_admin can manage_organization", () => {
    expect(hasPermission("org_admin", "manage_organization")).toBe(true);
  });

  it("member cannot manage_organization", () => {
    expect(hasPermission("member", "manage_organization")).toBe(false);
  });

  it("all roles can view_ai_systems", () => {
    for (const role of ROLES) {
      expect(hasPermission(role, "view_ai_systems")).toBe(true);
    }
  });

  it("null role returns false", () => {
    expect(hasPermission(null, "manage_organization")).toBe(false);
    expect(hasPermission(null, "view_ai_systems")).toBe(false);
  });

  it("super_admin has every permission", () => {
    const allPermissions = Object.keys(PERMISSIONS) as Permission[];
    for (const perm of allPermissions) {
      expect(hasPermission("super_admin", perm)).toBe(true);
    }
  });

  it("member cannot manage_billing", () => {
    expect(hasPermission("member", "manage_billing")).toBe(false);
  });

  it("auditor can view_audit_trail but cannot manage_users", () => {
    expect(hasPermission("auditor", "view_audit_trail")).toBe(true);
    expect(hasPermission("auditor", "manage_users")).toBe(false);
  });

  it("compliance_officer can manage_compliance", () => {
    expect(hasPermission("compliance_officer", "manage_compliance")).toBe(true);
  });

  it("data_scientist cannot manage_compliance", () => {
    expect(hasPermission("data_scientist", "manage_compliance")).toBe(false);
  });
});
