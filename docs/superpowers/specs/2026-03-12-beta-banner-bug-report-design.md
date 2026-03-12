# Design : Bandeau Bêta & Formulaire de déclaration de bugs

## Contexte

Le portail de gouvernance est en phase bêta. Il faut :
1. Indiquer visuellement aux utilisateurs que le portail est en bêta et que certaines fonctionnalités ne sont pas entièrement finalisées.
2. Permettre aux utilisateurs de signaler des bugs via un formulaire intégré.

La mention bêta apparaît **uniquement dans le portail** (pas sur le site public).

## Architecture

### Composant `BetaBanner`

- **Emplacement :** `src/portail/components/BetaBanner.tsx`
- **Position :** Dans `PortailLayout.tsx`, à l'intérieur du `<div className="flex flex-1 flex-col overflow-hidden">`, entre `AppHeader` et la balise `<main>` (pleine largeur, en dehors du wrapper `max-w-[1400px]`)
- **Apparence :** Bandeau pleine largeur, fond léger (ambre/jaune doux ou bleu info), icône d'info
- **Contenu :** "Portail en version bêta — Certaines fonctionnalités ne sont pas entièrement finalisées." + lien "Signaler un bug" ouvrant le dialog
- **Comportement :** Persistant (non fermable), affiché sur toutes les pages du portail

### Composant `BugReportDialog`

- **Emplacement :** `src/portail/components/BugReportDialog.tsx`
- **Type :** Dialog (modale shadcn/ui)
- **Props :** `{ open: boolean, onOpenChange: (open: boolean) => void }` (pattern shadcn/ui standard, cf. `CreateAgentDialog`)
- **Monté une seule fois** dans `PortailLayout.tsx`
- **Points d'accès :**
  - Lien "Signaler un bug" dans le `BetaBanner`
  - Item "Signaler un bug" (icône `Bug` de lucide-react) dans le dropdown utilisateur de `AppHeader`
  - Les deux appellent le setter `setBugReportOpen(true)` via callback

#### Champs du formulaire

| Champ | Type | Obligatoire | Détails |
|-------|------|-------------|---------|
| Titre | `Input` | Oui | Placeholder "Résumé du problème" |
| Description | `Textarea` | Oui | Placeholder "Décrivez le bug rencontré..." |
| Page concernée | `Input` | Non | Pré-rempli avec `window.location.pathname`, modifiable |
| Sévérité | `Select` | Oui | Valeurs DB : `blocking`, `annoying`, `minor`. Labels UI : Bloquant / Gênant / Mineur |
| Capture d'écran | Upload fichier | Non | Images uniquement (JPEG, PNG, WebP). Max 5 Mo. |

- **Validation :** Zod + react-hook-form avec `zodResolver` (pattern identique à `IncidentReportPage.tsx`)
- **Soumission :** Via le hook `useBugReports` (voir ci-dessous). Toast de confirmation via Sonner.
- **UX :** Bouton "Envoyer" désactivé pendant la soumission

#### Flux d'upload de capture d'écran

1. L'utilisateur sélectionne un fichier image (validation côté client : type MIME + taille max 5 Mo)
2. À la soumission du formulaire : insert du bug report dans la table → récupération de l'`id`
3. Upload du fichier dans le bucket Storage au chemin `{organization_id}/{bug_report_id}/{filename}`
4. Update du `screenshot_url` sur le bug report
5. En cas d'échec de l'upload : le bug report est quand même créé, toast d'avertissement indiquant que la capture n'a pas pu être jointe

### Hook `useBugReports`

- **Emplacement :** `src/hooks/useBugReports.ts`
- Expose une mutation `useCreateBugReport` (TanStack React Query)
- Encapsule : insert dans `bug_reports`, upload storage, update `screenshot_url`
- Pattern identique à `useDocuments.ts` / `useIncidents.ts`

### Table Supabase `bug_reports`

```sql
CREATE TABLE public.bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  page_url TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('blocking', 'annoying', 'minor')),
  screenshot_url TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bug_reports_organization_id ON public.bug_reports(organization_id);

ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert bug reports for their organization"
  ON public.bug_reports FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

CREATE POLICY "Admins can view bug reports for their organization"
  ON public.bug_reports FOR SELECT
  USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

GRANT ALL ON public.bug_reports TO authenticated;
```

#### Storage

- Bucket `bug-screenshots` dans Supabase Storage
- Policy d'upload pour les utilisateurs authentifiés
- Chemin : `{organization_id}/{bug_report_id}/{filename}`

### Intégration dans `PortailLayout`

Structure réelle du layout avec les ajouts :

```
PortailLayout (flex row)
├── AppIconRail (desktop)
├── AppSidebar (desktop, collapsible)
├── Sheet (mobile sidebar)
├── div.flex.flex-1.flex-col.overflow-hidden
│   ├── AppHeader (reçoit onOpenBugReport)
│   ├── BetaBanner (reçoit onOpenBugReport) ← NOUVEAU
│   ├── main > div.max-w-[1400px]
│   │   └── ErrorBoundary > Outlet
│   └── BugReportDialog (open, onOpenChange) ← NOUVEAU
└── FloatingChat
```

- Un `useState<boolean>` dans `PortailLayout` contrôle l'ouverture du dialog
- Callback `onOpenBugReport = () => setBugReportOpen(true)` passé au `BetaBanner` et à `AppHeader`

### Modification de `AppHeader`

Interface actuelle :
```typescript
interface AppHeaderProps {
  onMobileMenuToggle: () => void;
}
```

Nouvelle interface :
```typescript
interface AppHeaderProps {
  onMobileMenuToggle: () => void;
  onOpenBugReport: () => void;
}
```

Ajout d'un `DropdownMenuItem` avec icône `Bug` de lucide-react dans le dropdown utilisateur, entre les items existants.

## Fichiers à créer

- `src/portail/components/BetaBanner.tsx`
- `src/portail/components/BugReportDialog.tsx`
- `src/hooks/useBugReports.ts`

## Fichiers à modifier

- `src/portail/layout/PortailLayout.tsx` — ajout du BetaBanner, BugReportDialog, et état open
- `src/portail/layout/AppHeader.tsx` — ajout de la prop `onOpenBugReport` et de l'item dans le dropdown utilisateur
- Migration Supabase — création de la table `bug_reports`, RLS, et bucket storage

## Hors périmètre

- Page d'administration pour lister/gérer les bugs
- Notifications aux admins lors d'un nouveau bug
- Internationalisation du bandeau et du formulaire (peut être ajouté plus tard)
