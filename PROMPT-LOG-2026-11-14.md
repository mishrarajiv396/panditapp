# Prompt Log — 14 November 2026

> Purpose: Resume the "Map integration" work exactly where it stopped.
> Status: **Implementation paused by user before map.js/map.css were written.**
> Last commit: `89eaa1c Add Mantra & Aarti Library; complete site-wide Hindi coverage and polish`
> Uncommitted at pause: only `assets/vendor/` (vendored Leaflet 1.9.4 files).

---

## 1. Aaj ke original prompts (user ke shabd)

1. **"BHAI YRR MAP ADD HO SAKTA HAI KYA"**
2. Map placement question ka jawab:
   - **Pandits page — service area map**
   - **Booking page — location confirm map**
   - (Cities page full India map aur About/Contact map **nahi** chahiye.)
3. **"STOP BHAI AAJ KE PROMT SAVE KR LO"** ← yahin kaam roka gaya.

---

## 2. Overall project goal

PanditApp (Vedic Pooja site) ko "best-in-class" banana:

- Unique, detailed content — competitor apps se aage.
- Top UI with animation everywhere; organic/real feel, no demo/placeholder vibe.
- Automation where possible.
- Bilingual **English + Hindi** everywhere.
- Offline-first PWA behaviour.
- Existing architecture maintain karna: static HTML/CSS/JS + Express/MySQL, **no build step**.
- Fast delivery.

---

## 3. Map feature — final decisions (locked)

| Decision | Value |
|---|---|
| Map library | **Leaflet 1.9.4**, vendored locally |
| Tiles | **OpenStreetMap** (free, no API key) |
| CDN | **Not allowed** — site CSP is `script-src 'self'` |
| Markers | Custom CSS `divIcon` / `circleMarker` — default Leaflet marker images avoid |
| Loading | Lazy — Leaflet JS loads only when map scrolls into view (`IntersectionObserver`) |
| Offline fallback | Clean schematic range chart (SVG concentric km rings) + zone/locality list |
| Booking payload | **Do not change** — map is visual confirmation only; no lat/lng DB columns |
| Placements | Exactly two: `pandits.html` coverage section + `booking.html` location confirm card |
| Permissions-Policy | Already allows `geolocation=(self)` — no change needed |
| CSP change needed | Add OSM tile host to `img-src` in `server/src/middleware/security.js` |

### Planned widgets

**Pandits page — "Gurugram & NCR coverage"**
- 8 zones with radius circles, dashed travel lines from Gurugram base.
- Zone buttons list: distance from base, ETA, "Same day" / "By appointment" badge.
- Selected zone expands to show localities + travel info + booking CTA.
- "Use my location" → nearest zone, distance, pulse marker; denies gracefully.
- Same-day cutoff note (4:00 pm), privacy note.
- CTA sets `vp_city` then opens `booking.html`.

**Booking page — "Confirm where the pandit should come"**
- Draggable pin centered on selected `#bookingCity`.
- Nearest known locality from `data.js` `CITIES` (1,057 real lat/lon) + hardcoded missing places.
- Shows nearest locality, distance from city centre, coverage badge, coordinates.
- "Use my location", "Reset pin", "Add area to address" (user-driven, optional).
- Address field matching: if typed address contains a known locality, pin moves there (unless user dragged).
- City select change recenters pin.
- No exact coordinates sent with booking.

### Planned zone data (NCR, distances computed via haversine from Gurugram base 28.4595, 77.0266)

1. Gurugram core (Sectors 1–57, DLF, Golf Course Road) — ~7 km, same day
2. New Gurugram / Dwarka Expressway (Sectors 58–115) — ~7 km, same day
3. Sohna Road & Badshahpur — ~9 km, same day
4. Manesar & IMT — ~14 km, same day (approx coords 28.3545, 76.9425)
5. Faridabad — ~22 km, by appointment
6. South & Central Delhi — ~28 km, by appointment
7. Noida & Greater Noida — ~38 km, by appointment (Greater Noida approx 28.4744, 77.5040)
8. Ghaziabad & Indirapuram — ~42 km, by appointment

Hindi names/descriptions for every zone + every UI string.

---

## 4. Work completed before the stop

- [x] Investigated `data.js`: 24 pandits, **1,057 CITIES with real lat/lon**.
- [x] Confirmed `Gurugram`, `Delhi`, `Noida`, `Ghaziabad`, `Faridabad`, `Sonipat` exist.
- [x] Confirmed `Manesar`, `Greater Noida`, `Sohna`, `Gurgaon` are **missing** → use hardcoded real approximate coords.
- [x] Confirmed CSP in `server/src/middleware/security.js` is tight; `img-src 'self' data: blob:` needs OSM host.
- [x] Confirmed `Permissions-Policy` already has `geolocation=(self)`.
- [x] Identified insertion points:
  - `pandits.html`: after pandit grid section ends (line ~79), before cream "Three-tier verification" section.
  - `booking.html`: after form grid in Step 2 (after `#bookGate`/`#bookLanguage`), before gate-pass consent.
- [x] Inspected `assets/js/app.js` APIs: `A.t(en, hi)`, `A.isHi()`, `A.onLang(fn)` (returns unsubscribe), `A.esc`, `A.findCity`, `A.store`, `A.icon`, `A.toast`.
- [x] Inspected booking payload: built in `confirmBooking()` in `assets/js/booking.js`; only `?pooja=` is read from URL; city saved in `vp_city`.
- [x] **Downloaded Leaflet 1.9.4 locally** into `assets/vendor/leaflet/`:
  - `leaflet.js` (147,552 B)
  - `leaflet.css` (14,806 B)
  - `images/marker-icon.png`, `marker-icon-2x.png`, `marker-shadow.png`, `layers.png`, `layers-2x.png`
  - `LICENSE`
- [x] This prompt log saved.

---

## 5. Work NOT started yet (resume exactly here)

1. **`assets/js/map.js`** — new module:
   - Lazy Leaflet loader from `assets/vendor/leaflet/leaflet.js` (idempotent, waiter queue).
   - Global `window.VedicMap` API.
   - `ZONES` data + `EXTRA_PLACES` + haversine + nearest-locality helpers.
   - Coverage widget + booking widget built from `[data-map="coverage"]` / `[data-map="booking"]`.
   - Tile error / offline detection → schematic fallback; manual "Schematic view" toggle.
   - `IntersectionObserver` init + `ResizeObserver` `invalidateSize`.
   - Draggable booking pin, geolocation path, city change, address matching.
   - `A.onLang` re-render; reduced-motion handling (`flyTo` → `setView`).
   - SVG schematic with km rings, clickable zone dots.
2. **`assets/css/map.css`** — new stylesheet:
   - Maroon/gold themed map card, header bar, tools, canvas, zone list, pills, footer.
   - Custom pins, tooltips, popups, Leaflet overrides, attribution.
   - Schematic fallback, loading shimmer, responsive, reduced-motion, print.
3. **`pandits.html`**
   - New coverage `<section>` between pandit grid section and cream verification section.
   - Add `assets/vendor/leaflet/leaflet.css` + `assets/css/map.css` in head.
   - Add `<script src="assets/js/map.js"></script>` after `pandits.js`.
4. **`booking.html`**
   - Add full-width map field after Step 2 form grid (before gate consent).
   - Add Leaflet CSS + `map.css`; add `map.js` after `booking.js`.
5. **`server/src/middleware/security.js`**
   - `img-src 'self' data: blob: https://tile.openstreetmap.org https://*.tile.openstreetmap.org`
6. **`sw.js`**
   - Add Leaflet JS/CSS/images + `map.css` + `map.js` to `CORE`.
   - Bump `VERSION` `vp-static-v58` → **`vp-static-v59`**.
7. **`assets/js/i18n-phrases.js`**
   - Append one curated IIFE with all static English→Hindi map phrases.
   - Dynamic strings can use `A.t(en, hi)` directly.
8. **`README.md`**
   - Document maps, OSM attribution, lazy loading, fallback, CSP requirement.
9. **Testing**
   - Headless Chrome at 320 / 390 / 768 / 1280.
   - Map init, tile load count, pins, zone selection, city change, geolocation denial, fallback.
   - 0 JS errors, 0 horizontal overflow.
   - Hindi verification via Node string asserts (headless output mangles Devanagari).
   - Hard refresh note: `Ctrl+Shift+R` after SW cache bump.
10. **Commit + push** (only after all tests pass).

---

## 6. Key files / context

| File | Why it matters |
|---|---|
| `assets/js/map.js` | New map module (to create) |
| `assets/css/map.css` | New map styles (to create) |
| `assets/vendor/leaflet/` | Already downloaded, currently untracked |
| `pandits.html` | Coverage section insertion point |
| `booking.html` | Location confirm card insertion point |
| `assets/js/booking.js` | City select + `confirmBooking()` payload — **do not change payload** |
| `assets/js/pandits.js` | Pandits filter/render logic |
| `server/src/middleware/security.js` | CSP needs OSM tile host |
| `assets/js/data.js` | 1,057 `CITIES` with real lat/lon; `PANDITS` have no coords |
| `assets/js/app.js` | `A.t`, `A.isHi`, `A.onLang`, `A.esc`, `A.findCity`, `A.store`, `A.icon` |
| `assets/js/i18n-phrases.js` | Static Hindi phrases (append IIFE) |
| `sw.js` | `CORE` cache list + version bump |
| `README.md` | Documentation |

### Coordinates remembered

- Gurugram base: `28.4595, 77.0266`
- Manesar: `28.3545, 76.9425`
- Greater Noida: `28.4744, 77.5040`
- Sohna: approx `28.2470, 77.0650`
- Faridabad: `28.4089, 77.3178`
- Noida: `28.5355, 77.3910`
- Ghaziabad: `28.6692, 77.4538`
- Delhi: `28.7041, 77.1025`
- Sonipat: `28.9931, 77.0151`

---

## 7. Important guardrails

- **No paid API key.**
- **No CDN scripts/styles** — vendored only.
- **Do not alter booking DB payload/schema.**
- **Do not fake data** — use real `CITIES` coordinates; approximate coords clearly labelled.
- OSM attribution must remain visible in Leaflet mode.
- Offline mode must still show useful zone/locality information.
- Maintain full EN/HI parity on both pages.
- Preserve existing design tokens: `--maroon #6d1f2c`, `--gold #c9a227`, `--surface #fffdf9`, `--radius-lg 26px`, fonts Marcellus/Inter/Tiro Devanagari.
- Test harness scratch files must be created in repo root (served) and deleted before commit.
- Chrome may hang after `--dump-dom`; kill with `Get-Process chrome | Stop-Process -Force`.
- PowerShell inline `node -e` breaks on quotes/non-ASCII → write scratch `.js` files instead.

---

## 8. Current repo state at pause

```
Branch: master
HEAD:   89eaa1c Add Mantra & Aarti Library; complete site-wide Hindi coverage and polish
Remote: in sync with origin/master
Working tree: ?? assets/vendor/   (Leaflet only)
```

Nothing else was modified. No map code has been written yet.
