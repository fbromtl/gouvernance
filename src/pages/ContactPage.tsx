import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SEO, JsonLd } from "@/components/SEO";

export function ContactPage() {
  const [formData, setFormData] = useState({
    prenom: "",
    email: "",
    organisme: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted:", formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      <SEO title="Contact" description="Contactez le Cercle de Gouvernance de l'IA pour toute question sur nos services, événements ou membership." />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": "Contact — Cercle de Gouvernance de l'IA",
        "url": "https://gouvernance.ai/contact",
        "mainEntity": {
          "@type": "Organization",
          "name": "Cercle de Gouvernance de l'IA",
          "email": "info@gouvernance.ai",
          "telephone": "+1-514-555-1234",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Montréal",
            "addressRegion": "QC",
            "addressCountry": "CA"
          }
        }
      }} />
      <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1a30] via-[#252243] to-[#1e1a30]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-6">
            Contact
          </h1>
          <p className="text-lg sm:text-xl text-purple-100/90 max-w-2xl mx-auto">
            Échangez avec le Cercle de Gouvernance de l&apos;IA. Posez vos questions, partagez vos défis ou rejoignez notre communauté.
          </p>
        </div>
      </section>

      {/* Two column layout */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Form - left */}
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Envoyez-nous un message</CardTitle>
                <CardDescription>
                  Remplissez le formulaire ci-dessous. Nous vous répondrons dans les plus brefs délais.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="prenom">
                      Prénom <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="prenom"
                      name="prenom"
                      type="text"
                      placeholder="Votre prénom"
                      required
                      value={formData.prenom}
                      onChange={handleChange}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="votre@email.com"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organisme">Organisme</Label>
                    <Input
                      id="organisme"
                      name="organisme"
                      type="text"
                      placeholder="Votre entreprise ou organisation"
                      value={formData.organisme}
                      onChange={handleChange}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Votre message..."
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="min-h-[120px] resize-y"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button type="submit" size="lg" className="flex-1 sm:flex-initial px-8">
                      Envoyer
                    </Button>
                    <Button asChild variant="outline" size="lg" className="px-8">
                      <Link to="/rejoindre" className="flex items-center gap-2">
                        <Users className="size-4" />
                        Rejoindre le Cercle
                      </Link>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Info - right */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Nos coordonnées
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Mail className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <p className="text-muted-foreground">contact@cercle-gouvernance.ai</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Phone className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Téléphone</p>
                      <p className="text-muted-foreground">+1 (514) 555-0123</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <MapPin className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Adresse</p>
                      <p className="text-muted-foreground">
                        Cercle de Gouvernance de l&apos;IA<br />
                        1234 Rue Sherbrooke Ouest<br />
                        Montréal, QC H3G 1H4
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map placeholder */}
              <Card className="overflow-hidden border-2">
                <CardContent className="p-0">
                  <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                    <div className="text-center p-8">
                      <MapPin className="size-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground font-medium">
                        Carte à venir
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Intégration Google Maps ou OpenStreetMap
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
