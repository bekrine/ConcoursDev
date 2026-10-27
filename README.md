# ConcoursDev Maroc 🇲🇦

Plateforme intelligente et transparente de préparation aux **concours de la fonction publique marocaine** pour les profils informatiques (*techniciens spécialisés 3ème grade, administrateurs, ingénieurs d'État*).

---

## 🌟 Fonctionnalités Clés

1. **Générateur Dynamique de Plan d'Études**
   - Calcul sur-mesure selon la spécialité (Développement, Réseaux, BDD, Sécurité), le niveau d'études (Bac+2 Échelle 9 à Bac+5 Échelle 11), la durée (7 à 90 jours) et le nombre d'heures réelles d'étude par jour (1h à 4h).
   - Aucun plan fixe artificiel : chaque jour est structuré (cours, exercices, QCM et révision).

2. **Pondération Mathématique Fondée sur les Annales Réelles**
   - Formule transparente : 35% fréquence dans les concours analysés, 25% coefficient officiel vérifié, 20% adéquation spécialité/grade, 10% récence des épreuves (2022-2024), 10% faiblesses du candidat.
   - Renormalisation dynamique quand un coefficient n'est pas spécifié dans l'arrêté.
   - Zéro hallucination statistique.

3. **Catalogue des Annales Officielles Dématérialisées**
   - Épreuves réelles indexées avec traçabilité complète de source (MEF, DGSN, Justice, ONDA, MTNRA).
   - Suivi du statut de numérisation (texte natif ou OCR Tesseract 5) et références de pages.

4. **Moteur d'Évaluation & QCM Chronométré**
   - Protection stricte des clés de correction : les bonnes réponses ne sont jamais envoyées au client avant la soumission.
   - Corrigé pas-à-pas avec explications didactiques et analyse des pièges classiques des concours marocains.
   - Célébration interactive et mise à jour de la maîtrise du candidat (0-100%).

5. **Console d'Audit & Administration**
   - File de relecture humaine des questions extraites (`pending_review`, `approved`, `needs_correction`, `rejected`).
   - Outil d'enregistrement de nouvelles épreuves avec contrôle anti-doublon.

6. **Conformité & Respect des Données Personnelles**
   - Exportation complète de l'historique en JSON (conformité Loi marocaine 09-08 / CNDP).
   - Réinitialisation et suppression de données en un clic.

---

## 🚀 Démarrage Rapide

```bash
# Installation des dépendances
npm install

# Lancement en mode développement
npm run dev

# Construction pour la production
npm run build
```

---

## 📚 Documentation Technique

- [Architecture du Système](docs/ARCHITECTURE.md)
- [Modèle de Données & Relations SQL](docs/DATABASE.md)
- [Algorithme de Priorisation & Ordonnancement](docs/STUDY_PLAN_ALGORITHM.md)
- [Pipeline d'Ingestion & OCR](docs/EXAM_INGESTION.md)
- [Pipeline IA & Validation des Schémas](docs/AI_PIPELINE.md)
- [Sécurité & Anti-Triche](docs/SECURITY.md)
- [Guide de Déploiement](docs/DEPLOYMENT.md)

---

## ⚖️ Avertissement Déontologique

ConcoursDev Maroc est un outil pédagogique indépendant et n'est affilié à aucune administration publique marocaine. La fréquence historique ne constitue pas une garantie d'apparition aux concours futurs.
