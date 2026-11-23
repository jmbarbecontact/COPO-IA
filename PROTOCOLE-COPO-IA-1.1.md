# COPO-IA 1.1 bêta — commande intégrée de conception et d'usinage

**Extension expérimentale, exclusivement destinée à la simulation.** Ne pas utiliser les parcours sans validation indépendante sur la machine, les origines, le brut, le bridage, les dégagements, les outils et le postprocesseur.

## Mode d'emploi

1. Ouvrir `index.html` dans Chrome et importer `Exemple-multiformes-COPO-IA-1.0.copo` ou commencer un projet vide.
2. Saisir **la demande en français** dans la passerelle, puis copier le dossier vers ChatGPT.
3. ChatGPT renvoie un JSON portant **la signature actuelle du projet**. La signature change si l'utilisateur modifie le projet.
4. Coller le JSON dans **Commande JSON préparée par ChatGPT**, cliquer sur **1 · Vérifier**.
5. Comparer les deux vues **AVANT / APRÈS**, lire le détail des parcours conservés et recalculés.
6. Cliquer sur **2 · Confirmer** uniquement si tout est conforme. Sauvegarder le `.copo`.

Le protocole utilisé demeure `COPO_CHATGPT_PROJECT_V1` et `COPO_CHATGPT_PLAN_V1`. L'action introduite est `project_11` :

```json
{
  "bridge": "COPO_CHATGPT_PLAN_V1",
  "project_signature": "VALEUR_DE_16_CARACTERES_FOURNIE_PAR_COPO",
  "plan": {
    "action": "project_11",
    "project_11": {
      "features": {
        "operations": [
          {"action":"add","id":"poche1","name":"Poche rectangulaire","role":"pocket","geometry":{"type":"rectangle","x":25,"y":30,"width":70,"height":40}},
          {"action":"add","id":"trou1","name":"Trou rond","role":"hole","geometry":{"type":"circle","cx":135,"cy":80,"diameter":16}}
        ]
      },
      "cam": {
        "operations": [
          {"id":"poche1","strategy":"pocket","depth":4,"pass":1,"toolDiameter":6,"through":false},
          {"id":"trou1","strategy":"pocket","depth":3,"pass":1,"toolDiameter":6,"through":false}
        ]
      },
      "order": "tool"
    }
  }
}
```

**IMPORTANT :** il s'agit d'un exemple de structure seulement. Ne pas coller ce JSON tel quel : la valeur `project_signature` est volontairement fictive. Il faut demander à ChatGPT une commande correspondant au dossier courant exporté depuis COPO.

### Commandes typiques à formuler en français

- « Dans cette pièce, agrandis `poche-rect` de 70 × 40 à 85 × 45 mm. Ne modifie pas les autres formes ni leurs parcours. Recalcule uniquement celui de cette poche. »
- « Change la profondeur de `oblong` de 3 à 4 mm, avec passes de 1 mm et fraise Ø6. Conserve tout le reste. »
- « Crée une platine 250 × 180 × 15 mm, six perçages circulaires Ø12, deux poches rectangulaires et prépare leurs parcours borgnes avec une fraise Ø6. » (chaque identifiant créé doit figurer dans la FAO)
- « Regroupe les opérations par diamètre de fraise sans toucher aux trajectoires. »
- « Montre-moi l'avant et l'après ; je confirmerai dans COPO. »

### Règles du moteur 1.1

- `features` (facultatif) : `{stock?, operations:[...]}` ; mêmes types que COPO-IA 0.8, avec `circle_pattern` pour les motifs radiaux de trous.
- `cam` (facultatif) : `{operations:[{id,strategy,depth,pass,toolDiameter,through:false,side?}],removeIds?:[id]}`.
- `order` (facultatif) : `preserve`, `tool` (diamètre croissant), `depth` (profondeur croissante), ou `{mode:"explicit",ids:[...]}` contenant **tous** les identifiants des parcours.
- Les opérations `cam.operations` sont des **créations ou remplacements ciblés**. Il n'est pas nécessaire de renvoyer les parcours qui ne changent pas.
- Quand une géométrie change, son propre parcours existant est recalculé avec les anciens paramètres, et les autres sont conservés. Si la modification change le brut, tous les parcours existants sont recalculés.
- Quand une forme est supprimée, son parcours est également supprimé. Pour supprimer uniquement une FAO, utiliser `cam.removeIds`.
- Poches : formes `circle`, `rectangle`, `rounded_rectangle` et `slot`, rôle `hole` ou `pocket`.
- Profils extérieurs borgnes : formes `rectangle`, `rounded_rectangle` ou `polygon`, rôle `contour`, `side:"out"`.
- Profils intérieurs borgnes : forme fermée compatible, rôle `hole` ou `geometry`, `side:"in"`.
- Le module refuse les parcours COPO manuels ou non reconnus, les profondeurs traversantes et les outils manquants.
- La vue comparative représente les **contours géométriques** ; elle ne simule ni l'enlèvement de matière ni les collisions de bridage.
- Les îlots de poche complexes, le perçage en cycle et les opérations de détourage traversant restent **non pris en charge** par l'automatisation 1.1. Ils demandent une stratégie et des validations natives spécifiques.

**Attention :** les parcours sont vérifiés par les fonctions existantes de COPO au stade du calcul, mais **la validation machine réelle n'a pas été effectuée**.
