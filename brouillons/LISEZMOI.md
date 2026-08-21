# Brouillons

Articles en cours d'écriture, suivis par git pour être sauvegardés, mais
**hors de `alignement.com/`** pour qu'ils ne puissent pas partir sur le serveur
par mégarde.

Un brouillon n'est ni dans `journal/articles.json` ni dans `sitemap.xml` :
il n'existe pour personne d'autre tant qu'il n'est pas publié.

## Publier un brouillon

1. Terminer ce qui manque (voir la liste ci-dessous)
2. `git mv brouillons/<nom>.html alignement.com/journal/<nom>.html`
3. Suivre la marche à suivre de `alignement.com/CLAUDE.md`, section
   « Publier un article » : image, `articles.json`, `sitemap.xml`

## En cours

### `vol-libre.html` — commencé le 24 juin 2026

Le vol libre au Québec, des débuts de pionnier jusqu'à la voilerie
Air Terre Mer. Cinq sections, quinze paragraphes : la structure est là,
c'est la finition qui manque.

Reste à faire :

- [ ] La photo `journal/images/vol-libre.jpg` n'existe pas, et l'attribut
      alt est resté un placeholder (`alt="…"`) — à écrire une fois la
      photo choisie
- [ ] Un commentaire `<!-- À CONFIRMER -->` subsiste dans la section
      « La voilerie, prolongement naturel », sur le lien entre le vol libre
      et la création de la voilerie
- [ ] Revoir la date : l'en-tête porte encore `2026-06-24`, celle du début
      de l'écriture
