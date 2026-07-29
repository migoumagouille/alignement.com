document.addEventListener('DOMContentLoaded', function() {

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');

  // Photos manquantes : masquer l'image et révéler le cadre 📸.
  // Cette logique était dans des attributs onerror= en ligne, que la CSP
  // du site (script-src sans 'unsafe-inline') empêchait de s'exécuter.
  function afficherRepli(img) {
    img.style.display = 'none';
    const repli = img.nextElementSibling;
    if (repli && repli.classList.contains('placeholder')) {
      repli.style.display = 'flex';
    }
  }

  document.querySelectorAll('.photo-wrap img').forEach(function(img) {
    if (img.complete) {
      // Le chargement s'est terminé avant ce script : naturalWidth à 0 = échec.
      if (img.naturalWidth === 0) afficherRepli(img);
    } else {
      img.addEventListener('error', function() { afficherRepli(img); });
    }
  });

  // Ouvrir au clic sur une photo
  document.querySelectorAll('.photo-item').forEach(function(item) {
    item.addEventListener('click', function() {
      const img = item.querySelector('img');
      if (!img || img.style.display === 'none') return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.style.display = 'flex';
    });
  });

  // Fermer
  function closeLightbox() {
    lightbox.style.display = 'none';
    lightboxImg.src = '';
  }

  closeBtn.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', function(e) {
    if (e.target === this) closeLightbox();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeLightbox();
  });

});
