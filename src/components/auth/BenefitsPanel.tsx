import { Zap, LayoutDashboard, ClipboardCheck, BadgeCheck } from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Simple et rapide",
    description: "Inscription en quelques secondes",
  },
  {
    icon: LayoutDashboard,
    title: "Tableau de bord",
    description: "Accédez en 1 clic à votre portail",
  },
  {
    icon: ClipboardCheck,
    title: "Diagnostic IA",
    description: "Évaluez votre maturité en 5 min",
  },
  {
    icon: BadgeCheck,
    title: "100% gratuit",
    description: "Aucun engagement",
  },
];

interface BenefitsPanelProps {
  title?: string;
}

export function BenefitsPanel({ title = "Pourquoi nous rejoindre ?" }: BenefitsPanelProps) {
  return (
    <div className="hidden md:flex flex-col justify-center w-[320px] shrink-0 bg-gradient-to-br from-[#7c3aed] via-[#6d28d9] to-[#4f46e5] p-8 text-white">
      <h2 className="text-lg font-semibold mb-8">{title}</h2>

      <div className="space-y-6">
        {benefits.map(({ icon: Icon, title: t, description }) => (
          <div key={t} className="flex items-start gap-3">
            <div className="flex items-center justify-center size-9 rounded-lg bg-white/15 shrink-0">
              <Icon className="size-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold">{t}</p>
              <p className="text-sm text-white/70 mt-0.5">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-white/20">
        <p className="text-sm text-white/70">
          <span className="font-semibold text-white">150+</span> professionnels nous font confiance
        </p>
      </div>
    </div>
  );
}
