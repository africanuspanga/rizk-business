import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, Check, Copy, ExternalLink, Share2 } from 'lucide-react'
import { useState } from 'react'
import { Img, LangSwitch, Page, StatusPill } from '#/components/ui'
import { getDashboard } from '#/lib/api/merchant'
import { timeAgo, tzs } from '#/lib/format'
import { useLang, useT } from '#/lib/i18n'
import { shareLink, useOrigin } from '#/lib/share'

export const Route = createFileRoute('/app/')({
  loader: () => getDashboard(),
  component: Dashboard,
})

const GREEN = '#4fa76d'

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

  const setupSteps = [
    { done: d.setup.products, label: t('Ongeza bidhaa ya kwanza', 'Add your first product'), to: '/app/products/new' },
    { done: d.setup.payment, label: t('Weka Lipa Namba', 'Add your Lipa Namba'), to: '/app/shop' },
    { done: d.setup.delivery, label: t('Weka maeneo ya delivery', 'Set delivery areas'), to: '/app/shop' },
    { done: d.setup.logo, label: t('Weka logo ya duka', 'Add a shop logo'), to: '/app/shop' },
  ]
  const setupLeft = setupSteps.filter((s) => !s.done).length
  const last7 = t('Siku 7 zilizopita', 'Last 7 days')

  return (
    <Page nav wide>
      <header className="flex items-center gap-3 pb-5">
        <div className="min-w-0 flex-1">
          <h1 className="text-[28px] leading-tight font-extrabold tracking-tight md:text-[32px]">{t('Dashibodi', 'Dashboard')}</h1>
          <p className="truncate text-sm text-muted">{t(`Karibu, ${user.name.split(' ')[0]}`, `Welcome, ${user.name.split(' ')[0]}`)}</p>
        </div>
        <a href={`/${shop.slug}`} target="_blank" rel="noreferrer" className="icon-btn" aria-label={t('Fungua duka', 'Open shop')}>
          <ExternalLink size={18} />
        </a>
        <LangSwitch />
      </header>

      {/* Shop link */}
      <div className="card flex items-center gap-3 p-3 pl-4">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: GREEN }} />
        <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{url.replace(/^https?:\/\//, '')}</span>
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

      {setupLeft > 0 && (
        <div className="card mt-4">
          <div className="flex items-center justify-between border-b border-[#ebe9e6] px-5 py-4">
            <p className="text-[15px] font-bold">{t('Maliza kuweka duka', 'Finish setting up')}</p>
            <p className="text-sm text-muted">
              {4 - setupLeft}/4
            </p>
          </div>
          <div className="grid divide-y divide-[#ebe9e6] md:grid-cols-4 md:divide-x md:divide-y-0">
            {setupSteps.map((s) => (
              <Link key={s.label} to={s.to} className="flex items-center gap-3 px-5 py-3.5">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${s.done ? 'text-white' : 'border-2 border-[#dedcd8]'}`} style={s.done ? { background: GREEN } : undefined}>
                  {s.done && <Check size={14} strokeWidth={3} />}
                </span>
                <span className={`flex-1 text-sm font-semibold ${s.done ? 'text-muted line-through' : ''}`}>{s.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="card mt-4 grid grid-cols-2 md:grid-cols-4">
        <Kpi label={t('Mauzo', 'Sales')} value={tzs(d.sales.total)} delta={change(d.sales.total, d.prev.total)} period={last7} cls="border-r border-b md:border-b-0" />
        <Kpi label={t('Oda', 'Orders')} value={String(d.counts.all)} delta={change(d.counts.all, d.prev.orders)} period={last7} cls="border-b md:border-r md:border-b-0" />
        <Kpi label={t('Wageni', 'Visitors')} value={String(d.visits.shop)} delta={change(d.visits.shop, d.prev.visits)} period={last7} cls="border-r" />
        <Kpi label={t('Wanaonunua', 'Conversion')} value={`${conversion}%`} delta={null} period={t('Oda ÷ wageni', 'Orders ÷ visitors')} cls="" />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1.6fr_1fr]">
        <SalesChart days={d.days} total={d.sales.total} />
        <div className="card flex flex-col p-5">
          <p className="text-sm text-muted">{t('Hali ya oda', 'Order status')}</p>
          <p className="mt-1 text-[24px] font-extrabold">{d.counts.all}</p>
          <p className="text-sm text-muted">{last7}</p>
          <SplitBar
            parts={[
              { label: t('Zimelipwa', 'Paid'), value: d.counts.paid, color: GREEN },
              { label: t('Zinasubiri', 'Pending'), value: d.counts.pending, color: '#e6b04b' },
              { label: t('Zimesitishwa', 'Cancelled'), value: d.counts.cancelled, color: '#d0533b' },
            ]}
          />
          <div className="mt-auto grid grid-cols-3 gap-2 border-t border-[#ebe9e6] pt-4 text-center">
            <Mini label={t('Mionekano', 'Views')} value={d.visits.product} />
            <Mini label={t('Kushiriki', 'Shares')} value={d.visits.share} />
            <Mini label={t('Wazi', 'Open')} value={d.openOrders} />
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="card">
          <PanelHead title={t('Oda za karibuni', 'Recent orders')} to="/app/orders" more={t('Zote', 'All')} />
          {d.recent.length === 0 ? (
            <p className="px-5 pb-6 text-sm text-muted">
              {t('Bado hakuna oda. Shiriki link yako kwenye Instagram na WhatsApp status.', 'No orders yet. Share your link on Instagram and your WhatsApp status.')}
            </p>
          ) : (
            <div className="divide-y divide-[#f1efec]">
              {d.recent.map((o) => (
                <Link key={o.id} to="/app/orders/$id" params={{ id: o.id }} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#fafaf9]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f1f0ee] text-sm font-bold">
                    {o.customer_name.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold">{o.customer_name}</p>
                    <p className="text-xs text-muted">
                      #{o.code} · {timeAgo(o.created_at, lang)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] font-bold">{tzs(o.total)}</p>
                    <StatusPill status={o.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <PanelHead title={t('Bidhaa bora', 'Top products')} to="/app/products" more={t('Zote', 'All')} />
          {d.top.length === 0 ? (
            <p className="px-5 pb-6 text-sm text-muted">{t('Ongeza bidhaa zako za kwanza.', 'Add your first products.')}</p>
          ) : (
            <div className="divide-y divide-[#f1efec]">
              {d.top.map((p) => (
                <Link key={p.id} to="/app/products/$id" params={{ id: p.id }} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#fafaf9]">
                  <Img k={p.image} alt={p.name} className="h-10 w-10 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold">{p.name}</p>
                    <p className="text-xs text-muted">
                      {p.views} {t('mionekano', 'views')}
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
      </div>
    </Page>
  )
}

function Kpi({ label, value, delta, period, cls }: { label: string; value: string; delta: number | null; period: string; cls: string }) {
  return (
    <div className={`border-[#ebe9e6] p-4 md:p-5 ${cls}`}>
      <p className="text-[13px] text-muted md:text-sm">{label}</p>
      <p className="mt-1.5 truncate text-[20px] font-extrabold tracking-tight md:text-[26px]">{value}</p>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        {delta != null && (
          <span
            className="rounded-full px-2 py-0.5 text-xs font-bold"
            style={delta >= 0 ? { background: '#e7f4ea', color: '#3d8a56' } : { background: '#fbe6e2', color: '#c2412d' }}
          >
            {delta >= 0 ? '+' : ''}
            {delta}%
          </span>
        )}
        <span className="text-xs text-muted">{period}</span>
      </div>
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
      <p className="mt-1 text-[24px] font-extrabold">{tzs(total)}</p>
      <div className="relative mt-6 h-48">
        {[0, 1, 2].map((i) => (
          <div key={i} className="absolute inset-x-0 border-t border-dashed border-[#e9e7e3]" style={{ top: `${(i / 3) * 100}%` }} />
        ))}
        <div className="absolute inset-0 flex items-end gap-2 border-b border-[#e9e7e3] md:gap-3">
          {days.map((d, i) => (
            <button
              key={d.day}
              type="button"
              className="relative flex h-full flex-1 items-end"
              onClick={() => setSel(i)}
              aria-label={`${fmtDay(d.day, true)}: ${tzs(d.total)}`}
            >
              {sel === i && (
                <span className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-[#ebe9e6] bg-white px-2.5 py-1.5 text-center whitespace-nowrap shadow-sm">
                  <span className="block text-[11px] text-muted">{fmtDay(d.day, true)}</span>
                  <span className="block text-xs font-extrabold">{tzs(d.total)}</span>
                </span>
              )}
              <span
                className="w-full rounded-t-md transition-all"
                style={{ height: `${Math.max(3, (d.total / max) * 82)}%`, background: sel === i ? GREEN : '#efeeeb' }}
              />
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
            <p className="mt-0.5 text-[17px] font-extrabold">{p.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[17px] font-extrabold">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  )
}

function PanelHead({ title, to, more }: { title: string; to: string; more: string }) {
  return (
    <div className="flex items-center justify-between px-5 pt-4 pb-2">
      <p className="text-[15px] font-bold">{title}</p>
      <Link to={to} className="flex items-center gap-1 text-sm text-muted">
        {more} <ArrowRight size={15} />
      </Link>
    </div>
  )
}
