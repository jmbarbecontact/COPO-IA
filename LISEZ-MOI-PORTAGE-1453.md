# COPO-IA sur COPO-CNC 1.453 — distribution expérimentale complète

**Source COPO-IA : 1.1.4 bêta (branche publique)** — **Moteur natif : COPO 1.453** (commit `d14d61ae9dbaec65742f7ce639c8ae712c88601b`).

Cette branche est un **portage de 1.1.4**, et **non** une fusion de la version 1.1.6 DEV3 du 24 novembre 2026. Les fichiers DEV2/DEV3 n'étant pas disponibles sous forme d'octets dans la session de travail, leurs modifications spécifiques ne sont pas comprises. La version 1.1.4, le code natif 1.453 et les modules ont été réunis dans `index.html` ; l'usage reste expérimental.

## Obtenir une distribution complète, pas un simple code source partiel

Le dépôt de développement ne contient pas lui-même la bibliothèque `bibliotheque/`. La procédure GitHub Actions (`.github/workflows/build-copo-ia-1453.yml`) assemble **l'archive officielle de COPO 1.453**, toutes ses ressources (bibliothèque, lib, images, polices, exemples) et les fichiers de cette branche, avant de réaliser les tests, de produire un ZIP autonome et de le joindre en tant qu'artifact au workflow.

1. Dans l'onglet **Actions** du dépôt, ouvrir **Build complete COPO-IA / COPO 1.453 preview**.
2. Ouvrir l'exécution réussie la plus récente.
3. Télécharger l'artefact **COPO-IA-1.1.4-COPO-1.453-COMPLET-EXPERIMENTAL** (archive ZIP et somme SHA-256).
4. Décompresser, puis ouvrir le fichier `index.html` dans Chrome sous macOS.

**Attention :** Les tests de syntaxe et de simulation de l'extension ne prouvent ni l'absence de régression, ni la compatibilité de tous les fichiers `.copo`, ni la sûreté des parcours machine. Vérifier les modifications et les déplacements avec des projets de simulation, puis effectuer une validation indépendante avant tout usinage.

Le dépôt principal `main` et les archives DEV2/DEV3 restent inchangés. Licence GPL-3.0, créateur COPO d'origine : g.bulleryahen.
