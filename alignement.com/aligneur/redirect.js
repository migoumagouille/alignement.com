const messages = [
  "Initialisation...",
  "Lecture des menhirs...",
  "Alignement en cours...",
  "Vous êtes téléchargé.",
];
let i = 0;
const el = document.getElementById('enter-text');
const interval = setInterval(() => {
  i++;
  if (i < messages.length) {
    el.textContent = messages[i];
  } else {
    clearInterval(interval);
    setTimeout(() => {
      document.body.style.transition = 'opacity 1.2s ease';
      document.body.style.opacity = '0';
      setTimeout(() => window.location.href = 'table.html', 1200);
    }, 800);
  }
}, 2500);
