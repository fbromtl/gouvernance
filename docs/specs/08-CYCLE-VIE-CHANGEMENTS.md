# Module 08 — Cycle de Vie & Gestion des Changements

> **Route** : `/lifecycle`
> **Priorité** : Phase 2 (mois 3-6)
> **Dépendances** : Module 01 (systèmes IA), Module 03 (risques), Module 04 (décisions)

## 1. Objectif

Éviter les "changements silencieux" (nouveau modèle, nouveau prompt, nouvelles données, nouveaux seuils) sans requalification. Assurer le versioning complet et déclencher automatiquement une réévaluation quand un changement substantiel est détecté.

## 2. User Stories

| ID | En tant que... | Je veux... | Afin de... |
|----|---------------|-----------|-----------|
| US-08-01 | Data scientist | enregistrer un changement sur un système IA | tracer les modifications |
| US-08-02 | Risk manager | être notifié quand un changement est classé "substantiel" | déclencher une réévaluation |
| US-08-03 | Compliance officer | voir l'historique complet des versions d'un système | démontrer la traçabilité |
| US-08-04 | Admin org | configurer les règles de "changement substantiel" | adapter les seuils à mon organisation |
| US-08-05 | Tech owner | suivre une release checklist avant déploiement | ne rien oublier |
| US-08-06 | Admin org | planifier et documenter un décommissionnement | retirer un système proprement |

## 3. Types d'événements de cycle de vie

| Type | Code | Déclencheur typique |
|------|------|-------------------|
| Nouvelle version du modèle | `model_update` | Réentraînement, fine-tuning, changement d'architecture |
| Changement de données | `data_change` | Nouveau dataset, ajout/retrait de features, changement de source |
| Changement de prompt/règles | `prompt_change` | Modification de prompt système, ajustement de règles métier |
| Changement de seuils | `threshold_change` | Modification des seuils de décision, de confiance |
| Changement de fournisseur | `vendor_change` | Migration vers un autre fournisseur/modèle |
| Changement d'infrastructure | `infra_change` | Migration cloud, changement de runtime |
| Extension de périmètre | `scope_extension` | Nouveau département, nouvelle population, nouveau cas d'usage |
| Réduction de périmètre | `scope_reduction` | Retrait d'un cas d'usage |
| Suspension | `suspension` | Arrêt temporaire du système |
| Reprise | `resumption` | Remise en service après suspension |
| Décommissionnement | `decommission` | Retrait définitif |
| Correction de bug | `bugfix` | Correction d'un défaut sans changement fonctionnel |

## 4. Structure d'un événement

- **Système IA** (FK, requis)
- **Type d'événement** (select, requis)
- **Titre / résumé** (texte, requis)
- **Description détaillée** (rich text)
- **Composants modifiés** (multi-select) : `model`, `data`, `prompt`, `config`, `infrastructure`, `api`, `ui`
- **Version précédente** (texte — ex: "v2.1.0", "GPT-4", "prompt-v12")
- **Nouvelle version** (texte)
- **Date du changement** (datetime)
- **Auteur du changement** (select utilisateur)
- **Pièces jointes** (fichiers — diff, changelog, rapport de tests)

### Évaluation du changement
- **Changement substantiel ?** (auto-calculé + override manuel)
- **Impact estimé** (select) : `none`, `low`, `medium`, `high`, `critical`
- **Réévaluation de risque requise ?** (toggle, auto si substantiel)
- **Tests requis avant déploiement** (checklist auto-générée selon niveau de risque)

## 5. Règles de changement substantiel

Un changement est automatiquement classé "substantiel" si au moins une condition est remplie :

| Condition | Types concernés |
|-----------|----------------|
| Changement de modèle ou de fournisseur | `model_update`, `vendor_change` |
| Ajout de données sensibles / personnelles | `data_change` |
| Extension à une nouvelle population vulnérable | `scope_extension` |
| Modification affectant les décisions automatisées | `threshold_change`, `prompt_change` |
| Le système est classé "haut risque" ou "critique" | Tout type |
| Le changement modifie la finalité du système | `scope_extension` |

Ces règles sont **configurables** par l'organisation (page de configuration dans Admin).

### Conséquences d'un changement substantiel
1. Notification automatique au risk manager et compliance officer
2. Réévaluation de risque obligatoire (Module 03) — blocage du déploiement jusqu'à complétion
3. Création automatique d'une entrée dans le journal de décisions (Module 04)
4. Mise à jour de la documentation requise (Module 09)

## 6. Release Checklist

Avant chaque déploiement, une checklist est générée automatiquement selon le niveau de risque du système.

### Checklist système à haut risque
- [ ] Évaluation de risque mise à jour
- [ ] Tests de performance documentés
- [ ] Tests de biais réalisés et passés
- [ ] Tests de sécurité réalisés
- [ ] Revue vie privée / EFVP mise à jour
- [ ] Documentation technique mise à jour
- [ ] Model card mise à jour
- [ ] Approbation du risk manager obtenue
- [ ] Approbation du business owner obtenue
- [ ] Monitoring configuré pour la nouvelle version
- [ ] Plan de rollback documenté
- [ ] Communication aux parties prenantes effectuée

### Checklist système à risque limité
- [ ] Tests de performance documentés
- [ ] Documentation mise à jour
- [ ] Approbation du tech owner obtenue
- [ ] Monitoring vérifié

### Checklist système à risque minimal
- [ ] Tests basiques passés
- [ ] Changelog documenté

Chaque item est cochable avec horodatage et utilisateur.

## 7. Décommissionnement

Workflow spécifique pour le retrait d'un système :

### Étapes
1. **Décision de retrait** → lien Module 04 (décision formelle)
2. **Plan de décommissionnement** :
   - Date cible de retrait
   - Systèmes/processus impactés
   - Plan de communication (qui informer : utilisateurs, clients, partenaires)
   - Plan de migration des données
   - Plan d'archivage (logs, modèle, documentation)
3. **Exécution** :
   - [ ] Utilisateurs notifiés
   - [ ] Accès désactivé
   - [ ] Données migrées ou archivées
   - [ ] Logs exportés et archivés
   - [ ] Documentation finale complétée
4. **Clôture** :
   - Système passé en statut `decommissioned` (Module 01)
   - Fiche système archivée (consultable, non modifiable)
   - Date effective de retrait enregistrée

## 8. Vue timeline

Pour chaque système, une frise chronologique affiche :
- Tous les événements de cycle de vie
- Les évaluations de risque (Module 03)
- Les décisions (Module 04)
- Les incidents (Module 06)
- Code couleur par type d'événement
- Zoom par période (mois, trimestre, année, tout)

## 9. Règles métier

1. Un changement substantiel sur un système en production bloque le déploiement jusqu'à réévaluation
2. La release checklist doit être 100% complétée avant de pouvoir marquer le déploiement comme "effectué"
3. Le décommissionnement nécessite une décision formelle (Module 04)
4. Les événements sont immutables après enregistrement
5. Les règles de changement substantiel sont configurables mais les défauts ne peuvent pas être rendus moins stricts pour les systèmes haut risque

## 10. Composants UI

| Composant | Usage |
|-----------|-------|
| `LifecycleEventForm` | Formulaire d'enregistrement d'un événement |
| `LifecycleTimeline` | Frise chronologique interactive |
| `ReleaseChecklist` | Checklist interactive avec progression |
| `SubstantialChangeBanner` | Bannière d'alerte si changement substantiel |
| `DecommissionWizard` | Wizard de décommissionnement |
| `VersionHistory` | Table de l'historique des versions |
| `ChangeImpactIndicator` | Badge d'impact du changement |

## 11. Relations

| Module | Relation |
|--------|----------|
| 01 - Systèmes IA | FK `ai_system_id`, mise à jour du statut |
| 03 - Risques | Changement substantiel → réévaluation obligatoire |
| 04 - Décisions | Décision de changement / décommissionnement |
| 06 - Incidents | Incident peut déclencher un changement |
| 09 - Documentation | Mise à jour documentaire requise |
| 10 - Monitoring | Configuration monitoring post-changement |
