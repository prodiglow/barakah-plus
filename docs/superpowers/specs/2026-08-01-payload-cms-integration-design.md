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
Payload's own auth for CMS editors. Separate from the app's `Admin` collection;
no shared session.

## Rich text → HTML

On every save Payload converts the Lexical JSON to an HTML string and stores it
in `contentHtml`. The frontend continues to render with
`dangerouslySetInnerHTML`, now reading `contentHtml` instead of `content`.

Rationale: least frontend churn, keeps Urdu/RTL content rendering correctly, and
avoids rewriting the blog detail render path. `content` remains the canonical
value, so switching to a structured React renderer later stays possible without
data loss.

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
- `PAYLOAD_SECRET`, `DATABASE_URI`, and Cloudinary credentials supplied as Vercel
  environment variables. Nothing committed — consistent with the existing
  `.env.example` pattern.

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

## Build order

1. Scaffold `cms/`, connect to `barakahCMS`, configure Cloudinary storage.
2. Define `posts`, `pages`, `media`, `users` + the Lexical→HTML hook.
3. Run locally; create a test post; verify REST output and the generated HTML.
4. Deploy to Vercel; set env vars; create the first editor account.
5. Rewire `blogService` + add `pageService`/`CmsPage`; verify against live CMS.
6. Seed the policy pages.
7. Retire the old blog stack (admin tab, Express routes, model).

## Success criteria

- A post authored in Payload appears at `/blogs` and `/blogs/:slug` on
  barakah-main with correct formatting and images.
- Drafts do **not** appear publicly.
- Uploaded images resolve to Cloudinary URLs.
- The five policy/info pages render from the CMS.
- `frontend-main` and `backend` build clean with the old blog stack removed.
