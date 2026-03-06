describe("test infrastructure", () => {
  it("runs a basic test", () => {
    expect(1 + 1).toBe(2);
  });

  it("has access to env vars", () => {
    expect(import.meta.env.VITE_SUPABASE_URL).toBe("https://test.supabase.co");
  });
});
