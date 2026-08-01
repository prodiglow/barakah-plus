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
