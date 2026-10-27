# Pipeline IA & Contrôles de Qualité — ConcoursDev Maroc

## 1. Principes d'Intégration de l'Intelligence Artificielle
Dans ConcoursDev Maroc, l'IA est un **outil d'assistance à la classification et à l'explication**, jamais une autorité non supervisée :
1. **Zéro hallucination statistique** : les pourcentages d'apparition et les classements de matières sont calculés de manière purement déterministe via des requêtes SQL de comptage sur la base d'annales réelles.
2. **Statut de proposition** : tout corrigé ou explication suggéré par un modèle reçoit le label `ai_proposed_explanation` et doit être validé ou corrigé par un auditeur (`approved`).
3. **Isolation des clés API** : aucune clé privée d'IA n'est exposée au client frontend.

## 2. Validation Stricte des Schémas de Sortie
Toute sollicitation d'un modèle d'IA (via `@google/genai` côté serveur ou proxy sécurisé) utilise un schéma JSON rigoureux :
- Validation des types d'énoncés et d'options (A, B, C, D).
- Justification argumentée en français de la réponse correcte.
- Mention explicite des pièges fréquents dans les concours marocains.

## 3. Contrôle des Coûts & Mise en Cache
- Les classifications de questions sont persistées de manière permanente dans la table `extracted_questions`.
- Une même question extraite d'une annale n'est **jamais réanalysée plusieurs fois**.
- Si aucun fournisseur d'IA n'est configuré dans les variables d'environnement, l'application fonctionne à 100% avec les données d'annales d'amorçage vérifiées, les fiches de cours rédigées et la formule de priorisation mathématique.
