# Deployment Guide — Barakah Plus

A monorepo with three deployables, each with its own `vercel.json`:

| App | Path | What it is | Deploy as |
|-----|------|-----------|-----------|
| Backend | `backend/` | Express + MongoDB API (serverless) | Vercel project, root `backend/` |
| CMS | `cms/` | Payload v3 (Next.js) — blog posts & pages | Vercel project, root `cms/` |
| Public site | `frontend-main/` | React + Vite storefront | Vercel project, root `frontend-main/` |
| Admin | `frontend-admin/` | React + Vite dashboard | Vercel project, root `frontend-admin/` |

## Environment variables

### Backend (`backend/`) — see `backend/.env.example` for the full list
Required to boot:
- `MONGODB_URI` — your MongoDB connection string
- `JWT_SECRET` — long random string (auth refuses to run without it)

Recommended:
- `CARD_SECRET_KEY` — random string, encrypts saved cards
- `FRONTEND_URL` — the public site URL (used in email links / payment redirects)

Feature-specific (add when you enable each feature):
- Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (image/audio uploads)
- SMTP: `SMTP_EMAIL`, `SMTP_PASSWORD`, `FROM_EMAIL`, … (transactional email)
- JazzCash: `JAZZCASH_*`
- Bank Alfalah: `ALFALAH_*` (sandbox values ship ready; swap for production at go-live)
- `CMS_URL`, `CMS_SYNC_SECRET` — enables syncing the admin login to the CMS (see the Payload CMS integration spec)

### CMS (`cms/`)
- `PAYLOAD_SECRET` — random string (generate fresh per environment, do not reuse across dev/prod)
- `MONGODB_URI` — same Atlas cluster as the backend, **database `barakahCMS`** (not `barakahDB`)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — same Cloudinary account as the backend
- `JWT_SECRET` — **must equal** the backend's `JWT_SECRET` (verifies admin tokens)
- `CMS_SYNC_SECRET` — **must equal** the backend's `CMS_SYNC_SECRET` (guards the admin-user sync endpoint)

### Public site (`frontend-main/`)
- `VITE_API_BASE_URL` — backend origin, **no** trailing `/api` (e.g. `https://your-backend.vercel.app`)
- `VITE_CMS_URL` — the CMS's production URL (blog posts & pages are read from here)

### Admin (`frontend-admin/`)
- `VITE_API_BASE_URL` — backend origin, no trailing `/api`
- `VITE_ADMIN_BASE_URL` — (optional) this admin app's own URL, for generating share links; defaults to the current origin

## Deploy order

1. **Backend first** — deploy it, note its URL, set its env vars.
2. **CMS** — deploy it, note its URL, set `CMS_URL`/`CMS_SYNC_SECRET` on the backend and redeploy the backend.
3. **Public site** — set `VITE_API_BASE_URL` and `VITE_CMS_URL`, deploy.
4. **Admin** — same `VITE_API_BASE_URL`, deploy.

On Vercel, create one project per app with the **Root Directory** set to that subfolder; the per-app `vercel.json` handles the rest.

## Seeding a fresh database

With `MONGODB_URI` set in `backend/.env` (git-ignored), from `backend/`:

```bash
npx ts-node -r dotenv/config src/seeds/adminSeed.ts            # admin login
npx ts-node -r dotenv/config src/seeds/scholarSeed.ts          # scholars
npx ts-node -r dotenv/config src/seeds/IslamicProductSeeder.ts # shop products
npm run seed:duas                                              # duas
npx ts-node -r dotenv/config src/seeds/seedCoupons.ts          # coupons
npx ts-node -r dotenv/config src/seeds/reviewSeed.ts           # scholar reviews
npx ts-node -r dotenv/config src/seeds/testimonialSeed.ts      # testimonials
npx ts-node -r dotenv/config src/seeds/platformTestimonialSeed.ts
npx ts-node -r dotenv/config src/seeds/seedDatabase.ts         # events
```

All seeders read `MONGODB_URI` from the environment — there are no hardcoded connection strings.
Skip `cartSeed`, `seedOrders`, and `userCardsSeed` on a fresh deploy (they seed transactional
records tied to specific user IDs).

## Local development

```bash
npm install          # installs all three workspaces
npm run dev          # runs backend + both frontends
```
