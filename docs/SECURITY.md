# Sécurité & Protection des Données — ConcoursDev Maroc

## 1. Modèle de Menaces & Mesures de Défense

### A. Protection contre la Tricherie aux QCM
- **Côté Client** : Les réponses exactes (`correctOptionId`) et les explications ne sont **jamais envoyées** dans les payloads de questions transmises au navigateur du candidat.
- **Côté Serveur** : L'évaluation s'effectue au moment de la soumission du payload (`QuizService.submitQuizAttempt`).

### B. Isolation Stricte des Données Candidats (Row Level Security)
- Les politiques RLS PostgreSQL garantissent qu'un utilisateur `candidat_A` ne peut en aucun cas lire ou altérer les plans, notes ou historiques de `candidat_B`.
- Les administrateurs et auditeurs disposent de rôles spécifiques vérifiés côté serveur (`role = 'admin'`).

### C. Protection contre les Injections & Fichiers Malveillants
- Les fichiers PDF soumis pour ingestion font l'objet d'un contrôle de type MIME, de taille (≤ 25 Mo) et de structure.
- Aucun code extrait d'une annale (ex: script C, Java ou SQL) n'est exécuté dans l'environnement serveur ou client ; il est traité strictement comme chaîne textuelle statique.
- Les requêtes SQL vers la base de données utilisent des requêtes préparées avec variables liées.

### D. Conformité Légale (Loi 09-08 Maroc & RGPD)
- Droit d'accès et d'exportation intégrale des données candidat en JSON.
- Droit à l'effacement immédiat et irréversible des données locales et distantes.
- Minimisation des données collectées (aucun numéro CIN ou document d'identité requis pour l'entraînement).
