# Design — Page Fonctionnalités du Portail

> Date : 2026-03-03
> Route : `/fonctionnalites`
> Fichier : `src/pages/FonctionnalitesPage.tsx`

---

## Objectif

Page publique vitrine complète présentant toutes les fonctionnalités du portail SaaS de gouvernance IA. Indépendante de la page Tarifs. Orientée sur la simplicité, l'utilité et la puissance de chaque module. Pas de mention des plans tarifaires — un CTA global renvoie vers `/tarifs`.

## Approche retenue

**Sections empilées avec cartes** — Hero + sommaire sticky + 6 sections thématiques verticales avec grille de cartes + CTA final. Pattern standard SaaS (Notion, Linear, Stripe).

---

## Structure de la page

### 1. Hero
- Titre accrocheur (ex: "Tout ce dont vous avez besoin pour gouverner votre IA")
- Sous-titre orienté bénéfice (ex: "20 modules intégrés pour inventorier, évaluer, conformer et piloter vos systèmes d'intelligence artificielle")
- CTA principal : "Essayer gratuitement" → `/inscription`
- CTA secondaire : "Voir les tarifs" → `/tarifs`

### 2. Sommaire sticky
- Barre horizontale avec les 6 catégories
- Se fixe en haut au scroll (sticky)
- Highlight la section active (intersection observer)
- Scroll fluide vers la section cliquée

### 3. Six sections thématiques
- Alternance fond blanc / fond gris très clair
- Chaque section : titre + sous-titre + grille de cartes (2-3 colonnes, responsive 1 col mobile)
- Animations d'entrée Framer Motion (fade-in au scroll)

### 4. CTA final
- Bannière d'appel à l'action en bas de page
- Lien vers `/tarifs` et `/inscription`

---

## Contenu des 6 catégories

### Catégorie 1 — Inventaire & Cycle de vie

**Inventaire des systèmes IA**
Recensez tous vos systèmes d'IA en quelques clics. Un assistant pas-à-pas capture le type, la portée, les données utilisées et les responsables. Vous obtenez instantanément un score de risque et une vue complète de votre parc IA.

**Cycle de vie**
Tracez chaque changement — mise à jour de modèle, changement de fournisseur, suspension, décommissionnement. Un journal chronologique complet qui prouve votre diligence et facilite les audits.

**Gestion des fournisseurs**
Centralisez vos fournisseurs IA : contrats, certifications, niveaux de risque, SLA. Identifiez en un coup d'œil les dépendances critiques et les renouvellements à venir.

### Catégorie 2 — Gestion des risques

**Évaluations des risques**
Un questionnaire structuré en 6 sections qui calcule automatiquement le score de risque de chaque système. Le résultat s'aligne sur les niveaux du EU AI Act et génère la liste des exigences applicables.

**Gestion des incidents**
Déclarez, triagez et résolvez les incidents IA avec un workflow complet. Suivi de la sévérité, assignation, investigation, post-mortem — tout est documenté pour la conformité.

**Analyse des biais**
Identifiez et corrigez les biais algorithmiques : impact disparate, stéréotypage, hallucinations. Chaque constat est tracé avec sa méthode de détection, sa sévérité et son plan de remédiation.

### Catégorie 3 — Conformité & Gouvernance

**Conformité multi-cadres**
Évaluez votre conformité simultanément sur 5 référentiels — Loi 25, EU AI Act, NIST AI RMF, ISO 42001, RGPD. Un score global et par cadre, avec un plan de remédiation priorisé.

**Politiques & Procédures**
Créez et versionnez vos politiques de gouvernance IA : charte éthique, procédures d'approbation, gestion des plaintes. Workflow de publication intégré (brouillon → révision → publié).

**Registre des décisions**
Documentez chaque décision de gouvernance — Go/No-Go, arbitrage éthique, exception. Workflow d'approbation multi-niveaux avec historique complet et piste d'audit.

**Gestion documentaire**
Centralisez tous vos documents de gouvernance : politiques, rapports d'audit, évaluations d'impact. Classification automatique par IA, versionnement et recherche instantanée.

**Registre des agents IA**
Cataloguez vos agents IA avec leur niveau d'autonomie (A1 à A5), leur classification de risque et leurs politiques d'usage. Tracez chaque action avec un journal d'exécution détaillé.

### Catégorie 4 — Transparence & Opérations

**Transparence & Contestations**
Tenez un registre des décisions automatisées conforme à la Loi 25 et au RGPD. Gérez les contestations des personnes concernées avec un workflow de traitement complet.

**Monitoring & Performance**
Surveillez vos systèmes IA en continu : performance, dérive de données, dérive de modèle, latence. Configurez des seuils d'alerte et recevez des notifications en temps réel.

**Gouvernance des données**
Cartographiez vos jeux de données : sources, catégories, sensibilité, volumes. Documentez chaque transfert de données avec sa base légale et ses mesures de protection.

**Veille réglementaire**
Restez informé des évolutions réglementaires au Québec, au Canada et à l'international. Flux automatisé d'actualités avec filtrage par juridiction et analyse d'impact.

### Catégorie 5 — Tableau de bord & Intelligence

**Tableau de bord centralisé**
Vue d'ensemble en temps réel : systèmes en production, score de conformité, incidents actifs, systèmes à haut risque. Graphiques radar multi-cadres, chronologie des incidents et actions en attente.

**Assistant IA intégré**
Posez vos questions de gouvernance à un assistant IA spécialisé. Il connaît vos cadres réglementaires, vos systèmes et vos politiques pour des réponses contextualisées.

### Catégorie 6 — Communauté & Collaboration

**Répertoire des membres**
Connectez-vous avec les professionnels du Cercle. Consultez les profils, expertises et organisations de la communauté de gouvernance IA.

**Profil professionnel**
Affichez votre expertise en gouvernance IA avec un profil public. Badge LinkedIn, visibilité dans le répertoire et reconnaissance de vos compétences.

**Bibliothèque de ressources**
Accédez à des modèles, guides et bonnes pratiques pour structurer votre gouvernance IA. Une base de connaissances partagée par la communauté.

---

## Spécifications techniques

### Composant
- Fichier : `src/pages/FonctionnalitesPage.tsx`
- Layout : `Layout` (site vitrine, Header + Footer)
- Route : `/fonctionnalites` dans `App.tsx`

### Design système
- Cartes : composant `Card` de shadcn/ui
- Icônes : Lucide React (cohérentes avec AppSidebar du portail)
- Animations : Framer Motion (fade-in au scroll via `useInView`)
- Sommaire sticky : `sticky top-[header-height]` avec intersection observer pour highlight actif
- Responsive : 3 colonnes desktop, 2 tablette, 1 mobile
- Alternance fonds : `bg-white` / `bg-muted/30`

### SEO
- Composant `SEO` avec titre, description et schema.org
- Balise H1 unique dans le hero
- Balises H2 pour chaque catégorie
- Balises H3 pour chaque module

### Navigation
- Ajout dans le Header du site vitrine
- Lien dans le footer

### i18n
- Clés de traduction dans `fr/` et `en/`
- Namespace dédié ou intégré à un namespace existant
