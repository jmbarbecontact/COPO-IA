# Résultats des essais utilisateur Mac / Chrome — COPO-IA 1.1.4 BÊTA

Date : **23 novembre 2026**. Contexte : logiciel ouvert localement dans Google Chrome sur Mac.

## Résultats déclarés et illustrés par l'utilisateur

- **Démarrage :** bouton flottant « ✦ Assistant COPO-IA » visible, fenêtre ouverte, étiquette `VERSION 1.1.4 BÊTA` correcte.
- **Projet de référence :** réouverture du fichier d'essai, huit géométries et six parcours FAO, deux diamètres de fraise ; simulations fonctionnelles. Les quatre trous sont regroupés pour les simulations.
- **Sauvegarde :** « Enregistrer une copie sous… » crée une copie indépendante ; réouverture et parcours conservés.
- **Prévisualisation FAO :** vues AVANT/APRÈS et relevé des six opérations affichés. Modification de la profondeur `poche-ronde` de 3 mm à 5 mm, fraise Ø6 mm, passes de 1 mm. L'aperçu annonce **4608** mouvements après recalcul contre **2766** auparavant et cinq parcours conservés, avec **3375** segments XY dessinés à titre indicatif dans chaque état (limite d'affichage).
- **Application :** changement confirmé, parcours affichés dans COPO et simulations exécutées avec succès.

## Portée

Ces essais confirment les fonctions dans le cas concret décrit, pas une validation exhaustive de COPO 1.418. Le **G-code destiné à une machine réelle n'est pas validé**. Les tracés XY affichés en prévisualisation sont indicatifs : ils ne constituent pas un contrôle de collision ou de bridage.

## Contrôles programmatiques complémentaires

- `node tests/test-transaction11.cjs` : 12/12.
- `node tests/test-save113.cjs` : 6/6.
- `node tests/test-compatibility11.cjs` : 7/7 après adaptation au chargement intégré.

Les tests utilisent des doublures de l'API native ; ils complètent mais ne remplacent pas les essais interactifs.
