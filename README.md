# COPO-IA 0.6 PASSERELLE — ChatGPT ↔ COPO par échange explicite

Prototype expérimental, basé sur **COPO 1.257**, GPL-3.0-or-later. Conserve les fonctions de dessin, FAO et simulation de la version 0.5 validée.

## Architecture

La communication est **manuelle et bidirectionnelle**, par copier/coller, sans clé API, serveur local, Ollama, compte supplémentaire ou facturation API. Le logiciel construit une synthèse structurée de l’état du projet, que l’utilisateur colle lui-même dans ChatGPT. ChatGPT fournit une commande JSON `COPO_CHATGPT_PLAN_V1` liée à une empreinte du projet. L’utilisateur la colle dans COPO, qui vérifie son format, sa correspondance au projet actuel et la validité géométrique/FAO, puis affiche la proposition. **Seul un clic distinct sur « Confirmer dans COPO » applique la commande.**

- **Exporter** : « Copier le projet pour ChatGPT » exporte dimensions, géométries gérées, outils de fraisage et un résumé des parcours. Aucun fichier privé n’est envoyé automatiquement.
- **Importer** : « Vérifier la commande » refuse JSON mal formé, mauvais schéma, projet changé, dimensions non compatibles, outils absents, parcours non gérés.
- **Sauvegarder** : utiliser « Enregistrer .copo » après confirmation.
- **Fonctionnement hors connexion** : la partie CAO/FAO locale fonctionne sans Internet. Le dialogue par ChatGPT nécessite évidemment l’accès habituel à ChatGPT pour le copier-coller.

## Limites

Cette passerelle ne donne **pas accès directement au navigateur/ordinateur** depuis ChatGPT ; l’utilisateur transfère les données manuellement entre les deux logiciels. Pas d’agent autonomisé. La couverture fonctionnelle reste limitée aux géométries gérées par COPO-IA (plaque, quatre trous, poche centrale) et aux deux opérations FAO expérimentales. Les parcours COPO-IA sont simulés, non validés pour une machine CNC réelle ; aucune exportation ou envoi G-code par l’extension.

La chaîne d’import et d’export est conçue pour résister aux erreurs usuelles, mais ne constitue pas une validation de sécurité d’usinage industriel. Toujours vérifier la géométrie, les parcours et l’enlèvement de matière en simulation.

## Fichiers

- `index.html` : interface COPO et scripts intégrés.
- `copo-ia.js` : édition locale des formes.
- `copo-fao.js` : préparation et simulation des parcours.
- `copo-dialogue.js` : vérification des plans et confirmation.
- `copo-passerelle.js` : échange ChatGPT sans API.
- `Exemple-plaque-COPO-IA.copo` : plaque test sans parcours.
- `Démarrer COPO-IA.command` : simple ouverture dans Chrome (facultatif).
- `LICENSE` et les ressources COPO : licences d’origine conservées.

## Polices COPO

Pour éviter de redistribuer des fichiers de polices, cette archive ne fournit pas le dossier optionnel `fonts/`. Les fonctions de dessin, de FAO et la passerelle ne l’utilisent pas pour les essais fournis. Si tu veux ensuite retrouver les polices décoratives et la gravure de textes de la version précédente, récupère simplement le dossier `fonts` de ton propre COPO-IA 0.5 et dépose-le à côté de `index.html`.


## Origine et attribution

COPO-IA est une modification expérimentale du logiciel libre **COPO**, développé par **gbulleryahen-hash**.

- Projet original : https://github.com/gbulleryahen-hash/copo
- Licence du logiciel original et de cette version modifiée : GNU GPL v3 (voir `LICENSE`).
- Les fonctions ajoutées (interfaces en français, commandes structurées et passerelle ChatGPT) sont expérimentales et ne constituent pas une validation d'usinage réel.
- Ce dépôt est une expérimentation indépendante, **non officielle** ; il ne doit pas être confondu avec le dépôt de COPO.

### Installation

Télécharger le dépôt avec **Code → Download ZIP**, décompresser, puis ouvrir `index.html` dans Chrome. Le fichier `Démarrer COPO-IA.command` est facultatif. Pour l'échange avec ChatGPT, ouvrir **Passerelle ChatGPT**, copier l'état du projet, le transmettre manuellement dans la conversation, puis coller le plan JSON de réponse et le vérifier avant confirmation.

### Avertissement

Les parcours générés par COPO-IA sont réservés aux essais en simulation. Ne pas exécuter leur G-code sur une machine sans vérification technique indépendante des parcours, outils, origines, bridages, vitesses et avances.
