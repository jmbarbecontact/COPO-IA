# Validation de la version COPO-IA 1.0 bêta

**Date : 22 novembre 2026**

## Tests automatisés (environnement de développement)
- Lecture du projet d’exemple comportant trois formes indépendantes.
- Calcul de la poche rectangulaire (180 mouvements), de la rainure oblongue (989) et du profil extérieur (1 128).
- Conservation après sauvegarde/rechargement ; contrôles de refus des paramètres incompatibles.
- Non-régression vérifiée pour les fonctions ciblées des versions 0.7.2 et 0.9.

## Retours du test utilisateur sur Mac
- Affichage des trois géométries : **confirmé**.
- Trois parcours visibles dans COPO après import de la commande `multi_cam` : **confirmé**.
- Simulation 3D complète : **confirmé par l’utilisateur**.
- Sauvegarde et réouverture avec trois géométries et trois parcours : **confirmé par l’utilisateur**.

## Ce qui n’est pas validé
- Mesure métrologique des géométries et des profondeurs finales.
- Conditions de coupe, origine machine, bridage, dégagements réels, postprocesseur et export/exécution machine.
- Les essais ne constituent **aucune qualification pour un usinage réel**.
