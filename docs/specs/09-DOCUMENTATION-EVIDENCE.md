# Module 09 — Documentation & Evidence Pack

> **Route** : `/documents`
> **Priorité** : Phase 2 (mois 3-6)
> **Dépendances** : Module 01 (systèmes IA), tous les autres modules (ils alimentent la documentation)

## 1. Objectif

Produire en un clic un dossier complet pour audit interne, comité, client ou régulateur. Centraliser toute la documentation de gouvernance et générer automatiquement les documents réglementaires requis (model cards, documentation technique EU AI Act, rapports de conformité).

## 2. User Stories

| ID | En tant que... | Je veux... | Afin de... |
|----|---------------|-----------|-----------|
| US-09-01 | Compliance officer | générer un "evidence pack" complet pour un système IA | répondre à un audit en 1 clic |
| US-09-02 | Admin org | générer une AI System Card (model card simplifiée) | documenter un système de manière standardisée |
| US-09-03 | Auditeur | consulter et télécharger la documentation d'un système | vérifier la conformité |
| US-09-04 | Compliance officer | générer la documentation technique EU AI Act (Annexe IV) | me conformer si applicable |
| US-09-05 | Admin org | centraliser tous les documents liés à un système | avoir un dossier unique |
| US-09-06 | Risk manager | générer un rapport synthétique des risques | présenter au CA |

## 3. Types de documents

### Documents auto-générés
| Type | Code | Source | Contenu |
|------|------|--------|---------|
| AI System Card | `system_card` | Module 01 + 03 + 05 | Fiche synthétique : description, risques, biais, limitations, cas d'usage |
| Plan de monitoring | `monitoring_plan` | Module 10 | Métriques surveillées, seuils, fréquences, alertes |
| Résumé des risques | `risk_summary` | Module 03 | Score, niveau, exigences, risques résiduels |
| Registre décisions | `decisions_report` | Module 04 | Historique des décisions pour un système |
| Registre incidents | `incidents_report` | Module 06 | Historique des incidents pour un système |
| Registre biais | `bias_report` | Module 05 | Findings, remédiations, tendances |
| Documentation technique EU AI Act | `eu_ai_act_annex_iv` | Tous | Conforme Annexe IV EU AI Act |
| Rapport de conformité | `compliance_report` | Module 13 | Statut par référentiel |
| Rapport FRIA | `fria_report` | Module 03 | Évaluation droits fondamentaux |
| Rapport EFVP | `efvp_report` | Module 11 | Évaluation vie privée |

### Documents uploadés manuellement
- Contrats fournisseurs
- Rapports de tests externes
- Politiques signées
- PV de comités
- Certificats (ISO, SOC)
- Tout autre fichier pertinent

## 4. AI System Card (template)

Document auto-généré à partir des données de la plateforme :

### Sections de la System Card
1. **Identification** : nom, type, version, fournisseur, département
2. **Objectif et cas d'usage** : finalité, population touchée, niveau d'autonomie
3. **Données** : types de données, sources, localisation, données personnelles
4. **Performance** : métriques clés (si disponibles via monitoring)
5. **Risques et limitations** :
   - Niveau de risque (score + classification)
   - Risques identifiés et mitigations
   - Limitations connues
   - Cas d'usage NON prévus
6. **Équité et biais** :
   - Tests réalisés et résultats
   - Biais détectés et remédiations
   - Dimensions protégées testées
7. **Transparence** : niveau d'explicabilité, mécanisme d'information
8. **Supervision humaine** : niveau d'automatisation, mécanismes de contrôle
9. **Gouvernance** : propriétaires, date de dernière revue, fréquence
10. **Historique** : versions, changements substantiels, incidents

## 5. Documentation technique EU AI Act (Annexe IV)

Pour les systèmes classés haut risque, document complet conforme à l'Annexe IV :

### Sections obligatoires
1. Description générale du système IA
2. Description des éléments du système et de son processus de développement
3. Informations sur le monitoring, le fonctionnement et le contrôle du système
4. Description des capacités et des limites de performance
5. Description des mesures de cybersécurité
6. Description du système de gestion de la qualité
7. Description détaillée du processus d'évaluation et de test
8. Description des modifications substantielles apportées

Chaque section est pré-remplie à partir des données de la plateforme avec possibilité de compléter manuellement.

## 6. Evidence Pack (génération)

### Contenu d'un evidence pack
Un ZIP contenant :
```
evidence-pack-{system_name}-{date}/
├── 00-sommaire.pdf
├── 01-system-card.pdf
├── 02-risk-assessment.pdf
├── 03-bias-findings.pdf
├── 04-decisions-log.pdf
├── 05-incidents-log.pdf
├── 06-monitoring-plan.pdf
├── 07-compliance-status.pdf
├── 08-efvp.pdf (si applicable)
├── 09-fria.pdf (si applicable)
├── attachments/
│   ├── contrat-fournisseur.pdf
│   ├── rapport-tests-biais.csv
│   └── ...
└── manifest.json (liste des fichiers + hash SHA-256 de chaque)
```

### Sommaire auto-généré
- Date de génération
- Système IA couvert
- Organisation
- Liste des documents inclus avec statut (complet / partiel / manquant)
- Hash d'intégrité global (SHA-256 du manifest)
- Avertissement : "Ce dossier a été généré automatiquement par gouvernance.ai"

### Options de génération
- Choix des sections à inclure (par défaut : tout)
- Période couverte (date début → date fin)
- Format : PDF uniquement, ou ZIP complet
- Inclusion des pièces jointes manuelles : oui/non
- Langue : fr / en

## 7. Gestion documentaire

### Bibliothèque de documents
- Vue de tous les documents par système IA
- Filtres : type, date, auteur, système
- Recherche plein texte dans les titres et descriptions
- Tags personnalisables

### Versioning
- Chaque document auto-généré a un numéro de version et un timestamp
- L'historique des versions est conservé
- Comparaison entre versions (dates de génération, changements)

### Stockage
- Supabase Storage (bucket `documents`)
- Structure : `{organization_id}/{ai_system_id}/{document_type}/{filename}`
- Limite : 100 Mo par fichier, 10 Go par organisation (configurable)

## 8. Collaboration

- Workflow d'approbation sur les documents : `draft` → `in_review` → `approved`
- Commentaires sur les documents
- Notifications quand un document nécessite une revue
- Multi-auteurs avec suivi des contributions

## 9. Règles métier

1. Les documents auto-générés sont recréés à chaque demande (contenu à jour)
2. Un evidence pack inclut un hash SHA-256 pour garantir l'intégrité
3. Les documents ne sont jamais supprimés — archivage uniquement
4. Un système haut risque sans documentation technique est signalé comme non conforme
5. Le manifest.json du evidence pack est signé avec timestamp pour prouver la date de génération

## 10. Composants UI

| Composant | Usage |
|-----------|-------|
| `DocumentLibrary` | Bibliothèque avec filtres et recherche |
| `DocumentGenerator` | Interface de génération avec options |
| `SystemCardPreview` | Prévisualisation de la System Card |
| `EvidencePackBuilder` | Sélection des sections + génération ZIP |
| `DocumentViewer` | Prévisualisation inline (PDF) |
| `VersionHistory` | Liste des versions d'un document |
| `ApprovalWorkflow` | Workflow d'approbation |
| `IntegrityVerifier` | Vérification du hash d'intégrité |

## 11. Relations

| Module | Relation |
|--------|----------|
| 01 - Systèmes IA | Documents liés par `ai_system_id` |
| 03 - Risques | Rapports de risque auto-générés |
| 04 - Décisions | Registre décisions exporté |
| 05 - Biais | Registre biais exporté |
| 06 - Incidents | Registre incidents exporté |
| 10 - Monitoring | Plan de monitoring généré |
| 11 - Données | Rapport EFVP généré |
| 13 - Conformité | Rapport de conformité généré |
