// ── Countdown + reload ──
const INTERVAL = 10 * 60;
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

// ── Tooltip ──
const tooltip = document.getElementById('map-tooltip');

document.querySelectorAll('map area').forEach(area => {
  const label = area.getAttribute('alt') || '';
  area.addEventListener('mousemove', e => {
    tooltip.textContent = label;
    tooltip.style.display = 'block';
    tooltip.style.left = (e.clientX + 14) + 'px';
    tooltip.style.top  = (e.clientY - 28) + 'px';
  });
  area.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
  });
});
