document.getElementById('contactForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const btn = this.querySelector('.submit-btn');
  const status = document.getElementById('statusMsg');
  btn.textContent = 'Envoi en cours...';
  btn.disabled = true;
  status.className = 'status-msg';
  status.style.display = 'none';

  const data = new FormData();
  data.append('nom',      document.getElementById('nom').value);
  data.append('courriel', document.getElementById('courriel').value);
  data.append('message',  document.getElementById('message').value);

  try {
    const res = await fetch('/contact/envoyer.php', {
      method: 'POST',
      body: data
    });
    const json = await res.json();

    if (json.success) {
      status.textContent = '✅ Message envoyé! Nous vous répondrons sous peu.';
      status.className = 'status-msg success';
      this.reset();
    } else {
      throw new Error(json.message || 'Erreur inconnue');
    }
  } catch (err) {
    status.textContent = '❌ Une erreur est survenue. Veuillez réessayer ou écrire à admin@alignement.com';
    status.className = 'status-msg error';
  }

  status.style.display = 'block';
  btn.textContent = '✉️  Envoyer le message';
  btn.disabled = false;
});
