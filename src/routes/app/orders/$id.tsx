import { createFileRoute, notFound, useRouter } from '@tanstack/react-router'
import { AlertTriangle, CheckCircle2, HelpCircle, MessageCircle, Phone } from 'lucide-react'
import { useState } from 'react'
import { Img, Page, StatusPill, TopBar } from '#/components/ui'
import { getOrder, setOrderStatus } from '#/lib/api/merchant'
import { timeAgo, tzs, waLink, type OrderStatus } from '#/lib/format'
import { useLang, useT } from '#/lib/i18n'
import type { PaymentCheck } from '#/lib/payment-sms'
import { useOrigin } from '#/lib/share'

export const Route = createFileRoute('/app/orders/$id')({
  loader: async ({ params }) => {
    const order = await getOrder({ data: { id: params.id } })
    if (!order) throw notFound()
    return order
  },
  component: OrderDetail,
})

function OrderDetail() {
  const t = useT()
  const lang = useLang()
  const router = useRouter()
  const o = Route.useLoaderData()
  const { shop } = Route.useRouteContext()
  const [busy, setBusy] = useState(false)
  const check: PaymentCheck | null = o.payment_check ? JSON.parse(o.payment_check) : null

  async function move(status: OrderStatus, ask?: string) {
    if (ask && !window.confirm(ask)) return
    setBusy(true)
    await setOrderStatus({ data: { id: o.id, status } })
    await router.invalidate()
    setBusy(false)
  }

  const trackUrl = `${useOrigin()}/o/${o.code}`
  const waText = t(
    `Habari ${o.customer_name}, ni ${shop.name}. Oda yako #${o.code}: ${trackUrl}`,
    `Hi ${o.customer_name}, this is ${shop.name}. Your order #${o.code}: ${trackUrl}`,
  )

  const actions: { status: OrderStatus; label: string; soft?: boolean; ask?: string }[] = []
  if (o.status === 'awaiting_payment' || o.status === 'payment_claimed')
    actions.push({ status: 'confirmed', label: t('Nimepokea malipo', 'Payment received') })
  if (o.status === 'payment_claimed')
    actions.push({ status: 'awaiting_payment', label: t('Sijapokea malipo', 'Not received'), soft: true })
  if (o.status === 'confirmed') actions.push({ status: 'dispatched', label: t('Imetumwa', 'Mark as sent') })
  if (o.status === 'confirmed' || o.status === 'dispatched') actions.push({ status: 'delivered', label: t('Imefika', 'Mark delivered'), soft: o.status === 'confirmed' })
  if (!['delivered', 'cancelled'].includes(o.status))
    actions.push({ status: 'cancelled', label: t('Sitisha oda', 'Cancel order'), soft: true, ask: t('Sitisha oda hii?', 'Cancel this order?') })

  return (
    <Page nav>
      <TopBar back="/app/orders" title={`#${o.code}`} sub={timeAgo(o.created_at, lang)} right={<StatusPill status={o.status} />} />

      <section className="card p-5">
        <p className="text-[20px] font-extrabold">{o.customer_name}</p>
        <p className="text-[15px] text-muted">{o.customer_phone}</p>
        <p className="mt-2 text-[15px]">
          <b>{o.area || '—'}</b>
          {o.landmark ? ` · ${o.landmark}` : ''}
        </p>
        {o.note && <p className="mt-2 rounded-2xl bg-canvas px-4 py-3 text-sm">“{o.note}”</p>}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <a href={`tel:${o.customer_phone}`} className="btn btn-soft btn-sm">
            <Phone size={16} /> {t('Piga', 'Call')}
          </a>
          <a href={waLink(o.customer_phone, waText)} target="_blank" rel="noreferrer" className="btn btn-sm bg-[#1f8f4e]">
            <MessageCircle size={16} /> WhatsApp
          </a>
        </div>
      </section>

      <section className="card mt-4 divide-y divide-line">
        {o.lines.map((l, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3">
            <Img k={l.image} alt={l.name} className="h-14 w-14 rounded-2xl" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold">{l.name}</p>
              <p className="text-xs text-muted">
                {l.qty} × {tzs(l.price)}
              </p>
            </div>
            <p className="text-[15px] font-bold">{tzs(l.qty * l.price)}</p>
          </div>
        ))}
        <div className="space-y-1 px-5 py-4 text-[15px]">
          <Row label={t('Bidhaa', 'Items')} value={tzs(o.subtotal)} />
          <Row label={t('Delivery', 'Delivery')} value={tzs(o.delivery_fee)} />
          <Row label={t('Jumla', 'Total')} value={tzs(o.total)} bold />
          <Row label={t('Malipo', 'Payment')} value={o.payment_method === 'cod' ? t('Cash wakati wa kupokea', 'Cash on delivery') : 'Lipa Namba'} />
        </div>
      </section>

      {o.payment_method === 'lipa' && (
        <section className="card mt-4 p-5">
          <h2 className="text-[17px] font-extrabold">{t('Uthibitisho wa malipo', 'Payment proof')}</h2>
          {!o.payment_sms ? (
            <p className="mt-2 text-sm text-muted">
              {t('Mteja bado hajaweka SMS ya malipo. Angalia simu yako kama pesa imeingia.', 'The buyer has not pasted a payment SMS yet. Check your phone for the money.')}
            </p>
          ) : (
            <>
              <p className="mt-3 rounded-2xl bg-canvas px-4 py-3 font-mono text-[13px] leading-relaxed">{o.payment_sms}</p>
              {check && (
                <ul className="mt-3 space-y-2 text-sm">
                  <CheckRow state={check.amount === 'ok' ? 'ok' : check.amount === 'low' ? 'bad' : 'unknown'}>
                    {t('Kiasi', 'Amount')}: {check.parsed.amount != null ? tzs(check.parsed.amount) : t('hakijasomeka', 'not found')}
                    {check.amount === 'low' && ` (${t('pungufu ya', 'less than')} ${tzs(o.total)})`}
                  </CheckRow>
                  <CheckRow state={check.name === 'ok' ? 'ok' : check.name === 'mismatch' ? 'bad' : 'unknown'}>
                    {t('Jina', 'Name')}: {check.parsed.name ?? t('halijasomeka', 'not found')}
                  </CheckRow>
                  <CheckRow state={check.txn === 'ok' ? 'ok' : 'unknown'}>
                    {t('Namba ya muamala', 'Transaction ID')}: {check.parsed.txnId ?? t('haijasomeka', 'not found')}
                  </CheckRow>
                </ul>
              )}
              <p className="mt-3 text-xs text-muted">
                {t('Hakikisha pesa imeingia kwenye simu yako kabla ya kuthibitisha.', 'Make sure the money is in your account before you confirm.')}
              </p>
            </>
          )}
        </section>
      )}

      <div className="mt-5 space-y-3">
        {actions.map((a) => (
          <button
            key={a.status}
            type="button"
            disabled={busy}
            className={`btn w-full ${a.soft ? 'btn-soft' : ''} ${a.status === 'cancelled' ? 'text-bad' : ''}`}
            onClick={() => move(a.status, a.ask)}
          >
            {a.label}
          </button>
        ))}
      </div>
    </Page>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? 'pt-1 text-[17px] font-extrabold' : 'text-muted'}`}>
      <span>{label}</span>
      <span className={bold ? '' : 'text-ink'}>{value}</span>
    </div>
  )
}

function CheckRow({ state, children }: { state: 'ok' | 'bad' | 'unknown'; children: React.ReactNode }) {
  const Icon = state === 'ok' ? CheckCircle2 : state === 'bad' ? AlertTriangle : HelpCircle
  const color = state === 'ok' ? 'text-ok' : state === 'bad' ? 'text-bad' : 'text-muted'
  return (
    <li className="flex items-start gap-2">
      <Icon size={18} className={`mt-0.5 shrink-0 ${color}`} />
      <span>{children}</span>
    </li>
  )
}
