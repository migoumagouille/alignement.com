function formatDate(dateStr) {
  const mois = ['janvier','février','mars','avril','mai','juin',
                'juillet','août','septembre','octobre','novembre','décembre'];
  const d = new Date(dateStr);
  return `${d.getDate()} ${mois[d.getMonth()]} ${d.getFullYear()}`;
}

fetch('/journal/articles.json')
  .then(r => r.json())
  .then(articles => {
    const liste = document.getElementById('articlesList');
    // Plus récent en premier
    articles.reverse().forEach((a, i) => {
      const card = document.createElement('a');
      card.className = 'article-card';
      card.href = a.fichier;
      card.style.animationDelay = (i * 0.07 + 0.05) + 's';
      const meta = document.createElement('div');
      meta.className = 'card-meta';
      const cat = document.createElement('span');
      cat.className = 'categorie-badge';
      cat.textContent = a.categorie;
      const dateSpan = document.createElement('span');
      dateSpan.className = 'card-date';
      dateSpan.textContent = formatDate(a.date);
      meta.appendChild(cat);
      meta.appendChild(dateSpan);
      const title = document.createElement('div');
      title.className = 'card-title';
      title.textContent = a.titre;
      const resume = document.createElement('div');
      resume.className = 'card-resume';
      resume.textContent = a.resume;
      const arrow = document.createElement('span');
      arrow.className = 'card-arrow';
      arrow.textContent = '→';
      card.appendChild(meta);
      card.appendChild(title);
      card.appendChild(resume);
      card.appendChild(arrow);
      liste.appendChild(card);
    });
  })
  .catch(() => {
    const p = document.createElement('p');
    p.textContent = 'Aucun article pour le moment.';
    p.style.cssText = 'color:rgba(232,238,248,0.3);text-align:center;padding:40px 0;';
    document.getElementById('articlesList').appendChild(p);
  });
