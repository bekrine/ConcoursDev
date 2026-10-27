# Pipeline d'Ingestion & Analyse des Épreuves — ConcoursDev Maroc

Ce document détaille le cycle de vie d'une annale de concours, de son référencement public jusqu'à l'indexation de ses questions.

## 1. Respect des Sources Officielles et Déontologie
- Seuls les documents rendus publiquement accessibles par les administrations organisatrices ou sur le portail national officiel (www.emploi-public.ma) sont ingérés.
- Aucun contournement de paywall, de CAPTCHA ou d'accès restreint n'est opéré.
- Chaque épreuve conserve l'URL source originelle, la date d'extraction et les notes d'intégrité.

## 2. Étapes du Pipeline

```
[URL PDF Officielle] 
       |
       v
(1) Validation Métadonnées
    - Extension valide (.pdf)
    - Taille maximale contrôlée (≤ 25 Mo)
    - Empreinte SHA-256 anti-doublon
       |
       v
(2) Détection du Format PDF
    +------------------------+-------------------------+
    |                                                  |
 [PDF Textuel Natif]                         [Scan Numérisé Image]
    |                                                  |
    v                                                  v
 (3a) Extraction directe                      (3b) Moteur OCR Tesseract 5
 Flux texte + mise en page                    Reconnaissance français & arabe
    |                                                  |
    +------------------------+-------------------------+
                             |
                             v
(4) Segmentation des Items de QCM
    - Détection de l'énoncé de la question
    - Extraction des choix (A, B, C, D)
    - Numéro de page associé
       |
       v
(5) Classification dans la Taxonomie des 6 Domaines
    - Algorithmique & POO, MERISE & BDD, Réseaux & Linux, etc.
    - Score de confiance attribué
       |
       v
(6) File d'Audit Humain (pending_review)
    - Validation par un réviseur agréé
    - Statut final : approved pour mise en ligne candidat
```

## 3. Gestion des Échecs et Résilience
En cas de fichier endommagé ou d'OCR ambigu, l'épreuve n'est jamais faussement étiquetée comme "vide". Elle est marquée avec le statut `requires_review` ou `failed` avec rapport d'anomalie visible dans la console d'audit.
