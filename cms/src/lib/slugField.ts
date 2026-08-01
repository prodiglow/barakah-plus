import type { Field } from 'payload'

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

/**
 * A slug text field that auto-generates from the title if left blank, with a
 * `-<timestamp>` collision suffix — matches the old blogController.ts's
 * generateSlug behavior exactly. Shared by posts and pages so both stay in
 * sync automatically.
 */
export function slugField(collectionSlug: 'posts' | 'pages'): Field {
  return {
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
            collection: collectionSlug,
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
  }
}
