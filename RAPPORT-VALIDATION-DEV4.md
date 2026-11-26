# Rapport technique — COPO-IA 1.1.7 DEV4 / COPO-CNC 1.453

25 novembre 2026

## Sources du portage

- COPO-IA 1.1.6 DEV3 : `COPO-IA-1.1.6-DEV3-COMPLET(2).zip` transmis par l'utilisateur.
- COPO-CNC 1.453 : archive du commit Git `d14d61ae9dbaec65742f7ce639c8ae712c88601b` transmise par l'utilisateur.
- Projet 1.1.6 DEV3 non modifié ; l'arborescence produite est une copie complète avec le cœur natif 1.453.
- Conservation intégrale des neuf modules autonomes (un seul changement de numéro de version dans la présentation), fichiers annexes, bibliothèque et tests COPO-IA.
- Remplacement par les fichiers natifs 1.453 du moteur embarqué, des ressources, de `test.html`, du guide et des suites natives.
- Conservation des protections d'écriture / copie et de la clé commune des sélecteurs de fichiers `copo-ia-projects` héritées de DEV3.

## Contrôles exécutés

1. Les six suites automatisées COPO-IA passent : **42 contrôles validés** (7 + 4 + 9 + 6 + 4 + 12).
2. Tous les scripts JavaScript embarqués dans `index.html` passent l'analyse syntaxique Acorn.
3. Les neuf modules embarqués sont identiques à leurs fichiers sources autonomes.
4. Chromium : ouverture de l'application par injection HTML en mémoire, démarrage de l'assistant, lecture d'un projet de huit formes, accès à l'API projet native et à la passerelle ChatGPT. Aucune erreur JavaScript pendant ces essais.
5. Comparaison de 22 productions G-code sur six projets et onze types de post-processeurs au total : **22 sur 22 strictement identiques octet pour octet** entre COPO-CNC 1.453 original et cette édition COPO-IA, avec mêmes données et mêmes conditions d'exécution.

## Limites des essais

- Le navigateur Chromium de l'environnement interdit administrativement les navigations locales (`ERR_BLOCKED_BY_ADMINISTRATOR`). Les essais ont donc exécuté l'interface depuis une page HTML injectée en mémoire, et non par ouverture réelle du fichier depuis disque.
- La génération G-code a été comparée **à la même source native 1.453 exécutée dans les mêmes conditions**, ce qui vérifie l'absence de régression introduite par COPO-IA dans ces 22 cas ; cela **ne certifie pas** la validité machine du G-code.
- Les G-codes produits dans ce contexte de navigateur isolé ne coïncident pas tous avec les références `tests/attendus/` du dépôt, notamment en raison des conditions du navigateur et de calcul des parcours. Les tests natifs complets avec serveur HTTP, tâche de fond et Chromium autorisé n'ont pas pu être exécutés ici.
- Essais indispensables sur macOS Chrome : chargement et sauvegarde de fichiers réels `.copo` (anciens et nouveaux), contrôle des parcours calculés, création de copie, persistance paramétrique, prévisualisation / confirmation et non-régression sur un projet utilisateur.
- Aucune commande d'usinage réelle n'a été exécutée.

## Vérification de contenu

L'ensemble des fichiers du projet original DEV3 est présent dans cette archive ; les fichiers natifs 1.453 ont été ajoutés/remplacés ; les fichiers de développement COPO-IA sont conservés.
