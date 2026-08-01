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
