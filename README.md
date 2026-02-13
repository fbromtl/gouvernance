# Cercle de Gouvernance de l'IA

Site web du Cercle de Gouvernance de l'Intelligence Artificielle — une plateforme dédiée à la gouvernance responsable de l'IA.

## Technologies

- **React 19** + **TypeScript** — Framework frontend
- **Vite 7** — Build tool ultra-rapide
- **Tailwind CSS 4** — Framework CSS utilitaire
- **shadcn/ui** — Composants UI accessibles et personnalisables
- **Supabase** — Backend (formulaires de contact, newsletter)
- **Netlify** — Hébergement et déploiement

## Installation

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Remplir les valeurs VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY

# Lancer le serveur de développement
npm run dev

# Build de production
npm run build
```

## Configuration Supabase

Créer les tables suivantes dans votre projet Supabase :

```sql
-- Table des messages de contact
CREATE TABLE contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL,
  organisme TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des inscriptions newsletter
CREATE TABLE newsletter_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Activer RLS (Row Level Security)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre les insertions anonymes
CREATE POLICY "Allow anonymous inserts" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous inserts" ON newsletter_subscriptions FOR INSERT WITH CHECK (true);
```

## Déploiement Netlify

Le fichier `netlify.toml` est déjà configuré. Connectez votre dépôt Git à Netlify et ajoutez les variables d'environnement Supabase dans les paramètres du site.

## Structure du projet

```
src/
├── components/
│   ├── layout/          # Header, Footer, Layout
│   └── ui/              # Composants shadcn/ui
├── lib/
│   ├── supabase.ts      # Client Supabase
│   └── utils.ts         # Utilitaires (cn)
├── pages/
│   ├── HomePage.tsx      # Page d'accueil
│   ├── GouvernancePage.tsx    # Les 7 piliers
│   ├── ReglementationPage.tsx # Paysage réglementaire
│   ├── NormesPage.tsx         # Normes internationales
│   ├── FeuillesDeRoutePage.tsx # Feuilles de route
│   ├── DomainesPage.tsx       # Domaines d'application
│   ├── TendancesPage.tsx      # Tendances 2026-2027
│   └── ContactPage.tsx        # Contact
├── App.tsx               # Routing
├── main.tsx              # Point d'entrée
└── index.css             # Thème et styles globaux
```
