# Module 01 — Registre Central des Systèmes IA

> **Route** : `/ai-systems`
> **Priorité** : MVP (Phase 1)
> **Dépendances** : Module 15 (auth/RBAC), Module 02 (rôles)

## 1. Objectif

Permettre à toute organisation de savoir **quels systèmes d'IA existent**, où ils sont utilisés, par qui, avec quels risques. C'est le pré-requis fondamental à toute gouvernance. Un dirigeant non technique doit pouvoir enregistrer un système IA en moins de 10 minutes via un wizard guidé.

## 2. User Stories

| ID | En tant que... | Je veux... | Afin de... |
|----|---------------|-----------|-----------|
| US-01-01 | Admin org | enregistrer un nouveau système IA via un wizard pas-à-pas | constituer mon inventaire de gouvernance |
| US-01-02 | Admin org | voir la liste complète de mes systèmes IA avec filtres | avoir une vue d'ensemble de mon portefeuille |
| US-01-03 | Compliance officer | filtrer les systèmes par niveau de risque, département, statut | prioriser mes actions de conformité |
| US-01-04 | Membre | consulter la fiche détaillée d'un système IA | comprendre son périmètre et ses risques |
| US-01-05 | Admin org | modifier/archiver un système IA | maintenir l'inventaire à jour |
| US-01-06 | Auditeur | exporter l'inventaire complet en PDF/CSV | produire un rapport pour le CA ou un audit |
| US-01-07 | Admin org | attacher des pièces jointes (contrats, rapports) à un système | centraliser les preuves |
| US-01-08 | Risk manager | voir un score de risque automatique par système | prioriser les évaluations approfondies |
| US-01-09 | Admin org | dupliquer une fiche système existante | accélérer l'enregistrement de systèmes similaires |
| US-01-10 | Compliance officer | recevoir une alerte quand un système n'a pas été revu depuis X mois | garantir les revues périodiques |

## 3. Wizard d'enregistrement (étapes)

Le wizard est le composant central du module. Il guide l'utilisateur non technique à travers 5 étapes.

### Étape 1 — Identification
- **Nom du système** (texte, requis, max 200 car.)
- **Description** (textarea, requis, max 2000 car.)
- **Identifiant interne** (texte, optionnel — code projet, numéro de référence)
- **Type de système** (select, requis) :
  - `predictive` — Modèle prédictif
  - `recommendation` — Système de recommandation
  - `classification` — Classification / catégorisation
  - `nlp` — Traitement du langage naturel
  - `genai_llm` — IA générative / LLM
  - `computer_vision` — Vision par ordinateur
  - `biometric` — Biométrie
  - `robotic_process` — Automatisation robotique (RPA)
  - `decision_support` — Aide à la décision
  - `autonomous_agent` — Agent autonome
  - `other` — Autre (champ libre)
- **Sous-type GenAI** (conditionnel si type = `genai_llm`) :
  - `chatbot` — Chatbot / assistant conversationnel
  - `content_generation` — Génération de contenu
  - `code_generation` — Génération de code
  - `summarization` — Résumé / synthèse
  - `translation` — Traduction
  - `image_generation` — Génération d'images
  - `other_genai` — Autre

### Étape 2 — Périmètre & impact
- **Département(s)** (multi-select, requis) : RH, Finance, Service client, IT, Marketing, Juridique, Opérations, Direction, Autre
- **Finalité / cas d'usage** (textarea, requis) : description en langage courant de ce que fait le système
- **Population touchée** (multi-select) :
  - `employees` — Employés de l'organisation
  - `customers` — Clients
  - `prospects` — Prospects
  - `public` — Grand public
  - `minors` — Mineurs
  - `vulnerable` — Personnes vulnérables
- **Volume estimé** (select) : `< 100`, `100-1000`, `1000-10000`, `10 000-100 000`, `> 100 000` personnes/an
- **Niveau d'autonomie** (select, requis) :
  - `full_auto` — Décision entièrement automatisée (sans humain)
  - `human_in_the_loop` — Humain dans la boucle (validation avant action)
  - `human_on_the_loop` — Humain en supervision (peut intervenir)
  - `human_in_command` — Humain aux commandes (IA comme outil d'aide)
- **Domaine sensible** (multi-select, conditionnel — active des alertes de risque) :
  - `employment` — Emploi / recrutement
  - `credit` — Crédit / scoring financier
  - `justice` — Justice / application de la loi
  - `education` — Éducation
  - `health` — Santé
  - `housing` — Logement
  - `critical_infra` — Infrastructure critique
  - `biometric_id` — Identification biométrique
  - `migration` — Migration / asile

### Étape 3 — Données & fournisseur
- **Données utilisées** (multi-select) :
  - `personal_data` — Renseignements personnels
  - `sensitive_data` — Données sensibles (santé, biométrie, opinions)
  - `financial_data` — Données financières
  - `public_data` — Données publiques
  - `synthetic_data` — Données synthétiques
  - `no_personal_data` — Aucune donnée personnelle
- **Source du système** (select, requis) :
  - `internal` — Développé en interne
  - `vendor_saas` — Fournisseur SaaS / API externe
  - `vendor_onprem` — Fournisseur on-premise
  - `open_source` — Open source
  - `hybrid` — Hybride (interne + externe)
- **Nom du fournisseur** (texte, conditionnel si vendor)
- **Modèle / version** (texte, optionnel — ex: "GPT-4o", "Claude 3.5 Sonnet")
- **Localisation des données** (multi-select) : Canada, Québec, USA, UE, Autre
- **Contrat / lien contractuel** (file upload, optionnel)

### Étape 4 — Propriétaires & responsables
- **Business owner** (select utilisateur org, requis)
- **Responsable technique** (select utilisateur org, requis)
- **Responsable vie privée** (select utilisateur org, optionnel)
- **Responsable risques** (select utilisateur org, optionnel)
- **Approbateur** (select utilisateur org, optionnel)

### Étape 5 — Statut & planification
- **Statut du cycle de vie** (select, requis) :
  - `idea` — Idée / exploration
  - `pilot` — Projet pilote
  - `development` — En développement
  - `testing` — En test / validation
  - `production` — En production
  - `suspended` — Suspendu
  - `decommissioned` — Décommissionné
- **Date de mise en production** (date, optionnel)
- **Date de prochaine revue** (date, requis — par défaut : +6 mois)
- **Fréquence de revue** (select) : `monthly`, `quarterly`, `semi_annual`, `annual`
- **Notes complémentaires** (textarea, optionnel)

À la soumission : le système calcule un **score de risque préliminaire** (0-100) basé sur les réponses (voir section 6).

## 4. Vue Liste des systèmes

### Layout
- Page avec header : titre "Systèmes IA" + bouton "Nouveau système" (CTA primaire)
- Barre de filtres et recherche
- Table/cards avec les systèmes

### Colonnes de la table
| Colonne | Type | Sortable | Filtrable |
|---------|------|----------|-----------|
| Nom | texte + lien | oui | recherche |
| Type | badge coloré | oui | multi-select |
| Département | badges | non | multi-select |
| Niveau de risque | badge (couleur) | oui | multi-select |
| Statut cycle de vie | badge | oui | multi-select |
| Business owner | avatar + nom | oui | select |
| Prochaine revue | date | oui | plage de dates |
| Score de risque | jauge 0-100 | oui | plage |

### Filtres
- Recherche plein texte (nom, description, fournisseur)
- Type de système
- Département
- Niveau de risque : `critical`, `high`, `medium`, `low`
- Statut cycle de vie
- Données personnelles : oui/non
- Fournisseur
- Date de revue échue : oui/non

### Actions en masse
- Exporter la sélection (CSV, PDF)
- Changer le statut
- Assigner un responsable

## 5. Fiche détaillée d'un système

Page dédiée (`/ai-systems/:id`) avec layout en onglets :

### Onglet "Résumé"
- Card principale avec toutes les métadonnées du wizard
- Score de risque (jauge visuelle) + niveau
- Timeline du cycle de vie (frise chronologique)
- Propriétaires (avatars)
- Statut de conformité (badges par référentiel)

### Onglet "Risques" → lien vers Module 03
- Liste des évaluations de risque liées
- Bouton "Nouvelle évaluation"

### Onglet "Décisions" → lien vers Module 04
- Historique des décisions (go/no-go, changements)

### Onglet "Biais" → lien vers Module 05
- Findings de biais liés à ce système

### Onglet "Incidents" → lien vers Module 06
- Incidents associés

### Onglet "Documents" → lien vers Module 09
- Pièces jointes, model cards, rapports

### Onglet "Monitoring" → lien vers Module 10
- Dashboard de monitoring spécifique au système

### Onglet "Historique"
- Audit log filtré sur ce système (qui a modifié quoi, quand)

## 6. Score de risque préliminaire (algorithme)

Le score est calculé automatiquement à partir des réponses du wizard. C'est un score indicatif (0-100) qui sert à prioriser, pas à remplacer l'évaluation de risque complète (Module 03).

### Facteurs et pondération
```
score = 0

// Autonomie (max 30 pts)
if autonomie == 'full_auto' → +30
if autonomie == 'human_in_the_loop' → +15
if autonomie == 'human_on_the_loop' → +10
if autonomie == 'human_in_command' → +5

// Données (max 25 pts)
if 'sensitive_data' in données → +25
if 'personal_data' in données → +15
if 'financial_data' in données → +10

// Population (max 20 pts)
if 'minors' in population → +20
if 'vulnerable' in population → +15
if volume > 10000 → +10
if volume > 100000 → +15

// Domaine sensible (max 25 pts)
si ≥ 1 domaine sensible coché → +15
si ≥ 2 domaines sensibles → +25
```

### Niveaux dérivés
| Score | Niveau | Couleur | Action |
|-------|--------|---------|--------|
| 0-25 | Minimal | Vert | Revue annuelle |
| 26-50 | Limité | Jaune | Revue semestrielle |
| 51-75 | Élevé | Orange | Évaluation complète requise |
| 76-100 | Critique | Rouge | Évaluation + approbation direction |

## 7. Pièces jointes

- Stockage via **Supabase Storage** (bucket `evidence-files`)
- Types acceptés : PDF, DOCX, XLSX, PNG, JPG (max 50 Mo par fichier)
- Métadonnées : nom, type, date upload, uploadé par, catégorie
- Catégories : `contract`, `test_report`, `policy`, `validation`, `other`
- Prévisualisation inline pour les PDF et images

## 8. Exports

### Export CSV
- Toutes les colonnes de la table, respect des filtres actifs
- Encodage UTF-8 avec BOM (Excel-compatible)

### Export PDF
- Mise en page professionnelle "Inventaire des systèmes IA"
- Logo de l'organisation en en-tête
- Date de génération, nombre de systèmes
- Tableau récapitulatif
- Horodatage + hash d'intégrité

## 9. Notifications & alertes

| Événement | Destinataire | Canal |
|-----------|-------------|-------|
| Nouveau système enregistré | Admin org | In-app + email |
| Revue échue (date dépassée) | Business owner + compliance officer | In-app + email |
| Revue à venir (J-14, J-7) | Business owner | In-app |
| Score de risque ≥ 76 (critique) | Risk manager + admin | In-app + email |
| Système passé en production | Compliance officer | In-app |
| Système décommissionné | Admin org | In-app |

## 10. Règles métier

1. **Unicité** : le couple (nom + organization_id) doit être unique
2. **Revue obligatoire** : tout système en `production` depuis > 12 mois sans revue génère une alerte critique
3. **Soft delete** : un système décommissionné n'est jamais supprimé, il passe en `decommissioned` et reste consultable
4. **Audit trail** : toute modification est loguée (ancien/nouveau valeur, utilisateur, timestamp)
5. **Draft** : le wizard peut être sauvegardé en brouillon à n'importe quelle étape
6. **Permissions** :
   - Créer : `org_admin`, `compliance_officer`, `risk_manager`
   - Modifier : `org_admin`, `compliance_officer`, business owner du système
   - Consulter : tous les membres de l'organisation
   - Supprimer (soft) : `org_admin` uniquement
   - Exporter : `org_admin`, `compliance_officer`, `auditor`

## 11. Composants UI principaux

| Composant | Librairie | Usage |
|-----------|-----------|-------|
| `AiSystemWizard` | shadcn Stepper / custom | Wizard 5 étapes avec validation par étape |
| `AiSystemTable` | shadcn DataTable (TanStack Table) | Liste avec tri, filtres, pagination |
| `AiSystemCard` | shadcn Card | Vue card alternative |
| `RiskScoreGauge` | Custom (SVG ou Recharts) | Jauge circulaire 0-100 |
| `LifecycleTimeline` | Custom | Frise horizontale des statuts |
| `FileUploader` | shadcn + custom | Upload drag-and-drop avec preview |
| `FilterBar` | shadcn Popover + Select | Barre de filtres combinés |
| `ExportDialog` | shadcn Dialog | Choix format + options d'export |

## 12. Relations avec les autres modules

| Module | Relation | Description |
|--------|----------|-------------|
| 02 - Gouvernance | FK `business_owner_id`, `tech_owner_id` | Propriétaires liés aux rôles |
| 03 - Risques | 1-N `risk_assessments.ai_system_id` | Évaluations de risque liées |
| 04 - Décisions | 1-N `decisions.ai_system_id` | Décisions algorithmiques |
| 05 - Biais | 1-N `bias_findings.ai_system_id` | Findings de biais |
| 06 - Incidents | 1-N `incidents.ai_system_id` | Incidents liés |
| 08 - Cycle de vie | 1-N `lifecycle_events.ai_system_id` | Événements de cycle de vie |
| 09 - Documents | 1-N `documents.ai_system_id` | Pièces jointes et rapports |
| 10 - Monitoring | 1-N `monitoring_alerts.ai_system_id` | Alertes de monitoring |
| 11 - Données | 1-N `data_inventories.ai_system_id` | Inventaire des jeux de données |
| 12 - Tiers | N-N via `ai_system_vendors` | Fournisseurs liés |
