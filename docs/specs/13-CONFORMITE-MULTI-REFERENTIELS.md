# Module 13 — Conformité Multi-Référentiels

> **Route** : `/compliance`
> **Priorité** : MVP (Phase 1)
> **Dépendances** : Tous les autres modules (ils alimentent les preuves), Module 15 (auth)

## 1. Objectif

Donner une lecture "dirigeant" : où l'organisation est conforme, où sont les écarts, et quel est le plan de remédiation. Matrice croisée exigences × contrôles × preuves pour chaque référentiel (Loi 25, NIST AI RMF, ISO 42001, EU AI Act, RGPD).

## 2. User Stories

| ID | En tant que... | Je veux... | Afin de... |
|----|---------------|-----------|-----------|
| US-13-01 | Compliance officer | voir le statut de conformité par référentiel | identifier les écarts |
| US-13-02 | Admin org | voir un score de conformité global | comprendre ma posture en un coup d'œil |
| US-13-03 | Compliance officer | mapper les contrôles existants aux exigences | démontrer la couverture |
| US-13-04 | Compliance officer | identifier les écarts et créer un plan de remédiation | planifier les actions |
| US-13-05 | Auditeur | consulter les preuves associées à chaque exigence | vérifier la conformité |
| US-13-06 | Admin org | recevoir des alertes sur les changements réglementaires | rester à jour |
| US-13-07 | Compliance officer | générer un rapport de conformité par référentiel | présenter au CA ou auditer |

## 3. Référentiels supportés

### Loi 25 — Québec
Exigences spécifiques applicables au secteur privé :

| ID | Exigence | Module source |
|----|----------|--------------|
| L25-01 | Responsable de la protection des RP désigné | Module 02 |
| L25-02 | Politiques et pratiques de gouvernance des RP publiées | Module 02 |
| L25-03 | EFVP réalisée pour les projets impliquant des RP | Module 11 |
| L25-04 | EFVP avant communication hors Québec | Module 11 |
| L25-05 | Registre des incidents de confidentialité tenu | Module 06 |
| L25-06 | Notification CAI si risque de préjudice sérieux | Module 06 |
| L25-07 | Information des personnes pour décisions automatisées | Module 07 |
| L25-08 | Droit d'explication et mécanisme de contestation | Module 07 |
| L25-09 | Consentement libre et éclairé | Module 11 |
| L25-10 | Conservation limitée et destruction documentée | Module 11 |
| L25-11 | Formation du personnel | Module 02 |

### EU AI Act
Exigences pour les systèmes à haut risque (si applicable) :

| ID | Exigence (Article) | Module source |
|----|-------------------|--------------|
| EUAI-01 | Classification des systèmes par risque (Art. 6) | Module 03 |
| EUAI-02 | Système de gestion des risques (Art. 9) | Module 03 |
| EUAI-03 | Gouvernance des données (Art. 10) | Module 11 |
| EUAI-04 | Documentation technique (Art. 11, Annexe IV) | Module 09 |
| EUAI-05 | Tenue de logs automatiques (Art. 12) | Module 04, 15 |
| EUAI-06 | Transparence et information (Art. 13) | Module 07 |
| EUAI-07 | Surveillance humaine (Art. 14) | Module 04, 07 |
| EUAI-08 | Exactitude, robustesse, cybersécurité (Art. 15) | Module 10 |
| EUAI-09 | Enregistrement dans la base de données UE (Art. 49) | Module 01 |
| EUAI-10 | Monitoring post-marché (Art. 72) | Module 10 |
| EUAI-11 | Notification des incidents graves (Art. 62) | Module 06 |
| EUAI-12 | FRIA déployers (Art. 27) | Module 03 |
| EUAI-13 | Obligations de transparence GenAI (Art. 50) | Module 07 |

### NIST AI RMF
Structure GOVERN / MAP / MEASURE / MANAGE :

| Fonction | Catégories | Module source |
|----------|-----------|--------------|
| GOVERN | GV-1 Politiques, GV-2 Rôles, GV-3 Workforce, GV-4 Culture, GV-5 Stakeholders, GV-6 Feedback | Module 02 |
| MAP | MP-1 Context, MP-2 Requirements, MP-3 Benefits/costs, MP-4 Risks, MP-5 Impact | Module 01, 03 |
| MEASURE | MS-1 Methods, MS-2 Evaluate, MS-3 Monitor | Module 05, 10 |
| MANAGE | MG-1 Allocate risks, MG-2 Plan/track, MG-3 Communicate, MG-4 Document | Module 04, 06, 09 |

### ISO/IEC 42001
Clauses du système de management IA (AIMS) :

| Clause | Exigence | Module source |
|--------|----------|--------------|
| 4 | Contexte de l'organisation | Module 01 |
| 5 | Leadership et engagement | Module 02 |
| 6 | Planification (risques et objectifs) | Module 03 |
| 7 | Support (ressources, compétences, communication) | Module 02 |
| 8 | Opérations (planification, évaluation d'impact) | Module 03, 08, 11 |
| 9 | Évaluation des performances | Module 10, 14 |
| 10 | Amélioration continue | Module 06, 08 |

### RGPD/GDPR
Exigences principales si données UE :

| ID | Exigence | Module source |
|----|----------|--------------|
| RGPD-01 | Base légale du traitement (Art. 6) | Module 11 |
| RGPD-02 | Consentement (Art. 7) | Module 11 |
| RGPD-03 | Droits des personnes (Art. 15-22) | Module 07 |
| RGPD-04 | DPIA (Art. 35) | Module 11 |
| RGPD-05 | Notification de violation (Art. 33-34) | Module 06 |
| RGPD-06 | DPO désigné (Art. 37) | Module 02 |
| RGPD-07 | Transferts internationaux (Art. 44-49) | Module 11 |

## 4. Matrice Exigences × Contrôles × Preuves

### Structure
Pour chaque exigence d'un référentiel :
- **ID exigence** (code unique)
- **Description** (texte)
- **Contrôle(s) associé(s)** (quels mécanismes de la plateforme couvrent cette exigence)
- **Preuve(s)** (documents, enregistrements, captures qui démontrent le contrôle)
- **Statut de conformité** (auto-calculé ou manual override) :
  - `compliant` — Conforme (contrôle en place + preuve)
  - `partially_compliant` — Partiellement conforme (contrôle partiel ou preuve incomplète)
  - `non_compliant` — Non conforme (pas de contrôle ou pas de preuve)
  - `not_applicable` — Non applicable
- **Responsable** (select utilisateur)
- **Date de dernière vérification**
- **Commentaires** (textarea)

### Auto-détection des preuves
La plateforme peut automatiquement détecter certaines preuves :
- L25-01 : vérifie si un `privacy_officer` est assigné dans Module 02
- L25-05 : vérifie si le registre d'incidents contient des entrées de type confidentialité
- EUAI-01 : vérifie si les systèmes ont une classification de risque
- etc.

## 5. Score de conformité

### Par référentiel
```
score = (nb exigences conformes × 1 + nb partiellement conformes × 0.5) / nb exigences applicables × 100
```

### Global
Moyenne pondérée des scores par référentiel (pondération configurable par l'organisation).

### Visualisation
- Jauge circulaire par référentiel avec code couleur (vert ≥ 80%, jaune 50-79%, rouge < 50%)
- Radar chart comparant les référentiels
- Graphique de tendance (score par mois)

## 6. Plan de remédiation

Pour chaque exigence `non_compliant` ou `partially_compliant` :
- **Action requise** (texte)
- **Responsable** (select utilisateur)
- **Échéance** (date)
- **Priorité** (select) : `critical`, `high`, `medium`, `low`
- **Statut** : `planned`, `in_progress`, `completed`, `deferred`
- **Notes** (textarea)

### Vue roadmap
- Timeline des actions de remédiation par trimestre
- Filtre par référentiel, priorité, responsable
- Projection : score estimé après complétion des actions planifiées

## 7. Veille réglementaire

- Section dédiée aux changements réglementaires récents
- Alertes quand un nouveau texte ou une modification affecte l'organisation
- Analyse d'impact : quels systèmes / quels contrôles sont affectés
- Source : saisie manuelle par le compliance officer (pas de scraping automatique en Phase 1)

## 8. Checklists interactives

Par référentiel et par système IA, checklist interactive :
- Chaque item = une exigence
- Statut cochable : conforme / partiel / non conforme / N/A
- Horodatage + utilisateur pour chaque modification
- Progression visuelle (barre de progression)
- Export de la checklist complétée

## 9. Règles métier

1. Les statuts de conformité auto-détectés peuvent être overridés manuellement avec justification
2. Un plan de remédiation est obligatoire pour chaque exigence `non_compliant` sur un référentiel activé
3. Le score de conformité est recalculé en temps réel
4. Les référentiels sont activables/désactivables par l'organisation (pas tous obligatoires)
5. L'historique des changements de statut est conservé (audit trail)
6. L'EU AI Act n'est activé que si l'organisation a coché "clients UE" dans ses paramètres

## 10. Composants UI

| Composant | Usage |
|-----------|-------|
| `ComplianceDashboard` | Vue globale avec scores et radar |
| `FrameworkScoreGauge` | Jauge par référentiel |
| `ComplianceMatrix` | Matrice exigences × contrôles × preuves |
| `ComplianceChecklist` | Checklist interactive par référentiel |
| `RemediationPlan` | Table des actions avec timeline |
| `RemediationRoadmap` | Vue timeline/kanban des actions |
| `ComplianceTrendChart` | Évolution du score dans le temps |
| `RadarChart` | Comparaison multi-référentiels (Recharts) |
| `RegulatoryAlertPanel` | Alertes de veille réglementaire |

## 11. Relations

| Module | Relation |
|--------|----------|
| Tous les modules | Chaque module fournit des preuves de conformité |
| 01 - Systèmes IA | Classification = base pour EU AI Act |
| 02 - Gouvernance | Rôles et politiques = preuves gouvernance |
| 03 - Risques | Évaluations = preuves risque |
| 06 - Incidents | Registre = preuve Loi 25 |
| 07 - Transparence | Mécanismes = preuve transparence |
| 09 - Documentation | Documents = preuves exportables |
| 11 - Données | EFVP = preuve vie privée |
