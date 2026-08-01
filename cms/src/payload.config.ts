import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { cloudinaryStorage } from 'payload-storage-cloudinary'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { Pages } from './collections/Pages'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Origins allowed to make cross-origin requests to the CMS's REST/GraphQL
// APIs (public, unauthenticated reads from frontend-main).
const FRONTEND_ORIGINS = [
  'https://barakah-main.vercel.app',
  'http://localhost:5173',
]

// Origins allowed to submit Payload's own httpOnly session cookie back to
// this server (the admin panel's own origin only — NOT frontend-main, which
// never holds this cookie). This must be the CMS's own origin(s), or the
// admin panel's cookie-authenticated writes (login is fine, but every
// subsequent POST/PATCH/DELETE) get silently rejected as unauthenticated.
const CMS_ORIGINS = [
  'https://barakah-cms.vercel.app',
  'http://localhost:3000',
]

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Posts, Pages],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  cors: FRONTEND_ORIGINS,
  csrf: CMS_ORIGINS,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || '',
  }),
  sharp,
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
})
