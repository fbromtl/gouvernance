# Module 11 — Gestion des Données & EFVP

> **Route** : `/data`
> **Priorité** : Phase 2 (mois 3-6)
> **Dépendances** : Module 01 (systèmes IA), Module 03 (risques), Module 15 (auth)

## 1. Objectif

Gouverner les données utilisées par les systèmes IA, surtout quand il y a des renseignements personnels (RP). Permettre l'inventaire des jeux de données, la documentation de la base légale, la gestion de la conservation/destruction, et la réalisation d'EFVP (Évaluation des Facteurs relatifs à la Vie Privée) conformes à la Loi 25.

## 2. User Stories

| ID | En tant que... | Je veux... | Afin de... |
|----|---------------|-----------|-----------|
| US-11-01 | Data scientist | inventorier les jeux de données de chaque système IA | documenter les sources de données |
| US-11-02 | Privacy officer | documenter la base légale et la finalité de chaque traitement | prouver la conformité Loi 25 |
| US-11-03 | Compliance officer | réaliser une EFVP via un wizard guidé | évaluer les risques vie privée |
| US-11-04 | Admin org | définir les règles de conservation et destruction | me conformer à la Loi 25 |
| US-11-05 | Privacy officer | suivre les transferts de données hors Québec | gérer les obligations de communication hors Québec |
| US-11-06 | Auditeur | exporter l'inventaire et les EFVP | prouver la gouvernance des données |

## 3. Inventaire des jeux de données

### Champs d'un jeu de données
- **Nom** (texte, requis)
- **Description** (textarea)
- **Système(s) IA associé(s)** (multi-select FK)
- **Source** (select) : `internal_db`, `client_provided`, `vendor_api`, `public_dataset`, `web_scraping`, `synthetic`, `third_party`, `other`
- **Catégories de données** (multi-select) :
  - `identifiers` — Identifiants (nom, email, téléphone, adresse)
  - `demographic` — Données démographiques (âge, genre, ethnicité)
  - `financial` — Données financières (revenus, crédit, transactions)
  - `health` — Données de santé
  - `biometric` — Données biométriques
  - `location` — Données de géolocalisation
  - `behavioral` — Données comportementales (navigation, achats)
  - `professional` — Données professionnelles (emploi, compétences)
  - `opinions` — Opinions, préférences, croyances
  - `judicial` — Données judiciaires
  - `non_personal` — Données non personnelles
- **Classification RP** (auto-calculé) :
  - `none` — Pas de RP
  - `personal` — RP standards
  - `sensitive` — RP sensibles (santé, biométrie, opinions, judiciaire)
- **Volume** (select) : `< 1K`, `1K-10K`, `10K-100K`, `100K-1M`, `> 1M` enregistrements
- **Qualité** (select) : `high`, `medium`, `low`, `unknown`
- **Fraîcheur** (select) : `realtime`, `daily`, `weekly`, `monthly`, `static`
- **Localisation de stockage** (multi-select) : Québec, Canada, USA, UE, Autre
- **Format** (select) : `structured_db`, `csv`, `json`, `images`, `text`, `audio`, `video`, `mixed`
- **Représentativité** (textarea) : notes sur la représentativité vs. population cible

### Base légale / consentement
- **Base légale du traitement** (select, requis si RP) :
  - `consent` — Consentement explicite
  - `contract` — Exécution d'un contrat
  - `legal_obligation` — Obligation légale
  - `legitimate_interest` — Intérêt légitime
  - `vital_interest` — Intérêt vital
  - `public_interest` — Intérêt public
- **Finalité déclarée** (textarea) : pourquoi ces données sont collectées/utilisées
- **Consentement obtenu** (toggle) + mécanisme de preuve
- **Droit de retrait** : mécanisme documenté (oui/non + description)

### Conservation et destruction
- **Durée de conservation** (nombre + unité : jours/mois/années)
- **Justification de la durée** (textarea)
- **Politique de destruction** (select) : `auto_delete`, `manual_review`, `anonymization`, `archival`
- **Preuve de destruction** (toggle — si applicable, upload du certificat)
- **Prochaine revue** (date)

## 4. Transferts de données hors Québec

Registre spécifique pour les transferts, conformément à la Loi 25 (EFVP requise avant toute communication hors Québec de RP) :

- **Jeu de données concerné** (FK)
- **Destination** (pays + entité réceptrice)
- **Finalité du transfert** (textarea)
- **Base contractuelle** (select) : clause contractuelle, engagement de conformité, consentement
- **EFVP réalisée avant transfert** (toggle — obligatoire Loi 25)
- **Mesures de protection** (textarea)
- **Statut** : `active`, `suspended`, `terminated`

## 5. EFVP — Wizard guidé

Évaluation des Facteurs relatifs à la Vie Privée, requise par la Loi 25 avant tout projet impliquant des RP.

### Étape 1 — Identification du projet
- Nom du projet / système IA
- Description
- Responsable
- Date de début

### Étape 2 — Description du traitement
- Nature du traitement (collecte, stockage, analyse, décision, communication)
- Catégories de RP traitées
- Volume de personnes concernées
- Durée du traitement
- Sous-traitants impliqués

### Étape 3 — Évaluation de la nécessité
- Le traitement est-il nécessaire pour l'objectif poursuivi ? (justification)
- Peut-on atteindre l'objectif avec moins de données ? (minimisation)
- La durée de conservation est-elle proportionnée ?
- Le consentement est-il obtenu de manière appropriée ?

### Étape 4 — Identification des risques
Pour chaque risque identifié :
- Description du risque
- Source du risque (interne, externe, technique, humain)
- Probabilité (1-4)
- Gravité (1-4)
- Score = Probabilité × Gravité
- Mesures de mitigation existantes
- Risque résiduel après mitigation

Risques typiques pré-chargés :
- Accès non autorisé aux RP
- Utilisation secondaire non consentie
- Transfert non sécurisé
- Conservation excessive
- Biais discriminatoire
- Réidentification de données anonymisées
- Fuite de données
- Non-respect du droit de retrait

### Étape 5 — Plan d'action
Pour chaque risque résiduel élevé :
- Action corrective
- Responsable
- Échéance
- Statut : `planned`, `in_progress`, `completed`

### Étape 6 — Conclusion et approbation
- Résumé des risques et mitigations
- Recommandation : `proceed`, `proceed_with_conditions`, `do_not_proceed`
- Approbation du privacy officer
- Date d'approbation

### Sortie
- Document EFVP exportable en PDF
- Statut : `draft` → `in_review` → `approved` → `archived`
- Lien vers le système IA et les jeux de données concernés

## 6. Règles métier

1. Un jeu de données avec `classification_rp = sensitive` déclenche une alerte au privacy officer
2. Tout transfert hors Québec de RP nécessite une EFVP préalable (Loi 25)
3. L'EFVP ne peut être approuvée que par un `privacy_officer` ou `org_admin`
4. Les jeux de données dont la date de conservation est dépassée génèrent une alerte
5. La destruction de données doit être documentée avec preuve
6. Un système IA ne peut pas être mis en production si des RP sensibles sont utilisées sans EFVP approuvée

## 7. Composants UI

| Composant | Usage |
|-----------|-------|
| `DataInventoryTable` | Table des jeux de données avec filtres |
| `DatasetForm` | Formulaire de création/édition d'un jeu |
| `DataClassificationBadge` | Badge none/personal/sensitive |
| `TransferRegistry` | Table des transferts hors Québec |
| `EfvpWizard` | Wizard 6 étapes pour l'EFVP |
| `RiskMatrix` | Matrice probabilité × gravité (EFVP) |
| `RetentionCalendar` | Vue des dates de conservation/destruction |
| `EfvpReport` | Prévisualisation du rapport EFVP |

## 8. Relations

| Module | Relation |
|--------|----------|
| 01 - Systèmes IA | N-N via `ai_system_datasets` |
| 03 - Risques | EFVP = input pour l'évaluation de risque |
| 06 - Incidents | Incident de confidentialité lié aux données |
| 09 - Documentation | EFVP = document exportable |
| 12 - Tiers | Fournisseur = récepteur de transfert |
| 13 - Conformité | EFVP = preuve de conformité Loi 25 |
