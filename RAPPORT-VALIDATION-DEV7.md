# RAPPORT DE VALIDATION — COPO-IA 1.1.10 DEV7 / COPO-CNC 1.464

26 novembre 2026 — version de développement non publiée.

## Sources
- Base : archive complète COPO-IA 1.1.9 DEV6, moteur COPO-CNC 1.463.
- Version amont : archive officielle COPO-CNC 1.464, commit `eff2eb0caf388de54f426028006dc0fcc1e0c078`.

## Intégration
- Comparaison intégrale des `index.html` natifs 1.463 et 1.464 : **4 régions modifiées**.
- Report EXACT des quatre régions vers le fichier DEV6 : numéro de version dans À propos, algorithme de gravure en V projetée, constante de version native.
- Identifiants et modules COPO-IA conservés ; le sélecteur de dossier mémorisé par IndexedDB (`COPO_PROJECT_DIR_ID`) est conservé.
- Aucun autre changement dans les sources d'exécution par rapport à la DEV6.

## Contrôles exécutés
- Équivalence exacte des changements natifs attendus : OK.
- Conservation des fichiers DEV6 : OK (0 fichier supprimé).
- Fichiers de DEV6 modifiés : CHANGELOG.md, README.md, index.html.
- Analyse de syntaxe de **16 scripts JavaScript internes** par Node.js : OK.
- Vérification des marqueurs des passerelles COPO-IA et de l'édition paramétrique : OK.
- Vérification intégrité du ZIP final : voir emballage.

## Contrôles non réalisés
- La validation visuelle et les boîtes de dialogue macOS doivent être vérifiées sur le Mac utilisateur.
- Pas de simulation comparée gravure en V sur relief contre la version officielle 1.464.
- Pas de test de génération de G-code comparable à l'amont 1.464 ; pas de validation machine réelle.
- Les 42 anciens tests historiques ne sont pas disponibles ici sous forme de suites exécutables.

**Ne pas considérer cette intégration de sources comme une certification de compatibilité fonctionnelle complète.**
