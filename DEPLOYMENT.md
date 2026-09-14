# 🚀 Deployment Guide

This covers three ways to run Subaz Open Thoughtz beyond your local machine:

1. [Docker (all-in-one, anywhere)](#-option-1-docker-recommended-for-a-quick-full-stack-run)
2. [Render (backend) + Vercel (frontend) + MongoDB Atlas (database)](#-option-2-render--vercel--mongodb-atlas-production-style)
3. [Notes on environment variables across environments](#-environment-variable-reference)

---

## 🐳 Option 1: Docker (recommended for a quick full-stack run)

This spins up MongoDB, the backend API, and the frontend (served by nginx) together with one command — no local Node/Mongo install needed, only [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
cd subaz-open-thoughtz
cp .env.example .env        # then edit .env and set real secrets
docker compose up --build
```

- Frontend: **http://localhost:3000**
- Backend API: **http://localhost:5000/api/health**
- MongoDB: exposed on `localhost:27017` if you want to inspect it with Compass

The first time only, seed the database (default categories + admin account):

```bash
docker compose exec backend npm run seed
```

To stop everything: `docker compose down` (add `-v` to also wipe the Mongo/uploads volumes and start fresh).

**How it fits together:** `docker-compose.yml` builds `backend/Dockerfile` (a plain Node image running `server.js`) and `frontend/Dockerfile` (a multi-stage build that compiles the Vite app, then serves the static files with nginx). The frontend's `nginx.conf` proxies `/api/*` and `/uploads/*` requests to the backend container over Docker's internal network, so the browser only ever talks to port 3000.

This same `docker-compose.yml` is a reasonable starting point for deploying to any VM (a $5 DigitalOcean droplet, an EC2 instance, etc.) — just install Docker on the box, copy the repo over, and run the same two commands.

---

## ☁️ Option 2: Render + Vercel + MongoDB Atlas (production-style)

This is the more typical "real" deployment: managed database, managed backend host, managed static frontend host.

### Step 1 — Create a MongoDB Atlas cluster

1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free (M0) cluster.
2. Under **Database Access**, create a database user with a strong password.
3. Under **Network Access**, add `0.0.0.0/0` (allow from anywhere) — fine for getting started; tighten later if needed.
4. Click **Connect → Drivers**, copy the connection string. It looks like:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/subaz_open_thoughtz?retryWrites=true&w=majority`

### Step 2 — Deploy the backend to Render

1. Push this repo to GitHub (see the root `README.md` if you haven't already).
2. On [render.com](https://render.com), click **New → Web Service**, connect your GitHub repo.
3. Set:
   - **Root directory:** `backend`
   - **Build command:** `npm install`
   - **Start command:** `npm start`
4. Under **Environment**, add these variables (copy from `backend/.env.example`):
   | Key | Value |
   |---|---|
   | `MONGO_URI` | your Atlas connection string from Step 1 |
   | `JWT_SECRET` | a long random string |
   | `JWT_RESET_SECRET` | a different long random string |
   | `JWT_EXPIRES_IN` | `7d` |
   | `JWT_RESET_EXPIRES_IN` | `15m` |
   | `CLIENT_URL` | your Vercel URL from Step 3 (set this after Step 3, then redeploy) |
   | `NODE_ENV` | `production` |
   | `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_USERNAME` | for the seed script |
   | `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `EMAIL_FROM` | your SMTP provider (e.g. Gmail app password, SendGrid, Mailgun) — optional but needed for real password-reset emails |
5. Deploy. Once it's live, open the Render **Shell** tab and run `npm run seed` once to create default categories and the admin account.
6. Note the Render URL, e.g. `https://subaz-open-thoughtz-api.onrender.com` — you'll need it for the frontend.

> ⚠️ Render's free tier spins down after inactivity, so the first request after idling can take ~30s to wake up. That's normal.

### Step 3 — Deploy the frontend to Vercel

1. On [vercel.com](https://vercel.com), **Add New → Project**, import the same GitHub repo.
2. Set:
   - **Root directory:** `frontend`
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
3. Since this is a static build (no server-side proxy like the Vite dev server or nginx), point the frontend directly at your Render backend URL. Add an environment variable:
   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://subaz-open-thoughtz-api.onrender.com/api` |

   Then update `frontend/src/services/api.js`'s `baseURL` to use it:
   ```js
   const api = axios.create({
     baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
   });
   ```
   (Locally, with Vite's dev proxy, `/api` still works fine since the env var will be unset.)
4. Deploy. Copy the resulting Vercel URL (e.g. `https://subaz-open-thoughtz.vercel.app`).
5. Go back to Render, set `CLIENT_URL` to that Vercel URL, and redeploy the backend so CORS allows requests from it.

### Step 4 — Verify

Visit your Vercel URL, register an account, and confirm posts/likes/comments work end-to-end. Log in with the seeded admin account and check `/admin`.

---

## 🔑 Environment variable reference

| Variable | Used by | Purpose |
|---|---|---|
| `MONGO_URI` | backend | Database connection string |
| `JWT_SECRET` / `JWT_RESET_SECRET` | backend | Signing secrets for login tokens vs. password-reset tokens (keep these different and secret) |
| `CLIENT_URL` | backend | Used for CORS allow-list and for building the password-reset link |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_USERNAME` | backend (`npm run seed`) | Creates the first admin account |
| `SMTP_HOST/PORT/USER/PASS`, `EMAIL_FROM` | backend | Real password-reset emails via `services/emailService.js`. Leave blank to fall back to console-logging the reset link (fine for local dev) |
| `VITE_API_BASE_URL` | frontend (production builds only) | Where the built static frontend sends API requests, since there's no dev proxy in production |

Never commit a real `.env` file — only the `.env.example` templates are meant to be in version control.
