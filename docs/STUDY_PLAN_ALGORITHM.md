# Algorithme du Plan d'Études Dynamique — ConcoursDev Maroc

## 1. Principe Fondateur
Le plan d'études n'est jamais un planning générique fixe de 60 jours. Il est calculé dynamiquement à partir :
1. De la durée choisie (7, 15, 30, 60, 90 jours ou sur-mesure).
2. Du nombre d'heures réelles d'étude par jour (1h, 2h, 3h ou 4h).
3. Du grade visé (ex: Technicien 3ème grade / Échelle 9 vs Administrateur 2ème grade / Échelle 11).
4. Des coefficients et fréquences issues des annales marocaines vérifiées.
5. Du score diagnostique ou de l'historique des QCM du candidat.

## 2. Formule Mathématique de Priorisation

$$Score_{Priorite} = w_f \cdot S_{freq} + w_c \cdot S_{coeff} + w_m \cdot S_{match} + w_r \cdot S_{recence} + w_u \cdot S_{faiblesse}$$

Où :
- $S_{freq}$ = Pourcentage de présence dans les concours analysés (0 - 100).
- $S_{coeff}$ = Valeur normalisée du coefficient officiel (ex: Coeff 3 = 100, Coeff 2 = 66.6, Coeff 1 = 33.3).
- $S_{match}$ = Score d'affinité avec la spécialité (Développement, Réseaux, BDD).
- $S_{recence}$ = Poids chronologique ($1.0$ pour $\ge 2023$, $0.85$ pour $2022$, $0.70$ pour $< 2022$).
- $S_{faiblesse} = 100 - Score_{Maitrise}$ (favorise la révision des lacunes).

### Règle de Renormalisation Dynamique
Si l'arrêté officiel du concours ne spécifie pas de coefficient par matière :
$$w_c = 0$$
$$\sum w_{restants} = w_f + w_m + w_r + w_u = 0.35 + 0.20 + 0.10 + 0.10 = 0.75$$
Les nouveaux poids effectifs deviennent :
$$w_f' = \frac{0.35}{0.75} \approx 46.7\%, \quad w_m' = \frac{0.20}{0.75} \approx 26.7\%, \quad w_r' = \frac{0.10}{0.75} \approx 13.3\%, \quad w_u' = \frac{0.10}{0.75} \approx 13.3\%$$

## 3. Ordonnancement Pédagogique et Prérequis
Les chapitres sont ordonnés en respectant strictement les dépendances logiques (DAG - Directed Acyclic Graph) :
1. *Algorithmique de Base* avant *POO*.
2. *POO* avant *Modélisation UML*.
3. *SQL Fondamental* avant *MERISE (MCD / MLD)*.
4. *Architecture Web & HTTP* avant *Sécurité Applicative OWASP*.
5. *Modèle OSI & TCP/IP* avant *Adressage IPv4 & Sous-Réseaux*.

## 4. Jalon d'Examen Blanc (Concours Blanc)
Pour toute préparation d'au moins 15 jours, le dernier jour est sanctuarisé pour une simulation complète (*Concours Blanc*) sous chronomètre, reprenant les conditions réelles des concours du MEF ou de la DGSN.
