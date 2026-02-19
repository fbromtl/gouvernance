import { Link } from "react-router-dom";
import {
  Bot,
  Shield,
  AlertTriangle,
  Scale,
  FileText,
  BarChart3,
  Eye,
  Recycle,
  Building2,
  FolderOpen,
  Activity,
  Database,
  CheckCircle,
  Clock,
  Send,
  Archive,
  Cpu,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ================================================================== */
/*  DATA                                                               */
/* ================================================================== */

const availableModules = [
  { icon: Bot, title: "Registre des syst\u00e8mes IA", description: "Inventaire complet de vos syst\u00e8mes d\u2019intelligence artificielle" },
  { icon: Shield, title: "\u00c9valuation des risques", description: "Analyse et cotation des risques li\u00e9s \u00e0 chaque syst\u00e8me IA" },
  { icon: AlertTriangle, title: "Gestion des incidents", description: "Signalement, suivi et r\u00e9solution des incidents IA" },
  { icon: Scale, title: "Gouvernance", description: "Politiques, r\u00f4les et comit\u00e9s de gouvernance IA" },
  { icon: FileText, title: "Journal des d\u00e9cisions", description: "Tra\u00e7abilit\u00e9 de toutes les d\u00e9cisions relatives \u00e0 l\u2019IA" },
  { icon: CheckCircle, title: "Conformit\u00e9", description: "Suivi de conformit\u00e9 multi-cadres (Loi 25, ISO 42001, EU AI Act)" },
  { icon: BarChart3, title: "Biais & \u00c9quit\u00e9", description: "D\u00e9tection et att\u00e9nuation des biais algorithmiques" },
  { icon: Eye, title: "Transparence", description: "Avis de transparence et registres publics" },
  { icon: Recycle, title: "Cycle de vie", description: "Suivi des phases de vie de chaque syst\u00e8me IA" },
  { icon: Building2, title: "Fournisseurs", description: "Gestion et \u00e9valuation des fournisseurs de solutions IA" },
  { icon: FolderOpen, title: "Documentation", description: "Gestion des documents de gouvernance" },
  { icon: Activity, title: "Monitoring", description: "Surveillance en temps r\u00e9el des performances et d\u00e9rives" },
  { icon: Database, title: "Donn\u00e9es & EFVP", description: "Registres de donn\u00e9es et \u00e9valuations de vie priv\u00e9e" },
];

const upcomingFeatures = [
  {
    icon: Send,
    title: "Questionnaire fournisseur automatique",
    description:
      "Envoi automatique d\u2019un questionnaire de s\u00e9curit\u00e9 aux fournisseurs d\u2019IA. Collecte des certifications (ISO 27001, SOC 2\u2026), des mesures de protection des donn\u00e9es et des engagements de conformit\u00e9 \u2014 le tout sans intervention manuelle.",
    bullets: [
      "Envoi automatique par courriel",
      "Formulaire de s\u00e9curit\u00e9 personnalisable",
      "Suivi des r\u00e9ponses en temps r\u00e9el",
      "Scoring automatique du risque fournisseur",
    ],
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderAccent: "hover:border-blue-200",
  },
  {
    icon: Archive,
    title: "Drive documentaire",
    description:
      "Un espace de stockage centralis\u00e9 pour toutes vos politiques, proc\u00e9dures et documents de gouvernance IA. Versioning automatique, historique complet et acc\u00e8s contr\u00f4l\u00e9 par r\u00f4le \u2014 votre m\u00e9moire organisationnelle, toujours accessible.",
    bullets: [
      "Stockage s\u00e9curis\u00e9 des politiques et proc\u00e9dures",
      "Versioning automatique des documents",
      "Historique complet des modifications",
      "Acc\u00e8s contr\u00f4l\u00e9 par r\u00f4le",
    ],
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderAccent: "hover:border-amber-200",
  },
  {
    icon: Cpu,
    title: "Serveur MCP pour agents IA",
    description:
      "Un serveur MCP (Model Context Protocol) permettant aux agents IA autonomes de d\u00e9clarer leurs d\u00e9cisions algorithmiques et les changements dans leurs m\u00e9canismes. Tra\u00e7abilit\u00e9 compl\u00e8te pour une gouvernance de l\u2019autonomie IA.",
    bullets: [
      "D\u00e9claration automatique des d\u00e9cisions algorithmiques",
      "Journal des changements dans les m\u00e9canismes autonomes",
      "Int\u00e9gration native avec les agents IA",
      "Conformit\u00e9 et auditabilit\u00e9 des syst\u00e8mes autonomes",
    ],
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderAccent: "hover:border-purple-200",
  },
];

/* ================================================================== */
/*  COMPONENT                                                          */
/* ================================================================== */

export default function RoadmapPage() {
  return (
    <div className="space-y-10">
      {/* Page header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-purple/10">
          <Sparkles className="h-5 w-5 text-brand-purple" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fonctionnalit\u00e9s \u00e0 venir</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            D\u00e9couvrez notre feuille de route pour faire \u00e9voluer la plateforme.
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  SECTION 1 \u2014 D\u00e9j\u00e0 disponible                                  */}
      {/* ============================================================ */}
      <section>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">D\u00e9j\u00e0 disponible</h2>
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
            {availableModules.length} modules
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {availableModules.map((mod) => (
            <Card key={mod.title} className="group border-border/60 hover:shadow-sm hover:border-emerald-200/60 transition-all duration-300">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <mod.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight">{mod.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{mod.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 2 \u2014 Prochainement                                    */}
      {/* ============================================================ */}
      <section>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-purple/10">
            <Clock className="h-4 w-4 text-brand-purple" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">Prochainement</h2>
          <Badge variant="secondary" className="bg-brand-purple/10 text-brand-purple border-brand-purple/20 text-xs">
            En d\u00e9veloppement
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {upcomingFeatures.map((feature) => (
            <Card
              key={feature.title}
              className={`group border-2 border-dashed border-border/60 ${feature.borderAccent} transition-all duration-300 relative overflow-hidden`}
            >
              <CardHeader className="pb-3">
                <Badge variant="outline" className="absolute top-4 right-4 text-[11px] font-medium">
                  \u00c0 venir
                </Badge>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${feature.bgColor} ${feature.color} mb-3`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base pr-16 leading-snug">{feature.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-5">
                <ul className="space-y-2.5">
                  {feature.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-brand-purple/50" />
                      <span className="leading-tight">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 3 \u2014 CTA                                              */}
      {/* ============================================================ */}
      <Card className="bg-muted/40 border-dashed border-border/60">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
          <div>
            <p className="font-semibold text-foreground">Vous souhaitez influencer notre feuille de route ?</p>
            <p className="text-sm text-muted-foreground mt-1">
              Partagez vos besoins et suggestions pour les prochaines fonctionnalit\u00e9s.
            </p>
          </div>
          <Button asChild className="shrink-0 gap-2 shadow-sm">
            <Link to="/contact">
              Nous contacter
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
