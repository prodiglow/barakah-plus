import type { Field } from 'payload'

/** Shared SEO metadata group, reused by posts and pages. */
export function seoField(): Field {
  return {
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
  }
}
