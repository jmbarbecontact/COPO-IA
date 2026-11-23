# Portage vers les évolutions COPO 1.418

Dernier commit amont pris comme référence : [a867d16](https://github.com/gbulleryahen-hash/copo/commit/a867d16bf9cdc0388d18ad323d0cc3df1d63adac), publié le 22 novembre 2026, intitulé « Version 1.418 : filetage, jeu radial ».

La base COPO-IA 1.0 contenait COPO 1.417. Pour la 1.1, les modifications identifiées dans ce commit ont été **reportées dans l'index intégré**, sans remplacer les modules de l'extension :

- champ natif `thClear` (jeu radial) pour les filetages ;
- calcul des rayons du filet intérieur/extérieur avec `j` ;
- valeur par défaut `thClear:0` et persistance du réglage ;
- affichage du diamètre fileté corrigé ;
- libellés anglais du nouveau réglage ;
- mise à jour des paragraphes de guide français et anglais ;
- identification de la base native par `COPO_VERSION = '1.418'`.

Les API utilisées par COPO-IA 1.1 (`S`, `refresh`, `computeTP`, `snapState`, `restore`, `commit`) n'ont pas fait l'objet de modifications identifiées dans ce commit. Les contrôles statiques sont positifs. **Cela ne remplace pas un test de comportement dans Chrome** et ne garantit pas la compatibilité avec d'autres versions futures de COPO.

Le projet d'origine demeure crédité et la licence GPL v3 est conservée. Cette adaptation est indépendante et non officielle.
