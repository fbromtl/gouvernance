import "@testing-library/jest-dom/vitest";
import { server } from "./mocks/server";
import { cleanup } from "@testing-library/react";

// Polyfill ResizeObserver for jsdom (used by Radix UI components)
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
}

vi.stubEnv("VITE_SUPABASE_URL", "https://test.supabase.co");
vi.stubEnv("VITE_SUPABASE_ANON_KEY", "test-anon-key");

vi.mock("@/lib/auth", async () => {
  const { mockAuthValue } = await import("./mocks/utils");
  return {
    AuthProvider: ({ children }: { children: React.ReactNode }) => children,
    useAuth: () => mockAuthValue,
  };
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "fr", changeLanguage: vi.fn(), t: (key: string) => key },
  }),
  Trans: ({ children }: any) => children,
  initReactI18next: { type: "3rdParty", init: vi.fn() },
}));

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());
