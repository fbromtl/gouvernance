import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Building2,
  ArrowRight,
  Sparkles,
  MapPin,
  Users,
  Briefcase,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ------------------------------------------------------------------ */
/*  CONSTANTS                                                          */
/* ------------------------------------------------------------------ */

const SECTORS = [
  "finance",
  "healthcare",
  "education",
  "government",
  "technology",
  "retail",
  "manufacturing",
  "energy",
  "telecom",
  "other",
] as const;

const SIZES = ["1-50", "51-200", "201-1000", "1001-5000", "5000+"] as const;

/* ================================================================== */
/*  ONBOARDING PAGE                                                    */
/* ================================================================== */

export default function OnboardingPage() {
  const { t } = useTranslation("onboarding");
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [size, setSize] = useState("");
  const [country, setCountry] = useState("Canada");
  const [province, setProvince] = useState("Québec");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const { error: rpcError } = await supabase.rpc(
        "onboard_create_organization" as any,
        {
          p_name: name.trim(),
          p_sector: sector || null,
          p_size: size || null,
          p_country: country || null,
          p_province: province || null,
        }
      );

      if (rpcError) {
        setError(rpcError.message);
        return;
      }

      // Refresh the session to get the new JWT with organization_id
      await supabase.auth.refreshSession();

      // Refresh the profile in auth context
      await refreshProfile();

      // Navigate to dashboard
      navigate("/dashboard", { replace: true });
    } catch {
      setError(t("error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/20">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="rounded-2xl border border-border/50 bg-card shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-brand-purple via-brand-purple-dark to-[#1e1a30] p-6 sm:p-8 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                <Sparkles className="size-5" />
              </div>
              <span className="text-sm font-medium text-white/70">
                {t("step")}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">{t("title")}</h1>
            <p className="mt-2 text-sm text-white/70 leading-relaxed">
              {t("description")}
            </p>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8 space-y-5">
            {/* Organization name */}
            <div className="space-y-2">
              <Label htmlFor="org-name" className="flex items-center gap-2">
                <Building2 className="size-4 text-muted-foreground" />
                {t("form.name")}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="org-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("form.namePlaceholder")}
                autoFocus
              />
            </div>

            {/* Sector & Size */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Briefcase className="size-4 text-muted-foreground" />
                  {t("form.sector")}
                </Label>
                <Select value={sector} onValueChange={setSector}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.sectorPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {t(`sectors.${s}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="size-4 text-muted-foreground" />
                  {t("form.size")}
                </Label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.sizePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {t(`sizes.${s}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Country & Province */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="org-country" className="flex items-center gap-2">
                  <MapPin className="size-4 text-muted-foreground" />
                  {t("form.country")}
                </Label>
                <Input
                  id="org-country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder={t("form.countryPlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-province">{t("form.province")}</Label>
                <Input
                  id="org-province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder={t("form.provincePlaceholder")}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={!name.trim() || submitting}
              className="w-full"
              size="lg"
            >
              {submitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  {t("form.submit")}
                  <ArrowRight className="ml-2 size-4" />
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              {t("form.hint")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
