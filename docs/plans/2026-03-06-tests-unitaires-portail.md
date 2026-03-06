# Tests Unitaires Exhaustifs — Portail gouvernance.ai

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** ~440 tests couvrant la logique pure, les 34 hooks, les composants et les 30 pages du portail.

**Architecture:** Bottom-up avec Vitest + Testing Library + MSW. MSW intercepte les requetes PostgREST de Supabase au niveau reseau. Un wrapper `renderWithProviders` injecte QueryClient, Auth, Router et i18n pour chaque test.

**Tech Stack:** vitest, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, msw, @vitest/coverage-v8, jsdom

---

## Task 0: Setup infrastructure de test

**Files:**
- Create: `vitest.config.ts`
- Create: `src/__tests__/setup.ts`
- Create: `src/__tests__/mocks/server.ts`
- Create: `src/__tests__/mocks/handlers.ts`
- Create: `src/__tests__/mocks/fixtures/users.ts`
- Create: `src/__tests__/mocks/fixtures/index.ts`
- Create: `src/__tests__/mocks/utils.tsx`
- Modify: `package.json` (scripts + deps)
- Modify: `tsconfig.json` (include test types)

**Step 1: Install dependencies**

```bash
cd gouvernance
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom @vitest/coverage-v8 msw jsdom
```

**Step 2: Create vitest.config.ts**

```ts
import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/__tests__/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/lib/**", "src/hooks/**", "src/portail/**"],
      exclude: ["src/__tests__/**", "**/*.d.ts"],
    },
  },
});
```

**Step 3: Create MSW server — `src/__tests__/mocks/server.ts`**

```ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

**Step 4: Create base MSW handlers — `src/__tests__/mocks/handlers.ts`**

```ts
import { http, HttpResponse } from "msw";

const SUPABASE_URL = "https://test.supabase.co";

// Default handlers — return empty arrays for all tables
const tables = [
  "ai_systems", "incidents", "risk_assessments", "decisions",
  "compliance_assessments", "compliance_requirements", "remediation_actions",
  "bias_findings", "transparency_logs", "lifecycle_events",
  "documents", "monitoring_alerts", "monitoring_kpis",
  "data_sources", "vendors", "vendor_assessments",
  "agent_registry", "agent_traces", "agent_policies",
  "governance_roles", "committees", "policies",
  "members", "profiles", "organizations", "subscriptions",
  "notifications", "audit_log", "plan_features",
];

export const handlers = tables.flatMap((table) => [
  http.get(`${SUPABASE_URL}/rest/v1/${table}`, () => {
    return HttpResponse.json([]);
  }),
  http.post(`${SUPABASE_URL}/rest/v1/${table}`, () => {
    return HttpResponse.json([{}], { status: 201 });
  }),
  http.patch(`${SUPABASE_URL}/rest/v1/${table}`, () => {
    return HttpResponse.json([{}]);
  }),
  http.delete(`${SUPABASE_URL}/rest/v1/${table}`, () => {
    return HttpResponse.json([{}]);
  }),
]);

export { SUPABASE_URL };
```

**Step 5: Create fixtures — `src/__tests__/mocks/fixtures/users.ts`**

```ts
export const mockUser = {
  id: "user-001",
  email: "test@gouvernance.ai",
  app_metadata: {},
  user_metadata: { full_name: "Test User" },
  aud: "authenticated",
  created_at: "2025-01-01T00:00:00Z",
} as any;

export const mockProfile = {
  id: "user-001",
  full_name: "Test User",
  avatar_url: null,
  cgu_accepted: true,
  organization_id: "org-001",
  bio: null,
  linkedin_url: null,
  member_slug: "test-user",
  job_title: "Test",
  created_at: "2025-01-01T00:00:00Z",
};

export const mockOrganization = {
  id: "org-001",
  name: "Test Org",
  sector: "technology",
  size: "50-249",
  country: "CA",
};
```

**Step 6: Create fixtures index — `src/__tests__/mocks/fixtures/index.ts`**

```ts
export * from "./users";
```

**Step 7: Create renderWithProviders — `src/__tests__/mocks/utils.tsx`**

```tsx
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement, ReactNode } from "react";
import { mockUser, mockProfile } from "./fixtures/users";

// Mock auth context — override useAuth globally
const mockAuthValue = {
  user: mockUser,
  profile: mockProfile,
  loading: false,
  signInWithGoogle: vi.fn(),
  signInWithMicrosoft: vi.fn(),
  signInWithLinkedin: vi.fn(),
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  resetPassword: vi.fn(),
  updatePassword: vi.fn(),
  updateProfile: vi.fn(),
  signOut: vi.fn(),
  acceptCgu: vi.fn(),
  refreshProfile: vi.fn(),
};

// Re-export mockAuthValue so tests can customize it
export { mockAuthValue };

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface WrapperOptions {
  route?: string;
  queryClient?: QueryClient;
}

export function createWrapper(options: WrapperOptions = {}) {
  const { route = "/", queryClient = createTestQueryClient() } = options;

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

export function renderWithProviders(
  ui: ReactElement,
  options: WrapperOptions & Omit<RenderOptions, "wrapper"> = {},
) {
  const { route, queryClient, ...renderOptions } = options;
  const wrapper = createWrapper({ route, queryClient });
  return render(ui, { wrapper, ...renderOptions });
}

export { createTestQueryClient };
```

**Step 8: Create setup.ts — `src/__tests__/setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
import { server } from "./mocks/server";
import { cleanup } from "@testing-library/react";

// Mock env vars for Supabase
vi.stubEnv("VITE_SUPABASE_URL", "https://test.supabase.co");
vi.stubEnv("VITE_SUPABASE_ANON_KEY", "test-anon-key");

// Mock useAuth globally
vi.mock("@/lib/auth", async () => {
  const { mockAuthValue } = await import("./mocks/utils");
  return {
    AuthProvider: ({ children }: { children: React.ReactNode }) => children,
    useAuth: () => mockAuthValue,
  };
});

// Mock i18next — return key as value
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "fr", changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: any) => children,
  initReactI18next: { type: "3rdParty", init: vi.fn() },
}));

// MSW lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());
```

**Step 9: Add scripts to package.json**

Add to `"scripts"`:
```json
"test": "vitest",
"test:run": "vitest run",
"test:ui": "vitest --ui",
"test:coverage": "vitest run --coverage"
```

**Step 10: Update tsconfig.json — add vitest types**

Add `"vitest/globals"` to `compilerOptions.types` array if it exists, or add `"types": ["vitest/globals"]`.

**Step 11: Write a smoke test to verify setup — `src/__tests__/lib/smoke.test.ts`**

```ts
describe("test infrastructure", () => {
  it("runs a basic test", () => {
    expect(1 + 1).toBe(2);
  });

  it("has access to env vars", () => {
    expect(import.meta.env.VITE_SUPABASE_URL).toBe("https://test.supabase.co");
  });
});
```

**Step 12: Run and verify**

```bash
npx vitest run
```
Expected: 2 tests PASS.

**Step 13: Commit**

```bash
git add -A && git commit -m "test: setup infrastructure Vitest + MSW + Testing Library"
```

---

## Task 1: Tests logique pure — compliance-frameworks.ts

**Files:**
- Create: `src/__tests__/lib/compliance-frameworks.test.ts`
- Reference: `src/lib/compliance-frameworks.ts`

**Tests a ecrire (18 tests) :**

```ts
import {
  computeFrameworkScore,
  computeGlobalScore,
  getScoreColor,
  getScoreLabel,
  FRAMEWORK_CODES,
  FRAMEWORK_META,
  REQUIREMENTS_BY_FRAMEWORK,
  ALL_REQUIREMENTS,
  type ComplianceStatus,
} from "@/lib/compliance-frameworks";

describe("compliance-frameworks", () => {
  describe("FRAMEWORK_CODES", () => {
    it("contains 5 frameworks", () => {
      expect(FRAMEWORK_CODES).toHaveLength(5);
      expect(FRAMEWORK_CODES).toEqual(["loi25", "euai", "nist_ai_rmf", "iso42001", "rgpd"]);
    });
  });

  describe("FRAMEWORK_META", () => {
    it("has metadata for every framework code", () => {
      for (const code of FRAMEWORK_CODES) {
        expect(FRAMEWORK_META[code]).toBeDefined();
        expect(FRAMEWORK_META[code].labelFr).toBeTruthy();
        expect(FRAMEWORK_META[code].labelEn).toBeTruthy();
      }
    });
  });

  describe("REQUIREMENTS_BY_FRAMEWORK", () => {
    it("has requirements for every framework", () => {
      for (const code of FRAMEWORK_CODES) {
        expect(REQUIREMENTS_BY_FRAMEWORK[code].length).toBeGreaterThan(0);
      }
    });

    it("loi25 has 11 requirements", () => {
      expect(REQUIREMENTS_BY_FRAMEWORK.loi25).toHaveLength(11);
    });

    it("euai has 13 requirements", () => {
      expect(REQUIREMENTS_BY_FRAMEWORK.euai).toHaveLength(13);
    });

    it("all requirements have unique ids", () => {
      const ids = ALL_REQUIREMENTS.map((r) => r.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe("computeFrameworkScore", () => {
    it("returns 100 when all statuses are compliant", () => {
      const statuses: ComplianceStatus[] = Array(5).fill("compliant");
      const result = computeFrameworkScore(statuses);
      expect(result.score).toBe(100);
    });

    it("returns 50 when all statuses are partially_compliant", () => {
      const statuses: ComplianceStatus[] = Array(4).fill("partially_compliant");
      const result = computeFrameworkScore(statuses);
      expect(result.score).toBe(50);
    });

    it("returns 0 when all statuses are non_compliant", () => {
      const statuses: ComplianceStatus[] = Array(3).fill("non_compliant");
      const result = computeFrameworkScore(statuses);
      expect(result.score).toBe(0);
    });

    it("excludes not_applicable from calculation", () => {
      const statuses: ComplianceStatus[] = ["compliant", "not_applicable", "not_applicable"];
      const result = computeFrameworkScore(statuses);
      expect(result.score).toBe(100);
    });

    it("returns 0 when all statuses are not_applicable", () => {
      const statuses: ComplianceStatus[] = Array(3).fill("not_applicable");
      const result = computeFrameworkScore(statuses);
      expect(result.score).toBe(0);
    });

    it("calculates mixed statuses correctly", () => {
      const statuses: ComplianceStatus[] = ["compliant", "non_compliant"];
      const result = computeFrameworkScore(statuses);
      expect(result.score).toBe(50);
    });
  });

  describe("computeGlobalScore", () => {
    it("returns average of framework scores", () => {
      const scores = [
        { score: 100, total: 5, compliant: 5, partial: 0, nonCompliant: 0, notApplicable: 0 },
        { score: 50, total: 4, compliant: 2, partial: 0, nonCompliant: 2, notApplicable: 0 },
      ];
      expect(computeGlobalScore(scores)).toBe(75);
    });

    it("returns 0 for empty array", () => {
      expect(computeGlobalScore([])).toBe(0);
    });
  });

  describe("getScoreColor", () => {
    it("returns green for high scores", () => {
      expect(getScoreColor(90)).toBe("#10b981");
    });

    it("returns amber for medium scores", () => {
      expect(getScoreColor(55)).toBe("#f59e0b");
    });

    it("returns red for low scores", () => {
      expect(getScoreColor(20)).toBe("#ef4444");
    });
  });

  describe("getScoreLabel", () => {
    it("returns French label by default", () => {
      const label = getScoreLabel(90);
      expect(label).toBeTruthy();
      expect(typeof label).toBe("string");
    });

    it("returns English label when requested", () => {
      const label = getScoreLabel(90, "en");
      expect(label).toBeTruthy();
    });

    it("returns different labels for different score ranges", () => {
      const high = getScoreLabel(90);
      const low = getScoreLabel(20);
      expect(high).not.toBe(low);
    });
  });
});
```

**Run:** `npx vitest run src/__tests__/lib/compliance-frameworks.test.ts`

**Commit:** `git commit -m "test: compliance-frameworks — 18 tests logique pure"`

---

## Task 2: Tests logique pure — calculateRiskScoreClient

**Files:**
- Create: `src/__tests__/hooks/calculateRiskScoreClient.test.ts`
- Reference: `src/hooks/useAiSystems.ts:26-107`

**Tests a ecrire (15 tests) :**

```ts
import { calculateRiskScoreClient } from "@/hooks/useAiSystems";

describe("calculateRiskScoreClient", () => {
  describe("autonomy scoring (max 30)", () => {
    it("scores 30 for full_auto", () => {
      const result = calculateRiskScoreClient({ autonomy_level: "full_auto" });
      expect(result.score).toBeGreaterThanOrEqual(30);
    });

    it("scores 5 for human_in_command", () => {
      const result = calculateRiskScoreClient({ autonomy_level: "human_in_command" });
      expect(result.score).toBeLessThanOrEqual(10);
    });

    it("scores 0 for undefined autonomy", () => {
      const result = calculateRiskScoreClient({});
      expect(result.score).toBe(0);
    });
  });

  describe("data types scoring (max 25)", () => {
    it("scores max for sensitive_data", () => {
      const result = calculateRiskScoreClient({ data_types: ["sensitive_data"] });
      expect(result.score).toBeGreaterThanOrEqual(25);
    });

    it("takes max of multiple data types", () => {
      const result = calculateRiskScoreClient({ data_types: ["public_data", "sensitive_data"] });
      const singleResult = calculateRiskScoreClient({ data_types: ["sensitive_data"] });
      expect(result.score).toBe(singleResult.score);
    });
  });

  describe("population scoring (max 20)", () => {
    it("scores max for vulnerable population", () => {
      const result = calculateRiskScoreClient({ population_affected: ["vulnerable"] });
      expect(result.score).toBeGreaterThanOrEqual(20);
    });

    it("scores max for minors", () => {
      const result = calculateRiskScoreClient({ population_affected: ["minors"] });
      expect(result.score).toBeGreaterThanOrEqual(20);
    });
  });

  describe("sensitive domains scoring (max 25)", () => {
    it("scores max for biometric_id", () => {
      const result = calculateRiskScoreClient({ sensitive_domains: ["biometric_id"] });
      expect(result.score).toBeGreaterThanOrEqual(25);
    });

    it("scores max for justice", () => {
      const result = calculateRiskScoreClient({ sensitive_domains: ["justice"] });
      expect(result.score).toBeGreaterThanOrEqual(25);
    });
  });

  describe("risk levels", () => {
    it("returns critical for score >= 75", () => {
      const result = calculateRiskScoreClient({
        autonomy_level: "full_auto",
        data_types: ["sensitive_data"],
        population_affected: ["vulnerable"],
        sensitive_domains: ["biometric_id"],
      });
      expect(result.level).toBe("critical");
      expect(result.score).toBeGreaterThanOrEqual(75);
    });

    it("returns minimal for score < 25", () => {
      const result = calculateRiskScoreClient({
        autonomy_level: "human_in_command",
        data_types: ["public_data"],
      });
      expect(result.level).toBe("minimal");
      expect(result.score).toBeLessThan(25);
    });

    it("caps score at 100", () => {
      const result = calculateRiskScoreClient({
        autonomy_level: "full_auto",
        data_types: ["sensitive_data"],
        population_affected: ["vulnerable"],
        sensitive_domains: ["biometric_id"],
      });
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe("edge cases", () => {
    it("handles empty data object", () => {
      const result = calculateRiskScoreClient({});
      expect(result.score).toBe(0);
      expect(result.level).toBe("minimal");
    });

    it("handles empty arrays", () => {
      const result = calculateRiskScoreClient({
        data_types: [],
        population_affected: [],
        sensitive_domains: [],
      });
      expect(result.score).toBe(0);
    });
  });
});
```

**Run:** `npx vitest run src/__tests__/hooks/calculateRiskScoreClient.test.ts`

**Commit:** `git commit -m "test: calculateRiskScoreClient — 15 tests scoring risque"`

---

## Task 3: Tests logique pure — calculateAssessmentScore

**Files:**
- Create: `src/__tests__/hooks/calculateAssessmentScore.test.ts`
- Reference: `src/hooks/useRiskAssessments.ts:23-144`

**Tests a ecrire (20 tests) :**

```ts
import { calculateAssessmentScore } from "@/hooks/useRiskAssessments";

describe("calculateAssessmentScore", () => {
  describe("section A — Impact (max 25)", () => {
    it("scores 15 for direct impact", () => {
      const result = calculateAssessmentScore({ q1: "oui_direct" });
      expect(result.score).toBeGreaterThanOrEqual(15);
    });

    it("scores 10 for non-reversible impact", () => {
      const result = calculateAssessmentScore({ q2: "non" });
      expect(result.score).toBeGreaterThanOrEqual(10);
    });

    it("scores cumulative for rights affected", () => {
      const single = calculateAssessmentScore({ q4: ["privacy"] });
      const multi = calculateAssessmentScore({ q4: ["privacy", "dignity"] });
      expect(multi.score).toBeGreaterThan(single.score);
    });
  });

  describe("section B — EU AI Act (max 20)", () => {
    it("flags prohibited when q5 is oui", () => {
      const result = calculateAssessmentScore({ q5: "oui" });
      expect(result.isProhibited).toBe(true);
      expect(result.level).toBe("prohibited");
    });

    it("does not flag prohibited when q5 is non", () => {
      const result = calculateAssessmentScore({ q5: "non" });
      expect(result.isProhibited).toBe(false);
    });

    it("scores 20 for high-risk categories", () => {
      const result = calculateAssessmentScore({ q6: ["biometric", "critical_infra"] });
      expect(result.score).toBeGreaterThanOrEqual(20);
    });
  });

  describe("section C — Data & Privacy (max 20)", () => {
    it("scores max for sensitive personal data", () => {
      const result = calculateAssessmentScore({ q8: "oui_sensibles" });
      expect(result.score).toBeGreaterThanOrEqual(20);
    });

    it("scores for cross-border data transfers", () => {
      const result = calculateAssessmentScore({ q9: "oui_hors_canada" });
      expect(result.score).toBeGreaterThanOrEqual(10);
    });
  });

  describe("section D — Bias & Fairness (max 15)", () => {
    it("scores for bias risk", () => {
      const result = calculateAssessmentScore({ q11: "oui" });
      expect(result.score).toBeGreaterThanOrEqual(10);
    });

    it("scores for lack of bias testing", () => {
      const result = calculateAssessmentScore({ q12: "non" });
      expect(result.score).toBeGreaterThanOrEqual(10);
    });
  });

  describe("section E — Transparency (max 10)", () => {
    it("scores for non-explainable system", () => {
      const result = calculateAssessmentScore({ q14: "non" });
      expect(result.score).toBeGreaterThanOrEqual(10);
    });
  });

  describe("section F — Human oversight (max 10)", () => {
    it("scores for no human review", () => {
      const result = calculateAssessmentScore({ q16: "jamais" });
      expect(result.score).toBeGreaterThanOrEqual(10);
    });
  });

  describe("risk levels", () => {
    it("returns critical for score >= 76", () => {
      const result = calculateAssessmentScore({
        q1: "oui_direct", q2: "non", q3: "oui",
        q4: ["dignity", "non_discrimination", "employment"],
        q6: ["biometric"], q8: "oui_sensibles", q9: "oui_hors_canada",
        q11: "oui", q12: "non", q14: "non", q16: "jamais", q17: "non",
      });
      expect(result.level).toBe("critical");
    });

    it("returns minimal for very low score", () => {
      const result = calculateAssessmentScore({});
      expect(result.level).toBe("minimal");
      expect(result.score).toBeLessThan(26);
    });

    it("caps score at 100", () => {
      const result = calculateAssessmentScore({
        q1: "oui_direct", q2: "non", q3: "oui",
        q4: ["dignity", "non_discrimination", "privacy", "employment", "access_services"],
        q5: "non", q6: ["biometric", "critical_infra"], q7: "oui",
        q8: "oui_sensibles", q9: "oui_hors_canada", q10: "non_requis",
        q11: "oui", q12: "non", q13: "oui",
        q14: "non", q15: "non", q16: "jamais", q17: "non",
      });
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe("edge cases", () => {
    it("handles empty answers", () => {
      const result = calculateAssessmentScore({});
      expect(result.score).toBe(0);
      expect(result.level).toBe("minimal");
      expect(result.isProhibited).toBe(false);
    });

    it("handles partial answers", () => {
      const result = calculateAssessmentScore({ q1: "oui_direct" });
      expect(result.score).toBeGreaterThan(0);
      expect(result.isProhibited).toBe(false);
    });
  });
});
```

**Run:** `npx vitest run src/__tests__/hooks/calculateAssessmentScore.test.ts`

**Commit:** `git commit -m "test: calculateAssessmentScore — 20 tests scoring evaluation"`

---

## Task 4: Tests logique pure — permissions

**Files:**
- Create: `src/__tests__/lib/permissions.test.ts`
- Reference: `src/lib/permissions.ts`

**Tests a ecrire (10 tests) :**

```ts
import { hasPermission, ROLES, type Role, type Permission } from "@/lib/permissions";

describe("permissions", () => {
  describe("ROLES", () => {
    it("contains 8 roles", () => {
      expect(ROLES).toHaveLength(8);
    });

    it("includes super_admin and member", () => {
      expect(ROLES).toContain("super_admin");
      expect(ROLES).toContain("member");
    });
  });

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

    it("returns false for null role", () => {
      expect(hasPermission(null, "view_ai_systems")).toBe(false);
    });

    it("super_admin has all permissions", () => {
      const permissions: Permission[] = [
        "manage_organization", "view_ai_systems", "manage_ai_systems",
      ];
      for (const perm of permissions) {
        expect(hasPermission("super_admin", perm)).toBe(true);
      }
    });
  });
});
```

**Run:** `npx vitest run src/__tests__/lib/permissions.test.ts`

**Commit:** `git commit -m "test: permissions — 10 tests controle acces"`

---

## Task 5: Fixtures completes + MSW handlers etendus

**Files:**
- Create: `src/__tests__/mocks/fixtures/ai-systems.ts`
- Create: `src/__tests__/mocks/fixtures/incidents.ts`
- Create: `src/__tests__/mocks/fixtures/risks.ts`
- Create: `src/__tests__/mocks/fixtures/compliance.ts`
- Create: `src/__tests__/mocks/fixtures/decisions.ts`
- Create: `src/__tests__/mocks/fixtures/governance.ts`
- Create: `src/__tests__/mocks/fixtures/vendors.ts`
- Create: `src/__tests__/mocks/fixtures/documents.ts`
- Create: `src/__tests__/mocks/fixtures/monitoring.ts`
- Create: `src/__tests__/mocks/fixtures/agents.ts`
- Update: `src/__tests__/mocks/fixtures/index.ts`
- Update: `src/__tests__/mocks/handlers.ts`

Chaque fichier de fixtures doit contenir 2-3 objets representatifs avec des champs realistes et des references croisees coherentes (meme org_id, user_id, etc).

**Commit:** `git commit -m "test: fixtures completes et handlers MSW pour tous les modules"`

---

## Task 6: Tests hooks — useAiSystems

**Files:**
- Create: `src/__tests__/hooks/useAiSystems.test.ts`

**Pattern pour tous les hooks :**

```ts
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { SUPABASE_URL } from "../mocks/handlers";
import { createWrapper } from "../mocks/utils";
import { useAiSystems, useAiSystem, useCreateAiSystem, useUpdateAiSystem } from "@/hooks/useAiSystems";
import { mockAiSystems } from "../mocks/fixtures/ai-systems";

describe("useAiSystems", () => {
  it("fetches ai systems for current org", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/ai_systems`, () => {
        return HttpResponse.json(mockAiSystems);
      }),
    );
    const { result } = renderHook(() => useAiSystems(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.data).toHaveLength(mockAiSystems.length));
  });

  it("returns empty array when no data", async () => {
    const { result } = renderHook(() => useAiSystems(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.data).toEqual([]));
  });

  it("does not fetch without organization_id", async () => {
    // Override auth to have no org
    // ...test with null org_id
  });
});

describe("useCreateAiSystem", () => {
  it("creates an ai system and invalidates cache", async () => {
    server.use(
      http.post(`${SUPABASE_URL}/rest/v1/ai_systems`, () => {
        return HttpResponse.json([{ id: "new-system" }], { status: 201 });
      }),
    );
    const { result } = renderHook(() => useCreateAiSystem(), { wrapper: createWrapper() });
    await result.current.mutateAsync({ name: "Test System", type: "classification" });
    // Verify mutation succeeded
  });
});
```

**Repeter ce pattern pour les 34 hooks :**

| Hook | Tests | Priorite |
|------|-------|----------|
| useAiSystems | 8 | P1 |
| useRiskAssessments | 8 | P1 |
| useCompliance | 10 | P1 |
| useIncidents | 8 | P1 |
| useDecisions | 10 | P1 |
| useBiasFindings | 6 | P2 |
| useTransparency | 5 | P2 |
| useLifecycleEvents | 5 | P2 |
| useDocuments | 6 | P2 |
| useMonitoring | 6 | P2 |
| useData | 5 | P2 |
| useVendors | 6 | P2 |
| useAgentRegistry | 5 | P2 |
| useAgentTraces | 4 | P2 |
| useMembers | 4 | P3 |
| useOrgMembers | 4 | P3 |
| useOrganization | 4 | P3 |
| useSubscription | 4 | P3 |
| usePermissions | 4 | P3 |
| useNotifications | 4 | P3 |
| useDiagnostic | 5 | P3 |
| useAiChat | 4 | P3 |
| usePublicChat | 4 | P3 |
| useAdminMutations | 5 | P3 |
| useGovernanceRoles | 4 | P3 |
| useCommittees | 4 | P3 |
| usePolicies | 4 | P3 |
| useCurrentRole | 3 | P3 |
| useAuditLog | 3 | P3 |
| useFeaturePreview | 3 | P3 |
| usePageContext | 3 | P3 |
| usePlanFeatures | 3 | P3 |
| usePublicDocuments | 3 | P3 |
| useUserNames | 3 | P3 |

**Commit atomique par hook ou par groupe de hooks P1/P2/P3.**

---

## Task 7: Tests composants — Dashboard widgets

**Files:** Create test file per component in `src/__tests__/components/dashboard/`

**Pattern :**

```tsx
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../mocks/utils";
import { ComplianceRadarChart } from "@/portail/components/dashboard/ComplianceRadarChart";

describe("ComplianceRadarChart", () => {
  const mockScores = [
    { framework: "loi25", score: 80, total: 11, compliant: 8, partial: 2, nonCompliant: 1, notApplicable: 0 },
    { framework: "euai", score: 60, total: 13, compliant: 6, partial: 4, nonCompliant: 3, notApplicable: 0 },
  ];

  it("renders without crashing", () => {
    renderWithProviders(<ComplianceRadarChart frameworks={mockScores} />);
  });

  it("displays global score", () => {
    renderWithProviders(<ComplianceRadarChart frameworks={mockScores} />);
    // Check score element is rendered
  });

  it("renders empty state when no data", () => {
    renderWithProviders(<ComplianceRadarChart frameworks={[]} />);
  });
});
```

**Repeter pour :** ComplianceRadarChart, RiskDistributionChart, IncidentTimelineChart, SystemsByTypeChart, TopRiskSystemsTable, PendingActionsWidget, ReviewsDueWidget, RecentDecisionsWidget, BiasDebtWidget, AgentActivityWidget, DiagnosticResultWidget.

**Plus :** PortalCard, PortalKPI, FloatingChat, AiChatPanel, CreateAgentDialog, FileCard, DropZone, TemplateCard.

**Commit:** par groupe (dashboard/, drive/, shared/, chat/).

---

## Task 8: Tests pages — Toutes les pages portail

**Files:** Create test file per page in `src/__tests__/pages/`

**Pattern pour chaque page :**

```tsx
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { SUPABASE_URL } from "../mocks/handlers";
import { renderWithProviders } from "../mocks/utils";
import DashboardPage from "@/portail/pages/DashboardPage";

describe("DashboardPage", () => {
  it("renders without crashing", () => {
    renderWithProviders(<DashboardPage />, { route: "/dashboard" });
  });

  it("displays loading state initially", () => {
    renderWithProviders(<DashboardPage />, { route: "/dashboard" });
    // Loading skeletons or spinner should be visible
  });

  it("displays dashboard widgets with data", async () => {
    server.use(
      http.get(`${SUPABASE_URL}/rest/v1/ai_systems`, () => {
        return HttpResponse.json([{ id: "1", name: "System A", risk_score: 75 }]);
      }),
    );
    renderWithProviders(<DashboardPage />, { route: "/dashboard" });
    await waitFor(() => {
      // Verify content renders
    });
  });

  it("toggles demo mode", async () => {
    renderWithProviders(<DashboardPage />, { route: "/dashboard" });
    const toggle = screen.queryByRole("switch");
    if (toggle) {
      await userEvent.click(toggle);
    }
  });
});
```

**Pages a tester (30) — par ordre de complexite croissante :**

| Groupe | Pages | Tests |
|--------|-------|-------|
| Simples (< 300 LOC) | ConditionsPage, OnboardingPage, RoadmapPage, BibliothecPage, MembresPage | ~20 |
| Listes (300-600 LOC) | AiSystemsListPage, RiskAssessmentListPage, IncidentListPage, AgentsPage, AgentTracesPage, DecisionsPage | ~30 |
| Detail (400-700 LOC) | AiSystemDetailPage, RiskAssessmentDetailPage, IncidentDetailPage, ProfilPage, AdminPage, BillingPage | ~30 |
| Formulaires (400-1000 LOC) | AiSystemWizardPage, RiskAssessmentWizardPage, IncidentReportPage, VeillePage | ~25 |
| Complexes (700+ LOC) | DashboardPage, GovernancePage, CompliancePage, BiasPage, TransparencyPage, LifecyclePage, DocumentsPage, MonitoringPage, DataPage, VendorsPage | ~45 |

**Commit atomique par groupe.**

---

## Task 9: Coverage report + CI

**Step 1:** Run `npx vitest run --coverage` et verifier les seuils.

**Step 2:** Ajouter seuils dans vitest.config.ts :

```ts
coverage: {
  // ...existing
  thresholds: {
    statements: 80,
    branches: 75,
    functions: 85,
    lines: 80,
  },
},
```

**Step 3:** Commit final.

```bash
git commit -m "test: couverture exhaustive portail — ~440 tests"
```
