fetch('/journal/articles.json')
  .then(r => r.json())
  .then(articles => {
    const grid = document.getElementById('journalApercu');
    const mois = ['janvier','février','mars','avril','mai','juin',
                  'juillet','août','septembre','octobre','novembre','décembre'];
    articles.slice().reverse().slice(0, 3).forEach((a, i) => {
      const d = new Date(a.date);
      const dateStr = `${d.getDate()} ${mois[d.getMonth()]} ${d.getFullYear()}`;
      const card = document.createElement('a');
      card.className = 'journal-card';
      card.href = a.fichier;
      card.style.animationDelay = (i * 0.08 + 0.1) + 's';
      const meta = document.createElement('div');
      meta.className = 'jcard-meta';
      const cat = document.createElement('span');
      cat.className = 'jcard-cat';
      cat.textContent = a.categorie;
      const date = document.createElement('span');
      date.className = 'jcard-date';
      date.textContent = dateStr;
      meta.appendChild(cat);
      meta.appendChild(date);
      const title = document.createElement('div');
      title.className = 'jcard-title';
      title.textContent = a.titre;
      const resume = document.createElement('div');
      resume.className = 'jcard-resume';
      resume.textContent = a.resume;
      card.appendChild(meta);
      card.appendChild(title);
      card.appendChild(resume);
      grid.appendChild(card);
    });
  })
  .catch(() => {});
