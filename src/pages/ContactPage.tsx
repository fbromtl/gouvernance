import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, MapPin, Phone, Users } from "lucide-react";
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
      <section
        className="overflow-hidden pt-32 pb-20 relative"
        style={{
          backgroundColor: "#ffffff",
          backgroundImage: `
            radial-gradient(at 0% 0%, hsla(270,100%,93%,1) 0, transparent 50%),
            radial-gradient(at 100% 0%, hsla(280,100%,95%,1) 0, transparent 50%),
            radial-gradient(at 100% 100%, hsla(250,100%,92%,1) 0, transparent 50%),
            radial-gradient(at 0% 100%, hsla(220,100%,96%,1) 0, transparent 50%)
          `,
        }}
      >
        <div className="text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-950 tracking-tight mb-6">
            Contact
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto">
            Échangez avec le Cercle de Gouvernance de l&apos;IA. Posez vos questions, partagez vos défis ou rejoignez notre communauté.
          </p>
        </div>
      </section>

      {/* Form section - light background */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Form - left */}
            <Card className="rounded-3xl border border-neutral-200 bg-white shadow-lg">
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
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:brightness-110"
                    >
                      Envoyer
                      <ArrowRight className="size-4" />
                    </button>
                    <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                      <Link to="/rejoindre" className="flex items-center gap-2">
                        <Users className="size-4" />
                        Rejoindre le Cercle
                      </Link>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Info - right (dark section) */}
            <div className="space-y-8">
              <div className="rounded-3xl bg-neutral-950 p-8 sm:p-10">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Nos coordonnées
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-purple-400">
                      <Mail className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Email</p>
                      <p className="text-neutral-400">contact@cercle-gouvernance.ai</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-purple-400">
                      <Phone className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Téléphone</p>
                      <p className="text-neutral-400">+1 (514) 555-0123</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-purple-400">
                      <MapPin className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Adresse</p>
                      <p className="text-neutral-400">
                        Cercle de Gouvernance de l&apos;IA<br />
                        1234 Rue Sherbrooke Ouest<br />
                        Montréal, QC H3G 1H4
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map placeholder */}
              <Card className="overflow-hidden rounded-3xl border border-neutral-200 bg-white hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300">
                <CardContent className="p-0">
                  <div className="aspect-[4/3] bg-neutral-50 flex items-center justify-center">
                    <div className="text-center p-8">
                      <MapPin className="size-12 mx-auto text-neutral-300 mb-4" />
                      <p className="text-neutral-500 font-medium">
                        Carte à venir
                      </p>
                      <p className="text-sm text-neutral-400 mt-1">
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
