# Architecture Technique — ConcoursDev Maroc

## 1. Vue d'ensemble du Système

**ConcoursDev Maroc** est conçu selon une architecture modulaire en couches, garantissant une séparation stricte des responsabilités entre la présentation, les services métiers, l'accès aux données et le moteur d'ingestion des annales de concours marocains.

```
+-------------------------------------------------------------------+
|                        FRONTEND (React 19 + Vite)                |
|  - Layout & Navigation responsive (Moroccan Public Service UI)   |
|  - 15 Vues complètes (Onboarding, Dashboard, Plan, Quiz, Admin)   |
|  - Composants graphiques de progression et métriques d'annales   |
+---------------------------------+---------------------------------+
                                  |
                                  v
+---------------------------------+---------------------------------+
|                        COUCHE DE SERVICES MÉTIERS                 |
|  1. ExamResearchService         : Recherche, catalogue & sources  |
|  2. DocumentProcessingService   : Pipeline PDF & routage OCR      |
|  3. QuestionExtractionService   : Segmentation & items QCM        |
|  4. TopicClassificationService  : Taxonomie 6 domaines / 28 chap. |
|  5. TopicStatisticsService      : Fréquences & métriques réelles  |
|  6. PriorityScoringService      : Formule transparente normalisée |
|  7. StudyPlanGeneratorService   : Calendrier journalier dynamique |
|  8. LessonService & QuizService : Contenus, QCM & protection clés |
|  9. ProgressService             : Maîtrise adaptative & faiblesses|
| 10. AdminReviewService          : File d'audit et validation      |
+---------------------------------+---------------------------------+
                                  |
                                  v
+---------------------------------+---------------------------------+
|                    PERSISTENCE & ACCÈS DONNÉES                     |
|  - DDL PostgreSQL / Supabase 22 tables avec Row Level Security     |
|  - Repository local typé (StorageService) avec synchronisation    |
|  - Données d'amorçage vérifiées des concours marocains 2019-2024  |
+-------------------------------------------------------------------+
```

## 2. Décisions d'Architecture Clés

### A. Algorithme de Priorisation Non Déterministe vs "Intuition IA"
Contrairement aux solutions qui interrogent un modèle de langage avec une requête floue, ConcoursDev Maroc calcule ses scores à partir des annales effectives répertoriées dans la base :
- **35% Fréquence** dans les concours analysés.
- **25% Coefficient officiel vérifié** (uniquement quand mentionné dans l'arrêté ministériel).
- **20% Adéquation spécialité / grade** (ex: Technicien 3ème grade vs Ingénieur d'État).
- **10% Récence** des sessions d'examens (bonification 2022-2024).
- **10% Faiblesses du candidat** (calculées après chaque QCM).

Si un coefficient officiel n'est pas publié, le système ne met pas 0 : il **renormalise les 4 autres poids** sur 100% pour préserver l'équité de la recommandation.

### B. Protection Stricte des Réponses de Quiz
Pour éviter la triche et garantir l'authenticité de l'évaluation :
- Le service de quiz filtre les propriétés `correctOptionId` et `explanation` avant d'envoyer la liste des questions au client.
- L'évaluation se fait lors de la soumission du payload complet.
- L'historique des tentatives est stocké avec horodatage et score d'exactitude.

### C. Préservation des Jours Déjà Réalisés
Lorsqu'un candidat met à jour ses disponibilités (ex: passe de 30 jours à 45 jours) ou ses faiblesses, le générateur régénère **uniquement les jours restants** et conserve l'intégralité des tâches et quiz déjà validés.
