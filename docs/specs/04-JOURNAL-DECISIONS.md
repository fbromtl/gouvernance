# Module 04 — Journal de Décision Algorithmique

> **Route** : `/decisions`
> **Priorité** : MVP (Phase 1)
> **Dépendances** : Module 01 (systèmes IA), Module 02 (rôles), Module 15 (auth)

## 1. Objectif

Conserver la trace de toutes les décisions relatives aux systèmes IA (mise en production, changement de modèle, choix de seuil, arbitrages éthiques) et démontrer la supervision humaine. Répond aux exigences de traçabilité de l'EU AI Act (Art. 12, 14), de la Loi 25 (décisions automatisées) et du RGPD (Art. 22).

## 2. User Stories

| ID | En tant que... | Je veux... | Afin de... |
|----|---------------|-----------|-----------|
| US-04-01 | Risk manager | enregistrer une décision (go/no-go, changement, arbitrage) | tracer la supervision humaine |
| US-04-02 | Compliance officer | consulter l'historique complet des décisions par système | prouver la gouvernance en audit |
| US-04-03 | Ethics officer | documenter les arbitrages éthiques | justifier les choix sensibles |
| US-04-04 | Auditeur | rechercher et exporter les décisions | produire des preuves d'audit |
| US-04-05 | Admin org | voir les décisions en attente d'approbation | ne pas bloquer les processus |
| US-04-06 | Compliance officer | lier des preuves (tests, revues) à une décision | constituer le dossier complet |

## 3. Types de décisions

| Type | Code | Description | Approbation requise |
|------|------|-------------|-------------------|
| Go / No-Go production | `go_nogo` | Autorisation de mise en production | Sponsor + Risk manager |
| Modification substantielle | `substantial_change` | Changement majeur (modèle, données, seuils) | Risk manager |
| Déploiement élargi | `scale_deployment` | Extension à un nouveau périmètre | Business owner + Sponsor |
| Changement fournisseur/modèle | `vendor_change` | Remplacement de modèle ou fournisseur | Tech owner + Risk manager |
| Ajustement de politique | `policy_adjustment` | Modification des garde-fous ou seuils | Compliance officer |
| Arbitrage éthique | `ethical_arbitration` | Décision impliquant un dilemme éthique | Ethics officer + Sponsor |
| Suspension / retrait | `suspension` | Arrêt temporaire ou permanent | Admin org |
| Exception / dérogation | `exception` | Dérogation aux règles établies | Sponsor |

## 4. Structure d'une décision

### Champs obligatoires
- **Titre** (texte, max 200 car.)
- **Type** (select parmi les types ci-dessus)
- **Système(s) IA concerné(s)** (multi-select → FK `ai_systems`)
- **Contexte** (rich text) : pourquoi cette décision est nécessaire
- **Options considérées** (rich text) : alternatives évaluées
- **Décision prise** (rich text) : ce qui a été décidé
- **Justification** (rich text) : pourquoi cette option a été retenue
- **Risques résiduels acceptés** (rich text) : risques non éliminés et raison de leur acceptation
- **Conditions / garde-fous** (rich text) : conditions de validité de la décision
- **Demandeur** (select utilisateur)
- **Approbateur(s)** (multi-select utilisateurs)

### Champs optionnels
- **Impact estimé** (select) : `low`, `medium`, `high`, `critical`
- **Date d'effet** (date)
- **Date d'expiration / revue** (date)
- **Lien vers évaluation de risque** (FK `risk_assessments`)
- **Lien vers incident déclencheur** (FK `incidents`)

### Pièces jointes (preuves)
- Résultats de tests
- Revue vie privée / EFVP
- Revue sécurité
- Rapport de biais
- PV de comité
- Autre document

## 5. Workflow d'approbation

```
draft → submitted → in_review → approved / rejected → implemented → archived
```

### États
| Statut | Description | Actions possibles |
|--------|-------------|-------------------|
| `draft` | En rédaction | Modifier, soumettre, supprimer |
| `submitted` | Soumis pour approbation | Rappeler, modifier |
| `in_review` | En cours de revue par les approbateurs | Approuver, rejeter, demander des modifications |
| `approved` | Approuvé | Marquer comme implémenté |
| `rejected` | Rejeté avec motif | Créer nouvelle version, archiver |
| `implemented` | Décision appliquée | Archiver |
| `archived` | Clôturé | Consultation uniquement |

### Notifications
- `submitted` → notification aux approbateurs
- `approved` / `rejected` → notification au demandeur
- Rappel à J+7 si en `in_review` sans action

## 6. Piste d'audit immuable

Chaque décision génère un enregistrement immutable :
- **Horodatage** (timestamp UTC)
- **Auteur** (utilisateur + rôle)
- **Version du document** (auto-incrémentée)
- **Hash d'intégrité** (SHA-256 du contenu complet)
- **Pièces jointes hashées** (SHA-256 de chaque fichier)

La chaîne d'intégrité est vérifiable : le hash de la version N inclut le hash de la version N-1.

## 7. Niveaux d'explication (Explainability)

Pour chaque décision documentée, 3 niveaux d'explication sont possibles :

| Niveau | Audience | Format |
|--------|----------|--------|
| Technique | Data scientists, ingénieurs | Facteurs d'influence, métriques, SHAP values |
| Métier | Managers, compliance | Traduction en langage naturel des raisons |
| Grand public | Personnes affectées | Formulation simple, conforme Loi 25 |

Chaque niveau est un champ textarea optionnel dans la fiche décision.

## 8. Recherche et filtres

- Recherche plein texte (titre, contexte, justification)
- Filtres : type, système IA, statut, approbateur, période, impact
- Tri : date (desc par défaut), impact, type
- Période prédéfinie : dernier mois, trimestre, année

## 9. Exports

- **PDF horodaté** : fiche décision complète avec preuves, hash d'intégrité
- **CSV** : liste des décisions avec métadonnées
- **JSON** : export structuré pour intégration
- **Rapport trimestriel** : top décisions du trimestre, auto-généré

## 10. Règles métier

1. **Immutabilité** : une décision `approved` ne peut plus être modifiée — seule une nouvelle décision peut la remplacer
2. **Approbation obligatoire** : les décisions `go_nogo` et `ethical_arbitration` nécessitent au minimum 2 approbateurs
3. **Lien système requis** : toute décision doit être liée à au moins un système IA
4. **Hash chaîné** : chaque version inclut le hash de la précédente (intégrité)
5. **Rétention** : les décisions sont conservées minimum 5 ans (EU AI Act) — pas de suppression possible
6. **Permissions** :
   - Créer : tous sauf `auditor` et `member`
   - Approuver : selon le type de décision (voir tableau section 3)
   - Consulter : tous les membres de l'organisation
   - Exporter : `org_admin`, `compliance_officer`, `auditor`

## 11. Composants UI

| Composant | Usage |
|-----------|-------|
| `DecisionForm` | Formulaire complet avec rich text (TipTap) |
| `DecisionTimeline` | Timeline chronologique des décisions d'un système |
| `ApprovalWorkflow` | Visualisation du workflow + actions |
| `DecisionCard` | Card résumé avec type, statut, impact |
| `IntegrityBadge` | Badge vert si hash valide, rouge sinon |
| `ExplanationTabs` | Onglets technique/métier/grand public |
| `DecisionSearch` | Recherche avancée avec filtres combinés |
| `QuarterlyReport` | Génération du rapport trimestriel |

## 12. Relations

| Module | Relation |
|--------|----------|
| 01 - Systèmes IA | FK `ai_system_id` (N-N via table de jonction) |
| 02 - Gouvernance | Approbateurs = rôles de gouvernance, lien comité |
| 03 - Risques | FK optionnel `risk_assessment_id` |
| 06 - Incidents | FK optionnel `incident_id` (incident déclencheur) |
| 08 - Cycle de vie | Décision de changement → événement de cycle de vie |
| 09 - Documentation | Pièces jointes = preuves documentées |
