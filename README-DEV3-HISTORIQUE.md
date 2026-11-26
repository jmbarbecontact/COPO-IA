# COPO-IA 1.1.6 DEV3 — correctifs de validation et d’ergonomie

**Version de travail complète, hors publication GitHub. Le moteur COPO natif intégré reste la version 1.418.**

Cette archive contient le logiciel complet, les bibliothèques, images et ressources. Elle dérive de **COPO-IA 1.1.5 DEV2**, dont les tests utilisateur n° 4 à 13 ont été validés le 24 novembre 2026.

## Corrections nouvelles

1. `project_11` prend en charge les **transactions paramétriques seules**, y compris lorsque le plan comporte `features: { operations: [] }`, sans ajout de fausse opération `edit`. La validation des autres changements reste inchangée.
2. Les boîtes natives **Ouvrir un projet** et **Enregistrer une copie sous…** utilisent le même identifiant de dossier `copo-ia-projects`. Chrome peut ainsi rappeler le dernier dossier choisi, en fonction des permissions et du contexte local. Le choix de dossier reste contrôlé par l’utilisateur et le navigateur.
3. Nouveau test automatisé `tests-dev3/check_parametric.js` : vérification des relations aux quatre coins, au centre, parent-enfant, cycles, et vérification statique des correctifs.

## Installation Mac / Chrome

1. Décompresser l’archive ZIP entièrement.
2. Ouvrir **COPO-IA-1.1.6-DEV3/index.html** dans **Google Chrome** (pas le fichier depuis le ZIP).
3. Contrôler que l’Assistant affiche `VERSION 1.1.6 DEV3`.
4. Ouvrir une **copie** de `COPO-IA-DEV2-VALIDATION-FAO.copo`, en conservant l’original intact.
5. Générer un dossier JSON depuis « Passerelle ChatGPT » ; produire le plan correspondant à sa signature ; **Vérifier**, contrôler l’avant/après, **Confirmer** ; enfin sauvegarder une nouvelle copie.

## Limites réelles

- **Il ne s’agit pas d’un portage du moteur natif 1.453.** Les dernières fonctionnalités natives et son format `.copo` compact ne sont pas encore intégrés ni certifiés dans cette version.
- Ne jamais remplacer le fichier de référence DEV2 par un projet enregistré avec cette version.
- Les parcours FAO sont exclusivement des simulations. Aucun G-code machine n’est approuvé.
- La mémorisation du dernier dossier dépend de la prise en charge de `showOpenFilePicker` / `showSaveFilePicker` et des permissions de Chrome.

## Sources et crédits

COPO original : https://github.com/gbulleryahen-hash/copo (GNU GPL v3)  
COPO-IA : https://github.com/jmbarbecontact/COPO-IA (GNU GPL v3).  
Le projet ne requiert aucune clé API payante.
