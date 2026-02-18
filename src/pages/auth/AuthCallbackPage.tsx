import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

/**
 * Handles the OAuth/email callback after a provider redirect.
 *
 * With detectSessionInUrl: false, this page is the ONLY place where
 * the PKCE code exchange happens. This avoids race conditions where
 * the auto-detection consumes the code verifier before React mounts.
 *
 * Flow:
 *   1. Supabase redirects here with ?code=...
 *   2. We manually call exchangeCodeForSession(code)
 *   3. AuthProvider picks up the session via onAuthStateChange
 *   4. Once useAuth() shows a user, we redirect to /portail
 *
 * This page must NOT be inside a ProtectedRoute.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const exchangeStarted = useRef(false);

  // Step 1: Exchange the PKCE code for a session
  useEffect(() => {
    if (exchangeStarted.current) return;

    if (!supabaseConfigured) {
      navigate("/", { replace: true });
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const errorParam =
      params.get("error_description") || params.get("error");

    if (errorParam) {
      navigate(
        "/connexion?error=" + encodeURIComponent(errorParam),
        { replace: true }
      );
      return;
    }

    if (code) {
      exchangeStarted.current = true;
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ error }) => {
          if (error) {
            console.error("Code exchange failed:", error.message);
            navigate(
              "/connexion?error=" + encodeURIComponent(error.message),
              { replace: true }
            );
          }
        })
        .catch((err: unknown) => {
          const msg =
            err instanceof Error ? err.message : "Erreur réseau lors de l'authentification";
          console.error("Code exchange network error:", msg);
          navigate(
            "/connexion?error=" + encodeURIComponent(msg),
            { replace: true }
          );
        });
    }
  }, [navigate]);

  // Step 2: Redirect once the AuthProvider has the user in state
  useEffect(() => {
    if (!loading && user) {
      navigate("/portail", { replace: true });
    }
  }, [user, loading, navigate]);

  // Step 3: Timeout — if nothing happens after 15s, go to login
  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate("/connexion", { replace: true });
    }, 15_000);
    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-purple border-t-transparent" />
        <span className="text-sm text-muted-foreground">
          Authentification en cours...
        </span>
      </div>
    </div>
  );
}
