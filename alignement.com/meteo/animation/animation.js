// ── État global ──────────────────────────────────────────────────────────────
let currentLayer = 'wind';
let currentHour  = 0;
let playing      = false;
let playTimer    = null;
let totalHours   = 24;
let scalarData   = null;
let metaData     = null;
let velocityLayer  = null;
let canvasLayerObj = null;
const dataCache  = {};
let renderToken  = 0;

// ── Carte Leaflet ────────────────────────────────────────────────────────────
const map = L.map('map', {
  center: [45, -75],
  zoom: 5,
  zoomControl: true,
});

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap © CARTO',
  subdomains: 'abcd',
  maxZoom: 10,
}).addTo(map);

// ── Couche canvas (temp / précip) ────────────────────────────────────────────
const ScalarLayer = L.Layer.extend({
  onAdd: function(map) {
    this._map = map;
    this._canvas = document.createElement('canvas');
    this._canvas.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;z-index:300;';
    map.getPanes().overlayPane.appendChild(this._canvas);
    map.on('moveend zoomend resize', this._redraw, this);
    this._redraw();
  },
  onRemove: function(map) {
    map.off('moveend zoomend resize', this._redraw, this);
    if (this._canvas && this._canvas.parentNode) {
      this._canvas.parentNode.removeChild(this._canvas);
    }
  },
  setParams: function(data, type, hour) {
    this._data  = data;
    this._type  = type;
    this._hour  = hour;
    this._redraw();
  },
  _redraw: function() {
    if (!this._map || !this._data) return;
    const map = this._map;
    const size = map.getSize();
    const canvas = this._canvas;
    canvas.width  = size.x;
    canvas.height = size.y;
    L.DomUtil.setPosition(canvas, map.containerPointToLayerPoint([0, 0]));

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size.x, size.y);

    const { grid } = this._data;
    const { la1, lo1, nx, ny, step } = grid;
    const values = this._type === 'temperature'
      ? this._data.temperature[this._hour]
      : this._type === 'cloud'
        ? this._data.cloud[this._hour]
        : this._data.precipitation[this._hour];
    if (!values) return;

    // Taille d'une cellule en pixels
    const p0  = map.latLngToContainerPoint([la1, lo1]);
    const pSE = map.latLngToContainerPoint([la1 - step, lo1 + step]);
    const cellW = Math.abs(pSE.x - p0.x) + 1;
    const cellH = Math.abs(pSE.y - p0.y) + 1;

    for (let row = 0; row < ny; row++) {
      for (let col = 0; col < nx; col++) {
        const val = values[row * nx + col];
        const color = getScalarColor(this._type, val);
        if (!color) continue;
        const lat = la1 - row * step;
        const lon = lo1 + col * step;
        const pt  = map.latLngToContainerPoint([lat, lon]);
        ctx.fillStyle = color;
        ctx.fillRect(pt.x - cellW / 2, pt.y - cellH / 2, cellW, cellH);
      }
    }
  },
});

// ── Couleurs scalaires ───────────────────────────────────────────────────────
const TEMP_STOPS = [
  [-35, [60,  0,  130]],
  [-20, [0,   40, 220]],
  [  0, [0,  190, 220]],
  [ 10, [0,  200,  80]],
  [ 20, [240,220,   0]],
  [ 30, [255, 100,  0]],
  [ 40, [180,  0,   0]],
];

function lerp(a, b, t) { return a + (b - a) * t; }

function interpColor(stops, val) {
  if (val <= stops[0][0]) return stops[0][1];
  if (val >= stops[stops.length-1][0]) return stops[stops.length-1][1];
  for (let i = 0; i < stops.length - 1; i++) {
    const [v0, c0] = stops[i], [v1, c1] = stops[i+1];
    if (val >= v0 && val <= v1) {
      const t = (val - v0) / (v1 - v0);
      return [lerp(c0[0],c1[0],t), lerp(c0[1],c1[1],t), lerp(c0[2],c1[2],t)];
    }
  }
}

function getScalarColor(type, val) {
  if (val === null || val === undefined) return null;
  if (type === 'temperature') {
    const [r,g,b] = interpColor(TEMP_STOPS, val);
    return 'rgba(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ',0.35)';
  }
  if (type === 'precipitation') {
    if (val <= 0) return null;
    const t = Math.min(1, val / 20);
    const alpha = 0.05 + t * 0.25;
    const r = Math.round(lerp(120, 20, t));
    const g = Math.round(lerp(160, 80, t));
    const b = Math.round(lerp(255, 255, t));
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }
  if (type === 'cloud') {
    if (val === null || val <= 0) return null;
    const t = Math.min(1, val / 100);
    const alpha = 0.05 + t * 0.18;
    return 'rgba(200,220,255,' + alpha.toFixed(2) + ')';
  }
  return null;
}

// ── Légende ──────────────────────────────────────────────────────────────────
const legends = {
  wind: {
    title: 'Vent (km/h)',
    gradient: 'linear-gradient(to right, #3ecfb0, #5b8dee, #e8a020, #e05555)',
    labels: ['0', '36', '72', '108+'],
  },
  precipitation: {
    title: 'Précip. (mm)',
    gradient: 'linear-gradient(to right, rgba(120,160,255,0.3), #2050ff)',
    labels: ['0', '5', '10', '20+'],
  },
  temperature: {
    title: 'Temp. (°C)',
    gradient: 'linear-gradient(to right,#3c0082,#0028dc,#00bede,#00c852,#f0dc00,#ff6400,#b40000)',
    labels: ['-35', '0', '10', '30', '40'],
  },
  waves: {
    title: 'Vagues (m)',
    gradient: 'linear-gradient(to right, #3ecfb0, #5b8dee, #e8a020)',
    labels: ['0', '2', '4', '6+'],
  },
  cloud: {
    title: 'Nuages (%)',
    gradient: 'linear-gradient(to right, rgba(200,220,255,0.1), rgba(200,220,255,0.9))',
    labels: ['0', '25', '50', '75', '100'],
  },
};

function updateLegend(layer) {
  const el = document.getElementById('legend');
  const l  = legends[layer];
  if (!l) { el.style.display = 'none'; return; }
  el.style.display = 'block';
  document.getElementById('legendTitle').textContent = l.title;
  document.getElementById('legendGrad').style.background = l.gradient;
  const labEl = document.getElementById('legendLabels');
  labEl.innerHTML = l.labels.map(x => '<span>' + x + '</span>').join('');
}

// ── Chargement des données de vélocité ────────────────────────────────────────
async function loadVelocityData(type, hour) {
  const key = type + '_' + hour;
  if (dataCache[key]) return dataCache[key];
  const hh = String(hour).padStart(2, '0');
  const resp = await fetch('data/' + type + '_' + hh + '.json');
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  const data = await resp.json();
  dataCache[key] = data;
  return data;
}

// ── Rendu d'une couche ────────────────────────────────────────────────────────
async function renderLayer(layer, hour) {
  const token = ++renderToken;

  if (velocityLayer)  { map.removeLayer(velocityLayer);  velocityLayer  = null; }
  if (canvasLayerObj) { map.removeLayer(canvasLayerObj); canvasLayerObj = null; }

  setStatus('Chargement ' + layer + ' h' + String(hour).padStart(2,'0') + '…', false);

  if (layer === 'wind' || layer === 'waves') {
    try {
      const data = await loadVelocityData(layer, hour);
      if (token !== renderToken) return;
      velocityLayer = L.velocityLayer({
        displayValues: true,
        displayOptions: {
          velocityType: layer === 'wind' ? 'Vent' : 'Vague',
          position: 'bottomleft',
          emptyString: 'Aucune donnée',
          angleConvention: 'meteoCW',
          speedUnit: layer === 'wind' ? 'k/h' : 'm',
        },
        data: data,
        maxVelocity: layer === 'wind' ? 25 : 6,
        colorScale: layer === 'wind'
          ? ['#3ecfb0','#5b8dee','#e8a020','#e05555']
          : ['#88ccff','#4488ff','#2244cc'],
        lineWidth: 1.5,
        velocityScale: layer === 'wind' ? 0.005 : 0.025,
        opacity: 0.85,
      });
      map.addLayer(velocityLayer);
    } catch(e) {
      setStatus('Erreur chargement : ' + e.message, false);
      return;
    }
  } else {
    if (!scalarData) {
      setStatus('Données scalaires non disponibles', false);
      return;
    }
    canvasLayerObj = new ScalarLayer();
    map.addLayer(canvasLayerObj);
    canvasLayerObj.setParams(scalarData, layer, hour);
  }

  updateLegend(layer);
  setStatus(formatRefTime(hour), true);
}

// ── Formatage de l'heure ──────────────────────────────────────────────────────
function formatRefTime(hour) {
  if (!metaData) return 'h ' + String(hour).padStart(2,'0');
  try {
    const base = new Date(metaData.refTime);
    base.setUTCHours(base.getUTCHours() + hour);
    return base.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
  } catch(e) {
    return 'h ' + String(hour).padStart(2,'0');
  }
}

// ── Status bar ────────────────────────────────────────────────────────────────
function setStatus(msg, live) {
  document.getElementById('statusText').textContent = msg;
  const dot = document.getElementById('statusDot');
  dot.style.background = live ? 'var(--accent2)' : 'var(--border)';
}

// ── Initialisation ────────────────────────────────────────────────────────────
async function init() {
  setStatus('Vérification des données…', false);

  try {
    const resp = await fetch('data/meta.json');
    if (!resp.ok) throw new Error('meta.json absent');
    metaData = await resp.json();
    totalHours = metaData.hours || 24;
    document.getElementById('timeSlider').max = totalHours - 1;
  } catch(e) {
    document.getElementById('no-data').style.display = 'block';
    setStatus('Données météo non disponibles', false);
    return;
  }

  try {
    const resp = await fetch('data/scalar.json');
    if (resp.ok) scalarData = await resp.json();
  } catch(e) {
    console.warn('scalar.json non chargé:', e);
  }

  await renderLayer(currentLayer, currentHour);
}

// ── Contrôles ─────────────────────────────────────────────────────────────────
document.querySelectorAll('.layer-btn').forEach(btn => {
  btn.addEventListener('click', async function() {
    document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentLayer = this.dataset.layer;
    await renderLayer(currentLayer, currentHour);
  });
});

const slider = document.getElementById('timeSlider');
const timeDisplay = document.getElementById('timeDisplay');

slider.addEventListener('input', async function() {
  currentHour = parseInt(this.value);
  timeDisplay.textContent = String(currentHour).padStart(2, '0') + ' h';
  await renderLayer(currentLayer, currentHour);
});

const playBtn = document.getElementById('playBtn');

async function playStep() {
  if (!playing) return;
  currentHour = (currentHour + 1) % totalHours;
  slider.value = currentHour;
  timeDisplay.textContent = String(currentHour).padStart(2, '0') + ' h';
  await renderLayer(currentLayer, currentHour);
  if (playing) playTimer = setTimeout(playStep, 5000);
}

playBtn.addEventListener('click', function() {
  playing = !playing;
  if (playing) {
    this.textContent = '⏸';
    this.classList.add('playing');
    playTimer = setTimeout(playStep, 5000);
  } else {
    this.textContent = '▶';
    this.classList.remove('playing');
    clearTimeout(playTimer);
  }
});

init();
