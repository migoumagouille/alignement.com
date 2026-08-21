# Alignement.com

Site statique en HTML écrit à la main. Ce dossier est la racine web :
`alignement.com/journal/x.html` est servi à `https://alignement.com/journal/x.html`.

## Déploiement

**`git push` ne publie rien.** Le site se transfère à la main par FTPS avec
FileZilla. Après un commit, dresser la liste des fichiers à téléverser avec
leur chemin serveur — c'est ce dont Gil a besoin, pas un rappel de pousser.

## Contraintes qui ont déjà cassé des pages

### Aucun gestionnaire d'événement en ligne

Le `.htaccess` sert `script-src 'self'` **sans** `'unsafe-inline'`. Tout
attribut `on*=` dans le HTML est bloqué et ne s'exécute jamais, silencieusement.
Le JavaScript va dans un fichier de `/js/` chargé par `<script src="..." defer>`.

En juillet, 80 attributs `on*=` hérités ont dû être retirés (`68eea53`). Le motif
qui revient le plus souvent est le préchargement différé des polices — **ne pas
l'utiliser** :

```html
<!-- NON : l'onload est bloqué, la feuille n'est jamais appliquée -->
<link rel="preload" href="/fonts/fonts-all.css" as="style"
      onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/fonts/fonts-all.css"></noscript>

<!-- OUI -->
<link rel="stylesheet" href="/fonts/fonts-all.css">
```

### Polices : une seule feuille, dix familles

Toujours `<link rel="stylesheet" href="/fonts/fonts-all.css">`, jamais
Google Fonts — les fontes sont hébergées localement.

Seules ces familles existent. En demander une autre ne produit **aucune erreur** :
le texte tombe simplement sur le sans-serif du navigateur, et ça passe inaperçu.

    Cinzel · Cormorant Garamond · Crimson Pro · Instrument Serif
    JetBrains Mono · Jost · Libre Baskerville · Nunito · Rajdhani · Source Sans 3

Convention du journal : `Nunito` pour le corps, `Cormorant Garamond` pour les
titres d'article, `Rajdhani` pour les titres de la page liste.

### Dates : jamais `new Date("2026-08-18")`

Une chaîne `AAAA-MM-JJ` est lue comme minuit **UTC**, donc la veille 20 h à
Montréal : tous les articles s'affichent datés d'un jour trop tôt. Construire
la date composante par composante :

```js
const [an, mo, jr] = a.date.split('-').map(Number);
const d = new Date(an, mo - 1, jr);
```

Ce bug est réapparu deux fois, dans `js/journal-home.js` puis `js/journal-index.js`.

## Publier un article

Quatre fichiers, sinon l'article existe sans être visible :

1. `journal/<id>.html` — partir du dernier article publié comme gabarit
2. `journal/images/<nom>.jpg` — 1200×630 pour l'`og:image`, viser moins de 150 Ko
3. `journal/articles.json` — **ajouter en fin de tableau** : `js/journal-index.js`
   inverse l'ordre, donc le dernier ajouté paraît en tête
4. `sitemap.xml` — `<loc>`, `<lastmod>` (même date que l'article),
   `changefreq: yearly`, `priority: 0.7`

L'entrée JSON porte `id`, `titre`, `date`, `categorie`, `resume`, `fichier`.
Les catégories sont libres mais réutiliser celles déjà en place quand ça colle
(Société, Le site, Intelligence artificielle, Cybersécurité, Mémoires…).

Dans le HTML : `<html lang="fr">`, `canonical`, `og:type/locale/url/title/
description/image`, `twitter:card`, et la `<time datetime="AAAA-MM-JJ">` de
l'en-tête doit correspondre à la date du JSON et du sitemap.

`articles.json` et les fichiers de `/js/` sont mis en cache : après le transfert,
recharger de force (Ctrl+Maj+R) avant de conclure que ça n'a pas marché.

## `/aligneur/` est privé

Une histoire écrite pour des amis. Accessible par lien direct, mais **jamais**
au sitemap ni à l'indexation — son absence est volontaire, ce n'est pas un oubli
à réparer. Le `noindex` est posé par `X-Robots-Tag` dans le `.htaccess`, pas par
`robots.txt` (un `Disallow` empêcherait Google de lire le `noindex`).

## Langue

Tout le contenu visible est en français québécois, y compris les messages de
commit. Le code (noms de variables, de fichiers) reste sans accents.
