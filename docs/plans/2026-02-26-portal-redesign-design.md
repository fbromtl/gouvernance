# Portal Redesign — Homepage Style Design System

**Date** : 2026-02-26
**Statut** : Approuve

## Objectif

Redesigner tout le portail (layout, dashboard, widgets, charts) pour matcher le style visuel de la homepage publique. Creer un design system portail avec des composants wrapper dedies.

## Decisions cles

- **Approche** : B — Nouveau design system (composants wrapper)
- **Scope** : Tout le portail (layout + dashboard + 11 widgets + charts)
- **Sidebar** : Style clair (blanc, bordures subtiles, icones purple)
- **Charts** : Conteneurs ET style interne Recharts
- **Dark mode** : Supprime (mode clair uniquement)
- **Widgets haut de page** : Garder en place, restyler

## Palette de couleurs

| Token | Valeur | Usage |
|-------|--------|-------|
| bg-page | neutral-50/50 | Fond principal du contenu |
| bg-card | white | Cartes et widgets |
| bg-card-alt | neutral-50 | KPI cards, elements secondaires |
| border-card | neutral-100 | Bordures de cartes |
| border-layout | neutral-100 | Bordures sidebar/header |
| text-title | neutral-900 | Titres |
| text-body | neutral-700 | Texte courant |
| text-muted | neutral-500 | Texte secondaire |
| text-label | neutral-400 | Labels uppercase |
| accent-purple | #ab54f3 | Accent principal |
| accent-purple-dark | #8b3fd4 | Hover/pressed |
| semantic-green | emerald-500 | Conformite, succes |
| semantic-red | red-500 | Incidents, erreurs |
| semantic-amber | amber-500 | Alertes, risques |
| semantic-blue | blue-500 | Info |

## Composants du design system

### 1. PortalCard (`src/portail/components/ui/PortalCard.tsx`)

Container standard remplacant les shadcn `Card` dans le portail.

```
Classes: bg-white rounded-xl border border-neutral-100 p-5
         hover:shadow-lg hover:shadow-neutral-200/50 transition-all duration-300
Props: className?, children, hoverable? (default true)
```

### 2. PortalCardHeader (`src/portail/components/ui/PortalCardHeader.tsx`)

Header de carte avec label uppercase.

```
Classes: text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4
Props: children, className?, action? (ReactNode pour bouton/lien a droite)
```

### 3. PortalKPI (`src/portail/components/ui/PortalKPI.tsx`)

Carte KPI pour les metriques en haut du dashboard.

```
Structure:
  <div bg-white rounded-xl border border-neutral-100 p-5 group relative overflow-hidden>
    <div flex items-start justify-between>
      <div icon-circle bg-{color}/10 rounded-xl>
        <Icon className={color} />
      </div>
      {trend && <TrendIcon />}
    </div>
    <div mt-4>
      <p text-2xl font-bold>{value}</p>
      <p text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1>{label}</p>
    </div>
    <div absolute bottom-0 left-0 h-0.5 w-0 bg-[#ab54f3]/40 group-hover:w-full />
  </div>

Props: icon, value, label, color, trend?, href?
```

### 4. PortalChartContainer (`src/portail/components/ui/PortalChartContainer.tsx`)

Wrapper pour charts Recharts.

```
Structure:
  <div bg-white rounded-xl border border-neutral-100>
    <div p-5 pb-0>
      <PortalCardHeader>{title}</PortalCardHeader>
    </div>
    <div p-2>
      {children} (Recharts component)
    </div>
  </div>

Props: title, children, className?, action?
```

## Layout du portail

### PortailLayout.tsx
- `bg-background` → `bg-neutral-50/50`

### AppSidebar.tsx
- `bg-card border-r border-border/60` → `bg-white border-r border-neutral-100`
- Group labels: `text-foreground/35` → `text-neutral-300 uppercase tracking-widest text-[10px]`
- Nav links: `text-foreground/65` → `text-neutral-500`
- Nav hover: `hover:bg-muted/80` → `hover:bg-neutral-50 hover:text-neutral-900`
- Active: garder `bg-[#ab54f3]/10 text-[#ab54f3]` avec barre laterale
- Brand header: `text-foreground` → `text-neutral-900`
- Supprimer tous les `dark:` prefixes

### AppHeader.tsx
- `bg-card border-b border-border/60` → `bg-white border-b border-neutral-100`
- Breadcrumbs parents: `text-foreground/50` → `text-neutral-400`
- Breadcrumb actif: `text-foreground` → `text-neutral-900`
- Icons: `text-foreground/50` → `text-neutral-400`
- Supprimer tous les `dark:` prefixes

## Dashboard Page

### Page header
- Titre: `text-foreground` → `text-neutral-900 tracking-tight`
- Sous-titre: `text-muted-foreground` → `text-neutral-500`
- Demo badge: garder `bg-[#ab54f3]/15 text-[#ab54f3]`

### KPI Cards
Remplacer par `<PortalKPI>` — 4 cartes en grille `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`

### Membership widget
- Observer (gradient purple): garder tel quel
- Membre (profil): restyler avec `bg-white rounded-xl border border-neutral-100`

### Grille de widgets
Garder la disposition actuelle (rows de 3, 3, 2), remplacer chaque `<Card>` par `<PortalCard>`

### Quick Access
Remplacer `<Card>` par `bg-white rounded-xl border border-neutral-100 hover:shadow-lg`

## Widgets (11 composants)

Tous les widgets dans `src/portail/components/dashboard/` :

### Changements communs a tous
- Remplacer `<Card>/<CardHeader>/<CardTitle>/<CardContent>` par `<PortalCard>` + `<PortalCardHeader>`
- Supprimer tous les `dark:` prefixes
- Texte: `text-foreground` → `text-neutral-900`, `text-muted-foreground` → `text-neutral-500`
- Bordures: `border-border` → `border-neutral-100`

### Charts Recharts — changements de style

**chart-theme.ts** — Ajouter :
```ts
export const RECHARTS_STYLE = {
  grid: { stroke: '#f5f5f5' },
  axis: { tick: { fill: '#a3a3a3', fontSize: 11 } },
  tooltip: {
    contentStyle: {
      backgroundColor: 'white',
      border: '1px solid #f5f5f5',
      borderRadius: '12px',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
      padding: '12px',
    },
    labelStyle: {
      fontSize: '10px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: '#a3a3a3',
    },
  },
  bar: { radius: [4, 4, 0, 0] },
};
```

**ComplianceRadarChart** : Tooltip restyle, score badge `bg-neutral-50 rounded-lg`
**RiskDistributionChart** : Legende `text-[10px] uppercase`, centre label plus gros
**IncidentTimelineChart** : Barres arrondies en haut, tooltip avec header uppercase
**SystemsByTypeChart** : Legende scrollable, couleurs inchangees
**TopRiskSystemsTable** : Lignes `border-b border-neutral-100`, badges `rounded-full text-[9px]`
**BiasDebtWidget** : Barre horizontale et pills restyled
**PendingActionsWidget** : Timeline dots + texte en neutral
**ReviewsDueWidget** : Pills d'urgence restyled
**RecentDecisionsWidget** : Timeline avec dots colores
**AgentActivityWidget** : Meme pattern timeline
**DiagnosticResultWidget** : Gauge et barres de progression restyled

## Fichiers concernes (liste complete)

### Nouveaux fichiers (4)
- `src/portail/components/ui/PortalCard.tsx`
- `src/portail/components/ui/PortalCardHeader.tsx`
- `src/portail/components/ui/PortalKPI.tsx`
- `src/portail/components/ui/PortalChartContainer.tsx`

### Fichiers modifies (~17)
- `src/portail/layout/PortailLayout.tsx`
- `src/portail/layout/AppSidebar.tsx`
- `src/portail/layout/AppHeader.tsx`
- `src/portail/pages/DashboardPage.tsx`
- `src/portail/components/dashboard/chart-theme.ts`
- `src/portail/components/dashboard/ComplianceRadarChart.tsx`
- `src/portail/components/dashboard/RiskDistributionChart.tsx`
- `src/portail/components/dashboard/IncidentTimelineChart.tsx`
- `src/portail/components/dashboard/SystemsByTypeChart.tsx`
- `src/portail/components/dashboard/TopRiskSystemsTable.tsx`
- `src/portail/components/dashboard/BiasDebtWidget.tsx`
- `src/portail/components/dashboard/PendingActionsWidget.tsx`
- `src/portail/components/dashboard/ReviewsDueWidget.tsx`
- `src/portail/components/dashboard/RecentDecisionsWidget.tsx`
- `src/portail/components/dashboard/AgentActivityWidget.tsx`
- `src/portail/components/dashboard/DiagnosticResultWidget.tsx`

## Responsive

Aucun changement de breakpoints — garder la grille responsive actuelle.
Les composants wrapper respectent la meme structure responsive.

## Verification

1. `npx tsc --noEmit` — zero erreurs TypeScript
2. Check visuel dev server (port 5173) :
   - Sidebar claire avec icones purple
   - Header blanc avec breadcrumbs
   - KPI cards style homepage
   - Charts avec tooltips restyled
   - Widgets coherents
3. Responsive : mobile, tablette, desktop
4. Demo mode fonctionne toujours
