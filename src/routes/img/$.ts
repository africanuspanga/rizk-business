import { createFileRoute } from '@tanstack/react-router'
import { media } from '#/server/db'

export const Route = createFileRoute('/img/$')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const key = params._splat ?? ''
        if (!/^s\/[a-z0-9]+\/[a-z0-9]+\.(webp|jpg|png)$/.test(key)) return new Response('Not found', { status: 404 })
        const obj = await media().get(key)
        if (!obj) return new Response('Not found', { status: 404 })
        return new Response(obj.body, {
          headers: {
            'content-type': obj.httpMetadata?.contentType ?? 'image/webp',
            'cache-control': 'public, max-age=31536000, immutable',
          },
        })
      },
    },
  },
})
