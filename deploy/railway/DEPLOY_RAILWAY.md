# Deploy BakiBook API to Railway

Host the Express API on [Railway](https://railway.app) so your **Android app** (and web client) can use a public HTTPS URL.

Recommended setup: deploy **`server/` only** (API for mobile). You can add the web client later.

---

## Build failed: `vite: not found`?

Railway is building from the **repo root** and running `npm run build`, but Vite is a dev dependency and gets skipped in production installs.

**Fix A — API only (recommended for mobile):**

1. Railway → **Settings** → **Source** → **Root Directory** → `server`
2. **Settings** → **Build** → clear any custom **Build Command** (leave empty)
3. Redeploy

**Fix B — Web + API from repo root:**

1. **Root Directory** → leave empty `/` (repo root)
2. Push the repo with root `railway.toml` (uses `npm install --include=dev` for the client)
3. Or set **Build Command** to:
   ```bash
   npm install --prefix server && npm install --prefix client --include=dev && npm run build --prefix client
   ```
4. **Start Command:**
   ```bash
   NODE_ENV=production npm start --prefix server
   ```

---

## Prerequisites

- [Railway account](https://railway.app) (free tier to start)
- [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (same as local dev)
- GitHub repo pushed with this code

---

## Step 1 — MongoDB Atlas network access

Railway uses dynamic IPs. In MongoDB Atlas:

1. **Network Access** → **Add IP Address**
2. Choose **Allow access from anywhere** (`0.0.0.0/0`) for Railway  
   (or restrict later when you have a static IP)

Copy your connection string:
```
mongodb+srv://USER:PASSWORD@cluster.mongodb.net/BakiBook?retryWrites=true&w=majority
```

---

## Step 2 — Create Railway project

1. Go to [railway.app/new](https://railway.app/new)
2. **Deploy from GitHub repo** → select `BakiBookApp`
3. After the service is created, open **Settings** → **Source**
4. Set **Root Directory** to: `server`
5. **Settings** → **Build** → ensure **Build Command** is **empty** (do not use `npm run build`)
6. **Save** — Railway will redeploy using `server/package.json` and `server/railway.toml`

---

## Step 3 — Environment variables

In Railway → your service → **Variables**, add:

| Variable | Value | Required |
|----------|-------|----------|
| `NODE_ENV` | `production` | Yes |
| `MONGODB_URI` | Your Atlas connection string | Yes |
| `JWT_SECRET` | Long random string (e.g. `openssl rand -hex 32`) | Yes |
| `SERVER_URL` | `https://YOUR-SERVICE.up.railway.app` (set after first deploy) | Yes |
| `CLIENT_URL` | Same as `SERVER_URL` if API-only; or your web URL | Yes |
| `PORT` | Leave unset — Railway sets this automatically | No |
| `EMAIL_USER` | Gmail for transactional email | Optional |
| `EMAIL_APP_PASSWORD` | Gmail app password | Optional |
| `EMAIL_FROM` | `BakiBook <you@gmail.com>` | Optional |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional |
| `CLOUDINARY_URL` | Cloudinary URL for image uploads | Optional |
| `ADMIN_EMAIL` | Admin login email | Optional |
| `ADMIN_PASSWORD` | Admin password | Optional |

**Tip:** After the first deploy, copy the public URL from **Settings → Networking → Generate Domain**, then set `SERVER_URL` and `CLIENT_URL` to that URL (no trailing slash) and redeploy.

Example:
```
SERVER_URL=https://bakibook-production.up.railway.app
CLIENT_URL=https://bakibook-production.up.railway.app
```

---

## Step 4 — Public HTTPS domain

1. Railway service → **Settings** → **Networking**
2. Click **Generate Domain**
3. You get a URL like: `https://bakibook-production.up.railway.app`
4. Test: open `https://YOUR-DOMAIN.up.railway.app/api/health`  
   Expected: `{"status":"ok",...}`

---

## Step 5 — Point the mobile app to Railway

Update `mobile/eas.json` production env (or EAS secret):

```
EXPO_PUBLIC_API_URL=https://bakibook-production.up.railway.app/api
```

Or with EAS CLI:

```bash
cd mobile
npx eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value "https://bakibook-production.up.railway.app/api"
```

Then build for Play Store:

```bash
npm run build:android
```

---

## Step 6 — Seed demo data (optional)

Railway auto-seeds on startup if the DB is empty. To force re-seed, use Railway **one-off** or local:

```bash
# Locally, with production MONGODB_URI in env:
npm run seed --prefix server -- --force
```

Demo logins (if seeded): `shopkeeper@bakibook.demo` / `Demo@123`

---

## Deploy web + API on the same Railway service (optional)

If you also want the React web app on Railway:

1. Set **Root Directory** to `/` (repo root), not `server`
2. Use the root `railway.toml` (already in the repo), **or** set manually:
   - **Build command:**
     ```bash
     npm install --prefix server && npm install --prefix client --include=dev && npm run build --prefix client
     ```
   - **Start command:**
     ```bash
     NODE_ENV=production npm start --prefix server
     ```
3. Set `CLIENT_URL` and `SERVER_URL` to your Railway domain

The server serves `client/dist` when that folder exists after build.

**Do not** use plain `npm run build` as the Railway build command — it fails because Vite is not installed without `--include=dev`.

---

## Custom domain (optional)

1. Railway → **Networking** → **Custom Domain**
2. Add e.g. `api.bakibook.com`
3. Add the CNAME record at your DNS provider
4. Update `SERVER_URL`, `CLIENT_URL`, and `EXPO_PUBLIC_API_URL`

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails | Confirm **Root Directory** is `server` and **Build Command** is empty; or use root `railway.toml` for full-stack |
| `vite: not found` | Root deploy without dev deps — use Fix A or B at top of this doc |
| `MongoServerError` / connection | Atlas IP allowlist; correct `MONGODB_URI` |
| Health check fails | Wait for deploy; check logs for crash on startup |
| Mobile app “Network request failed” | Use `https://...up.railway.app/api` (include `/api`) |
| Uploads fail | Set `CLOUDINARY_URL` or ensure `server/uploads` is writable (ephemeral on Railway — prefer Cloudinary) |
| Emails not sent | Set `EMAIL_USER` + `EMAIL_APP_PASSWORD` |

---

## Checklist

- [ ] GitHub repo connected to Railway
- [ ] Root directory = `server`
- [ ] `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production` set
- [ ] Public domain generated
- [ ] `SERVER_URL` / `CLIENT_URL` updated to Railway URL
- [ ] `/api/health` returns OK in browser
- [ ] `EXPO_PUBLIC_API_URL` set for mobile production build

---

## Cost

Railway free tier includes limited monthly usage. Monitor **Usage** in the dashboard; upgrade to Hobby ($5/mo) if needed for production traffic.
