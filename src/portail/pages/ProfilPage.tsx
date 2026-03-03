import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  Linkedin,
  Briefcase,
  Crown,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { MemberBadge } from "@/components/shared/MemberBadge";
import { useSubscription } from "@/hooks/useSubscription";
import type { PlanId } from "@/lib/stripe";

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

/** Slugify a string: lowercase, remove accents, spaces to hyphens */
function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric
    .replace(/[\s]+/g, "-") // spaces to hyphens
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-|-$/g, ""); // trim leading/trailing hyphens
}

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export default function ProfilPage() {
  const navigate = useNavigate();
  const { user, profile, updateProfile, signOut } = useAuth();
  const { t, i18n } = useTranslation("profil");
  const { t: tMembers } = useTranslation("members");
  const { data: subscription } = useSubscription();

  const currentPlan: PlanId = (subscription?.plan as PlanId) ?? "observer";

  const [fullName, setFullName] = useState(
    profile?.full_name ?? user?.user_metadata?.full_name ?? ""
  );
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url ?? "");
  const [jobTitle, setJobTitle] = useState(profile?.job_title ?? "");
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

  const dateLocale = i18n.language === "en" ? "en-CA" : "fr-CA";

  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(dateLocale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const lastSignIn = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleDateString(dateLocale, {
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

    const trimmedName = fullName.trim() || null;

    // Auto-generate member_slug if needed
    const shouldGenerateSlug =
      !profile?.member_slug &&
      trimmedName &&
      currentPlan !== "observer";
    const memberSlug = shouldGenerateSlug ? slugify(trimmedName) : undefined;

    const result = await updateProfile({
      full_name: trimmedName,
      bio: bio.trim() || null,
      linkedin_url: linkedinUrl.trim() || null,
      job_title: jobTitle.trim() || null,
      ...(memberSlug ? { member_slug: memberSlug } : {}),
    });

    setSaving(false);
    if (result.success) {
      setFeedback({ type: "success", message: t("personalInfo.saveSuccess") });
    } else {
      setFeedback({
        type: "error",
        message: result.error ?? t("personalInfo.saveError"),
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
          {t("pageTitle")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("pageDescription")}
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
                {profile?.full_name ?? user?.user_metadata?.full_name ?? t("common:user")}
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
              {t("personalInfo.title")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("personalInfo.description")}
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Full name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">{t("personalInfo.fullName")}</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t("personalInfo.fullNamePlaceholder")}
              className="h-11"
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">
              {t("personalInfo.email")}
              <span className="text-xs text-muted-foreground ml-1.5 font-normal">
                {t("personalInfo.emailReadonly")}
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
            {saving ? t("common:saving") : t("common:save")}
          </Button>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  MEMBERSHIP SECTION                                           */}
      {/* ============================================================ */}
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-purple/10">
            <Crown className="size-5 text-brand-purple" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {i18n.language === "en"
                ? "My Circle Membership"
                : "Mon adh\u00e9sion au Cercle"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {tMembers(`levels.${currentPlan}`)}
            </p>
          </div>
          <div className="ml-auto">
            <MemberBadge plan={currentPlan} size="lg" />
          </div>
        </div>

        <div className="space-y-5">
          {/* Job title */}
          <div className="space-y-2">
            <Label htmlFor="jobTitle" className="flex items-center gap-2">
              <Briefcase className="size-3.5 text-muted-foreground" />
              {i18n.language === "en" ? "Job Title" : "Titre professionnel"}
            </Label>
            <Input
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder={
                i18n.language === "en"
                  ? "e.g. AI Governance Lead"
                  : "ex. Responsable Gouvernance IA"
              }
              className="h-11"
            />
          </div>

          {/* LinkedIn URL */}
          <div className="space-y-2">
            <Label htmlFor="linkedinUrl" className="flex items-center gap-2">
              <Linkedin className="size-3.5 text-muted-foreground" />
              {i18n.language === "en" ? "LinkedIn Profile" : "Profil LinkedIn"}
            </Label>
            <Input
              id="linkedinUrl"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="h-11"
              type="url"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bio">
                {i18n.language === "en" ? "Biography" : "Biographie"}
              </Label>
              <span
                className={cn(
                  "text-xs tabular-nums",
                  bio.length > 200
                    ? "text-red-500 font-medium"
                    : "text-muted-foreground"
                )}
              >
                {bio.length}/200
              </span>
            </div>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 200))}
              placeholder={
                i18n.language === "en"
                  ? "A few words about you..."
                  : "Quelques mots sur vous..."
              }
              maxLength={200}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Public page link */}
          {profile?.member_slug && (
            <div className="flex items-center gap-2 rounded-xl bg-brand-purple/5 border border-brand-purple/10 p-3">
              <ExternalLink className="size-4 text-brand-purple shrink-0" />
              <Link
                to={`/membres/${profile.member_slug}`}
                className="text-sm font-medium text-brand-purple hover:underline"
              >
                {i18n.language === "en"
                  ? "View my public page"
                  : "Voir ma page publique"}
              </Link>
            </div>
          )}

          {/* Upgrade CTA for observers */}
          {currentPlan === "observer" && (
            <div className="flex items-center justify-between rounded-xl bg-muted/40 border border-border/40 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {i18n.language === "en"
                    ? "Unlock your public profile"
                    : "D\u00e9bloquez votre profil public"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {i18n.language === "en"
                    ? "Become a Member to appear in the directory"
                    : "Devenez Membre pour appara\u00eetre dans l\u2019annuaire"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5 border-brand-purple/30 text-brand-purple hover:bg-brand-purple/5"
                onClick={() => navigate("/billing")}
              >
                <Crown className="size-3.5" />
                {tMembers("teaser.cta")}
              </Button>
            </div>
          )}
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
              {t("accountDetails.title")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("accountDetails.description")}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Provider */}
          <InfoRow
            icon={isGoogleProvider ? Chrome : KeyRound}
            label={t("accountDetails.signInMethod")}
            value={
              isGoogleProvider
                ? t("accountDetails.googleMethod", { email })
                : t("accountDetails.emailMethod")
            }
          />

          {/* User ID */}
          <InfoRow
            icon={Globe}
            label={t("accountDetails.identifier")}
            value={user?.id ?? "—"}
            mono
          />

          {/* Created */}
          <InfoRow
            icon={Calendar}
            label={t("accountDetails.memberSince")}
            value={createdAt}
          />

          {/* Last sign in */}
          <InfoRow
            icon={Calendar}
            label={t("accountDetails.lastSignIn")}
            value={lastSignIn}
          />

          {/* CGU */}
          <InfoRow
            icon={ShieldCheck}
            label={t("accountDetails.termsOfUse")}
            value={
              profile?.cgu_accepted
                ? t("accountDetails.termsAccepted")
                : t("accountDetails.termsNotAccepted")
            }
            badge={
              profile?.cgu_accepted ? (
                <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                  {t("accountDetails.termsAccepted")}
                </Badge>
              ) : (
                <Badge variant="destructive">{t("accountDetails.termsPending")}</Badge>
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
                {t("googleData.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("googleData.description")}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                label: t("googleData.fullName"),
                value:
                  user.user_metadata.full_name ??
                  user.user_metadata.name ??
                  "—",
              },
              {
                label: t("googleData.email"),
                value: user.user_metadata.email ?? email,
              },
              {
                label: t("googleData.emailVerified"),
                value: user.user_metadata.email_verified
                  ? t("common:yes")
                  : t("common:no"),
              },
              {
                label: t("googleData.provider"),
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
                  {t("googleData.profilePhoto")}
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
                      {t("googleData.photoSyncMessage")}
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
            <h3 className="font-semibold text-foreground">{t("dangerZone.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("dangerZone.description")}
            </p>
          </div>
        </div>

        <Separator className="mb-4" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              {t("dangerZone.signOutTitle")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("dangerZone.signOutDescription")}
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={handleSignOut}
            className="gap-2 shrink-0"
          >
            <LogOut className="size-4" />
            {t("common:signOut")}
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
