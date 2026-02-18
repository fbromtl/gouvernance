# Module 02 — Gouvernance & Responsabilités

> **Route** : `/governance`
> **Priorité** : MVP (Phase 1)
> **Dépendances** : Module 15 (auth/RBAC)

## 1. Objectif

Clarifier "qui décide quoi" en matière d'IA dans l'organisation et prouver la gouvernance. Ce module permet de définir les rôles, les comités, les politiques et les formations — éléments indispensables pour démontrer la gouvernance lors d'audits ou devant le CA.

## 2. User Stories

| ID | En tant que... | Je veux... | Afin de... |
|----|---------------|-----------|-----------|
| US-02-01 | Admin org | définir les rôles de gouvernance IA | clarifier les responsabilités |
| US-02-02 | Admin org | créer une matrice RACI par système IA | documenter qui est responsable de quoi |
| US-02-03 | Compliance officer | gérer les politiques IA (création, versioning, publication) | avoir des politiques à jour et traçables |
| US-02-04 | Admin org | configurer des comités de gouvernance | structurer la prise de décision |
| US-02-05 | Admin org | suivre les formations et sensibilisations | prouver la préparation opérationnelle |
| US-02-06 | Compliance officer | planifier et suivre les revues périodiques | assurer la conformité continue |
| US-02-07 | Auditeur | consulter l'historique des politiques et attestations | vérifier la gouvernance effective |
| US-02-08 | Membre | consulter les politiques publiées | connaître les règles applicables |

## 3. Sous-modules

### 3A. Rôles de gouvernance

#### Rôles prédéfinis (templates)
L'organisation peut activer et assigner ces rôles. Chaque rôle est un template modifiable.

| Rôle template | Code | Description |
|--------------|------|-------------|
| Sponsor exécutif | `sponsor` | Membre C-Level responsable de la stratégie IA |
| Responsable IA | `ai_lead` | Pilote opérationnel de la gouvernance IA |
| Responsable vie privée | `privacy_officer` | Gestion des RP et conformité Loi 25 |
| Responsable risques | `risk_officer` | Évaluations et gestion des risques |
| Responsable sécurité | `security_officer` | Sécurité des systèmes IA |
| Responsable éthique | `ethics_officer` | Évaluations éthiques et transparence |
| Juridique | `legal_counsel` | Conformité réglementaire |
| Responsable modèle | `model_owner` | Propriétaire technique d'un modèle |
| Approbateur | `approver` | Autorité d'approbation (go/no-go) |

#### Champs d'un rôle
- Titre du rôle (texte)
- Description / mandat (textarea)
- Personne assignée (select utilisateur)
- Date de nomination
- Périmètre : global (toute l'org) ou par système(s) IA
- Statut : `active`, `inactive`

### 3B. Matrice RACI

Matrice interactive liant systèmes IA × rôles × activités.

#### Activités standards (templates)
- Enregistrement d'un nouveau système IA
- Évaluation des risques
- Approbation de mise en production
- Monitoring post-déploiement
- Gestion des incidents
- Évaluation des biais
- EFVP (évaluation vie privée)
- Revue périodique
- Décommissionnement

#### Interface
- Tableau matriciel éditable : colonnes = rôles, lignes = activités
- Valeurs : `R` (Responsible), `A` (Accountable), `C` (Consulted), `I` (Informed), `-` (non impliqué)
- Un RACI peut être défini globalement (org) ou par système IA spécifique
- Validation : chaque activité doit avoir exactement un `A`
- Export PDF du RACI

### 3C. Politiques & procédures

#### Types de politiques (templates disponibles)
- Politique d'utilisation de l'IA
- Politique d'utilisation de l'IA générative
- Procédure d'approbation des systèmes IA
- Procédure de gestion des incidents IA
- Procédure de traitement des plaintes
- Procédure de retrait / décommissionnement
- Politique de protection des RP (Loi 25)
- Charte éthique IA

#### Champs d'une politique
- Titre (texte, requis)
- Type (select parmi templates + custom)
- Contenu (éditeur rich text — TipTap ou similar)
- Version (auto-incrémentée : v1.0, v1.1, v2.0...)
- Statut : `draft` → `in_review` → `published` → `archived`
- Auteur (auto)
- Réviseur(s) assigné(s)
- Date de publication
- Date de prochaine révision
- Pièces jointes (fichiers annexes)
- Tags (multi-select libre)

#### Workflow de publication
1. **Brouillon** (`draft`) : rédaction par l'auteur
2. **En révision** (`in_review`) : notification aux réviseurs, commentaires possibles
3. **Publiée** (`published`) : visible par tous les membres, version figée
4. **Archivée** (`archived`) : remplacée par une nouvelle version

#### Versioning
- À chaque publication, une snapshot immutable est créée
- L'historique complet des versions est consultable
- Comparaison diff entre versions (texte)

### 3D. Comités de gouvernance

#### Champs d'un comité
- Nom (texte, requis)
- Mandat / description (textarea)
- Membres (multi-select utilisateurs + rôle dans le comité : président, membre, secrétaire)
- Fréquence de réunion : `weekly`, `monthly`, `quarterly`, `ad_hoc`
- Prochaine réunion prévue (date)
- Historique des réunions :
  - Date
  - Participants présents
  - Ordre du jour (texte)
  - Compte rendu (rich text ou fichier)
  - Décisions prises (liens vers Module 04)
  - Actions à suivre (tâches avec responsable + échéance)

### 3E. Formation & sensibilisation

#### Registre des formations
- Titre de la formation
- Description / contenu couvert
- Type : `initial`, `refresh`, `specialized`, `awareness`
- Public cible (rôles ou personnes)
- Date(s) de session
- Durée
- Formateur (interne/externe)
- Statut : `planned`, `completed`, `cancelled`

#### Suivi des participations
- Table : formation × participant × statut
- Statuts : `enrolled`, `completed`, `absent`, `exempt`
- Date de complétion
- Attestation (fichier uploadable ou auto-généré)
- Alerte si un rôle obligatoire n'a pas suivi sa formation requise

### 3F. Calendrier de revues

- Calendrier visuel (vue mois/trimestre) des revues planifiées
- Types de revue : `system_review`, `policy_review`, `risk_review`, `committee_meeting`
- Chaque revue a un statut : `planned`, `in_progress`, `completed`, `overdue`
- Attestation de complétion ("review completed") avec date et signataire
- Alertes automatiques à J-14 et J-7 avant la date de revue

## 4. Conformité Loi 25

Ce module couvre directement plusieurs exigences de la Loi 25 :
- **Responsable de la protection des RP** : le rôle `privacy_officer` doit être assigné et publié
- **Politiques et pratiques** : la politique de protection des RP doit être publiée et accessible
- **Formation** : les employés manipulant des RP doivent avoir suivi une formation documentée
- **Gouvernance** : démontrer que des structures de gouvernance existent et fonctionnent

## 5. Règles métier

1. **Rôle obligatoire** : au moins un `sponsor` et un `ai_lead` doivent être assignés pour que l'organisation soit considérée "gouvernée"
2. **RACI validation** : une activité ne peut pas avoir 0 "Accountable" ou plus de 1
3. **Politique publiée** : seul un `org_admin` ou `compliance_officer` peut publier
4. **Version immutable** : une politique publiée ne peut plus être modifiée — il faut créer une nouvelle version
5. **Formation requise** : si un rôle est assigné à un utilisateur, les formations associées deviennent obligatoires

## 6. Composants UI

| Composant | Usage |
|-----------|-------|
| `RoleAssignmentPanel` | Liste des rôles avec assignation |
| `RaciMatrix` | Tableau matriciel éditable |
| `PolicyEditor` | Éditeur rich text avec versioning |
| `PolicyTimeline` | Historique des versions |
| `CommitteeCard` | Fiche comité avec membres |
| `MeetingMinutesForm` | Formulaire de compte rendu |
| `TrainingTracker` | Table formation × participants |
| `ReviewCalendar` | Calendrier visuel des revues |
| `AttestationBadge` | Badge "revue complétée" avec horodatage |

## 7. Relations

| Module | Relation |
|--------|----------|
| 01 - Systèmes IA | RACI par système, propriétaires |
| 04 - Décisions | Décisions prises en comité |
| 09 - Documentation | Politiques versionnées = documents de preuve |
| 13 - Conformité | Gouvernance = contrôle de conformité (Loi 25, ISO 42001) |
| 15 - Plateforme | Rôles RBAC ↔ rôles de gouvernance |
