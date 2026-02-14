import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await resetPassword(email);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error ?? "Erreur lors de l'envoi.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- Success state -------------------------------------- */

  if (success) {
    return (
      <>
        <SEO title="Mot de passe oublié" description="Réinitialisez votre mot de passe." noindex={true} />
        <div className="min-h-[calc(100dvh-120px)] flex items-center justify-center p-4 bg-gradient-to-br from-muted/30 via-background to-muted/30">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border/50 bg-card shadow-xl shadow-black/5 p-8 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100 mb-5">
              <CheckCircle className="size-7 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">
              Courriel envoyé
            </h1>
            <p className="text-sm text-muted-foreground mb-1">
              Si un compte existe pour
            </p>
            <p className="text-sm font-semibold text-foreground mb-4">
              {email}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              vous recevrez un lien pour réinitialiser votre mot de passe.
              Vérifiez aussi votre dossier de courriels indésirables.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/connexion">Retour à la connexion</Link>
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
      <SEO title="Mot de passe oublié" description="Réinitialisez votre mot de passe." noindex={true} />
      <div className="min-h-[calc(100dvh-120px)] flex items-center justify-center p-4 bg-gradient-to-br from-muted/30 via-background to-muted/30">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img src="/logo.svg" alt="Gouvernance IA" className="h-10 w-auto mx-auto" />
          </Link>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground">
            Mot de passe oublié
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Entrez votre courriel pour recevoir un lien de réinitialisation
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border/50 bg-card shadow-xl shadow-black/5 overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-foreground mb-1.5">
                  Courriel
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@entreprise.ca"
                    autoFocus
                    className="w-full h-11 rounded-xl border border-border/60 bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple transition-colors"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 gap-2"
                disabled={submitting}
              >
                {submitting ? "Envoi en cours..." : "Envoyer le lien"}
                {!submitting && <ArrowRight className="size-4" />}
              </Button>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-border/40 bg-muted/20 px-6 py-4 sm:px-8 text-center">
            <Link
              to="/connexion"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
