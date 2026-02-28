import { Link } from "react-router-dom";
import {
  Linkedin,
  Twitter,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  Send,
  Shield,
  Circle,
  BookOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const footerColumns = [
  {
    title: "Le Cercle",
    icon: Circle,
    links: [
      { to: "/a-propos", label: "Notre mission" },
      { to: "/a-propos#approche", label: "Notre approche" },
      { to: "/experts", label: "Nos experts" },
      { to: "/rejoindre", label: "Devenir membre" },
      { to: "/actualites", label: "Actualités" },
    ],
  },
  {
    title: "Plateforme",
    icon: Shield,
    links: [
      { to: "/tarifs", label: "Tarifs" },
      { to: "/diagnostic", label: "Diagnostic IA" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Ressources",
    icon: BookOpen,
    links: [
      { to: "/ressources", label: "Guides et cadres" },
      { to: "/ressources#outils", label: "Boîte à outils" },
      { to: "/ressources#veille", label: "Veille réglementaire" },
      { to: "/ressources#etudes", label: "Études de cas" },
      { to: "/actualites", label: "Actualités" },
    ],
  },
];

const socialLinks = [
  { href: "https://linkedin.com", label: "LinkedIn", icon: Linkedin, hoverClass: "hover:bg-[#0A66C2] hover:border-[#0A66C2]" },
  { href: "https://x.com", label: "X (Twitter)", icon: Twitter, hoverClass: "hover:bg-foreground hover:border-foreground" },
  { href: "mailto:info@gouvernance.ai", label: "Courriel", icon: Mail, hoverClass: "hover:bg-brand-purple hover:border-brand-purple" },
];

const legalLinks = [
  { to: "/confidentialite", label: "Confidentialité" },
  { to: "/mentions-legales", label: "Mentions légales" },
  { to: "/accessibilite", label: "Accessibilité" },
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export function Footer() {
  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = new FormData(form).get("email");
    if (email) {
      console.log("Newsletter signup:", email);
      form.reset();
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer>
      {/* ============================================================ */}
      {/*  MAIN FOOTER                                                  */}
      {/* ============================================================ */}
      <div className="bg-[#1e1a30]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Top section */}
          <div className="py-12 lg:py-16 grid gap-10 lg:gap-8 lg:grid-cols-12">
            {/* Brand column */}
            <div className="lg:col-span-4">
              <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
                <img
                  src="/logo-light.svg"
                  alt="Cercle de Gouvernance de l'IA"
                  className="h-10 w-auto"
                />
              </Link>
              <p className="mt-5 text-sm text-white/60 leading-relaxed max-w-sm">
                Le Cercle de Gouvernance de l&apos;IA accompagne les dirigeants dans l&apos;adoption
                responsable de l&apos;intelligence artificielle en éclairant leurs décisions
                stratégiques et en renforçant la conformité aux réglementations.
              </p>

              {/* Contact info */}
              <div className="mt-6 space-y-3">
                <a
                  href="mailto:info@gouvernance.ai"
                  className="flex items-center gap-2.5 text-sm text-white/55 hover:text-white transition-colors group"
                >
                  <span className="flex items-center justify-center size-8 rounded-lg bg-white/8 group-hover:bg-brand-purple/20 transition-colors">
                    <Mail className="size-3.5 text-brand-purple-light" />
                  </span>
                  info@gouvernance.ai
                </a>
                <a
                  href="tel:+15145551234"
                  className="flex items-center gap-2.5 text-sm text-white/55 hover:text-white transition-colors group"
                >
                  <span className="flex items-center justify-center size-8 rounded-lg bg-white/8 group-hover:bg-brand-purple/20 transition-colors">
                    <Phone className="size-3.5 text-brand-purple-light" />
                  </span>
                  +1 (514) 555-1234
                </a>
                <div className="flex items-center gap-2.5 text-sm text-white/55">
                  <span className="flex items-center justify-center size-8 rounded-lg bg-white/8">
                    <MapPin className="size-3.5 text-brand-purple-light" />
                  </span>
                  Montréal, Québec, Canada
                </div>
              </div>
            </div>

            {/* Navigation columns */}
            <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-8">
              {footerColumns.map((col) => {
                const Icon = col.icon;
                return (
                <div key={col.title}>
                  <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/80 mb-4">
                    <Icon className="size-3.5 shrink-0 text-brand-purple" aria-hidden />
                    {col.title}
                  </h3>
                  <ul className="space-y-2.5">
                    {col.links.map((link) => (
                      <li key={link.to}>
                        <Link
                          to={link.to}
                          className="text-sm text-white/50 hover:text-white hover:translate-x-0.5 transition-all duration-200 inline-block"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
              })}
            </div>

            {/* Newsletter column */}
            <div className="lg:col-span-3">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/80 mb-4">
                <Mail className="size-3.5 shrink-0 text-brand-purple" aria-hidden />
                Infolettre
              </h3>
              <p className="text-sm text-white/50 leading-relaxed mb-4">
                Recevez nos analyses, guides et actualités en gouvernance de l&apos;IA directement
                dans votre boîte de réception.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="votre@email.com"
                    required
                    className="pl-10 bg-white/8 border-white/15 text-white placeholder:text-white/35 focus-visible:ring-brand-purple/50 focus-visible:border-brand-purple/40 h-11 rounded-lg"
                  />
                </div>
                <Button type="submit" className="w-full gap-2">
                  <Send className="size-3.5" />
                  S&apos;inscrire à l&apos;infolettre
                </Button>
              </form>

              {/* Social links */}
              <div className="mt-6">
                <p className="text-xs text-white/40 mb-3 uppercase tracking-wider">Suivez-nous</p>
                <div className="flex gap-2">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target={social.href.startsWith("http") ? "_blank" : undefined}
                      rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className={cn(
                        "flex items-center justify-center size-9 rounded-lg border border-white/15 text-white/60 transition-all duration-200",
                        "hover:text-white hover:scale-105",
                        social.hoverClass
                      )}
                      aria-label={social.label}
                      title={social.label}
                    >
                      <social.icon className="size-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Certifications / trust bar */}
          <div className="border-t border-white/8 py-6">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-white/35">
              <span className="flex items-center gap-1.5">
                <Shield className="size-3.5" />
                Conforme Loi 25
              </span>
              <Separator orientation="vertical" className="h-3 bg-white/15 hidden sm:block" />
              <span>Aligné ISO/IEC 42001</span>
              <Separator orientation="vertical" className="h-3 bg-white/15 hidden sm:block" />
              <span>Cadre NIST AI RMF</span>
              <Separator orientation="vertical" className="h-3 bg-white/15 hidden sm:block" />
              <span>Principes OCDE</span>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/8 py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Copyright + legal */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <p className="text-xs text-white/40">
                  © {new Date().getFullYear()} Cercle de Gouvernance de l&apos;IA
                </p>
                <div className="flex items-center gap-1">
                  {legalLinks.map((link, i) => (
                    <span key={link.to} className="flex items-center">
                      {i > 0 && <span className="text-white/20 mx-1.5">·</span>}
                      <Link
                        to={link.to}
                        className="text-xs text-white/35 hover:text-white/60 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </span>
                  ))}
                </div>
              </div>

              {/* Back to top */}
              <button
                type="button"
                onClick={scrollToTop}
                className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors group self-start sm:self-auto"
              >
                Retour en haut
                <span className="flex items-center justify-center size-7 rounded-full border border-white/15 group-hover:border-white/30 group-hover:bg-white/5 transition-all">
                  <ArrowUp className="size-3" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
