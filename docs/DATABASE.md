# Modèle de Données & Relations — ConcoursDev Maroc

Ce document décrit le schéma relationnel complet (PostgreSQL / Supabase) déployé dans `supabase/migrations/20261027_concoursdev_schema.sql`.

## 1. Vue d'Ensemble des Entités

Le système repose sur **22 tables relationnelles** assurant la traçabilité complète des annales, de l'extraction des questions, des plans d'études et des performances des candidats.

| Table | Rôle & Contenu | Clés & Index |
| :--- | :--- | :--- |
| `profiles` | Profil du candidat (spécialité, niveau, heures/jour, diagnostic) | PK `id (UUID)`, RLS utilisateur |
| `specialties` | Spécialités IT (Dév, Réseaux, BDD, Cybersécurité) | PK `id (TEXT)`, Code UNIQUE |
| `academic_levels` | Niveaux d'études (Bac+2 Technicien 3ème grade, Licence, Bac+5) | PK `id (TEXT)`, Code UNIQUE |
| `competitions` | Arrêtés officiels des concours de recrutement | FK `specialty_id`, `academic_level_id` |
| `exam_sources` | Catalogue des épreuves réelles (MEF, DGSN, Justice, etc.) | Index sur `(specialty_id, level_id, year)` |
| `exam_documents` | Pointers de stockage et empreintes cryptographiques SHA-256 | FK `exam_source_id` |
| `document_processing_jobs` | File de tâches asynchrones d'ingestion et OCR | Enum `status`, retries, timestamps |
| `topics` | Taxonomie des chapitres et relations de prérequis (DAG) | PK `id (TEXT)`, Domain ID |
| `extracted_questions` | Banques de questions issues des annales (page, options, corrigé) | Clé de correction protégée côté serveur |
| `question_topic_mappings` | Association M:N questions-matières | FK `question_id`, FK `topic_id` |
| `topic_statistics` | Fréquences et métriques réelles calculées sur l'échantillon | FK `topic_id`, PK |
| `lessons` | Cours et fiches techniques en français avec astuces concours | FK `topic_id` |
| `exercises` | Exercices d'application et code snippets | FK `lesson_id` |
| `quiz_questions` | Liaison ordonnée entre quiz et questions | Composite index |
| `study_plan_generations` | Entête et métadonnées du plan personnalisé généré | FK `user_id`, RLS |
| `study_plan_items` | Tâches journalières (jour, durée, statut, score) | UNIQUE `(study_plan_id, day_number)` |
| `quiz_attempts` | Évaluations soumises par le candidat (durée, score %) | FK `user_id`, Index sur `topic_id` |
| `attempt_answers` | Réponses détaillées question par question | FK `attempt_id`, FK `question_id` |
| `user_topic_mastery` | Taux de maîtrise par matière (0-100%) | UNIQUE `(user_id, topic_id)` |
| `study_progress` | Historique de révision et calcul des séries (streaks) | FK `user_id` |
| `content_review_queue` | File de validation pour les auditeurs et réviseurs | Statut d'approbation humaine |
| `audit_logs` | Journal d'audit de sécurité et modifications de questions | Actions, user_id, timestamps |

## 2. Sécurité et Isolation des Données (Row Level Security - RLS)

Chaque table contenant des données privées de candidats est protégée par RLS :
- Un candidat ne peut interroger ou modifier que les enregistrements où `auth.uid() = user_id`.
- Les tables du catalogue public (`specialties`, `exam_sources`, `lessons`) sont accessibles en lecture seule pour tous les utilisateurs authentifiés.
- Les champs sensibles comme `correct_option_id` sont masqués des requêtes de préparation avant la validation effective du QCM.
