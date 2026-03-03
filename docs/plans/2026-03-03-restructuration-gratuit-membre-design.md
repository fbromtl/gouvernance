# Design — Restructuration Plans Gratuit / Membre

> Date : 2026-03-03
> Fichiers principaux : `FeatureGate.tsx`, `usePlanFeatures.ts`, migration SQL, pages portail

---

## Objectif

Restructurer les plans tarifaires du portail SaaS en passant de 3 niveaux (Observer/Membre/Expert) à **2 niveaux** (Gratuit/Membre). Le plan gratuit donne accès à tous les modules en lecture seule avec des données de démonstration. Le gate intervient uniquement sur les **actions** (créer, modifier, supprimer, exporter).

## Principe

- **Gratuit** : Navigation libre dans tous les modules. Données de démo préremplies de "MonOrganisation inc.". L'utilisateur comprend la valeur de chaque module sans friction.
- **Membre** : Tout débloqué. Création, édition, export, chat IA illimité.
- **Expert** : Supprimé. Toutes les fonctionnalités Expert passent au plan Membre.

---

## Ce qui change

| Aspect | Avant | Après |
|---|---|---|
| Navigation | 4 modules accessibles, le reste gated | Tous les modules navigables |
| Données | Vide pour le gratuit | Données de démo "MonOrganisation inc." |
| Gate | Bloque l'accès au module entier | Bloque les actions (créer, modifier, supprimer, exporter) |
| Niveaux | 3 (Observer, Membre, Expert) | 2 (Gratuit, Membre) |
| Plan Expert | Monitoring/Data/Gouvernance exclusifs | Supprimé — tout passe au Membre |

---

## Plan Gratuit — Tous modules en lecture seule

### Modules accessibles (navigation libre, données de démo)

- Dashboard (KPIs et graphiques de démo)
- Inventaire des systèmes IA (5 systèmes fictifs)
- Évaluations de risques (3 évaluations fictives)
- Gestion des incidents (2 incidents fictifs)
- Conformité multi-cadres (scores de démo)
- Politiques & Gouvernance (exemples de politiques)
- Journal des décisions (3 décisions exemples)
- Biais & Équité (2 analyses exemples)
- Transparence (exemples de registres)
- Fournisseurs (3 fournisseurs fictifs)
- Documents (documents exemples)
- Monitoring (données fictives de performance)
- Catalogue de données (exemples de jeux de données)
- Veille réglementaire (articles réels — déjà gratuit)
- Bibliothèque (déjà gratuit)
- Membres du Cercle (déjà gratuit)
- Chat IA (limité à 3 messages/jour)
- Cycle de vie (données de démo)
- Agents IA (exemples)

### Actions bloquées par le gate

- Boutons "Créer", "Nouveau", "Ajouter" → gate
- Boutons "Modifier", "Éditer" → gate
- Boutons "Exporter PDF", "Télécharger" → gate
- Boutons "Supprimer" → gate
- Chat IA au-delà de 3 messages/jour → gate

---

## Plan Membre — Tout débloqué

- Toutes les fonctionnalités de création, modification, suppression
- Export PDF, rapports
- Chat IA illimité
- Monitoring, Data, Gouvernance avancée (ex-Expert)
- Prix : CA$199/mois (annuel) ou CA$249/mois (mensuel)
- Essai gratuit : 30 jours

---

## Données de démo "MonOrganisation inc."

### Approche

Un seed de données réalistes créé lors de l'inscription de chaque nouvel utilisateur gratuit. L'organisation s'appelle "MonOrganisation inc." et contient un jeu cohérent de :

- **5 systèmes IA** : chatbot service client (risque moyen), scoring RH (risque élevé), détection fraude (risque élevé), recommandation produits (risque faible), analyse sentiments (risque moyen)
- **3 évaluations de risques** : pour les 3 systèmes à risque moyen/élevé
- **2 incidents** : un résolu, un en cours
- **Score conformité** : Loi 25 (72%), EU AI Act (45%), ISO 42001 (38%)
- **3 fournisseurs** : OpenAI, Anthropic, Google Cloud AI
- **3 décisions** : Go/No-Go, exception, arbitrage éthique
- **2 analyses biais** : impact disparate sur scoring RH, stéréotypage chatbot
- **Données monitoring** : métriques de performance fictives
- **Documents** : charte IA exemple, procédure d'approbation exemple

### Marquage

Les données de démo sont marquées avec un champ `is_demo: true` dans la base de données pour pouvoir les distinguer et les supprimer quand l'utilisateur passe au plan Membre.

---

## Modifications techniques

### 1. Migration SQL

- Supprimer le niveau `enterprise` de l'enum `subscription_plan`
- Mettre à jour `plan_features` : toutes les features enabled pour `pro`
- Supprimer les lignes `enterprise`
- Ajouter `is_demo BOOLEAN DEFAULT false` aux tables principales

### 2. FeatureGate refactoring

- Le gate actuel (sur module entier) → remplacé par un gate sur les **actions** uniquement
- Nouveau composant `ActionGate` qui wrape les boutons CTA
- Le `FeatureGate` module-level n'est plus nécessaire pour la plupart des pages

### 3. Seed de démo

- Edge Function ou trigger SQL qui crée les données de démo à l'inscription
- Les données sont liées à l'`organization_id` de l'utilisateur
- Supprimées automatiquement quand `is_demo = true` et l'utilisateur upgrade

### 4. stripe.ts

- Supprimer le plan `expert`
- Un seul plan payant : `member`
- Mettre à jour `PLANS`, `PURCHASABLE_PLANS`, `CURRENCY_PRICES`

### 5. Pages portail

- Retirer tous les `<FeatureGate>` qui wrapent des pages entières
- Ajouter `<ActionGate>` autour des boutons de création/édition/export
- Chaque page charge les données normalement (démo ou réelles)

### 6. Page Tarifs

- Simplifier à 2 colonnes : Gratuit | Membre
- Supprimer la colonne Expert

---

## Hors scope

- Limites de quota (nombre de systèmes, d'évaluations) — tout est illimité pour le Membre
- Système de rôles/permissions au sein d'une organisation
- Facturation multi-devises côté Stripe (reste CAD source of truth)
