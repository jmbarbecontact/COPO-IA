# COPO-IA 1.1.11 DEV8 — COPO-CNC 1.471

Version de développement **non publiée sur GitHub**. Le moteur COPO-CNC 1.471 est intégré à partir du commit `be7f2d18e9901aefe34993297a857e642ff0e08d`, avec conservation de la passerelle ChatGPT, des neuf modules COPO-IA et de la mémorisation du dossier de projets (DEV6).

Ouvrir `index.html` dans Chrome, puis vérifier l’indication **VERSION 1.1.11 DEV8 · COPO 1.471**. Utiliser des copies des projets pour les essais.

Lire `RAPPORT-VALIDATION-DEV8.md` pour les contrôles exécutés et les limites.

## Historique précédent

# COPO-IA 1.1.10 DEV7 — COPO-CNC 1.464

Version de développement non publiée. Voir `RAPPORT-VALIDATION-DEV7.md` pour les tests et limites.

# COPO-IA 1.1.8 DEV5 — COPO-CNC 1.463

Version expérimentale complète issue de COPO-IA 1.1.7 DEV4 avec intégration du moteur officiel COPO-CNC 1.463 (commit `16701cdc83b2b3a2184a1ffa2080c0dc7681d6c7`).

Lancer `index.html` dans Chrome. L’interface affiche « VERSION 1.1.8 DEV5 · COPO 1.463 ».

Le logiciel conserve les neuf modules de COPO-IA, la passerelle ChatGPT manuelle, l'édition transactionnelle, les relations paramétriques et les protections d'enregistrement. Le moteur, les bibliothèques et les tests natifs proviennent de COPO-CNC 1.463.

La publication GitHub publique n'a pas été modifiée. Avant toute utilisation sur machine réelle, exécuter les contrôles sur macOS et valider les parcours, origines et post-processeurs.

Consulter `RAPPORT-VALIDATION-DEV5.md` pour les résultats et limites des tests.


## DEV6 — dossier de projets mémorisé (1.1.9)

Dans **Fichier > Choisir le dossier des projets…**, sélectionner **une seule fois** le dossier contenant les fichiers `.copo`. Le handle du dossier est conservé dans IndexedDB (même origine de navigation, profil Chrome/Edge identique). Les commandes **Ouvrir un projet**, **Enregistrer sous** et les boutons de l’assistant COPO-IA démarrent dans ce dossier via `startIn`. **Enregistrer** continue de réécrire le fichier déjà associé au projet, sans nouvelle boîte de dialogue.

Le navigateur interdit de lire automatiquement le chemin parent d’un fichier sélectionné ; après le premier choix explicite, aucun nouveau choix de dossier n’est normalement nécessaire. La restauration peut échouer si les données du site sont effacées, si l’origine `file://` change, ou si le navigateur refuse les handles : le dialogue standard reste utilisable. Cette amélioration ne change pas COPO-CNC 1.463 ni le protocole IA.

## DEV9 — dossier des projets

Choisir une fois le dossier avec « Dossier des projets… ». « Ouvrir .copo » liste les fichiers du dossier sans sélecteur macOS ; « Enregistrer » y crée directement le projet si aucun fichier courant n’est lié ; « Rouvrir le dernier projet » rouvre le précédent en un clic, après éventuelle autorisation du navigateur.

**DEV10 :** correction de « Enregistrer une copie » ; voir `CORRECTION-ENREGISTRER-COPIE-DEV10.md`.
