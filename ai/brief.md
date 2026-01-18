Voici le **Cahier des Charges (CDC)** complet et structuré, prêt à être copié-collé dans une IA génératrice de code (comme ChatGPT, Claude, ou v0) pour générer ton projet SvelteKit.

---

# Cahier des Charges : Projet OCR Hybride (Mindee + Mistral)

## 1. Vue d'ensemble

**Objectif :** Créer une application web SvelteKit permettant de scanner des documents via upload ou caméra, de les traiter avec l'OCR adapté (Mindee ou Mistral), de valider manuellement les données et de stocker le tout dans une base de données propre.

**Stack Technique :**

- **Frontend :** SvelteKit (TypeScript), TailwindCSS.
- **Backend/DB :** Supabase (PostgreSQL + Storage + Auth).
- **Services Externes :** Mindee API (Docs officiels), Mistral AI API (Recettes/Textes libres).

---

## 2. Configuration de l'Environnement

- [ ] Initialiser un projet SvelteKit avec les options : Skeleton project, TypeScript, ESLint, Prettier, Playwright.
- [ ] Installer et configurer TailwindCSS.
- [ ] Installer les dépendances Supabase : `npm install @supabase/supabase-js`.
- [ ] Créer un fichier `.env` pour les variables d'environnement :
  - `PUBLIC_SUPABASE_URL`
  - `PUBLIC_SUPABASE_ANON_KEY`
  - `MINDEE_API_KEY`
  - `MISTRAL_API_KEY`

---

## 3. Architecture Base de Données (Supabase)

- [ ] Créer un bucket de stockage nommé `documents` (accès public pour lire, privé pour écrire).
- [ ] Créer une table SQL `documents` avec les colonnes suivantes :
  - `id` (uuid, primary key, default uuid_generate_v4())
  - `user_id` (uuid, references auth.users)
  - `file_path` (text) -- Chemin de l'image dans le bucket.
  - `provider` (text) -- 'mindee' ou 'mistral'.
  - `doc_type` (text) -- 'facture', 'cni', 'recette', 'autre'.
  - `metadata` (jsonb) -- Contient les données structurées (ex: montant, ingrédients).
  - `full_text` (text) -- Le texte complet validé par l'humain.
  - `status` (text) -- 'validated'.
  - `created_at` (timestamp, default now()).

---

## 4. Backend : Actions Serveur (SvelteKit Server Actions)

### 4.1. Upload de fichier

- [ ] Créer une action `+page.server.ts` nommée `uploadFile`.
- [ ] Elle doit recevoir un `FormData` contenant l'image.
- [ ] Uploader l'image dans le bucket Supabase `documents`.
- [ ] Retourner l'URL publique de l'image au frontend.

### 4.2. Traitement OCR Intelligent (Le Routeur)

- [ ] Créer une action `processOCR`.
- [ **Entrée** ] : URL de l'image et `category` ('official' ou 'creative').
- [ **Logique Routage** ] :
  - SI `category === 'official'` -> Appeler **Mindee API** (endpoint `invoices` ou `financial`).
  - SINON -> Appeler **Mistral API** (modèle `pixtral-12b` ou `mistral-large`).
- [ **Prompt Mistral (si creative)** :
  > "Tu es un OCR expert. Analyse cette image. Retourne UNIQUEMENT un JSON valide avec : { titre, temps_preparation, ingredients (array), instructions, type_document }. Pas de markdown."
- [ **Normalisation** : Créer une fonction interne pour transformer les réponses brutes en un format JSON commun :
  ```json
  {
    "provider": "...",
    "type": "facture|recette|...",
    "data": { ...champs spécifiques... },
    "raw_text": "..."
  }
  ```
- [ ] Retourner cet objet normalisé au frontend.

### 4.3. Sauvegarde Finale

- [ ] Créer une action `saveDocument`.
- [ ] Recevoir les données du formulaire validé (y compris le texte modifié par l'humain).
- [ ] Insérer les données dans la table `documents` de Supabase.

---

## 5. Frontend : Interface Utilisateur

### 5.1. Page d'Accueil / Capture

- [ ] Créer une interface d'upload simple avec :
  - Un bouton `<input type="file" accept="image/*" capture="environment">`.
  - Deux boutons/toggle pour choisir le mode : **"Doc Officiel"** (Mindee) ou **"Recette / Note"** (Mistral).
- [ ] Afficher un état de chargement pendant l'upload et l'OCR.

### 5.2. Page de Validation (Cœur du système)

- [ ] Créer un layout en deux colonnes (responsive) :
  - **Gauche :** Affichage de l'image scannée (fixe).
  - **Droite :** Formulaire de validation (scrollable).
- [ ] **Formulaire Dynamique** (Conditionnel selon le type de document) :
  - _Si Type Facture/Officiel :_
    - Input Montant (bindé aux données OCR).
    - Input Date.
    - Select Type (Facture, CNI, Impôt).
  - _Si Type Recette/Créatif :_
    - Input Titre.
    - Input Temps de préparation.
    - Textarea Ingrédients.
- [ ] **Champ Universel :**
  - Une grande zone `<textarea>` pour le texte complet (`full_text`). Doit être pré-rempli avec l'OCR et **éditable**.
- [ ] Bouton "Valider et Enregistrer" qui déclenche l'action `saveDocument`.

---

## 6. Instructions pour l'IA Développeur

- Utilisez les **SvelteKit Server Actions** (`use:enhance`) pour gérer les formulaires.
- Pour Mindee, utilisez la librairie `node-fetch` ou native `fetch` côté serveur.
- Pour Mistral, assurez-vous que la réponse est parsée en JSON valide avant de l'envoyer au frontend (gérer les erreurs de parsing).
- Ne pas implémenter d'authentification complexe pour le MVP, considérez l'utilisateur comme connecté ou utilisez la clé Anon de Supabase.
- Le design doit être épuré, mobile-first, utilisant les classes utilitaires de Tailwind.
