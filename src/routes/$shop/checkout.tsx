import { Link, createFileRoute, getRouteApi, useNavigate } from '@tanstack/react-router'
import { Banknote, Minus, Plus, Smartphone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ErrorText, Field, Img, Page, TopBar } from '#/components/ui'
import { placeOrder } from '#/lib/api/store'
import { useCart } from '#/lib/cart'
import { tzs } from '#/lib/format'
import { useT } from '#/lib/i18n'

export const Route = createFileRoute('/$shop/checkout')({ component: Checkout })
const parent = getRouteApi('/$shop')
const BUYER_KEY = 'rizk_buyer'

function Checkout() {
  const t = useT()
  const navigate = useNavigate()
  const { shop, products, areas } = parent.useLoaderData()
  const cart = useCart(shop.id)
  const lines = Object.entries(cart.cart)
    .map(([id, qty]) => ({ p: products.find((p) => p.id === id), qty }))
    .filter((l): l is { p: (typeof products)[number]; qty: number } => !!l.p)
  const canLipa = !!shop.lipa_number
  const canCod = !!shop.cod_enabled
  const [form, setForm] = useState({ name: '', phone: '', areaId: '', landmark: '', note: '' })
  const [payment, setPayment] = useState<'lipa' | 'cod'>(canLipa ? 'lipa' : 'cod')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(BUYER_KEY) ?? '{}')
      setForm((f) => ({ ...f, name: saved.name ?? '', phone: saved.phone ?? '', landmark: saved.landmark ?? '' }))
    } catch {
      /* first visit */
    }
  }, [])

  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0)
  const fee = areas.find((a) => a.id === form.areaId)?.fee ?? 0

  if (lines.length === 0) {
    return (
      <Page>
        <TopBar back={`/${shop.slug}`} title={t('Kikapu', 'Cart')} />
        <div className="card p-8 text-center">
          <p className="text-muted">{t('Kikapu chako ni kitupu.', 'Your cart is empty.')}</p>
          <Link to="/$shop" params={{ shop: shop.slug }} className="btn mt-5">
            {t('Rudi dukani', 'Back to shop')}
          </Link>
        </div>
      </Page>
    )
  }

  const errors: Record<string, string> = {
    name: t('Andika jina lako.', 'Enter your name.'),
    phone: t('Namba ya simu si sahihi.', 'That phone number looks wrong.'),
    stock: t('Bidhaa moja imeisha au haitoshi. Punguza idadi.', 'An item is out of stock or short. Reduce the quantity.'),
    gone: t('Bidhaa moja haipo tena. Ondoa kwenye kikapu.', 'An item is no longer available. Remove it.'),
    payment: t('Njia hii ya malipo haipatikani.', 'That payment method is not available.'),
    empty: t('Kikapu ni kitupu.', 'Your cart is empty.'),
    shop: t('Duka halipatikani.', 'Shop not available.'),
  }

  return (
    <Page>
      <TopBar back={`/${shop.slug}`} title={t('Agiza', 'Checkout')} sub={shop.name} />

      <section className="card divide-y divide-line">
        {lines.map(({ p, qty }) => (
          <div key={p.id} className="flex items-center gap-3 px-4 py-3">
            <Img k={p.images[0]} alt={p.name} className="h-16 w-16 shrink-0 rounded-2xl" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold">{p.name}</p>
              <p className="text-sm text-muted">{tzs(p.price)}</p>
            </div>
            <div className="flex items-center rounded-full bg-canvas">
              <button type="button" className="flex h-9 w-9 items-center justify-center" aria-label="-" onClick={() => cart.set(p.id, qty - 1)}>
                <Minus size={15} />
              </button>
              <span className="w-5 text-center text-sm font-extrabold">{qty}</span>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center"
                aria-label="+"
                onClick={() => cart.set(p.id, p.stock == null ? qty + 1 : Math.min(p.stock, qty + 1))}
              >
                <Plus size={15} />
              </button>
            </div>
          </div>
        ))}
      </section>

      <form
        className="mt-5 space-y-5"
        onSubmit={async (e) => {
          e.preventDefault()
          if (areas.length && !form.areaId) return setError(t('Chagua eneo la delivery.', 'Choose a delivery area.'))
          setBusy(true)
          setError('')
          const res = await placeOrder({
            data: { shopId: shop.id, items: lines.map((l) => ({ productId: l.p.id, qty: l.qty })), ...form, payment },
          })
          setBusy(false)
          if ('error' in res) return setError(errors[res.error ?? 'shop'] ?? errors.shop)
          try {
            localStorage.setItem(BUYER_KEY, JSON.stringify({ name: form.name, phone: form.phone, landmark: form.landmark }))
          } catch {
            /* ignore */
          }
          // Open the order page first: clearing the cart before would flash "cart is empty".
          await navigate({ to: '/o/$code', params: { code: res.code } })
          cart.clear()
        }}
      >
        <div className="card space-y-4 p-5">
          <Field label={t('Jina lako', 'Your name')}>
            <input className="input" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label={t('Namba ya simu', 'Phone number')}>
            <input className="input" type="tel" inputMode="tel" autoComplete="tel" placeholder="0754 123 456" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
        </div>

        {areas.length > 0 && (
          <div>
            <p className="mb-3 ml-1 text-[15px] font-bold">{t('Eneo la delivery', 'Delivery area')}</p>
            <div className="flex flex-wrap gap-2">
              {areas.map((a) => (
                <button key={a.id} type="button" className="chip" data-active={form.areaId === a.id} onClick={() => setForm({ ...form, areaId: a.id })}>
                  {a.name} · {a.fee ? tzs(a.fee) : t('Bure', 'Free')}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="card space-y-4 p-5">
          <Field label={t('Alama ya karibu', 'Nearby landmark')} hint={t('Mf. karibu na Shell, nyumba ya geti jeusi', 'e.g. near the Shell station, house with a black gate')}>
            <input className="input" value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} />
          </Field>
          <Field label={t('Ujumbe kwa muuzaji', 'Note to the seller')}>
            <input className="input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder={t('Saizi, rangi... (hiari)', 'Size, colour... (optional)')} />
          </Field>
        </div>

        <div>
          <p className="mb-3 ml-1 text-[15px] font-bold">{t('Utalipaje?', 'How will you pay?')}</p>
          <div className="grid grid-cols-2 gap-3">
            {canLipa && (
              <PayOption active={payment === 'lipa'} onClick={() => setPayment('lipa')} icon={<Smartphone size={22} />} title="Lipa Namba" sub={shop.lipa_network || t('Simu', 'Mobile money')} />
            )}
            {canCod && (
              <PayOption active={payment === 'cod'} onClick={() => setPayment('cod')} icon={<Banknote size={22} />} title={t('Cash', 'Cash')} sub={t('Ukipokea mzigo', 'On delivery')} />
            )}
          </div>
        </div>

        <div className="card space-y-1.5 p-5 text-[15px]">
          <div className="flex justify-between text-muted">
            <span>{t('Bidhaa', 'Items')}</span>
            <span className="text-ink">{tzs(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Delivery</span>
            <span className="text-ink">{form.areaId ? tzs(fee) : '—'}</span>
          </div>
          <div className="flex justify-between pt-1 text-[18px] font-extrabold">
            <span>{t('Jumla', 'Total')}</span>
            <span>{tzs(subtotal + fee)}</span>
          </div>
        </div>

        <ErrorText>{error}</ErrorText>
        <button className="btn w-full" disabled={busy || (!canLipa && !canCod)}>
          {busy ? t('Inatuma...', 'Sending...') : t('Tuma oda', 'Place order')}
        </button>
        <p className="text-center text-xs text-muted">
          {t('Malipo yanaenda moja kwa moja kwa muuzaji. RIZK haishiki pesa yako.', 'Payment goes straight to the seller. RIZK never holds your money.')}
        </p>
      </form>
    </Page>
  )
}

function PayOption({ active, onClick, icon, title, sub }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; sub: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[24px] p-4 text-left transition ${active ? 'bg-ink text-white' : 'card'}`}
    >
      {icon}
      <p className="mt-4 text-[16px] font-extrabold">{title}</p>
      <p className={`text-xs ${active ? 'text-white/70' : 'text-muted'}`}>{sub}</p>
    </button>
  )
}
