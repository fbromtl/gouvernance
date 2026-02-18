# Module 10 — Monitoring Post-Déploiement

> **Route** : `/monitoring`
> **Priorité** : Phase 2 (mois 3-6)
> **Dépendances** : Module 01 (systèmes IA), Module 06 (incidents), Module 15 (auth)

## 1. Objectif

Détecter tôt la dérive, les anomalies et les signaux faibles (plaintes, biais, vulnérabilités) sur les systèmes IA en production. Fournir un tableau de bord par système avec indicateurs clés, alertes configurables et création automatique d'incidents quand les seuils sont dépassés.

**Note** : Ce module ne remplace pas un outil MLOps (MLflow, Weights & Biases). Il se positionne comme couche de **gouvernance du monitoring** — les données de métriques peuvent être importées manuellement ou via API.

## 2. User Stories

| ID | En tant que... | Je veux... | Afin de... |
|----|---------------|-----------|-----------|
| US-10-01 | Data scientist | configurer les métriques à surveiller pour un système | détecter les dérives |
| US-10-02 | Risk manager | voir un tableau de bord de santé par système | identifier les problèmes rapidement |
| US-10-03 | Admin org | recevoir des alertes quand un seuil est dépassé | intervenir avant l'impact |
| US-10-04 | Compliance officer | voir l'historique du monitoring pour audit | prouver la surveillance continue |
| US-10-05 | Data scientist | importer des métriques via CSV ou API | centraliser les données |
| US-10-06 | Risk manager | voir un tableau de bord global de tous les systèmes | avoir une vue d'ensemble |
| US-10-07 | Membre | soumettre un feedback/signalement sur un système IA | remonter un problème |

## 3. Configuration du monitoring par système

### Métriques configurables
Chaque système IA peut avoir un ensemble de métriques à surveiller :

| Catégorie | Métriques | Type |
|-----------|-----------|------|
| Performance | Accuracy, Precision, Recall, F1-score, AUC, MAE, RMSE | Numérique (0-1 ou absolu) |
| Latence | Temps de réponse moyen, P95, P99 | Millisecondes |
| Volume | Nombre de prédictions/jour, requêtes/heure | Compteur |
| Erreurs | Taux d'erreur, exceptions, timeouts | Pourcentage |
| Drift données | PSI (Population Stability Index), KS test, KL divergence | Score statistique |
| Drift modèle | Dégradation de performance vs. baseline | Pourcentage de déviation |
| Qualité outputs | Taux de réponses invalides, hallucinations (GenAI) | Pourcentage |
| Feedback | Satisfaction utilisateur, taux de plaintes, escalations | Score ou compteur |
| Custom | Métrique personnalisée définie par l'utilisateur | Configurable |

### Configuration d'une métrique
- **Nom** (texte)
- **Catégorie** (select)
- **Unité** (texte — ex: "%", "ms", "score")
- **Seuil d'alerte warning** (nombre)
- **Seuil d'alerte critical** (nombre)
- **Direction** (select) : `higher_is_better`, `lower_is_better`, `target_range`
- **Valeur cible** (nombre, optionnel)
- **Plage acceptable** (min-max, optionnel)
- **Fréquence de collecte** (select) : `realtime`, `hourly`, `daily`, `weekly`, `monthly`, `on_demand`
- **Source** (select) : `manual_input`, `csv_import`, `api_webhook`, `scheduled_report`

## 4. Collecte de données

### Saisie manuelle
- Formulaire : sélectionner système + métrique + date + valeur
- Import en masse possible

### Import CSV
- Format attendu : `date, metric_name, value`
- Validation et preview avant import
- Historique des imports

### API / Webhook
- Endpoint : `POST /api/v1/monitoring/{ai_system_id}/metrics`
- Payload : `{ "metric": "accuracy", "value": 0.92, "timestamp": "2026-02-17T10:00:00Z" }`
- Authentification par API key (par organisation)
- Webhook : possibilité de configurer un webhook entrant pour recevoir des données automatiquement

## 5. Tableau de bord par système

### Layout
- Header : nom du système, statut global (healthy / warning / critical), dernière mise à jour
- Grille de cards par métrique configurée :
  - Valeur actuelle (gros chiffre)
  - Tendance (flèche haut/bas + %)
  - Sparkline (mini graphique 30 derniers jours)
  - Badge couleur : vert (OK), jaune (warning), rouge (critical), gris (pas de données)
- Graphiques détaillés (cliquables) : courbe temporelle avec zones de seuils

### Indicateurs dérivés
- **Score de santé global** (0-100) : moyenne pondérée de toutes les métriques vs. seuils
- **Jours depuis dernière alerte**
- **Nombre d'alertes actives**
- **Prochaine revue planifiée**

## 6. Tableau de bord global

Vue de tous les systèmes en production avec :
- Table : nom du système, score de santé, alertes actives, dernière mise à jour
- Heatmap : santé par système × temps (dernières 12 semaines)
- Top 5 systèmes les plus problématiques
- Systèmes sans données de monitoring (signal d'alerte)

## 7. Alertes

### Types d'alertes
| Type | Trigger | Sévérité |
|------|---------|----------|
| Seuil warning dépassé | Valeur < ou > seuil warning | `warning` |
| Seuil critical dépassé | Valeur < ou > seuil critical | `critical` |
| Pas de données | Aucune donnée depuis > fréquence × 2 | `warning` |
| Tendance négative | 3 mesures consécutives en dégradation | `info` |
| Drift détecté | PSI > 0.2 ou KS p-value < 0.05 | `warning` ou `critical` |

### Actions sur alerte
- Notification in-app + email (selon configuration)
- Création automatique d'incident (Module 06) si sévérité = `critical`
- Création de finding de biais (Module 05) si la métrique concerne l'équité
- Log dans l'audit trail

### Configuration des notifications
Par système et par métrique, choisir :
- Qui reçoit les alertes (rôles ou personnes spécifiques)
- Canaux : in-app, email, ou les deux
- Fréquence de rappel si non acquittée : jamais, toutes les 4h, toutes les 24h

### Gestion des alertes
- **Acquitter** : l'alerte est reconnue, le responsable la prend en charge
- **Résoudre** : le problème est corrigé, l'alerte est fermée
- **Muter** : désactiver temporairement une alerte (avec date de fin obligatoire et justification)

## 8. Feedback utilisateur

Canal de remontée pour les utilisateurs finaux des systèmes IA :

### Formulaire de feedback
- Système IA concerné (select ou auto-détecté)
- Type : `positive`, `negative`, `bug`, `suggestion`, `concern`
- Description (textarea)
- Anonyme possible (toggle)
- Pièces jointes (captures d'écran)

### Traitement
- Les feedbacks négatifs/concerns sont agrégés comme signal de monitoring
- Si > X feedbacks négatifs en Y jours → alerte automatique
- Lien possible avec le module incidents (US-06-01)

## 9. Règles métier

1. Tout système en `production` devrait avoir au moins 1 métrique configurée (alerte si aucune)
2. Une alerte `critical` non acquittée sous 24h génère une escalade automatique
3. Le muting d'une alerte est limité à 30 jours et nécessite une justification
4. Les données de monitoring sont conservées minimum 2 ans
5. L'API de collecte est authentifiée par API key (créée par l'org_admin)
6. Les feedbacks anonymes ne stockent aucune information identifiable

## 10. Composants UI

| Composant | Usage |
|-----------|-------|
| `MonitoringDashboard` | Dashboard global tous systèmes |
| `SystemHealthCard` | Card de santé d'un système |
| `MetricCard` | Card d'une métrique avec sparkline |
| `MetricChart` | Graphique détaillé d'une métrique (Recharts) |
| `AlertList` | Liste des alertes avec actions |
| `AlertConfigForm` | Configuration des seuils et notifications |
| `MetricImporter` | Import CSV + preview |
| `FeedbackForm` | Formulaire de feedback utilisateur |
| `HealthHeatmap` | Heatmap santé × temps |
| `MetricConfigPanel` | Configuration des métriques par système |

## 11. Relations

| Module | Relation |
|--------|----------|
| 01 - Systèmes IA | FK `ai_system_id` pour chaque config de monitoring |
| 05 - Biais | Alerte fairness → création de bias finding |
| 06 - Incidents | Alerte critical → création automatique d'incident |
| 08 - Cycle de vie | Post-changement → vérifier les métriques |
| 09 - Documentation | Plan de monitoring = document exportable |
