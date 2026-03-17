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

// ── Imagemap mobile ──
function scaleMap() {
  const img = document.getElementById('satellite');
  if (!img.naturalWidth) return;
  const scaleX = img.offsetWidth  / img.naturalWidth;
  const scaleY = img.offsetHeight / img.naturalHeight;
  document.querySelectorAll('map area').forEach(area => {
    const orig = area.dataset.origCoords || area.getAttribute('coords');
    if (!area.dataset.origCoords) area.dataset.origCoords = orig;
    const scaled = orig.split(',').map((v, i) =>
      Math.round(Number(v) * (i % 2 === 0 ? scaleX : scaleY))
    ).join(',');
    area.setAttribute('coords', scaled);
  });
}

// Forcer image fraîche + déclencher scaleMap au chargement
window.addEventListener('load', () => {
  const img = document.getElementById('satellite');
  img.addEventListener('load', scaleMap);
  img.src = img.src.split('?')[0] + '?t=' + Date.now();
});

window.addEventListener('resize', scaleMap);
