# Sidebar Restructuring Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fusionner les 4 catégories centrales du sidebar (Inventaire, Conformité, Risques, Pilotage) en 2 catégories (Registre IA, Conformité & Pilotage).

**Architecture:** Modification purement cosmétique du `nav-config.ts` et des fichiers i18n. Aucun changement de routes, pages ou permissions.

---

## Structure actuelle (6 categories)

1. Vue d'ensemble (5 items)
2. Inventaire IA (3 items)
3. Gouvernance & Conformite (4 items)
4. Gestion des risques (3 items)
5. Pilotage & Suivi (5 items)
6. Mon organisation (3 items)

## Nouvelle structure (4 categories)

1. **Vue d'ensemble** (inchange) — Dashboard, Veille, Bibliotheque, Modeles, Roadmap
2. **Registre IA** (nouveau) — Systemes IA, Cycle de vie, Fournisseurs, Risques, Incidents, Biais
3. **Conformite & Pilotage** (nouveau) — Gouvernance, Decisions, Conformite, Documents, Transparence, Monitoring, Donnees, Agents, Traces
4. **Mon organisation** (inchange) — Membres, Admin, Facturation

## i18n

| Cle | FR | EN |
|---|---|---|
| sections.overview | Vue d'ensemble | Overview |
| sections.registry | Registre IA | AI Registry |
| sections.compliance | Conformite & Pilotage | Compliance & Oversight |
| sections.organization | Mon organisation | My Organization |
| rail.overview | Accueil | Home |
| rail.registry | Registre | Registry |
| rail.compliance | Conformite | Compliance |
| rail.organization | Org. | Org. |

## Fichiers impactes

- `src/portail/layout/nav-config.ts` — restructurer navGroups + CATEGORY_ICONS
- `src/portail/layout/AppIconRail.tsx` — mettre a jour si necessaire
- `src/i18n/locales/fr/portail.json` — nouvelles cles sections/rail
- `src/i18n/locales/en/portail.json` — idem EN
