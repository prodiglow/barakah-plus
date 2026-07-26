# Free Personal Dua — Scholar Matching Design

Date: 2026-07-26
Status: Approved, in implementation
Branch: `feature/free-personal-dua-scholar-matching`

## Context

The client-supplied "Free Personal Dua Flow Implementation Plan" describes adding
Gender/Sect fields to the Scholar model and auto-assigning a scholar by matching
the requester's Gender/Sect, keeping the assignment hidden from the user.

Code inspection of `orderController.ts` found this partially exists today as a
two-scholar hardcoded stub:

```ts
if (OrderAmt === 0 || OrderTitle === "Quran Khawani") {
  if (Sect === "Sunni") assignedScholarId = "68f0a62920f6d6ea28513c37";
  else assignedScholarId = "68f096b14829b2ccef2c6e3e";
}
```

Further inspection of the live sect `<Select>` in
`frontend-main/src/Components/home_page/BookYourSpirtualForm.tsx` found that
`"Sunni"` is only a non-selectable `ListSubheader` grouping label — the real
submittable sect values are `Shia`, `Deobandi`, `Barelvi`, `Ahl-e-Hadith`. The
`Sect === "Sunni"` branch above is therefore dead code: every Free Personal Dua
request today falls into the `else` branch and receives the same single
hardcoded scholar, regardless of sect. `gender` is captured and required on
every `Order` but is not used in assignment at all.

`Scholar.ts` has no `gender` or `sect` fields. `scholarSeed.ts` creates exactly
one scholar. The two hardcoded ObjectIds in `orderController.ts` reference
documents that exist only in the live Atlas cluster
(`cluster0.ltpu3mg.mongodb.net/barakahDB` — confirmed to be the production
database backing barakah-main.vercel.app), created manually outside the seed
script, with no reproducible source of truth.

## Decisions (confirmed with stakeholder)

1. **No-match fallback**: seed test scholars covering every gender × sect
   combination so a real match is always available; additionally implement a
   defensive fallback chain in code for robustness.
2. **Sect enum**: hard-coded, enforced, matching the 4 real submittable values:
   `Shia`, `Deobandi`, `Barelvi`, `Ahl-e-Hadith`. (Not `Sunni` — see above.)
3. **Nav/IA fix**: bundled into this same change — add a main-nav/footer link
   to the spiritual-services booking flow so it's discoverable.
4. **Implementation**: build and commit the code on a feature branch, open a
   PR for review before anything touches `public-main`. The Mongo seed script
   will be prepared but **not executed** against the live database as part of
   this change — that requires separate, explicit confirmation from the
   client, since the current DB is production.

## Design

### 1. Shared constants — `backend/src/constants/scholarMatching.ts` (new)

```ts
export const SECTS = ["Shia", "Deobandi", "Barelvi", "Ahl-e-Hadith"] as const;
export type Sect = typeof SECTS[number];

export const GENDERS = ["male", "female"] as const;
export type Gender = typeof GENDERS[number];
```

These exact literal values are mirrored (not shared via a package — no
monorepo shared-types package exists, and introducing one is out of scope) in
the new admin-frontend Gender/Sect fields, matching the casing already used by
`frontend-main`'s existing gender select (`"male"`/`"female"`, lowercase).

### 2. `Scholar` model — add two required fields

`gender: { type: String, enum: GENDERS, required: true }`
`sect: { type: String, enum: SECTS, required: true }`

### 3. Scholar assignment service — `backend/src/services/scholarAssignmentService.ts` (new)

A single exported function, `assignScholarForFreeService`, replacing the
hardcoded stub. Fallback chain, in order:

1. Exact match: `gender` + `sect` + offers the relevant `scholarServices` name
   (`"Dua"` for the Free Personal Dua path; no service filter for the
   `Quran Khawani` path, preserving today's scope for that adjacent flow while
   still adding gender/sect awareness to it).
2. Same `gender`, any `sect`, offering the same service.
3. Any scholar offering the service, any gender/sect.
4. Last resort: the single pre-existing hardcoded scholar ID (kept as a named
   constant, not a magic string), and the order is created with
   `Status: "Pending Admin Review"` so a human can reassign.

This function is called from `orderController.ts` in place of the inline
if/else block. Behavior for non-free (`OrderAmt > 0`) orders where the user
explicitly selects a scholar via `FindScholar` is unchanged — this only
affects the two auto-assign paths.

### 4. Scholar seed — `backend/src/seeds/scholarSeed.ts` (extended, additive only)

The existing seed destructively clears `ScholarEducation` and
`ScholarSpecialization` before reseeding (`deleteMany({})`), which would wipe
real reference data if run against the live DB. The updated seed removes those
deletes and only creates documents that don't already exist (idempotent
upsert-by-name), then adds 8 new scholars — one per gender × sect combination
— each offering all three existing services (`Dua`, `Isthekhara`,
`Wazaif and Adhkar`). The original seeded scholar is left untouched.

**This script is prepared but not run as part of this change.**

### 5. Admin UI — Gender + Sect fields

`AddScholarPage.tsx` and the edit form in `ManageScholars.tsx` gain two new
required `<Select>` fields using the same literal values as above, following
the existing form patterns in those files (MUI `FormControl`/`Select`, same
validation style as other required fields).

### 6. Nav / discoverability fix — `frontend-main`

Add a link to the spiritual-services booking entry point in the main site
navigation and footer, following the existing nav component's structure and
styling conventions. Exact route/label to match whatever `frontend-main`
already uses internally to reach `BookYourSpirtualForm`/`BookYourSpirtualService`
(verified at implementation time by the agent handling this piece).

### 7. Testing

- Build/typecheck all three workspaces (`backend`, `frontend-admin`,
  `frontend-main`).
- Manual QA checklist: all 8 gender×sect combinations produce a real scholar
  match once the seed is applied in a suitable environment; fallback chain
  triggers correctly when a combination has no scholar (verified with a
  temporary local-only test, not against production data); nav link
  navigates correctly from both desktop and mobile nav.

## Out of scope

- Recruiting/onboarding real (non-test) scholars — a non-engineering task.
- Running the seed script against the production database.
- Any change to the paid/manual scholar-selection flow (`FindScholar`,
  `ScholarDetails`) or payment/checkout logic — confirmed working correctly
  for `OrderAmt === 0` (payment gateway is skipped client-side; `OrderAmt`
  validation already accepts `0`).
- Full service-taxonomy rework for `Quran Khawani` or other order types beyond
  what's needed to avoid regressing that path.
