# Design : Bibliothèque documentaire publique

> Date : 2026-02-27

## Contexte

La section "Guides et cadres de référence" de `/ressources` est remplacée par une bibliothèque documentaire structurée par juridiction. Les métadonnées (titre, résumé) sont visibles publiquement. L'accès aux fichiers nécessite une connexion.

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
- Utilisateur connecté → ouvre le fichier (URL signée Supabase, durée 1h)
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
| storage_path | text | Chemin dans Supabase Storage |
| summary_purpose | text | À quoi sert le document |
| summary_content | text | De quoi il est composé |
| summary_governance | text | Comment il sert la gouvernance IA |
| document_order | int | Ordre dans la catégorie |
| is_published | boolean | Visible publiquement |
| created_at | timestamptz | Date de création |
| updated_at | timestamptz | Dernière modification |

### RLS (Row Level Security)

- **SELECT** : tout le monde peut lire les métadonnées (WHERE is_published = true)
- **storage_path** : l'URL signée n'est générée que côté client après vérification auth

## Stockage des fichiers

- **Bucket Supabase Storage** : `public-documents` (nouveau, séparé du bucket `documents` privé)
- **Structure** : `{jurisdiction}/{category_slug}/{file_name}`
- **Accès** : bucket privé, URL signées (durée 1h) générées après authentification
- **Upload initial** : script de migration pour uploader les fichiers du dossier RAG local

## Flow d'authentification

1. Utilisateur non connecté clique "Consulter"
2. Dialog modal s'ouvre avec les options de connexion (Google OAuth + email/mot de passe)
3. Après connexion réussie, le modal se ferme
4. Le document s'ouvre automatiquement (URL signée générée)

Réutilise le composant de connexion existant dans un `Dialog` Shadcn.

## Ce qui ne change pas

- Les 3 autres sections de `/ressources`
- Le menu dropdown Ressources
- Le système de documents privé du portail (`/portail/documents`)
- L'auth et le flow de connexion existants
