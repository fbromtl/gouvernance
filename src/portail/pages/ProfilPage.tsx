import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Calendar,
  Shield,
  ShieldCheck,
  LogOut,
  Save,
  CheckCircle,
  AlertCircle,
  Camera,
  Globe,
  KeyRound,
  Chrome,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export default function ProfilPage() {
  const navigate = useNavigate();
  const { user, profile, updateProfile, signOut } = useAuth();

  const [fullName, setFullName] = useState(
    profile?.full_name ?? user?.user_metadata?.full_name ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  /* ---------- derived values -------------------------------------- */

  const email = user?.email ?? "";

  const avatarUrl =
    profile?.avatar_url ??
    user?.user_metadata?.avatar_url ??
    user?.user_metadata?.picture ??
    null;

  const initials = (profile?.full_name ?? user?.user_metadata?.full_name ?? "?")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const provider =
    user?.app_metadata?.provider ??
    user?.app_metadata?.providers?.[0] ??
    "email";

  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("fr-CA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const lastSignIn = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleDateString("fr-CA", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const isGoogleProvider = provider === "google";

  /* ---------- handlers -------------------------------------------- */

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    const result = await updateProfile({ full_name: fullName.trim() || null });
    setSaving(false);
    if (result.success) {
      setFeedback({ type: "success", message: "Profil mis a jour avec succes." });
    } else {
      setFeedback({
        type: "error",
        message: result.error ?? "Erreur lors de la sauvegarde.",
      });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  /* ---------- render ---------------------------------------------- */

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Mon profil
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerez vos informations personnelles et vos preferences de compte.
        </p>
      </div>

      {/* ============================================================ */}
      {/*  AVATAR + IDENTITY CARD                                       */}
      {/* ============================================================ */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-brand-purple via-brand-purple-dark to-[#1e1a30] relative">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        </div>

        {/* Avatar + info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            {/* Avatar */}
            <div className="relative group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="size-24 rounded-2xl object-cover border-4 border-card shadow-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex size-24 items-center justify-center rounded-2xl bg-brand-purple/10 text-brand-purple text-2xl font-bold border-4 border-card shadow-lg">
                  {initials}
                </div>
              )}
              <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-default">
                <Camera className="size-5 text-white" />
              </div>
            </div>

            {/* Name + badges */}
            <div className="flex-1 min-w-0 sm:pb-1">
              <h2 className="text-xl font-bold text-foreground truncate">
                {profile?.full_name ?? user?.user_metadata?.full_name ?? "Utilisateur"}
              </h2>
              <p className="text-sm text-muted-foreground truncate">{email}</p>
            </div>

            {/* Provider badge */}
            <div className="sm:pb-1">
              {isGoogleProvider ? (
                <Badge
                  variant="secondary"
                  className="gap-1.5 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                >
                  <Chrome className="size-3" />
                  Google
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1.5">
                  <Mail className="size-3" />
                  Email
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  PERSONAL INFORMATION                                         */}
      {/* ============================================================ */}
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-purple/10">
            <User className="size-5 text-brand-purple" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              Informations personnelles
            </h3>
            <p className="text-sm text-muted-foreground">
              Modifiez votre nom affiche dans le portail.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Full name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Nom complet</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Votre nom complet"
              className="h-11"
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Courriel
              <span className="text-xs text-muted-foreground ml-1.5 font-normal">
                (non modifiable)
              </span>
            </Label>
            <Input
              id="email"
              value={email}
              readOnly
              disabled
              className="h-11 bg-muted/50"
            />
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className={cn(
              "flex items-center gap-2 mt-4 p-3 rounded-xl text-sm",
              feedback.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            )}
          >
            {feedback.type === "success" ? (
              <CheckCircle className="size-4 shrink-0" />
            ) : (
              <AlertCircle className="size-4 shrink-0" />
            )}
            {feedback.message}
          </div>
        )}

        {/* Save button */}
        <div className="flex justify-end mt-6">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 px-6"
          >
            <Save className="size-4" />
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  ACCOUNT DETAILS                                              */}
      {/* ============================================================ */}
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-purple/10">
            <Shield className="size-5 text-brand-purple" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              Details du compte
            </h3>
            <p className="text-sm text-muted-foreground">
              Informations sur votre compte et votre connexion.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Provider */}
          <InfoRow
            icon={isGoogleProvider ? Chrome : KeyRound}
            label="Methode de connexion"
            value={
              isGoogleProvider
                ? "Google (" + email + ")"
                : "Courriel et mot de passe"
            }
          />

          {/* User ID */}
          <InfoRow
            icon={Globe}
            label="Identifiant"
            value={user?.id ?? "—"}
            mono
          />

          {/* Created */}
          <InfoRow
            icon={Calendar}
            label="Membre depuis"
            value={createdAt}
          />

          {/* Last sign in */}
          <InfoRow
            icon={Calendar}
            label="Derniere connexion"
            value={lastSignIn}
          />

          {/* CGU */}
          <InfoRow
            icon={ShieldCheck}
            label="Conditions d'utilisation"
            value={
              profile?.cgu_accepted ? "Acceptees" : "Non acceptees"
            }
            badge={
              profile?.cgu_accepted ? (
                <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                  Acceptees
                </Badge>
              ) : (
                <Badge variant="destructive">En attente</Badge>
              )
            }
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/*  GOOGLE ACCOUNT DATA                                          */}
      {/* ============================================================ */}
      {isGoogleProvider && user?.user_metadata && (
        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50">
              <Chrome className="size-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Donnees Google
              </h3>
              <p className="text-sm text-muted-foreground">
                Informations recuperees de votre compte Google.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                label: "Nom complet",
                value:
                  user.user_metadata.full_name ??
                  user.user_metadata.name ??
                  "—",
              },
              {
                label: "Courriel",
                value: user.user_metadata.email ?? email,
              },
              {
                label: "Courriel verifie",
                value: user.user_metadata.email_verified ? "Oui" : "Non",
              },
              {
                label: "Fournisseur",
                value: user.user_metadata.iss ?? "Google",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl bg-muted/30 border border-border/30 p-4"
              >
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  {item.label}
                </p>
                <p className="text-sm font-medium text-foreground truncate">
                  {item.value}
                </p>
              </div>
            ))}

            {/* Avatar preview */}
            {avatarUrl && (
              <div className="sm:col-span-2 rounded-xl bg-muted/30 border border-border/30 p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Photo de profil Google
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={avatarUrl}
                    alt="Avatar Google"
                    className="size-16 rounded-xl object-cover border-2 border-border/50"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-sm text-muted-foreground">
                    <p>
                      Cette photo est synchronisee depuis votre compte Google.
                    </p>
                    <p className="text-xs mt-1 text-muted-foreground/70 break-all">
                      {avatarUrl}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  DANGER ZONE                                                  */}
      {/* ============================================================ */}
      <div className="rounded-2xl border border-red-200/50 bg-red-50/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-red-100">
            <LogOut className="size-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Zone de danger</h3>
            <p className="text-sm text-muted-foreground">
              Actions irreversibles sur votre compte.
            </p>
          </div>
        </div>

        <Separator className="mb-4" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              Se deconnecter
            </p>
            <p className="text-sm text-muted-foreground">
              Vous serez redirige vers la page d'accueil.
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={handleSignOut}
            className="gap-2 shrink-0"
          >
            <LogOut className="size-4" />
            Se deconnecter
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SUB-COMPONENTS                                                      */
/* ------------------------------------------------------------------ */

function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border/30 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <Icon className="size-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      {badge ?? (
        <span
          className={cn(
            "text-sm font-medium text-foreground text-right truncate max-w-[50%]",
            mono && "font-mono text-xs"
          )}
        >
          {value}
        </span>
      )}
    </div>
  );
}
