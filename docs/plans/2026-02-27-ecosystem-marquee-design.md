# Ecosystem Marquee — Design

## Goal

Add a "Découvrez l'écosystème" section to the homepage showing logos of 13 Québec AI ecosystem entities in a continuous marquee (infinite scroll left-to-right). Logos are displayed in grayscale, clickable (external links), and grouped under 3 category labels.

## Placement

After the hero section, before the MCP Agent Showcase.

## Visual Design

- **Background:** `bg-neutral-50`, `py-12`
- **Title:** "Découvrez l'écosystème" — centered, `text-xl font-semibold`
- **Category badges:** 3 inline badges below the title: "Recherche & Innovation", "Gouvernement & Régulateurs", "Industrie & Accélération" — `text-xs text-neutral-500`
- **Marquee:** Full width, CSS `@keyframes marquee` animation, `translateX(0)` to `translateX(-50%)`, ~30s linear infinite
- **Edge masks:** Gradient fade on left/right edges (transparent → white → transparent)
- **Logo treatment:** `grayscale(100%) opacity-60` default, `grayscale(0) opacity-100` on hover, `transition-all duration-300`
- **Logo size:** `h-8` (32px height), auto width
- **Spacing:** `gap-12` between logos
- **Pause on hover:** `animation-play-state: paused` on container hover
- **Reduced motion:** `prefers-reduced-motion: reduce` → static flex-wrap layout, no animation

## Entities (13 total)

### Recherche & Innovation (5)
| Entity | URL |
|--------|-----|
| Mila — Institut québécois d'IA | https://mila.quebec |
| IVADO | https://ivado.ca |
| OBVIA | https://www.obvia.ca |
| CIRANO | https://cirano.qc.ca |
| Scale AI | https://www.scaleai.ca |

### Gouvernement & Régulateurs (3)
| Entity | URL |
|--------|-----|
| Min. Cybersécurité et Numérique | https://www.quebec.ca/gouvernement/ministere/cybersecurite-numerique |
| CAI | https://www.cai.gouv.qc.ca |
| Conseil de l'innovation du Québec | https://conseilinnovation.quebec |

### Industrie & Accélération (5)
| Entity | URL |
|--------|-----|
| CDPQ | https://www.cdpq.com |
| Investissement Québec | https://www.investquebec.com |
| Centech | https://centech.co |
| District 3 | https://d3center.ca |
| Montréal International | https://www.montrealinternational.com |

## Technical Details

- **Component:** `src/components/home/EcosystemMarquee.tsx` (separate file)
- **Logos:** Scraped from entity websites (favicon/logo), stored in `public/logos/ecosystem/`
- **Data:** Constant array in the component (name, url, logo filename)
- **DOM:** Logos duplicated 2x for seamless loop
- **Links:** `<a href={url} target="_blank" rel="noopener noreferrer">`
- **No i18n:** Static French-only marketing content
- **No state:** Purely presentational component
- **Integration:** Import in `HomePage.tsx`, placed between hero closing `</section>` and `<McpAgentShowcase />`
