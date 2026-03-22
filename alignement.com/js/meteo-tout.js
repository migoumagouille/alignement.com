// ── Countdown + reload ──
const INTERVAL = 30 * 60;
let remaining = INTERVAL;

function pad(n) { return String(n).padStart(2, '0'); }

function updateCountdown() {
  remaining--;
  if (remaining <= 0) {
    remaining = INTERVAL;
    const img = document.getElementById('satellite');
    img.src = img.src.split('?')[0] + '?t=' + Date.now();
  }
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  document.getElementById('countdown').textContent = pad(m) + ':' + pad(s);
}

setInterval(updateCountdown, 1000);

(() => {
  const img = document.getElementById('satellite');
  img.src = img.src.split('?')[0] + '?t=' + Date.now();
})();
