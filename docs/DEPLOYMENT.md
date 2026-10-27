# Guide de Déploiement — ConcoursDev Maroc

Ce guide détaille la mise en production de **ConcoursDev Maroc** sur une architecture à faible coût et haute disponibilité.

## 1. Prérequis & Environnement
- **Node.js** version 20 LTS ou supérieure.
- **Gestionnaire de paquets** : npm ou pnpm.
- **Base de données** : Instance PostgreSQL 15+ ou projet Supabase gratuit / développeur.

## 2. Déploiement Local / Développement
```bash
# 1. Cloner le projet et installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env

# 3. Lancer le serveur de développement Vite
npm run dev

# 4. Ouvrir l'application dans votre navigateur
# http://localhost:3000
```

## 3. Déploiement de la Base de Données (Supabase / PostgreSQL)
1. Créer un projet sur [Supabase](https://supabase.com).
2. Ouvrir l'éditeur SQL dans le tableau de bord Supabase.
3. Exécuter le fichier de migration :
   ```sql
   -- Contenu de : supabase/migrations/20261027_concoursdev_schema.sql
   ```
4. Copier l'URL du projet et la clé anonyme `anon` dans vos variables d'environnement :
   ```env
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_ANON_KEY=votre_cle_anon_publique
   ```

## 4. Construction et Mise en Production du Frontend
```bash
# Compilation optimisée des bundles statiques
npm run build

# Prévisualisation locale du bundle de production
npm run preview
```
Les artefacts générés dans `/dist` peuvent être hébergés gratuitement sur Vercel, Netlify, Cloudflare Pages ou Firebase Hosting.
