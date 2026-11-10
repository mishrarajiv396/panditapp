# PanditApp backend — MySQL + Express

This folder adds a real database to the static site. The site keeps working
without it (localStorage), and syncs bookings, pandit applications, shop orders
and contact messages to MySQL whenever the API is reachable.

## 1. Run (already set up)

From the project root:

```powershell
cd C:\PanditApp
.\start.ps1          # or double-click start.bat
```

This starts the project-local MySQL instance on port **3307** and the API on
port **4000**, then opens the website. Stop everything with `.\stop.ps1` or
`stop.bat`.

- Site: <http://localhost:4000/index.html>
- Admin dashboard: <http://localhost:4000/admin.html>
- Health check: <http://localhost:4000/api/health>
- Admin login: `admin@panditapp.local` / `Admin@2026`

The local MySQL data lives in `server/.mysql/data` and is ignored by git. Your
existing MySQL 8 service on port 3306 is not modified.

**Fresh install / data folder deleted?** Recreate everything with:

```powershell
cd C:\PanditApp\server
powershell -ExecutionPolicy Bypass -File .\setup.ps1
```

Use `.\setup.ps1 -UseExistingMySQL` if you want to point the app at your main
MySQL service instead of the project-local one.

## 2. Use your main MySQL instead (optional)

Edit `server/.env`:

```ini
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=panditapp
```

Then:

```powershell
cd C:\PanditApp\server
npm run setup
```

`npm run setup` creates the database (if the user has permission), applies
`server/sql/schema.sql`, and seeds poojas, cities, pandits, products and extras
from `assets/js/data.js`.

Manual alternative if the database does not exist yet:

```powershell
mysql -u root -p -e "CREATE DATABASE panditapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
cd C:\PanditApp\server
npm run migrate
npm run seed
```

## 3. Production notes

For production, put the API behind HTTPS and set the frontend API URL:

```html
<meta name="pandit-api-base" content="https://api.yourdomain.com/api">
```

or before `assets/js/api.js`:

```html
<script>window.PANDIT_API_BASE = 'https://api.yourdomain.com/api';</script>
```

If you keep using `python -m http.server 8123`, the frontend automatically
calls `http://localhost:4000/api` because both are on localhost.

## 4. What is stored

| Table | Purpose |
|---|---|
| `bookings` | Every pooja booking, customer, amounts, UPI reference, payment status |
| `pandit_applications` | Join requests from `pandits.html` |
| `orders` | Samagri shop orders |
| `contact_messages` | Contact/enquiry messages |
| `poojas`, `extras`, `products`, `pandits`, `cities` | Catalogue mirrored from `data.js` |
| `admins` | Admin login (bcrypt + JWT) |
| `users` | Customer accounts, bcrypt passwords, reset-code state (JWT `kind: "user"`) |
| `site_settings` | Owner/UPI/seva details editable from the API |

## 5. API quick reference

Public:

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | DB health |
| GET | `/api/poojas` | Pooja catalogue |
| GET | `/api/extras` | Booking add-ons |
| GET | `/api/cities` | City directory (`?q=`, `?state=`, `?hot=1`) |
| GET | `/api/pandits` | Pandit profiles |
| GET | `/api/products` | Shop products |
| GET | `/api/settings` | Site settings |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/:id?otp=1234` | Customer booking lookup |
| PATCH | `/api/bookings/:id/payment` | Claim UPI payment (`otp`, `paymentRef`, `amountPaid`) |
| POST | `/api/applications` | Pandit join application |
| POST | `/api/orders` | Shop order |
| POST | `/api/contact` | Contact message |

Customer accounts (`Authorization: Bearer <user-token>` where noted):

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/register` | `{ name, email, phone, password }` → user JWT (rate-limited) |
| POST | `/api/auth/login` | `{ identifier, password }` — email or mobile (rate-limited) |
| GET | `/api/auth/me` | Current user + booking/order/spend stats |
| PATCH | `/api/auth/profile` | Update `name`, `email`, `phone`, returns a fresh JWT |
| POST | `/api/auth/change-password` | `{ currentPassword, newPassword }` (rate-limited) |
| POST | `/api/auth/forgot-password` | `{ identifier }` → sends a 6-digit code (rate-limited) |
| POST | `/api/auth/reset-password` | `{ identifier, code, newPassword }` → user JWT (rate-limited) |
| GET | `/api/auth/bookings` | Signed-in customer's bookings |
| GET | `/api/auth/orders` | Signed-in customer's shop orders |

`POST /api/bookings` and `POST /api/orders` also accept an optional user token,
so new bookings/orders are attached to the signed-in account automatically.

Admin (send `Authorization: Bearer <token>`):

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/admin/login` | `{ email, password }` → JWT (rate-limited) |
| GET | `/api/admin/me` | Current admin |
| PATCH | `/api/admin/profile` | Update `name` / `email`, returns a fresh JWT |
| POST | `/api/admin/change-password` | `{ currentPassword, newPassword }` (rate-limited) |
| GET | `/api/admin/stats` | Dashboard counts |
| GET | `/api/admin/bookings` | Filter bookings (`?status=`, `?phone=`, `?q=`, `?from=`, `?to=`) |
| PATCH | `/api/admin/bookings/:id` | Update `status`, `paymentStatus`, `amountPaid`, `panditName`, `notes` |
| GET/PATCH | `/api/admin/applications` | Review pandit applications |
| GET/PATCH | `/api/admin/orders` | Review shop orders |
| GET/PATCH | `/api/admin/messages` | Review contact messages |
| GET/PUT | `/api/admin/settings` | Read/write site settings |
| PATCH | `/api/admin/poojas/:id` | Change price / active |
| PATCH | `/api/admin/products/:id` | Change price / active |

Example admin login:

```powershell
$body = '{"email":"admin@panditapp.local","password":"Admin@2026"}'
$res = Invoke-RestMethod -Method Post -Uri http://localhost:4000/api/admin/login -ContentType application/json -Body $body
$res.data.token
```

Change the password from **Account & settings** in the dashboard, or directly:

```powershell
$body = '{"currentPassword":"Admin@2026","newPassword":"MyNewPass123"}'
Invoke-RestMethod -Method Post -Uri http://localhost:4000/api/admin/change-password `
  -Headers @{ Authorization = "Bearer $($res.data.token)" } `
  -ContentType application/json -Body $body
```

New passwords must be 8–72 characters and contain at least one letter and one
number. The change is stored in MySQL immediately.

## 6. Security notes before launch

- Change the admin password from **Account & settings** (or `POST /api/admin/change-password`) and set a strong `JWT_SECRET` in `.env`. Re-running `npm run seed` keeps the existing admin and never overwrites credentials.
- Use a dedicated MySQL user instead of `root`:

```sql
CREATE USER 'panditapp'@'localhost' IDENTIFIED BY 'strong-password';
GRANT SELECT, INSERT, UPDATE, DELETE ON panditapp.* TO 'panditapp'@'localhost';
FLUSH PRIVILEGES;
```

- Put the API behind HTTPS and restrict `CORS_ORIGIN` to your real domain.
- Customer and admin tokens share `JWT_SECRET` but carry different `kind`
  claims. `requireAdmin` rejects `kind: "user"` tokens and `requireUser` rejects
  admin tokens, so a customer session can never reach the dashboard API.
- Password reset codes are bcrypt-hashed, expire in 15 minutes and allow 5
  attempts. With no SMTP/SMS provider configured, `devCode` is returned and
  logged only when `NODE_ENV !== 'production'`. Set `NODE_ENV=production` (and
  wire an email/SMS sender) before going live so codes are never exposed.
- Payment status is only marked `Awaiting verification` by the customer; an admin
  must verify the UPI reference before treating a booking as paid.
