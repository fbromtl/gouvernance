# gouvernance.ai — Architecture Globale & Conventions

## Projet
- **Nom** : gouvernance.ai
- **Type** : Plateforme SaaS de gouvernance de l'IA
- **Domaine** : gouvernance.ai

## Stack Technique
- **Frontend** : React (Vite + TypeScript) + Tailwind CSS + shadcn/ui (Radix primitives)
- **Backend** : Supabase (PostgreSQL, Auth, Storage, Edge Functions, Realtime)
- **Déploiement** : Netlify (static hosting + serverless functions si nécessaire)
- **i18n** : i18next (fr/en minimum, extensible)
- **Authentification** : Supabase Auth (SSO SAML 2.0, MFA, magic link)

## Conventions de nommage

### Base de données (Supabase/PostgreSQL)
- Tables : `snake_case` au pluriel → `ai_systems`, `risk_assessments`
- Colonnes : `snake_case` → `created_at`, `risk_level`
- Clés primaires : `id` (UUID v4, auto-généré)
- Clés étrangères : `{table_singulier}_id` → `ai_system_id`
- Timestamps : `created_at`, `updated_at` (auto), `deleted_at` (soft delete)
- Multi-tenant : colonne `organization_id` sur chaque table

### Frontend (React/TypeScript)
- Composants : `PascalCase` → `RiskAssessmentForm.tsx`
- Hooks : `camelCase` avec préfixe `use` → `useAiSystems.ts`
- Pages/Routes : `kebab-case` → `/ai-systems`, `/risk-assessments`
- Types/Interfaces : `PascalCase` avec suffixe → `AiSystemRow`, `RiskLevel`
- Fichiers de config : `camelCase` → `supabaseClient.ts`

### API (Supabase)
- RPC functions : `snake_case` → `calculate_risk_score`
- Policies RLS : `{action}_{table}_{role}` → `select_ai_systems_member`
- Storage buckets : `kebab-case` → `evidence-files`, `audit-exports`

## Modèle de données global

### Entités principales (15 modules)
```
Organization (tenant)
├── User (membre, via Supabase Auth)
├── AiSystem (Module 01 - registre central)
│   ├── RiskAssessment (Module 03)
│   ├── Decision (Module 04)
│   ├── BiasFinding (Module 05)
│   ├── Incident (Module 06)
│   ├── TransparencyRecord (Module 07)
│   ├── LifecycleEvent (Module 08)
│   ├── Document (Module 09)
│   ├── MonitoringAlert (Module 10)
│   ├── DataInventory (Module 11)
│   └── VendorLink (Module 12)
├── GovernanceRole (Module 02)
├── Policy (Module 02)
├── ComplianceMapping (Module 13)
├── DashboardConfig (Module 14)
└── AuditLog (Module 15 - transversal)
```

### Colonnes communes à toutes les tables
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
organization_id UUID NOT NULL REFERENCES organizations(id),
created_by      UUID REFERENCES auth.users(id),
updated_by      UUID REFERENCES auth.users(id),
created_at      TIMESTAMPTZ DEFAULT now(),
updated_at      TIMESTAMPTZ DEFAULT now(),
deleted_at      TIMESTAMPTZ -- soft delete
```

## Multi-tenant & RLS
- Chaque table porte `organization_id`
- Row Level Security (RLS) activé sur toutes les tables
- Les policies vérifient `organization_id = auth.jwt() -> 'organization_id'`
- Le JWT Supabase contient `organization_id` et `role` dans les custom claims

## Rôles utilisateurs (RBAC)
| Rôle | Code | Description |
|------|------|-------------|
| Super Admin | `super_admin` | Admin de la plateforme (gouvernance.ai) |
| Admin Organisation | `org_admin` | Administrateur d'un tenant |
| Responsable Conformité | `compliance_officer` | Gestion conformité, audits |
| Responsable Risques | `risk_manager` | Évaluations, registre risques |
| Data Scientist | `data_scientist` | Monitoring, biais, modèles |
| Responsable Éthique | `ethics_officer` | Décisions, transparence |
| Auditeur | `auditor` | Lecture seule, exports |
| Membre | `member` | Accès de base, consultation |

## Navigation principale (sidebar)
```
📊 Tableau de bord          → /dashboard          (Module 14)
🤖 Systèmes IA             → /ai-systems         (Module 01)
👥 Gouvernance              → /governance         (Module 02)
⚠️  Risques                  → /risks              (Module 03)
📋 Décisions                → /decisions          (Module 04)
⚖️  Biais & Équité           → /bias               (Module 05)
🚨 Incidents                → /incidents          (Module 06)
🔍 Transparence             → /transparency       (Module 07)
🔄 Cycle de vie             → /lifecycle          (Module 08)
📄 Documentation            → /documents          (Module 09)
📈 Monitoring               → /monitoring         (Module 10)
🗄️  Données & EFVP           → /data               (Module 11)
🏢 Tiers & Fournisseurs     → /vendors            (Module 12)
✅ Conformité               → /compliance         (Module 13)
⚙️  Administration           → /admin              (Module 15)
```

## i18n
- Langues : `fr` (défaut), `en`
- Fichiers : `src/locales/{lang}/{module}.json`
- Convention clés : `module.section.label` → `aiSystems.form.name`
- Dates : format localisé via `date-fns/locale`

## États & workflows communs
Beaucoup de modules partagent des patterns de workflow :
- **Statuts génériques** : `draft` → `in_review` → `approved` → `archived`
- **Sévérités** : `critical`, `high`, `medium`, `low`
- **Niveaux de risque** : `prohibited`, `high`, `limited`, `minimal`

## Fichiers de specs par module
- `01-REGISTRE-SYSTEMES-IA.md`
- `02-GOUVERNANCE-RESPONSABILITES.md`
- `03-EVALUATION-RISQUES.md`
- `04-JOURNAL-DECISIONS.md`
- `05-REGISTRE-BIAIS.md`
- `06-REGISTRE-INCIDENTS.md`
- `07-TRANSPARENCE-CONTESTATION.md`
- `08-CYCLE-VIE-CHANGEMENTS.md`
- `09-DOCUMENTATION-EVIDENCE.md`
- `10-MONITORING-POST-DEPLOIEMENT.md`
- `11-GESTION-DONNEES-EFVP.md`
- `12-GESTION-TIERS.md`
- `13-CONFORMITE-MULTI-REFERENTIELS.md`
- `14-TABLEAUX-BORD.md`
- `15-PLATEFORME-SAAS.md`
