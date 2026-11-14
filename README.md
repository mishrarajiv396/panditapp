# Satyanarayan Puja — website handoff

Owner: **Rajiv Lochan Mishra**  
Prepared: 31 October 2026  
Site type: static HTML/CSS/JS PWA with an optional Express + MySQL backend (no build step)

## 1. Seva details (single source)

All owner details live in **`assets/js/site-settings.js`**:

| Field | Value |
|---|---|
| Name | Rajiv Lochan Mishra |
| Mobile / WhatsApp | +91 88896 85370 |
| Email | rajivlochanmishra952@gmail.com |
| UPI ID | rajivlochanmishra952-1@okhdfcbank |

Changing `phone`, `phoneDisplay`, `email`, `upi` or `upiName` there updates the header, footer, Seva tab, call/WhatsApp/email links and the live QR. The static fallback QR is **`assets/img/upi-qr.svg`**; regenerate it if the UPI ID changes.

The header/footer are rebuilt from this file on every page. A live sync in
`assets/js/app.js` also rewrites any older hard-coded number, email or UPI ID in
the page HTML and in content inserted later by other scripts, so there is no
second copy to maintain. It runs at load, after every DOM change, when the tab
becomes visible, and on `pageshow` (back/forward cache).

**UPI QR payload (verified by decoding the rendered QR):**

```
upi://pay?pa=rajivlochanmishra952-1@okhdfcbank&pn=Rajiv%20Lochan%20Mishra&cu=INR
```

## 2. What is on the site

- `index.html` — home, today's panchang, pooja catalogue, free guide entry.
- `services.html` — Astrology, Vastu Shastra, Numerology (with a free birth-date and name calculator) and Pooja Paath, grouped into the nine living ritual traditions.
- `puja-guide.html` — the main free guide:
  - 8 guided steps with Devanagari, transliteration, meaning, device voice and timer
  - samagri checklist with family-size quantities and saved ticks
  - havan/ahuti counter with 11 / 21 / 108 targets
  - 5-adhyay katha reader with bookmarks and text size
  - Purnima / Ekadashi / Sankranti dates for the selected city
  - sankalp generator with print, copy and WhatsApp
  - **Plans tab** with the seven seva plans (₹1,100–₹51,000), a WhatsApp booking link per plan and one `plans` array in `puja-data.js` for every price
  - **Seva tab** with owner name, UPI ID, scannable QR, UPI app, call, WhatsApp and email
  - About tab with source status and safety notes
- Other pages — poojas (100 rituals in 9 categories), services, booking (demo checkout), pandits (demo profiles), panchang, calendar, kundli, matching, shop, about, policies.
- `panchang.html` - the daily panchang is fully computed for **1,057 places** (all **791 Indian districts**, 161 famous tirths/hill stations/beaches, the metro list and NRI hubs) with WGS-84 coordinates, IANA time zones, moonrise/moonset, moon phase, panchak, bhadra, hora, choghadiya, all six panchang limbs, a “tithi in focus” panel and a 30-tithi guide with meaning, deity, nature, guidance, festivals and the next date each tithi occurs.
- `cities.html` — searchable directory of all 1,057 places with state/type filters, district vs famous-place badges, exact coordinates, local time, live panchang per place, “set as my city” and shareable deep links (`cities.html?city=Kedarnath`).
- `horoscope.html` — daily rashifal for all 12 moon signs, computed from the Moon’s real transit house, tithi, nakshatra, yoga and paksha for the selected city and date. Each card shows a strength score, and the detail panel adds lucky colour/number/direction, gemstone, mantra, favourable choghadiya windows and Rahu Kaal to avoid. No random text.
- `kundli.html` — the birth chart includes the panchang at the birth moment (tithi, nakshatra, yoga, karana), lagna nakshatra/pada, dasha balance, moon phase and the city's coordinates/UTC offset.
- `calendar.html` — computed festival calendar with `.ics` export: “Add 2026 festivals”, “Add next 90 days” and “Add to calendar” on any selected date. Each event carries a one-day-before alarm for the phone’s calendar app; the file is built in the browser and works offline.
- `muhurat.html` — **Muhurat Studio**, the planning workspace that runs the real panchang engine instead of a printed table. Pick a ritual, city, guest count, gotra, budget and required extras; it scans the next 7–90 days, scores every day against that ritual's own rules (tithi, nakshatra, yoga, karana, paksha, vara, Bhadra, Panchak, Rahu/Gulika/Yamaganda, Abhijit and choghadiya), then shows the best date, the best 2-hour window, why other dates lost, the full panchang strip, a printable runbook timeline, scaled samagri quantities, a GST-inclusive budget, and `.ics`/Google Calendar/WhatsApp/copy/print automation with one-day-before and two-hour-before reminders. Every scan is stored locally, refreshes when the day changes, and deep-links to `booking.html?pooja=…&date=…`. Works in English and Hindi.
- `mantra.html` — **Mantra & Aarti Library**: 16 core Vedic mantras and 4 evening aartis with Devanagari text, a readable transliteration, plain-language meaning (English + Hindi) and the traditional moment to chant each one. A weekday-aware “mantra of the day” card, deity/search filters, browser voice recitation (`hi-IN`), one-tap copy, WhatsApp/booking handoff, a 108-bead japa counter with 11/27/54/108 round targets, 12-bead progress, round history and per-device saving, plus a full-screen aarti mode with keyboard navigation. No server calls; everything runs from the local data file and `localStorage`.
- `manifest.webmanifest` + `sw.js` — PWA install and offline cache.

### 3D + mobile experience layer

- `assets/css/experience.css` + `assets/js/experience.js` load on every page after the core shell. They only add behaviour and never change a calculated panchang or kundli value.
- **3D**: an animated starfield and zodiac rings behind the home hero and every dark page head, pointer-driven card tilt with a soft glare, layered depth shadows, 3D buttons, a rotating hero mandala, floating elements and a reading-progress bar. All motion respects `prefers-reduced-motion`.
- **Entrances**: `app.js` claims sections, cards, grids, forms and footer columns with a `.motion` class and animates each one the first time it enters the viewport, with a capped stagger. Progress bars in matching and reviews grow when they appear, section rules draw in, icons answer the pointer, and FAQ answers fade open. The same layer is skipped entirely for reduced-motion visitors.
- **Single tap**: a five-item bottom dock on phones (`Home · Panchang · Facilities · Kundli · Rashifal`) with ripple feedback.
- **Double tap / double click**: opens the searchable facilities sheet from anywhere in the page content (links, buttons and form fields keep their normal action). `Alt+F` does the same on a keyboard, and the header grid button is always available.
- **Facilities sheet**: 17 tools grouped into Today & timing, Kundli & matching, Book & shop, and Explore Bharat, with live search, My Bookings, WhatsApp and an Install-app button when the browser offers it.

## 3. Update in one place

1. Open `assets/js/site-settings.js`.
2. Change the owner values.
3. If the UPI ID changed, also regenerate `assets/img/upi-qr.svg` for the new `upi://pay?...` payload (or open the Seva tab once after deploying — the page rebuilds the QR from settings).
4. Deploy. `sw.js` is registered with `updateViaCache: 'none'`, checks for a new
   version every 15 minutes and when the tab regains focus, and reloads the page
   once when the new worker takes over. Same-origin files are network-first
   with `cache: 'no-store'`, so neither the HTTP cache nor the offline cache
   can pin an old copy while the visitor is online.

Live data never needs a manual refresh: the panchang card, ticker, festival
calendar and “today” highlight refresh every 60 seconds, when the tab becomes
visible, and roll over automatically at midnight.

Mantras, steps, samagri and katha: `assets/js/puja-data.js`.

## 4. Run locally

```powershell
cd C:\PanditApp
python -m http.server 8123
# open http://127.0.0.1:8123/puja-guide.html
```

Use `http://localhost` rather than opening the HTML file directly; the service worker, clipboard and some browser APIs need a local server or HTTPS.

### MySQL database (included backend)

The site still works as a static PWA, but bookings, pandit applications, shop
orders and enquiries are now stored in MySQL through a small Express API.

**Easiest way — one click:**

```powershell
cd C:\PanditApp
.\start.ps1          # or double-click start.bat
```

This starts a project-local MySQL instance on port **3307** (your existing
MySQL service on 3306 is left untouched), the API on port **4000**, and opens
the site. Stop everything with `.\stop.ps1` or `stop.bat`.

- Website: <http://localhost:4000/index.html>
- Admin dashboard: <http://localhost:4000/admin.html>
- Health check: <http://localhost:4000/api/health>
- Admin login: `admin@panditapp.local` / `Admin@2026` — change it from **Account & settings** in the dashboard

The database was created and seeded with 1,057 cities, 100 poojas, 24 pandits,
30 products, 8 extras and 10 sample reviews from `assets/js/data.js`. To use your
main MySQL 8 service instead, edit `DB_PORT=3306`, `DB_USER` and `DB_PASSWORD`
in `server/.env`, then run `npm run setup` inside `server/`.

The sample reviews are the same testimonials shown on the home page. They are
inserted with `status = 'approved'` so a fresh install does not show an empty
reviews page; re-seeding skips any review with the same name and message, so
moderation decisions are never overwritten.

### Admin dashboard features

- **Bookings** — search, filter by payment state, verify UPI payments, cancel,
  WhatsApp the customer, and open a full detail dialog with internal notes and
  pandit assignment.
- **Pandit applications** — mark contacted, verified or rejected.
- **Shop orders** — move orders through packed → shipped → delivered.
- **Messages** — mark read or replied.
- **Account & settings** — change your password, update name/email, toggle
  dark mode and auto-refresh.
- **Export CSV** on every queue (the bookings export respects the active filter).
- **Smart touches** — live status, last-updated time, 60-second auto-refresh,
  `/` to focus search, `Esc` to close a dialog, and a responsive mobile layout.

Passwords are hashed with bcrypt and changed through `POST /api/admin/change-password`.
The change is stored in MySQL immediately, so you do not need to edit
`server/.env` after the first setup.

### Website → API integration

The static pages keep working offline through `localStorage`, and mirror their
data to MySQL whenever the API is reachable:

- **Home quick enquiry** (`index.html`) — saves locally and creates a
  `contact_messages` row through `POST /api/contact`, then opens WhatsApp.
- **About contact form** (`about.html`) — same `contact_messages` sync with the
  topic and preferred date included.
- **Samagri checkout** (`shop.html` drawer) — creates an `orders` row through
  `POST /api/orders` with server-side price lookup and server-decided delivery
  (₹79 below ₹999, free above); the browser cannot set its own shipping or
  payment status. If the API is unreachable, the order stays on the device and
  the success dialog offers a WhatsApp resend.
- **Booking** (`booking.html`) — mirrors the full booking, 6-digit gate OTP and
  the selected add-on ids to `POST /api/bookings`. The server validates the OTP,
  forces a fresh booking to `Confirmed`, rejects impossible dates, and now
  recomputes every rupee from the `poojas` and `extras` tables (base, add-ons,
  18% GST, pay-now and balance) so a modified browser payload cannot change the
  price. The displayed estimate and the stored booking use the same rule.
- **My bookings** (`#bookingsOpen` on every page) — lists device bookings and
  includes a **Booking ID + Gate OTP** lookup that reads the live status from
  `GET /api/bookings/:id`. A looked-up booking is remembered on the device and
  can be cancelled through `PATCH /api/bookings/:id/cancel` (OTP required;
  completed bookings are rejected). Every booking also has **Add to calendar**
  (downloads an `.ics` with a one-day reminder) and **Receipt** (opens a
  printable / Save-as-PDF summary).
- **Reviews** (`reviews.html`) — reads approved reviews from `GET /api/reviews`
  (with an average, star breakdown, rating/pooja filters and pagination) and
  submits new ones through `POST /api/reviews`. Submissions are rate-limited,
  honeypot-filtered and stored as `pending`; nothing is published until an
  admin approves it in the **Reviews** tab of the dashboard.
- `assets/js/api.js` now loads on every page that renders the shared shell, so
  the header booking dialog works from anywhere. `sw.js` cache version is
  `vp-static-v49`.

### Production hardening

- **Security headers** (`server/src/middleware/security.js`) on every response:
  a same-origin Content-Security-Policy, `X-Content-Type-Options`, frame
  options, referrer and permissions policies, COOP, and HSTS in production.
- **Compression** — gzip/Brotli-negotiated responses for HTML, CSS, JS, JSON
  and fonts (roughly two thirds off the wire size of the ~2 MB asset bundle).
- **Cache policy** — `sw.js`, the manifest and HTML are `no-cache`; files under
  `assets/` are cached for an hour with `stale-while-revalidate`; API responses
  are always `no-store`.
- **Branded 404** — unknown paths render `404.html` (with the normal header,
  footer and links back into the site) instead of a bare error string.
- **Graceful shutdown** — SIGTERM/SIGINT stop new connections, finish in-flight
  requests, close the MySQL pool, and force-exit only after 10 seconds, so a
  Render deploy cannot cut a booking write in half.
- **Accessibility** — every page has a keyboard skip link as the first tab stop
  and a `main` landmark; the active nav item carries `aria-current="page"`.

### Customer accounts

Visitors can now create their own account and see everything in one place:

- **`register.html`** — name, email, mobile and password, with a live strength
  meter, a four-rule checklist (8+ characters, letter, number, symbol),
  password-match feedback and duplicate-account checks.
- **`login.html`** — the same **Email / Mobile** choice as password recovery,
  show/hide password, Caps Lock warning and a **Keep me signed in** option
  (unticked = session ends when the browser closes).
- **`forgot-password.html`** / **`reset-password.html`** — choose email or mobile,
  receive a 6-digit code (valid 15 minutes, 5 attempts), see the live expiry
  countdown and resend cooldown, then set a new password with the same rule
  checklist.
- **`account.html`** — upcoming and past poojas, pandit details, gate OTPs,
  samagri orders, profile editing and password change.

Accounts are stored in the `users` table with bcrypt password hashes and a
separate 30-day JWT (`kind: "user"`) that cannot access admin routes. Bookings
and orders made earlier as a guest are linked automatically when the phone or
email matches.

There is no SMTP or SMS provider configured in this build, so the reset code is
shown in a clearly labelled **Local demo code** panel and logged by the API.
In production it is delivered privately and never returned by the API.

Full API reference and table list: `server/README.md`.

## 5. Deploy

**Live site (free hosting): <https://panditapp.onrender.com/>**

- Host: Render free web service (`panditapp`, Singapore), deployed from
  `https://github.com/mishrarajiv396/panditapp` with the repo's `render.yaml`.
- Database: TiDB Cloud Starter (MySQL-compatible, AWS Singapore, free).
- Admin dashboard: `https://panditapp.onrender.com/admin.html?key=<ADMIN_ACCESS_KEY>`
  — without that key the page returns 404, so it stays private. The key is kept
  in Render → *Environment* as `ADMIN_ACCESS_KEY`.
- Step-by-step runbook: `DEPLOY.md`.
- Public-repo services have no auto-deploy: after `git push`, open the Render
  dashboard → service → **Manual Deploy → Deploy latest commit**.

Static-only alternative (no database, demo data only):

1. Drag the **contents** of `C:\PanditApp` into <https://app.netlify.com/drop>.
2. Open the HTTPS link on Android Chrome and iPhone Safari.
3. Chrome menu → **Add to Home screen** for the app-like icon.
4. For an APK, put the HTTPS link into <https://www.pwabuilder.com> and package for Android. Offline mode only works on HTTPS.

## 6. Test report (9 Nov 2026)

Tested in headless Chromium at 390 px mobile width against the local Express
server on `http://localhost:4000`.
The live-sync test served a modified `site-settings.js` (test phone, email and
UPI) to prove every surface follows the file:

- **All checks passed**, 0 console errors.
- Owner sync: header, footer, home, puja guide, plans, seva, about, booking,
  pandits and policies all used the changed phone/email/UPI. No stale number,
  email or UPI text remained. Links injected after load were rewritten by the
  MutationObserver, with `?text=` and `?subject=` queries preserved.
- Seva tab: name, UPI ID, QR label, call/WhatsApp/email links and the UPI deep
  link all came from settings. The QR itself is rebuilt from the new UPI payload.
- Deeper link/QR check on the live site: the UPI app link is exactly
  `upi://pay?pa=rajivlochanmishra952-1@okhdfcbank&pn=Rajiv%20Lochan%20Mishra&cu=INR`.
  Both the client-generated QR and the static fallback SVG decode back to that
  same payload. `https://wa.me/918889685370?text=Namaste` returns HTTP 302 to
  `https://api.whatsapp.com/send/?phone=918889685370&text=Namaste...`. The call
  link is correctly formed as `tel:+918889685370`; the actual call, WhatsApp
  send and UPI payment still need a real phone/app confirmation.
- Ticker showed the current tithi/nakshatra, and the date advanced correctly
  between test runs (31 Oct → 9 Nov), confirming it recomputes from the clock.
- Playwright clock test at 23:59:30 IST: after one 60-second refresh the ticker
  moved from Krishna Amavasya to Shukla Pratipada, the home panchang date moved
  from 9 to 10 Nov, the panchang page followed to 2026-11-10, and the calendar
  “today” highlight moved from 9 to 10 without a reload.
- Same live refresh covers the horoscope (only while “today” is selected), the
  city directory's local clocks/panchang, the booking date minimum, and the
  kundli/matching no-future-date limit. The puja guide re-scans next dates and
  muhurats when the day changes.
- All 10 puja-guide tabs open; 7 plans render; 11 other pages load with no
  errors and no horizontal overflow at 360 px.
- Previously verified: 8 puja steps, havan counter, samagri ticks, sankalp,
  dark mode, persistence after reload, and the calendar `.ics` export.

### Muhurat Studio (14 Nov 2026)

Tested in headless Chromium at 320 px, 390 px and 1280 px against the static
server, with the real panchang engine and a scratch browser profile:

- **All checks passed**, 0 console errors, 0 unhandled rejections.
- Layout: scroll width equals the viewport at all three widths; no element
  extends past the right edge (off-canvas drawer and the horizontally
  scrollable tab strip excluded by design). Mobile form is one column, desktop
  is the 352 px rail plus an 800 px main column inside the 1180 px container.
- Default scan (Satyanarayan Katha, Gurugram, 45 days) chose
  **16 November 2026**, score **81 / 100**, window **06:44 – 08:05 AM (Amrit)**,
  Shukla Saptami, Shravana nakshatra. 8 clean windows rendered, 4 tabs, 7
  samagri lines.
- Tabs switch panes; selecting the second window rebuilt the best card to
  **14 December 2026 · 07:05 – 08:23 AM (Amrit)** with exactly one selection.
- Hindi toggle switches `document.lang` to `hi` and re-renders headings, form
  labels and dimensions in Devanagari.
- `.ics` export produced a valid 808-byte `VCALENDAR` containing `VEVENT`,
  both `VALARM` reminders and `DTSTART:20261116T011447Z` (06:44 IST).
- WhatsApp handoff URL and the full plan text were generated; copy and print
  handlers are wired; the state persisted every form field, tab and tick.
- `booking.html?pooja=…&date=…` selects the pooja and clamps/accepts the date.

### Mantra & Aarti Library (14 Nov 2026)

Tested in headless Chromium against the static server at 320, 390, 768, 1024,
1280 and 1440 px, plus a scripted interaction pass:

- **20 cards render** (16 mantras + 4 aartis), 12 filter chips, 16 Devanagari
  blocks, the weekday “mantra of the day” card and the japa panel.
- Layout: scroll width equals the viewport at every width; 1 column below
  1080 px and 2 columns above. No duplicate IDs, no unlabelled controls, no
  empty buttons and no console errors or unhandled rejections.
- Deity filter (Hanuman) returns 1 card; searching `gayatri` returns 1; an
  impossible search shows the empty state at 0 cards.
- Japa: selecting a card, three increments and a target change to 27 updates
  the ring, count, beads, active target and `vp_japa_v1` in `localStorage`;
  reset returns the count to 0; `Finish round` advances the round counter.
- Aarti mode opens with 6 verses for *Om Jai Jagdish Hare*, `1 / 4`, and
  next/prev/close all work; body scroll locks while it is open.
- Hindi toggle switches `document.lang`, the H1, intro, pills, breadcrumb, nav
  item, search placeholder, chips, card titles, japa buttons and the note — all
  verified as Devanagari, with 0 replacement characters.
- Navigation: the page is the active item, appears in the header “More” menu,
  the footer Tools column, site search (`mantra` returns it first), the
  facilities sheet, `sitemap.xml`, the PWA shortcuts and the offline cache
  (`vp-static-v58`).

### Full-site Hindi coverage (14 Nov 2026)

Re-audited all 17 indexable pages in headless Chromium with `vp_lang=hi`,
walking every visible text node:

- Every page now reports **100% Devanagari UI copy**. The only remaining Latin
  strings are legitimate non-translatables: the owner email
  (`rajivlochanmishra952@gmail.com`), the UPI ID
  (`rajivlochanmishra952-1@okhdfcbank`), one mantra transliteration shown
  beside its Devanagari line, and the technical `HTTP 404` API status.
- Added dictionary entries for the new mantra band, footer/nav/search labels,
  reviews form states, samagri items, `cities`, the choghadiya names
  (`(Amrit)` etc.), `Google Calendar`, `WhatsApp` and the payment apps.
- Added a numeric date-time pattern so scan results read
  `16 नवंबर 2026, 06:44 पूर्वाह्न` instead of the English form.
- The Satyanarayan guide's own dictionary now translates the standalone
  WhatsApp buttons inside `#pjMain`, which the site-wide layer deliberately
  skips.

### Coverage & location maps (14 Nov 2026)

Three Leaflet 1.9.4 maps, vendored at `assets/vendor/leaflet/` (no CDN, CSP
`script-src 'self'` unchanged). The library is fetched lazily by
`assets/js/map.js` only when a card scrolls into view; a plain SVG schematic
takes over if Leaflet, the tiles or the network fail, and the bar keeps a
manual **Schematic view / Live map** toggle.

- `pandits.html` and `index.html` — **Gurugram & NCR coverage** section. Eight
  travel zones around the Gurugram base (`28.4595, 77.0266`) with real haversine
  distances:
  Gurugram core (base), New Gurugram 6.1 km, Sohna Road 6.5 km, Manesar
  14.3 km, Delhi 21.1 km, Faridabad 29.0 km, Noida 36.6 km, Ghaziabad
  39.1 km. Each zone lists its localities, honest travel time, availability
  from the 4:00 pm IST same-day cut-off, and a booking CTA that stores the
  zone city in `vp_city` before opening `booking.html`.
- `booking.html` — **Location confirmation** card inside step 2. The pin
  starts at the selected city centre, follows the address field when a known
  locality is typed, can be dragged or tapped, supports “Use my location”,
  “Reset pin” and “Add area to address”. The nearest known area, distance
  rings and coverage status are shown in the side panel. Coordinates are
  display-only — the booking payload in `booking.js` is untouched and no
  lat/lng is stored or sent.
- Tiles come from OpenStreetMap, so `img-src` in
  `server/src/middleware/security.js` now allows
  `https://tile.openstreetmap.org https://*.tile.openstreetmap.org`.
  Attribution stays visible in the Leaflet control and in the card footer.
  `Permissions-Policy` already allowed `geolocation=(self)`; denial is handled
  with a toast and the pin/zone controls remain usable.
- Offline cache bumped to `vp-static-v59`, with `map.css`, `map.js`, the
  Leaflet CSS/JS and its marker images added to `CORE`.
- Every string is bilingual through `App.t(en, hi)`; the three static section
  phrases are in `i18n-phrases.js`. Nothing uses fake coordinates: entries
  missing from `PanditData.CITIES` live in an `EXTRA_PLACES` list and are
  labelled “approx. area” in the booking panel.

Tested in headless Chromium against the static server at 320, 390, 768 and
1280 px:

- **34/34 homepage checks, 64/64 layout & interaction checks, 13/13 deeper
  interaction checks and 12/12 fallback checks** passed with 0 JS errors: lazy
  load (no `window.L` before scroll), 8 zone pins and circles, zone selection,
  distance/cut-off copy, booking CTA storing `vp_city`, pin drag and map tap,
  reset/locate, address match to DLF Phase 4, add-area dedupe, city change
  recentre, schematic SVG click and Enter-key selection, live (no reload) Hindi
  toggle, Hindi parity, and no horizontal overflow at any width.
- Booking payload purity: after a full confirm flow the saved `vp_bookings`
  record has no `lat`/`lng` keys and no coordinate pair; only the typed
  address is shared, exactly as before this change.
- Fallback paths verified by blocking `leaflet.js` (immediate schematic), by
  blocking OSM tiles (automatic schematic after four tile errors, with an
  explanatory note) and with `navigator.onLine === false` (offline note).
  When the connection returns, the **Live map** toggle retries and initialises
  Leaflet without a reload.
- OSM tiles loaded 12/12 with HTTP 200 in the browser; the live map stayed in
  map mode at every tested width.

### Real-device checklist (not run in headless Chromium)

1. Open the deployed HTTPS site on an Android phone and an iPhone.
2. Seva tab → **Open UPI app** → confirm the payee is **Rajiv Lochan Mishra** and the UPI ID is **rajivlochanmishra952-1@okhdfcbank** → pay ₹1 and check the bank statement.
3. Scan the Seva QR from another phone → confirm the same name/UPI → pay ₹1.
4. Tap **Call** → confirm the dialer shows **+91 88896 85370** → place the call.
5. Tap **WhatsApp** → confirm the chat opens with the prefilled message → send it and confirm the reply.
6. Open Plans → tap a plan’s **Book this plan** → confirm WhatsApp prefill contains the plan name and price.
7. Install the PWA, enable airplane mode, reload → confirm the offline shell and last panchang still open.
8. Re-check dark mode and 360 px layout on both phones.

**API + database audit (same run):**

- **27/27** auth and booking flow checks passed: register, login, profile,
  password change, forgot/reset, booking create/lookup/OTP rejection, payment
  claim, user bookings, contact, pandit application, admin login/stats/bookings/
  applications/orders/messages/settings, and admin/user token isolation.
- **10/10** new endpoint checks passed: contact create + validation, order with
  real product ID + unknown-product rejection, malformed booking timestamp
  clamped instead of crashing, live lookup returning the gate OTP, wrong-OTP
  rejection, completed-booking cancel rejection, idempotent cancel and
  OTP-required cancel.
- **13/13** browser flow checks passed at 390 px: home lead form created a
  contact row, about contact form created a row and showed its success modal,
  shop checkout created an order and showed “Order confirmed”, cross-device
  booking lookup showed live server status + OTP, UI cancel called the API,
  persisted `Cancelled`, and both web-created rows were confirmed in MySQL.
- **4/4** booking-page checks passed at 390 px: the three-step form posted to
  `/api/bookings`, the success sheet showed the gate OTP, the booking was saved
  for “My bookings”, and the row existed in MySQL with `Pending` payment.
- Test rows were removed from MySQL afterwards. All 21 pages return HTTP 200;
  415 local asset references resolve; full mobile audit shows 0 console errors,
  0 failed requests, 0 4xx responses and no horizontal overflow.
- **Public-page language audit**: the shared ENG/हिंदी toggle switches every
  page (including the four account pages) to Devanagari (`lang="hi"` persisted,
  `vp_lang` restored on reload) with 0 console/JS errors. The only expected
  error is the optional reviews API (`127.0.0.1:4000`) refusing a connection
  while that backend is not running; the page shows a friendly Hindi offline
  notice instead.

Not tested on a real phone, real UPI app payment, iPhone Safari, Hindi voice quality or clipboard permissions. Do those before launch.

## 7. Before public launch

- [ ] Send ₹1 from a friend's phone by scanning the Seva QR; confirm it reaches Rajiv's account.
- [ ] Confirm the UPI app shows **Rajiv Lochan Mishra** before paying.
- [ ] Tap Call and WhatsApp on a real phone; confirm +91 88896 85370 opens.
- [ ] Get every mantra, spelling, matra and step order reviewed by a pandit.
- [ ] Match the vidhi to the family sampradaya.
- [ ] Test Android Chrome and iPhone Safari, light and dark mode.
- [ ] Test the installed PWA in airplane mode on the HTTPS/Netlify build.
- [ ] Keep bank transaction alerts ON before sharing the link.
- [ ] Replace or clearly mark demo content: the home page/pandits page currently claim "300+ verified pandits", ratings and testimonials, and `booking.html` is a demonstration checkout. **Pandit verification is a hard launch blocker.** A dismissible “Demo content” notice is now injected on `index.html`, `poojas.html`, `pandits.html`, `booking.html`, `shop.html` and `about.html` (see `injectDemoNotice()` in `assets/js/app.js`). Remove the notice only after the claims are rewritten or the pages are removed.
- [x] Canonical URLs and `sitemap.xml` now point at the live site (`https://panditapp.onrender.com/`); update them if a custom domain is added.
- [ ] Add a privacy/consent note if analytics or a payment gateway is added.

## 8. Phase 2

Live panchang API, recorded mantra audio, full authorised katha text, live payment gateway (booking UPI claim is already recorded), reminders (calendar `.ics` export is done; server-side push is not), and pandit verification. The admin dashboard and MySQL backend are already in place.

## 9. Sources

Mantras are traditional and marked with source notes in `puja-data.js`. The katha is a retelling, not verbatim scripture. The module still needs review by an empanelled pandit; family tradition and a pandit's guidance are final.
