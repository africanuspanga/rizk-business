import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, Check, Copy, ExternalLink, Share2 } from 'lucide-react'
import { useState } from 'react'
import { Lattice, Rosette } from '#/components/motifs'
import { Img, LangSwitch, Page, StatusPill } from '#/components/ui'
import { getDashboard } from '#/lib/api/merchant'
import { timeAgo, tzs } from '#/lib/format'
import { useLang, useT } from '#/lib/i18n'
import { shareLink, useOrigin } from '#/lib/share'

export const Route = createFileRoute('/app/')({
  loader: () => getDashboard(),
  component: Dashboard,
})

/* Black and white brand: ink for what matters, greys for the rest. */
const INK = '#0e0e0e'
const n = (v: number) => Math.round(v).toLocaleString('en-US')

function change(now: number, before: number) {
  if (!before) return now ? null : 0
  return Math.round(((now - before) / before) * 1000) / 10
}

function Dashboard() {
  const t = useT()
  const lang = useLang()
  const d = Route.useLoaderData()
  const { shop, user } = Route.useRouteContext()
  const [copied, setCopied] = useState(false)
  const url = `${useOrigin()}/${shop.slug}`
  const conversion = d.visits.shop ? Math.round((d.counts.all / d.visits.shop) * 1000) / 10 : 0
  const newest = d.recent[0]
  const fresh = newest && Date.now() - newest.created_at < 24 * 3600_000

  const setupSteps = [
    { done: d.setup.products, label: t('Ongeza bidhaa ya kwanza', 'Add your first product'), to: '/app/products/new' },
    { done: d.setup.payment, label: t('Weka Lipa Namba', 'Add your Lipa Namba'), to: '/app/shop' },
    { done: d.setup.delivery, label: t('Weka maeneo ya delivery', 'Set delivery areas'), to: '/app/shop' },
    { done: d.setup.logo, label: t('Weka logo ya duka', 'Add a shop logo'), to: '/app/shop' },
  ]
  const setupLeft = setupSteps.filter((s) => !s.done).length
  const last7 = t('Siku 7 zilizopita', 'Last 7 days')
  const maxDay = Math.max(...d.days.map((x) => x.total), 1)

  return (
    <Page nav wide>
      <header className="flex items-center gap-3 pb-4">
        <Img k={shop.logo_key} alt={shop.name} className="h-12 w-12 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[22px] leading-tight font-bold tracking-tight md:text-[28px]">
            {t(`Habari, ${user.name.split(' ')[0]}`, `Hello, ${user.name.split(' ')[0]}`)}
          </h1>
          <p className="truncate text-sm text-muted">{shop.name}</p>
        </div>
        <a href={`/${shop.slug}`} target="_blank" rel="noreferrer" className="icon-btn" aria-label={t('Fungua duka', 'Open shop')}>
          <ExternalLink size={18} />
        </a>
        <LangSwitch />
      </header>

      {fresh && (
        <Link
          to="/app/orders/$id"
          params={{ id: newest.id }}
          className="mb-3 flex items-center gap-3 rounded-[20px] border border-[#ebe9e6] bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-ink text-white">
            <Rosette size={18} className="[--rosette-hole:#0e0e0e]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-2">
              <b className="text-[15px]">{t('Oda mpya', 'New order')}</b>
              <span className="text-xs text-muted">{timeAgo(newest.created_at, lang)}</span>
            </span>
            <span className="block truncate text-sm text-ink/75">
              #{newest.code} · {tzs(newest.total)} {t('kutoka', 'from')} {newest.customer_name}
            </span>
          </span>
        </Link>
      )}

      <div className="grid gap-3 md:grid-cols-[1fr_1.1fr] md:gap-4">
        {/* Today */}
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-[24px] bg-ink p-5 text-white">
            <Lattice size={40} stroke="#fff" opacity={0.07} />
            <div className="relative">
              <p className="text-[12px] font-semibold tracking-[0.12em] text-white/55 uppercase">{t('Mauzo leo', 'Sales today')}</p>
              <p className="mt-2 flex items-baseline gap-2">
                <span className="text-[18px] text-white/60">TSh</span>
                <span className="text-[44px] leading-none font-bold tracking-tight">{n(d.today.total)}</span>
              </p>
              <div className="mt-4 flex items-end justify-between">
                <p className="text-[14px] text-white/65">
                  {d.today.orders} {t('oda', d.today.orders === 1 ? 'order' : 'orders')} · {d.queue.toSend} {t('za kutuma', 'to send')}
                </p>
                <div className="flex h-9 items-end gap-1" aria-hidden>
                  {d.days.map((x, i) => (
                    <span
                      key={x.day}
                      className="w-1.5 rounded-full"
                      style={{ height: `${Math.max(14, (x.total / maxDay) * 100)}%`, background: i === d.days.length - 1 ? '#fff' : 'rgba(255,255,255,0.35)' }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <Queue label={t('Kuthibitisha', 'To confirm')} value={d.queue.toConfirm} />
            <Queue label={t('Kutuma', 'To send')} value={d.queue.toSend} />
            <Queue label={t('Njiani', 'On the way')} value={d.queue.onTheWay} />
          </div>
          <div className="card flex items-center gap-3 p-2.5 pl-4">
            <span className="min-w-0 flex-1 truncate text-[14px] font-medium">rizk.tz/{shop.slug}</span>
            <button
              type="button"
              className="btn btn-sm shrink-0"
              onClick={async () => {
                if ((await shareLink(url, shop.name)) === 'copied') {
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }
              }}
            >
              {copied ? <Copy size={16} /> : <Share2 size={16} />} {copied ? t('Imenakiliwa', 'Copied') : t('Shiriki', 'Share')}
            </button>
          </div>
        </div>

        {/* New orders */}
        <div>
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-[12px] font-semibold tracking-[0.12em] text-muted uppercase">{t('Oda mpya', 'New orders')}</p>
            <Link to="/app/orders" className="flex items-center gap-1 text-sm text-muted">
              {t('Zote', 'All')} <ArrowRight size={15} />
            </Link>
          </div>
          {d.recent.length === 0 ? (
            <div className="card p-6 text-sm text-muted">
              {t('Bado hakuna oda. Shiriki link yako kwenye Instagram na WhatsApp status.', 'No orders yet. Share your link on Instagram and your WhatsApp status.')}
            </div>
          ) : (
            <div className="space-y-2.5">
              {d.recent.map((o) => (
                <Link key={o.id} to="/app/orders/$id" params={{ id: o.id }} className="card flex items-center gap-3 p-3">
                  <Img k={o.image} alt="" className="h-14 w-14 shrink-0 rounded-[14px]" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2">
                      <b className="text-[16px]">#{o.code}</b>
                      <StatusPill status={o.status} />
                    </p>
                    <p className="mt-0.5 truncate text-sm text-muted">
                      {o.customer_name} · {o.items} {t('bidhaa', o.items === 1 ? 'item' : 'items')}
                    </p>
                  </div>
                  <p className="text-[16px] font-bold">{n(o.total)}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {setupLeft > 0 && (
        <div className="card mt-4">
          <div className="flex items-center justify-between border-b border-[#ebe9e6] px-5 py-4">
            <p className="text-[15px] font-bold">{t('Maliza kuweka duka', 'Finish setting up')}</p>
            <p className="text-sm text-muted">{4 - setupLeft}/4</p>
          </div>
          <div className="grid divide-y divide-[#ebe9e6] md:grid-cols-4 md:divide-x md:divide-y-0">
            {setupSteps.map((s) => (
              <Link key={s.label} to={s.to} className="flex items-center gap-3 px-5 py-3.5">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${s.done ? 'bg-ink text-white' : 'border-2 border-[#dedcd8]'}`}>
                  {s.done && <Check size={14} strokeWidth={3} />}
                </span>
                <span className={`flex-1 text-sm font-semibold ${s.done ? 'text-muted line-through' : ''}`}>{s.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <p className="mt-8 mb-3 px-1 text-[12px] font-semibold tracking-[0.12em] text-muted uppercase">{last7}</p>
      <div className="card grid grid-cols-2 md:grid-cols-4">
        <Kpi label={t('Mauzo', 'Sales')} value={tzs(d.sales.total)} delta={change(d.sales.total, d.prev.total)} cls="border-r border-b md:border-b-0" />
        <Kpi label={t('Oda', 'Orders')} value={String(d.counts.all)} delta={change(d.counts.all, d.prev.orders)} cls="border-b md:border-r md:border-b-0" />
        <Kpi label={t('Wageni', 'Visitors')} value={n(d.visits.shop)} delta={change(d.visits.shop, d.prev.visits)} cls="border-r" />
        <Kpi label={t('Wanaonunua', 'Conversion')} value={`${conversion}%`} delta={null} cls="" />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1.6fr_1fr]">
        <SalesChart days={d.days} total={d.sales.total} />
        <div className="card flex flex-col p-5">
          <p className="text-sm text-muted">{t('Hali ya oda', 'Order status')}</p>
          <p className="mt-1 text-[24px] font-bold">{d.counts.all}</p>
          <p className="text-sm text-muted">{last7}</p>
          <SplitBar
            parts={[
              { label: t('Zimelipwa', 'Paid'), value: d.counts.paid, color: INK },
              { label: t('Zinasubiri', 'Pending'), value: d.counts.pending, color: '#9a9894' },
              { label: t('Zimesitishwa', 'Cancelled'), value: d.counts.cancelled, color: '#dcdad6' },
            ]}
          />
          <div className="mt-auto grid grid-cols-3 gap-2 border-t border-[#ebe9e6] pt-4 text-center">
            <Mini label={t('Mionekano', 'Views')} value={d.visits.product} />
            <Mini label={t('Kushiriki', 'Shares')} value={d.visits.share} />
            <Mini label={t('Wazi', 'Open')} value={d.openOrders} />
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <p className="text-[15px] font-bold">{t('Bidhaa bora', 'Top products')}</p>
          <Link to="/app/products" className="flex items-center gap-1 text-sm text-muted">
            {t('Zote', 'All')} <ArrowRight size={15} />
          </Link>
        </div>
        {d.top.length === 0 ? (
          <p className="px-5 pb-6 text-sm text-muted">{t('Ongeza bidhaa zako za kwanza.', 'Add your first products.')}</p>
        ) : (
          <div className="grid divide-y divide-[#f1efec] md:grid-cols-2 md:divide-y-0">
            {d.top.map((p) => (
              <Link key={p.id} to="/app/products/$id" params={{ id: p.id }} className="flex items-center gap-3 border-[#f1efec] px-5 py-3.5 hover:bg-[#fafaf9] md:border-b">
                <Img k={p.image} alt={p.name} className="h-11 w-11 shrink-0 rounded-[12px]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold">{p.name}</p>
                  <p className="text-xs text-muted">
                    {n(p.views)} {t('mionekano', 'views')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[15px] font-bold">{p.sold}</p>
                  <p className="text-xs text-muted">{t('zimeuzwa', 'sold')}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Page>
  )
}

function Queue({ label, value }: { label: string; value: number }) {
  return (
    <Link to="/app/orders" className="card block p-3.5">
      <p className="text-[13px] text-muted">{label}</p>
      <p className="mt-1 text-[28px] leading-none font-bold">{value}</p>
    </Link>
  )
}

function Kpi({ label, value, delta, cls }: { label: string; value: string; delta: number | null; cls: string }) {
  return (
    <div className={`border-[#ebe9e6] p-4 md:p-5 ${cls}`}>
      <p className="text-[13px] text-muted md:text-sm">{label}</p>
      <p className="mt-1.5 truncate text-[20px] font-bold tracking-tight md:text-[26px]">{value}</p>
      {delta != null && (
        <span className={`mt-2.5 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${delta >= 0 ? 'bg-ink text-white' : 'bg-[#efeeeb] text-ink'}`}>
          {delta >= 0 ? '+' : ''}
          {delta}%
        </span>
      )}
    </div>
  )
}

function SalesChart({ days, total }: { days: { day: number; total: number }[]; total: number }) {
  const t = useT()
  const lang = useLang()
  const [sel, setSel] = useState(days.length - 1)
  const max = Math.max(...days.map((d) => d.total), 1)
  const SW_DAYS = ['Jpi', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Iju', 'Jms']
  const EN_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const fmtDay = (ms: number, long = false) =>
    long
      ? new Date(ms).toLocaleDateString(lang === 'sw' ? 'sw-TZ' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
      : (lang === 'sw' ? SW_DAYS : EN_DAYS)[new Date(ms).getUTCDay()]
  return (
    <div className="card p-5">
      <p className="text-sm text-muted">{t('Mauzo kwa siku', 'Daily sales')}</p>
      <p className="mt-1 text-[24px] font-bold">{tzs(total)}</p>
      <div className="relative mt-8 h-48">
        {[0, 1, 2].map((i) => (
          <div key={i} className="absolute inset-x-0 border-t border-dashed border-[#e9e7e3]" style={{ top: `${(i / 3) * 100}%` }} />
        ))}
        <div className="absolute inset-0 flex items-end gap-2 border-b border-[#e9e7e3] md:gap-3">
          {days.map((d, i) => (
            <button key={d.day} type="button" className="relative flex h-full flex-1 items-end" onClick={() => setSel(i)} aria-label={`${fmtDay(d.day, true)}: ${tzs(d.total)}`}>
              {sel === i && (
                <span className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-[#ebe9e6] bg-white px-2.5 py-1.5 text-center whitespace-nowrap shadow-sm">
                  <span className="block text-[11px] text-muted">{fmtDay(d.day, true)}</span>
                  <span className="block text-xs font-bold">{tzs(d.total)}</span>
                </span>
              )}
              {/* Bars end in a door arch, like the brand. */}
              <span className="w-full rounded-t-full transition-all" style={{ height: `${Math.max(4, (d.total / max) * 82)}%`, background: sel === i ? INK : '#e6e5e2' }} />
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2 flex gap-2 md:gap-3">
        {days.map((d, i) => (
          <span key={d.day} className={`flex-1 text-center text-xs ${sel === i ? 'font-bold text-ink' : 'text-muted'}`}>
            {fmtDay(d.day)}
          </span>
        ))}
      </div>
    </div>
  )
}

function SplitBar({ parts }: { parts: { label: string; value: number; color: string }[] }) {
  const sum = parts.reduce((s, p) => s + p.value, 0)
  return (
    <div className="my-5">
      <div className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-[#efeeeb]">
        {sum > 0 && parts.map((p) => p.value > 0 && <span key={p.label} style={{ width: `${(p.value / sum) * 100}%`, background: p.color }} />)}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {parts.map((p) => (
          <div key={p.label}>
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <span className="h-2 w-2 rounded-full" style={{ background: p.color }} /> {p.label}
            </p>
            <p className="mt-0.5 text-[17px] font-bold">{p.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[17px] font-bold">{n(value)}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  )
}
