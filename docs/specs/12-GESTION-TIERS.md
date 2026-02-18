# Module 12 — Gestion des Tiers & Fournisseurs

> **Route** : `/vendors`
> **Priorité** : Phase 3 (mois 6-12)
> **Dépendances** : Module 01 (systèmes IA), Module 11 (données), Module 15 (auth)

## 1. Objectif

Encadrer les risques liés aux API IA, modèles pré-entraînés, sous-traitants et données externes. Maintenir un registre des fournisseurs IA avec due diligence, suivi contractuel et gestion des risques de la supply chain IA.

## 2. User Stories

| ID | En tant que... | Je veux... | Afin de... |
|----|---------------|-----------|-----------|
| US-12-01 | Admin org | enregistrer un fournisseur IA dans le registre | centraliser l'info fournisseurs |
| US-12-02 | Risk manager | soumettre un questionnaire de due diligence au fournisseur | évaluer les risques |
| US-12-03 | Compliance officer | suivre les clauses contractuelles clés | garantir la conformité |
| US-12-04 | Admin org | lier un fournisseur à un ou plusieurs systèmes IA | tracer la dépendance |
| US-12-05 | Risk manager | évaluer le risque fournisseur | prioriser les actions |
| US-12-06 | Auditeur | exporter le registre des fournisseurs | prouver la gestion des tiers |

## 3. Registre des fournisseurs

### Champs
- **Nom** (texte, requis)
- **Type de service** (multi-select) :
  - `model_api` — API de modèle IA (OpenAI, Anthropic, Google, etc.)
  - `pretrained_model` — Modèle pré-entraîné (Hugging Face, etc.)
  - `saas_platform` — Plateforme SaaS avec IA intégrée
  - `data_provider` — Fournisseur de données
  - `infrastructure` — Infrastructure cloud (AWS, Azure, GCP)
  - `consulting` — Services de conseil IA
  - `labeling` — Annotation / étiquetage de données
  - `other` — Autre
- **Site web** (URL)
- **Contact principal** (nom, email, téléphone)
- **Localisation** (pays, région)
- **Sous-traitants connus** (textarea)
- **Systèmes IA utilisant ce fournisseur** (multi-select FK)
- **Contrat** :
  - Date de début / fin
  - Type : `subscription`, `per_use`, `license`, `custom`
  - Montant (optionnel)
  - Fichier du contrat (upload)
  - Clauses clés résumées (textarea)
- **SLA** : disponibilité, temps de réponse, support
- **Statut** : `active`, `under_evaluation`, `suspended`, `terminated`

## 4. Questionnaire de due diligence

Questionnaire structuré envoyable au fournisseur ou remplissable par l'évaluateur interne.

### Sections

#### A — Sécurité
- Le fournisseur est-il certifié SOC 2 / ISO 27001 ?
- Quels mécanismes de chiffrement sont en place ?
- Comment les accès sont-ils gérés ?
- Existe-t-il un plan de réponse aux incidents ?
- Quelles sont les pratiques de test de sécurité ?

#### B — Confidentialité & données
- Le fournisseur utilise-t-il les données clients pour entraîner ses modèles ?
- Où sont stockées les données ? (localisation)
- Quels sous-traitants ont accès aux données ?
- Quelle est la politique de rétention/destruction ?
- Le fournisseur est-il conforme Loi 25 / RGPD ?

#### C — IA & modèles
- Les modèles sont-ils documentés (model cards) ?
- Des tests de biais sont-ils réalisés ?
- Le fournisseur fournit-il des métriques de performance ?
- Existe-t-il un mécanisme de transparence / explicabilité ?
- Comment le fournisseur gère-t-il le drift ?

#### D — Opérations
- Quel est le SLA de disponibilité ?
- Existe-t-il un mécanisme de notification d'incidents ?
- Le fournisseur permet-il un audit ?
- Quelles sont les conditions de résiliation ?
- Quel est le plan de continuité / succession ?

### Scoring
Chaque question est notée : `compliant` (3), `partially` (2), `non_compliant` (1), `not_applicable` (0)
Score total → classification :
- ≥ 80% : `low_risk` (vert)
- 60-79% : `medium_risk` (jaune)
- < 60% : `high_risk` (rouge)

## 5. Clauses contractuelles modèles

Templates de clauses recommandées :
- **Interdiction d'entraînement** : le fournisseur ne peut pas utiliser les données du client pour entraîner ses modèles
- **Notification d'incident** : obligation de notification dans un délai défini
- **Audit** : droit d'audit par le client ou un tiers
- **Sous-traitance** : notification et approbation préalable pour tout nouveau sous-traitant
- **Localisation des données** : restriction géographique du traitement
- **Restitution/destruction** : obligation en fin de contrat
- **Transparence** : fourniture de documentation technique et model cards

## 6. Évaluation des risques fournisseur

### Facteurs de risque
- Score de due diligence
- Criticité des systèmes IA dépendants
- Volume de données partagées
- Localisation (extra-Québec/Canada)
- Concentration de dépendance (combien de systèmes dépendent de ce fournisseur)
- Antécédents (incidents, controverses)

### Niveau de risque calculé
| Niveau | Couleur | Actions requises |
|--------|---------|-----------------|
| Faible | Vert | Revue annuelle |
| Modéré | Jaune | Revue semestrielle, plan de mitigation |
| Élevé | Rouge | Revue trimestrielle, plan de contingence, escalade direction |

## 7. Règles métier

1. Tout fournisseur lié à un système en production doit avoir une due diligence complétée
2. Un fournisseur classé `high_risk` déclenche une notification au risk manager
3. L'expiration d'un contrat à J-60 génère une alerte
4. Un fournisseur ne peut pas être supprimé tant qu'il est lié à un système actif
5. Le questionnaire de due diligence doit être réévalué annuellement au minimum

## 8. Composants UI

| Composant | Usage |
|-----------|-------|
| `VendorRegistry` | Table des fournisseurs avec filtres |
| `VendorDetailPage` | Fiche complète d'un fournisseur |
| `DueDiligenceForm` | Questionnaire interactif avec scoring |
| `VendorRiskBadge` | Badge de niveau de risque |
| `ContractTracker` | Suivi des contrats avec alertes d'expiration |
| `ClauseTemplateLibrary` | Bibliothèque de clauses modèles |
| `DependencyMap` | Visualisation fournisseur → systèmes IA |

## 9. Relations

| Module | Relation |
|--------|----------|
| 01 - Systèmes IA | N-N via `ai_system_vendors` |
| 06 - Incidents | Incident fournisseur lié |
| 08 - Cycle de vie | Changement de fournisseur = événement |
| 11 - Données | Fournisseur = sous-traitant / destinataire de données |
| 13 - Conformité | Due diligence = preuve de conformité |
