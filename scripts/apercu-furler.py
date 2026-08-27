#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
apercu-furler.py — Genere la maquette de furler.ca dans furler.ca/test/

La source de verite reste ../furler.ca/ (arborescence du futur site, chemins
absolus a la racine du domaine). Ce script en derive une copie servie sous
https://furler.ca/test/, a montrer au proprietaire avant de basculer le site.

La maquette vit sur furler.ca meme, pas sur alignement.com : rien a changer
au .htaccess d'alignement.com, et le noindex tient dans un .htaccess local
au repertoire, qui ne peut casser que lui.

  scripts/apercu-furler.py

Ce que la copie change, et rien d'autre :
  - prefixe tous les chemins absolus par /test
  - reecrit canonical, og:url et hreflang vers les URL de l'apercu,
    pour ne jamais pointer vers des URL de furler.ca qui n'existent pas
  - ajoute <meta name="robots" content="noindex, nofollow">
  - pose un bandeau « maquette » en haut de chaque page
  - bouche les pages pas encore ecrites par un placeholder, pour que le
    menu reste cliquable pendant la demonstration
  - depose un .htaccess local qui pose X-Robots-Tag: noindex

La balise meta est le garde-fou principal : rien ne garantit que l'hebergeur
autorise mod_headers dans un .htaccess, alors que la balise, elle, marche
toujours. Le .htaccess vient en renfort. Ne jamais ajouter /test au sitemap.

Regenerer efface entierement le repertoire cible : ne rien y editer a la main.
"""
import re
import shutil
import pathlib

RACINE = pathlib.Path(__file__).resolve().parent.parent
SOURCE = RACINE / "furler.ca"
CIBLE = RACINE / "furler.ca-test"
PREFIXE = "/test"
BASE = "https://furler.ca" + PREFIXE

# Routes du site complet. True = page deja ecrite.
ROUTES = [
    ("/",                   "Accueil",     "fr", False),
    ("/description/",       "Description", "fr", True),
    ("/dessin/",            "Dessin",      "fr", False),
    ("/bon-de-commande/",   "Commandez",   "fr", False),
    ("/produits/",          "Produits",    "fr", False),
    ("/en/",                "Home",        "en", False),
    ("/en/description/",    "Description", "en", True),
    ("/en/drawing/",        "Drawing",     "en", False),
    ("/en/order/",          "Order",       "en", False),
    ("/en/products/",       "Products",    "en", False),
]

# Appariement des deux versions linguistiques.
PAIRES = {
    "/": "/en/",
    "/description/": "/en/description/",
    "/dessin/": "/en/drawing/",
    "/bon-de-commande/": "/en/order/",
    "/produits/": "/en/products/",
}
PAIRES.update({en: fr for fr, en in PAIRES.items()})

BANDEAU = (
    '<div class="maquette">{texte}</div>\n'
)
TEXTE = {
    "fr": "Maquette de travail — aperçu privé, hors des moteurs de recherche. "
          "Le site en ligne reste furler.ca.",
    "en": "Working mock-up — private preview, kept out of search engines. "
          "The live site is still furler.ca.",
}

HTACCESS = """# Maquette du futur furler.ca — hors des moteurs de recherche.
# C'est une copie des textes de /wordpress/ et /wordpress_en/ :
# indexée, elle leur ferait concurrence sur les mêmes mots.
#
# Le noindex est doublé par une balise meta dans chacune des pages
# (voir scripts/apercu-furler.py). La balise est le garde-fou sûr ;
# l'en-tête ci-dessous ne s'applique que si l'hébergeur autorise
# mod_headers en .htaccess.
#
# Volontairement absent du sitemap. À supprimer après la bascule.
<IfModule mod_headers.c>
  Header always set X-Robots-Tag "noindex, nofollow, noarchive"
</IfModule>
"""

CSS_BANDEAU = """
/* ---------- bandeau d'apercu (ajoute par scripts/apercu-furler.py) ---------- */
.maquette{
  background:#f0d98a;color:#3a2f10;
  padding:9px 20px;text-align:center;
  font:bold 13px/1.4 Tahoma,Verdana,sans-serif;
}
.a-venir{
  margin:40px 0;padding:26px 24px;background:#f6f6f6;
  border-left:5px solid var(--menu);
  font:italic 19px/1.5 Georgia,serif;color:var(--inter);
}
"""


def prefixer(html: str) -> str:
    """Prefixe les chemins absolus et reecrit les URL absolues de furler.ca."""
    # src="/..." et href="/..."  ->  /furler-apercu/...
    html = re.sub(r'(\b(?:src|href)=")(/(?!/))', r'\1' + PREFIXE + r'\2', html)
    # href="/" seul (le lien du logo)
    html = html.replace('href="' + PREFIXE + '/"', 'href="' + PREFIXE + '/"')
    # URL absolues dans canonical, og:url, hreflang et JSON-LD
    html = html.replace("https://furler.ca", BASE)
    return html


def noindex(html: str) -> str:
    return html.replace(
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        '<meta name="robots" content="noindex, nofollow">',
    )


def bandeau(html: str, langue: str) -> str:
    return html.replace("<body>\n", "<body>\n" + BANDEAU.format(texte=TEXTE[langue]), 1)


def transformer(html: str, langue: str) -> str:
    return bandeau(noindex(prefixer(html)), langue)


def placeholder(gabarit: str, route: str, titre: str, langue: str) -> str:
    """Reprend l'habillage d'une page ecrite et remplace le contenu."""
    mot = ("Cette page n'est pas encore montée dans la maquette."
           if langue == "fr" else
           "This page is not part of the mock-up yet.")
    corps = (
        f"<h1>{titre}</h1>\n"
        f'    <p class="a-venir">{mot}</p>'
    )
    html = re.sub(r'<main class="contenu">.*?</main>',
                  f'<main class="contenu">\n    {corps}\n  </main>',
                  gabarit, flags=re.S)
    # titre de l'onglet et URL propres a la page
    html = re.sub(r"<title>.*?</title>", f"<title>{titre} — maquette</title>", html, flags=re.S)
    html = re.sub(r'<link rel="canonical" href="[^"]*">',
                  f'<link rel="canonical" href="{BASE}{route}">', html)
    # l'onglet courant du menu — uniquement dans le <nav>, sinon le lien
    # du logo, qui porte la meme adresse pour les deux accueils, l'attrape.
    html = html.replace(' aria-current="page"', "")
    def marquer(m):
        return m.group(0).replace(f'href="{PREFIXE}{route}"',
                                  f'href="{PREFIXE}{route}" aria-current="page"', 1)
    html = re.sub(r"<nav\b.*?</nav>", marquer, html, count=1, flags=re.S)

    # le lien vers l'autre langue, et les hreflang, doivent viser la page
    # equivalente — sinon ils pointent tous vers la Description.
    autre = PAIRES[route]
    fr, en = (route, autre) if langue == "fr" else (autre, route)
    html = re.sub(r'(<section class="langue">.*?<a href=")[^"]*(")',
                  lambda m: m.group(1) + PREFIXE + autre + m.group(2),
                  html, count=1, flags=re.S)
    for code, cible in (("fr-CA", fr), ("en-CA", en), ("x-default", fr)):
        html = re.sub(rf'(<link rel="alternate" hreflang="{code}" href=")[^"]*(">)',
                      lambda m, c=cible: m.group(1) + BASE + c + m.group(2), html, count=1)
    return html


def main() -> None:
    if not SOURCE.is_dir():
        raise SystemExit(f"source introuvable : {SOURCE}")
    if CIBLE.exists():
        shutil.rmtree(CIBLE)
    CIBLE.mkdir(parents=True)

    (CIBLE / ".htaccess").write_text(HTACCESS, encoding="utf-8")
    shutil.copytree(SOURCE / "images", CIBLE / "images")
    (CIBLE / "css").mkdir()
    (CIBLE / "css" / "style.css").write_text(
        (SOURCE / "css" / "style.css").read_text(encoding="utf-8") + CSS_BANDEAU,
        encoding="utf-8")

    gabarits = {}
    ecrites = 0
    for route, titre, langue, existe in ROUTES:
        if not existe:
            continue
        src = SOURCE / route.strip("/") / "index.html"
        html = transformer(src.read_text(encoding="utf-8"), langue)
        dest = CIBLE / route.strip("/") / "index.html"
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(html, encoding="utf-8")
        gabarits[langue] = html
        ecrites += 1

    bouchees = 0
    for route, titre, langue, existe in ROUTES:
        if existe:
            continue
        dest = CIBLE / route.strip("/") / "index.html" if route != "/" else CIBLE / "index.html"
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(placeholder(gabarits[langue], route, titre, langue), encoding="utf-8")
        bouchees += 1

    fichiers = sorted(p for p in CIBLE.rglob("*") if p.is_file())
    print(f"{CIBLE.relative_to(RACINE)} régénéré : "
          f"{ecrites} page(s) réelle(s), {bouchees} page(s) bouchée(s), "
          f"{len(fichiers)} fichiers.\n")
    print("À téléverser par FTPS, à la racine web de furler.ca :")
    for p in fichiers:
        print(f"  /test/{p.relative_to(CIBLE)}")


if __name__ == "__main__":
    main()
