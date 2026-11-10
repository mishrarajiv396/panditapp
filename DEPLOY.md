# Deploy on Render (permanent hosting)

This project is already prepared for Render:

- `Dockerfile` builds the static site + Express API in one container.
- `render.yaml` describes the web service and its environment variables.
- `server/scripts/deploy.js` waits for MySQL, runs the schema and seed, then
  starts the API.
- `DB_SSL=true` is supported by the app for managed MySQL providers.

Render does **not** provide MySQL, so the database lives at an external
provider. **TiDB Cloud Starter** is free, MySQL-compatible and needs no card.

---

## 1. Push the code to GitHub

The local repository is already committed. Create an empty repository on
GitHub (do not add a README), then run:

```powershell
cd C:\PanditApp
git remote add origin https://github.com/<your-user>/<your-repo>.git
git branch -M main
git push -u origin main
```

If Git asks you to sign in, complete the GitHub login in the browser.

> `server/.env`, `server/.mysql/` and `server/node_modules/` are ignored by
> `.gitignore` and must never be committed.

---

## 2. Create a free MySQL database (TiDB Cloud Starter)

Aiven retired its free MySQL plan on 6 November 2026, so this guide uses
**TiDB Cloud Starter** — MySQL-compatible, free, no card required
(5 GiB storage + 50M request units per month).

1. Sign up at <https://tidbcloud.com> (GitHub or Google login works).
2. **Create Cluster → Starter**, pick the region closest to your users
   (Singapore or Mumbai), and give it a name like `panditapp`.
3. Wait until the cluster status is **Active** (1–2 minutes).
4. Click **Connect** and copy the connection details. TiDB shows a host, port
   `4000`, a user that looks like `3pTAoNNegb47Uc8.root`, and a generated
   password. The default database is `test`.

   | Render variable | TiDB value |
   | --- | --- |
   | `DB_HOST` | Host (`gateway01.<region>.prod.aws.tidbcloud.com`) |
   | `DB_PORT` | `4000` |
   | `DB_USER` | User (includes the cluster prefix, e.g. `3pTAoNNegb47Uc8.root`) |
   | `DB_PASSWORD` | The password shown once when the user is created |
   | `DB_NAME` | `panditapp` |
   | `DB_SSL` | `true` (TiDB refuses unencrypted connections) |

   > Save the password immediately — TiDB Cloud does not show it again. If it
   > is lost, create a new database user and use those credentials.

5. Allow access from Render: TiDB Cloud Starter accepts public connections by
   default, so no IP allow-list entry is needed. If you enable one, add
   `0.0.0.0/0`.

The app creates its tables inside `panditapp` automatically on first boot.

---

## 3. Deploy with Render Blueprint

1. Sign up at <https://render.com> (GitHub login is easiest).
2. **New + → Blueprint**.
3. Connect the GitHub repository you pushed in step 1.
4. Render reads `render.yaml` and shows the service.
5. Fill the secret environment variables:

   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `ADMIN_EMAIL` — your admin login email
   - `ADMIN_PASSWORD` — a strong password (not the local demo password)
   - `ADMIN_NAME` — optional display name

6. Click **Apply / Deploy**.
7. Wait for the health check to pass at `/api/health`.

The first deploy runs `server/scripts/deploy.js`, which applies the schema and
seeds the catalogue once. Later deploys keep the existing data.

---

## 4. After the first deploy

1. Open `https://<your-service>.onrender.com/`.
2. Open `/admin.html`, log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`, and
   **change the admin password immediately**.
3. Test:
   - Create a booking and look it up with the booking ID + OTP.
   - Create a shop order and confirm the server-side shipping price.
   - Send a contact form.
4. Update `assets/js/site-settings.js` with the real owner phone, email and UPI
   if they differ, then push again.
5. Replace the placeholder `https://vedicpooja.in/...` canonical URLs in the
   HTML files and `sitemap.xml` with the real domain.

---

## 5. Custom domain (optional)

1. Render → your service → **Settings → Custom Domains**.
2. Add `yourdomain.com` and `www.yourdomain.com`.
3. Create the DNS records Render shows (usually a `CNAME`).
4. Set `CORS_ORIGIN` to `https://yourdomain.com,https://www.yourdomain.com`
   (or leave `*`).
5. Update the canonical URLs and `sitemap.xml`.

---

## Notes

- The free Render web service sleeps after inactivity, so the first request
  after a quiet period can take 30–60 seconds.
- TiDB Cloud Starter's free tier has storage and request-unit limits; upgrade if
  the site gets real traffic.
- Keep `DB_SSL=true` for TiDB. The app uses TLS but does not verify the
  provider's CA certificate; for stricter verification, mount the CA and add
  `DB_SSL_CA` support.
- Never put database passwords or JWT secrets in the repository.
