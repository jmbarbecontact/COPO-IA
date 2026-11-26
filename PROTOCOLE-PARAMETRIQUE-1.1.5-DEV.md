# Contrat paramétrique expérimental `project_11`

Les relations complètent une transaction ordinaire `COPO_CHATGPT_PLAN_V1`. Elles ne demandent aucune API externe.

**Exemple indicatif seulement — signature de projet fictive, NE PAS COLLER TEL QUEL** :

```json
{
  "bridge": "COPO_CHATGPT_PLAN_V1",
  "project_signature": "SIGNATURE_COURANTE",
  "plan": {
    "action": "project_11",
    "project_11": {
      "parametric": {
        "upsert": [
          {"id":"hBL","type":"corner_stock","corner":"BL","offsetX":20,"offsetY":20},
          {"id":"hBR","type":"corner_stock","corner":"BR","offsetX":20,"offsetY":20},
          {"id":"poche","type":"center_feature","reference":"base","dx":0,"dy":0}
        ]
      },
      "order": "preserve"
    }
  }
}
```

### Relations prises en charge

- `center_stock` : position du **centre géométrique** de la forme à `(brut.width / 2 + dx, brut.height / 2 + dy)`.
- `corner_stock` : centre de la forme situé à la distance `offsetX` et `offsetY` des bords définis par `corner`. Codes : `BL` (bas-gauche), `BR` (bas-droite), `TL` (haut-gauche), `TR` (haut-droite). Décalages positifs ou nuls.
- `center_feature` : centre de l'objet dépendant = centre de la boîte englobante de l'objet `reference` + `(dx,dy)`.
- Pour libérer les relations : `parametric:{"remove":["hBL"]}`.
- Les règles sont ordonnées selon leurs références et un cycle bloque la transaction.
- L'aperçu AVANT/APRÈS conserve les contrôles natifs et la confirmation explicite.

Une règle doit référencer une forme existante après les opérations `features`. Une forme peut avoir au plus une règle de position. Le centre est celui de la boîte englobante (et non un centre de masse). Les formes sont déplacées par translation : leurs dimensions et leur orientation ne changent pas.

**Limites** : préversion de développement sur base native COPO 1.418. Pas encore portage COPO 1.450 ni validation machine réelle.
