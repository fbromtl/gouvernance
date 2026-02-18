# Module 14 — Tableaux de Bord Board-Ready

> **Route** : `/dashboard`
> **Priorité** : MVP (Phase 1)
> **Dépendances** : Tous les autres modules (données agrégées)

## 1. Objectif

Point d'entrée principal de la plateforme. Offrir une vision synthétique et en temps réel de l'ensemble du portefeuille de systèmes IA de l'organisation. Reporting de gouvernance prêt pour comité de direction et conseil d'administration, avec visualisations interactives adaptées aux utilisateurs non techniques.

## 2. User Stories

| ID | En tant que... | Je veux... | Afin de... |
|----|---------------|-----------|-----------|
| US-14-01 | Admin org | voir un tableau de bord exécutif en ouvrant la plateforme | comprendre la situation d'un coup d'œil |
| US-14-02 | Sponsor | voir les métriques clés de gouvernance | piloter la stratégie IA |
| US-14-03 | Admin org | générer un rapport PDF pour le CA | présenter en réunion |
| US-14-04 | Compliance officer | personnaliser les widgets du dashboard | adapter la vue à mes besoins |
| US-14-05 | Admin org | comparer les métriques dans le temps | suivre les tendances |
| US-14-06 | Sponsor | utiliser le mode présentation plein écran | projeter en réunion |

## 3. Indicateurs principaux (KPI cards)

### Ligne 1 — Métriques clés (4 cards)
| KPI | Source | Visualisation |
|-----|--------|--------------|
| **Systèmes IA actifs** | Module 01 (statut = production) | Gros chiffre + tendance |
| **Score de conformité global** | Module 13 | Jauge % avec couleur |
| **Incidents actifs** | Module 06 (ouverts) | Chiffre + badge sévérité |
| **Alertes en attente** | Module 10 (non acquittées) + Module 08 (revues échues) | Chiffre + badge |

### Ligne 2 — Risques et équité (3 cards)
| KPI | Source | Visualisation |
|-----|--------|--------------|
| **Répartition par risque** | Module 03 | Donut chart (interdit/haut/limité/minimal) |
| **Biais ouverts** | Module 05 | Chiffre par sévérité |
| **Décisions en attente** | Module 04 (statut submitted/in_review) | Chiffre + liste |

## 4. Visualisations interactives

### Heatmap des risques
- Source : Module 03
- Matrice impact × probabilité avec systèmes positionnés
- Clic → drill-down vers le système

### Conformité par référentiel
- Source : Module 13
- Radar chart avec un axe par référentiel activé
- Codes couleur vert/jaune/rouge

### Timeline des incidents
- Source : Module 06
- Graphique barres empilées par mois (par sévérité)
- Overlay : MTTR moyen

### Répartition des systèmes
- Par département (barres horizontales)
- Par type (donut)
- Par statut de cycle de vie (barres empilées)

### Tendances
- Graphique linéaire multi-séries :
  - Score de conformité (mois par mois)
  - Nombre d'incidents
  - Nombre de biais ouverts
- Période sélectionnable : 3, 6, 12 mois, tout

## 5. Fonctionnalités interactives

### Filtrage
- Par département
- Par juridiction (si multi-juridictionnel)
- Par niveau de risque
- Par statut de cycle de vie
- Par responsable

### Drill-down
- Clic sur n'importe quelle métrique → navigation vers le module source
- Clic sur un système dans un graphique → fiche système (Module 01)

### Comparaison temporelle
- Sélecteur de période (mois, trimestre, année)
- Comparaison avec la période précédente (△ et %)

### Personnalisation
- Widgets déplaçables par drag-and-drop (layout en grille)
- Possibilité de masquer/afficher des widgets
- Sauvegarde de la configuration par utilisateur
- Configuration par défaut par rôle

## 6. Rapport CA / Direction

### Génération automatique
Bouton "Générer rapport CA" → PDF formaté contenant :

1. **Page de garde** : logo organisation, date, période couverte
2. **Résumé exécutif** : 5-6 métriques clés avec tendance
3. **Portefeuille IA** : nombre de systèmes par catégorie et risque
4. **Conformité** : score par référentiel, écarts principaux
5. **Risques** : top 5 risques, systèmes critiques
6. **Incidents** : résumé (nombre, sévérité, MTTR), incidents majeurs
7. **Biais & équité** : état des lieux, actions en cours
8. **Décisions majeures du trimestre** : top 5 décisions
9. **Plan d'action** : actions en cours et à venir
10. **Annexe** : liste complète des systèmes

### Options
- Période couverte (sélectionnable)
- Langue : fr / en
- Inclusion/exclusion de sections
- Ajout de commentaires personnalisés par section

## 7. Mode présentation

- Plein écran, navigation par flèches entre les vues
- Slides automatiques :
  1. KPI principaux
  2. Heatmap risques
  3. Conformité radar
  4. Incidents timeline
  5. Top 5 systèmes à risque
- Auto-refresh toutes les 60 secondes
- Thème sombre disponible

## 8. Widgets disponibles

| Widget | Type | Taille | Source |
|--------|------|--------|--------|
| `KpiCard` | Métrique unique | 1×1 | Configurable |
| `RiskHeatmap` | Matrice interactive | 2×2 | Module 03 |
| `ComplianceRadar` | Radar chart | 2×2 | Module 13 |
| `IncidentTimeline` | Barres empilées | 2×1 | Module 06 |
| `SystemsByDepartment` | Barres horizontales | 1×1 | Module 01 |
| `SystemsByType` | Donut | 1×1 | Module 01 |
| `TrendChart` | Lignes multi-séries | 2×1 | Multi-module |
| `TopRiskSystems` | Table top 5 | 2×1 | Module 03 |
| `PendingActions` | Liste | 1×2 | Multi-module |
| `RecentDecisions` | Timeline | 1×2 | Module 04 |
| `BiasDebt` | Indicateur | 1×1 | Module 05 |
| `ReviewsDue` | Liste + compteur | 1×1 | Module 01, 08 |

## 9. Règles métier

1. Le dashboard se charge avec les données en temps réel (pas de cache > 5 min)
2. Les métriques sont calculées côté serveur (Supabase RPC ou Edge Functions)
3. La configuration de layout est sauvegardée par utilisateur dans `user_preferences`
4. Le rapport CA est horodaté et hashé pour intégrité
5. Le mode présentation ne montre pas les données de configuration (sécurité)
6. Les filtres appliqués affectent tous les widgets simultanément

## 10. Composants UI

| Composant | Librairie | Usage |
|-----------|-----------|-------|
| `DashboardGrid` | react-grid-layout | Grille de widgets drag-and-drop |
| `KpiCard` | shadcn Card | Card métrique avec tendance |
| `RiskHeatmapWidget` | Custom SVG / D3 | Matrice interactive |
| `ComplianceRadarWidget` | Recharts RadarChart | Radar multi-référentiels |
| `TrendWidget` | Recharts LineChart | Graphique de tendance |
| `IncidentBarWidget` | Recharts BarChart | Barres empilées |
| `BoardReportGenerator` | Custom | Génération PDF rapport CA |
| `PresentationMode` | Custom fullscreen | Mode diaporama |
| `DashboardFilterBar` | shadcn multi-select | Filtres globaux |
| `WidgetConfigPanel` | shadcn Sheet | Panneau de configuration |

## 11. Relations

Ce module consomme des données de **tous les autres modules** en lecture seule. Il ne crée pas de données propres (sauf les configurations de layout utilisateur).
