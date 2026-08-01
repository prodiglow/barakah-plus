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
