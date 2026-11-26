# COPO-IA 1.1.7 DEV4 — Portage vers le moteur COPO-CNC 1.453

Version de développement complète dérivée de COPO-IA 1.1.6 DEV3 et de COPO-CNC 1.453, commit `d14d61ae9dbaec65742f7ce639c8ae712c88601b` du 24 novembre 2026.

## Démarrage

Décompresser le ZIP entier puis ouvrir `index.html` avec Chrome sur Mac. L’Assistant doit afficher **VERSION 1.1.7 DEV4 · COPO 1.453**.

## Portage

- Remplacement du moteur, des styles, panneaux et sous-systèmes natifs par ceux de COPO-CNC 1.453 (sans conserver l'ancien coeur 1.418).
- Conservation des neuf modules COPO-IA, de leurs fichiers sources, de la passerelle ChatGPT, des tests et de la bibliothèque.
- Rétablissement de l'accès à l'enregistrement natif et de l'identifiant commun `copo-ia-projects` dans les sélecteurs Chrome ; copie indépendante avec suffixe et messages d'échec explicites.
- La sauvegarde native repose désormais sur la sérialisation COPO 1.453 (parcours FAO compacts, reliefs).
- Le projet d'origine DEV3 est préservé sans modification.

## Validation et limites

Voir `RAPPORT-VALIDATION-DEV4.md` pour les tests réellement exécutés. Une suite ancienne qui exige littéralement 1.418 ne constitue pas une preuve d'incompatibilité avec 1.453 ; elle doit être adaptée. Tester la lecture/sauvegarde de projets réels sur Chrome/macOS avant toute mise en production. Aucun parcours G-code n'est certifié pour une machine réelle.

COPO original : https://github.com/gbulleryahen-hash/copo — GNU GPL v3.
COPO-IA : https://github.com/jmbarbecontact/COPO-IA — GNU GPL v3.
