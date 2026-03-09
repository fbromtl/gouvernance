# Refonte page Modèles de documents — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refondre la page `/modeles` avec une bannière d'accueil conditionnelle, des filtres horizontaux (catégorie, type, cadre), et suppression de la sidebar.

**Architecture:** Réécriture de ModelesBibliothequePage avec barre de filtres horizontale (Select dropdowns), bannière conditionnelle basée sur localStorage, et tracking du premier téléchargement dans TemplatePreviewSheet.

**Tech Stack:** React, TypeScript, shadcn/ui (Select, Badge, Button), Lucide icons, localStorage.

---

### Task 1: Ajouter getFrameworks() et getTypes() dans templates.ts

**Files:** Modify `src/lib/templates.ts`

Ajouter deux fonctions pour extraire les frameworks et types uniques depuis les templates.

### Task 2: Réécrire ModelesBibliothequePage

**Files:** Modify `src/portail/pages/ModelesBibliothequePage.tsx`, Delete `src/portail/components/templates/TemplateSidebar.tsx`

- Supprimer l'import et l'usage de TemplateSidebar
- Supprimer les pills mobile
- Ajouter state pour typeFilter et frameworkFilter
- Ajouter bannière conditionnelle (localStorage key: `gia-template-downloaded`)
- Ajouter barre de filtres horizontale avec 3 Select + recherche + compteur + reset
- Combiner tous les filtres en AND dans le useMemo

### Task 3: Tracker le téléchargement dans TemplatePreviewSheet

**Files:** Modify `src/portail/components/templates/TemplatePreviewSheet.tsx`

- Ajouter un onClick sur le bouton de téléchargement qui écrit dans localStorage
- Accepter un callback `onDownload` optionnel pour notifier la page parente

### Task 4: Vérification et commit

Build, commit, push.
