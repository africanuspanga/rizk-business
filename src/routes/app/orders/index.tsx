import { Link, createFileRoute } from '@tanstack/react-router'
import { MapPin } from 'lucide-react'
import { useState } from 'react'
import { Chips, Page, StatusPill, TopBar } from '#/components/ui'
import { listOrders } from '#/lib/api/merchant'
import { timeAgo, tzs } from '#/lib/format'
import { useLang, useT } from '#/lib/i18n'

export const Route = createFileRoute('/app/orders/')({
  loader: () => listOrders(),
  component: Orders,
})

type Filter = 'todo' | 'all' | 'done' | 'cancelled'

function Orders() {
  const t = useT()
  const lang = useLang()
  const orders = Route.useLoaderData()
  const [filter, setFilter] = useState<Filter>('todo')
  const todo = (s: string) => ['awaiting_payment', 'payment_claimed', 'confirmed', 'dispatched'].includes(s)
  const shown = orders.filter((o) =>
    filter === 'all' ? true : filter === 'todo' ? todo(o.status) : filter === 'done' ? o.status === 'delivered' : o.status === 'cancelled',
  )
  return (
    <Page nav wide>
      <TopBar title={t('Oda', 'Orders')} sub={t('Kila oda ni riziki.', 'Every order is a livelihood.')} />
      <Chips
        value={filter}
        onChange={setFilter}
        options={[
          { id: 'todo', label: t('Za kushughulikia', 'To do'), count: orders.filter((o) => todo(o.status)).length },
          { id: 'done', label: t('Zimefika', 'Delivered') },
          { id: 'cancelled', label: t('Zimesitishwa', 'Cancelled') },
          { id: 'all', label: t('Zote', 'All') },
        ]}
      />
      {shown.length === 0 ? (
        <div className="card p-8 text-center text-[15px] text-muted">{t('Hakuna oda hapa.', 'No orders here.')}</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {shown.map((o) => (
            <Link key={o.id} to="/app/orders/$id" params={{ id: o.id }} className="card block p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[17px] font-extrabold">{o.customer_name}</p>
                  <p className="text-xs text-muted">
                    #{o.code} · {timeAgo(o.created_at, lang)} · {o.items} {t('bidhaa', 'items')}
                  </p>
                </div>
                <StatusPill status={o.status} />
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="flex min-w-0 items-center gap-1.5 text-muted">
                  <MapPin size={15} /> <span className="truncate">{o.area || '—'}</span>
                </span>
                <span className="shrink-0 font-bold">
                  {tzs(o.total)} · {o.payment_method === 'cod' ? 'Cash' : 'Lipa'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Page>
  )
}
