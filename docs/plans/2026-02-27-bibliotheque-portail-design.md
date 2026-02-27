# Design : Bibliothèque documentaire dans le portail

> Date : 2026-02-27

## Contexte

La bibliothèque documentaire (onglets juridiction, accordéons catégories, cartes documents) est actuellement intégrée directement dans la page publique `/ressources`. Elle doit être déplacée dans le portail authentifié comme page de fonctionnalité. La page `/ressources` publique conservera un aperçu du contenu (titres, résumés, badges) mais invitera à se connecter pour accéder aux documents — même principe que le diagnostic.

## Changements principaux

### 1. Nouvelle page portail `/bibliotheque`

- Position sidebar : section « Vue d'ensemble », après « Veille réglementaire »
- Icône : `BookOpen`
- Contenu : le composant `DocumentLibrary` existant, en mode portail (pas de soft-gate, bouton « Consulter » ouvre directement le fichier)

### 2. Page publique `/ressources` — version landing page

- La section `<DocumentLibrary />` est remplacée par `<DocumentLibraryPreview />`
- Affiche les mêmes données (titres, résumés, badges de type PDF/HTML) mais le bouton « Consulter » est remplacé par « Se connecter »
- Clic sur « Se connecter » → popup `LoginDialog` existant
- Après connexion → redirect vers `/bibliotheque`
- Les 3 autres sections (Boîte à outils, Veille réglementaire, Études de cas) restent intactes

### 3. Composant `DocumentLibrary` modifié

- Ajout d'une prop `mode?: "public" | "portail"` (défaut : `"portail"`)
- Mode portail : pas de `LoginDialog`, bouton « Consulter » ouvre `window.open(doc.file_url, "_blank")`
- Mode public : conserve le comportement soft-gate actuel (popup login, puis redirect)

## Fichiers concernés

| Action | Fichier | Description |
|--------|---------|-------------|
| Créer | `src/portail/pages/BibliothecPage.tsx` | Page portail enveloppant `DocumentLibrary` |
| Créer | `src/components/resources/DocumentLibraryPreview.tsx` | Version landing page pour `/ressources` |
| Modifier | `src/components/resources/DocumentLibrary.tsx` | Ajouter prop `mode` |
| Modifier | `src/pages/RessourcesPage.tsx` | Remplacer `<DocumentLibrary />` par `<DocumentLibraryPreview />` |
| Modifier | `src/portail/layout/AppSidebar.tsx` | Ajouter entrée « Bibliothèque » sous Vue d'ensemble |
| Modifier | `src/App.tsx` | Ajouter route `/bibliotheque` protégée |

## Sidebar — entrée ajoutée

```typescript
{
  key: "bibliotheque",
  path: "/bibliotheque",
  icon: BookOpen,
  ready: true,
}
```

Position : `sections.overview`, après l'entrée « veille ».

## Flow utilisateur

### Visiteur non connecté (page publique)

1. Arrive sur `/ressources`
2. Voit les onglets juridictions, les catégories, les titres et résumés des documents
3. Clique « Se connecter » sur un document
4. Popup `LoginDialog` s'ouvre (Google OAuth + email/mot de passe)
5. Après connexion → redirigé vers `/bibliotheque`

### Utilisateur connecté (portail)

1. Navigue vers « Bibliothèque » dans la sidebar (section Vue d'ensemble)
2. Voit les onglets juridictions, accordéons, cartes complètes
3. Clique « Consulter » → le document s'ouvre directement dans un nouvel onglet

## Ce qui ne change pas

- Les 3 autres sections de `/ressources` (Boîte à outils, Veille réglementaire, Études de cas)
- La page `/documents` existante du portail (documents internes de gouvernance)
- La table `public_documents` et ses données
- Le hook `usePublicDocuments`
- Le composant `LoginDialog`
- Les fichiers statiques dans `public/documents/`
