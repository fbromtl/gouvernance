import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollText, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  CGU TEXT                                                            */
/* ------------------------------------------------------------------ */

const cguSections = [
  {
    title: "1. Objet",
    content:
      "Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») ont pour objet de définir les conditions d'accès et d'utilisation du portail de Gouvernance IA (ci-après « le Portail »), opéré par le Cercle de Gouvernance de l'Intelligence Artificielle.",
  },
  {
    title: "2. Accès au Portail",
    content:
      "L'accès au Portail nécessite une authentification via un compte Google. En vous connectant, vous garantissez fournir des informations exactes et à jour. Vous êtes responsable de la confidentialité de vos identifiants de connexion.",
  },
  {
    title: "3. Services proposés",
    content:
      "Le Portail met à votre disposition des outils de diagnostic de maturité en gouvernance IA, des ressources documentaires, des rapports personnalisés et un accès à la communauté d'experts.",
  },
  {
    title: "4. Protection des données personnelles",
    content:
      "Conformément à la Loi 25 (Québec) et aux réglementations applicables en matière de protection des renseignements personnels, vos données sont traitées de manière sécurisée. Les données collectées sont limitées aux informations de votre compte Google (nom, email, photo de profil) et aux résultats de vos diagnostics.",
  },
  {
    title: "5. Propriété intellectuelle",
    content:
      "L'ensemble des contenus du Portail (textes, outils, rapports, interfaces) sont la propriété exclusive du Cercle de Gouvernance de l'IA. Toute reproduction ou distribution non autorisée est interdite.",
  },
  {
    title: "6. Responsabilités",
    content:
      "Les résultats de diagnostic et recommandations fournis par le Portail sont donnés à titre indicatif. Ils ne constituent pas un conseil juridique ou professionnel et ne sauraient engager la responsabilité du Cercle de Gouvernance de l'IA.",
  },
  {
    title: "7. Modification des CGU",
    content:
      "Le Cercle de Gouvernance de l'IA se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle.",
  },
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export default function ConditionsPage() {
  const { acceptCgu } = useAuth();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAccept = async () => {
    if (!checked) return;
    setSubmitting(true);
    try {
      await acceptCgu();
      navigate("/portail", { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100dvh-64px)] items-center justify-center p-4 bg-muted/20">
      <div className="w-full max-w-2xl">
        {/* Card */}
        <div className="rounded-2xl border border-border/50 bg-card shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-brand-purple via-brand-purple-dark to-[#1e1a30] p-6 sm:p-8 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                <ScrollText className="size-5" />
              </div>
              <span className="text-sm font-medium text-white/70">
                Dernière étape
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Conditions Générales d'Utilisation
            </h1>
            <p className="mt-2 text-white/70">
              Veuillez lire et accepter les conditions pour accéder au portail.
            </p>
          </div>

          {/* CGU Content */}
          <div className="max-h-[350px] overflow-y-auto p-6 sm:p-8 space-y-5 text-sm leading-relaxed text-muted-foreground">
            {cguSections.map((section) => (
              <div key={section.title}>
                <h3 className="font-semibold text-foreground mb-1">
                  {section.title}
                </h3>
                <p>{section.content}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-border/50 p-6 sm:p-8 space-y-4">
            {/* Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="flex size-5 items-center justify-center rounded-md border-2 border-border peer-checked:border-brand-purple peer-checked:bg-brand-purple transition-colors">
                  {checked && <CheckCircle2 className="size-4 text-white" />}
                </div>
              </div>
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                J'ai lu et j'accepte les Conditions Générales d'Utilisation du
                portail de Gouvernance IA.
              </span>
            </label>

            {/* Submit */}
            <Button
              onClick={handleAccept}
              disabled={!checked || submitting}
              className="w-full"
              size="lg"
            >
              {submitting ? "Validation en cours..." : "Accepter et accéder au portail"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
