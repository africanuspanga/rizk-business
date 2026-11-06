import { Link, createFileRoute } from '@tanstack/react-router'
import { Eye, Package } from 'lucide-react'
import { useState } from 'react'
import { Chips, DashedAdd, Img, Page, TopBar } from '#/components/ui'
import { listMyProducts } from '#/lib/api/merchant'
import { tzs } from '#/lib/format'
import { useT } from '#/lib/i18n'

export const Route = createFileRoute('/app/products/')({
  loader: () => listMyProducts(),
  component: Products,
})

type Filter = 'all' | 'live' | 'out' | 'hidden'

function Products() {
  const t = useT()
  const products = Route.useLoaderData()
  const [filter, setFilter] = useState<Filter>('all')
  const out = (p: (typeof products)[number]) => p.stock === 0
  const shown = products.filter((p) =>
    filter === 'all' ? true : filter === 'live' ? p.active && !out(p) : filter === 'out' ? out(p) : !p.active,
  )
  return (
    <Page nav wide>
      <TopBar title={t('Bidhaa zangu', 'My products')} sub={t('Kila bidhaa ina hadithi yake.', 'Every product has a story.')} />
      <Chips
        value={filter}
        onChange={setFilter}
        options={[
          { id: 'all', label: t('Zote', 'All'), count: products.length },
          { id: 'live', label: t('Zinauzwa', 'Live') },
          { id: 'out', label: t('Zimeisha', 'Sold out'), count: products.filter(out).length },
          { id: 'hidden', label: t('Zimefichwa', 'Hidden'), count: products.filter((p) => !p.active).length },
        ]}
      />
      {shown.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {shown.map((p) => (
            <Link key={p.id} to="/app/products/$id" params={{ id: p.id }} className="card overflow-hidden">
              <div className="relative">
                <Img k={p.images[0]} alt={p.name} className="aspect-[4/3.4] w-full" />
                {(!p.active || out(p)) && (
                  <span className="absolute top-3 left-3 rounded-full bg-card/95 px-3 py-1 text-xs font-bold">
                    {!p.active ? t('Imefichwa', 'Hidden') : t('Imeisha', 'Sold out')}
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="truncate text-[16px] font-extrabold">{p.name}</p>
                <p className="mt-0.5 text-sm font-semibold">{tzs(p.price)}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Package size={14} /> {p.stock == null ? '∞' : p.stock}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={14} /> {p.views}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      <div className="mt-4">
        <DashedAdd
          to="/app/products/new"
          title={t('Ongeza bidhaa', 'Add a product')}
          sub={t('Picha, bei na idadi. Inachukua dakika moja.', 'Photo, price and stock. Takes a minute.')}
        />
      </div>
    </Page>
  )
}
