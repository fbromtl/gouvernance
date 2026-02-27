# Design : Bibliothèque documentaire publique

> Date : 2026-02-27 (v2 — approche fichiers statiques)

## Contexte

La section "Guides et cadres de référence" de `/ressources` est remplacée par une bibliothèque documentaire structurée par juridiction. Les métadonnées (titre, résumé) sont visibles publiquement. L'accès aux fichiers est soft-gaté (popup de connexion côté UI, fichiers techniquement publics pour le SEO).

Source de données : dossier RAG local avec 5 juridictions (Québec, Canada, Europe, France, USA), chacune contenant des catégories thématiques et des documents PDF/HTML.

## Emplacement

- Remplace la 1ère section de `/ressources` ("Guides et cadres de référence")
- Même position dans la page, même lien dans le menu dropdown Ressources
- Les 3 autres sections (Boîte à outils, Veille réglementaire, Études de cas) restent intactes

## Navigation

5 onglets horizontaux au-dessus du contenu :

- **Québec** (défaut) | **Canada** | **Europe** | **France** | **USA**

Chaque onglet charge les catégories et documents de la juridiction sélectionnée.

## Structure du contenu

### Par onglet (juridiction)

Catégories affichées en **accordéons** :
- En-tête : nom de la catégorie + nombre de documents + description courte
- Contenu déplié : liste des documents en cartes

### Par document (carte)

Visible publiquement :
- Titre du document
- Icône par type (PDF, HTML/web)
- Résumé structuré :
  - *À quoi sert ce document*
  - *De quoi il est composé*
  - *Comment il sert la gouvernance IA* (contextualisé par juridiction)
- Badge de la juridiction

Bouton **"Consulter"** :
- Utilisateur connecté → ouvre le fichier directement (URL statique)
- Utilisateur non connecté → popup de connexion rapide (modal Dialog)

## Modèle de données

### Table `public_documents` (Supabase)

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid, PK | Identifiant unique |
| jurisdiction | text | 'quebec', 'canada', 'europe', 'france', 'usa' |
| category_slug | text | ex: '01-declaration-montreal' |
| category_name | text | ex: 'Déclaration de Montréal' |
| category_description | text | Description courte de la catégorie |
| category_order | int | Ordre d'affichage de la catégorie |
| title | text | Titre du document |
| file_name | text | Nom du fichier original |
| file_type | text | 'pdf' ou 'html' |
| file_url | text | URL relative : `/documents/quebec/01-declaration-montreal/fichier.pdf` |
| summary_purpose | text | À quoi sert le document |
| summary_content | text | De quoi il est composé |
| summary_governance | text | Comment il sert la gouvernance IA |
| document_order | int | Ordre dans la catégorie |
| is_published | boolean | Visible publiquement |
| created_at | timestamptz | Date de création |
| updated_at | timestamptz | Dernière modification |

### RLS (Row Level Security)

- **SELECT** : tout le monde peut lire les métadonnées (WHERE is_published = true)

## Stockage des fichiers

- **Fichiers statiques** dans `/public/documents/{jurisdiction}/{category_slug}/{file_name}`
- Servis par Netlify CDN (gratuit, rapide, indexable par Google)
- URLs stables et permanentes : `votresite.com/documents/quebec/.../fichier.pdf`
- **Coût supplémentaire : 0 $**

### Ajouter un document

1. Déposer le fichier dans `/public/documents/{juridiction}/{catégorie}/`
2. Ajouter une ligne dans la table `public_documents` (via dashboard Supabase ou script)

## Flow d'authentification (soft gate)

1. Utilisateur non connecté clique "Consulter"
2. Dialog modal s'ouvre avec les options de connexion (Google OAuth + email/mot de passe)
3. Après connexion réussie, le modal se ferme
4. Le document s'ouvre automatiquement (URL statique)

Réutilise le composant de connexion existant dans un `Dialog` Shadcn.

**Note :** Les fichiers sont techniquement publics (accessibles par URL directe), mais l'UX guide l'utilisateur vers la connexion. Cela permet le SEO tout en incitant à l'inscription.

## Ce qui ne change pas

- Les 3 autres sections de `/ressources`
- Le menu dropdown Ressources
- Le système de documents privé du portail (`/portail/documents`)
- L'auth et le flow de connexion existants
