document.addEventListener('DOMContentLoaded', function() {
  const btn = document.getElementById('retour-btn');
  if (btn) {
    btn.addEventListener('click', function() {
      history.back();
    });
  }
});
