# Journal des versions COPO-IA

## 1.1.4 BÊTA — 23 novembre 2026

- Les huit modules JavaScript de l'extension sont intégrés à `index.html` pour un démarrage local plus fiable, et restent disponibles séparément pour modification et audit.
- Niveau d'affichage du bouton flottant renforcé et message de diagnostic si le lanceur ne peut pas être initialisé.
- **Validé dans Chrome sur Mac** : présence du bouton, affichage de la version, chargement d'un projet de huit formes et six parcours, simulations, enregistrement d'une copie indépendante et aperçu avant/après d'une modification FAO sélective.
- Logiciel expérimental et simulation uniquement ; **pas de validation sur machine CNC**.

## 1.1.3 BÊTA — 23 novembre 2026

- Ajout de « Enregistrer le projet » et « Enregistrer une copie sous… » à la passerelle. L'extension `.copo` est obligatoire, les annulations et erreurs n'étant pas considérées comme des sauvegardes réussies.
- Aperçu FAO AVANT/APRÈS : profondeur, diamètre de fraise, passe, ordre, parcours créés / recalculés / conservés et segments XY indicatifs.
- 12 tests unitaires et 6 tests de sauvegarde ; nouvelles fonctions testées ensuite sur Mac dans la 1.1.4.

## 1.1.2 BÊTA — 23 novembre 2026

- Priorité d'affichage du bouton flottant et du panneau Assistant, y compris devant certains panneaux natifs COPO.

## 1.1.1 BÊTA — 23 novembre 2026

- Fenêtre de comparaison géométrique AVANT/APRÈS agrandie, avec confirmation bloquée tant que l'aperçu n'a pas été accepté.

## 1.1 BÊTA — 23 novembre 2026

- Action `project_11` : CAO + FAO en une commande avec vérification transactionnelle et confirmation explicite.
- Modification sélective et recalcul des seuls parcours concernés.
- Motifs répétitifs, profils intérieurs borgnes, ordre par fraise/profondeur.
- Portage des évolutions natives identifiées dans COPO 1.418, notamment le jeu radial de filetage.

## 1.0 BÊTA — 22 novembre 2026

- `multi_cam` : poches rectangulaires/arrondies, rainures oblongues et profils extérieurs non traversants.
- Test de trois parcours, simulation et conservation après réouverture dans COPO.

## 0.9 BÊTA — 22 novembre 2026

- FAO simulée des poches circulaires borgnes et rapprochement des boutons Vérifier / Confirmer.

## 0.8 BÊTA — 22 novembre 2026

- Formes libres nommées, identifiants stables, cercles, oblongs, polygones et motifs circulaires.

## 0.7.2 BÊTA — 22 novembre 2026

- Portage vers le moteur COPO récent et correction d'un cas FAO en présence de formes circulaires.

## 0.6 — novembre 2026

- Passerelle ChatGPT à copier-coller, commandes JSON, signatures de projets et validation explicite, sans API payante.
