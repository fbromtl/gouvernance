import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Linkedin, ArrowLeft, Share2, Loader2, UserX } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MemberBadge } from "@/components/shared/MemberBadge";
import { useMemberBySlug } from "@/hooks/useMembers";
import { SEO } from "@/components/SEO";

export function MemberPublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation("members");
  const { data: member, isLoading } = useMemberBySlug(slug);

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  // --- Not found state ---
  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 px-4">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <UserX className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Membre introuvable
          </h1>
          <p className="text-muted-foreground max-w-sm">
            Ce profil n'existe pas ou n'est plus disponible.
          </p>
          <Button asChild variant="outline">
            <Link to="/membres">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("publicProfile.backToDirectory")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // --- Helpers ---
  const initials = member.full_name
    ? member.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const levelLabel = t(`levels.${member.plan}`);

  const handleShareLinkedin = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // --- Profile display ---
  return (
    <>
      <SEO
        title={member.full_name ?? "Profil membre"}
        description={`${member.full_name ?? "Membre"} - ${levelLabel} du Cercle de Gouvernance de l'IA`}
      />

      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted/30 px-4 py-12">
        {/* Subtle branding */}
        <div className="mb-8 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
            Cercle de Gouvernance de l'IA
          </p>
        </div>

        {/* Profile card */}
        <Card className="w-full max-w-lg shadow-lg border-2">
          <CardContent className="p-8 text-center space-y-6">
            {/* Avatar */}
            <Avatar className="mx-auto h-24 w-24">
              <AvatarImage src={member.avatar_url ?? undefined} />
              <AvatarFallback className="text-2xl font-bold bg-brand-purple/10 text-brand-purple">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Name & title */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">
                {member.full_name}
              </h1>
              {(member.job_title || member.organization_name) && (
                <p className="text-muted-foreground">
                  {[member.job_title, member.organization_name]
                    .filter(Boolean)
                    .join(" - ")}
                </p>
              )}
            </div>

            {/* Badge */}
            <div className="flex justify-center">
              <MemberBadge plan={member.plan} size="lg" />
            </div>

            {/* Bio */}
            {member.bio && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                {member.bio}
              </p>
            )}

            {/* LinkedIn profile link */}
            {member.linkedin_url && (
              <Button asChild variant="outline" className="gap-2">
                <a
                  href={member.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              </Button>
            )}

            {/* Divider */}
            <div className="border-t pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              {/* Share on LinkedIn */}
              <Button
                variant="secondary"
                className="gap-2"
                onClick={handleShareLinkedin}
              >
                <Share2 className="h-4 w-4" />
                {t("publicProfile.shareLinkedin")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Back to directory */}
        <div className="mt-8">
          <Button asChild variant="ghost" className="gap-2 text-muted-foreground">
            <Link to="/membres">
              <ArrowLeft className="h-4 w-4" />
              {t("publicProfile.backToDirectory")}
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
