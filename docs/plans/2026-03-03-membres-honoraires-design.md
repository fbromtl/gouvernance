# Design — Page Membres Honoraires + Candidature

> Date : 2026-03-03
> Fichiers principaux : `MembresHonorairesPage.tsx`, `TarifsPage.tsx`, Edge Function `honorary-application`

---

## Objectif

Permettre à tout professionnel de l'IA de candidater pour devenir Membre Honoraire du Cercle, via une page dédiée avec formulaire de candidature. Les candidatures sont envoyées par email à l'admin pour review manuelle.

## Profil cible

Large spectre : consultants, chercheurs, ingénieurs, juristes, éthiciens, responsables data/IA — tout professionnel qui oeuvre dans le domaine de l'IA.

---

## Page `/membres-honoraires`

### Structure

1. **Hero** — Fond sombre (gradient comme les autres pages vitrine)
   - Titre : "Devenez Membre Honoraire"
   - Sous-titre : "Vous oeuvrez dans l'IA ? Rejoignez le Cercle et contribuez à façonner la gouvernance responsable de demain."

2. **Section "Pourquoi devenir Membre Honoraire ?"** — 3 cards
   - **Contribuez** : Partagez votre expertise, vos idées et vos retours d'expérience pour améliorer les pratiques de gouvernance IA
   - **Participez** : Intervenez lors d'événements, webinaires et ateliers du Cercle. Influencez la feuille de route du produit
   - **Accédez** : Accès complet à tous les modules du portail (niveau Expert), badge Honoraire, visibilité prioritaire dans l'annuaire

3. **Section "Qui peut candidater ?"** — Texte court décrivant le large spectre de profils acceptés

4. **Formulaire de candidature** — Champs :
   - Nom complet (requis)
   - Email professionnel (requis)
   - Poste / Titre (requis)
   - Organisation (requis)
   - Domaine d'expertise IA (select : NLP, Vision, MLOps, Éthique IA, Conformité, Data Science, Recherche, Autre) (requis)
   - Profil LinkedIn (optionnel)
   - Motivation — "En quelques lignes, comment souhaitez-vous contribuer au Cercle ?" (textarea, requis)
   - Bouton "Soumettre ma candidature"

5. **Confirmation** — Message de succès post-soumission ("Merci ! Votre candidature a été reçue. Notre équipe vous contactera sous 48h.")

---

## Banner Tarifs (remplace le banner actuel)

Le banner statique actuel est remplacé par une mini-card attractive :
- Fond dégradé slate subtil avec bordure
- Icône Award/Star
- Titre : "Membre Honoraire"
- Sous-titre : "Vous oeuvrez dans l'IA ? Contribuez au Cercle et accédez gratuitement à tous les modules."
- CTA : Button "Devenir Membre Honoraire →" vers `/membres-honoraires`

---

## Technique

### Fichiers à créer
- `src/pages/MembresHonorairesPage.tsx` — Page complète (hero + valeur + formulaire)
- `src/i18n/locales/fr/honorary.json` — Traductions FR
- `src/i18n/locales/en/honorary.json` — Traductions EN
- `supabase/functions/honorary-application/index.ts` — Edge Function envoi email

### Fichiers à modifier
- `src/App.tsx` — Ajouter route `/membres-honoraires`
- `src/pages/TarifsPage.tsx` — Remplacer le banner honoraire
- `src/i18n/index.ts` — Enregistrer namespace `honorary`
- `src/i18n/locales/fr/billing.json` — Mettre à jour `honoraryBanner`
- `src/i18n/locales/en/billing.json` — Idem

### Stack
- React Hook Form + Zod (validation formulaire)
- Edge Function Deno (envoi email admin)
- Framer Motion (animations page)
- i18next namespace `honorary`

### Pas de table Supabase
Les candidatures arrivent par email uniquement. Pas de stockage en BD — review manuelle par l'admin.

---

## Hors scope

- Dashboard admin pour gérer les candidatures (pour l'instant c'est par email)
- Workflow d'approbation automatisé
- Notification au candidat de l'acceptation/refus (fait manuellement)
