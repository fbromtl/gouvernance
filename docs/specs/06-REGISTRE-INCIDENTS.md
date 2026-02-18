# Module 06 — Registre des Incidents

> **Route** : `/incidents`
> **Priorité** : MVP (Phase 1)
> **Dépendances** : Module 01 (systèmes IA), Module 15 (auth)

## 1. Objectif

Gérer les incidents IA (qualité, sécurité, dérive, éthique) ET couvrir l'obligation québécoise (Loi 25) de tenir un registre des incidents de confidentialité et de notifier la CAI en cas de risque de préjudice sérieux. Le module couvre deux types d'incidents distincts mais liés.

## 2. User Stories

| ID | En tant que... | Je veux... | Afin de... |
|----|---------------|-----------|-----------|
| US-06-01 | Membre | signaler un incident IA rapidement | alerter les responsables |
| US-06-02 | Risk manager | triager et classifier les incidents par sévérité | prioriser les actions |
| US-06-03 | Compliance officer | gérer le workflow complet d'un incident | résoudre et documenter |
| US-06-04 | Compliance officer | notifier la CAI pour un incident de confidentialité avec risque de préjudice sérieux | respecter la Loi 25 |
| US-06-05 | Admin org | voir le tableau de bord des incidents ouverts | suivre la situation globale |
| US-06-06 | Data scientist | documenter un post-mortem | prévenir les récurrences |
| US-06-07 | Auditeur | consulter et exporter le registre complet | prouver la gestion des incidents |
| US-06-08 | Compliance officer | gérer les incidents "sérieux" selon l'EU AI Act (Art. 62) | respecter les obligations de notification |

## 3. Types d'incidents

### 3A. Incidents IA (opérationnels / éthiques / sécurité)

| Catégorie | Code | Exemples |
|-----------|------|----------|
| Performance / qualité | `performance` | Dégradation de performance, erreurs de prédiction, drift |
| Sécurité | `security` | Attaque adversariale, injection de prompt, fuite de données |
| Biais / discrimination | `bias` | Discrimination détectée, résultats inéquitables |
| Éthique | `ethics` | Contenu inapproprié, hallucination nuisible, manipulation |
| Disponibilité | `availability` | Panne, indisponibilité, latence excessive |
| Conformité | `compliance` | Non-respect d'une obligation réglementaire |
| Usage non autorisé | `unauthorized_use` | Shadow AI, usage hors périmètre approuvé |

### 3B. Incidents de confidentialité (Loi 25)

| Type | Code | Description |
|------|------|-------------|
| Accès non autorisé | `unauthorized_access` | Accès à des RP sans autorisation |
| Utilisation non autorisée | `unauthorized_use_data` | Utilisation de RP hors finalité |
| Communication non autorisée | `unauthorized_disclosure` | Divulgation de RP à un tiers |
| Perte | `data_loss` | Perte de RP (suppression, destruction) |
| Vol | `data_theft` | Vol de RP (exfiltration) |
| Autre atteinte | `other_breach` | Tout autre incident impliquant des RP |

## 4. Structure d'un incident

### Signalement initial (formulaire rapide)
- **Titre** (texte, requis)
- **Catégorie** (select — IA ou confidentialité)
- **Type** (select selon la catégorie)
- **Système(s) IA concerné(s)** (multi-select, optionnel si pas encore identifié)
- **Description** (textarea, requis)
- **Date/heure de détection** (datetime, requis)
- **Date/heure estimée de début** (datetime, optionnel)
- **Mode de détection** (select) : `automated_monitoring`, `user_report`, `internal_audit`, `external_report`, `media`, `regulatory`
- **Signalé par** (auto = current user)
- **Sévérité initiale** (select) : `critical`, `high`, `medium`, `low`
- **Pièces jointes** (fichiers, captures d'écran)

### Triage (complété par le risk manager)
- **Sévérité confirmée** (select)
- **Assigné à** (select utilisateur)
- **Impact estimé** (textarea)
- **Personnes potentiellement affectées** (nombre estimé)
- **Données concernées** (multi-select pour confidentialité) : types de RP impliqués
- **Périmètre** (textarea) : géographique, organisationnel
- **Priorité** (select) : `p1_immediate`, `p2_24h`, `p3_72h`, `p4_week`
- **Risque de préjudice sérieux** (toggle — si oui → workflow Loi 25)

### Investigation
- **Analyse de cause racine (RCA)** (rich text)
- **Facteurs contributifs** (multi-select) : `data_quality`, `model_drift`, `config_error`, `security_breach`, `design_flaw`, `human_error`, `vendor_issue`, `other`
- **Preuves collectées** (fichiers)
- **Personnes interrogées** (liste)
- **Reproduction du problème** (oui/non + description)

### Résolution
- **Actions correctives** (liste de tâches avec responsable + date + statut)
- **Tests de validation** (description + résultats)
- **Changements apportés** (liens vers Module 08 si changement substantiel)
- **Date de résolution** (date)
- **Validation de la résolution** (approbation par le risk manager)

### Post-mortem
- **Résumé de l'incident** (rich text)
- **Chronologie** (timeline des événements clés)
- **Cause racine finale** (rich text)
- **Mesures préventives** (liste d'actions à long terme)
- **Leçons apprises** (rich text)
- **Mise à jour de l'évaluation de risque** (lien vers Module 03)
- **Communication** (qui a été informé, quand)

## 5. Workflow

```
reported → triaged → investigating → resolving → resolved → post_mortem → closed
```

| Statut | Description | SLA par défaut |
|--------|-------------|---------------|
| `reported` | Signalé, en attente de triage | — |
| `triaged` | Classifié, assigné | P1: 1h, P2: 4h, P3: 24h, P4: 72h |
| `investigating` | Investigation en cours | P1: 4h, P2: 24h |
| `resolving` | Correction en cours | P1: 24h, P2: 72h |
| `resolved` | Corrigé, en validation | — |
| `post_mortem` | Post-mortem en cours | 7 jours après résolution |
| `closed` | Clôturé | — |

## 6. Workflow Loi 25 — Incidents de confidentialité

Quand `risque_prejudice_serieux = true` :

### Notifications obligatoires
1. **CAI (Commission d'accès à l'information)** : notification dans les meilleurs délais
   - Formulaire pré-rempli avec les champs requis par la CAI
   - Export PDF du formulaire de notification
   - Suivi du statut : `to_notify` → `notified` → `acknowledged`
2. **Personnes affectées** : notification avec description de l'incident et mesures prises
   - Template de notification (langage simple)
   - Suivi : envoyée oui/non, date

### Registre Loi 25 (obligatoire)
Le registre dédié contient pour chaque incident :
- Description des RP impliqués
- Circonstances de l'incident
- Date ou période de l'incident
- Date de connaissance de l'incident
- Nombre de personnes concernées
- Description des mesures prises pour diminuer les risques
- Statut de notification (CAI + personnes)

Ce registre est exportable sur demande (preuve pour la CAI).

## 7. Workflow EU AI Act (Art. 62) — Incidents sérieux

Pour les systèmes IA couverts par l'EU AI Act et classés haut risque :

### Critères d'incident sérieux
- Décès ou dommage grave à la santé
- Perturbation grave de la gestion d'infrastructure critique
- Violation des droits fondamentaux
- Dommage grave à la propriété ou à l'environnement

### Obligations
- Notification à l'autorité de surveillance compétente
- Investigation documentée
- Actions correctives avec preuves
- Template de rapport conforme Art. 62

## 8. Niveaux de sévérité

| Sévérité | Couleur | Critères | Temps de réponse |
|----------|---------|----------|-----------------|
| Critique | Rouge | Atteinte aux droits fondamentaux, données sensibles exposées à grande échelle, impact sur la santé/sécurité | < 1 heure |
| Élevée | Orange | Discrimination avérée, fuite de RP, panne système critique | < 4 heures |
| Moyenne | Jaune | Dérive de performance, biais détecté sans impact immédiat, incident de qualité | < 24 heures |
| Faible | Vert | Anomalie mineure, faux positif, incident sans impact sur les personnes | < 72 heures |

## 9. Métriques et dashboard

- **Incidents ouverts** par sévérité (compteurs + badges)
- **MTTR** (Mean Time To Resolution) global et par sévérité
- **Tendance** : incidents par mois (graphique barres)
- **Répartition** : par catégorie, par système, par cause racine
- **SLA compliance** : pourcentage d'incidents résolus dans les délais
- **Incidents récurrents** : systèmes avec > 3 incidents sur 6 mois

## 10. Règles métier

1. Tout membre peut signaler un incident (barrière minimale)
2. Un incident `critical` déclenche notification immédiate à l'admin org, risk manager et sponsor
3. Le passage à `closed` nécessite un post-mortem complété
4. Les incidents de confidentialité avec préjudice sérieux DOIVENT avoir une notification CAI documentée
5. Un incident ne peut jamais être supprimé — soft delete uniquement
6. Le lien avec le système IA est obligatoire avant la clôture
7. Rétention minimum : 5 ans (ou durée réglementaire applicable)

## 11. Composants UI

| Composant | Usage |
|-----------|-------|
| `IncidentReportForm` | Formulaire de signalement rapide (3-5 champs) |
| `IncidentDetailPage` | Page complète avec tous les onglets |
| `IncidentWorkflowStepper` | Visualisation du workflow avec étape courante |
| `SeverityBadge` | Badge coloré de sévérité |
| `IncidentTimeline` | Timeline chronologique des événements |
| `PostMortemEditor` | Éditeur rich text pour le post-mortem |
| `CaiNotificationForm` | Formulaire pré-rempli pour notification CAI |
| `IncidentDashboard` | Dashboard avec métriques clés |
| `IncidentTable` | Table avec filtres avancés |
| `SlaIndicator` | Indicateur visuel de respect des SLA |

## 12. Relations

| Module | Relation |
|--------|----------|
| 01 - Systèmes IA | FK `ai_system_id` (N-N via table de jonction) |
| 03 - Risques | Incident peut déclencher réévaluation |
| 04 - Décisions | Décision de suspension suite à incident |
| 05 - Biais | Incident peut révéler un biais → création de finding |
| 08 - Cycle de vie | Actions correctives = événements de cycle de vie |
| 10 - Monitoring | Alerte de monitoring → création automatique d'incident |
| 11 - Données | Incident de confidentialité → lien avec inventaire données |
| 13 - Conformité | Incidents = preuves de conformité (Loi 25, EU AI Act) |
