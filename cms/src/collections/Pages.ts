import type { CollectionConfig } from 'payload'
import { contentHtmlField } from '../lib/contentHtmlField'
import { slugField } from '../lib/slugField'
import { seoField } from '../lib/seoField'

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
    slugField('pages'),
    {
      name: 'content',
      type: 'richText',
    },
    contentHtmlField('content'),
    seoField(),
  ],
}
