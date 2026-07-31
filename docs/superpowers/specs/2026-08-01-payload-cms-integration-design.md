# Payload CMS v3 Integration Design

Date: 2026-08-01
Status: Approved, pending implementation
Branch: `feature/payload-cms` (to be created)

## Context

Barakah Plus currently manages blog content through a hand-built stack:

- `backend/src/models/Blog.ts` — Mongoose model (`blogID` auto-increment via the
  shared `Counter`, `title`, `slug`, `content`, `excerpt`, `coverImage`,
  `images[]`, `tags[]`, `author`, `isFeatured`, `isPublished`,
  `status: draft|published`).
- `backend/src/routes/blogRoutes.ts` — unauthenticated CRUD at `/api/blogs`
  (`/insert`, `/`, `/slug/:slug`, `/:id`, `/update/:id`, `/delete/:id`,
  `/toggle-featured/:id`, `/toggle-published/:id`).
- `frontend-admin` — a "Blogs" tab using `react-quill-new` as the editor.
- `frontend-main` — `services/blogService.ts` plus `pages/AllBlogsPage.tsx` and
  `pages/BlogDetailPage.tsx`.

Two facts from inspection drive this design:

1. **`BlogDetailPage.tsx:201` renders post bodies as raw HTML** via
   `dangerouslySetInnerHTML` (Quill produces an HTML string). Any CMS must
   ultimately hand the frontend an HTML string, or that render path must change.
2. **The blog collection is empty.** `GET https://barakah-backend-pied.vercel.app/api/blogs`
   returns `{"count":0,"blogs":[]}`. There is **no content to migrate**, so the
   old stack can be replaced rather than run in parallel.

The stated goal is a proper content/blog authoring experience (rich text,
drafts, media) while keeping the project's established pattern: self-hosted,
own the data, open source.

### Why Payload v3 cannot mount into the existing apps

Payload v3 is Next.js-native — it installs into a Next.js App Router project and
runs in that process. This repo has an **Express** backend and **two Vite/React**
frontends; there is no Next.js app. Payload v2's standalone-Express mounting
model no longer applies. Payload therefore has to be a **separate application**.

## Decisions (confirmed with stakeholder)

1. **Payload fully replaces the blog stack.** The Quill editor, `/api/blogs`
   routes, `Blog` model and controller are retired. Safe because there are 0
   posts.
2. **Scope: `posts` + `media` + `pages`.** Pages makes About Us / FAQ / policy
   content editable. Homepage banners/promos are **out of scope** for this pass.
3. **Rich text bridged to HTML inside Payload.** Payload stores Lexical JSON and
   also persists a generated `contentHtml` string. The existing
   `dangerouslySetInnerHTML` render path is preserved.
4. **Same Atlas cluster, separate database.** Payload uses
   `cluster0.ltpu3mg.mongodb.net` with database `barakahCMS`, keeping CMS
   documents out of `barakahDB`.
5. **Unified admin identity, phased.** One identity shared with the existing
   `Admin` login. Seamless SSO is deferred to a Phase 2 that lands with the
   planned custom domain, because `*.vercel.app` cannot share session cookies.
   See **Unified authentication**.

## Architecture

A new Next.js 15 app at `cms/` in the monorepo, deployed as a **fourth Vercel
project** alongside `barakah-backend`, `barakah-main`, `barakah-admin`.

```
Editor ──► cms/ (Payload v3 on Next.js, Vercel) ──► Atlas cluster0
                                                     ├── barakahDB   (app data, untouched)
                                                     └── barakahCMS  (CMS content)
                                                          ▲
frontend-main (/blogs, /pages) ──── REST reads ───────────┘
```

Isolation is deliberate: a CMS problem cannot affect checkout or payments.

## Content model

### `posts`
| Field | Type | Notes |
|---|---|---|
| `title` | text, required | |
| `slug` | text, unique, indexed | auto-generated from title, editable |
| `excerpt` | textarea | listing cards |
| `content` | richText (Lexical) | authoring source of truth |
| `contentHtml` | text, admin-hidden | generated on save (see below) |
| `coverImage` | upload → `media` | |
| `tags` | array of text | |
| `author` | text, default "Admin" | matches current shape |
| `featured` | checkbox | replaces `isFeatured` |
| `publishedAt` | date | sort key |
| `seo` | group: metaTitle, metaDescription | new capability |

`versions: { drafts: true }` — replaces the old `isPublished`/`status` pair with
Payload's `_status: draft|published`.

### `pages`
`title`, `slug`, `content` (Lexical), `contentHtml`, `seo`. Seeded with About Us,
FAQ, Refund Policy, Terms & Conditions, Payment & Privacy Policy.

### `media`
Uploads with alt text. **Stored in the existing Cloudinary account**
(cloud name `r4qesufu`) via a Cloudinary storage adapter — required because
Vercel serverless has no persistent filesystem, and it keeps all site imagery in
one place.

### `users`
CMS editors. Unified with the app's existing `Admin` identity — see
**Unified authentication** below.

## Rich text → HTML

On every save Payload converts the Lexical JSON to an HTML string and stores it
in `contentHtml`. The frontend continues to render with
`dangerouslySetInnerHTML`, now reading `contentHtml` instead of `content`.

Rationale: least frontend churn, keeps Urdu/RTL content rendering correctly, and
avoids rewriting the blog detail render path. `content` remains the canonical
value, so switching to a structured React renderer later stays possible without
data loss.

## Unified authentication

Goal: one identity for the CMS and the existing admin — no second account to
manage. Delivered in two phases, because the current hosting blocks the clean
version.

### Verified constraints

1. **Payload v3 supports external-JWT auth.** A collection may declare
   `auth.strategies: [{ name, authenticate }]`. The strategy receives a Web
   `Headers` object plus the `payload` instance, so it can read either an
   `Authorization` header or a cookie, verify a JWT signed by the Express
   backend with the shared `JWT_SECRET`, and return `{ user: { collection:
   'users', ...doc } }`. `auth.disableLocalStrategy: true` turns off Payload's
   own email/password login. (Verified against Payload `v3.87.0` source:
   `packages/payload/src/auth/types.ts`,
   [docs](https://payloadcms.com/docs/authentication/custom-strategies).)
2. **`*.vercel.app` cannot share a session cookie.** `vercel.app` is on the
   [Public Suffix List](https://publicsuffix.org/list/public_suffix_list.dat),
   so a cookie scoped to `.vercel.app` is silently dropped by every browser;
   Vercel
   [documents this explicitly](https://vercel.com/kb/guide/can-i-set-a-cookie-from-my-vercel-project-subdomain-to-vercel-app).
   Two `*.vercel.app` deployments are separate sites, not subdomains.
3. **The Payload admin panel is server-rendered Next.js**, reached by ordinary
   browser navigation. Navigation cannot carry an `Authorization` header, so
   authenticating the panel UI requires a **cookie on the CMS's own origin**.

### Phase 1 — one identity, while still on `*.vercel.app`

- A provisioning script creates the Payload `users` record from the existing
  `Admin` document (same name/email). Password hashes are **not** copied —
  Payload uses its own hashing — so the password is supplied once at
  provisioning time and kept deliberately identical.
- Payload's local (email + password) strategy stays **enabled**, because it is
  the only thing that can authenticate the panel UI without a shared cookie.
- The custom external-JWT strategy is added **now** and used for API access, so
  anything holding a valid `adminToken` (e.g. `frontend-admin`) can call the CMS
  API without a second credential.

Net effect: one email + password, one mental identity; two sign-in actions.

### Phase 2 — seamless SSO, once the custom domain is live

With both apps on subdomains of one registrable domain (e.g.
`admin.example.com` and `cms.example.com`), cookie sharing becomes legal and
Payload
[recommends exactly this](https://payloadcms.com/docs/authentication/cookies):

1. The Express backend additionally issues its JWT as
   `HttpOnly; Secure; SameSite=Lax; Domain=.example.com`.
2. Payload's custom strategy reads that cookie via `parseCookies(headers)`,
   verifies it with the shared `JWT_SECRET`, and finds-or-creates the matching
   Payload user by email.
3. `auth.disableLocalStrategy: true` — the separate CMS password is removed
   entirely.

Result: sign in once at the admin, the CMS is already authenticated.

**Phase 2 prerequisite (blocking).** `backend/src/app.ts:30` currently calls
`app.use(cors())` with no options, which emits `Access-Control-Allow-Origin: *`
and no `Access-Control-Allow-Credentials`. Per the CORS spec a wildcard origin
is incompatible with credentialed requests, so cookie-based cross-origin auth
cannot work until this is replaced with an explicit origin allowlist plus
`credentials: true`. This also closes an existing gap where any website can read
the API cross-origin. Tracked as part of Phase 2, not this build.

**Deliberately rejected: token-handoff SSO on `*.vercel.app`.** Achievable via a
one-time, short-TTL, audience-bound handoff token, but it requires the full set
of OAuth-style mitigations (single-use enforced atomically, `Referrer-Policy:
no-referrer`, POST rather than query string, immediate server-side exchange,
nonce binding) — a meaningful security surface to hand-roll, and discarded the
moment the custom domain lands. Not worth building to save one sign-in.

## Frontend integration

`frontend-main/src/services/blogService.ts` is rewritten to call Payload and to
**map Payload's response shape back to the existing `BlogData` interface**, so
`AllBlogsPage.tsx` and `BlogDetailPage.tsx` need only trivial edits.

| Current call | Replacement |
|---|---|
| `GET /api/blogs` | `GET {CMS}/api/posts?where[_status][equals]=published&sort=-publishedAt&limit=100` |
| `GET /api/blogs/slug/:slug` | `GET {CMS}/api/posts?where[slug][equals]=:slug&where[_status][equals]=published` |
| `GET /api/blogs/:id` | `GET {CMS}/api/posts/:id` |

Mapping rules: `docs[]` → array; `doc.coverImage.url` → `coverImage`;
`doc.contentHtml` → `content`; `doc._status === 'published'` → `isPublished`;
`doc.featured` → `isFeatured`; `doc.id` (string) → `_id`.

Two `BlogData` fields have no Payload equivalent and are filled with safe
defaults by the mapper rather than being removed (keeping the interface stable
for the two consuming pages):

- `images: string[]` → `[]`. In-body images now live inside the rich text /
  media library, so a separate URL array is obsolete.
- `blogID: number` → omitted. It existed only for the `Counter` auto-increment;
  routing uses `slug`, and `BlogDetailPage` already resolves by slug.

New env var `VITE_CMS_URL` (the CMS origin, no trailing `/api`), following the
existing `VITE_API_BASE_URL` convention.

Pages get a small `pageService` and a generic `CmsPage` route component that
looks a page up by slug and renders `contentHtml`.

## Access control & security

- `posts`/`pages`: public **read limited to published documents**; create/update/
  delete require an authenticated Payload user. Drafts are never publicly
  readable.
- `media`: public read; authenticated write.
- CORS and CSRF origins restricted to the frontend origins
  (`https://barakah-main.vercel.app`, `http://localhost:5173`).
- `PAYLOAD_SECRET`, `DATABASE_URI`, Cloudinary credentials, and `JWT_SECRET`
  (shared with the Express backend, required by the external-JWT strategy)
  supplied as Vercel environment variables. Nothing committed — consistent with
  the existing `.env.example` pattern.
- The custom auth strategy pins the JWT algorithm and rejects `none`, and
  returns `{ user: null }` rather than throwing on any verification failure
  (Payload swallows strategy errors and logs them, so a thrown error would
  degrade silently to "unauthenticated").

## Retiring the old stack

Performed **last**, only after the CMS is live and the frontend reads from it, so
there is never a broken window:

1. Remove the Blogs tab and `BlogFormDialog`/`ManageBlogs` from `frontend-admin`;
   drop `react-quill-new` from its dependencies.
2. Remove `blogRoutes.ts`, `blogController.ts`, `models/Blog.ts`, and the
   `/api/blogs` mount in `app.ts`.
3. Leave the `blogs` collection in `barakahDB` in place (empty, harmless).

## Out of scope

- Homepage banners / promo-bar content (possible later via Payload Globals).
- **Localized post content.** The recent i18n work covers UI chrome; authoring
  each post in both English and Urdu would double editorial effort. Payload
  supports localized fields if this is wanted later.
- Products, scholars, duas, orders, payments — these stay in Express/Mongoose and
  are managed by the existing custom admin.

## Risks

| Risk | Mitigation |
|---|---|
| Serverless cold starts make the admin slow to open | Acceptable for an internal editor tool |
| Two admin panels (Payload for content, custom for commerce) | Clear domain split, documented in `DEPLOYMENT.md` |
| Cloudinary adapter misconfiguration silently writing to local disk | Verify an uploaded asset returns a `res.cloudinary.com` URL before go-live |
| Payload response shape drifts from `BlogData` | Mapping isolated in `blogService`; frontend pages stay decoupled |
| Admin password changed in one system but not the other (Phase 1) | Documented as a known limitation; disappears in Phase 2 when the CMS password is removed entirely |
| Custom auth strategy fails silently (Payload logs and falls through) | Strategy returns `null` explicitly on failure; verify via `payload.logger` during testing, not by expecting a 500 |
| Auth strategies are not hot-reloaded in dev | Full server restart after strategy changes — noted in the CMS README |

## Build order

1. Scaffold `cms/`, connect to `barakahCMS`, configure Cloudinary storage.
2. Define `posts`, `pages`, `media`, `users` + the Lexical→HTML hook.
3. Add the external-JWT auth strategy (local strategy left enabled) and the
   `Admin` → Payload user provisioning script.
4. Run locally; create a test post; verify REST output and the generated HTML.
5. Deploy to Vercel; set env vars; provision the editor account.
6. Rewire `blogService` + add `pageService`/`CmsPage`; verify against live CMS.
7. Seed the policy pages.
8. Retire the old blog stack (admin tab, Express routes, model).

Phase 2 (separate piece of work, after the custom domain is live): lock down the
Express CORS config, issue the parent-domain auth cookie, switch the strategy to
read it, and set `disableLocalStrategy: true`.

## Success criteria

- A post authored in Payload appears at `/blogs` and `/blogs/:slug` on
  barakah-main with correct formatting and images.
- Drafts do **not** appear publicly.
- Uploaded images resolve to Cloudinary URLs.
- The five policy/info pages render from the CMS.
- The CMS is signed into with the **same email and password** as the existing
  admin, and a request bearing a valid `adminToken` authenticates against the
  CMS API via the external-JWT strategy.
- `frontend-main` and `backend` build clean with the old blog stack removed.
