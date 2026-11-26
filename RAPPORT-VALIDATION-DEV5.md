# RAPPORT DE VALIDATION — COPO-IA 1.1.8 DEV5 / COPO-CNC 1.463

25 novembre 2026 — version de développement **non publiée**.

## Origine et intégration

- Source COPO-IA : archive DEV4 locale 1.1.7 (moteur COPO 1.453).
- Source moteur : archive officielle `copo-16701cdc83b2b3a2184a1ffa2080c0dc7681d6c7.zip`, commit `16701cdc83b2b3a2184a1ffa2080c0dc7681d6c7`, version 1.463.
- Copie intégrale du projet DEV4 puis superposition des ressources officielles 1.463, ajout des nouvelles ressources natives (dont langues).
- Deux points de raccordement avec COPO-IA : sauvegarde/chargement du projet protégés et passerelle `COPO_IA_PROJECT_IO`.
- Conservation des neuf modules COPO-IA, dont l'édition transactionnelle, les géométries et FAO libres, les relations paramétriques et le dialogue ChatGPT manuel.
- Identité du code source natif 1.463 contrôlée : hors raccordements explicites et insertion des modules de l'assistant, le contenu de `index.html` est strictement identique au fichier officiel.

## Tests effectivement réalisés

1. Comparaison de la source des neuf modules avec DEV4 : **9/9 identiques**, excepté le numéro de version d'interface et du message d'erreur du contrôleur.
2. Vérification de présence de tous les fichiers visibles de la DEV4 : **réussie** (aucune suppression).
3. Comparaison du moteur source à la version officielle 1.463 : **strictement identique**, hors les deux raccordements explicites et la section COPO-IA.
4. Analyse de syntaxe JavaScript des **16 scripts inline** par `node --check` : **réussie**.
5. Présence de la bibliothèque native, du système de traduction `lang/zh.js`, des projets tests et des ressources : **réussie**.
6. Vérification de création et ouverture du ZIP final : faite après empaquetage (voir validation d'archive ci-dessous).

## Tests non exécutés / limites

- Les **42 tests automatisés historiques** documentés dans DEV3 ne sont pas livrés sous forme de scripts exécutables dans l'archive DEV4. Leur réussite historique ne prouve pas leur réussite sous 1.463 : **non exécutés sur DEV5**.
- Le navigateur Chromium de cet environnement refuse l'ouverture `file://` (`ERR_BLOCKED_BY_ADMINISTRATOR`). L'injection HTML intégrale n'a pas terminé dans le délai du navigateur de test. **Initialisation de l'interface complète non validée ici**.
- Les 22 comparaisons de G-code effectuées sur DEV4/1.453 n'ont **pas** été reprises pour DEV5/1.463.
- Les tests de sauvegarde macOS, import/export, simulations sur projets réels, calques et reliefs restent nécessaires.
- **Aucun essai machine ni validation d'usinage réel**.

## Contrôles conseillés sur Mac

1. Décompresser et ouvrir `index.html` dans Chrome : vérifier `VERSION 1.1.8 DEV5 · COPO 1.463` et le lancement du panneau IA.
2. Charger un projet `.copo` connu, sauvegarder explicitement sous une **copie** (ne pas écraser l'original), rouvrir et comparer formes et parcours.
3. Tester le cycle d'une proposition IA : lire projet, produire aperçu, annuler, confirmer sur copie et vérifier les parcours.
4. Contrôler les fonctions natives apparues en 1.454–1.463 (export séparé G-code, calques, langues, filetage, reliefs) et les post-processeurs réellement utilisés.
5. Comparer les parcours et G-codes exportés à COPO-CNC 1.463 original avant tout essai sur CNC.

Ce portage est une **version expérimentale intégrale du code**, pas une certification de compatibilité fonctionnelle totale.
