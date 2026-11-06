import { Outlet, createFileRoute, notFound } from '@tanstack/react-router'
import { getStorefront } from '#/lib/api/store'
import { imgUrl } from '#/lib/format'

export const Route = createFileRoute('/$shop')({
  loader: async ({ params }) => {
    const data = await getStorefront({ data: { slug: params.shop } })
    if (!data) throw notFound()
    return data
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.shop.name} · RIZK` },
          { name: 'description', content: loaderData.shop.bio || `${loaderData.shop.name} on RIZK` },
          { property: 'og:title', content: loaderData.shop.name },
          { property: 'og:description', content: loaderData.shop.bio },
          ...(loaderData.shop.logo_key || loaderData.products[0]?.images[0]
            ? [{ property: 'og:image', content: imgUrl(loaderData.products[0]?.images[0] ?? loaderData.shop.logo_key) }]
            : []),
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-[520px] px-6 pt-24 text-center">
      <p className="text-[64px]">🛍️</p>
      <h1 className="mt-2 text-[24px] font-extrabold">Duka halipo · Shop not found</h1>
      <a href="/" className="btn mt-6">RIZK</a>
    </div>
  ),
  component: Outlet,
})
