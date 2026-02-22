import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Linkedin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MemberBadge } from "./MemberBadge";
import type { PlanId } from "@/lib/stripe";

export interface MemberProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  job_title: string | null;
  bio: string | null;
  linkedin_url: string | null;
  member_slug: string | null;
  organization_name: string | null;
  plan: PlanId;
}

interface MemberCardProps {
  member: MemberProfile;
  blurred?: boolean;
}

export function MemberCard({ member, blurred = false }: MemberCardProps) {
  const { t } = useTranslation("members");

  const initials = member.full_name
    ? member.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  if (blurred) {
    return (
      <Card className="p-5 text-center space-y-3 select-none">
        <div className="mx-auto h-16 w-16 rounded-full bg-muted blur-sm" />
        <div className="h-4 w-24 mx-auto bg-muted rounded blur-sm" />
        <div className="h-3 w-32 mx-auto bg-muted/60 rounded blur-sm" />
        <div className="h-3 w-20 mx-auto bg-muted/40 rounded blur-sm" />
      </Card>
    );
  }

  return (
    <Card className="p-5 text-center space-y-3 hover:shadow-lg transition-shadow duration-200">
      <Avatar className="mx-auto h-16 w-16">
        <AvatarImage src={member.avatar_url ?? undefined} />
        <AvatarFallback className="text-lg font-semibold bg-brand-purple/10 text-brand-purple">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="space-y-1">
        <h3 className="font-semibold text-foreground truncate">{member.full_name}</h3>
        {member.job_title && (
          <p className="text-sm text-muted-foreground truncate">{member.job_title}</p>
        )}
        {member.organization_name && (
          <p className="text-xs text-muted-foreground/70 truncate">{member.organization_name}</p>
        )}
      </div>

      <MemberBadge plan={member.plan} size="sm" />

      <div className="flex items-center justify-center gap-2 pt-1">
        {member.member_slug && (
          <Button asChild variant="outline" size="sm" className="text-xs h-7">
            <Link to={`/membres/${member.member_slug}`}>
              {t("card.viewProfile")}
            </Link>
          </Button>
        )}
        {member.linkedin_url && (
          <Button asChild variant="ghost" size="icon" className="h-7 w-7">
            <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer">
              <Linkedin className="h-3.5 w-3.5" />
            </a>
          </Button>
        )}
      </div>
    </Card>
  );
}
