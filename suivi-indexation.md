# Suivi de l'indexation — alignement.com

Ligne de base relevée avant les correctifs du 8 août 2026, pour
comparaison avec les prochains rapports de la Search Console.

Ce fichier vit à la racine du dépôt, **hors** de `alignement.com/`,
pour ne jamais partir sur le serveur web.

## Relevé du 2026-08-08

Source : export « Indexation des pages », Search Console,
portée « Toutes les pages connues ». Données arrêtées au 4 août.

| Indicateur | Valeur |
|---|---|
| Pages indexées | **43** |
| Pages non indexées | **85** |
| Total connu de Google | 128 |
| URL déclarées au sitemap | 58 |
| Fichiers HTML dans le dépôt | 84 |

Motifs de non-indexation :

| Motif | Pages |
|---|---|
| Introuvable (404) | 32 |
| Explorée, actuellement non indexée | 29 |
| Détectée, actuellement non indexée | 11 |
| Autre page avec balise canonique correcte | 6 |
| Page en double sans URL canonique sélectionnée | 4 |
| Page avec redirection | 3 |
| Indexée malgré le blocage par robots.txt | 3 |
| Bloquée par robots.txt | 0 |

Courbe du 9 mai au 4 août : 645 impressions sur 88 jours,
soit 7,3 par jour en moyenne. Départ à 20 indexées le 10 mai,
palier à 43 depuis le 24 juillet.

## Correctifs appliqués le 2026-08-08

- `robots.txt` : tous les `Disallow` retirés. Ils empêchaient
  Google de lire les URL, donc de voir qu'il ne fallait pas les
  indexer — d'où les 3 « indexée malgré le blocage ».
- `.htaccess` : `X-Robots-Tag: noindex` sur `contact/envoyer.php`.
  Les médias de `/cuivre/` restent volontairement indexables.
- `.htaccess` : 12 redirections 301 et 20 réponses 410 couvrant
  les 32 URL en 404.
- `.htaccess` : canonicalisation `www` → non-`www`, placée avant
  la règle HTTPS pour éviter la double redirection.

## À vérifier au prochain rapport

- Les 32 « Introuvable (404) » doivent fondre : les 20 en 410
  sortent vite, les 12 redirigées deviennent « Page avec
  redirection » puis disparaissent.
- Les 3 « indexée malgré le blocage » doivent tomber à 0.
- Surveiller que le total « Page avec redirection » monte
  temporairement — c'est normal, pas une régression.

## Vérification en ligne du 2026-08-08

`.htaccess` publié par FTPS et testé au `curl` :

- 11 redirections 301 : toutes correctes, un seul saut chacune
- 17 URL en 410 : toutes conformes, variantes `?page=N` incluses
- `X-Robots-Tag` présent sur `/aligneur/` (noindex, nofollow,
  noarchive) et sur `contact/envoyer.php` (noindex, nofollow)
- `/journal/` ne reçoit **aucun** en-tête noindex — pas de
  débordement du `SetEnvIf` sur les pages publiques
- `robots.txt` en ligne, sans `Disallow`

## Chantiers ouverts

- **Le certificat SSL ne couvre pas `www.alignement.com`.** Le SAN
  ne contient que `DNS:alignement.com`. Chaîne actuelle :
  `http://www...` → 301 (fait par l'hébergeur, avant le
  `.htaccess`) → `https://www...` → **erreur de certificat**.
  La règle www → non-www du `.htaccess` est correcte et vérifiée,
  mais personne ne l'atteint. Problème antérieur aux correctifs.
  Correction côté panneau d'hébergement : ajouter `www` au
  certificat, ou supprimer l'enregistrement DNS `www`.

- **`/aligneur/` reste volontairement privé** — une histoire pour
  les amis. Ses 22 pages ne doivent PAS entrer au sitemap, et leur
  absence des résultats n'est pas un problème à corriger. Ne pas
  reproposer de les indexer. Un `X-Robots-Tag: noindex, nofollow,
  noarchive` les couvre depuis le 8 août 2026. Le dossier reste
  accessible par lien direct, sans mot de passe.
- **`/meteo/` n'a pas d'`index.html`** — l'URL nue ne mène à rien.
  Y mettre une page de section ou rediriger vers `/meteo/conus/`.
- **`cuivre/index.html`** : neuf balises `<img src="">` vides et un
  gabarit `images/nom.jpg`. Les dossiers `cuivre/images/` et
  `cuivre/videos/` n'existent pas encore.
