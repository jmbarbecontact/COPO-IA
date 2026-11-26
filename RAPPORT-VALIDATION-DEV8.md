# Rapport de validation — COPO-IA 1.1.11 DEV8 / COPO-CNC 1.471

## Provenance
- Base de travail : COPO-IA DEV7 / moteur officiel COPO-CNC 1.464, non publiée.
- Source amont : archive officielle COPO-CNC 1.471, commit `be7f2d18e9901aefe34993297a857e642ff0e08d`.

## Intégration
- 45 régions de modifications entre les moteurs natifs 1.464 et 1.471 appliquées au code DEV7.
- Comparaison du résultat avec le moteur 1.471 natif : seules les huit régions propres à COPO-IA demeurent distinctes.
- Les neuf modules de COPO-IA conservent exactement leur code DEV7, à l'exception de l'étiquette de version.
- Conservation du mécanisme IndexedDB `COPO_PROJECT_DIR_ID` (dernier dossier des projets).
- Mise à jour des sources natives `test.html`, `guide.html`, documentation PDF et métadonnées linguistiques disponibles.
- Aucun fichier préexistant supprimé.

## Contrôles réellement exécutés
- Analyse syntaxique Node.js des 16 scripts JavaScript intégrés : **16/16 réussis**.
- Présence des composants IA et du sélecteur du dossier : **OK**.
- Signature du moteur et libellé affiché : **1.471 et DEV8**.
- Contrôle d'intégrité de l'archive finale : **OK**.

## Contrôles restant à effectuer
- Essai de démarrage en navigateur : tentative Chromium headless interrompue, **non validé**.
- Essais fonctionnels `project_11`, recalcul FAO, export, ouverture/sauvegarde des projets, raccourcis macOS et mémorisation du dossier **non effectués sur cette version**.
- Comparaison fonctionnelle G-code contre le moteur amont 1.471 **non effectuée**.
- Simulation de la gravure en V sur relief, incrustation, surcote et reprise de matière **non effectuée**.
- Les 42 tests historiques ne sont pas présents ici sous forme de suite exécutable ; **ne pas les annoncer comme passés**.

Cette version est un portage de code avec contrôles statiques, **pas une certification de fonctionnement sur machine CNC**.
