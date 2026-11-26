# COPO-IA 1.1.12 DEV9R — correctif d’affichage

- Le bouton de lancement et le panneau COPO-IA sont inscrits directement dans le HTML, indépendamment du démarrage JavaScript du moteur CNC.
- Le module COPO-IA reprend ces éléments existants au lieu de les injecter dynamiquement.
- Un bouton de diagnostic apparaît si le module ne démarre pas.
- La mémorisation et les accès aux dossiers de DEV9 restent présents.
- Contrôles de syntaxe JavaScript et intégrité ZIP effectués ; l’affichage sur Chrome/macOS reste à confirmer.
