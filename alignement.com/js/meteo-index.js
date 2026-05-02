const VILLES = [
  { nom: "Saint-Bruno",    prov: "Qc",       lat: 45.537, lon: -73.352 },
  { nom: "Montréal",       prov: "Qc",       lat: 45.508, lon: -73.587 },
  { nom: "Québec",         prov: "Qc",       lat: 46.813, lon: -71.208 },
  { nom: "Trois-Rivières", prov: "Qc",       lat: 46.344, lon: -72.543 },
  { nom: "Sherbrooke",     prov: "Qc",       lat: 45.401, lon: -71.899 },
  { nom: "Gaspé",          prov: "Qc",       lat: 48.832, lon: -64.484 },
  { nom: "Rimouski",       prov: "Qc",       lat: 48.449, lon: -68.530 },
  { nom: "Saguenay",       prov: "Qc",       lat: 48.428, lon: -71.065 },
  { nom: "Sept-Îles",      prov: "Qc",       lat: 50.201, lon: -66.383 },
  { nom: "Ottawa",         prov: "On",       lat: 45.421, lon: -75.697 },
  { nom: "Moncton",        prov: "N.-B.",    lat: 46.088, lon: -64.778 },
  { nom: "Halifax",        prov: "N.-É.",    lat: 44.649, lon: -63.575 },
  { nom: "Fredericton",    prov: "N.-B.",    lat: 45.965, lon: -66.646 },
  { nom: "Charlottetown",  prov: "Î.-P.-É.", lat: 46.238, lon: -63.133 },
  { nom: "St. John's",     prov: "T.-N.",    lat: 47.561, lon: -52.713 },
];

const ARROWS = ['↓','↙','←','↖','↑','↗','→','↘'];

function degToArrow(deg) {
  return ARROWS[Math.round(deg / 45) % 8];
}

async function fetchVille(ville) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${ville.lat}&longitude=${ville.lon}&current=temperature_2m,wind_speed_10m,wind_direction_10m,precipitation,surface_pressure&timezone=America/Toronto&wind_speed_unit=kmh`;
  const res = await fetch(url);
  const data = await res.json();
  return data.current;
}

function createCard(ville, idx) {
  const div = document.createElement('div');
  div.className = 'ville-card';
  div.id = `card-${idx}`;
  div.innerHTML = `
    <div class="ville-nom">${ville.nom} <span class="ville-prov">${ville.prov}</span></div>
    <div class="metrics-row">
      <div class="metric-mini temp"><div class="val" id="t-${idx}"><span class="loading-dots">···</span></div><div class="lbl">Température</div></div>
      <div class="metric-mini vent"><div class="val" id="w-${idx}"><span class="loading-dots">···</span></div><div class="lbl">Vent</div></div>
      <div class="metric-mini pres"><div class="val" id="p-${idx}"><span class="loading-dots">···</span></div><div class="lbl">Pression</div></div>
      <div class="metric-mini prec"><div class="val" id="r-${idx}"><span class="loading-dots">···</span></div><div class="lbl">Précip.</div></div>
    </div>`;
  return div;
}

async function loadVille(ville, idx) {
  try {
    const c = await fetchVille(ville);
    const t = document.getElementById(`t-${idx}`);
    const w = document.getElementById(`w-${idx}`);
    const p = document.getElementById(`p-${idx}`);
    const r = document.getElementById(`r-${idx}`);
    if (t) t.textContent = `${c.temperature_2m.toFixed(1)}°C`;
    if (w) w.innerHTML = `${Math.round(c.wind_speed_10m)} km/h <span class="wind-arrow">${degToArrow(c.wind_direction_10m)}</span>`;
    if (p) p.textContent = `${Math.round(c.surface_pressure)} hPa`;
    if (r) r.textContent = `${c.precipitation.toFixed(1)} mm`;
  } catch(e) {
    ['t','w','p','r'].forEach(k => {
      const el = document.getElementById(`${k}-${idx}`);
      if (el) el.textContent = '—';
    });
  }
}

const REFRESH_MS = 10 * 60 * 1000; // 10 minutes

async function refreshData() {
  for (let i = 0; i < VILLES.length; i += 3) {
    const lot = VILLES.slice(i, i + 3).map((v, j) => loadVille(v, i + j));
    await Promise.all(lot);
    await new Promise(r => setTimeout(r, 300));
  }

  const now = new Date();
  const prochaine = new Date(now.getTime() + REFRESH_MS);
  document.getElementById('updateTime').textContent =
    `Données à jour — ${now.toLocaleTimeString('fr-CA', {hour:'2-digit', minute:'2-digit'})} · prochaine mise à jour ${prochaine.toLocaleTimeString('fr-CA', {hour:'2-digit', minute:'2-digit'})}`;
}

async function init() {
  const grid = document.getElementById('villesGrid');
  VILLES.forEach((ville, idx) => {
    grid.appendChild(createCard(ville, idx));
  });

  await refreshData();
  setInterval(refreshData, REFRESH_MS);
}

init();
