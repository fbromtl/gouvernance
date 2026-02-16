import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, supabaseConfigured } from "@/lib/supabase";

/**
 * Handles the OAuth callback after a provider redirect (Google, etc.).
 *
 * Flow (PKCE):
 *   1. Supabase redirects here with ?code=... in the URL
 *   2. We exchange the code for a session
 *   3. Once the session is established, we redirect to /portail
 *
 * Flow (Implicit):
 *   1. Supabase redirects here with #access_token=... in the URL hash
 *   2. The Supabase client detects the hash automatically
 *   3. onAuthStateChange fires → we redirect to /portail
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

    async function handleCallback() {
      if (!supabaseConfigured) {
        navigate("/", { replace: true });
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const errorParam = params.get("error_description");

      if (errorParam) {
        console.error("Auth callback error:", errorParam);
        navigate("/connexion?error=" + encodeURIComponent(errorParam), {
          replace: true,
        });
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("Code exchange failed:", error.message);
          navigate("/connexion?error=" + encodeURIComponent(error.message), {
            replace: true,
          });
          return;
        }
      }

      // For implicit flow or after successful PKCE exchange,
      // wait briefly for onAuthStateChange to fire, then redirect
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        navigate("/portail", { replace: true });
      } else {
        // Fallback: wait a moment for the session to be established
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session) {
            subscription.unsubscribe();
            navigate("/portail", { replace: true });
          }
        });

        // Timeout: if no session after 10s, redirect to login
        setTimeout(() => {
          subscription.unsubscribe();
          navigate("/connexion", { replace: true });
        }, 10_000);
      }
    }

    handleCallback();
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
