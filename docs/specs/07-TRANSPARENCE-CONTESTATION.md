# Module 07 — Transparence, Explications et Contestation

> **Route** : `/transparency`
> **Priorité** : Phase 2 (mois 3-6)
> **Dépendances** : Module 01 (systèmes IA), Module 04 (décisions), Module 15 (auth)

## 1. Objectif

Outiller l'organisation pour respecter les obligations d'information envers les personnes touchées par des décisions automatisées (Loi 25, RGPD Art. 22, EU AI Act Art. 13-14) et offrir un mécanisme de révision humaine quand une personne est visée par une décision fondée exclusivement sur un traitement automatisé.

## 2. User Stories

| ID | En tant que... | Je veux... | Afin de... |
|----|---------------|-----------|-----------|
| US-07-01 | Compliance officer | créer un registre des décisions automatisées par système | documenter quelles décisions sont automatisées |
| US-07-02 | Compliance officer | configurer des templates d'avis de transparence | informer les personnes en langage simple |
| US-07-03 | Admin org | mettre en place un workflow de contestation | permettre aux personnes de contester une décision |
| US-07-04 | Membre (employé habilité) | traiter une demande de contestation | réviser la décision avec intervention humaine |
| US-07-05 | Auditeur | consulter le registre des contestations traitées | prouver que le mécanisme existe et fonctionne |
| US-07-06 | Compliance officer | générer des preuves de transparence | démontrer la conformité Loi 25 |

## 3. Registre des décisions automatisées

### Par système IA, documenter :
- **Système IA** (FK `ai_systems`)
- **Type de décision** (texte) : ex. "Scoring de crédit", "Tri de CV", "Recommandation de prix"
- **Niveau d'automatisation** (select) :
  - `fully_automated` — Entièrement automatisée (sans intervention humaine)
  - `semi_automated` — Semi-automatisée (humain valide)
  - `assisted` — Assistée (IA recommande, humain décide)
- **Personnes touchées** (multi-select) : employés, clients, prospects, candidats, locataires, etc.
- **Impact de la décision** (select) : `high` (accès refusé/accordé, emploi, crédit), `medium` (recommandation influente), `low` (suggestion sans conséquence)
- **Canal d'information** (comment les personnes sont informées) : email, notification app, courrier, affichage, politique de confidentialité
- **Droit d'explication activé** (toggle) : si oui → les personnes peuvent demander une explication
- **Mécanisme de contestation activé** (toggle) : si oui → workflow de contestation disponible
- **Base légale** (select) : consentement, intérêt légitime, obligation légale, contrat
- **Statut** : `active`, `suspended`, `decommissioned`

## 4. Templates d'avis de transparence

Templates personnalisables en langage simple, conformes Loi 25 et EU AI Act.

### Template standard (Loi 25)
```
[Nom de l'organisation] utilise un système d'intelligence artificielle
pour [description de la décision en langage simple].

Ce système analyse [types de données utilisées] afin de [objectif].

Vous avez le droit :
• De savoir que cette décision a été prise par un système automatisé
• D'obtenir une explication des raisons de la décision
• De soumettre vos observations à un employé habilité
• De demander la révision de la décision par une personne

Pour exercer ces droits, contactez : [coordonnées du responsable]
```

### Champs du template
- Titre du template
- Contenu (rich text avec variables dynamiques : `{organization_name}`, `{system_name}`, `{decision_type}`, `{contact_info}`)
- Langue : `fr`, `en`
- Version
- Système IA associé
- Statut : `draft`, `published`

## 5. Workflow de contestation

### Étapes
```
received → assigned → under_review → decision_revised / decision_maintained → notified → closed
```

### Structure d'une demande de contestation
- **Numéro de dossier** (auto-généré : CONT-YYYY-NNNN)
- **Système IA concerné** (FK)
- **Demandeur** : nom, prénom, email, téléphone (champs libres — pas forcément un utilisateur de la plateforme)
- **Date de réception** (date)
- **Canal de réception** (select) : email, formulaire web, courrier, téléphone, en personne
- **Description de la décision contestée** (textarea)
- **Motif de contestation** (textarea)
- **Observations du demandeur** (textarea + pièces jointes)
- **Assigné à** (select — employé habilité)
- **Statut** (select — workflow ci-dessus)

### Traitement par l'employé habilité
- **Analyse** (rich text) : examen du cas, vérification des données, consultation du modèle
- **Décision révisée** (radio) : `maintained` (maintenue) ou `revised` (révisée)
- **Justification** (rich text, requis)
- **Nouvelle décision** (si révisée) : description
- **Date de la décision**
- **Communication au demandeur** : template de réponse pré-rempli

### SLA
| Étape | Délai maximum |
|-------|--------------|
| Accusé de réception | 48 heures |
| Assignation | 5 jours ouvrables |
| Décision | 30 jours ouvrables |
| Notification au demandeur | 5 jours après décision |

## 6. Centre de preuves

Espace dédié pour démontrer que les mécanismes de transparence et de contestation existent et fonctionnent :

- Nombre total de décisions automatisées actives
- Nombre d'avis de transparence publiés
- Nombre de contestations reçues / traitées / en cours
- Délai moyen de traitement
- Taux de décisions révisées vs. maintenues
- Export PDF "Rapport de transparence" (pour audit ou CA)

## 7. Règles métier

1. Tout système avec `level_automation = fully_automated` et `impact = high` DOIT avoir un mécanisme de contestation activé (Loi 25)
2. Les templates d'avis doivent exister en français au minimum (Loi 25 — Québec)
3. Les demandes de contestation ne peuvent pas être supprimées
4. L'employé habilité ne peut pas être la même personne qui a conçu/développé le système IA
5. Chaque contestation traitée génère automatiquement une entrée dans l'audit log
6. Le délai SLA est calculé en jours ouvrables (lundi-vendredi)

## 8. Composants UI

| Composant | Usage |
|-----------|-------|
| `AutomatedDecisionRegistry` | Table des décisions automatisées par système |
| `TransparencyTemplateEditor` | Éditeur de templates avec variables |
| `ContestationInbox` | Boîte de réception des contestations |
| `ContestationDetailPage` | Page de traitement d'une contestation |
| `ContestationWorkflow` | Stepper visuel du workflow |
| `TransparencyProofPanel` | Dashboard de preuves avec métriques |
| `ResponseTemplateGenerator` | Génération de la réponse au demandeur |

## 9. Relations

| Module | Relation |
|--------|----------|
| 01 - Systèmes IA | FK `ai_system_id` sur les registres et contestations |
| 04 - Décisions | Contestation peut générer une nouvelle décision |
| 06 - Incidents | Contestation massive = signal d'incident potentiel |
| 09 - Documentation | Templates et rapports = documents de preuve |
| 13 - Conformité | Transparence = contrôle de conformité Loi 25 & EU AI Act |
