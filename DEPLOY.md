# Deploy on Render (permanent hosting)

This project is already prepared for Render:

- `Dockerfile` builds the static site + Express API in one container.
- `render.yaml` describes the web service and its environment variables.
- `server/scripts/deploy.js` waits for MySQL, runs the schema and seed, then
  starts the API.
- `DB_SSL=true` is supported by the app for managed MySQL providers.

Render does **not** provide MySQL, so the database lives at an external
provider. The free Aiven MySQL plan works well.

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

## 2. Create a free MySQL database (Aiven)

1. Sign up at <https://aiven.io>.
2. **Create service → MySQL**, choose the **Free** plan and the region closest
   to your users (for India, Mumbai).
3. Wait until the service status is **Running**.
4. Open the service and copy these values:

   | Render variable | Aiven value |
   | --- | --- |
   | `DB_HOST` | Host |
   | `DB_PORT` | Port (not 3306; Aiven uses a custom port) |
   | `DB_USER` | User (`avnadmin`) |
   | `DB_PASSWORD` | Password |
   | `DB_NAME` | Database (`defaultdb`, or `panditapp` if you created it) |
   | `DB_SSL` | `true` |

The app creates its tables inside the database automatically on first boot.

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
- Aiven's free MySQL plan has connection/storage limits; upgrade if the site
  gets real traffic.
- Keep `DB_SSL=true` for Aiven. The app uses TLS but does not verify the
  provider's CA certificate; for stricter verification, mount the CA and add
  `DB_SSL_CA` support.
- Never put database passwords or JWT secrets in the repository.
