import { Separator } from "@/components/ui/separator";
import { SEO } from "@/components/SEO";

export function MentionsLegalesPage() {
  return (
    <>
      <SEO title="Mentions légales" description="Mentions légales du site du Cercle de Gouvernance de l'IA." noindex={true} />
      <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <header className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 mb-4">
            Mentions légales
          </h1>
          <p className="text-neutral-500">
            Informations juridiques relatives au site du Cercle de Gouvernance de l&apos;IA
          </p>
        </header>

        <div className="space-y-8 text-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              Éditeur du site
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Le présent site est édité par le <strong>Cercle de Gouvernance de l&apos;IA</strong>,
              organisme voué à l&apos;accompagnement des dirigeants et des organisations dans la
              gouvernance responsable de l&apos;intelligence artificielle.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              Hébergement
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Ce site est hébergé par Netlify, Inc., 2325 3rd Street, Suite 296, San Francisco,
              California 94107, États-Unis. Pour toute question relative à l&apos;hébergement,
              vous pouvez consulter les conditions générales du fournisseur.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              Propriété intellectuelle
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              L&apos;ensemble des contenus de ce site (textes, images, graphismes, logos, icônes,
              etc.) est protégé par le droit d&apos;auteur et les lois relatives à la propriété
              intellectuelle. Toute reproduction, représentation, modification ou diffusion,
              intégrale ou partielle, sans autorisation préalable du Cercle de Gouvernance de
              l&apos;IA, est strictement interdite.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              Limitation de responsabilité
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Le Cercle de Gouvernance de l&apos;IA s&apos;efforce de maintenir les informations
              publiées sur ce site exactes et à jour. Toutefois, nous déclinons toute
              responsabilité quant à l&apos;exactitude, l&apos;exhaustivité ou l&apos;actualité des
              informations. Les contenus sont fournis à titre indicatif et ne constituent pas un
              avis juridique ou professionnel. Pour des conseils adaptés à votre situation,
              veuillez consulter un expert qualifié.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              Droit applicable
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Les présentes mentions légales sont régies par les lois de la province de Québec et
              du Canada. En cas de litige, les tribunaux compétents seront ceux de la province de
              Québec.
            </p>
          </section>
        </div>
      </div>
    </div>
    </>
  );
}
