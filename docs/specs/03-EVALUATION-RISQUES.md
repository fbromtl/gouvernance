# Module 03 — Évaluation de Risque & Classification

> **Route** : `/risks`
> **Priorité** : MVP (Phase 1)
> **Dépendances** : Module 01 (systèmes IA), Module 15 (auth)

## 1. Objectif

Permettre à un utilisateur non technique de qualifier un système IA selon son niveau de risque et d'appliquer des exigences proportionnées. Approche "risk-based" alignée sur l'EU AI Act, le NIST AI RMF et la Loi 25.

## 2. User Stories

| ID | En tant que... | Je veux... | Afin de... |
|----|---------------|-----------|-----------|
| US-03-01 | Risk manager | lancer une évaluation de risque pour un système IA | qualifier son niveau de risque |
| US-03-02 | Compliance officer | utiliser un questionnaire guidé (5-10 min) | obtenir un score sans expertise technique |
| US-03-03 | Risk manager | voir le résultat avec un niveau et des exigences automatiques | savoir quelles actions entreprendre |
| US-03-04 | Admin org | consulter la matrice de risques de tous les systèmes | avoir une vue d'ensemble des risques |
| US-03-05 | Compliance officer | réaliser une FRIA (Fundamental Rights Impact Assessment) | me conformer à l'EU AI Act Art. 27 |
| US-03-06 | Risk manager | réévaluer périodiquement un système | détecter les changements de profil de risque |
| US-03-07 | Auditeur | exporter les évaluations complètes | fournir les preuves d'audit |
| US-03-08 | Admin org | comparer les évaluations dans le temps | suivre l'évolution du risque |

## 3. Questionnaire d'évaluation guidé

Le questionnaire comporte 6 sections avec des questions en langage simple. Chaque réponse est pondérée pour calculer un score final.

### Section A — Impact sur les personnes (max 25 pts)
- Q1 : Le système prend-il des décisions qui affectent directement des personnes ? (`oui_direct` +15 / `oui_indirect` +8 / `non` +0)
- Q2 : Les personnes peuvent-elles se soustraire au système (opt-out) ? (`non` +10 / `difficilement` +5 / `oui` +0)
- Q3 : Le système touche-t-il des personnes vulnérables (mineurs, personnes âgées, personnes en situation de handicap) ? (`oui` +10 / `possiblement` +5 / `non` +0)
- Q4 : Quels droits fondamentaux sont potentiellement affectés ? (multi-select : `privacy` +5, `non_discrimination` +8, `employment` +8, `freedom_expression` +5, `dignity` +10, `access_services` +5, `none` +0)

### Section B — Classification EU AI Act (max 20 pts)
- Q5 : Le système entre-t-il dans une catégorie de risque interdit (Art. 5) ? (notation sociale, manipulation subliminale, exploitation de vulnérabilités, identification biométrique temps réel) (`oui` → classification automatique `prohibited` / `non` +0)
- Q6 : Le système opère-t-il dans un domaine à haut risque (Annexe III) ? (multi-select parmi les 8 domaines : emploi, crédit, justice, éducation, infra critique, migration, loi, biométrie) (≥1 coché → `high` +20 / 0 coché → +0)
- Q7 : Le système est-il un chatbot, génère-t-il des deepfakes ou des contenus synthétiques ? (`oui` → min `limited` +10 / `non` +0)

### Section C — Données et vie privée (max 20 pts)
- Q8 : Le système utilise-t-il des renseignements personnels ? (`oui_sensibles` +20 / `oui_standards` +10 / `non` +0)
- Q9 : Les données sont-elles transférées hors Québec/Canada ? (`oui_hors_canada` +10 / `oui_canada_hors_qc` +5 / `non` +0)
- Q10 : Une EFVP a-t-elle déjà été réalisée ? (`non_requis` +10 / `en_cours` +5 / `oui` +0)

### Section D — Biais et discrimination (max 15 pts)
- Q11 : Le système traite-t-il des catégories de personnes différemment ? (`oui` +10 / `possiblement` +5 / `non` +0)
- Q12 : Des tests de biais ont-ils été réalisés ? (`non` +10 / `partiellement` +5 / `oui` +0)
- Q13 : Le système a-t-il fait l'objet de plaintes ou signalements liés à la discrimination ? (`oui` +15 / `non` +0)

### Section E — Transparence et explicabilité (max 10 pts)
- Q14 : Le fonctionnement du système peut-il être expliqué aux personnes touchées ? (`non` +10 / `partiellement` +5 / `oui` +0)
- Q15 : Les personnes sont-elles informées qu'elles interagissent avec un système IA ? (`non` +5 / `oui` +0)

### Section F — Supervision humaine (max 10 pts)
- Q16 : Un humain valide-t-il les décisions du système avant exécution ? (`jamais` +10 / `parfois` +5 / `toujours` +0)
- Q17 : Existe-t-il un mécanisme d'arrêt d'urgence ? (`non` +5 / `oui` +0)

## 4. Calcul du score et classification

### Score total : somme des points (max théorique ~100+)
Le score est plafonné à 100. Si Q5 = oui → classification `prohibited` automatique.

### Matrice de classification

| Score | Niveau EU AI Act | Niveau interne | Couleur | Exigences déclenchées |
|-------|-----------------|----------------|---------|----------------------|
| Prohibited | Interdit (Art.5) | Interdit | Noir | Arrêt immédiat, notification direction |
| 76-100 | Haut risque | Critique | Rouge | Éval complète, FRIA, approbation direction, monitoring continu, audit annuel |
| 51-75 | Haut risque | Élevé | Orange | Éval complète, plan de mitigation, revue semestrielle |
| 26-50 | Risque limité | Modéré | Jaune | Documentation, transparence, revue annuelle |
| 0-25 | Risque minimal | Faible | Vert | Documentation de base, revue biennale |

### Exigences automatiques par niveau

Quand une évaluation est complétée, le système génère automatiquement une checklist d'exigences :

#### Niveau Critique (76-100)
- [ ] Évaluation d'impact sur les droits fondamentaux (FRIA)
- [ ] EFVP obligatoire
- [ ] Approbation formelle du sponsor exécutif
- [ ] Plan de monitoring continu défini
- [ ] Tests de biais documentés
- [ ] Revue juridique complétée
- [ ] Documentation technique complète (Art. 11 EU AI Act)
- [ ] Mécanisme de supervision humaine en place
- [ ] Plan de réponse aux incidents
- [ ] Audit externe planifié

#### Niveau Élevé (51-75)
- [ ] Évaluation de risque détaillée
- [ ] EFVP recommandée
- [ ] Approbation du responsable IA
- [ ] Tests de biais réalisés
- [ ] Documentation du système à jour
- [ ] Mécanisme de supervision humaine défini
- [ ] Plan de monitoring défini

#### Niveau Modéré (26-50)
- [ ] Documentation de base complète
- [ ] Notification transparence aux utilisateurs
- [ ] Revue annuelle planifiée

#### Niveau Faible (0-25)
- [ ] Fiche système complétée dans le registre
- [ ] Prochaine revue planifiée

## 5. Matrice de risques (vue globale)

### Heatmap
- Axe X : Probabilité (`rare`, `unlikely`, `possible`, `likely`, `almost_certain`)
- Axe Y : Impact (`negligible`, `minor`, `moderate`, `major`, `catastrophic`)
- Chaque système IA est positionné sur la matrice
- Couleurs : vert → jaune → orange → rouge
- Clic sur une cellule → liste des systèmes dans cette zone

### Vue liste
- Tous les systèmes avec leur score de risque, niveau, date de dernière évaluation
- Tri par score décroissant (risques les plus élevés en premier)
- Filtre : niveau, département, date d'évaluation

## 6. Historique et réévaluation

- Chaque évaluation est horodatée et immutable (snapshot)
- Graphique d'évolution du score dans le temps par système
- Réévaluation déclenchée :
  - Manuellement par le risk manager
  - Automatiquement si un "changement substantiel" est signalé (Module 08)
  - À l'échéance de la fréquence de revue
- Comparaison côte à côte de deux évaluations (diff des réponses)

## 7. FRIA — Évaluation d'impact sur les droits fondamentaux

Questionnaire spécifique pour les systèmes à haut risque, conforme à l'Art. 27 EU AI Act.

### Sections FRIA
1. Description du système et de son contexte de déploiement
2. Processus dans lesquels le système sera utilisé
3. Catégories de personnes physiques et groupes affectés
4. Risques spécifiques pour les droits fondamentaux (par droit : vie privée, non-discrimination, liberté d'expression, dignité, etc.)
5. Mesures de surveillance humaine
6. Mesures de mitigation prévues
7. Mécanismes de recours pour les personnes affectées
8. Plan de réévaluation périodique

### Sortie
- Document FRIA exportable en PDF
- Statut : `draft` → `in_review` → `approved`
- Lien vers le système IA évalué

## 8. Règles métier

1. Un système en `production` classé `high` ou `critical` DOIT avoir une évaluation de risque complétée
2. Un système classé `prohibited` déclenche une alerte immédiate à l'admin org et au sponsor
3. L'évaluation ne peut être "approuvée" que par un `risk_manager` ou `org_admin`
4. La réévaluation est obligatoire après tout changement substantiel (Module 08)
5. Le score de risque du Module 01 est mis à jour automatiquement après chaque évaluation

## 9. Composants UI

| Composant | Usage |
|-----------|-------|
| `RiskAssessmentWizard` | Questionnaire guidé 6 sections |
| `RiskScoreResult` | Affichage du score + niveau + exigences |
| `RiskHeatmap` | Matrice probabilité × impact |
| `RiskTrendChart` | Graphique d'évolution temporelle (Recharts) |
| `RequirementsChecklist` | Checklist auto-générée par niveau |
| `FriaForm` | Formulaire FRIA multi-sections |
| `EvaluationComparison` | Diff côte à côte de 2 évaluations |

## 10. Relations

| Module | Relation |
|--------|----------|
| 01 - Systèmes IA | FK `ai_system_id` — évaluation liée à un système |
| 04 - Décisions | Décision go/no-go basée sur l'évaluation |
| 05 - Biais | Findings de biais alimentent la réévaluation |
| 06 - Incidents | Incidents peuvent déclencher une réévaluation |
| 08 - Cycle de vie | Changement substantiel → réévaluation |
| 11 - Données | EFVP liée à l'évaluation de risque |
| 13 - Conformité | Score de risque = input pour la conformité EU AI Act |
