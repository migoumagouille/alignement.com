document.addEventListener('DOMContentLoaded', function() {

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');

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
