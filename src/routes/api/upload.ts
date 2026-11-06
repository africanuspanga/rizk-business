import { createFileRoute } from '@tanstack/react-router'
import { currentUser } from '#/server/auth'
import { first, media, newId } from '#/server/db'

const TYPES: Record<string, string> = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' }
const MAX_BYTES = 2_500_000

export const Route = createFileRoute('/api/upload')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const user = await currentUser()
        if (!user) return new Response('Unauthorized', { status: 401 })
        const shop = await first<{ id: string }>('SELECT id FROM shops WHERE owner_id = ?', user.id)
        if (!shop) return new Response('No shop', { status: 403 })
        const type = request.headers.get('content-type') ?? ''
        const ext = TYPES[type]
        if (!ext) return new Response('Unsupported type', { status: 415 })
        const body = await request.arrayBuffer()
        if (body.byteLength > MAX_BYTES) return new Response('Too large', { status: 413 })
        const key = `s/${shop.id}/${newId(12)}.${ext}`
        await media().put(key, body, { httpMetadata: { contentType: type } })
        return Response.json({ key })
      },
    },
  },
})
