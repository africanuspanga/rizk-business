import { createFileRoute, notFound, useRouter } from '@tanstack/react-router'
import { Check, Copy, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { ErrorText, Img, LangSwitch, Page, StatusPill } from '#/components/ui'
import { getTrackedOrder, submitPaymentSms } from '#/lib/api/store'
import { tzs, waLink, type OrderStatus } from '#/lib/format'
import { useT } from '#/lib/i18n'
import { useOrigin } from '#/lib/share'

export const Route = createFileRoute('/o/$code')({
  loader: async ({ params }) => {
    const order = await getTrackedOrder({ data: { code: params.code } })
    if (!order) throw notFound()
    return order
  },
  head: () => ({ meta: [{ title: 'Oda yako · RIZK' }, { name: 'robots', content: 'noindex' }] }),
  component: Track,
})

const STEPS: OrderStatus[] = ['awaiting_payment', 'confirmed', 'dispatched', 'delivered']

function Track() {
  const t = useT()
  const router = useRouter()
  const o = Route.useLoaderData()
  const [sms, setSms] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState('')

  const origin = useOrigin()
  const stepIndex = o.status === 'payment_claimed' ? 0 : STEPS.indexOf(o.status)
  const needsPayment = o.payment_method === 'lipa' && o.status === 'awaiting_payment'
  const orderText = [
    t(`Habari ${o.shop.name}, nimeweka oda #${o.code}`, `Hi ${o.shop.name}, I placed order #${o.code}`),
    ...o.lines.map((l) => `• ${l.qty} × ${l.name}`),
    `${t('Jumla', 'Total')}: ${tzs(o.total)}`,
    `${origin}/o/${o.code}`,
  ].join('\n')

  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(''), 1500)
    } catch {
      window.prompt('', text)
    }
  }

  const labels: Record<OrderStatus, string> = {
    awaiting_payment: o.payment_method === 'cod' ? t('Oda imepokelewa', 'Order received') : t('Lipa', 'Pay'),
    payment_claimed: t('Lipa', 'Pay'),
    confirmed: t('Imethibitishwa', 'Confirmed'),
    dispatched: t('Njiani', 'On the way'),
    delivered: t('Imefika', 'Delivered'),
    cancelled: t('Imesitishwa', 'Cancelled'),
  }

  return (
    <Page>
      <header className="flex items-center gap-3 pt-2">
        <Img k={o.shop.logo_key} alt={o.shop.name} className="h-12 w-12 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold">{o.shop.name}</p>
          <p className="text-xs text-muted">{t('Oda', 'Order')} #{o.code}</p>
        </div>
        <LangSwitch />
      </header>

      <section className="card mt-5 p-6">
        <StatusPill status={o.status} />
        <h1 className="mt-3 text-[26px] leading-tight font-extrabold tracking-tight">
          {o.status === 'cancelled'
            ? t('Oda imesitishwa', 'Order cancelled')
            : needsPayment
              ? t('Karibu kumaliza! Lipa sasa.', 'Almost done! Pay now.')
              : o.status === 'payment_claimed'
                ? t('Inasubiri muuzaji athibitishe', 'Waiting for the seller to confirm')
                : o.status === 'delivered'
                  ? t('Imefika. Asante!', 'Delivered. Thank you!')
                  : t(`Asante ${o.customer_name.split(' ')[0]}!`, `Thank you ${o.customer_name.split(' ')[0]}!`)}
        </h1>
        {o.status !== 'cancelled' && (
          <div className="mt-5 flex items-center">
            {STEPS.map((s, i) => (
              <div key={s} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full ${i <= stepIndex ? 'bg-ink text-white' : 'bg-line text-muted'}`}>
                    {i < stepIndex || (i === stepIndex && o.status === 'delivered') ? <Check size={16} strokeWidth={3} /> : <span className="text-xs font-bold">{i + 1}</span>}
                  </span>
                  <span className="w-16 text-center text-[11px] leading-tight font-semibold text-muted">{labels[s]}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`mx-1 mb-5 h-1 flex-1 rounded-full ${i < stepIndex ? 'bg-ink' : 'bg-line'}`} />}
              </div>
            ))}
          </div>
        )}
      </section>

      {needsPayment && (
        <section className="card mt-4 p-5">
          <h2 className="text-[18px] font-extrabold">{t('1. Lipa kwa simu', '1. Pay by phone')}</h2>
          <div className="mt-3 space-y-2">
            <CopyRow label={t('Kiasi', 'Amount')} value={tzs(o.total)} onCopy={() => copy('amount', String(o.total))} copied={copied === 'amount'} />
            <CopyRow label={`Lipa Namba${o.shop.lipa_network ? ` · ${o.shop.lipa_network}` : ''}`} value={o.shop.lipa_number} onCopy={() => copy('lipa', o.shop.lipa_number)} copied={copied === 'lipa'} />
            {o.shop.lipa_name && <CopyRow label={t('Jina', 'Name')} value={o.shop.lipa_name} />}
          </div>
          <h2 className="mt-6 text-[18px] font-extrabold">{t('2. Bandika SMS ya malipo', '2. Paste the payment SMS')}</h2>
          <p className="mt-1 text-sm text-muted">
            {t('Nakili ujumbe wote wa uthibitisho uliopokea baada ya kulipa, kisha ubandike hapa.', 'Copy the whole confirmation message you got after paying and paste it here.')}
          </p>
          <textarea className="input mt-3 font-mono text-[13px]" rows={5} value={sms} onChange={(e) => setSms(e.target.value)} placeholder={t('Mf. ABC12XYZ9 Imethibitishwa. Umelipa Tsh...', 'e.g. ABC12XYZ9 Confirmed. You paid Tsh...')} />
          <div className="mt-3">
            <ErrorText>{error}</ErrorText>
          </div>
          <button
            type="button"
            className="btn mt-3 w-full"
            disabled={busy || sms.trim().length < 20}
            onClick={async () => {
              setBusy(true)
              setError('')
              const res = await submitPaymentSms({ data: { code: o.code, sms } })
              setBusy(false)
              if ('error' in res) {
                return setError(
                  res.error === 'reused'
                    ? t('Muamala huu umeshatumika kwenye oda nyingine.', 'This transaction was already used for another order.')
                    : res.error === 'short'
                      ? t('Bandika ujumbe wote wa SMS.', 'Paste the whole SMS.')
                      : t('Imeshindikana. Jaribu tena.', 'Something went wrong. Try again.'),
                )
              }
              router.invalidate()
            }}
          >
            {busy ? t('Inatuma...', 'Sending...') : t('Nimelipa, tuma uthibitisho', 'I have paid, send proof')}
          </button>
        </section>
      )}

      {o.status === 'payment_claimed' && (
        <section className="card mt-4 p-5 text-[15px]">
          {t(
            'Tumepokea uthibitisho wako. Muuzaji ataangalia malipo na kuthibitisha oda. Unaweza kumtumia ujumbe hapa chini.',
            'We got your proof. The seller will check the payment and confirm your order. You can message them below.',
          )}
        </section>
      )}

      <section className="card mt-4 divide-y divide-line">
        {o.lines.map((l, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Img k={l.image} alt={l.name} className="h-14 w-14 shrink-0 rounded-2xl" />
            <p className="min-w-0 flex-1 truncate text-[15px] font-semibold">
              {l.qty} × {l.name}
            </p>
            <p className="text-[15px] font-bold">{tzs(l.qty * l.price)}</p>
          </div>
        ))}
        <div className="flex justify-between px-4 py-3 text-muted">
          <span>Delivery{o.area ? ` · ${o.area}` : ''}</span>
          <span className="text-ink">{tzs(o.delivery_fee)}</span>
        </div>
        <div className="flex justify-between px-4 py-4 text-[18px] font-extrabold">
          <span>{t('Jumla', 'Total')}</span>
          <span>{tzs(o.total)}</span>
        </div>
      </section>

      {o.shop.whatsapp && (
        <a href={waLink(o.shop.whatsapp, orderText)} target="_blank" rel="noreferrer" className="btn mt-5 w-full bg-[#1f8f4e]">
          <MessageCircle size={18} /> {t('Tuma oda kwa WhatsApp', 'Send order on WhatsApp')}
        </a>
      )}
      <p className="mt-4 text-center text-xs text-muted">
        {t('Hifadhi ukurasa huu kufuatilia oda yako.', 'Bookmark this page to follow your order.')}
      </p>
    </Page>
  )
}

function CopyRow({ label, value, onCopy, copied }: { label: string; value: string; onCopy?: () => void; copied?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-[18px] bg-canvas px-4 py-3">
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-[18px] font-extrabold tracking-wide">{value}</p>
      </div>
      {onCopy && (
        <button type="button" className="icon-btn" onClick={onCopy} aria-label="Copy">
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      )}
    </div>
  )
}
