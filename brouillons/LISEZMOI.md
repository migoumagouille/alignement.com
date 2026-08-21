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

### `vol-libre.html` — « La colline et le vent », commencé le 24 juin 2026

Le vol libre au Québec, des débuts de pionnier jusqu'à la voilerie
Air Terre Mer. Cinq sections, quinze paragraphes : la structure est là,
et la page est techniquement conforme (pas de `on*=`, polices locales,
`noindex` de sécurité en place).

**Ce qui bloque : le texte affirme des faits biographiques qui ont été
inventés.** L'article est écrit à la première personne sur la vie de Gil,
et les passages marqués `<!-- À CONFIRMER -->` sont des placeholders
plausibles, pas des souvenirs. Ils ne doivent pas être publiés tels quels,
ni comblés par qui que ce soit d'autre que Gil.

Réponses obtenues :

- [x] Titre « La colline et le vent » — confirmé, on le garde
- [x] Catégorie « Mémoires », comme `legs-des-hippies`

En attente de Gil :

- [ ] **La première fois** (l. 334) — année, lieu, circonstances. Le texte
      dit « début des années 1980 » et « un champ en pente douce » : inventé
- [ ] **Les sites fréquentés** (l. 386) — « collines des Laurentides,
      escarpements de la Rive-Sud » : inventé
- [ ] **Deltaplane, parapente, ou les deux**, et sur quelles années
- [ ] **L'encadré « Ce que pionnier veut dire »** (l. 396) — club, école,
      formation de pilotes, association? Rédigé en termes vagues faute de
      savoir
- [ ] **Le lien avec la voilerie** (l. 439) — est-ce vraiment le vol libre
      qui a mené à Air Terre Mer, et en quelle année?
- [ ] **L'arrivée du vol libre au Québec** (l. 375) — « fin des années
      1970 » est à vérifier, ce n'est pas un souvenir mais une estimation
- [ ] **La photo** `journal/images/vol-libre.jpg` — 1200×630, n'existe pas.
      Le `<figure>` et l'`og:image` sont en commentaire en attendant, l'alt
      reste à écrire une fois la photo choisie
- [ ] **La date de publication** — l'en-tête porte `2026-06-24`, date du
      début de l'écriture

Vérifié et exact, à garder tel quel : Otto Lilienthal (l. 364), planeur à
partir de 1891, mort le 9 août 1896 des suites d'une chute.
