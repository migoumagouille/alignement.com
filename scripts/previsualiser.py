#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
previsualiser.py — Serveur local pour relire le site avant le transfert FTPS

Sert alignement.com/ comme racine web, exactement comme le serveur en ligne :
les chemins absolus (/fonts/fonts-all.css, /journal/images/x.jpg, /js/x.js)
se résolvent comme en production. Un « python3 -m http.server » lancé depuis
brouillons/ donnerait une page sans styles ni images.

Expose en plus brouillons/ à l'adresse /brouillons/, sans rien ajouter dans
la racine web : un brouillon reste hors de portée du transfert FTPS.

  scripts/previsualiser.py            → http://localhost:8000/
  scripts/previsualiser.py 8080       → autre port

  http://localhost:8000/                              le site
  http://localhost:8000/journal/                      le journal
  http://localhost:8000/brouillons/vol-libre.html     le brouillon

Ctrl+C pour arrêter. Rien n'est écrit sur le disque, le serveur n'écoute que
sur 127.0.0.1 (invisible depuis le reste du réseau).

ATTENTION : ce serveur n'applique pas le .htaccess, donc pas la CSP. Un
attribut on*= en ligne fonctionnera ici et échouera en ligne. La
prévisualisation valide la mise en page, pas la conformité à la CSP.
"""
import functools
import http.server
import pathlib
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
WEB = RACINE / "alignement.com"
BROUILLONS = RACINE / "brouillons"
PREFIXE = "/brouillons"


class Handler(http.server.SimpleHTTPRequestHandler):
    """Sert la racine web, et /brouillons/ depuis l'extérieur de celle-ci."""

    def translate_path(self, path):
        propre = path.split("?", 1)[0].split("#", 1)[0]
        if propre != PREFIXE and not propre.startswith(PREFIXE + "/"):
            return super().translate_path(path)

        reste = propre[len(PREFIXE):].lstrip("/")
        if not reste:
            return str(BROUILLONS)
        cible = (BROUILLONS / reste).resolve()
        # Ne jamais servir hors du dossier des brouillons (../../ dans l'URL)
        if cible != BROUILLONS and BROUILLONS not in cible.parents:
            return str(BROUILLONS)
        return str(cible)

    def log_message(self, fmt, *args):
        sys.stderr.write("  %s\n" % (fmt % args))


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

    if not WEB.is_dir():
        sys.exit(f"Racine web introuvable : {WEB}")

    handler = functools.partial(Handler, directory=str(WEB))
    with http.server.ThreadingHTTPServer(("127.0.0.1", port), handler) as srv:
        print(f"Racine web : {WEB}")
        print(f"Brouillons : {BROUILLONS}")
        print()
        print(f"  Site      http://localhost:{port}/")
        print(f"  Journal   http://localhost:{port}/journal/")
        print(f"  Brouillon http://localhost:{port}/brouillons/vol-libre.html")
        print()
        print("Ctrl+C pour arrêter.")
        try:
            srv.serve_forever()
        except KeyboardInterrupt:
            print("\nArrêté.")


if __name__ == "__main__":
    main()
