import { Link } from "react-router-dom";
import {
  Linkedin,
  Twitter,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  Shield,
  Send,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const footerColumns = [
  {
    title: "Produit",
    links: [
      { to: "/portail", label: "Portail IAG" },
      { to: "/services#diagnostic", label: "Diagnostic IA" },
      { to: "/services", label: "Services" },
      { to: "/tarification", label: "Tarification" },
      { to: "/agents", label: "Agents IA" },
    ],
  },
  {
    title: "Le Cercle",
    links: [
      { to: "/a-propos", label: "Notre mission" },
      { to: "/experts", label: "Nos experts" },
      { to: "/rejoindre", label: "Devenir membre" },
      { to: "/actualites", label: "Actualités" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { to: "/ressources", label: "Guides et cadres" },
      { to: "/ressources#outils", label: "Boîte à outils" },
      { to: "/ressources#veille", label: "Veille réglementaire" },
      { to: "/ressources#etudes", label: "Études de cas" },
      { to: "/evenements", label: "Événements" },
    ],
  },
];

const socialLinks = [
  { href: "https://linkedin.com", label: "LinkedIn", icon: Linkedin },
  { href: "https://x.com", label: "X (Twitter)", icon: Twitter },
  { href: "mailto:info@gouvernance.ai", label: "Courriel", icon: Mail },
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
    <footer className="max-w-7xl mr-auto mb-12 ml-auto pr-6 pl-6 pt-8">
      <div className="bg-neutral-950 rounded-[40px] px-8 py-12 sm:px-12 sm:py-16 relative overflow-hidden text-white">
        {/* Background + subtle glow */}
        <div className="bg-black w-full h-full absolute top-0 left-0" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ab54f3]/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#ab54f3]/5 blur-[100px] pointer-events-none" />

        {/* ── Top section: 5-column grid ── */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand + contact — spans 2 cols on lg */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
              <img
                src="/logo-light.svg"
                alt="Cercle de Gouvernance de l'IA"
                className="h-10 w-auto"
              />
            </Link>

            <p className="text-neutral-400 max-w-xs mb-8 leading-relaxed mt-6 text-[15px]">
              Le Cercle accompagne les dirigeants dans l&apos;adoption
              responsable de l&apos;IA en éclairant leurs décisions
              stratégiques et en renforçant la conformité.
            </p>

            {/* Contact details */}
            <div className="space-y-3">
              <a
                href="mailto:info@gouvernance.ai"
                className="flex items-center gap-3 text-sm text-neutral-400 hover:text-white transition-colors group"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 group-hover:bg-[#ab54f3]/20 transition-colors">
                  <Mail className="w-3.5 h-3.5 text-[#ab54f3]" />
                </span>
                info@gouvernance.ai
              </a>
              <a
                href="tel:+15145551234"
                className="flex items-center gap-3 text-sm text-neutral-400 hover:text-white transition-colors group"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 group-hover:bg-[#ab54f3]/20 transition-colors">
                  <Phone className="w-3.5 h-3.5 text-[#ab54f3]" />
                </span>
                +1 (514) 555-1234
              </a>
              <div className="flex items-center gap-3 text-sm text-neutral-400">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5">
                  <MapPin className="w-3.5 h-3.5 text-[#ab54f3]" />
                </span>
                Montréal, QC, Canada
              </div>
            </div>
          </div>

          {/* Nav columns — 1 col each */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-medium mb-6">{col.title}</h4>
              <ul className="space-y-4 text-sm text-neutral-500">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Newsletter + Social row ── */}
        <div className="relative z-10 mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8">
          <div className="flex-1 max-w-lg">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Send className="w-3.5 h-3.5 text-[#ab54f3]" />
              Infolettre
            </h4>
            <p className="text-xs text-neutral-500 mb-3 leading-relaxed">
              Recevez nos analyses et guides en gouvernance IA.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                name="email"
                placeholder="Entrez votre courriel"
                required
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ab54f3]/30 focus:border-[#ab54f3]/40 transition-all text-white placeholder:text-neutral-500"
              />
              <button
                type="submit"
                className="bg-white text-neutral-950 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-neutral-200 transition-colors whitespace-nowrap"
              >
                S&apos;inscrire
              </button>
            </form>
          </div>

          <div className="flex-shrink-0">
            <h4 className="text-sm font-medium mb-3">Suivez-nous</h4>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="w-9 h-9 bg-white/5 rounded-full flex items-center justify-center hover:bg-[#ab54f3]/20 hover:text-[#ab54f3] transition-all duration-200"
                  aria-label={social.label}
                  title={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Certifications / trust bar ── */}
        <div className="relative z-10 mt-14 pt-8 border-t border-white/[0.06]">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-neutral-500">
            <span className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#ab54f3]" />
              Conforme Loi 25
            </span>
            <span className="hidden sm:block w-px h-3 bg-white/10" />
            <span className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#ab54f3]" />
              Aligné EU AI Act
            </span>
            <span className="hidden sm:block w-px h-3 bg-white/10" />
            <span>ISO/IEC 42001</span>
            <span className="hidden sm:block w-px h-3 bg-white/10" />
            <span>Cadre NIST AI RMF</span>
            <span className="hidden sm:block w-px h-3 bg-white/10" />
            <span>Principes OCDE</span>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="relative z-10 mt-8 pt-8 border-t border-white/[0.06] flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-neutral-600">
            © {new Date().getFullYear()} Cercle de Gouvernance de l&apos;IA. Tous droits réservés.
          </p>
          <div className="flex items-center gap-8 text-xs text-neutral-600">
            <Link to="/confidentialite" className="hover:text-white transition-colors">
              Confidentialité
            </Link>
            <Link to="/mentions-legales" className="hover:text-white transition-colors">
              Mentions légales
            </Link>
            <Link to="/accessibilite" className="hover:text-white transition-colors">
              Accessibilité
            </Link>
            <button
              type="button"
              onClick={scrollToTop}
              className="flex items-center gap-2 hover:text-white transition-colors group"
            >
              Haut
              <span className="flex items-center justify-center w-7 h-7 rounded-full border border-white/15 group-hover:border-[#ab54f3]/50 group-hover:bg-[#ab54f3]/10 transition-all">
                <ArrowUp className="w-3 h-3" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
