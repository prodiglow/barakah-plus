import type { CollectionConfig } from 'payload'
import { externalJwtStrategy } from '../lib/auth/externalJwtStrategy'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  // disableLocalStrategy intentionally left unset (defaults false) — Phase 1
  // of the unified-auth design still needs Payload's own email+password login
  // for the server-rendered admin panel, which can't carry an Authorization
  // header. Phase 2 (once a custom domain exists) will set this to true.
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
      access: {
        update: () => false,
      },
      admin: {
        readOnly: true,
        description:
          "The matching Admin document's _id in the main app's database (barakahDB). Set by the provisioning/sync scripts — do not edit by hand.",
      },
    },
  ],
}
