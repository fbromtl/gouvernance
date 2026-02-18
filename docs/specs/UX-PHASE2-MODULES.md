# UX Design Specification -- Phase 2 Modules

> **Platform:** gouvernance.ai SaaS portal
> **Audience:** Non-technical users (compliance officers, risk managers, executives)
> **Stack:** React 19, Tailwind CSS 4, shadcn/ui (new-york style), Lucide icons, i18next (fr/en)
> **Brand palette:** Purple #ab54f3 (primary), Teal #14b8a6 (accent/success), Navy #1e1a30 (dark), Blue #312dee (links), Amber #f59e0b (warnings)
> **Font:** Plus Jakarta Sans

---

## Global Design Tokens & Conventions

### Color Mapping for Risk Levels

These colors are used consistently across all three modules wherever a risk or severity level is displayed (badges, borders, gauges, buttons, chart segments).

| Level | Background | Text | Border | Tailwind classes |
|---|---|---|---|---|
| Critical / Prohibited | `bg-red-50` | `text-red-700` | `border-red-300` | dark: `bg-red-950 text-red-300` |
| High | `bg-orange-50` | `text-orange-700` | `border-orange-300` | dark: `bg-orange-950 text-orange-300` |
| Medium / Limited | `bg-amber-50` | `text-amber-700` | `border-amber-300` | dark: `bg-amber-950 text-amber-300` |
| Low / Minimal | `bg-green-50` | `text-green-700` | `border-green-300` | dark: `bg-green-950 text-green-300` |

### Color Mapping for Workflow Statuses

| State | Badge style | Tailwind classes |
|---|---|---|
| Draft | Light gray | `bg-gray-100 text-gray-700 border-gray-200` |
| Submitted / Reported | Light blue | `bg-blue-50 text-blue-700 border-blue-200` |
| In review / Investigating | Light indigo | `bg-indigo-50 text-indigo-700 border-indigo-200` |
| Approved / Resolved | Light green | `bg-green-50 text-green-700 border-green-200` |
| Rejected / Closed | Light gray-red | `bg-red-50 text-red-700 border-red-200` |
| Archived | Light gray | `bg-gray-100 text-gray-600 border-gray-200` |

### Icon Mapping

| Concept | Lucide Icon |
|---|---|
| AI System | `Bot` |
| Risk / Warning | `AlertTriangle` |
| Incident | `AlertCircle` |
| Critical severity | `Skull` |
| High severity | `AlertTriangle` |
| Medium severity | `AlertCircle` |
| Low severity | `Shield` |
| Review overdue | `Clock` with red dot |
| Draft saved | `CloudUpload` |
| Approved | `CheckCircle` |
| Export PDF | `FileDown` |

### Spacing & Layout Constants

| Element | Value |
|---|---|
| Page horizontal padding | `p-6` (24px) |
| Section vertical gap | `space-y-6` (24px) |
| Card internal padding | `p-6` |
| Table row height | `h-14` (56px) minimum |
| Badge internal padding | `px-2.5 py-1` |
| Large risk badges | `px-3 py-1.5 text-sm font-semibold` |
| Wizard step content max-width | `max-w-2xl mx-auto` |

### Responsive Breakpoints

| Breakpoint | Behavior |
|---|---|
| `< lg` (< 1024px) | Sidebar collapses to Sheet, tables switch to card/stack layout |
| `< md` (< 768px) | Two-column grids become single column, sticky sidebars become collapsible top panels |
| `>= lg` (>= 1024px) | Full sidebar + table layout, sticky score panels visible |

### Typography Hierarchy

| Element | Classes |
|---|---|
| Page title (h1) | `text-2xl font-bold tracking-tight` (from existing `PageHeader`) |
| Section heading (h2) | `text-lg font-semibold` |
| Card title | `text-sm font-semibold` |
| Table cell | `text-sm` |
| Helper text / description | `text-sm text-muted-foreground` |
| Tiny label | `text-xs text-muted-foreground` |
| Badge text | `text-xs font-medium` |

---

## MODULE A: AI Systems Registry (`/ai-systems`)

### A1. List Page (`/ai-systems`)

#### Layout

```
+--------------------------------------------------+
| PageHeader: "Registre des systemes IA"            |
|   description: count + last updated               |
|   actions: [ViewToggle] [+ Nouveau systeme]       |
+--------------------------------------------------+
| Filter bar (horizontal, wrapping)                 |
| [Type v] [Departement v] [Risque v] [Statut v]   |
| [Recherche...]                     [Effacer tout] |
+--------------------------------------------------+
| DataTable / Card grid                             |
|   ... rows/cards ...                              |
+--------------------------------------------------+
| Pagination: [< Precedent] Page 1 of 3 [Suivant >]|
+--------------------------------------------------+
```

#### Specific Decisions

**Page Header**
- Use existing `PageHeader` component.
- `title`: `t('aiSystems.title')` -- "Registre des systemes IA" / "AI Systems Registry".
- `description`: Dynamic count string -- "{count} systemes enregistres" / "{count} registered systems".
- `actions` slot contains two items:
  1. A `ToggleGroup` (shadcn) with two icons: `LayoutGrid` (cards) and `List` (table). Default: `List`. Persist choice in `localStorage('ai-systems-view')`.
  2. `Button` variant `default` (purple primary): "Nouveau systeme" / "New system" with `Plus` icon. Links to `/ai-systems/new`. Classes: `bg-brand-purple hover:bg-brand-purple-dark text-white`.

**Filter Bar**
- Rendered inside a `Card` (subtle background, `bg-muted/50 border-0`), `flex flex-wrap items-center gap-3 p-3`.
- Each filter is a shadcn `Select` (popover dropdown) with a clear button (x icon inside when a value is selected).
  - **Type**: all `system_type` values as options, grouped label "Type de systeme".
  - **Departement**: all department values.
  - **Risk Level**: Minimal, Limited, High, Critical. Each option prefixed with a colored dot (`inline-block w-2 h-2 rounded-full mr-2` with the risk color).
  - **Statut**: Draft, Submitted, Approved, Archived.
- Text search input (`Input` component) with `Search` icon, placeholder "Rechercher par nom...". Debounced 300ms.
- "Effacer tout" / "Clear all" as `Button variant="ghost" size="sm"`, visible only when at least one filter is active.

**Table View (Default)**
- Use the generic `DataTable` component (TanStack Table).
- Default sort: `risk_score` descending (most critical first).
- Columns:

| # | Column | Width | Rendering |
|---|---|---|---|
| 1 | Name + description | `flex-1 min-w-[200px]` | Name as `font-medium text-sm`, description truncated to 1 line as `text-xs text-muted-foreground truncate max-w-[300px]` |
| 2 | Type | `w-[140px]` | shadcn `Badge variant="outline"` with icon matching the type |
| 3 | Risk Level | `w-[120px]` | **Large colored badge** using `StatusBadge` extended variant: `px-3 py-1.5 text-sm font-semibold rounded-md` with risk color mapping. Include a small colored dot before the text. |
| 4 | Lifecycle | `w-[120px]` | Standard `StatusBadge` (existing component) |
| 5 | Review Date | `w-[130px]` | Date formatted with `date-fns`. **Visual urgency**: if `null` show `--`. If overdue (`< today`): red text + `Clock` icon in red. If within 7 days: orange text + `Clock` icon in orange. Otherwise: normal `text-muted-foreground`. |
| 6 | Owner | `w-[48px]` | `Avatar` component showing `business_owner` initials. Tooltip on hover showing full name and role. |
| 7 | Actions | `w-[48px]` | `DropdownMenu` triggered by `MoreHorizontal` icon button. Items: View, Edit, Duplicate, separator, Archive (destructive). |

- Row hover: entire row gets `hover:bg-muted/50 cursor-pointer`. Clicking the row navigates to `/ai-systems/:id`.
- Quick actions on hover: instead of always showing the dropdown, show a faint row of inline icon buttons (`Eye`, `Pencil`, `Copy`) on hover, replacing the `MoreHorizontal` button. On mobile/touch: always show the `MoreHorizontal` dropdown.

**Card View (Toggle)**
- Grid: `grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4`.
- Each card uses shadcn `Card`:
  - Top: colored left border strip (`border-l-4`) matching risk level color.
  - Header row: System name (font-semibold) + `StatusBadge` for lifecycle.
  - Body: 1-line description truncated, then a 2x2 mini-grid:
    - Risk Level: large colored badge.
    - Type: icon + label.
    - Owner: small avatar + name.
    - Review date: with urgency coloring.
  - Footer: small text "Modifie le {date}" / "Updated {date}".
  - Entire card is clickable (links to detail page).

**Empty State**
- Use existing `EmptyState` component with `Bot` icon.
- Title: "Aucun systeme IA enregistre" / "No AI systems registered".
- Description: "Commencez par enregistrer votre premier systeme d'intelligence artificielle." / "Start by registering your first AI system."
- Action button: "Nouveau systeme" linking to `/ai-systems/new`.

**Pagination**
- Shadcn pagination below the table.
- 10 rows per page default, option to switch to 25 or 50.
- Shown only if count > page size.

---

### A2. Wizard -- Create/Edit (`/ai-systems/new`, `/ai-systems/:id/edit`)

#### Overall Layout

```
+--------------------------------------------------+
| Breadcrumb: Registre > Nouveau systeme            |
+--------------------------------------------------+
| Step indicator (horizontal, 5 steps)              |
| [1 Identification] [2 Perimetre] [3 Donnees]     |
| [4 Proprietaires] [5 Statut & revue]             |
+--------------------------------------------------+
| Card (max-w-2xl mx-auto)                         |
|   Step content (form fields)                      |
|                                                   |
+--------------------------------------------------+
| Footer bar: [Precedent] [Brouillon] [Suivant]    |
+--------------------------------------------------+
```

#### Step Indicator

- Component: custom horizontal stepper (no existing shadcn stepper -- build one).
- Layout: `flex items-center justify-between` in a `Card` with `p-4`.
- Each step is a circle + label:
  - Completed: green circle with `Check` icon, green connector line, label in `text-green-700`.
  - Current: purple circle with step number, pulsing ring (`ring-2 ring-brand-purple/30 animate-pulse`), label in `font-semibold text-foreground`.
  - Future: gray circle with step number, gray connector line, label in `text-muted-foreground`.
- Circle size: `h-8 w-8` (desktop), `h-6 w-6` (mobile -- labels hidden, tooltip instead).
- Connector lines: `h-0.5 flex-1 mx-2`, colored green (completed) or gray (future).
- Steps are clickable only if all previous steps are valid (validated via zod). Clicking a completed step navigates back to it.
- Auto-save indicator: small `CloudUpload` icon + "Brouillon sauvegarde" / "Draft saved" text appears to the right of the stepper when auto-save triggers (every 30 seconds or on step change).

#### Step Content Area

- Wrapped in `Card` with `max-w-2xl mx-auto p-6 space-y-6`.
- Each step has a heading: `text-lg font-semibold` + a short description in `text-sm text-muted-foreground`.

#### Field Rendering Rules

Every field follows this pattern:

```
[Label] [?] (tooltip icon)
[Input / Select / Multi-select]
[Helper text if needed]
```

- Label: `text-sm font-medium` (shadcn `Label` component).
- Tooltip: `CircleHelp` icon (16px, `text-muted-foreground`) next to the label. Uses shadcn `Tooltip` component. Content is a short explanation in plain language with an example. Example: "Le type de systeme aide a determiner les obligations reglementaires applicables. Ex: un chatbot utilisant GPT est de type 'IA generative / LLM'."
- Required fields: label ends with `*` in `text-destructive` color.
- Input: full-width (`w-full`), standard shadcn `Input` / `Textarea` / `Select`.
- Validation errors: shown below the input in `text-sm text-destructive` with `AlertCircle` icon.

#### Step 1 -- Identification

Fields:
1. **Nom du systeme** -- `Input`, required, maxLength 200. Placeholder: "Ex: Chatbot Service Client v2".
2. **Description** -- `Textarea`, required, maxLength 2000, 4 rows. Placeholder: "Decrivez brievement ce que fait ce systeme et dans quel contexte il est utilise...".
3. **Identifiant interne** -- `Input`, optional. Placeholder: "Ex: AI-2024-042". Helper: "Numero de projet, code interne...".
4. **Type de systeme** -- `Select`, required. Options from `system_type` enum with human-readable bilingual labels. Each option has a small icon.
5. **Sous-type GenAI** -- `Select`, conditional. **Animation**: when `system_type` changes to `genai_llm`, this field slides in from above with `animate-in slide-in-from-top-2 duration-300`. When type changes away, it slides out with `animate-out slide-out-to-top-2 duration-200`. Required when visible.

#### Step 2 -- Scope & Impact

Fields:
1. **Departement(s)** -- Multi-select using a chip/tag selector. Show all options as toggleable pills in a `flex flex-wrap gap-2` layout. Each pill is a `Button variant="outline" size="sm"` that toggles to `variant="default"` (purple) when selected. A "Tout selectionner" / "Select all" link at the top-right. Required (at least 1).
2. **Finalite / cas d'usage** -- `Textarea`, required, 3 rows. Placeholder: "Ex: Le systeme analyse les CV des candidats pour pre-selectionner les profils correspondant aux criteres du poste...".
3. **Population touchee** -- Multi-select chips (same pattern as departments). Options: Employes, Clients, Prospects, Grand public, Mineurs, Personnes vulnerables.
4. **Volume estime** -- `Select`. Options: "Moins de 100", "100-1000", "1000-10 000", "10 000-100 000", "Plus de 100 000".
5. **Niveau d'autonomie** -- `RadioGroup` (shadcn) with 4 options. Each radio has a descriptive label + subtitle:
   - "Entierement automatise -- Aucune intervention humaine" (bold: "Entierement automatise")
   - "Humain dans la boucle -- L'humain valide avant chaque action"
   - "Humain en supervision -- L'humain peut intervenir si besoin"
   - "Humain aux commandes -- L'IA est un outil d'aide"
   - Each option is rendered as a selectable card: `border rounded-lg p-4 cursor-pointer` with `border-brand-purple bg-brand-purple/5` when selected.
6. **Domaine(s) sensible(s)** -- Multi-select chips. Options from `sensitive_domains` enum. When at least 1 domain is selected, show an inline alert below: `AlertTriangle` icon + "Ce systeme opere dans un domaine sensible. Le score de risque sera augmente." in `text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3`.

**Live Risk Score Preview**: At the bottom of Step 2 and Step 3, show a small preview card:
```
+--------------------------------------------+
| Apercu du risque (provisoire)              |
| [Mini gauge: 45/100] [Badge: Limited]      |
| Autonomie: +15  Donnees: --  Population: +5|
+--------------------------------------------+
```
- This card has `bg-muted/50 rounded-lg p-4`.
- The mini gauge is a simplified horizontal bar (not circular) showing the current calculated score.
- The breakdown shows which factors contribute to the current score.
- Updates in real-time as the user changes autonomy, data types, population, sensitive domains.

#### Step 3 -- Data & Vendor

Fields:
1. **Types de donnees** -- Multi-select chips. Options: "Donnees sensibles", "Donnees personnelles", "Donnees financieres", "Donnees de sante", "Donnees anonymisees", "Donnees synthetiques", "Aucune donnee personnelle".
2. **Source du systeme** -- `Select`. Options from `system_source` enum.
3. **Nom du fournisseur** -- `Input`, conditional (visible if source != 'internal'). Slide-in animation. Placeholder: "Ex: OpenAI, Microsoft, Salesforce...".
4. **Version du modele** -- `Input`, optional. Placeholder: "Ex: GPT-4o, Claude 3.5 Sonnet...".
5. **Localisation des donnees** -- Multi-select chips. Options: "Quebec", "Canada (hors QC)", "Etats-Unis", "Union europeenne", "Autre pays". When "Etats-Unis" or "Autre pays" is selected, show warning: "Attention: le transfert hors Canada entraine des obligations supplementaires (Loi 25)."

#### Step 4 -- Owners

Fields:
1. **Responsable metier** -- Owner select. Component: a `Popover` with search `Input` at top, scrollable list of org members below. Each option shows: `Avatar` (32px) + full name + role badge. Selecting sets the avatar + name inline in the trigger button. Clear button to unset.
2. **Responsable technique** -- Same component.
3. **Responsable vie privee** -- Same component.
4. **Responsable risques** -- Same component.
5. **Approbateur** -- Same component.

Layout: 2-column grid on desktop (`grid grid-cols-1 md:grid-cols-2 gap-6`), single column on mobile.

#### Step 5 -- Status & Review

Fields:
1. **Statut du cycle de vie** -- `Select`. Options from `lifecycle_status` enum with colored dots.
2. **Date de mise en production** -- Date picker (shadcn `Popover` + calendar). Conditional: only enabled if lifecycle is "production" or later.
3. **Date de prochaine revue** -- Date picker. Pre-filled suggestion based on review frequency.
4. **Frequence de revue** -- `Select`. Options: Mensuelle, Trimestrielle, Semestrielle, Annuelle.
5. **Notes** -- `Textarea`, optional, 3 rows.

**Summary Preview**: Below the fields, show a summary `Card` with `border-2 border-dashed border-muted`:
```
+----------------------------------------------+
| Resume avant soumission                      |
+----------------------------------------------+
| Nom: Chatbot Service Client v2               |
| Type: IA generative / LLM > Chatbot          |
| Departements: Service client, IT             |
| Risque: [Badge: Limited - 42/100]            |
| Cycle de vie: Production                     |
| Prochaine revue: 15 juin 2026                |
| Proprietaire: Marie Dupont                   |
+----------------------------------------------+
| [Modifier]                    [Soumettre]    |
+----------------------------------------------+
```

- Each line is a `dl` with `dt` (label) and `dd` (value) in a 2-column layout.
- The risk score badge is the large colored variant.
- "Modifier" is `Button variant="outline"` scrolling back to step 1.
- "Soumettre" is `Button variant="default"` (purple). Disabled until all required fields are valid.

#### Footer Navigation Bar

- Sticky to bottom of viewport: `sticky bottom-0 bg-card border-t p-4 flex items-center justify-between`.
- Left: `Button variant="outline"`: "Precedent" / "Previous" (hidden on step 1).
- Center: `Button variant="ghost" size="sm"`: "Sauvegarder le brouillon" / "Save draft" with `Save` icon. Always visible.
- Right: `Button variant="default"` (purple): "Suivant" / "Next" (steps 1-4), "Soumettre" / "Submit" (step 5).
- On step 5, the "Suivant" button becomes "Soumettre" with `Check` icon.

#### Validation

- Zod schema per step. Validation runs on "Suivant" click. If errors, scroll to the first invalid field and show errors inline.
- Step indicator marks a step as valid (green checkmark) only when its zod schema passes.

#### Auto-Save

- Auto-save triggers: on step change, on 30-second interval, on blur of any field.
- Saves to Supabase with `status = 'draft'`.
- Visual feedback: small "Brouillon sauvegarde" text with `Check` icon appears briefly (2s toast or inline indicator next to the stepper).

---

### A3. Detail Page (`/ai-systems/:id`)

#### Layout

```
+--------------------------------------------------+
| Breadcrumb: Registre > Chatbot Service Client v2  |
+--------------------------------------------------+
| Hero Card                                         |
| +----------------------------------------------+ |
| | [Risk Gauge]  Name         [Lifecycle badge] | |
| | (large       Description    [Status badge]   | |
| |  circular)                                    | |
| |              Prochaine revue: 15 juin 2026    | |
| |              (countdown badge)                | |
| +----------------------------------------------+ |
+--------------------------------------------------+
| Owner avatars row                                 |
| [Avatar: M.Dupont] [Avatar: J.Martin] [+2]       |
+--------------------------------------------------+
| Tabs                                              |
| [Resume (0)] [Risques (2)] [Incidents (1)]        |
| [Documents (4)] [Historique]                       |
+--------------------------------------------------+
| Tab content area                                  |
+--------------------------------------------------+
```

#### Hero Card

- `Card` with `p-6`. Two-column layout on desktop: left = risk gauge, right = details.
- **Risk Gauge**: large circular SVG gauge (`w-32 h-32` / 128px). Shows score as number in center, colored arc from 0 to score. Color follows risk level mapping. Below the gauge: `StatusBadge` for risk level (large variant). Component: `RiskScoreGauge` (shared).
- **Details column**:
  - System name: `text-xl font-bold`.
  - Description: `text-sm text-muted-foreground` (3 lines max with "voir plus" expand link).
  - Two inline badges: `StatusBadge` for lifecycle status + `StatusBadge` for workflow status.
  - Review date countdown: if overdue, show `Badge` in red: "Revue en retard de 12 jours" / "Review overdue by 12 days". If within 7 days: orange. If within 30 days: neutral. If > 30 days: green "Prochaine revue dans 45 jours".
- **Actions** (top-right of card): `DropdownMenu` with `MoreHorizontal` button. Items: Edit, Duplicate, Export PDF, separator, Archive.

#### Owner Avatars Row

- `div` with `flex items-center gap-3 mt-4`.
- Each owner displayed as: `Avatar` (36px) + name + role label (`text-xs text-muted-foreground`). Use a horizontal list with owner role as subtitle.
- If more than 4 owners, show first 3 + a "+N" avatar circle.
- Each avatar links to the owner's profile (or shows tooltip with email).

#### Tabs

- shadcn `Tabs` component.
- Tabs with badge counts:
  - "Resume" -- no count, default selected.
  - "Risques (2)" -- count of risk assessments.
  - "Incidents (1)" -- count of linked incidents.
  - "Documents (4)" -- count of attached documents.
  - "Historique" -- no count.
- Badge counts rendered as `Badge variant="secondary" className="ml-1.5 text-xs"`.
- Tab content loads below.

**Resume Tab**: 2-column grid of metadata cards:
- Card 1: "Identification" -- type, subtype, internal ref, vendor, model version.
- Card 2: "Perimetre" -- departments (as chips), purpose, affected population, volume.
- Card 3: "Donnees" -- data types (as chips), data locations, source.
- Card 4: "Planification" -- lifecycle, production date, review frequency, next review.
- Each card is a `Card` with `CardHeader` (title) and `CardContent` (key-value pairs in a `dl`).

**Risques Tab**: Table of risk assessments linked to this system, or empty state with "Lancer une evaluation" CTA linking to `/risks/new?system=:id`.

**Incidents Tab**: Table of incidents linked to this system, or empty state with "Signaler un incident" CTA.

**Documents Tab**: Placeholder for Phase 3 (file attachments). Shows empty state.

**Historique Tab**: Audit log timeline. Each entry: timestamp, user avatar, action description. Uses `audit_logs` data.

---

## MODULE B: Risk Assessments (`/risks`)

### B1. List Page (`/risks`)

#### Layout

```
+--------------------------------------------------+
| PageHeader: "Evaluations de risque"               |
|   actions: [+ Nouvelle evaluation]                |
+--------------------------------------------------+
| Filter bar                                        |
| [Systeme v] [Niveau v] [Statut v] [Recherche...] |
+--------------------------------------------------+
| DataTable                                         |
+--------------------------------------------------+
```

#### Specific Decisions

**Table Columns**:

| # | Column | Rendering |
|---|---|---|
| 1 | AI System name | `font-medium`, links to `/ai-systems/:id` |
| 2 | Score | Numeric `text-lg font-bold` + colored based on level |
| 3 | Risk Level | Large colored `StatusBadge` |
| 4 | Status | Standard `StatusBadge` |
| 5 | Assessed by | `Avatar` + name |
| 6 | Date | `date-fns` relative format ("il y a 3 jours") |
| 7 | Actions | View, Approve (if in_review), Export PDF |

- Default sort: `total_score` descending.
- "Nouvelle evaluation" button (purple primary) links to `/risks/new` (requires selecting a system first).

---

### B2. Questionnaire (`/risks/new?system=:id`)

#### Layout -- Desktop

```
+--------------------------------------------------+
| Breadcrumb: Risques > Nouvelle evaluation         |
| System name: "Chatbot Service Client v2"          |
+--------------------------------------------------+
| +-----------------------------------+  +---------+|
| | Section progress                  |  | Score   ||
| | [A Impact ****] [B EU AI Act **]  |  | panel   ||
| | [C Donnees **] [D Biais ***]      |  | (sticky)||
| | [E Transparence *] [F Superv. *]  |  |         ||
| +-----------------------------------+  | [Gauge] ||
| | Question card                     |  | 45/100  ||
| | +-------------------------------+ |  | Limited ||
| | | Q1: Le systeme prend-il...    | |  |         ||
| | | ( ) Oui, directement (+15)    | |  | Section ||
| | | ( ) Oui, indirectement (+8)   | |  | scores: ||
| | | ( ) Non (+0)                  | |  | A: 15   ||
| | +-------------------------------+ |  | B: 10   ||
| |                                   |  | C: --   ||
| | +-------------------------------+ |  | D: --   ||
| | | Q2: Les personnes peuvent...  | |  | E: --   ||
| | | ...                           | |  | F: --   ||
| | +-------------------------------+ |  |         ||
| +-----------------------------------+  +---------+|
+--------------------------------------------------+
| [Precedent] [Sauvegarder]           [Suivant]     |
+--------------------------------------------------+
```

#### Layout -- Mobile

```
+--------------------------------------------------+
| Breadcrumb + System name                          |
+--------------------------------------------------+
| Score preview (collapsible)                       |
| [v] Score actuel: 45/100 - Limited                |
+--------------------------------------------------+
| Section tabs (horizontal scroll)                  |
| [A Impact] [B EU AI Act] [C Donnees] ...          |
+--------------------------------------------------+
| Question cards (full width)                       |
+--------------------------------------------------+
| [Precedent]                           [Suivant]   |
+--------------------------------------------------+
```

#### Section Progress Bar

- Horizontal bar at the top of the question area.
- Each section is a clickable segment: "Section A: Impact -- 4 questions".
- Active section is highlighted in purple.
- Completed sections show a green checkmark.
- Each segment shows the section name + star rating indicating question count (1 star per question, max 4).
- Implementation: `flex items-center` with `Button variant="ghost"` per section. Active section has `border-b-2 border-brand-purple`.

#### Question Card Rendering

Each question is rendered as an individual `Card`:

```
+----------------------------------------------+
| Q1                                    [?]     |
| Le systeme prend-il des decisions qui         |
| affectent directement des personnes ?         |
+----------------------------------------------+
| ( ) Oui, directement                         |
|     Le systeme decide seul d'une action       |
|     qui touche une personne                   |
|                                               |
| ( ) Oui, indirectement                        |
|     Le systeme influence des decisions         |
|     qui touchent des personnes                |
|                                               |
| ( ) Non                                       |
|     Le systeme n'a pas d'impact sur           |
|     des personnes physiques                   |
+----------------------------------------------+
```

- Card: `Card` with `p-6 space-y-4`.
- Question number: `text-xs font-semibold text-muted-foreground` (e.g., "Q1").
- Question text: `text-base font-medium`.
- Tooltip icon: `CircleHelp` with plain-language explanation of the question's purpose.
- Options: `RadioGroup` (for single-select) or `CheckboxGroup` (for multi-select Q4, Q6).
  - Each option is a selectable card: `border rounded-lg p-4 cursor-pointer transition-colors`. Selected: `border-brand-purple bg-brand-purple/5`. Unselected: `border-muted hover:border-muted-foreground/30`.
  - Option label: `text-sm font-medium`.
  - Option description: `text-xs text-muted-foreground mt-1`.
  - Points are NOT shown to the user to avoid gaming. The scoring is internal.
- Spacing between questions: `space-y-4`.
- Section transition: when moving to next section, content animates with `animate-in fade-in-0 slide-in-from-right-4 duration-300`.

#### Live Score Panel (Desktop Sidebar)

- `div` with `sticky top-6 w-[280px]` inside a `Card p-6`.
- Contains:
  1. **Circular gauge** (`RiskScoreGauge` component, `w-24 h-24` centered): shows current total score, colored by level.
  2. **Score number**: `text-3xl font-bold` centered, colored by level.
  3. **Risk level badge**: large `StatusBadge`.
  4. **Section breakdown**: list of 6 sections with their individual scores.
     - Format per line: section letter + name + score on the right.
     - Completed sections show their score in colored text.
     - Incomplete sections show "--" in gray.
     - Active section has a subtle highlight `bg-muted/50 rounded px-2 py-1`.
  5. **Progress indicator**: `Progress` component (shadcn) showing "12 / 17 questions" below the breakdown.

#### Live Score Panel (Mobile)

- Collapsible panel at the top: `Collapsible` (shadcn).
- Trigger: a bar showing "Score actuel: 45/100 -- Risque limite" with a chevron icon. Colored background matching risk level (light variant).
- Expanded: shows the circular gauge + section breakdown in a compact layout.

#### Navigation

- Section navigation: "Precedent" / "Suivant" buttons move between sections (not individual questions).
- All questions in a section are visible at once (scrollable).
- "Sauvegarder" button saves progress as `status = 'draft'`.
- After the last section (F), "Suivant" becomes "Voir les resultats" / "View results".

---

### B3. Results Page (`/risks/:id`)

#### Layout

```
+--------------------------------------------------+
| Full-screen result hero                           |
| +----------------------------------------------+ |
| |      [Large circular gauge: 72/100]          | |
| |              Risque eleve                     | |
| |      Badge: High - orange                    | |
| |                                              | |
| |      Systeme: Chatbot Service Client v2      | |
| |      Evalue le: 17 fev. 2026                 | |
| |      Par: Marie Dupont                        | |
| +----------------------------------------------+ |
+--------------------------------------------------+
| Requirements checklist                            |
| +----------------------------------------------+ |
| | Conformite & transparence (3)                | |
| | [ ] Documentation du systeme completee       | |
| | [ ] Notice de transparence publiee           | |
| | [ ] ...                                      | |
| |                                              | |
| | Supervision humaine (2)                      | |
| | [ ] Mecanisme d'arret d'urgence defini       | |
| | [ ] ...                                      | |
| +----------------------------------------------+ |
+--------------------------------------------------+
| Actions                                           |
| [Exporter PDF] [Soumettre pour approbation]       |
+--------------------------------------------------+
```

#### Result Hero

- Full-width `Card` with `p-8 text-center`.
- Large `RiskScoreGauge` (`w-40 h-40` / 160px) centered.
- Score: `text-4xl font-bold` below gauge, colored by level.
- Risk level: large `StatusBadge` (`text-lg px-4 py-2`).
- System name, date, assessor below in `text-sm text-muted-foreground`.

#### Requirements Checklist

- Grouped by category in `Accordion` (shadcn).
- Each group: category name as accordion trigger with count badge.
- Each requirement: `Checkbox` (shadcn) + label text. Checking a box updates the `requirements` JSONB field.
- Completion progress: horizontal `Progress` bar at the top of the checklist section showing "5 / 12 exigences completees".

#### Approval Workflow

- If status is `draft`: show "Soumettre pour approbation" button (purple primary). Changes status to `in_review`.
- If status is `in_review`: show an approval card:
  - "En attente d'approbation" banner with `Clock` icon.
  - For users with `approve_decisions` permission: "Approuver" (green) and "Retourner pour revision" (outline) buttons.
  - Approval creates a signature line: "Approuve par [name] le [date]" displayed permanently.
- If status is `approved`: show green banner "Evaluation approuvee par [name] le [date]" with `CheckCircle` icon.

#### Export

- "Exporter PDF" button (`Button variant="outline"` with `FileDown` icon).
- Generates a styled PDF with: header (org logo + name), score, level, all questions + answers, requirements checklist, approval status.

---

## MODULE C: Incidents (`/incidents`)

### C1. Report Form (`/incidents/new`)

#### Design Goal

Must be completable in under 2 minutes. Minimal cognitive load. Encourage reporting by making it feel lightweight.

#### Layout

```
+--------------------------------------------------+
| PageHeader: "Signaler un incident"                |
|   description: "Remplissez ce formulaire rapide"  |
+--------------------------------------------------+
| Card (max-w-xl mx-auto)                          |
| +----------------------------------------------+ |
| | Titre *                                      | |
| | [Input: "Que s'est-il passe ?"]              | |
| |                                              | |
| | Categorie *                                  | |
| | [AI] [Confidentialite]  (toggle buttons)     | |
| |                                              | |
| | Severite *                                   | |
| | [Critique] [Elevee] [Moyenne] [Faible]       | |
| | (4 large colored buttons)                    | |
| |                                              | |
| | Description *                                | |
| | [Textarea: "Decrivez l'incident..."]         | |
| |                                              | |
| |                     [Signaler l'incident]    | |
| +----------------------------------------------+ |
+--------------------------------------------------+
```

#### Specific Decisions

**Title**
- `Input` with placeholder: "Ex: Le chatbot a genere des informations incorrectes" / "Ex: The chatbot generated incorrect information".
- Required, maxLength 200.

**Category Toggle**
- Two large toggle buttons side by side (`flex gap-3`).
- Each button: `border rounded-lg p-4 flex-1 cursor-pointer text-center transition-colors`.
- "IA" button: `Bot` icon (32px) + "Incident IA" label. Selected: `border-brand-purple bg-brand-purple/5 text-brand-purple`.
- "Confidentialite" / "Privacy" button: `ShieldAlert` icon (32px) + "Incident de confidentialite" label.
- Unselected: `border-muted text-muted-foreground hover:border-muted-foreground/30`.

**Severity Selection**
- 4 large buttons in a row (`grid grid-cols-4 gap-3`, stacks to `grid-cols-2` on mobile).
- Each button: `border rounded-lg p-4 text-center cursor-pointer transition-all` with icon + label.
- Button specs:

| Severity | Icon | Icon size | Colors (unselected border / selected bg) |
|---|---|---|---|
| Critique | `Skull` | 28px | `border-red-200` / `bg-red-50 border-red-400 text-red-700 ring-2 ring-red-200` |
| Elevee | `AlertTriangle` | 28px | `border-orange-200` / `bg-orange-50 border-orange-400 text-orange-700 ring-2 ring-orange-200` |
| Moyenne | `AlertCircle` | 28px | `border-amber-200` / `bg-amber-50 border-amber-400 text-amber-700 ring-2 ring-amber-200` |
| Faible | `Shield` | 28px | `border-green-200` / `bg-green-50 border-green-400 text-green-700 ring-2 ring-green-200` |

- Icon is centered above the label.
- Label: `text-sm font-medium mt-2`.
- Selected state adds a `ring-2` + background fill + `scale-[1.02]` subtle zoom.

**Description**
- `Textarea`, required, 5 rows. Placeholder changes based on category:
  - AI: "Decrivez ce qui s'est passe, quel systeme IA est concerne, et l'impact observe..."
  - Privacy: "Decrivez la nature des donnees personnelles concernees, les personnes touchees, et les circonstances..."

**Submit Button**
- `Button variant="default"` (purple), full width on mobile, right-aligned on desktop.
- Label: "Signaler l'incident" / "Report incident" with `Send` icon.
- On submit: show loading spinner, then redirect to confirmation.

**Confirmation Page**
- Full-screen centered card after successful submission:
  ```
  +----------------------------------------------+
  |         [CheckCircle icon, 64px, green]      |
  |                                              |
  |      Incident signale avec succes            |
  |                                              |
  |      Numero: INC-2026-0042                   |
  |      Severite: Elevee                        |
  |                                              |
  |      Prochaines etapes:                      |
  |      1. Un responsable va triager            |
  |         l'incident sous 24h                  |
  |      2. Vous serez notifie de                |
  |         l'avancement                         |
  |      3. Vous pouvez suivre le statut         |
  |         dans le registre                     |
  |                                              |
  |  [Voir l'incident]  [Retour au registre]     |
  +----------------------------------------------+
  ```
- Incident number format: "INC-{year}-{sequential}" displayed prominently.

#### Global Access -- Floating Action Button

- A persistent "Signaler un incident" shortcut accessible from anywhere in the portal.
- **Implementation**: Add an icon button to the `AppHeader` component, placed between the language switcher and the notification bell.
- Icon: `AlertCircle` with a small `+` badge overlay.
- Tooltip: "Signaler un incident" / "Report an incident".
- Clicking navigates to `/incidents/new`.
- Visual treatment: `Button variant="ghost" size="icon"` with a subtle `text-destructive` color to signal urgency/importance.
- This is preferred over a floating FAB because it integrates cleanly with the existing header pattern and does not obscure content on mobile.

---

### C2. List Page (`/incidents`)

#### Layout

```
+--------------------------------------------------+
| PageHeader: "Registre des incidents"              |
|   actions: [+ Signaler un incident]               |
+--------------------------------------------------+
| Quick filter pills                                |
| [Tous (24)] [Critique (3)] [Eleve (7)]            |
| [Moyen (10)] [Faible (4)]                         |
+--------------------------------------------------+
| DataTable                                         |
| +------+------------------------------------+     |
| |      | Title   | Severity | Status | Date |     |
| | #### | ...     |          |        |      |     |
| | #### | ...     |          |        |      |     |
| +------+------------------------------------+     |
+--------------------------------------------------+
```

#### Quick Filter Pills

- `flex flex-wrap gap-2 mb-4`.
- Each pill is a `Button variant="outline" size="sm"` with `rounded-full`.
- Active pill: `variant="default"` (purple).
- Each pill shows the count in parentheses.
- "Tous" / "All" is always first.
- Severity pills include a small colored dot before the label (`inline-block w-2 h-2 rounded-full mr-1.5`).

#### Table Columns

| # | Column | Width | Rendering |
|---|---|---|---|
| 0 | Severity bar | `w-1` | Thick left border on the entire row: `border-l-4` with color matching severity (red/orange/amber/green). This is not a column but a CSS border on the `<tr>`. |
| 1 | Title + description | `flex-1` | Title as `font-medium text-sm`, incident type as `text-xs text-muted-foreground` below |
| 2 | Category | `w-[100px]` | Small icon (`Bot` or `ShieldAlert`) + "IA" or "Confidentialite" |
| 3 | Severity | `w-[110px]` | Colored `StatusBadge` with severity icon |
| 4 | Status | `w-[130px]` | Colored pill `StatusBadge` |
| 5 | Assigned to | `w-[48px]` | `Avatar` or `--` if unassigned |
| 6 | Date | `w-[100px]` | Relative date ("il y a 2h") with tooltip showing full datetime |
| 7 | Actions | `w-[48px]` | `MoreHorizontal` dropdown: View, Assign, Change severity |

- Default sort: severity descending (critical first), then date descending (newest first).
- Row click navigates to `/incidents/:id`.
- Row left border color mapping: critical = `border-l-red-500`, high = `border-l-orange-500`, medium = `border-l-amber-500`, low = `border-l-green-500`.

---

### C3. Detail Page (`/incidents/:id`)

#### Layout

```
+--------------------------------------------------+
| Breadcrumb: Incidents > INC-2026-0042             |
+--------------------------------------------------+
| Workflow Stepper (horizontal)                     |
| [1.Signale] [2.Triage] [3.Enquete] [4.Resolution]|
| [5.Resolu] [6.Post-mortem] [7.Ferme]             |
+--------------------------------------------------+
| +-------------------------------+  +------------+ |
| | Main content                  |  | Timeline   | |
| | (current step fields)        |  | sidebar    | |
| |                               |  |            | |
| |                               |  | 17 fev     | |
| |                               |  | 14:30      | |
| |                               |  | M. Dupont  | |
| |                               |  | a signale  | |
| |                               |  | l'incident | |
| |                               |  |            | |
| |                               |  | 17 fev     | |
| |                               |  | 15:45      | |
| |                               |  | J. Martin  | |
| |                               |  | a triage   | |
| |                               |  |            | |
| +-------------------------------+  +------------+ |
+--------------------------------------------------+
| Action buttons                                    |
| [Assigner]            [Passer a l'etape suivante] |
+--------------------------------------------------+
```

#### Workflow Stepper

- Horizontal stepper spanning full width.
- 7 steps representing the `status` enum: `reported`, `triaged`, `investigating`, `resolving`, `resolved`, `post_mortem`, `closed`.
- Step rendering:
  - **Completed**: green circle with `Check` icon, green connector line. Label: `text-green-700 font-medium`.
  - **Current**: blue circle with step number, blue ring (`ring-2 ring-blue-300`), blue connector on left, gray on right. Label: `text-blue-700 font-semibold`.
  - **Future**: gray circle with step number, gray connector. Label: `text-muted-foreground`.
- Circle size: `h-8 w-8`.
- Connectors: `h-0.5 flex-1 mx-1`.
- On mobile (< md): collapse to show only current step + progress indicator "Etape 3 / 7 -- Enquete".
- Steps are NOT clickable (linear workflow only).

#### Main Content Area

- `div` with `flex-1`.
- Shows the editable fields for the current workflow step.
- Each step reveals relevant fields:

| Step | Editable Fields |
|---|---|
| 1. Reported | Read-only summary of the initial report (title, category, severity, description, reporter, date) |
| 2. Triaged | Severity confirmation, assignment (owner select), impact description, affected count, priority, serious harm risk toggle |
| 3. Investigating | Root cause (textarea), contributing factors (multi-select chips), evidence (file upload placeholder) |
| 4. Resolving | Corrective actions (dynamic list -- add/remove items, each with title + description + deadline + status), resolution target date |
| 5. Resolved | Resolution date (auto-filled), resolution summary (textarea), verification confirmation (checkbox) |
| 6. Post-mortem | Post-mortem analysis (rich textarea), lessons learned (textarea), prevention recommendations |
| 7. Closed | Final summary (read-only), CAI notification status (if privacy incident), closure confirmation |

- Fields for non-current steps are visible but collapsed in accordion sections below the current step, displayed as read-only summaries.
- Current step fields are in a `Card p-6` with a `border-l-4 border-blue-500` left accent.

#### Timeline Sidebar

- `div` with `w-[300px] sticky top-6` on desktop, hidden on mobile (moves below main content as a collapsible section).
- Heading: "Chronologie" / "Timeline" with `Clock` icon.
- Each event is a timeline entry:
  ```
  [Dot]---[Date + time]
  |       [User avatar + name]
  |       [Action description]
  |       [Optional comment text]
  ```
- Dot: colored circle (`w-3 h-3 rounded-full`). Green for completed steps, blue for current, gray for system events.
- Vertical line connecting dots: `border-l-2 border-muted ml-1.5`.
- Events include: status changes, assignments, comments, severity changes.
- Most recent event at top.
- "Ajouter un commentaire" / "Add comment" textarea at the top of the timeline, with a `Send` button.

#### Action Buttons

- Sticky bottom bar (same pattern as wizard): `sticky bottom-0 bg-card border-t p-4 flex items-center justify-between`.
- Left: "Assigner" / "Assign" (`Button variant="outline"` with `UserPlus` icon). Opens a popover with the owner-select component.
- Right: "Passer a l'etape suivante" / "Advance to next step" (`Button variant="default"`, purple) with `ArrowRight` icon. Disabled if required fields for current step are not filled. Clicking advances `status` to the next enum value.
- If current step is "closed", no advance button. Show a "Rouvrir" / "Reopen" button in outline variant instead.
- Confirmation dialog (shadcn `AlertDialog`) before advancing: "Confirmer l'avancement a l'etape 'Enquete' ? Cette action sera enregistree dans l'historique." / "Confirm advancing to 'Investigating'? This action will be recorded in the history."

#### Loi 25 / Privacy Incident Banner

- If `category = 'privacy'` AND `serious_harm_risk = true`, show a prominent banner at the top of the main content:
  - `bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3`.
  - `AlertTriangle` icon in red.
  - Title: "Obligation de notification -- Loi 25" / "Notification obligation -- Law 25".
  - Description: "Cet incident implique un risque de prejudice serieux. La Commission d'acces a l'information (CAI) doit etre notifiee."
  - Status tracking: show `cai_notification_status` as a mini stepper: "A notifier" -> "Notifie" -> "Accuse de reception".
  - "Marquer comme notifie" button.

---

## Cross-Module UX Patterns

### Loading States

- **Page-level**: use the existing skeleton pattern from `DashboardPage` -- a `space-y-6` div with `bg-muted animate-pulse rounded` blocks matching the expected layout.
- **Table rows**: 5 skeleton rows with `h-14 bg-muted animate-pulse rounded` cells.
- **Cards**: skeleton cards with `h-28 bg-muted animate-pulse rounded-lg`.
- **Wizard steps**: skeleton for the form fields area only (the stepper renders immediately).

### Error States

- **API errors**: use shadcn `Sonner` (toast) for transient errors. Position: bottom-right. Duration: 5 seconds. Type: destructive (red).
- **Form validation**: inline errors below each field. Scroll to first error on submit.
- **Empty data**: use `EmptyState` component with contextual icon, title, description, and action button.

### Mobile Adaptations

| Desktop Pattern | Mobile Adaptation |
|---|---|
| DataTable with columns | Card list (one card per row, stacked vertically) |
| Sidebar score panel | Collapsible top bar |
| Horizontal stepper with labels | Compact stepper (dots only) with current step label below |
| Two-column form grids | Single column |
| Timeline sidebar | Collapsible section below main content |
| Filter bar with inline selects | Full-width stacked selects in a collapsible "Filtres" section |
| Quick action icons on hover | Always show `MoreHorizontal` dropdown |

### Accessibility (WCAG 2.1 AA)

- All colored badges include a text label (never color-only information).
- Risk gauges include the numeric score as text (not SVG-only).
- All interactive elements have visible focus rings (`outline-ring/50` already in global CSS).
- Tooltips have appropriate `aria-label` and `role="tooltip"`.
- Form fields use `htmlFor` linking labels to inputs.
- Radio/checkbox groups use `fieldset` + `legend` for screen readers.
- Color contrast: all text/background combinations meet 4.5:1 ratio (verified by using Tailwind's default -700 text on -50 backgrounds).
- Keyboard navigation: all stepper steps, filter pills, and toggle buttons are focusable and activatable with Enter/Space.

### Bilingual (fr/en) Strategy

- All user-facing strings go through `useTranslation()` with the module namespace: `aiSystems`, `risks`, `incidents`.
- Enum display values (system types, risk levels, statuses) are translated via the i18n JSON files, never hardcoded.
- Date formatting uses `date-fns` with locale import (`fr` or `enUS`) based on `i18next.language`.
- Pluralization uses i18next's `_one` / `_other` suffixes.
- New i18n namespaces to create: `aiSystems.json`, `risks.json`, `incidents.json` in both `fr/` and `en/` locale directories.

### Toasts & Notifications

| Action | Toast message | Type |
|---|---|---|
| Draft saved | "Brouillon sauvegarde" | success (green) |
| System created | "Systeme IA cree avec succes" | success |
| System updated | "Systeme IA mis a jour" | success |
| Assessment completed | "Evaluation terminee" | success |
| Incident reported | (redirects to confirmation page, no toast) | -- |
| Workflow advanced | "Statut mis a jour: {new status}" | success |
| Validation error | "Veuillez corriger les erreurs du formulaire" | error (red) |
| API error | "Une erreur est survenue. Veuillez reessayer." | error |

---

## Component Inventory (New Shared Components)

| Component | Location | Description |
|---|---|---|
| `DataTable` | `src/components/shared/DataTable.tsx` | Generic table with TanStack Table: sorting, filtering, pagination, row selection, responsive card mode |
| `FormWizard` | `src/components/shared/FormWizard.tsx` | Multi-step form container: step indicator, navigation, zod validation per step, auto-save |
| `RiskScoreGauge` | `src/components/shared/RiskScoreGauge.tsx` | Circular SVG gauge for 0-100 score with color by risk level. Props: `score`, `size` (sm/md/lg) |
| `OwnerSelect` | `src/components/shared/OwnerSelect.tsx` | Popover with search + avatar list for selecting org members |
| `ChipSelect` | `src/components/shared/ChipSelect.tsx` | Multi-select rendered as toggleable pill buttons with "select all" |
| `WorkflowStepper` | `src/components/shared/WorkflowStepper.tsx` | Horizontal stepper for linear workflows (incidents). Props: `steps`, `currentIndex` |
| `TimelinePanel` | `src/components/shared/TimelinePanel.tsx` | Vertical timeline with events (avatar, date, action, comment) |
| `SeverityPicker` | `src/portail/pages/incidents/SeverityPicker.tsx` | 4 large colored severity buttons (module-specific) |
| `ScorePanel` | `src/portail/pages/risks/ScorePanel.tsx` | Sticky sidebar with gauge + section breakdown (module-specific) |
