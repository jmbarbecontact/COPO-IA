# COPO-IA 1.1.4 BÊTA — CAO/FAO conversationnelle sur COPO 1.418

**Préversion expérimentale, testée en simulation sous Chrome sur Mac le 23 novembre 2026.** Les parcours et le G-code **ne sont pas validés pour une utilisation sur une CNC réelle**.

COPO-IA est une extension **indépendante et non officielle** de [COPO](https://github.com/gbulleryahen-hash/copo), créé et maintenu par **gbulleryahen-hash**. La version présente s'appuie sur les évolutions natives identifiées dans **COPO 1.418** (commit `a867d16`). Code sous licence GNU GPL v3 ou ultérieure, avec les mentions de licences propres aux bibliothèques et ressources tierces.

## Télécharger et démarrer

La distribution complète est disponible dans la **[Release v1.1.4-beta](https://github.com/jmbarbecontact/COPO-IA/releases/tag/v1.1.4-beta)** :

**`COPO-IA-1.1.4-BETA-COMPLET-GITHUB.zip`**

**Utiliser cet actif ZIP complet, pas seulement l'archive automatique « Source code »** : l'archive complète inclut `bibliotheque/` (570 fichiers), `img/`, `lib/`, les exemples et la documentation. Décompresser intégralement, puis ouvrir `index.html` dans **Google Chrome**.

1. Vérifier le bouton flottant **« ✦ Assistant COPO-IA »** en bas à droite et l'indication **VERSION 1.1.4 BÊTA**.
2. Créer ou ouvrir un projet `.copo`, puis ouvrir **Passerelle ChatGPT**.
3. Rédiger une demande en français, copier le dossier JSON structuré et le coller dans ChatGPT.
4. Coller la réponse de ChatGPT, choisir **1 · Vérifier la commande**, puis examiner la fenêtre de comparaison **AVANT/APRÈS**, y compris ses paramètres et tracés FAO indicatifs.
5. Après avoir vérifié l'aperçu, choisir **2 · Confirmer dans COPO**.
6. Simuler dans COPO, puis choisir **« Enregistrer le projet »** ou **« Enregistrer une copie sous… »** (extension `.copo` requise).
7. Rouvrir le projet `.copo` et vérifier les parcours conservés.

**Aucun abonnement API, clé payante ou appel réseau de l'extension n'est nécessaire** : le dialogue avec ChatGPT repose sur un **copier-coller manuel**. Le contrôle et la confirmation sont réalisés dans COPO.

## Fonctions principales

| Fonction | Statut et portée |
|---|---|
| **Modification sélective** | Éditer une géométrie nommée ou ses paramètres FAO, recalculer uniquement les parcours concernés et préserver les autres dans les projets reconnus COPO-IA. |
| **CAO + FAO en une commande** | Ajouter une forme et préparer son parcours dans une même commande `project_11` avec validation préalable. |
| **Prévisualisation AVANT/APRÈS** | Comparaison des géométries et des parcours simulés : identifiants, ordre, outils, profondeur, passes, mouvements et tracés XY indicatifs. |
| **Géométries** | Rectangles, rectangles arrondis, cercles, oblongs, polygones, motifs circulaires de perçages. |
| **FAO simulée** | Poches borgnes circulaires, rectangulaires ou oblongues, profils extérieurs borgnes et profils intérieurs borgnes compatibles. |
| **Ordonnancement** | Préservation, regroupement par outil ou profondeur, ou ordre explicite des parcours. |
| **Sauvegarde** | Actualisation du fichier autorisé, ou création d'une copie indépendante sous un nom `.copo`. |

La 1.1.4 intègre les huit modules de COPO-IA dans `index.html` pour renforcer le démarrage local ; les fichiers JavaScript **restent distribués individuellement** pour l'examen du code. Le programme conserve la source originale créditée et le moteur natif de COPO.

**Limites :** pas de fabrication réelle validée ; pas de parcours traversants automatisés, poches complexes avec îlots ni cycles de perçage natifs automatiques dans ce protocole ; pas de garantie de compatibilité avec des versions de COPO postérieures à 1.418. Les parcours manuels non reconnus ne sont pas modifiés automatiquement. L'aperçu XY n'est pas une simulation de collision ou de bridage.

## Vérifications réalisées

**Essais interactifs communiqués par l'utilisateur, sur Mac et Chrome le 23 novembre 2026 :**

- Démarrage de la 1.1.4, bouton flottant visible, numéro de version et ouverture de l'assistant.
- Réouverture d'un projet d'essai de **8 géométries et 6 parcours** (deux diamètres de fraises), simulation et regroupement des quatre trous comme une famille d'opérations.
- Bouton **« Enregistrer une copie sous… »** : fichier distinct créé puis rouvert, sans altérer l'original.
- Prévisualisation des six parcours et du recalcul d'une seule poche circulaire Ø20, de **3 à 5 mm**, fraise Ø6 et passes de 1 mm : cinq parcours annoncés conservés.
- Application de la modification et simulations confirmées sur Mac.

**Tests exécutables :** 12/12 tests du moteur et de l'aperçu, 6/6 tests de sauvegarde, 7/7 contrôles statiques (adaptés à l'injection des modules de la 1.1.4). Les tests Node utilisent des interfaces simulées et ne remplacent pas la simulation dans le navigateur, ni la validation sur machine.

```sh
node tests/test-transaction11.cjs
node tests/test-save113.cjs
node tests/test-compatibility11.cjs
```

Documentation : [`PROTOCOLE-COPO-IA-1.1.md`](PROTOCOLE-COPO-IA-1.1.md), [`TESTS-COPO-IA-1.1.4.txt`](TESTS-COPO-IA-1.1.4.txt), [`VALIDATION-MAC-1.1.4.md`](VALIDATION-MAC-1.1.4.md) et [`RAPPORT-PORTAGE-COPO-1.418.md`](RAPPORT-PORTAGE-COPO-1.418.md).

Captures des essais : [`apercu-COPO-IA-1.1.4-FAO.png`](apercu-COPO-IA-1.1.4-FAO.png) et [`apercu-COPO-IA-1.1.4-projet.png`](apercu-COPO-IA-1.1.4-projet.png).

## Architecture et licence

- `index.html`, `guide.html` : COPO avec changements identifiés dans la version 1.418.
- `copo-ia11.js` : édition transactionnelle, dépendances entre formes et parcours, ordre et aperçu.
- `copo-features.js` : gestion des géométries libres et identifiants stables.
- `copo-fao-multiformes.js` : FAO multi-géométrique et profils borgnes.
- `copo-dialogue.js` et `copo-passerelle.js` : vérification, dialogue JSON, aperçu, sauvegarde.
- `copo-ia.js`, `copo-fao.js`, `copo-fao-libre.js` : fonctionnalités historiques.

Crédits de COPO : [gbulleryahen-hash](https://github.com/gbulleryahen-hash/copo). Projet dérivé non officiel, sans affiliation ni approbation revendiquée. Voir `LICENSE`, `README-COPO-ORIGINAL.md`, `bibliotheque/CREDITS.md` et `lib/LICENCES.txt`.
