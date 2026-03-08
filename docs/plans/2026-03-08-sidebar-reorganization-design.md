# Réorganisation du menu portail — Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Réorganiser le menu sidebar du portail pour le rendre intuitif pour un CTO/DPO/leader IA, et déplacer les items Organisation dans le dropdown profil.

**Architecture:** Restructuration de nav-config.ts (5 groupes au lieu de 5+Organisation), mise à jour de AppSidebar/AppIconRail, ajout d'items au dropdown profil dans AppHeader.

---

## Sidebar — 5 groupes

### 1. Tableau de bord (icône rail : LayoutDashboard)
- Dashboard → `/dashboard` | `LayoutDashboard`

### 2. Inventaire (icône rail : Bot)
- Systèmes IA → `/ai-systems` | `Bot`
- Cycle de vie → `/lifecycle` | `RefreshCw`
- Fournisseurs → `/vendors` | `Building2`
- Agents → `/agents` | `Bot`
- Traces agents → `/agent-traces` | `Activity`

### 3. Risques (icône rail : AlertTriangle)
- Risques → `/risks` | `AlertTriangle`
- Biais → `/bias` | `Scale`
- Incidents → `/incidents` | `AlertCircle`

### 4. Conformité (icône rail : ShieldCheck)
- Gouvernance → `/governance` | `Shield`
- Conformité → `/compliance` | `CheckCircle`
- Décisions → `/decisions` | `ClipboardCheck`
- Transparence → `/transparency` | `Eye`
- Monitoring → `/monitoring` | `Activity`
- Données → `/data` | `Database`

### 5. Ressources (icône rail : BookOpen)
- Documents → `/documents` | `FileText`
- Veille → `/veille` | `Newspaper` | badge "IA"
- Bibliothèque → `/bibliotheque` | `BookOpen`
- Modèles → `/modeles` | `Library`

## Profile dropdown (header top-right)

Ajouter au dropdown existant (séparé par divider) :
- Membres → `/membres` | `Users`
- Admin → `/admin` | `Building2`
- Facturation → `/billing` | `CreditCard`
- Roadmap → `/roadmap` | `Map`

## Fichiers impactés
- `src/portail/layout/nav-config.ts` — restructurer les groupes
- `src/portail/layout/AppSidebar.tsx` — adapter au nouveau config
- `src/portail/layout/AppIconRail.tsx` — mettre à jour les catégories
- `src/portail/layout/AppHeader.tsx` — ajouter items au dropdown profil
