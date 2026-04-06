#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
meteo_fetch.py — Téléchargement météo Est Amérique du Nord (2× par jour)
Source  : Open-Meteo (gratuit, sans clé API)
Sortie  : JSON dans DATA_DIR, format leaflet-velocity + scalaires

Déployer sur le VPS :
  cp meteo_fetch.py /home/alignem1/scripts/meteo_fetch.py
  chmod +x /home/alignem1/scripts/meteo_fetch.py

Cron (2× par jour — 03h07 UTC et 15h07 UTC) :
  7  3 * * * /usr/bin/python3 /home/alignem1/scripts/meteo_fetch.py >> /home/alignem1/logs/meteo.log 2>&1
  7 15 * * * /usr/bin/python3 /home/alignem1/scripts/meteo_fetch.py >> /home/alignem1/logs/meteo.log 2>&1
"""
import json
import math
import os
import sys
import time
import urllib.request
from datetime import datetime, timezone

# ── Configuration ────────────────────────────────────────────────────────────
DATA_DIR = "/home/alignem1/public_html/meteo/animation/data"
LOG_FILE = "/home/alignem1/logs/meteo.log"

# Grille Est de l'Amérique
LAT_MAX =  60.0   # nord
LAT_MIN =  20.0   # sud
LON_MIN = -100.0  # ouest
LON_MAX =  -45.0  # est
STEP    =   1.0   # résolution en degrés

BATCH   = 80      # points par requête API (limite URL)


# ── Construction de la grille ────────────────────────────────────────────────
def build_grid():
    lats, lons = [], []
    lat = LAT_MAX
    while lat >= LAT_MIN - 0.001:
        lats.append(round(lat, 4))
        lat -= STEP
    lon = LON_MIN
    while lon <= LON_MAX + 0.001:
        lons.append(round(lon, 4))
        lon += STEP
    ny, nx = len(lats), len(lons)
    # Aplatir en liste (nord→sud, ouest→est)
    flat_lats = [lats[i // nx] for i in range(ny * nx)]
    flat_lons = [lons[i % nx]  for i in range(ny * nx)]
    return lats, lons, flat_lats, flat_lons


# ── Logging ───────────────────────────────────────────────────────────────────
def log(msg):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = "[{}] {}\n".format(ts, msg)
    sys.stdout.write(line)
    sys.stdout.flush()
    try:
        os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
        with open(LOG_FILE, "a") as f:
            f.write(line)
    except Exception:
        pass


# ── Requête HTTP ──────────────────────────────────────────────────────────────
def fetch_json(url):
    for attempt in range(5):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "meteo_fetch/1.0"})
            with urllib.request.urlopen(req, timeout=60) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code == 429 or e.code >= 500:
                wait = 15 * (attempt + 1)
                log("HTTP {} — attente {}s (essai {}/5)…".format(e.code, wait, attempt + 1))
                time.sleep(wait)
            else:
                raise
        except urllib.error.URLError as e:
            wait = 15 * (attempt + 1)
            log("Erreur réseau {} — attente {}s (essai {}/5)…".format(e.reason, wait, attempt + 1))
            time.sleep(wait)
    raise Exception("Échec après 5 essais")


# ── Appels Open-Meteo ─────────────────────────────────────────────────────────
def fetch_forecast_batch(blats, blons):
    params = (
        "latitude={lats}&longitude={lons}"
        "&hourly=wind_speed_10m,wind_direction_10m,temperature_2m,precipitation,cloud_cover"
        "&forecast_days=1&timezone=UTC&models=gfs_seamless&wind_speed_unit=ms"
    ).format(
        lats=",".join(str(x) for x in blats),
        lons=",".join(str(x) for x in blons),
    )
    data = fetch_json("https://api.open-meteo.com/v1/forecast?" + params)
    return data if isinstance(data, list) else [data]


def fetch_marine_batch(blats, blons):
    params = (
        "latitude={lats}&longitude={lons}"
        "&hourly=wave_height,wave_direction"
        "&forecast_days=1&timezone=UTC"
    ).format(
        lats=",".join(str(x) for x in blats),
        lons=",".join(str(x) for x in blons),
    )
    try:
        data = fetch_json("https://marine-api.open-meteo.com/v1/marine?" + params)
        return data if isinstance(data, list) else [data]
    except Exception as e:
        log("AVERTISSEMENT marine batch: {}".format(e))
        return [{} for _ in blats]


# ── Conversion vitesse+direction → u/v ───────────────────────────────────────
def spd_dir_to_uv(speed, direction):
    if speed is None or direction is None:
        return None, None
    rad = math.radians(float(direction))
    u = round(-float(speed) * math.sin(rad), 3)
    v = round(-float(speed) * math.cos(rad), 3)
    return u, v


# ── Format leaflet-velocity ───────────────────────────────────────────────────
def make_velocity_json(u_data, v_data, ref_time, nx, ny):
    base_header = {
        "parameterCategory": 2,
        "la1": LAT_MAX, "la2": LAT_MIN,
        "lo1": LON_MIN, "lo2": LON_MAX,
        "dx": STEP, "dy": STEP,
        "nx": nx, "ny": ny,
        "refTime": ref_time,
        "forecastTime": 0,
        "scanMode": 0,
        "numberPoints": ny * nx,
    }
    h_u = dict(base_header)
    h_u["parameterNumber"] = 2
    h_u["parameterUnit"] = "m.s-1"
    h_u["parameterNumberName"] = "eastward_wind"

    h_v = dict(base_header)
    h_v["parameterNumber"] = 3
    h_v["parameterUnit"] = "m.s-1"
    h_v["parameterNumberName"] = "northward_wind"

    return [
        {"header": h_u, "data": u_data},
        {"header": h_v, "data": v_data},
    ]


# ── Traitement et sauvegarde ──────────────────────────────────────────────────
def process_and_save(fc_all, mr_all, lats, lons):
    ny = len(lats)
    nx = len(lons)
    n  = ny * nx

    times   = fc_all[0]["hourly"]["time"]
    n_hours = min(24, len(times))
    ref_time = times[0] + ":00Z"

    # Tableaux par heure [heure][point]
    wind_u = [[] for _ in range(n_hours)]
    wind_v = [[] for _ in range(n_hours)]
    wave_u = [[] for _ in range(n_hours)]
    wave_v = [[] for _ in range(n_hours)]
    temp   = [[] for _ in range(n_hours)]
    prec   = [[] for _ in range(n_hours)]
    cloud  = [[] for _ in range(n_hours)]

    for i in range(n):
        fc_h = fc_all[i].get("hourly", {}) if fc_all[i] else {}
        mr_h = mr_all[i].get("hourly", {}) if mr_all[i] else {}

        ws   = fc_h.get("wind_speed_10m",     [None] * n_hours)
        wd   = fc_h.get("wind_direction_10m", [None] * n_hours)
        t2   = fc_h.get("temperature_2m",     [None] * n_hours)
        pp   = fc_h.get("precipitation",      [None] * n_hours)
        cc   = fc_h.get("cloud_cover",        [None] * n_hours)
        wh   = mr_h.get("wave_height",        [None] * n_hours)
        wdir = mr_h.get("wave_direction",     [None] * n_hours)

        for h in range(n_hours):
            u, v = spd_dir_to_uv(
                ws[h] if h < len(ws) else None,
                wd[h] if h < len(wd) else None,
            )
            wind_u[h].append(u)
            wind_v[h].append(v)
            temp[h].append(t2[h] if h < len(t2) else None)
            prec[h].append(pp[h] if h < len(pp) else None)
            cloud[h].append(cc[h] if h < len(cc) else None)

            wu, wv = spd_dir_to_uv(
                wh[h]   if h < len(wh)   else None,
                wdir[h] if h < len(wdir) else None,
            )
            wave_u[h].append(wu)
            wave_v[h].append(wv)

    os.makedirs(DATA_DIR, exist_ok=True)

    for h in range(n_hours):
        hh = "{:02d}".format(h)

        wj = make_velocity_json(wind_u[h], wind_v[h], ref_time, nx, ny)
        with open("{}/wind_{}.json".format(DATA_DIR, hh), "w") as f:
            json.dump(wj, f, separators=(',', ':'))

        vj = make_velocity_json(wave_u[h], wave_v[h], ref_time, nx, ny)
        with open("{}/waves_{}.json".format(DATA_DIR, hh), "w") as f:
            json.dump(vj, f, separators=(',', ':'))

    scalar = {
        "grid": {
            "la1": LAT_MAX, "la2": LAT_MIN,
            "lo1": LON_MIN, "lo2": LON_MAX,
            "nx": nx, "ny": ny, "step": STEP,
        },
        "times": times[:n_hours],
        "temperature": temp,
        "precipitation": prec,
        "cloud": cloud,
    }
    with open("{}/scalar.json".format(DATA_DIR), "w") as f:
        json.dump(scalar, f, separators=(',', ':'))

    meta = {
        "generated": datetime.now(timezone.utc).isoformat(),
        "hours": n_hours,
        "refTime": ref_time,
        "grid": {"ny": ny, "nx": nx, "step": STEP},
    }
    with open("{}/meta.json".format(DATA_DIR), "w") as f:
        json.dump(meta, f, indent=2)

    log("Sauvegardé : {} heures × {} points ({} × {})".format(n_hours, n, ny, nx))


# ── Point d'entrée ────────────────────────────────────────────────────────────
def main():
    log("=== meteo_fetch démarré ===")

    lats, lons, flat_lats, flat_lons = build_grid()
    ny = len(lats)
    nx = len(lons)
    n  = ny * nx
    log("Grille {}×{} = {} points".format(ny, nx, n))

    fc_all = [None] * n
    mr_all = [None] * n

    for start in range(0, n, BATCH):
        end = min(start + BATCH, n)
        bl = flat_lats[start:end]
        bo = flat_lons[start:end]
        log("Batch {}-{}/{} — prévisions GFS…".format(start, end - 1, n))
        try:
            batch = fetch_forecast_batch(bl, bo)
            for j, item in enumerate(batch):
                fc_all[start + j] = item
        except Exception as e:
            log("ERREUR prévisions: {}".format(e))
            sys.exit(1)

        log("Batch {}-{}/{} — marines…".format(start, end - 1, n))
        batch_mr = fetch_marine_batch(bl, bo)
        for j, item in enumerate(batch_mr):
            mr_all[start + j] = item if item else {}

        time.sleep(2)

    log("Traitement des données…")
    try:
        process_and_save(fc_all, mr_all, lats, lons)
    except Exception as e:
        log("ERREUR traitement: {}".format(e))
        import traceback; traceback.print_exc()
        sys.exit(1)

    log("=== Terminé avec succès ===")


if __name__ == "__main__":
    main()
