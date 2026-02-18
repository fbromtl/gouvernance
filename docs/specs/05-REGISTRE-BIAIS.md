# Module 05 — Registre des Biais & Équité

> **Route** : `/bias`
> **Priorité** : Phase 2 (mois 3-6)
> **Dépendances** : Module 01 (systèmes IA), Module 03 (risques), Module 15 (auth)

## 1. Objectif

Suivre les biais détectés dans les systèmes IA, leur sévérité, les mesures correctives et la revalidation. Permettre à un non-technicien de comprendre l'état d'équité de chaque système et de démontrer les efforts de mitigation.

## 2. User Stories

| ID | En tant que... | Je veux... | Afin de... |
|----|---------------|-----------|-----------|
| US-05-01 | Data scientist | enregistrer un finding de biais détecté | documenter le problème et lancer la correction |
| US-05-02 | Risk manager | voir tous les biais ouverts avec leur sévérité | prioriser les actions correctives |
| US-05-03 | Compliance officer | consulter le registre de biais par système | prouver les efforts d'équité en audit |
| US-05-04 | Ethics officer | suivre les plans de remédiation | m'assurer que les corrections sont appliquées |
| US-05-05 | Data scientist | importer des résultats de tests de biais (CSV) | centraliser les données techniques |
| US-05-06 | Admin org | voir les tendances de biais dans le temps | détecter les régressions |
| US-05-07 | Auditeur | exporter le registre complet | fournir les preuves d'audit |
| US-05-08 | Data scientist | utiliser des checklists de tests prêtes à l'emploi | gagner du temps sur les évaluations |

## 3. Structure d'un finding de biais

### Identification
- **Titre** (texte, requis)
- **Système IA concerné** (select → FK `ai_systems`, requis)
- **Date de détection** (date, requis)
- **Détecté par** (select utilisateur, auto = current user)
- **Méthode de détection** (select) :
  - `automated_test` — Test automatisé
  - `manual_audit` — Audit manuel
  - `user_complaint` — Plainte / signalement utilisateur
  - `monitoring` — Monitoring en production
  - `external_audit` — Audit externe
  - `regulatory_review` — Revue réglementaire

### Caractérisation du biais
- **Type de biais** (select, requis) :
  - `disparate_impact` — Impact disparate (résultats différents par groupe)
  - `representation` — Représentation (sous/sur-représentation dans les données)
  - `measurement` — Mesure (variables proxy pour caractéristiques protégées)
  - `historical` — Historique (reproduction de discriminations passées)
  - `aggregation` — Agrégation (modèle unique pour populations hétérogènes)
  - `evaluation` — Évaluation (métriques inadaptées)
  - `toxicity` — Toxicité (contenu offensant ou nuisible)
  - `hallucination` — Hallucination ciblée (GenAI)
  - `stereotyping` — Stéréotypes (associations non justifiées)
  - `other` — Autre

- **Dimensions protégées affectées** (multi-select) :
  - `gender` — Genre / identité de genre
  - `age` — Âge / génération
  - `ethnicity` — Origine ethnique / raciale
  - `disability` — Handicap
  - `religion` — Religion / croyances
  - `sexual_orientation` — Orientation sexuelle
  - `socioeconomic` — Statut socio-économique
  - `geographic` — Localisation géographique
  - `language` — Langue
  - `intersectional` — Intersectionnalité (combinaison)

- **Groupes spécifiquement affectés** (textarea — description libre)

### Évaluation
- **Sévérité** (select, requis) : `critical`, `high`, `medium`, `low`
- **Probabilité d'occurrence** (select) : `certain`, `likely`, `possible`, `unlikely`, `rare`
- **Impact estimé** (textarea) : description de l'impact sur les personnes
- **Nombre de personnes potentiellement affectées** (nombre estimé)

### Métriques de fairness (champs techniques optionnels)
- **Métrique utilisée** (multi-select) :
  - `demographic_parity` — Parité démographique
  - `equalized_odds` — Odds égalisées
  - `equal_opportunity` — Égalité des chances
  - `predictive_parity` — Parité prédictive
  - `calibration` — Calibration
  - `disparate_impact_ratio` — Ratio d'impact disparate
  - `individual_fairness` — Équité individuelle
  - `counterfactual_fairness` — Équité contrefactuelle
- **Valeur mesurée** (nombre décimal)
- **Seuil acceptable** (nombre décimal)
- **Écart** (calculé automatiquement)

### Preuves
- Fichiers joints (rapports de tests, captures, CSV de résultats)
- Lien vers rapport de monitoring (Module 10)

## 4. Plan de remédiation

Chaque finding a un plan de remédiation associé :

### Champs
- **Mesures correctives** (multi-select + description) :
  - `data_rebalancing` — Rééquilibrage des données
  - `model_retraining` — Réentraînement du modèle
  - `threshold_adjustment` — Ajustement des seuils
  - `feature_removal` — Retrait de variables
  - `human_in_loop` — Ajout de supervision humaine
  - `model_replacement` — Remplacement du modèle
  - `post_processing` — Post-traitement des résultats
  - `monitoring_enhancement` — Renforcement du monitoring
  - `other` — Autre
- **Description détaillée des actions** (rich text)
- **Responsable de la remédiation** (select utilisateur)
- **Date cible de résolution** (date)
- **Statut** : `identified` → `in_remediation` → `retest_pending` → `resolved` → `accepted_risk`
- **Résultat du re-test** (textarea + fichiers)
- **Date de résolution effective** (date)

### Workflow
```
identified → in_remediation → retest_pending → resolved / accepted_risk
```

Si le re-test échoue → retour à `in_remediation` avec nouveau plan.

`accepted_risk` : le biais est documenté mais accepté avec justification (lien vers Module 04 — décision).

## 5. Checklists de tests (bibliothèque)

Templates de checklists non techniques prêts à l'emploi :

### Checklist "Équité de base"
- [ ] Les données d'entraînement sont-elles représentatives de la population cible ?
- [ ] Les résultats ont-ils été comparés par groupe démographique ?
- [ ] Un test de parité démographique a-t-il été effectué ?
- [ ] Les cas limites (edge cases) ont-ils été testés ?
- [ ] Un humain a-t-il validé un échantillon de décisions ?

### Checklist "IA Générative"
- [ ] Le modèle a-t-il été testé pour les stéréotypes de genre ?
- [ ] Le modèle a-t-il été testé pour les biais ethniques/culturels ?
- [ ] La toxicité des outputs a-t-elle été évaluée ?
- [ ] Les hallucinations ciblant des groupes ont-elles été recherchées ?
- [ ] Les réponses à des prompts sensibles ont-elles été vérifiées ?

### Checklist "Recrutement / RH"
- [ ] Les taux de sélection par genre ont-ils été comparés ?
- [ ] Les taux de sélection par âge ont-ils été comparés ?
- [ ] Le modèle utilise-t-il des variables proxy (code postal, nom, école) ?
- [ ] Un test d'impact disparate (4/5 rule) a-t-il été effectué ?
- [ ] Les candidats rejetés ont-ils accès à une explication ?

### Import de résultats
- Upload CSV/JSON avec colonnes : `metric`, `group_a`, `group_b`, `value_a`, `value_b`, `threshold`, `pass_fail`
- Parsing automatique et création de findings pour les tests échoués

## 6. Vues et tableaux de bord

### Vue liste
- Table de tous les findings avec : système, type, sévérité, dimensions, statut, date
- Filtres : système, sévérité, type, statut, dimension protégée
- Badge de compteur par sévérité en en-tête

### Vue par système
- Onglet "Biais" dans la fiche système (Module 01)
- Résumé : nombre de findings par sévérité, taux de résolution
- Graphique tendance (findings ouverts vs. résolus dans le temps)

### Tendances
- Graphique linéaire : nombre de findings ouverts par mois
- Graphique barres empilées : findings par type de biais
- Indicateur de dérive : comparaison avec la période précédente
- "Dette de risque biais" : somme des findings non résolus × sévérité

## 7. Règles métier

1. Un finding `critical` déclenche une notification immédiate au risk manager et au sponsor
2. Un finding ne peut passer à `resolved` sans preuve de re-test jointe
3. `accepted_risk` nécessite une décision formelle (Module 04) avec justification
4. Les findings sont immutables après résolution (modification = nouveau finding)
5. Les checklists de tests sont personnalisables par l'organisation
6. L'import CSV crée des findings en `draft` pour validation humaine

## 8. Composants UI

| Composant | Usage |
|-----------|-------|
| `BiasFindings Table` | Table principale avec filtres |
| `BiasFindings Form` | Formulaire de création/édition |
| `RemediationPlan` | Section plan de remédiation dans le formulaire |
| `FairnessMetricsPanel` | Affichage des métriques avec jauge |
| `BiasChecklistRunner` | Checklist interactive à cocher |
| `CsvImporter` | Import de résultats CSV avec preview |
| `BiasTrendChart` | Graphiques de tendance (Recharts) |
| `BiasDebtIndicator` | Indicateur de dette de risque biais |

## 9. Relations

| Module | Relation |
|--------|----------|
| 01 - Systèmes IA | FK `ai_system_id` |
| 03 - Risques | Findings alimentent la réévaluation des risques |
| 04 - Décisions | `accepted_risk` → lien vers une décision formelle |
| 06 - Incidents | Un incident peut révéler un biais → création de finding |
| 10 - Monitoring | Alertes de monitoring → creation de finding |
| 13 - Conformité | Tests de biais = preuves de conformité EU AI Act Art. 10 |
