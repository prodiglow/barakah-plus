# Payload CMS v3 Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a self-hosted Payload CMS v3 app that manages blog posts and
editable pages for Barakah Plus, sharing an admin identity with the existing
custom admin, and retire the old Quill/Express blog stack once the frontend
reads from the new CMS.

**Architecture:** A new, standalone Next.js 15 app (`cms/`) running Payload v3,
connected to the existing MongoDB Atlas cluster (separate `barakahCMS`
database) and the existing Cloudinary account. It deploys as a fourth Vercel
project. `frontend-main` is rewired to read posts/pages from the CMS's REST API
instead of the old `/api/blogs` Express routes.

**Tech Stack:** Payload CMS v3.87.0, Next.js 15 (App Router), `@payloadcms/db-mongodb`,
`@payloadcms/richtext-lexical` (Lexical editor), `payload-storage-cloudinary`
(Cloudinary uploads), `jose` (JWT verification), existing Express 5 backend,
existing React 19 + Vite `frontend-main`.

Reference: `docs/superpowers/specs/2026-08-01-payload-cms-integration-design.md`

---

## Before you start

- `cms/` is **not** added to the root npm workspaces array. Payload/Next.js
  requires `npm install --legacy-peer-deps`, which the scaffolding tool runs
  automatically for its own isolated `node_modules`/lockfile — mixing that into
  the root workspace install could affect the other three apps. `cms/` is a
  fully independent npm project, matching how it deploys (its own Vercel
  project with Root Directory `cms/`).
- All commands below assume a working directory of `C:\Barakah Plus` unless a
  step says otherwise.
- Real secrets (the Mongo password, Cloudinary secret, JWT secret) are **never
  typed into a committed file's literal text in this plan** — every step that
  needs one says "copy the value already in `backend/.env`" or "generate a new
  one with this command," matching how every other secret in this repo was
  handled.

---

### Task 1: Scaffold the Payload v3 app

**Files:**
- Create: `cms/` (entire app, via the official scaffolding tool)
- Modify: `.gitignore` (repo root)
- Modify: `package.json` (repo root — add a convenience dev script only)

- [ ] **Step 1: Run the non-interactive scaffold command**

From `C:\Barakah Plus`:

```bash
npx create-payload-app@3.87.0 cms --template blank --db mongodb --db-accept-recommended --use-npm --no-agent --no-git
```

Expected: a `cms/` directory is created containing (among other files)
`package.json`, `src/payload.config.ts`, `src/collections/Users.ts`,
`src/collections/Media.ts`, `src/app/(payload)/...`, `.env`, `.gitignore`,
`tsconfig.json`. The command runs `npm install --legacy-peer-deps` for you —
wait for it to finish. `--no-git` prevents the tool from touching git state
(it would otherwise no-op anyway, since it detects the parent repo, but this
makes it unconditional).

- [ ] **Step 2: Verify the scaffold**

```bash
ls cms/src/collections
```

Expected: `Media.ts` and `Users.ts` listed.

```bash
cat cms/src/payload.config.ts
```

Expected: a `buildConfig({...})` call importing `Users` and `Media`, using
`mongooseAdapter({ url: process.env.DATABASE_URL || '' })` and
`secret: process.env.PAYLOAD_SECRET || ''`.

- [ ] **Step 3: Rename the Mongo env var for repo-wide consistency**

The rest of this monorepo calls this variable `MONGODB_URI` (see
`backend/.env.example`). Rename it here to match.

Open `cms/src/payload.config.ts` and change:

```ts
  db: mongooseAdapter({ url: process.env.DATABASE_URL || '' }),
```

to:

```ts
  db: mongooseAdapter({ url: process.env.MONGODB_URI || '' }),
```

- [ ] **Step 4: Point `cms/.env` at the CMS's own database**

Open `cms/.env` (created by the scaffold). It currently has `DATABASE_URL=...`
and an auto-generated `PAYLOAD_SECRET=...` — leave `PAYLOAD_SECRET` as-is.

Replace the `DATABASE_URL` line with `MONGODB_URI`, using the **same host and
credentials already in `backend/.env`**, but the database name `barakahCMS`
instead of `barakahDB`:

1. Open `backend/.env` and find the `MONGODB_URI` line.
2. Copy it into `cms/.env` as `MONGODB_URI=` — same value, but change the
   database-name segment (the path right after the host, before the `?`) from
   `barakahDB` to `barakahCMS`.
3. Delete the old `DATABASE_URL=` line from `cms/.env`.

- [ ] **Step 5: Verify the CMS boots and reaches the database**

```bash
cd cms && npm run dev
```

Expected in the terminal: no error, a line like `Next.js ... started server on
http://localhost:3000`, and (after a few seconds) `MongoDB connected` /
Payload's own startup log with no connection error. Leave it running.

Open `http://localhost:3000/admin` in a browser. Expected: Payload's
"Create your first user" onboarding screen (proves the app booted, the admin
panel renders, and the database connection works — this screen only appears
when it could query the empty `users` collection).

Do **not** create the account through this screen — stop the dev server
(Ctrl+C) once you've confirmed the screen loads. Task 6 provisions the account
programmatically, from the existing `Admin` record.

- [ ] **Step 6: Add a convenience script + gitignore entries**

Edit `C:\Barakah Plus\package.json`, adding a `dev:cms` entry (do **not** add
`cms` to `workspaces` or to the aggregate `dev` script — see "Before you
start"):

```json
  "scripts": {
    "dev:main": "npm --workspace frontend-main run dev",
    "dev:admin": "npm --workspace frontend-admin run dev",
    "dev:backend": "npm --workspace backend run dev",
    "dev:cms": "npm --prefix cms run dev",
    "dev": "npm-run-all --parallel dev:backend dev:main dev:admin"
  },
```

Edit `C:\Barakah Plus\.gitignore`, adding (Next.js build output and Vercel's
local metadata — the existing `node_modules/` and `.env` patterns already
cover `cms/node_modules` and `cms/.env` since they have no leading slash):

```
.next/
.vercel/
```

- [ ] **Step 7: Confirm what's about to be committed, then commit**

```bash
cd "C:/Barakah Plus" && git status --short cms/ package.json .gitignore
```

Expected: `cms/` shows as a new, untracked directory; no `cms/node_modules`,
`cms/.next`, or `cms/.env` listed (all ignored). If any of those DO appear,
stop and fix the gitignore before proceeding — do not commit secrets or
`node_modules`.

```bash
git add cms package.json .gitignore
git commit -m "Scaffold Payload CMS v3 app in cms/"
```

---

### Task 2: Wire uploads to the existing Cloudinary account

**Files:**
- Modify: `cms/src/payload.config.ts`
- Modify: `cms/.env`
- Modify: `cms/src/collections/Media.ts`

- [ ] **Step 1: Install the storage plugin**

```bash
cd "C:/Barakah Plus/cms" && npm install payload-storage-cloudinary cloudinary
```

- [ ] **Step 2: Copy the existing Cloudinary credentials into `cms/.env`**

Open `backend/.env`, find `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
`CLOUDINARY_API_SECRET`, and add the same three lines (same values, same
names) to `cms/.env`.

- [ ] **Step 3: Harden `Media` access control**

The scaffolded `Media` collection only sets `read: () => true` — Payload's
default access for any operation left unspecified is fully open, meaning as
scaffolded, anyone could upload or delete media via the public API. Fix this
to match the spec ("media: public read; authenticated write").

Read the current file:

```bash
cat "C:/Barakah Plus/cms/src/collections/Media.ts"
```

Replace its contents with:

```ts
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
```

- [ ] **Step 4: Wire the Cloudinary plugin into `payload.config.ts`**

Open `cms/src/payload.config.ts`. Add the import near the other imports:

```ts
import { cloudinaryStorage } from 'payload-storage-cloudinary'
```

Add a `plugins` array to the `buildConfig({...})` call (the scaffolded config
already has `plugins: []` — replace it):

```ts
  plugins: [
    cloudinaryStorage({
      cloudConfig: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      },
      collections: {
        media: true,
      },
    }),
  ],
```

- [ ] **Step 5: Verify an upload actually lands in Cloudinary**

```bash
cd "C:/Barakah Plus/cms" && npm run dev
```

Open `http://localhost:3000/admin`, complete the "create your first user"
screen with any throwaway local email/password (this local dev account is
separate from Task 6's real provisioning — Task 6 will add the real one; you
can leave this throwaway one in place, it's local-only and never deployed).

Log in, go to **Media** in the left nav, click **Create New**, upload any
small image, fill in **Alt**, save.

Expected: after saving, the media document shows a URL starting with
`https://res.cloudinary.com/r4qesufu/`. If it instead shows a local
`/api/media/file/...` URL, the plugin isn't wired — stop and re-check Step 4
before continuing (this is the exact risk flagged in the spec's risk table).

Stop the dev server once confirmed.

- [ ] **Step 6: Commit**

```bash
cd "C:/Barakah Plus" && git add cms/src/collections/Media.ts cms/src/payload.config.ts cms/package.json cms/package-lock.json && git commit -m "Store CMS media uploads in the existing Cloudinary account"
```

---

### Task 3: Rich-text → HTML bridge (shared hook)

**Files:**
- Create: `cms/src/lib/contentHtmlField.ts`

This is used by both `Posts` and `Pages` (Task 4 and Task 5), so it's built
once as a reusable field-hook factory.

- [ ] **Step 1: Install `jose`** (used later by the auth strategy, added now
  since it's a small, unrelated-to-storage dependency change worth batching)

```bash
cd "C:/Barakah Plus/cms" && npm install jose
```

- [ ] **Step 2: Write the shared HTML-generation hook**

Create `cms/src/lib/contentHtmlField.ts`:

```ts
import type { Field } from 'payload'
import { getPayloadPopulateFn } from '@payloadcms/richtext-lexical'
import { convertLexicalToHTMLAsync } from '@payloadcms/richtext-lexical/html-async'

/**
 * A hidden text field that mirrors a sibling Lexical `richText` field as an
 * HTML string, regenerated on every save. Lets the existing frontend keep
 * rendering blog/page content via dangerouslySetInnerHTML unchanged.
 */
export function contentHtmlField(sourceFieldName: string): Field {
  return {
    name: 'contentHtml',
    type: 'textarea',
    admin: {
      hidden: true,
      readOnly: true,
    },
    hooks: {
      beforeChange: [
        async ({ siblingData, req }) => {
          const lexicalData = siblingData?.[sourceFieldName]
          if (!lexicalData) return ''

          const populate = await getPayloadPopulateFn({
            currentDepth: 0,
            depth: 1,
            req,
            overrideAccess: false,
          })

          return await convertLexicalToHTMLAsync({
            data: lexicalData,
            populate,
          })
        },
      ],
    },
  }
}
```

- [ ] **Step 3: Commit**

```bash
cd "C:/Barakah Plus" && git add cms/src/lib/contentHtmlField.ts cms/package.json cms/package-lock.json && git commit -m "Add shared Lexical-to-HTML field hook for CMS collections"
```

---

### Task 4: `posts` collection

**Files:**
- Create: `cms/src/collections/Posts.ts`
- Modify: `cms/src/payload.config.ts`

- [ ] **Step 1: Write the collection**

Create `cms/src/collections/Posts.ts`:

```ts
import type { CollectionConfig } from 'payload'
import { contentHtmlField } from '../lib/contentHtmlField'

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', '_status', 'publishedAt'],
  },
  versions: {
    drafts: true,
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      return { _status: { equals: 'published' } }
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Auto-generated from the title if left blank.',
      },
      hooks: {
        beforeValidate: [
          async ({ value, siblingData, req, originalDoc }) => {
            const base = slugify(value || siblingData?.title || '')
            if (!base) return value

            const existing = await req.payload.find({
              collection: 'posts',
              where: {
                slug: { equals: base },
                id: { not_equals: originalDoc?.id },
              },
              limit: 1,
            })

            return existing.docs.length ? `${base}-${Date.now()}` : base
          },
        ],
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
    },
    {
      name: 'content',
      type: 'richText',
    },
    contentHtmlField('content'),
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
    {
      name: 'author',
      type: 'text',
      defaultValue: 'Admin',
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
        },
        {
          name: 'metaDescription',
          type: 'textarea',
        },
      ],
    },
  ],
}
```

Note: the `slug` field only auto-fills when left blank (matches the old
`blogController.ts`'s `generateSlug` behavior, including the timestamp-suffix
collision fallback) — if an editor types their own slug, it's kept as typed
(after slugification), not silently overwritten.

- [ ] **Step 2: Register the collection**

Open `cms/src/payload.config.ts`. Add the import:

```ts
import { Posts } from './collections/Posts'
```

Update the `collections` array:

```ts
  collections: [Users, Media, Posts],
```

- [ ] **Step 3: Verify it boots with no config errors**

```bash
cd "C:/Barakah Plus/cms" && npm run dev
```

Expected: no error in the terminal. Open `http://localhost:3000/admin`, log
in with the throwaway account from Task 2, confirm **Posts** appears in the
left nav and its create form shows Title, Slug, Excerpt, Content, Cover Image,
Tags, Author, Featured, Published At, and an SEO group — with no visible
"Content Html" field (it's hidden).

Stop the dev server.

- [ ] **Step 4: Commit**

```bash
cd "C:/Barakah Plus" && git add cms/src/collections/Posts.ts cms/src/payload.config.ts && git commit -m "Add posts collection with drafts, slugs, and Lexical-to-HTML bridge"
```

---

### Task 5: `pages` collection

**Files:**
- Create: `cms/src/collections/Pages.ts`
- Modify: `cms/src/payload.config.ts`

- [ ] **Step 1: Write the collection**

Create `cms/src/collections/Pages.ts`:

```ts
import type { CollectionConfig } from 'payload'
import { contentHtmlField } from '../lib/contentHtmlField'

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [
          async ({ value, siblingData, req, originalDoc }) => {
            const base = slugify(value || siblingData?.title || '')
            if (!base) return value

            const existing = await req.payload.find({
              collection: 'pages',
              where: {
                slug: { equals: base },
                id: { not_equals: originalDoc?.id },
              },
              limit: 1,
            })

            return existing.docs.length ? `${base}-${Date.now()}` : base
          },
        ],
      },
    },
    {
      name: 'content',
      type: 'richText',
    },
    contentHtmlField('content'),
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
        },
        {
          name: 'metaDescription',
          type: 'textarea',
        },
      ],
    },
  ],
}
```

`pages` has no `versions`/drafts (the five seeded pages are always public, per
the design spec) — so `access.read` is unconditionally `() => true`, unlike
`posts`.

- [ ] **Step 2: Register the collection**

Open `cms/src/payload.config.ts`. Add the import:

```ts
import { Pages } from './collections/Pages'
```

Update the `collections` array:

```ts
  collections: [Users, Media, Posts, Pages],
```

- [ ] **Step 3: Verify**

```bash
cd "C:/Barakah Plus/cms" && npm run dev
```

Open `http://localhost:3000/admin`, confirm **Pages** appears in the nav with
Title, Slug, Content, and SEO fields. Stop the dev server.

- [ ] **Step 4: Commit**

```bash
cd "C:/Barakah Plus" && git add cms/src/collections/Pages.ts cms/src/payload.config.ts && git commit -m "Add pages collection for editable site content"
```

---

### Task 6: Unified auth — external-JWT strategy on `Users`

**Files:**
- Modify: `cms/src/collections/Users.ts`
- Create: `cms/src/lib/auth/externalJwtStrategy.ts`

- [ ] **Step 1: Add the `name` and `adminId` fields to `Users`**

`adminId` maps a Payload user back to the Express `Admin._id` that owns it —
this is what lets the auth strategy resolve an Express-issued JWT (which only
carries `{ id }`, not an email) to a Payload user without the CMS needing a
second database connection into `barakahDB`.

Read the current file:

```bash
cat "C:/Barakah Plus/cms/src/collections/Users.ts"
```

Replace its contents with:

```ts
import type { CollectionConfig } from 'payload'
import { externalJwtStrategy } from '../lib/auth/externalJwtStrategy'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    strategies: [externalJwtStrategy],
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: () => false,
    update: ({ req: { user } }) => Boolean(user),
    delete: () => false,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'adminId',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
        description:
          "The matching Admin document's _id in the main app's database (barakahDB). Set by the provisioning/sync scripts — do not edit by hand.",
      },
    },
  ],
}
```

`create`/`delete` are locked to `() => false` over the public REST/GraphQL
API — new editor accounts are only ever created by the provisioning script and
the sync hook (Task 7), both of which use Payload's Local API, which bypasses
`access` control by default. `auth.strategies` is set with
`disableLocalStrategy` left unset (defaults to `false`), so Payload's built-in
email+password login stays enabled — required for Phase 1, since the
server-rendered admin panel authenticates via browser navigation, which cannot
carry an `Authorization` header.

- [ ] **Step 2: Write the external-JWT strategy**

Create `cms/src/lib/auth/externalJwtStrategy.ts`:

```ts
import type { AuthStrategy } from 'payload'
import { jwtVerify } from 'jose'

/**
 * Authenticates requests that carry a JWT issued by the Express backend
 * (Authorization: Bearer <token>, signed with the shared JWT_SECRET). Maps
 * the token's Admin _id to the matching Payload user via the `adminId` field
 * set at provisioning time (Task 7) — the CMS never queries barakahDB
 * directly.
 *
 * Payload swallows any error thrown by a strategy and logs it, silently
 * falling through to the next strategy — so failures here return
 * `{ user: null }` explicitly rather than throwing, and are logged via
 * payload.logger for visibility during testing.
 */
export const externalJwtStrategy: AuthStrategy = {
  name: 'external-express-jwt',
  authenticate: async ({ payload, headers }) => {
    const authHeader = headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return { user: null }
    }

    const token = authHeader.slice('Bearer '.length)
    const secret = process.env.JWT_SECRET
    if (!secret) {
      payload.logger.error(
        'external-express-jwt: JWT_SECRET is not set, cannot verify tokens',
      )
      return { user: null }
    }

    let adminId: string
    try {
      const { payload: claims } = await jwtVerify(
        token,
        new TextEncoder().encode(secret),
        { algorithms: ['HS256'] },
      )
      if (typeof claims.id !== 'string') {
        return { user: null }
      }
      adminId = claims.id
    } catch (err) {
      payload.logger.info(
        `external-express-jwt: token verification failed (${(err as Error).message})`,
      )
      return { user: null }
    }

    const result = await payload.find({
      collection: 'users',
      where: { adminId: { equals: adminId } },
      limit: 1,
    })

    const doc = result.docs[0]
    if (!doc) {
      return { user: null }
    }

    return {
      user: {
        ...doc,
        collection: 'users',
        _strategy: 'external-express-jwt',
      },
    }
  },
}
```

`{ algorithms: ['HS256'] }` pins the accepted algorithm explicitly, so a
token signed with `alg: none` or a different algorithm is rejected outright
rather than trusted — matching the design spec's security requirement.

- [ ] **Step 3: Verify locally (expect this to correctly find no user yet)**

There's no `Admin`-linked Payload user provisioned until Task 7, so this step
only confirms the strategy loads without crashing the app and correctly
rejects an unrelated token.

```bash
cd "C:/Barakah Plus/cms" && npm run dev
```

Expected: no startup error (a broken strategy would throw at config-build
time, not silently). In another terminal:

```bash
curl -s -H "Authorization: Bearer not-a-real-token" http://localhost:3000/api/users/me
```

Expected: `{"user":null,...}` or similar unauthenticated response — not a 500.
Stop the dev server.

- [ ] **Step 4: Commit**

```bash
cd "C:/Barakah Plus" && git add cms/src/collections/Users.ts cms/src/lib/auth/externalJwtStrategy.ts && git commit -m "Add external-JWT auth strategy so adminToken authenticates against the CMS"
```

---

### Task 7: Admin ↔ CMS credential sync

**Files:**
- Create: `cms/src/app/api/sync/admin-user/route.ts`
- Modify: `backend/src/controllers/adminController.ts`
- Create: `backend/src/services/cmsSyncService.ts`
- Modify: `backend/.env.example`
- Create: `cms/src/scripts/resyncAdminUser.ts`
- Create: `cms/.env.example`

This implements the spec's "Admin → CMS user sync hook": a secret-guarded
endpoint on the CMS that the Express backend calls after any admin-credential
mutation, keeping the two logins identical without a shared database.

- [ ] **Step 1: Generate the shared sync secret**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output. Add it to **both** `backend/.env` and `cms/.env` as:

```
CMS_SYNC_SECRET=<the value you generated>
```

(Same value in both files — this is what authenticates the backend's calls to
the CMS's sync endpoint. It is never sent to a browser.)

- [ ] **Step 2: Write the CMS-side sync endpoint**

Create `cms/src/app/api/sync/admin-user/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: Request) {
  const secret = request.headers.get('x-sync-secret')
  if (!secret || secret !== process.env.CMS_SYNC_SECRET) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const { adminId, name, email, password } = body ?? {}

  if (!adminId || !name || !email || !password) {
    return NextResponse.json(
      { message: 'adminId, name, email, and password are required' },
      { status: 400 },
    )
  }

  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'users',
    where: { adminId: { equals: adminId } },
    limit: 1,
  })

  if (existing.docs.length) {
    const doc = await payload.update({
      collection: 'users',
      id: existing.docs[0].id,
      data: { name, email, password },
    })
    return NextResponse.json({ message: 'updated', id: doc.id })
  }

  const doc = await payload.create({
    collection: 'users',
    data: { adminId, name, email, password },
  })
  return NextResponse.json({ message: 'created', id: doc.id })
}
```

`payload.create`/`payload.update` here use the Local API, which bypasses the
`Users` collection's `access.create: () => false` — that restriction only
applies to the public REST/GraphQL surface, not this server-side call.

- [ ] **Step 3: Write the Express-side sync service**

Create `backend/src/services/cmsSyncService.ts`:

```ts
import dotenv from "dotenv";

dotenv.config();

/**
 * Fire-and-forget sync of an admin's credentials to the Payload CMS, so the
 * same login works in both systems (Phase 1 of the unified-auth design — see
 * docs/superpowers/specs/2026-08-01-payload-cms-integration-design.md).
 *
 * Deliberately non-blocking: a CMS outage must never prevent an admin
 * password reset or admin creation from succeeding in the main app. Errors
 * are logged, not thrown.
 */
export function syncAdminToCms(admin: {
  id: string;
  name: string;
  email: string;
  password: string;
}): void {
  const cmsUrl = process.env.CMS_URL;
  const syncSecret = process.env.CMS_SYNC_SECRET;

  if (!cmsUrl || !syncSecret) {
    console.warn("⚠️ CMS_URL or CMS_SYNC_SECRET not set — skipping CMS user sync");
    return;
  }

  fetch(`${cmsUrl}/api/sync/admin-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-sync-secret": syncSecret,
    },
    body: JSON.stringify({
      adminId: admin.id,
      name: admin.name,
      email: admin.email,
      password: admin.password,
    }),
  })
    .then(async (res) => {
      if (!res.ok) {
        console.error(`⚠️ CMS user sync failed: HTTP ${res.status} — ${await res.text()}`);
      } else {
        console.log(`✅ CMS user synced for admin ${admin.email}`);
      }
    })
    .catch((err) => {
      console.error("⚠️ CMS user sync request failed:", err.message);
    });
}
```

- [ ] **Step 4: Call it from `resetPassword`**

Open `backend/src/controllers/adminController.ts`. Add the import near the
top:

```ts
import { syncAdminToCms } from "../services/cmsSyncService";
```

In `resetPassword`, the plaintext `newPassword` is available right before
`admin.save()` hashes it. Find:

```ts
    // Update Password
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({ message: "Password updated successfully" });
```

Replace with:

```ts
    // Update Password
    admin.password = newPassword;
    await admin.save();

    syncAdminToCms({
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      password: newPassword,
    });

    res.status(200).json({ message: "Password updated successfully" });
```

(`syncAdminToCms` is called with the plaintext `newPassword`, not
`admin.password`, which is already hashed by this point via the model's
pre-save hook.)

- [ ] **Step 5: Call it from admin seeding**

Open `backend/src/seeds/adminSeed.ts`. Add the import:

```ts
import { syncAdminToCms } from "../services/cmsSyncService";
```

Find:

```ts
    console.log("✅ Admin seeded successfully");
    console.log("📧 Email:", admin.email);
    console.log("👤 Name:", admin.name);
```

Add right after it:

```ts
    syncAdminToCms({
      id: (admin._id as any).toString(),
      name: admin.name,
      email: admin.email,
      password: ADMIN_PASSWORD,
    });
```

(Uses `ADMIN_PASSWORD`, the plaintext value already read from
`SEED_ADMIN_PASSWORD` at the top of the script — `admin.password` is already
hashed by this point.)

- [ ] **Step 6: Document the new env vars**

Add to `backend/.env.example` (after the existing Bank Alfalah block):

```
# Payload CMS sync (keeps the admin login identical in both systems)
CMS_URL=
CMS_SYNC_SECRET=
```

Create `cms/.env.example`:

```
# Auto-generated by create-payload-app — keep as-is per environment
PAYLOAD_SECRET=

# Same MongoDB cluster as the main app, separate database (barakahCMS)
MONGODB_URI=

# Cloudinary — same account as the main app (see backend/.env.example)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Must equal the main app's JWT_SECRET — verifies Express-issued tokens
JWT_SECRET=

# Must equal the main app's CMS_SYNC_SECRET — guards the admin-user sync endpoint
CMS_SYNC_SECRET=
```

- [ ] **Step 7: Write the repair script (for if the two ever drift)**

Create `cms/src/scripts/resyncAdminUser.ts`:

```ts
/**
 * Manually re-syncs a Payload user's credentials from a known-good admin
 * password, for when a sync call failed while the CMS was down. Run:
 *   npx tsx src/scripts/resyncAdminUser.ts <adminId> <name> <email> <password>
 */
import { getPayload } from 'payload'
import config from '@payload-config'

async function main() {
  const [adminId, name, email, password] = process.argv.slice(2)
  if (!adminId || !name || !email || !password) {
    console.error('Usage: resyncAdminUser.ts <adminId> <name> <email> <password>')
    process.exit(1)
  }

  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'users',
    where: { adminId: { equals: adminId } },
    limit: 1,
  })

  if (existing.docs.length) {
    await payload.update({
      collection: 'users',
      id: existing.docs[0].id,
      data: { name, email, password },
    })
    console.log('✅ Updated existing CMS user for adminId', adminId)
  } else {
    await payload.create({
      collection: 'users',
      data: { adminId, name, email, password },
    })
    console.log('✅ Created CMS user for adminId', adminId)
  }

  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Resync failed:', err)
  process.exit(1)
})
```

- [ ] **Step 8: Typecheck the backend change**

```bash
cd "C:/Barakah Plus/backend" && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 9: Commit**

```bash
cd "C:/Barakah Plus" && git add cms/src/app/api/sync cms/src/scripts/resyncAdminUser.ts cms/.env.example backend/src/services/cmsSyncService.ts backend/src/controllers/adminController.ts backend/src/seeds/adminSeed.ts backend/.env.example && git commit -m "Sync admin credentials to the CMS on reset/seed (Phase 1 unified auth)"
```

---

### Task 8: Local end-to-end verification

**Files:** none (verification only)

This proves Tasks 1–7 work together before deploying anything.

**Note:** `backend/.env`'s `MONGODB_URI` already points at the same production
Atlas cluster used by the deployed backend (this project has no separate local
database — confirmed throughout this repo's setup). So "local" here means
running the Express/Next processes on your machine while they talk to the real
production `barakahDB`/`barakahCMS` — there is only one admin account, shared
between local and deployed. Task 10 reuses this same fact.

- [ ] **Step 1: Start the CMS and the backend together**

Terminal 1:
```bash
cd "C:/Barakah Plus/backend" && npm run dev
```

Terminal 2:
```bash
cd "C:/Barakah Plus/cms" && npm run dev
```

Wait for both to report ready (backend on `:5000`, CMS on `:3000`).

- [ ] **Step 2: Set `CMS_URL` locally**

Add to `backend/.env`:
```
CMS_URL=http://localhost:3000
```

Restart the backend dev server (Ctrl+C, `npm run dev` again) so it picks up
the new env var.

- [ ] **Step 3: Trigger a sync via the real password-reset code path**

This project already has an admin account (from earlier seeding), so
`adminSeed.ts` will hit its "admin already exists, skipping" branch and never
reach the sync call — that call only fires for a brand-new admin. To exercise
the real sync (and the real `resetPassword` handler) against an *existing*
admin, mint a reset token exactly the way `forgotPassword` does, then call
`resetPassword` directly — this sidesteps needing SMTP configured for a local
test.

Replace `<your admin email>` below with the real seeded admin's email:

```bash
cd "C:/Barakah Plus/backend" && node -e "
require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Admin = mongoose.model('Admin', new mongoose.Schema({ name: String, email: String, password: String }));
  const admin = await Admin.findOne({ email: '<your admin email>' });
  if (!admin) { console.error('Admin not found'); process.exit(1); }
  console.log(jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '5m' }));
  process.exit(0);
});
"
```

Expected: a JWT string printed. Copy it, then:

```bash
RESET_TOKEN="<paste the token>"
NEW_PASSWORD="<pick a password — this changes the real admin's live password>"
curl -s -X POST http://localhost:5000/api/admin/reset-password -H "Content-Type: application/json" -d "{\"token\":\"$RESET_TOKEN\",\"newPassword\":\"$NEW_PASSWORD\"}"
```

Expected response: `{"message":"Password updated successfully"}`. In the
backend terminal (running from Step 2), expect a log line
`✅ CMS user synced for admin <email>`. If you instead see "CMS user sync
failed," check that the CMS dev server (Task 8 Step 1) is actually running
and `CMS_URL` is correct before continuing.

Remember `$NEW_PASSWORD` — it's the real admin login from this point on,
locally and in production (this is the same database either way).

- [ ] **Step 4: Verify the same credentials log into the CMS admin panel**

Open `http://localhost:3000/admin`, sign in with the admin's email and the
`$NEW_PASSWORD` you just set.

Expected: successful login, landing on the Payload dashboard.

- [ ] **Step 5: Verify JWT bearer auth works against the CMS API**

```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/admin/login -H "Content-Type: application/json" -d "{\"email\":\"<your admin email>\",\"password\":\"$NEW_PASSWORD\"}" | python -c "import sys,json;print(json.load(sys.stdin)['token'])")
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/users/me
```

Expected: a JSON response with a `user` object containing your admin's email
and `"_strategy":"external-express-jwt"` — proving the Express-issued token
authenticates directly against the CMS with no separate CMS login.

- [ ] **Step 6: Create a test post and verify the REST output**

In the CMS admin panel, go to **Posts → Create New**. Fill in:
- Title: `Test Post`
- Content: any paragraph of text
- Click **Save** (top right), then click the **Publish** button.

```bash
curl -s "http://localhost:3000/api/posts?where[slug][equals]=test-post" | python -m json.tool
```

Expected: `docs` contains one post with `_status: "published"`, and
`contentHtml` contains an HTML string (e.g. `<p>...</p>`) matching what you
typed — proving the Lexical→HTML hook ran.

- [ ] **Step 7: Verify drafts are not publicly readable**

Back in the admin panel, open the test post, click the **Unpublish** button
(or create a second post and leave it unpublished).

```bash
curl -s "http://localhost:3000/api/posts?where[slug][equals]=test-post"
```

Expected: `docs: []` (empty) — an unauthenticated request no longer sees it.

```bash
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:3000/api/posts?where[slug][equals]=test-post"
```

Expected: the post IS returned when authenticated — confirming the
`access.read` logic from Task 4 behaves correctly in both directions.

Re-publish the post afterward and leave it published, or delete it — either
is fine, it was only for this verification.

- [ ] **Step 8: Stop both dev servers**

Ctrl+C in both terminals. This task makes no code changes, so there is nothing
to commit.

---

### Task 9: Deploy the CMS to Vercel

**Files:** none (deployment + Vercel configuration only)

- [ ] **Step 1: Link the CMS as a new Vercel project**

```bash
cd "C:/Barakah Plus/cms" && vercel link --yes --project barakah-cms
```

Expected: `✓ Linked agripure/barakah-cms` (matching the scope used for the
other three apps).

- [ ] **Step 2: Generate a production `PAYLOAD_SECRET`**

Do not reuse the local dev one from `cms/.env`. Generate a fresh one for
production:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

- [ ] **Step 3: Set all CMS environment variables on Vercel**

Run each of these from `cms/`, substituting the generated/copied value for
`<value>` (do not paste real secrets into chat or into any committed file —
these commands set them directly in Vercel):

```bash
vercel env add PAYLOAD_SECRET production --value "<value from Step 2>" --yes
vercel env add MONGODB_URI production --value "<same value as backend's MONGODB_URI, but database barakahCMS>" --yes
vercel env add CLOUDINARY_CLOUD_NAME production --value "<same as backend/.env>" --yes
vercel env add CLOUDINARY_API_KEY production --value "<same as backend/.env>" --yes
vercel env add CLOUDINARY_API_SECRET production --value "<same as backend/.env>" --yes
vercel env add JWT_SECRET production --value "<same value as backend's JWT_SECRET>" --yes
vercel env add CMS_SYNC_SECRET production --value "<same value as backend's CMS_SYNC_SECRET>" --yes
```

- [ ] **Step 4: Deploy**

```bash
cd "C:/Barakah Plus/cms" && vercel --prod --yes
```

Expected: `"readyState": "READY"` and a deployment URL like
`barakah-cms-xxxxx-agripure.vercel.app`. Note the clean production URL:

```bash
vercel project ls | grep barakah-cms
```

- [ ] **Step 5: Verify the deployed admin panel loads**

Open `https://<the production URL from Step 4>/admin` in a browser.

Expected: the admin panel renders without a server error — either Payload's
"create your first user" screen or a login form (either confirms the app
booted and reached `barakahCMS` on Atlas; the Atlas network-access rule set up
earlier in this project already permits Vercel's IPs, since it's the same
cluster the backend already uses). Which screen appears doesn't matter — Task
10 provisions the real account through the API, not through this screen
either way.

Do **not** create a user through this screen.

- [ ] **Step 6: Set `CMS_URL` on the backend and redeploy it**

```bash
cd "C:/Barakah Plus/backend" && vercel env add CMS_URL production --value "https://<the production CMS URL>" --yes
vercel env add CMS_SYNC_SECRET production --value "<same value used in Step 3>" --yes
vercel --prod --yes
```

---

### Task 10: Provision the real editor account against the live CMS

**Files:** none (one-time operational step)

- [ ] **Step 1: Trigger a sync against production**

Provisioning the live CMS user means calling the real `resetPassword` handler
once against production, which calls `syncAdminToCms`. The admin dashboard's
"Forgot Password" UI sends the reset link by email, which needs SMTP — not
necessarily configured yet on this deployment. Use the same direct
token-minting approach as Task 8 Step 3, pointed at production instead of
localhost.

This requires running a short script with the **production** `MONGODB_URI`
and `JWT_SECRET` — the same values already set in the backend's Vercel
environment. Run it locally using those same values from `backend/.env` (this
project's local dev already points at the same production database — see
Task 8's note), so this step is identical to Task 8 Step 3 except the `curl`
target changes from `localhost:5000` to the production backend:

```bash
cd "C:/Barakah Plus/backend" && node -e "
require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Admin = mongoose.model('Admin', new mongoose.Schema({ name: String, email: String, password: String }));
  const admin = await Admin.findOne({ email: '<your admin email>' });
  if (!admin) { console.error('Admin not found'); process.exit(1); }
  console.log(jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '5m' }));
  process.exit(0);
});
"
```

```bash
RESET_TOKEN="<paste the token>"
NEW_PASSWORD="<the password you set in Task 8, or a new one>"
curl -s -X POST https://barakah-backend-pied.vercel.app/api/admin/reset-password -H "Content-Type: application/json" -d "{\"token\":\"$RESET_TOKEN\",\"newPassword\":\"$NEW_PASSWORD\"}"
```

Expected: `{"message":"Password updated successfully"}`, and the production
backend's logs (`vercel logs barakah-backend-pied.vercel.app`) show
`✅ CMS user synced for admin <email>`.

- [ ] **Step 2: Verify the live CMS accepts the same login**

Open `https://<production CMS URL>/admin`, sign in with the same email and
`$NEW_PASSWORD` set in Step 1.

Expected: successful login.

- [ ] **Step 3: Verify bearer-token auth against the live CMS**

```bash
TOKEN=$(curl -s -X POST https://barakah-backend-pied.vercel.app/api/admin/login -H "Content-Type: application/json" -d "{\"email\":\"<admin email>\",\"password\":\"$NEW_PASSWORD\"}" | python -c "import sys,json;print(json.load(sys.stdin)['token'])")
curl -s -H "Authorization: Bearer $TOKEN" "https://<production CMS URL>/api/users/me"
```

Expected: same as the local Task 8 check — a `user` object with
`"_strategy":"external-express-jwt"`.

---

### Task 11: Rewire `frontend-main` to the live CMS

**Files:**
- Modify: `frontend-main/src/services/blogService.ts`
- Create: `frontend-main/src/services/pageService.ts`
- Create: `frontend-main/src/pages/CmsPage.tsx`
- Modify: `frontend-main/src/routes/AppRoutes.tsx`
- Modify: `frontend-main/.env.local`

- [ ] **Step 1: Add the CMS URL env var**

Add to `frontend-main/.env.local`:

```
VITE_CMS_URL=http://localhost:3000
```

(This points local dev at the locally-running CMS; production gets the live
URL set directly in Vercel in Task 13.)

- [ ] **Step 2: Rewrite `blogService.ts`**

Read the current file first:

```bash
cat "C:/Barakah Plus/frontend-main/src/services/blogService.ts"
```

Replace `frontend-main/src/services/blogService.ts` with:

```ts
const CMS_URL = import.meta.env.VITE_CMS_URL || 'http://localhost:3000';

export interface BlogData {
    _id?: string;
    title: string;
    slug?: string;
    content: string;
    excerpt: string;
    coverImage: string;
    images: string[];
    tags: string[];
    author: string;
    isFeatured: boolean;
    isPublished: boolean;
    status?: 'draft' | 'published';
    createdAt?: string;
    updatedAt?: string;
}

interface PayloadPost {
    id: string;
    title: string;
    slug: string;
    content?: unknown;
    contentHtml?: string;
    excerpt?: string;
    coverImage?: { url?: string } | string | null;
    tags?: Array<{ tag?: string }>;
    author?: string;
    featured?: boolean;
    publishedAt?: string;
    _status?: 'draft' | 'published';
    createdAt?: string;
    updatedAt?: string;
}

interface PayloadListResponse<T> {
    docs: T[];
    totalDocs: number;
}

// Maps a Payload `posts` document back to the shape the existing frontend
// pages (AllBlogsPage, BlogDetailPage) already expect. `images` has no
// Payload equivalent (in-body images now live in the rich text / media
// library) and `blogID` is dropped (routing uses `slug`) — see
// docs/superpowers/specs/2026-08-01-payload-cms-integration-design.md.
function mapPost(doc: PayloadPost): BlogData {
    const coverImage =
        typeof doc.coverImage === 'object' && doc.coverImage
            ? doc.coverImage.url || ''
            : (doc.coverImage as string) || '';

    return {
        _id: doc.id,
        title: doc.title,
        slug: doc.slug,
        content: doc.contentHtml || '',
        excerpt: doc.excerpt || '',
        coverImage,
        images: [],
        tags: (doc.tags || []).map((t) => t.tag || '').filter(Boolean),
        author: doc.author || 'Admin',
        isFeatured: Boolean(doc.featured),
        isPublished: doc._status === 'published',
        status: doc._status,
        createdAt: doc.publishedAt || doc.createdAt,
        updatedAt: doc.updatedAt,
    };
}

export const blogService = {
    getAllBlogs: async (): Promise<{ blogs: BlogData[]; count: number }> => {
        const res = await fetch(
            `${CMS_URL}/api/posts?where[_status][equals]=published&sort=-publishedAt&limit=100`,
        );
        if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);
        const data: PayloadListResponse<PayloadPost> = await res.json();
        return { blogs: data.docs.map(mapPost), count: data.totalDocs };
    },

    getBlogById: async (id: string): Promise<{ blog: BlogData }> => {
        const res = await fetch(`${CMS_URL}/api/posts/${id}`);
        if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);
        const doc: PayloadPost = await res.json();
        return { blog: mapPost(doc) };
    },

    getBlogBySlug: async (slug: string): Promise<{ blog: BlogData }> => {
        const res = await fetch(
            `${CMS_URL}/api/posts?where[slug][equals]=${encodeURIComponent(slug)}&where[_status][equals]=published&limit=1`,
        );
        if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);
        const data: PayloadListResponse<PayloadPost> = await res.json();
        if (!data.docs.length) throw new Error('Post not found');
        return { blog: mapPost(data.docs[0]) };
    },
};
```

This preserves `BlogDetailPage.tsx`'s existing try/getBlogBySlug-then-catch-
fallback-to-getBlogById behavior unchanged, since both methods still throw on
a miss.

- [ ] **Step 3: Add a `pageService` for the CMS `pages` collection**

Create `frontend-main/src/services/pageService.ts`:

```ts
const CMS_URL = import.meta.env.VITE_CMS_URL || 'http://localhost:3000';

export interface PageData {
    title: string;
    slug: string;
    content: string; // HTML
    seo?: { metaTitle?: string; metaDescription?: string };
}

interface PayloadPage {
    title: string;
    slug: string;
    contentHtml?: string;
    seo?: { metaTitle?: string; metaDescription?: string };
}

interface PayloadListResponse<T> {
    docs: T[];
}

export const pageService = {
    getPageBySlug: async (slug: string): Promise<PageData> => {
        const res = await fetch(
            `${CMS_URL}/api/pages?where[slug][equals]=${encodeURIComponent(slug)}&limit=1`,
        );
        if (!res.ok) throw new Error(`Failed to fetch page: ${res.status}`);
        const data: PayloadListResponse<PayloadPage> = await res.json();
        if (!data.docs.length) throw new Error('Page not found');
        const doc = data.docs[0];
        return {
            title: doc.title,
            slug: doc.slug,
            content: doc.contentHtml || '',
            seo: doc.seo,
        };
    },
};
```

- [ ] **Step 4: Add a generic `CmsPage` route component**

Create `frontend-main/src/pages/CmsPage.tsx`:

```tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { pageService, PageData } from '../services/pageService';

/**
 * Renders a single CMS-managed page (About Us, FAQ, policies, etc.) by slug.
 * Route: /pages/:slug — see AppRoutes.tsx.
 */
const CmsPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [page, setPage] = useState<PageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;
        setLoading(true);
        setError(null);
        pageService
            .getPageBySlug(slug)
            .then(setPage)
            .catch(() => setError('Page not found.'))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 15 }}>
                <CircularProgress sx={{ color: '#1db954' }} />
            </Box>
        );
    }

    if (error || !page) {
        return (
            <Box sx={{ textAlign: 'center', py: 15 }}>
                <Typography color="error" variant="h5">
                    {error || 'Page not found.'}
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 3, md: 0 }, py: { xs: 6, md: 8 } }}>
            <Typography variant="h3" fontWeight={800} gutterBottom>
                {page.title}
            </Typography>
            <Box
                dangerouslySetInnerHTML={{ __html: page.content }}
                sx={{
                    fontSize: '1.05rem',
                    lineHeight: 1.8,
                    color: '#333',
                    '& p': { mb: 2 },
                    '& img': { maxWidth: '100%', height: 'auto' },
                }}
            />
        </Box>
    );
};

export default CmsPage;
```

- [ ] **Step 5: Register the route**

Open `frontend-main/src/routes/AppRoutes.tsx`. Add the import near the other
page imports:

```tsx
import CmsPage from "../pages/CmsPage";
```

Add a route (near the existing blog routes):

```tsx
      <Route path="/pages/:slug" element={<CmsPage />} />
```

- [ ] **Step 6: Typecheck and build**

```bash
cd "C:/Barakah Plus/frontend-main" && npm run build
```

Expected: build succeeds with no TypeScript errors.

- [ ] **Step 7: Verify against the locally-running CMS**

Start the CMS locally again if it's not running:
```bash
cd "C:/Barakah Plus/cms" && npm run dev
```

Start the frontend:
```bash
cd "C:/Barakah Plus/frontend-main" && npm run dev
```

Open `http://localhost:5173/blogs`. Expected: the "Test Post" from Task 8
(if you left it published) appears in the grid.

Click into it. Expected: the post renders with the same styling as before
(headings, paragraphs, etc. via the existing CSS in `BlogDetailPage.tsx`),
proving `contentHtml` round-trips correctly through the new `blogService`.

- [ ] **Step 8: Commit**

```bash
cd "C:/Barakah Plus" && git add frontend-main/src/services/blogService.ts frontend-main/src/services/pageService.ts frontend-main/src/pages/CmsPage.tsx frontend-main/src/routes/AppRoutes.tsx && git commit -m "Read blog posts and CMS pages from Payload instead of the Express blog API"
```

(`.env.local` is git-ignored, matching the rest of this repo — not committed.)

---

### Task 12: Seed the five policy pages

**Files:** none (content, entered through the CMS admin UI)

- [ ] **Step 1: Read the current content to migrate**

Each of these five pages currently exists as a hardcoded React component:

```bash
cat "C:/Barakah Plus/frontend-main/src/componentsnew/AboutUs.tsx"
cat "C:/Barakah Plus/frontend-main/src/componentsnew/FAQ.tsx"
cat "C:/Barakah Plus/frontend-main/src/componentsnew/RefundPolicy.tsx"
cat "C:/Barakah Plus/frontend-main/src/componentsnew/TermsConditions.tsx"
cat "C:/Barakah Plus/frontend-main/src/componentsnew/PaymentPrivacyPolicy.tsx"
```

- [ ] **Step 2: Create each page in the CMS admin**

Open the CMS admin panel (local `http://localhost:3000/admin` for a dry run,
or the production URL once you're ready to publish for real). For each of the
five pages, click **Pages → Create New**, and fill in:

| Title | Slug |
|---|---|
| About Us | `about-us` |
| FAQ | `faq` |
| Refund Policy | `refund-policy` |
| Terms & Conditions | `terms-conditions` |
| Payment & Privacy Policy | `payment-privacy-policy` |

For **Content**, transcribe the visible text from the corresponding
`.tsx` file read in Step 1 into the Lexical rich-text editor (headings,
paragraphs, lists as they appear in the JSX) — the editor's toolbar covers
headings, bold, lists, and links, matching what these five pages actually use.
Save and Publish is implicit for `pages` (no draft system — see Task 5), so
saving alone makes it live.

- [ ] **Step 3: Verify each page renders**

For each slug, visit `http://localhost:5173/pages/<slug>` (or the production
site once deployed) and confirm the content displays.

This task makes no code changes — nothing to commit.

---

### Task 13: Retire the old blog stack

**Files:**
- Modify: `backend/src/app.ts`
- Delete: `backend/src/routes/blogRoutes.ts`
- Delete: `backend/src/controllers/blogController.ts`
- Delete: `backend/src/models/Blog.ts`
- Modify: `frontend-admin/src/components/AdminDashboard.tsx`
- Delete: `frontend-admin/src/pages/ManageBlogs.tsx`
- Delete: `frontend-admin/src/components/BlogFormDialog.tsx`
- Delete: `frontend-admin/src/services/blogService.ts`
- Modify: `frontend-admin/package.json`

Performed last, only now that Task 11 proves the frontend reads from the CMS
— so there is never a window where blog content is unreadable.

- [ ] **Step 1: Remove the Express blog routes**

```bash
cd "C:/Barakah Plus"
git rm backend/src/routes/blogRoutes.ts backend/src/controllers/blogController.ts backend/src/models/Blog.ts
```

Open `backend/src/app.ts`. Remove the import line:

```ts
import blogRoutes from "./routes/blogRoutes";
```

Remove the mount line:

```ts
app.use("/api/blogs", blogRoutes);
```

- [ ] **Step 2: Typecheck the backend**

```bash
cd "C:/Barakah Plus/backend" && npx tsc --noEmit
```

Expected: no errors (confirms nothing else in the backend imports the removed
files).

- [ ] **Step 3: Remove the admin dashboard's Blogs tab**

Open `frontend-admin/src/components/AdminDashboard.tsx`.

Remove the lazy import:

```tsx
const ManageBlogs = lazy(() => import("../pages/ManageBlogs")); // Blog Component
```

Remove the `'/admin/dashboard/blogs': 10,` line from `pathToTabIndex`, and
the `10: '/admin/dashboard/blogs',` line from `tabIndexToPath`.

Remove the `<Tab label="Blogs" {...a11yProps(10)} .../>` block (the last
`<Tab>` before `</Tabs>`).

Remove the `<CustomTabPanel value={value} index={10} ...>` block containing
`<ManageBlogs refreshTrigger={refreshTrigger} />` (the last `CustomTabPanel`
before the closing `</Box>`).

Index 10 was the last tab, so no other tab's index needs renumbering.

- [ ] **Step 4: Delete the now-unused blog admin files**

```bash
cd "C:/Barakah Plus"
git rm frontend-admin/src/pages/ManageBlogs.tsx frontend-admin/src/components/BlogFormDialog.tsx frontend-admin/src/services/blogService.ts
```

- [ ] **Step 5: Remove the Quill dependency**

```bash
cd "C:/Barakah Plus/frontend-admin" && npm uninstall react-quill-new quill
```

(`quill` was a direct dependency alongside `react-quill-new` — confirmed via
`package.json` during planning; remove both. If `npm uninstall` reports
`quill` isn't a direct dependency by the time you run this, that's fine —
`react-quill-new` alone is the one that matters.)

- [ ] **Step 6: Build the admin frontend**

```bash
cd "C:/Barakah Plus/frontend-admin" && npm run build
```

Expected: build succeeds with no errors (confirms nothing else imports the
removed Blogs components or Quill).

- [ ] **Step 7: Commit**

```bash
cd "C:/Barakah Plus" && git add -A && git commit -m "Retire the Quill/Express blog stack now that the frontend reads from Payload"
```

---

### Task 14: Deploy everything and update docs

**Files:**
- Modify: `DEPLOYMENT.md`
- Modify: `frontend-main` Vercel project env vars (no local file change)

- [ ] **Step 1: Deploy the backend (blog routes removed)**

```bash
cd "C:/Barakah Plus/backend" && vercel --prod --yes
```

Expected: `"readyState": "READY"`.

- [ ] **Step 2: Set the production CMS URL on `frontend-main` and deploy**

```bash
cd "C:/Barakah Plus/frontend-main" && vercel env add VITE_CMS_URL production --value "https://<production CMS URL from Task 9>" --yes
vercel --prod --yes
```

- [ ] **Step 3: Deploy the admin dashboard (Blogs tab removed)**

```bash
cd "C:/Barakah Plus/frontend-admin" && vercel --prod --yes
```

- [ ] **Step 4: Full live verification**

```bash
curl -s "https://barakah-main.vercel.app" -o /dev/null -w "main site: %{http_code}\n"
curl -s "https://<production CMS URL>/api/posts?where[_status][equals]=published" | python -m json.tool | head -20
```

Open `https://barakah-main.vercel.app/blogs` in a browser. Expected: any
published posts appear. Open `https://barakah-main.vercel.app/pages/about-us`
(and the other four slugs from Task 12). Expected: each renders.

Open `https://barakah-admin-umber.vercel.app`. Expected: no "Blogs" tab
present; all other tabs (Scholars, Requests, Users, Payments, etc.) unaffected.

- [ ] **Step 5: Update `DEPLOYMENT.md`**

Open `DEPLOYMENT.md`. Add a row to the top table:

```markdown
| CMS | `cms/` | Payload v3 (Next.js) — blog posts & pages | Vercel project, root `cms/` |
```

Add a new section after the "Admin" env-var section:

```markdown
### CMS (`cms/`)
- `PAYLOAD_SECRET` — random string (generate fresh per environment, do not reuse across dev/prod)
- `MONGODB_URI` — same Atlas cluster as the backend, **database `barakahCMS`** (not `barakahDB`)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — same Cloudinary account as the backend
- `JWT_SECRET` — **must equal** the backend's `JWT_SECRET` (verifies admin tokens)
- `CMS_SYNC_SECRET` — **must equal** the backend's `CMS_SYNC_SECRET` (guards the admin-user sync endpoint)
```

Add to the backend env-var section:

```markdown
- `CMS_URL`, `CMS_SYNC_SECRET` — enables syncing the admin login to the CMS (see the Payload CMS integration spec)
```

Update the "Deploy order" list to insert the CMS as step 2 (backend → CMS →
frontends), since `frontend-main` needs the CMS's URL:

```markdown
1. **Backend first** — deploy it, note its URL, set its env vars.
2. **CMS** — deploy it, note its URL, set `CMS_URL`/`CMS_SYNC_SECRET` on the backend and redeploy the backend.
3. **Public site** — set `VITE_API_BASE_URL` and `VITE_CMS_URL`, deploy.
4. **Admin** — same `VITE_API_BASE_URL`, deploy.
```

- [ ] **Step 6: Commit**

```bash
cd "C:/Barakah Plus" && git add DEPLOYMENT.md && git commit -m "Document the CMS deployable in DEPLOYMENT.md"
```

- [ ] **Step 7: Push**

```bash
git push origin <current-branch>
```

---

## What's deliberately not in this plan (Phase 2)

Per the design spec, Phase 2 — seamless cookie-based SSO between the admin and
the CMS, replacing the sync-hook approach in Task 7 — is separate work that
starts once a custom domain is live. It requires: issuing the Express JWT as a
`Domain=.yourdomain.com` cookie, having the auth strategy read that cookie via
`parseCookies` instead of only the `Authorization` header, and setting
`disableLocalStrategy: true` on `Users` (at which point Task 7's sync
endpoint, `CMS_SYNC_SECRET`, and the two Express call sites are deleted
entirely). Do not start this until the domain exists — it cannot work on
`*.vercel.app` (see the spec's "Unified authentication" section for why).
