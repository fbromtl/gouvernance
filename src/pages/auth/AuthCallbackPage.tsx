import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, supabaseConfigured } from "@/lib/supabase";

/**
 * Handles the OAuth callback after a provider redirect (Google, etc.).
 *
 * The Supabase client (with detectSessionInUrl: true) automatically detects
 * the ?code= parameter and exchanges it for a session via PKCE.
 *
 * This page simply waits for that exchange to complete, then redirects
 * to /portail. It must NOT call exchangeCodeForSession() manually, because
 * the auto-detection already consumes the PKCE code verifier.
 *
 * This page must NOT be inside a ProtectedRoute to avoid
 * premature redirects that would lose the auth code.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    if (!supabaseConfigured) {
      navigate("/", { replace: true });
      return;
    }

    // Check for error passed back by Supabase
    const params = new URLSearchParams(window.location.search);
    const errorParam =
      params.get("error_description") || params.get("error");

    if (errorParam) {
      console.error("Auth callback error:", errorParam);
      navigate(
        "/connexion?error=" + encodeURIComponent(errorParam),
        { replace: true }
      );
      return;
    }

    // Listen for the session to be established by the automatic PKCE exchange
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        subscription.unsubscribe();
        navigate("/portail", { replace: true });
      }
    });

    // Also check if the session is already available (exchange may have completed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        subscription.unsubscribe();
        navigate("/portail", { replace: true });
      }
    });

    // Timeout: if no session after 10s, redirect to login
    const timeout = setTimeout(() => {
      subscription.unsubscribe();
      navigate("/connexion", { replace: true });
    }, 10_000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
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
