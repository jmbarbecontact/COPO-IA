# Portage expérimental vers COPO 1.453

Date : 24 novembre 2026.

## Périmètre

- Source native : `gbulleryahen-hash/copo` commit `d14d61ae9` (COPO 1.453).
- Extension : huit modules JavaScript intégrés depuis la branche publique COPO-IA 1.1.4.
- Les outils de l'extension, la passerelle ChatGPT manuelle, le protocole `project_11` et les aperçus sont préservés sous réserve de tests comportementaux.
- `projJSON()` reste **celui de COPO 1.453** pour conserver `tpData` compact, les grilles de relief régénérées et les nouvelles structures natives.
- `projSave()` reprend la sémantique de sauvegarde contrôlée de COPO-IA 1.1.4 et fournit le pont `COPO_IA_PROJECT_IO`.

## Contrôles déjà faits

11 contrôles statiques positifs : version, pack/unpack des parcours, relief, nombre de modules, pont de sauvegarde, unicité de la fonction de sauvegarde, présence de l'API CNC et de la passerelle.

**Limites :** impossibilité d'exécuter les tests Node / navigateur dans cette session ; aucun essai de réouverture d'un .copo 1.453 ni d'usinage réel. La 1.1.5 DEV2 est **absente du dépôt public** : ses changements ne sont pas intégrés. Il ne faut donc pas diffuser ce portage comme une version stable.

## Vérifications à effectuer avant fusion

1. Lancer les contrôles de syntaxe de tous les blocs `<script>` et les tests Node, en adaptant le test statique qui exige encore COPO 1.418.
2. Ouvrir `index.html` dans Chrome sur Mac, vérifier les modules et l'absence d'erreur console.
3. Ouvrir un projet COPO-IA 1.1.4, ajouter une forme et sa FAO puis faire une modification sélective `project_11`.
4. Sauvegarder une **copie** au format `.copo`, la rouvrir dans COPO 1.453 ; vérifier les géométries, outils, parcours et état calculé.
5. Tester un fichier créé nativement en 1.453 (outils bibliothèques, parcours nommés, `tpData`).
6. Reporter les évolutions propres à DEV2 à partir de ses fichiers sources, puis refaire la validation.

Ce document ne vaut pas validation fonctionnelle.
