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
