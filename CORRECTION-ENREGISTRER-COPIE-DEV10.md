# Correction « Enregistrer une copie » — DEV10

- Après ouverture d’un fichier .copo, la boîte de dialogue native « Enregistrer une copie » est systématiquement proposée.
- Le sélecteur est initialisé sur le fichier courant via `startIn: projHandle`, afin de viser son dossier parent lorsque le navigateur prend ce réglage en charge.
- Le dossier de projets mémorisé est utilisé en dernier recours uniquement, si aucun fichier courant n’est disponible.
- Le dossier et le nom restent librement sélectionnables.
- La copie n’affecte pas l’association du fichier courant, contrairement à « Enregistrer ».
- Le navigateur ne transmet pas un chemin absolu au code JavaScript. Si le fichier est ouvert sans accès direct (import ou téléchargement), il peut rester nécessaire de choisir son dossier manuellement.

**Validation restante :** essai réel Chrome / macOS (position initiale du sélecteur).
