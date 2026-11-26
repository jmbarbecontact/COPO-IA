# COPO-IA 1.1.11 DEV8 — intégration COPO-CNC 1.471

- Report des 45 régions de modifications natives de COPO-CNC 1.464 à 1.471 dans la base DEV7, sans remplacer l’extension COPO-IA.
- Évolutions amont 1.465 à 1.471 : surcote et finition, rétablissement des liens de parcours, incrustations et gravure en V, performances, commandes du pavé tactile macOS.
- Conservation intégrale du code des modules IA (hormis libellé de version) et du stockage IndexedDB du dossier de projets.
- Mise à jour des pages de test, guide et documentation native fournies par COPO-CNC 1.471.
- Voir `RAPPORT-VALIDATION-DEV8.md` pour les tests réellement passés.

## DEV7 — COPO-IA 1.1.10 / COPO-CNC 1.464 (26 novembre 2026)

- Mise à jour exacte du moteur COPO 1.463 vers 1.464 (commit `eff2eb0caf388de54f426028006dc0fcc1e0c078`).
- Correction native de gravure en V projetée sur relief, avec maintien des paliers intermédiaires.
- Conservation des neuf modules COPO-IA et du dossier de projet mémorisé de DEV6.
- Version de développement non publiée ; validation fonctionnelle sur Mac et tests de FAO sur relief à confirmer.

## 1.1.9 DEV6 — dossier projets mémorisé
- Sélecteur explicite du dossier de projets (menu Fichier et panneau COPO-IA).
- Conservation du handle de dossier dans IndexedDB et réutilisation par ouverture / Enregistrer sous (`startIn`).
- Conservation de la logique d’enregistrement direct sur fichier déjà ouvert (Ctrl+S).
- Fallback sans dossier si le navigateur refuse un ancien handle.
- Moteur COPO-CNC 1.463 inchangé.

# 1.1.8 DEV5 — Portage vers COPO-CNC 1.463

- Intégration du moteur natif 1.463 et des ressources officielles, dont `lang/zh.js`.
- Conservation des neuf modules COPO-IA issus de DEV4 et du contrôle de démarrage.
- Report de la politique de sauvegarde de projets DEV4 (copie explicite, refus silencieux interdit, dossier mémorisé).
- Conservation de la passerelle `COPO_IA_PROJECT_IO`.
- Mise à jour du numéro affiché.

# Journal des versions

## 1.1.7 DEV4 — 25 novembre 2026
- Portage du moteur natif COPO-CNC 1.418 vers 1.453 (commit d14d61a).
- Préservation des neuf modules COPO-IA 1.1.6 DEV3 et des mécanismes de projets et dialogue.
- Alignement de la sauvegarde et ouverture natives sur les correctifs DEV3, avec sérialisation 1.453.
- Intégration des ressources et tests COPO-CNC 1.453.

# Journal des versions

## 1.1.6 DEV3 — 24 novembre 2026
- Support de `project_11` paramétrique sans modification de géométrie factice.
- Identifiant partagé de dossier récent pour les sélecteurs de fichiers Chrome.
- Ajout de contrôles automatisés et d’une documentation sans ambiguïté sur la version native.
- Moteur natif : **COPO 1.418** (1.453 pas encore fusionné).

# COPO-IA 1.1.5 DEV2 — Correctif de vérification du brut

- Le changement du brut sans géométrie explicite (`operations: []`) est accepté lorsqu’il modifie les dimensions.
- Les relations paramétriques existantes sont propagées avant le calcul de l’aperçu.
- Un vrai no-op est refusé.
- Même base COPO 1.418, pas de portage 1.450 revendiqué.

# COPO-IA 1.1.5 DEV — travail en cours, 24 novembre 2026

- Prototype de relations paramétriques `center_stock`, `corner_stock`, `center_feature`.
- Mise à jour déterministe des formes dépendantes, contrôle des cycles et refus des formes hors brut.
- Conservation de `visible:false` lors du recalcul d'un parcours COPO-IA.
- Métadonnées paramétriques sauvegardées dans le projet `.copo` et exportées avec son état.
- **Rappel : base native COPO 1.418**. Le portage vers 1.450 et les essais utilisateur ne sont pas achevés.

---

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

## 1.1.13 DEV10
- « Enregistrer une copie » ouvre toujours le sélecteur natif de sauvegarde, prépositionné sur le fichier .copo ouvert lorsque Chrome prend en charge startIn (FileSystemFileHandle).
- La copie ne remplace plus le fichier courant ; Ctrl+S reste lié à l’original.
