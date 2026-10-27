# Guide de Déploiement & Intégration Supabase — ConcoursDev Maroc

Ce guide détaille pas-à-pas la mise en production de **ConcoursDev Maroc** avec Supabase (PostgreSQL, Supabase Auth et Row Level Security) et son déploiement frontend.

---

## 1. Création & Configuration du Projet Supabase

1. Rendez-vous sur le tableau de bord officiel : [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Cliquez sur **New Project**.
3. Renseignez :
   - **Nom du projet** : `concoursdev-maroc`
   - **Mot de passe de la base de données** : Générez un mot de passe fort et conservez-le dans un gestionnaire sécurisé.
   - **Région Cloud** : Choisissez `Europe (Frankfurt)` ou `Europe (London)` pour une latence minimale depuis le Maroc.
   - **Plan** : Gratuit (*Free Tier*) ou Pro.
4. Patientez ~2 minutes pendant le provisionnement de l'instance PostgreSQL.

---

## 2. Application Sécurisée des Migrations SQL

Dans le tableau de bord Supabase, ouvrez l'onglet **SQL Editor** puis **New Query** :

### Étape 2.1 — Schéma Initial (22 Tables, Index et Contraintes)
Copiez-collez l'intégralité du fichier :
```sql
-- Exécuter le contenu de :
-- supabase/migrations/20261027_concoursdev_schema.sql
```
Cliquez sur **Run**. Cette migration crée l'extension `uuid-ossp`, les tables (`profiles`, `specialties`, `topics`, `exam_sources`, `extracted_questions`, `study_plan_generations`, `study_plan_items`, `quiz_attempts`, `user_topic_mastery`...), les contraintes et les index de performance.

### Étape 2.2 — Déclencheur d'Inscription Auth & Politiques RLS Renforcées
Ouvrez une nouvelle requête SQL et collez :
```sql
-- Exécuter le contenu de :
-- supabase/migrations/20261027_02_auth_and_rls_enhancements.sql
```
Cliquez sur **Run**. Cette migration :
- Attache la fonction déclencheur `public.handle_new_user()` sur `auth.users` : chaque nouvel utilisateur inscrit reçoit immédiatement son profil candidat synchronisé dans `public.profiles`.
- Active et configure les politiques RLS strictes en lecture, écriture et modification pour chaque candidat (`auth.uid() = user_id`).
- Rend le catalogue public des annales et des cours accessible en lecture sécurisée.

---

## 3. Configuration des Variables d'Environnement

Dans Supabase, accédez à **Project Settings** > **API** :
- **Project URL** : `https://<votre-id-projet>.supabase.co`
- **Project API Keys** > `anon` / `public` : copiez la clé publique.

Dans votre environnement local ou votre hébergeur (Vercel, Cloud Run, Netlify) :
```bash
cp .env.example .env
```
Renseignez les variables :
```env
PORT=3000
NODE_ENV=production

# Supabase (Variables Frontend Vite)
VITE_SUPABASE_URL=https://<votre-id-projet>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJh... (Votre clé publique anon)

# Ne JAMAIS inclure SUPABASE_SERVICE_ROLE_KEY dans le frontend
```

---

## 4. Configuration de Supabase Auth & Redirections

Dans Supabase > **Authentication** > **URL Configuration** :
1. **Site URL** :
   - En développement local : `http://localhost:3000`
   - En production : `https://ais-dev-t5ekb7cppiaixtnlk4j7px-446207989491.europe-west2.run.app` (ou votre domaine personnalisé).
2. **Redirect URLs** :
   - Ajoutez `http://localhost:3000/#auth-callback`
   - Ajoutez `http://localhost:3000/#reset-password`
   - Ajoutez `https://votre-domaine.ma/#auth-callback`
   - Ajoutez `https://votre-domaine.ma/#reset-password`
3. **Paramètres des emails** (optionnel) :
   - Dans **Authentication** > **Email Templates**, personnalisez l'email de confirmation et de récupération en français ou arabe selon vos préférences.

---

## 5. Vérification de la Sécurité & RLS

Pour vérifier que la sécurité des données est étanche :
1. Les tables contenant des données privées (`profiles`, `study_plan_generations`, `quiz_attempts`, `user_topic_mastery`) ont toutes `ROW LEVEL SECURITY` activé.
2. Un utilisateur ne peut jamais lire ou écrire les plans d'un tiers.
3. Les clés secrètes (`service_role`) ne figurent dans aucun fichier client.

---

## 6. Lancement en Local

```bash
# Installation des dépendances
npm install

# Exécution des tests unitaires, d'intégration et d'isolation
npm test

# Lancement du serveur Vite sur le port 3000
npm run dev
```
Accédez à l'application sur `http://localhost:3000`.

---

## 7. Compilation & Déploiement en Production

```bash
# Vérification du typage
npm run lint

# Exécution des tests automatisés
npm test

# Construction du bundle optimisé
npm run build
```
Les fichiers générés dans `/dist` peuvent être déployés sur tout serveur web ou CDN statique (Cloud Run, Vercel, Firebase Hosting, Netlify, Nginx).

---

## 8. Smoke Tests de Production

Après déploiement, effectuez cette séquence de vérification :
1. **Test Inscription** : Ouvrir l'application en navigation privée, cliquer sur "Connexion", renseigner un email et mot de passe, valider.
2. **Test Profil & Plan** : Lancer l'onboarding, choisir une spécialité et durée, générer le plan. Vérifier qu'il apparaît dans le tableau de bord et dans Supabase `study_plan_generations`.
3. **Test QCM** : Passer le quiz d'un chapitre, valider et vérifier le score et l'enregistrement dans `quiz_attempts`.
4. **Test Déconnexion / Reconnexion** : Se déconnecter, recharger la page, se reconnecter : la session et les données doivent être intactes.
5. **Test Isolation** : Créer un second utilisateur et vérifier qu'aucun plan du premier utilisateur n'est visible.

---

## 9. Sauvegarde des Données & Procédure de Rollback

### Sauvegarde
- Dans le tableau de bord Supabase > **Database** > **Backups**, activez les sauvegardes automatiques quotidiennes (disponibles en standard).
- Pour un dump manuel PostgreSQL :
  ```bash
  pg_dump -h db.<votre-projet>.supabase.co -U postgres -d postgres -F c -b -v -f backup_concoursdev.dump
  ```

### Rollback en cas d'incident
1. **Rollback Schéma** : En cas de migration défectueuse, les politiques RLS et triggers peuvent être rétablis en réexécutant les commandes `DROP POLICY` / `CREATE POLICY` définies dans `supabase/migrations/20261027_02_auth_and_rls_enhancements.sql`.
2. **Rollback Applicatif** : L'architecture de ConcoursDev Maroc intègre un **Fallback Hybride** : si les variables `VITE_SUPABASE_URL` ou `VITE_SUPABASE_PUBLISHABLE_KEY` sont temporairement vidées, l'application bascule automatiquement en mode local/démonstration sans aucune interruption de service pour les utilisateurs.
