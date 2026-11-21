#!/bin/zsh
# COPO-IA 0.6 PASSERELLE — ouvre le logiciel local, sans serveur ni clé API.
cd "$(dirname "$0")" || exit 1
open -a "Google Chrome" "$(pwd)/index.html" || open "$(pwd)/index.html"
