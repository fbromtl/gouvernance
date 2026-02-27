const ECOSYSTEM = [
  // Recherche & Innovation
  { name: "Mila", logo: "/logos/ecosystem/mila.svg", url: "https://mila.quebec" },
  { name: "IVADO", logo: "/logos/ecosystem/ivado.svg", url: "https://ivado.ca" },
  { name: "OBVIA", logo: "/logos/ecosystem/obvia.svg", url: "https://www.obvia.ca" },
  { name: "CIRANO", logo: "/logos/ecosystem/cirano.png", url: "https://cirano.qc.ca" },
  { name: "Scale AI", logo: "/logos/ecosystem/scaleai.png", url: "https://www.scaleai.ca" },
  // Gouvernement & Régulateurs
  { name: "Min. Cybersécurité et Numérique", logo: "/logos/ecosystem/mcn.svg", url: "https://www.quebec.ca/gouvernement/ministere/cybersecurite-numerique" },
  { name: "CAI", logo: "/logos/ecosystem/cai.svg", url: "https://www.cai.gouv.qc.ca" },
  { name: "Conseil de l'innovation", logo: "/logos/ecosystem/conseil-innovation.png", url: "https://conseilinnovation.quebec" },
  // Industrie & Accélération
  { name: "CDPQ", logo: "/logos/ecosystem/cdpq.svg", url: "https://www.cdpq.com" },
  { name: "Investissement Québec", logo: "/logos/ecosystem/investissement-quebec.png", url: "https://www.investquebec.com" },
  { name: "Centech", logo: "/logos/ecosystem/centech.svg", url: "https://centech.co" },
  { name: "District 3", logo: "/logos/ecosystem/district3.png", url: "https://d3center.ca" },
  { name: "Montréal International", logo: "/logos/ecosystem/montreal-international.svg", url: "https://www.montrealinternational.com" },
];

const CATEGORIES = [
  "Recherche & Innovation",
  "Gouvernement & Régulateurs",
  "Industrie & Accélération",
];

export function EcosystemMarquee() {
  // Duplicate items for seamless loop
  const items = [...ECOSYSTEM, ...ECOSYSTEM];

  return (
    <section className="bg-neutral-50 py-12 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-3">
          Découvrez l'écosystème
        </h2>
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <span
              key={cat}
              className="text-xs text-neutral-500 bg-neutral-100 rounded-full px-3 py-1"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Marquee */}
      <div className="relative group">
        {/* Edge masks */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-neutral-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-neutral-50 to-transparent z-10 pointer-events-none" />

        {/* Scrolling track */}
        <div className="flex items-center gap-12 animate-marquee group-hover:[animation-play-state:paused]">
          {items.map((entity, i) => (
            <a
              key={`${entity.name}-${i}`}
              href={entity.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              title={entity.name}
            >
              <img
                src={entity.logo}
                alt={entity.name}
                className="h-8 w-auto object-contain"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee {
            animation: none;
            flex-wrap: wrap;
            justify-content: center;
            gap: 2rem;
            padding: 0 1rem;
          }
        }
      `}</style>
    </section>
  );
}
