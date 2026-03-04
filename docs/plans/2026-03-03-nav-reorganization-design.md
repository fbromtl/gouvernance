# Réorganisation de la navigation portail — Design

> **Date :** 2026-03-03
> **Contexte :** Audit de cohérence des deux menus de gauche (icon rail + sidebar)

## Problèmes identifiés

1. **Agents IA + Traces Agent** dans Gouvernance — devraient être dans Opérations/Pilotage
2. **Communauté** n'a qu'un seul item — catégorie trop maigre
3. **Routes cachées** : `/billing`, `/admin`, `/roadmap` absentes du menu
4. **Rail "Gouv."** trop abrégé et cryptique
5. **Rail "Ops"** est du jargon technique inadapté à l'audience (dirigeants, conformité)
6. **Rail "Équipe" ≠ Sidebar "Communauté"** — incohérence de nommage
7. **"Données & EFVP"** — terme trop technique

## Réorganisation approuvée

### Catégorie 1 — Accueil (Vue d'ensemble)
- Rail : **Accueil** | Icône : `LayoutDashboard`
- Sidebar : **Vue d'ensemble**
- Items :
  - Tableau de bord (`/dashboard`)
  - Veille réglementaire (`/veille`) — badge IA
  - Bibliothèque (`/bibliotheque`)
  - Roadmap (`/roadmap`)

### Catégorie 2 — Inventaire (Inventaire IA)
- Rail : **Inventaire** | Icône : `Bot`
- Sidebar : **Inventaire IA**
- Items :
  - Systèmes IA (`/ai-systems`)
  - Cycle de vie (`/lifecycle`)
  - Fournisseurs (`/vendors`)

### Catégorie 3 — Conformité (Gouvernance & Conformité)
- Rail : **Conformité** | Icône : `Shield`
- Sidebar : **Gouvernance & Conformité**
- Items :
  - Gouvernance (`/governance`)
  - Décisions (`/decisions`)
  - Conformité (`/compliance`)
  - Documentation (`/documents`)

### Catégorie 4 — Risques (Gestion des risques)
- Rail : **Risques** | Icône : `AlertTriangle`
- Sidebar : **Gestion des risques**
- Items :
  - Éval. des risques (`/risks`)
  - Incidents (`/incidents`)
  - Biais & Équité (`/bias`)

### Catégorie 5 — Pilotage (Pilotage & Suivi)
- Rail : **Pilotage** | Icône : `Activity`
- Sidebar : **Pilotage & Suivi**
- Items :
  - Transparence (`/transparency`)
  - Monitoring (`/monitoring`)
  - Données & Vie privée (`/data`)
  - Agents IA (`/agents`)
  - Traces Agent (`/agent-traces`)

### Catégorie 6 — Org. (Mon organisation)
- Rail : **Org.** | Icône : `Building2`
- Sidebar : **Mon organisation**
- Items :
  - Membres du Cercle (`/membres`)
  - Gérer l'organisation (`/admin`)
  - Adhésion & Facturation (`/billing`)

### Footer du rail (inchangé)
- Retour au site (`/`)
- Profil (`/profile`)

## Fichiers impactés

- `src/portail/layout/nav-config.ts` — restructurer navGroups + CATEGORY_ICONS
- `src/i18n/locales/fr/portail.json` — mettre à jour sections.*, rail.*, nav.*
- `src/i18n/locales/en/portail.json` — idem en anglais
