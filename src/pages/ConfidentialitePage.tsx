import { Link } from "react-router-dom";

import { Separator } from "@/components/ui/separator";
import { SEO } from "@/components/SEO";

export function ConfidentialitePage() {
  return (
    <>
      <SEO title="Politique de confidentialité" description="Politique de confidentialité du Cercle de Gouvernance de l'IA. Protection des données conformément à la Loi 25." noindex={true} />
      <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <header className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 mb-4">
            Politique de confidentialité
          </h1>
          <p className="text-neutral-500">
            Dernière mise à jour : février 2026
          </p>
        </header>

        <div className="prose prose-lg max-w-none space-y-8 text-foreground">
          <p className="text-muted-foreground leading-relaxed">
            Le Cercle de Gouvernance de l&apos;IA s&apos;engage à protéger la vie privée des
            utilisateurs de son site web et des personnes qui interagissent avec notre organisation.
            Cette politique de confidentialité décrit comment nous collectons, utilisons et
            protégeons vos informations personnelles conformément aux lois applicables, notamment
            la Loi 25 modifiant des lois en matière de protection des renseignements personnels
            du Québec.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Collecte d&apos;informations</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous pouvons collecter des renseignements personnels lorsque vous nous contactez par
              formulaire, courriel ou inscription à notre infolettre. Ces informations peuvent
              inclure votre nom, votre adresse courriel, le nom de votre organisation et tout
              message que vous nous transmettez. Nous ne collectons que les informations
              strictement nécessaires aux fins pour lesquelles elles sont demandées.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Utilisation</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les renseignements personnels recueillis sont utilisés pour répondre à vos demandes,
              gérer votre inscription à notre infolettre, vous fournir des informations sur nos
              activités et améliorer nos services. Nous ne vendons pas, ne louons pas et ne
              partageons pas vos données personnelles avec des tiers à des fins commerciales.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Notre site peut utiliser des cookies pour améliorer l&apos;expérience de navigation,
              analyser le trafic et mémoriser vos préférences. Les cookies essentiels sont
              nécessaires au fonctionnement du site. Vous pouvez configurer votre navigateur pour
              refuser les cookies non essentiels, ce qui pourrait toutefois affecter certaines
              fonctionnalités du site.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Vos droits</h2>
            <p className="text-muted-foreground leading-relaxed">
              Conformément à la Loi 25 et aux lois applicables en matière de protection des
              renseignements personnels, vous disposez du droit d&apos;accéder à vos données
              personnelles, de les rectifier, de demander leur suppression ou de retirer votre
              consentement. Pour exercer ces droits, contactez-nous à l&apos;adresse indiquée
              ci-dessous.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Loi 25 et conformité</h2>
            <p className="text-muted-foreground leading-relaxed">
              En tant qu&apos;organisation basée au Québec, nous nous conformons à la Loi 25 et
              aux principes de protection des renseignements personnels qu&apos;elle établit. Nous
              nous engageons à traiter vos données de manière légale, loyale et transparente, avec
              des finalités déterminées et explicites.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour toute question concernant cette politique de confidentialité ou pour exercer
              vos droits, veuillez nous contacter via la page{" "}
              <Link to="/contact" className="text-primary hover:underline">
                Contact
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
    </>
  );
}
