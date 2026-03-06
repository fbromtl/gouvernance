# Design : PWA Mobile pour le Portail GiA

> Date : 2026-03-05
> Statut : Approuve

## Contexte

Le portail SaaS de gouvernance IA (30+ modules, 6 categories) est fonctionnel sur desktop mais l'experience mobile se limite a un hamburger menu. L'objectif est de transformer le portail en PWA avec une navigation mobile native et un support offline.

## Decisions de design

### 1. Bottom Tab Bar (navigation mobile)

Barre fixe en bas de l'ecran, visible uniquement sur mobile (`lg:hidden`), avec les 6 categories existantes de `nav-config.ts` :

| Onglet | Icone | Label | Route par defaut |
|--------|-------|-------|-----------------|
| Apercu | LayoutDashboard | Apercu | `/dashboard` |
| Inventaire | Bot | Inventaire | `/ai-systems` |
| Gouvernance | Shield | Gouvernance | `/governance` |
| Risques | AlertTriangle | Risques | `/risks` |
| Operations | Activity | Operations | `/monitoring` |
| Organisation | Building2 | Org. | `/membres` |

Comportement :
- Tap sur un onglet : navigue vers la route par defaut
- Tap sur l'onglet actif : ouvre un Sheet avec les sous-pages de la categorie
- Badge de notification si pertinent (incidents, actions en attente)
- Onglet actif en surbrillance `brand-forest`
- Hauteur : 64px + `env(safe-area-inset-bottom)`

Le header mobile perd le hamburger et garde : titre page courante, notifications, avatar.

### 2. PWA — Service Worker et Offline

Plugin : `vite-plugin-pwa` avec Workbox (generateSW).

Strategies de cache :
- **App Shell** (precache) : HTML, CSS, JS, fonts, icones — offline immediat
- **API Supabase** (StaleWhileRevalidate) : GET servis depuis cache puis rafraichis en arriere-plan
- **Images** (CacheFirst, expiration 7 jours)
- **Fonts Google** (CacheFirst, expiration 30 jours)

Indicateur offline : bandeau jaune `brand-amber` en haut — "Mode hors ligne — donnees de la derniere visite". Disparait au retour de la connexion.

### 3. Manifest et Icones

- `theme_color` : `#57886c` (brand-forest)
- `background_color` : `#f7f6f4`
- Icones PNG : 192x192, 512x512, maskable 512x512
- Apple touch icon PNG 180x180
- Mise a jour meta tags `index.html`

### 4. FloatingChat mobile

- Bouton flottant positionne au-dessus de la bottom bar (bottom: 80px)
- Au tap : bottom sheet plein ecran (Framer Motion slide-up, `y: "100%"` vers `y: 0`)
- Header du sheet : "Assistant IA" + bouton fermer
- Couvre toute la hauteur, bottom bar masquee pendant le chat
- Dimensions adaptatives : `w-full h-full` sur mobile au lieu de `w-[380px] h-[520px]`

### 5. Install Prompt

- Banniere discrete en haut du portail apres la 3e visite authentifiee
- Texte : "Installez GiA sur votre appareil pour un acces rapide"
- Boutons : "Installer" + fermer (x)
- Utilise `beforeinstallprompt` du navigateur
- Si fermee, ne reapparait pas (`localStorage` flag)
- Style : fond `brand-forest`, texte blanc, coins arrondis

### 6. Ajustements responsive

- Safe areas : `padding-bottom: env(safe-area-inset-bottom)` sur la bottom bar
- Main content : `pb-20` sur mobile pour ne pas etre masque par la bottom bar
- FloatingChat : responsive au lieu de dimensions fixes

## Fichiers impactes

- `vite.config.ts` — ajout vite-plugin-pwa
- `public/manifest.json` — mise a jour couleurs + icones
- `index.html` — meta tags, theme-color, icones
- `src/portail/layout/PortailLayout.tsx` — integration bottom bar + padding
- `src/portail/layout/AppHeader.tsx` — suppression hamburger mobile, header compact
- `src/portail/layout/BottomTabBar.tsx` — nouveau composant
- `src/portail/components/FloatingChat.tsx` — bottom sheet mobile
- `src/components/PWAInstallPrompt.tsx` — nouveau composant
- `src/components/OfflineBanner.tsx` — nouveau composant
- `src/hooks/usePWAInstall.ts` — nouveau hook
- `src/hooks/useOnlineStatus.ts` — nouveau hook
- `public/icons/` — icones PNG generees
