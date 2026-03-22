document.addEventListener('DOMContentLoaded', function() {

  const lightbox = document.getElementById('lightbox');
  const closeBtn = document.getElementById('lightbox-close');
  const lightboxImg = document.getElementById('lightbox-img');

  window.openLightbox = function(src) {
    if (lightboxImg) lightboxImg.src = src;
    if (lightbox) lightbox.style.display = 'flex';
  };

  window.closeLightbox = function() {
    if (lightbox) lightbox.style.display = 'none';
    if (lightboxImg) lightboxImg.src = '';
  };

  if (closeBtn) {
    closeBtn.addEventListener('click', window.closeLightbox);
    closeBtn.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.closeLightbox(); }
    });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && lightbox && lightbox.style.display !== 'none') window.closeLightbox();
  });

  if (lightbox) {
    lightbox.addEventListener('click', function(e) {
      if (e.target === this) window.closeLightbox();
    });
  }

  // current.html — mot "secrets"
  const secretsLink = document.getElementById('secrets-link');
  if (secretsLink) {
    secretsLink.addEventListener('click', function(e) {
      e.preventDefault();
      window.openLightbox('images/lab.jpg');
    });
  }

  // mine.html — Suzie agrandie
  const suzieImg = document.getElementById('suzie-img');
  if (suzieImg) {
    suzieImg.addEventListener('click', function() {
      window.openLightbox('images/suzie_on_the_moon.jpg');
    });
  }

  // mine.html — personnages douteux
  const alietcopLink = document.getElementById('alietcop-link');
  if (alietcopLink) {
    alietcopLink.addEventListener('click', function(e) {
      e.preventDefault();
      window.openLightbox('images/alietcop.jpg');
    });
  }

  // mont_saint_hilaire.html — mot "yeux"
  const yeuxLink = document.getElementById('yeux-link');
  if (yeuxLink) {
    yeuxLink.addEventListener('click', function(e) {
      e.preventDefault();
      window.openLightbox('images/mont_st_gregoire.jpg');
    });
  }

  // photo.html — image esturgeon
  const esturgeonImg = document.getElementById('esturgeon-img');
  if (esturgeonImg) {
    esturgeonImg.addEventListener('click', function() {
      window.openLightbox('images/esturgeon.jpg');
    });
  }

  // photo.html — lien "ici"
  const iciLink = document.getElementById('ici-link');
  if (iciLink) {
    iciLink.addEventListener('click', function(e) {
      e.preventDefault();
      window.openLightbox('images/esturgeon.jpg');
    });
  }

});
