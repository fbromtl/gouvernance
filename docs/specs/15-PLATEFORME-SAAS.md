# Module 15 — Plateforme SaaS Transversale

> **Route** : `/admin`
> **Priorité** : MVP (Phase 1) — fondation de toute la plateforme
> **Dépendances** : Aucune (c'est la base)

## 1. Objectif

Fournir les capacités transversales indispensables : authentification, RBAC, multi-tenant, audit trail, notifications, API, et administration. Ce module est la fondation technique sur laquelle tous les autres modules s'appuient.

## 2. Sous-modules

### 2A. Authentification & gestion des utilisateurs

#### Supabase Auth
- **Email + mot de passe** (avec règles de complexité)
- **Magic link** (email sans mot de passe)
- **SSO SAML 2.0** (pour les clients Enterprise — Azure AD, Okta, Google Workspace)
- **OIDC** (OpenID Connect)
- **MFA** (TOTP — Google Authenticator, Authy)

#### Inscription & onboarding
1. Inscription de l'organisation :
   - Nom de l'organisation
   - Secteur d'activité (select)
   - Taille (select) : `1-50`, `51-200`, `201-1000`, `1001-5000`, `5000+`
   - Pays / Province
   - Plan choisi (si applicable)
2. Création du premier utilisateur (admin org)
3. Wizard d'onboarding :
   - Configuration des référentiels applicables (Loi 25, EU AI Act, etc.)
   - Invitation des premiers membres
   - Enregistrement du premier système IA (Module 01)

#### Gestion des utilisateurs
- Inviter un utilisateur par email
- Assigner un rôle (RBAC)
- Désactiver / réactiver un utilisateur
- Voir la dernière connexion
- Historique des actions (lien audit trail)

### 2B. RBAC — Contrôle d'accès par rôle

#### Rôles et permissions

| Permission | super_admin | org_admin | compliance_officer | risk_manager | data_scientist | ethics_officer | auditor | member |
|-----------|:-----------:|:---------:|:------------------:|:------------:|:--------------:|:--------------:|:-------:|:------:|
| Gérer l'organisation | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Gérer les utilisateurs | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Créer un système IA | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Modifier un système IA | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Consulter les systèmes | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Évaluer les risques | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Gérer les incidents | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Signaler un incident | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Gérer les biais | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Approuver les décisions | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Gérer la conformité | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Exporter les données | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Consulter l'audit trail | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Configurer le monitoring | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Gérer les politiques | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Gérer les fournisseurs | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

#### Implémentation
- Les rôles sont stockés dans `user_roles` (user_id, organization_id, role)
- Le rôle est ajouté comme custom claim dans le JWT Supabase
- Les RLS policies utilisent `auth.jwt() ->> 'role'` pour filtrer
- Un utilisateur peut avoir un seul rôle par organisation

### 2C. Multi-tenant

#### Architecture
- Colonne `organization_id` (UUID) sur toutes les tables
- RLS activé sur toutes les tables
- Isolation stricte : un utilisateur ne voit jamais les données d'une autre organisation
- Le `organization_id` est injecté dans le JWT via un trigger Supabase

#### Table `organizations`
- `id` (UUID PK)
- `name` (texte)
- `slug` (texte unique — pour URL si nécessaire)
- `sector` (select)
- `size` (select)
- `country` (texte)
- `province` (texte)
- `logo_url` (texte — Supabase Storage)
- `settings` (JSONB) :
  - `enabled_frameworks` : ["loi_25", "eu_ai_act", "nist_ai_rmf", "iso_42001", "rgpd"]
  - `default_language` : "fr"
  - `review_frequency_default` : "semi_annual"
  - `substantial_change_rules` : {...} (override des règles par défaut)
  - `notification_preferences` : {...}
- `plan` (select) : `starter`, `pro`, `enterprise`
- `created_at`, `updated_at`

### 2D. Audit Trail (piste d'audit globale)

#### Chaque action traçable génère un enregistrement :
- `id` (UUID)
- `organization_id` (FK)
- `user_id` (FK)
- `action` (enum) : `create`, `update`, `delete`, `view`, `export`, `approve`, `reject`, `submit`, `login`, `logout`
- `resource_type` (texte) : `ai_system`, `risk_assessment`, `incident`, `decision`, etc.
- `resource_id` (UUID)
- `changes` (JSONB) : `{ "field": "status", "old": "draft", "new": "published" }`
- `ip_address` (texte)
- `user_agent` (texte)
- `created_at` (timestamp)

#### Fonctionnalités
- Recherche plein texte
- Filtres : utilisateur, action, resource_type, période
- Export CSV
- Rétention : illimitée (ou configurable par plan)
- Les enregistrements d'audit ne sont JAMAIS modifiables ni supprimables

### 2E. Notifications

#### Canaux
- **In-app** : icône cloche dans le header, panneau latéral de notifications
- **Email** : via Supabase Edge Functions + service email (Resend, SendGrid, ou SMTP)

#### Structure d'une notification
- `id`, `organization_id`, `user_id` (destinataire)
- `type` (enum) : `alert`, `reminder`, `approval_request`, `info`, `escalation`
- `title` (texte)
- `body` (texte)
- `link` (URL interne vers la ressource)
- `read` (boolean)
- `email_sent` (boolean)
- `created_at`

#### Préférences utilisateur
Chaque utilisateur peut configurer par type de notification :
- In-app : toujours activé
- Email : oui/non
- Fréquence email : immédiat, digest quotidien, digest hebdomadaire

#### Realtime
- Utiliser **Supabase Realtime** pour les notifications in-app
- Le panneau de notifications se met à jour en temps réel sans refresh

### 2F. Workflows & tâches

#### Workflow engine léger
Pattern réutilisable par tous les modules :
- Définition des états et transitions par type de ressource
- Vérification des permissions par transition
- Notifications automatiques lors des transitions
- SLA par transition (délai max)

#### Tâches
- Liste de tâches assignées à un utilisateur
- Source : workflows (approbation à donner), rappels (revue échue), incidents (assignés)
- Vue "Mes tâches" dans le sidebar
- Compteur de tâches en attente dans le header

### 2G. API REST

#### Endpoints
- API REST auto-générée par Supabase (PostgREST)
- Endpoints additionnels via Supabase Edge Functions pour la logique complexe :
  - `POST /functions/v1/generate-evidence-pack`
  - `POST /functions/v1/calculate-risk-score`
  - `POST /functions/v1/generate-board-report`
  - `POST /functions/v1/monitoring-webhook`

#### Authentification API
- Bearer token (JWT Supabase) pour les utilisateurs
- API Key (par organisation) pour les intégrations machine-to-machine
- Rate limiting : 100 req/min par défaut

#### Documentation
- OpenAPI 3.0 auto-générée
- Page `/api-docs` avec documentation interactive (Swagger UI ou similaire)

### 2H. Stockage fichiers

#### Supabase Storage
- Bucket `evidence-files` : pièces jointes des systèmes, incidents, décisions
- Bucket `documents` : documents générés (evidence packs, rapports)
- Bucket `organization-assets` : logos, templates
- Bucket `exports` : exports CSV/PDF temporaires (TTL 24h)

#### Règles
- Taille max par fichier : 50 Mo
- Types acceptés : PDF, DOCX, XLSX, CSV, PNG, JPG, ZIP
- RLS sur les buckets (organization_id)
- Quotas par plan : Starter 5 Go, Pro 50 Go, Enterprise illimité

### 2I. Internationalisation (i18n)

#### Configuration
- Librairie : `i18next` + `react-i18next`
- Langues : `fr` (défaut), `en`
- Détection automatique de la langue du navigateur
- Sélecteur de langue dans le header
- Stockage de la préférence utilisateur

#### Structure des fichiers
```
src/locales/
├── fr/
│   ├── common.json      (labels génériques)
│   ├── aiSystems.json   (Module 01)
│   ├── governance.json  (Module 02)
│   ├── risks.json       (Module 03)
│   ├── decisions.json   (Module 04)
│   ├── bias.json        (Module 05)
│   ├── incidents.json   (Module 06)
│   ├── transparency.json (Module 07)
│   ├── lifecycle.json   (Module 08)
│   ├── documents.json   (Module 09)
│   ├── monitoring.json  (Module 10)
│   ├── data.json        (Module 11)
│   ├── vendors.json     (Module 12)
│   ├── compliance.json  (Module 13)
│   ├── dashboard.json   (Module 14)
│   └── admin.json       (Module 15)
└── en/
    └── (même structure)
```

#### Convention de clés
- `{module}.{section}.{label}` → `aiSystems.wizard.step1Title`
- Pluralisation : `_one`, `_other` → `incidents.count_one`, `incidents.count_other`
- Dates : formatées via `date-fns/locale`

## 3. Pages d'administration

### `/admin/organization`
- Paramètres de l'organisation (nom, logo, secteur)
- Référentiels activés
- Préférences par défaut (fréquence de revue, langue)

### `/admin/users`
- Liste des utilisateurs avec rôle et statut
- Inviter, modifier rôle, désactiver
- Dernière connexion

### `/admin/audit-log`
- Table de l'audit trail avec filtres avancés
- Export CSV

### `/admin/api`
- Gestion des API keys
- Documentation de l'API
- Monitoring des appels API

### `/admin/notifications`
- Configuration globale des notifications
- Templates d'email

### `/admin/billing` (si plans payants)
- Plan actuel
- Usage (stockage, utilisateurs)
- Historique de facturation (intégration Stripe)

## 4. Layout global de l'application

```
┌─────────────────────────────────────────────────┐
│  Header : logo + org name | search | notif | user │
├──────────┬──────────────────────────────────────┤
│          │                                      │
│ Sidebar  │          Main Content                │
│ (nav)    │          (router outlet)             │
│          │                                      │
│ - Dashboard                                     │
│ - Systèmes IA                                   │
│ - Gouvernance                                   │
│ - Risques                                       │
│ - Décisions                                     │
│ - Biais                                         │
│ - Incidents                                     │
│ - Transparence                                  │
│ - Cycle de vie                                  │
│ - Documentation                                 │
│ - Monitoring                                    │
│ - Données                                       │
│ - Fournisseurs                                  │
│ - Conformité                                    │
│ - Admin                                         │
│          │                                      │
│ ─────────│                                      │
│ Mes tâches (compteur)                           │
│          │                                      │
├──────────┴──────────────────────────────────────┤
│  Footer (optionnel) : version | aide | langue   │
└─────────────────────────────────────────────────┘
```

### Responsive
- Desktop : sidebar fixe + contenu
- Tablet : sidebar collapsible
- Mobile : sidebar en drawer (hamburger menu)

## 5. Sécurité

- **Chiffrement** : TLS 1.3 en transit, AES-256 au repos (Supabase managed)
- **RLS** : activé sur toutes les tables sans exception
- **CORS** : restreint à `gouvernance.ai` + environnements de dev
- **Rate limiting** : 100 req/min par utilisateur, 1000 req/min par organisation
- **Headers de sécurité** : CSP, X-Frame-Options, HSTS
- **Audit** : toutes les actions sensibles sont loguées
- **Sessions** : expiration configurable (défaut 24h), refresh token 7 jours

## 6. Performance

- **SSR** : non (SPA via Vite) — Netlify sert les assets statiques
- **Code splitting** : par route (lazy loading des modules)
- **Cache** : Supabase query caching + React Query / TanStack Query
- **Pagination** : 25 items par défaut, cursor-based pour les grandes tables
- **Debounce** : recherche et filtres (300ms)
- **Optimistic updates** : pour les actions CRUD fréquentes

## 7. Déploiement

### Netlify
- Build : `npm run build` (Vite)
- Deploy preview sur chaque PR
- Variables d'environnement :
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_APP_URL`

### Supabase
- Projet hébergé (managed) — région Canada si disponible, sinon US East
- Migrations SQL versionnées dans `/supabase/migrations/`
- Edge Functions pour la logique serveur complexe
- Seed data pour les templates (types de risque, checklists, etc.)

## 8. Composants UI fondamentaux

| Composant | Librairie | Usage |
|-----------|-----------|-------|
| `AppLayout` | Custom | Layout global (sidebar + header + content) |
| `Sidebar` | shadcn NavigationMenu | Navigation principale |
| `Header` | shadcn + custom | Header avec recherche, notifications, user |
| `NotificationPanel` | shadcn Sheet | Panneau latéral de notifications |
| `TasksBadge` | shadcn Badge | Compteur de tâches en attente |
| `GlobalSearch` | shadcn Command (cmdk) | Recherche globale ⌘K |
| `UserMenu` | shadcn DropdownMenu | Menu utilisateur (profil, paramètres, déconnexion) |
| `LanguageSwitcher` | shadcn Select | Sélecteur fr/en |
| `DataTable` | shadcn + TanStack Table | Table réutilisable avec tri/filtre/pagination |
| `FormWizard` | Custom | Wizard multi-étapes réutilisable |
| `RichTextEditor` | TipTap | Éditeur rich text |
| `FileUploader` | shadcn + custom | Upload drag-and-drop |
| `ConfirmDialog` | shadcn AlertDialog | Dialogue de confirmation |
| `StatusBadge` | shadcn Badge | Badge coloré par statut |
| `EmptyState` | Custom | État vide avec illustration et CTA |
| `LoadingSkeleton` | shadcn Skeleton | Chargement progressif |
| `ErrorBoundary` | React | Gestion d'erreurs gracieuse |
