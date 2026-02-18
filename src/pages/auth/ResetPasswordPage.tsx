import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/lib/auth";
import { supabase, supabaseConfigured } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { updatePassword, user } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const exchangeStarted = useRef(false);

  // Exchange the PKCE code for a session on mount
  useEffect(() => {
    if (exchangeStarted.current) return;

    if (!supabaseConfigured) {
      setSessionLoading(false);
      setError("Supabase n'est pas configuré.");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    // Also handle hash-based tokens (non-PKCE fallback)
    const hash = window.location.hash;

    if (code) {
      exchangeStarted.current = true;
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ error: exchangeError }) => {
          if (exchangeError) {
            setError(exchangeError.message);
          } else {
            setSessionReady(true);
          }
          setSessionLoading(false);
        })
        .catch(() => {
          setError("Erreur réseau lors de la vérification du lien.");
          setSessionLoading(false);
        });
    } else if (hash && hash.includes("access_token")) {
      // Handle hash-based recovery (non-PKCE)
      // Supabase auto-detects this if detectSessionInUrl is true,
      // but since we disabled it, we need to handle it manually
      exchangeStarted.current = true;
      // Give Supabase a moment to process the hash
      const checkSession = () => {
        supabase.auth.getSession().then(({ data }) => {
          if (data.session) {
            setSessionReady(true);
            setSessionLoading(false);
          } else {
            // Retry once after a short delay
            setTimeout(() => {
              supabase.auth.getSession().then(({ data: retryData }) => {
                if (retryData.session) {
                  setSessionReady(true);
                } else {
                  setError("Le lien de réinitialisation est invalide ou a expiré.");
                }
                setSessionLoading(false);
              });
            }, 1000);
          }
        });
      };
      checkSession();
    } else if (user) {
      // User already has a session (e.g., navigated here directly while logged in)
      setSessionReady(true);
      setSessionLoading(false);
    } else {
      setError("Lien de réinitialisation invalide. Veuillez redemander un nouveau lien.");
      setSessionLoading(false);
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await updatePassword(password);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error ?? "Erreur lors de la mise à jour.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- Success -------------------------------------------- */

  if (success) {
    return (
      <>
        <SEO title="Nouveau mot de passe" description="Choisissez un nouveau mot de passe." noindex={true} />
        <div className="min-h-[calc(100dvh-120px)] flex items-center justify-center p-4 bg-gradient-to-br from-muted/30 via-background to-muted/30">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border/50 bg-card shadow-xl shadow-black/5 p-8 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100 mb-5">
              <CheckCircle className="size-7 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">
              Mot de passe mis à jour
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              Votre mot de passe a été modifié avec succès. Vous pouvez
              maintenant accéder à votre portail.
            </p>
            <Button className="w-full" onClick={() => navigate("/dashboard", { replace: true })}>
              Accéder au portail
            </Button>
          </div>
        </div>
      </div>
      </>
    );
  }

  /* ---------- Loading -------------------------------------------- */

  if (sessionLoading) {
    return (
      <>
        <SEO title="Nouveau mot de passe" description="Choisissez un nouveau mot de passe." noindex={true} />
        <div className="min-h-[calc(100dvh-120px)] flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-purple border-t-transparent" />
            <span className="text-sm text-muted-foreground">
              Vérification du lien...
            </span>
          </div>
        </div>
      </>
    );
  }

  /* ---------- Form ----------------------------------------------- */

  return (
    <>
      <SEO title="Nouveau mot de passe" description="Choisissez un nouveau mot de passe." noindex={true} />
      <div className="min-h-[calc(100dvh-120px)] flex items-center justify-center p-4 bg-gradient-to-br from-muted/30 via-background to-muted/30">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img src="/logo.svg" alt="Gouvernance IA" className="h-10 w-auto mx-auto" />
          </Link>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground">
            Nouveau mot de passe
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choisissez un nouveau mot de passe sécurisé
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border/50 bg-card shadow-xl shadow-black/5 overflow-hidden">
          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {!sessionReady && !sessionLoading ? (
              /* Invalid or expired link */
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Le lien de réinitialisation est invalide ou a expiré.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/mot-de-passe-oublie">Demander un nouveau lien</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New password */}
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-foreground mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 caractères"
                      autoFocus
                      className="w-full h-11 rounded-xl border border-border/60 bg-background pl-10 pr-11 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm */}
                <div>
                  <label htmlFor="confirm-new-password" className="block text-sm font-medium text-foreground mb-1.5">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      id="confirm-new-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Retapez le mot de passe"
                      className="w-full h-11 rounded-xl border border-border/60 bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple transition-colors"
                    />
                    {confirmPassword && password === confirmPassword && (
                      <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-green-500" />
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 gap-2"
                  disabled={submitting}
                >
                  {submitting ? "Mise à jour..." : "Mettre à jour le mot de passe"}
                  {!submitting && <ArrowRight className="size-4" />}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
