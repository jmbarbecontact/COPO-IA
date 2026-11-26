# Rapport de vérification — COPO-IA 1.1.6 DEV3

Vérifications exécutées dans l’environnement de développement :

- **42 tests automatisés Node.js : réussis.** Six scripts couvrant compatibilité, transactions, sauvegarde, relations, commandes paramétriques sans modification de géométrie et recalcul FAO sélectif.
- **Test d’interface isolée dans Chromium : réussi** (comparaison SVG avant/après, vérification non destructive, validation puis confirmation, annulation).
- **Scripts JavaScript inline : analyse syntaxique réussie**.
- **Test de chargement de l’application réelle : non exécuté** dans l’environnement actuel : les navigations Chromium locales et HTTP sont bloquées administrativement (ERR_BLOCKED_BY_ADMINISTRATOR).
- **Test de retour macOS Chrome sur un fichier `.copo` réel : à effectuer par l’utilisateur**.
- **Portage COPO 1.453 : non effectué**. Moteur effectif : COPO 1.418.

Le logiciel n’est pas certifié pour piloter une CNC. Toutes les FAO COPO-IA sont destinées à la simulation et doivent être vérifiées indépendamment.
