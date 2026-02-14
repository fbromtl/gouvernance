import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/lib/auth";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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
            <Button className="w-full" onClick={() => navigate("/portail", { replace: true })}>
              Accéder au portail
            </Button>
          </div>
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
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
