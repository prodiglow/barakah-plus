import type { AuthStrategy } from 'payload'
import { jwtVerify } from 'jose'

/**
 * Authenticates requests that carry a JWT issued by the Express backend
 * (Authorization: Bearer <token>, signed with the shared JWT_SECRET). Maps
 * the token's Admin _id to the matching Payload user via the `adminId` field
 * set at provisioning time (a later task) — the CMS never queries barakahDB
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
      // Pin the accepted algorithm explicitly: without this, jose would trust
      // whatever `alg` the token itself claims (including "none"), which is
      // exactly the algorithm-confusion / alg:none class of JWT attack this
      // pin blocks.
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
