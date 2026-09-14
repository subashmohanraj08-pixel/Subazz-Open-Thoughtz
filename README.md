# 🪶 Subaz Open Thoughtz

> **Think Open. Share Freely. Inspire the World.** 🌍💡

An open social-content and thought-sharing platform built with the MERN stack (MongoDB, Express, React, Node.js). Users can register, log in, share thoughts/images/videos, like, comment, follow each other, and more — with a full admin dashboard for platform moderation.

This project is split into two independent apps:

```
subaz-open-thoughtz/
├── backend/   → Node.js + Express + MongoDB REST API
└── frontend/  → React (Vite) + Tailwind CSS
```

---

## ✅ Prerequisites

Before you start, install:

1. **[Node.js](https://nodejs.org/)** v18 or newer (`node -v` to check)
2. **[MongoDB](https://www.mongodb.com/try/download/community)** — either:
   - Installed locally and running on `mongodb://127.0.0.1:27017`, **or**
   - A free cloud cluster from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (get a connection string)
3. **[VS Code](https://code.visualstudio.com/)** (or any editor)
4. **Git** (to push to GitHub)

---

## 🐳 Fastest way to run it: Docker

If you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed, you don't need Node or MongoDB installed locally at all:

```bash
cp .env.example .env      # edit it and set real secrets
docker compose up --build
docker compose exec backend npm run seed   # first time only
```

Then open **http://localhost:3000**. See **`DEPLOYMENT.md`** for the full guide, plus how to deploy this to Render (backend), Vercel (frontend), and MongoDB Atlas (database).

---

## 🚀 Running it locally in VS Code (without Docker)

### 1. Open the project

Unzip the project folder, then in VS Code: `File → Open Folder...` → select `subaz-open-thoughtz`.

Open **two terminals** in VS Code (`Terminal → New Terminal`, then click the `+` to split) — one for the backend, one for the frontend.

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Open the new `.env` file and fill in your values — at minimum set `MONGO_URI` and change `JWT_SECRET` / `JWT_RESET_SECRET` to random strings. If you're using a local MongoDB install, the default `MONGO_URI` in `.env.example` already works.

Seed the database with default categories and an admin account:

```bash
npm run seed
```

This creates an admin account using the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your `.env` (defaults to `admin@subazopenthoughtz.com` / `ChangeMe_Admin123!` — **change this password after your first login**).

Start the backend:

```bash
npm run dev
```

You should see `Subaz Open Thoughtz API running on port 5000`. Visit `http://localhost:5000/api/health` to confirm it's alive.

### 3. Set up the frontend

In the second terminal:

```bash
cd frontend
npm install
npm run dev
```

This starts the Vite dev server at `http://localhost:3000`, which proxies `/api` and `/uploads` requests to the backend automatically (see `vite.config.js`) — no CORS setup needed for local dev.

### 4. Open the app

Go to **http://localhost:3000** in your browser. Register a new account, or log in with the admin account you seeded to access `/admin`.

---

## 📁 Project structure

```
backend/
├── config/db.js              MongoDB connection
├── controllers/               Route handler logic (auth, posts, comments, users, admin, ...)
├── middleware/
│   ├── auth.js                JWT verification (protect, optionalAuth)
│   ├── rbac.js                Role checks + ownership enforcement (requireOwnershipOrAdmin)
│   ├── upload.js               Secure multer file-upload config
│   └── errorHandler.js
├── models/                     Mongoose schemas: User, Post, Comment, Like, Follow,
│                                Notification, Category, Report
├── routes/                     Express routers, one per resource
├── utils/seed.js               Seeds default categories + first admin account
├── uploads/                    User-uploaded images/videos/avatars (gitignored)
└── server.js                   App entrypoint

frontend/
├── src/
│   ├── components/             Reusable UI: Header, PostCard, CommentSection, Avatar, ...
│   ├── context/                AuthContext, ThemeContext (dark/light mode)
│   ├── pages/                  One file per route, including pages/admin/ for the dashboard
│   ├── services/                Axios client + grouped API call functions
│   └── utils/time.js           timeAgo / formatDate helpers
├── index.html
└── vite.config.js
```

---

## 🔐 How permissions are enforced

This was a core requirement, so here's exactly where to look:

- **`backend/middleware/auth.js`** → `protect` verifies the JWT on every protected request and attaches the real user from the database to `req.user`. Nothing about identity is ever trusted from the request body.
- **`backend/middleware/rbac.js`** → `requireOwnershipOrAdmin(Model, 'author')` loads the target Post/Comment and checks `resource.author === req.user._id`, OR `req.user.role === 'admin'`. Used on every edit/delete route for posts and comments (see `routes/postRoutes.js` and `routes/commentRoutes.js`).
- **`backend/routes/adminRoutes.js`** → the entire router is behind `protect` + `requireRole('admin')`, so no admin endpoint is reachable by a normal user, even if they know the URL.

The frontend also hides buttons a user shouldn't see (e.g. `isOwner` checks in `PostCard.jsx`), but that's just UX — the real enforcement is server-side, so a request like `DELETE /api/posts/:someoneElsesPostId` will get a `403 Forbidden` even if sent directly with curl/Postman.

---

## 🧪 Quick manual test checklist

- [ ] Register two different accounts (User A, User B)
- [ ] User A creates a post → User B can view it but has no Edit/Delete option
- [ ] Try `DELETE /api/posts/<User A's post id>` while logged in as User B via Postman → expect `403`
- [ ] Log in as admin (`/admin/login` or `/login`) → `/admin` dashboard loads; User B's post *can* be deleted from there
- [ ] Like, comment, follow, save, and report all work end-to-end
- [ ] Toggle dark mode in the header — preference persists on reload

---

## 📦 Deploying / pushing to GitHub

```bash
cd subaz-open-thoughtz
git init
git add .
git commit -m "Initial commit: Subaz Open Thoughtz"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

The `.gitignore` files already exclude `node_modules/`, `.env`, and uploaded media, so your repo stays clean. Remember: **never commit your real `.env` file** — only `.env.example` should be pushed.

For production deployment, you'd typically host the backend (Render, Railway, Fly.io, etc.) and the frontend build (`npm run build` in `frontend/`, then deploy the `dist/` folder to Vercel/Netlify), pointing `CLIENT_URL` and the frontend's API base URL at each other.

---

## 📦 Before you push to GitHub: generate package-lock.json

This sandbox has no internet access, so `node_modules/` and `package-lock.json` were **not** generated here — and that's actually correct practice: you should never commit `node_modules/` to Git (it's huge and gets rebuilt automatically by the host). `package-lock.json` *should* be committed though, since it locks exact dependency versions for reproducible builds on Vercel/Render.

Generate both locally, once, right after unzipping:

```bash
cd subaz-open-thoughtz/backend
npm install          # creates backend/package-lock.json + backend/node_modules

cd ../frontend
npm install          # creates frontend/package-lock.json + frontend/node_modules
```

That's it — `node_modules/` stays gitignored, `package-lock.json` gets committed, and every deploy platform will install the exact same dependency versions you tested with.

---

## 🌍 Deploying: Vercel (frontend) + Render (backend) + MongoDB Atlas (database)

Since the frontend and backend are separate apps, they deploy separately. A common free-tier combo:

### 1. Database — MongoDB Atlas

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`) so Render can reach it.
3. Under **Database Access**, create a user/password.
4. Copy the connection string (looks like `mongodb+srv://user:pass@cluster.mongodb.net/subaz_open_thoughtz`).

### 2. Backend — Render

A `render.yaml` blueprint is already included at the project root.

1. Push this repo to GitHub (see commands below).
2. In [Render](https://render.com): **New → Blueprint** → connect your repo → Render reads `render.yaml` automatically.
3. Fill in the environment variables it asks for: `MONGO_URI` (from Atlas above), `CLIENT_URL` (your Vercel frontend URL — you can update this after step 3), `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
4. Deploy. Once live, note your backend URL, e.g. `https://subaz-open-thoughtz-backend.onrender.com`.
5. Run the seed script once via Render's **Shell** tab: `npm run seed`.

> ⚠️ **Note on file uploads:** Render's free tier disk is ephemeral (uploaded images/videos can be lost on redeploy or restart). This backend stores uploads to local disk (`backend/uploads/`), which is fine for local dev and demos. For a production app with permanent media, swap `middleware/upload.js` to upload to a service like Cloudinary or AWS S3 instead of `multer.diskStorage`.

### 3. Frontend — Vercel

A `vercel.json` (for client-side routing) is already included in `frontend/`.

1. In [Vercel](https://vercel.com): **Add New → Project** → import your GitHub repo.
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist` (Vercel usually detects these automatically).
4. Add an environment variable: `VITE_API_BASE_URL` = `https://your-backend.onrender.com/api` (your Render URL from step 2, with `/api` on the end).
5. Deploy. Once live, copy your Vercel URL (e.g. `https://subaz-open-thoughtz.vercel.app`).
6. Go back to Render → your backend's environment variables → update `CLIENT_URL` to that Vercel URL, so CORS allows it. Redeploy the backend.

### 4. Push to GitHub

```bash
cd subaz-open-thoughtz
git init
git add .
git commit -m "Initial commit: Subaz Open Thoughtz"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Both Vercel and Render can also auto-redeploy on every push once connected to the repo.

---

## 🛠️ Tech stack

**Frontend:** React 18, Vite, React Router, Tailwind CSS, Axios
**Backend:** Node.js, Express, MongoDB/Mongoose, JWT, bcrypt, multer, helmet, express-rate-limit, nodemailer
**Infra:** Docker + Docker Compose for local/self-hosted runs; Render / Vercel / MongoDB Atlas for a managed deployment (see `DEPLOYMENT.md`)

### 📧 Password reset emails

`backend/services/emailService.js` sends real emails via SMTP when `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS` are set in `.env` (works with Gmail app passwords, SendGrid, Mailgun, etc.). If SMTP isn't configured, it automatically falls back to printing the reset link to the backend console — handy for local development without setting up a mail provider.
