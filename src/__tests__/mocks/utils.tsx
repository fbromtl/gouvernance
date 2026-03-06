import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement, ReactNode } from "react";
import { mockUser, mockProfile } from "./fixtures/users";

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
