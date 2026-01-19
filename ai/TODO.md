# TODO : Projet OCR Hybride (Mindee + Mistral)

## Phase 1 : Configuration Initiale

- [x] Installer les dépendances Drizzle : `bun add drizzle-orm better-sqlite3 && bun add -d drizzle-kit`
- [x] Installer les dépendances SQLite : `bun add -D @types/better-sqlite3`
- [x] Créer le fichier `.env` avec les variables requises :
  - `DATABASE_URL` (SQLite - optionnel, défaut: `.data/db.sqlite`)
  - `MINDEE_API_KEY`
  - `MISTRAL_API_KEY`
- [x] Créer le dossier `ai/` pour la documentation
- [x] Télécharger et référencer la documentation Skeleton UI dans `AGENTS.md`

## Phase 2 : Configuration Drizzle (SQLite)

- [x] Créer le schéma Drizzle dans `src/lib/db/schema.ts` avec les tables `documents` et `users` (SQLite)
- [x] Configurer `drizzle.config.ts` pour SQLite
- [x] Configurer le client Drizzle dans `src/lib/db/index.ts` (better-sqlite3)
- [x] Générer les migrations : `bun run db:generate`
- [x] Exécuter les migrations : `bun run db:migrate` (optionnel pour dev local)

## Phase 3 : Configuration Stockage Fichiers

- [x] Créer `src/lib/supabase-storage.ts` pour le stockage local (fichiers dans `.data/uploads/`)
- [x] Créer le dossier `.data/uploads/` automatiquement si nécessaire
- [ ] Configurer les headers pour servir les fichiers statiques (si besoin pour dev)

## Phase 4 : Backend - Actions Serveur

- [x] Créer l'action `uploadFile` dans `src/routes/+page.server.ts`
  - Recevoir l'image via FormData
  - Stocker localement dans `.data/uploads/`
  - Retourner le chemin du fichier
- [x] Créer l'action `processOCR` :
  - Router vers Mindee (docs officiels) ou Mistral selon le type
  - Créer la fonction de normalisation JSON
  - Retourner l'objet normalisé
- [x] Créer l'action `saveDocument` :
  - Recevoir les données validées
  - Insérer dans la table Drizzle (SQLite)

## Phase 5 : Frontend - Page d'Accueil

- [x] Créer `src/routes/+page.svelte` avec interface d'upload :
  - Input file avec `capture="environment"` pour la caméra
  - Toggle/boutons pour choisir le mode : "Doc Officiel" (Mindee) ou "Recette / Note" (Mistral)
  - État de chargement pendant upload et OCR
- [x] Créer `src/routes/+page.server.ts` avec les actions serveur

## Phase 6 : Frontend - Page de Validation

- [x] Créer `src/routes/validate/+page.svelte` avec layout deux colonnes :
  - Gauche : image scannée (fixe)
  - Droite : formulaire de validation (scrollable)
- [x] Implémenter le formulaire dynamique selon le type :
  - Type Facture/Officiel : Montant, Date, Type
  - Type Recette/Créatif : Titre, Temps, Ingrédients
  - Champ universel : textarea `full_text` éditable
  - [x] Bouton "Valider et Enregistrer" avec action `saveDocument` (à vérifier)
  - [x] Créer `src/routes/validate/+page.server.ts` si nécessaire

## Phase 7 : Intégration et Tests

- [x] Tester le flux complet : Upload → OCR → Validation → Sauvegarde
- [ ] Tester avec différents types de documents
- [ ] Vérifier les données stockées dans Drizzle DB (SQLite)
- [x] Tests unitaires pour les fonctions OCR
- [x] Tests E2E avec Playwright

## Phase 8 : Finalisation

- [x] Revoir le design (mobile-first, Skeleton UI, Tailwind)
- [x] Optimiser l'expérience utilisateur (états de chargement, erreurs)
- [x] Documentation technique
- [ ] Nettoyage du code
- [x] Lint et typecheck passants : `bun run lint && bun run check` (typecheck OK, lint OK - tous les problèmes résolus)

---

## Progrès Actuel

**Commits :**

- `feat: implement OCR flow with Mindee and Mistral` (feat/ocr-implementation)
  - Ajout des tests unitaires (10 tests ✅)
  - Ajout des tests E2E (4 tests ✅)
  - Amélioration UX (loading states, error handling ✅)
  - Correction bugs (Prettier, wrangler config ✅)

**Tests :**

- Unitaires : 12/12 passants ✅
- E2E : 4/4 passants ✅
- Lint : ✅
- Typecheck : ✅

---

**Note :** Suivre les conventions du projet (Svelte 5 avec runes, TypeScript strict, tests Vitest + Playwright, Skeleton UI)
