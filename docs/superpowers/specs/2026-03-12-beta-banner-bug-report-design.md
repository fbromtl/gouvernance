# Design : Bandeau Bêta & Formulaire de déclaration de bugs

## Contexte

Le portail de gouvernance est en phase bêta. Il faut :
1. Indiquer visuellement aux utilisateurs que le portail est en bêta et que certaines fonctionnalités ne sont pas entièrement finalisées.
2. Permettre aux utilisateurs de signaler des bugs via un formulaire intégré.

La mention bêta apparaît **uniquement dans le portail** (pas sur le site public).

## Architecture

### Composant `BetaBanner`

- **Emplacement :** `src/portail/components/BetaBanner.tsx`
- **Position :** Dans `PortailLayout.tsx`, au-dessus du contenu principal (entre le header et l'outlet, ou tout en haut du layout)
- **Apparence :** Bandeau pleine largeur, fond léger (ambre/jaune doux ou bleu info), icône d'info
- **Contenu :** "Portail en version bêta — Certaines fonctionnalités ne sont pas entièrement finalisées." + lien "Signaler un bug" ouvrant le dialog
- **Comportement :** Persistant (non fermable), affiché sur toutes les pages du portail

### Composant `BugReportDialog`

- **Emplacement :** `src/portail/components/BugReportDialog.tsx`
- **Type :** Dialog (modale shadcn/ui)
- **Monté une seule fois** dans `PortailLayout.tsx` avec un état `open` remonté au layout
- **Points d'accès :**
  - Lien "Signaler un bug" dans le `BetaBanner`
  - Item "Signaler un bug" (icône Bug) dans le dropdown utilisateur de `AppHeader`
  - Les deux reçoivent un callback `onOpenBugReport` depuis le layout

#### Champs du formulaire

| Champ | Type | Obligatoire | Détails |
|-------|------|-------------|---------|
| Titre | `Input` | Oui | Placeholder "Résumé du problème" |
| Description | `Textarea` | Oui | Placeholder "Décrivez le bug rencontré..." |
| Page concernée | `Input` | Non | Pré-rempli avec `window.location.pathname`, modifiable |
| Sévérité | `Select` | Oui | Options : Bloquant / Gênant / Mineur |
| Capture d'écran | Upload fichier | Non | Image uniquement |

- **Validation :** Zod + react-hook-form (pattern existant du projet)
- **Soumission :** Insert dans la table Supabase `bug_reports`, toast de confirmation via Sonner
- **UX :** Bouton "Envoyer" désactivé pendant la soumission

### Table Supabase `bug_reports`

```sql
CREATE TABLE bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  page_url TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('bloquant', 'genant', 'mineur')),
  screenshot_url TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### RLS Policies

- **INSERT :** Les utilisateurs authentifiés peuvent insérer leurs propres bugs (`auth.uid() = user_id`)
- **SELECT :** Lecture réservée aux admins (pas de read policy pour les utilisateurs normaux)

#### Storage

- Bucket `bug-screenshots` dans Supabase Storage
- Policy d'upload pour les utilisateurs authentifiés

### Intégration dans `PortailLayout`

```
PortailLayout
├── AppSidebar
├── main
│   ├── AppHeader (reçoit onOpenBugReport)
│   ├── BetaBanner (reçoit onOpenBugReport)
│   ├── Outlet (contenu des pages)
│   └── BugReportDialog (état open géré ici)
└── FloatingChat
```

- Un `useState<boolean>` dans `PortailLayout` contrôle l'ouverture du dialog
- `onOpenBugReport` est passé en prop au `BetaBanner` et à `AppHeader`
- Pas de context global, pas de nouvelle route

## Fichiers à créer

- `src/portail/components/BetaBanner.tsx`
- `src/portail/components/BugReportDialog.tsx`

## Fichiers à modifier

- `src/portail/layout/PortailLayout.tsx` — ajout du BetaBanner, BugReportDialog, et état open
- `src/portail/layout/AppHeader.tsx` — ajout de l'item "Signaler un bug" dans le dropdown utilisateur
- Migration Supabase — création de la table `bug_reports` et du bucket storage

## Hors périmètre

- Page d'administration pour lister/gérer les bugs
- Notifications aux admins lors d'un nouveau bug
- Internationalisation du bandeau et du formulaire (peut être ajouté plus tard)
