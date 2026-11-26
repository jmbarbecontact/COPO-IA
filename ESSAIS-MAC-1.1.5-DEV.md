# Scénarios de vérification 1.1.5 DEV sous Chrome (simulation)

## Test A — Relation à un coin du brut

1. Nouveau projet : brut 260 × 200 × 12 mm.
2. Créer deux cercles Ø8, `hBL` et `hBR`, initialement centrés en (20,20) et (240,20), avec leurs parcours borgnes de 2 mm en fraise Ø3.
3. Créer les règles paramétriques : `hBL = corner_stock BL + 20/20` et `hBR = corner_stock BR + 20/20`.
4. Changer la largeur du brut de 260 à 300 mm. Vérifier qu'après aperçu, `hBL` reste à X20 et `hBR` passe à X280. Confirmer et simuler.

## Test B — Relation entre deux géométries

1. Créer un rectangle `base`, X20 Y20 largeur80 hauteur60 ; et un cercle `trou-centre` Ø12 centré X60 Y50.
2. Lier `trou-centre` au centre de `base` (dx=0,dy=0), calculer une poche pour le cercle.
3. Déplacer `base` de X20 à X60 sans changer les autres dimensions.
4. Vérifier dans l'aperçu : `trou-centre` passe de X60 à X100 ; seule sa FAO est recalculée.

## Test C — Parcours masqué

1. Avec deux parcours existants, masquer l'un d'eux dans COPO.
2. Modifier par la passerelle la géométrie liée au parcours masqué.
3. Confirmer : le parcours doit **rester masqué**, y compris après sauvegarde/réouverture.

## Test D — Sauvegarde

Enregistrer une copie `TEST-COPO-IA-115.copo`, fermer, rouvrir, changer une géométrie parente et vérifier que les règles sont toujours actives.

Chaque scénario est **un test de simulation** ; ne pas utiliser le G-code sur une CNC réelle sans validation indépendante.

## Régression DEV2 : modification du seul brut

Depuis un projet 260 × 200 × 12 mm contenant les quatre trous liés aux coins, envoyer `project_11` avec `features.stock={width:300,height:200,thickness:12}` et `features.operations=[]`. Après Vérifier, la fenêtre AVANT/APRÈS doit s’ouvrir et annoncer les positions X=20 et X=280 pour les trous. La validation doit rester facultative, et le fichier doit être sauvegardé uniquement après confirmation.
