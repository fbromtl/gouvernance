import { Link } from "react-router-dom";
import { Accessibility, CheckCircle, AlertCircle, Mail } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";

export function AccessibilitePage() {
  return (
    <>
      <SEO title="Accessibilité" description="Engagement d'accessibilité du Cercle de Gouvernance de l'IA." noindex={true} />
      <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Accessibility className="size-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Accessibilité
            </h1>
          </div>
          <p className="text-muted-foreground">
            Engagement du Cercle de Gouvernance de l&apos;IA en matière d&apos;accessibilité web
          </p>
        </header>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Notre engagement</CardTitle>
              <CardDescription>
                Le Cercle de Gouvernance de l&apos;IA s&apos;engage à rendre son site web
                accessible à toutes et à tous, y compris aux personnes en situation de handicap.
                Nous nous efforçons de concevoir et maintenir un site utilisable par le plus grand
                nombre, conformément aux meilleures pratiques internationales en matière
                d&apos;accessibilité numérique.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="size-5 text-primary" />
                Normes suivies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Notre site vise à respecter les critères de succès du niveau AA des Règles pour
                l&apos;accessibilité des contenus web (WCAG) 2.1, publiées par la W3C. Cela
                inclut notamment :
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  Un contraste suffisant entre le texte et l&apos;arrière-plan
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  Des alternatives textuelles pour les images
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  Une structure de titres et de navigation cohérente
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  La possibilité de naviguer au clavier
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="size-5 text-amber-500" />
                Limites connues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Malgré nos efforts, certaines parties du site peuvent ne pas être pleinement
                accessibles. Nous travaillons continuellement à améliorer l&apos;expérience de
                toutes et tous. Si vous rencontrez des difficultés d&apos;accès à une
                fonctionnalité ou à un contenu, nous vous invitons à nous en faire part.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="size-5 text-primary" />
                Retour et suggestions
              </CardTitle>
              <CardDescription>
                Votre avis nous aide à progresser
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Si vous avez des questions, des remarques ou des suggestions concernant
                l&apos;accessibilité de notre site, n&apos;hésitez pas à nous contacter. Nous
                nous engageons à répondre dans les meilleurs délais et à prendre en compte vos
                retours pour améliorer l&apos;accessibilité de nos services.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition-colors"
              >
                Nous contacter
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
}
