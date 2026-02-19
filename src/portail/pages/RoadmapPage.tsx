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
import { Separator } from "@/components/ui/separator";

/* ================================================================== */
/*  DATA                                                               */
/* ================================================================== */

const availableModules = [
  { icon: Bot, title: "Registre des systèmes IA", description: "Inventaire complet de vos systèmes d'intelligence artificielle" },
  { icon: Shield, title: "Évaluation des risques", description: "Analyse et cotation des risques liés à chaque système IA" },
  { icon: AlertTriangle, title: "Gestion des incidents", description: "Signalement, suivi et résolution des incidents IA" },
  { icon: Scale, title: "Gouvernance", description: "Politiques, rôles et comités de gouvernance IA" },
  { icon: FileText, title: "Journal des décisions", description: "Traçabilité de toutes les décisions relatives à l'IA" },
  { icon: CheckCircle, title: "Conformité", description: "Suivi de conformité multi-cadres (Loi 25, ISO 42001, EU AI Act)" },
  { icon: BarChart3, title: "Biais & Équité", description: "Détection et atténuation des biais algorithmiques" },
  { icon: Eye, title: "Transparence", description: "Avis de transparence et registres publics" },
  { icon: Recycle, title: "Cycle de vie", description: "Suivi des phases de vie de chaque système IA" },
  { icon: Building2, title: "Fournisseurs", description: "Gestion et évaluation des fournisseurs de solutions IA" },
  { icon: FolderOpen, title: "Documentation", description: "Gestion des documents de gouvernance" },
  { icon: Activity, title: "Monitoring", description: "Surveillance en temps réel des performances et dérives" },
  { icon: Database, title: "Données & EFVP", description: "Registres de données et évaluations de vie privée" },
];

const upcomingFeatures = [
  {
    icon: Send,
    title: "Questionnaire fournisseur automatique",
    description:
      "Envoi automatique d'un questionnaire de sécurité aux fournisseurs d'IA. Collecte des certifications (ISO 27001, SOC 2…), des mesures de protection des données et des engagements de conformité — le tout sans intervention manuelle.",
    bullets: [
      "Envoi automatique par courriel",
      "Formulaire de sécurité personnalisable",
      "Suivi des réponses en temps réel",
      "Scoring automatique du risque fournisseur",
    ],
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: Archive,
    title: "Drive documentaire",
    description:
      "Un espace de stockage centralisé pour toutes vos politiques, procédures et documents de gouvernance IA. Versioning automatique, historique complet et accès contrôlé par rôle — votre mémoire organisationnelle, toujours accessible.",
    bullets: [
      "Stockage sécurisé des politiques et procédures",
      "Versioning automatique des documents",
      "Historique complet des modifications",
      "Accès contrôlé par rôle",
    ],
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    icon: Cpu,
    title: "Serveur MCP pour agents IA",
    description:
      "Un serveur MCP (Model Context Protocol) permettant aux agents IA autonomes de déclarer leurs décisions algorithmiques et les changements dans leurs mécanismes. Traçabilité complète pour une gouvernance de l'autonomie IA.",
    bullets: [
      "Déclaration automatique des décisions algorithmiques",
      "Journal des changements dans les mécanismes autonomes",
      "Intégration native avec les agents IA",
      "Conformité et auditabilité des systèmes autonomes",
    ],
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
];

/* ================================================================== */
/*  COMPONENT                                                          */
/* ================================================================== */

export default function RoadmapPage() {
  return (
    <div className="space-y-10">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-purple/10">
            <Sparkles className="h-5 w-5 text-brand-purple" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Fonctionnalités à venir</h1>
            <p className="text-sm text-muted-foreground">
              Découvrez notre feuille de route pour faire évoluer la plateforme.
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* ============================================================ */}
      {/*  SECTION 1 — Déjà disponible                                  */}
      {/* ============================================================ */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold">Déjà disponible</h2>
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
            {availableModules.length} modules
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {availableModules.map((mod) => (
            <Card key={mod.title} className="border hover:shadow-sm transition-shadow">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
                  <mod.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-tight">{mod.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{mod.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 2 — Prochainement                                    */}
      {/* ============================================================ */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Clock className="h-5 w-5 text-brand-purple" />
          <h2 className="text-lg font-semibold">Prochainement</h2>
          <Badge variant="secondary" className="bg-brand-purple/10 text-brand-purple border-brand-purple/20">
            En développement
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {upcomingFeatures.map((feature) => (
            <Card
              key={feature.title}
              className="border-2 border-dashed hover:border-primary/30 transition-all relative overflow-hidden"
            >
              <CardHeader className="pb-3">
                <Badge variant="outline" className="absolute top-4 right-4 text-xs">
                  À venir
                </Badge>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${feature.bgColor} ${feature.color} mb-2`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base pr-16">{feature.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  {feature.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-brand-purple/60" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 3 — CTA                                              */}
      {/* ============================================================ */}
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
          <div>
            <p className="font-semibold">Vous souhaitez influencer notre feuille de route ?</p>
            <p className="text-sm text-muted-foreground mt-1">
              Partagez vos besoins et suggestions pour les prochaines fonctionnalités.
            </p>
          </div>
          <Button asChild className="shrink-0 gap-2">
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
