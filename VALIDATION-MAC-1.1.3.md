# Vérification de COPO-IA 1.1.3 sur Mac (Chrome)

Conserver la 1.1.2 et une copie séparée du projet testé à six parcours.
Ne pas modifier les archives anciennes et **ne pas utiliser les parcours sur une CNC**.

## 1. Vérification du démarrage

- Décompresser l'archive entière, ouvrir `index.html` dans Chrome.
- Vérifier le bouton flottant « ✦ Assistant COPO-IA », puis ouvrir la Passerelle ChatGPT.
- Vérifier l'étiquette **VERSION 1.1.3 BÊTA**.

## 2. Vérification des deux enregistrements

- Charger un projet `.copo` existant **en conservant l'original**.
- Dans la Passerelle, utiliser **Enregistrer une copie sous…**.
- Dans Chrome, choisir le Bureau et donner le nom `TEST-COPO-IA-113.copo` (conserver `.copo`).
- Vérifier l'existence de la copie. L'original ne doit pas être modifié.
- Modifier uniquement une géométrie simple ; utiliser **Enregistrer le projet**.
- Vérifier que le fichier `TEST-COPO-IA-113.copo` est actualisé sans nouvelle boîte de dialogue, puis le rouvrir : mêmes formes et parcours.
- Essai facultatif : annuler le sélecteur de copie ; aucun fichier ne doit être écrit.

## 3. Vérification de l'aperçu FAO

- Sur le projet existant avec parcours, demander de modifier uniquement la profondeur d'une poche, par exemple 4 → 5 mm (toujours strictement inférieure à l'épaisseur).
- Coller la commande JSON signée, puis cliquer **« 1 · Vérifier la commande »**.
- Contrôler les deux vues AVANT/APRÈS ; sous les dessins doivent apparaître des listes **FAO AVANT** et **FAO APRÈS** avec ordre, identifiant, diamètre de fraise, profondeur et passe.
- Vérifier qu'une seule opération est indiquée « recalculé » et que les autres sont « conservé ».
- Annuler d'abord l'aperçu, vérifier qu'aucun changement n'est appliqué ; revérifier puis confirmer après examen.
- Simuler, sauvegarder et rouvrir le projet de test.

## 4. Vérification de compatibilité 1.418

- Réouvrir un projet `.copo` créé sous COPO-IA 1.1.2 et contenant six parcours sur deux fraises.
- Contrôler qu'ils sont tous présents, que les deux outils sont conservés et que la simulation s'exécute intégralement.
- Ce test établit seulement une compatibilité fonctionnelle pour ce scénario.

**Statut : tests automatisés positifs, validation interactive 1.1.3 encore à réaliser.**
