import { Link, createFileRoute, getRouteApi } from '@tanstack/react-router'
import { Clock, MapPin, MessageCircle, Minus, Plus, Share2, ShoppingBag } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Chips, Img, LangSwitch, Page, Sheet } from '#/components/ui'
import { trackEvent, type PublicProduct } from '#/lib/api/store'
import { trafficSource, useCart } from '#/lib/cart'
import { tzs, waLink } from '#/lib/format'
import { useT } from '#/lib/i18n'
import { shareLink, useOrigin } from '#/lib/share'

export const Route = createFileRoute('/$shop/')({ component: Storefront })
const parent = getRouteApi('/$shop')

function Storefront() {
  const t = useT()
  const { shop, products } = parent.useLoaderData()
  const cart = useCart(shop.id)
  const [open, setOpen] = useState<PublicProduct | null>(null)
  const [filter, setFilter] = useState<'all' | 'sale' | 'new'>('all')

  useEffect(() => {
    trackEvent({ data: { shopId: shop.id, type: 'view_shop', source: trafficSource() } })
  }, [shop.id])

  const shown = useMemo(
    () =>
      filter === 'sale'
        ? products.filter((p) => p.compare_price && p.compare_price > p.price)
        : filter === 'new'
          ? products.slice(0, 8)
          : products,
    [products, filter],
  )
  const total = Object.entries(cart.cart).reduce((s, [id, q]) => s + (products.find((p) => p.id === id)?.price ?? 0) * q, 0)
  const hasSale = products.some((p) => p.compare_price && p.compare_price > p.price)
  const url = `${useOrigin()}/${shop.slug}`

  return (
    <Page nav={cart.count > 0}>
      <header className="flex items-center gap-3 pt-2">
        <Img k={shop.logo_key} alt={shop.name} className="h-14 w-14 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1">
          <h1 className="line-clamp-2 text-[22px] leading-tight font-extrabold tracking-tight">{shop.name}</h1>
          {shop.bio && <p className="line-clamp-2 text-sm text-muted">{shop.bio}</p>}
        </div>
        <button
          type="button"
          className="icon-btn"
          aria-label={t('Shiriki duka', 'Share shop')}
          onClick={async () => {
            await shareLink(url, shop.name)
            trackEvent({ data: { shopId: shop.id, type: 'share', source: 'shop' } })
          }}
        >
          <Share2 size={19} />
        </button>
        <LangSwitch />
      </header>

      {(hasSale || products.length > 8) && (
        <div className="mt-5">
          <Chips
            value={filter}
            onChange={setFilter}
            options={[
              { id: 'all', label: t('Zote', 'All') },
              ...(products.length > 8 ? [{ id: 'new' as const, label: t('Mpya', 'New') }] : []),
              ...(hasSale ? [{ id: 'sale' as const, label: t('Punguzo', 'On sale') }] : []),
            ]}
          />
        </div>
      )}

      {products.length === 0 ? (
        <div className="card mt-6 p-8 text-center text-muted">{t('Duka linaandaliwa. Rudi baadaye!', 'This shop is getting ready. Check back soon!')}</div>
      ) : (
        <div className={`grid grid-cols-2 gap-3 ${hasSale || products.length > 8 ? '' : 'mt-6'}`}>
          {shown.map((p) => (
            <button
              key={p.id}
              type="button"
              className="card overflow-hidden text-left"
              onClick={() => {
                setOpen(p)
                trackEvent({ data: { shopId: shop.id, productId: p.id, type: 'view_product', source: trafficSource() } })
              }}
            >
              <div className="relative">
                <Img k={p.images[0]} alt={p.name} className="aspect-[4/4.4] w-full" />
                {p.stock === 0 && <span className="absolute top-3 left-3 rounded-full bg-card/95 px-3 py-1 text-xs font-bold">{t('Imeisha', 'Sold out')}</span>}
                {p.stock !== 0 && p.compare_price && p.compare_price > p.price && (
                  <span className="absolute top-3 left-3 rounded-full bg-ink px-3 py-1 text-xs font-bold text-white">
                    -{Math.round((1 - p.price / p.compare_price) * 100)}%
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="line-clamp-2 text-[15px] leading-snug font-bold">{p.name}</p>
                <p className="mt-1 text-[15px] font-extrabold">{tzs(p.price)}</p>
                {p.compare_price && p.compare_price > p.price && (
                  <p className="text-xs font-semibold text-muted line-through">{tzs(p.compare_price)}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <footer className="card mt-8 space-y-3 p-5 text-[15px]">
        {shop.location && (
          <p className="flex items-start gap-3">
            <MapPin size={18} className="mt-0.5 shrink-0" /> {shop.location}
          </p>
        )}
        {shop.hours && (
          <p className="flex items-start gap-3">
            <Clock size={18} className="mt-0.5 shrink-0" /> {shop.hours}
          </p>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          {shop.whatsapp && (
            <a className="chip" href={waLink(shop.whatsapp, t(`Habari ${shop.name}, nimeona duka lenu RIZK.`, `Hi ${shop.name}, I found your shop on RIZK.`))} target="_blank" rel="noreferrer">
              <MessageCircle size={16} /> WhatsApp
            </a>
          )}
          {shop.instagram && (
            <a className="chip" href={`https://instagram.com/${shop.instagram}`} target="_blank" rel="noreferrer">
              Instagram
            </a>
          )}
          {shop.tiktok && (
            <a className="chip" href={`https://tiktok.com/@${shop.tiktok}`} target="_blank" rel="noreferrer">
              TikTok
            </a>
          )}
          {shop.facebook && (
            <a className="chip" href={shop.facebook.startsWith('http') ? shop.facebook : `https://${shop.facebook}`} target="_blank" rel="noreferrer">
              Facebook
            </a>
          )}
        </div>
      </footer>
      <a href="/" className="mt-6 block text-center text-xs font-semibold text-muted">
        {t('Fungua duka lako na RIZK', 'Open your own shop with RIZK')}
      </a>

      <ProductSheet
        product={open}
        onClose={() => setOpen(null)}
        inCart={open ? (cart.cart[open.id] ?? 0) : 0}
        onAdd={(qty) => {
          if (!open) return
          cart.add(open.id, qty)
          trackEvent({ data: { shopId: shop.id, productId: open.id, type: 'add_to_cart', source: trafficSource() } })
          setOpen(null)
        }}
        whatsapp={shop.whatsapp}
        shopName={shop.name}
      />

      {cart.count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[520px] px-3 pb-[max(10px,env(safe-area-inset-bottom))]">
          <Link
            to="/$shop/checkout"
            params={{ shop: shop.slug }}
            className="flex h-16 items-center gap-3 rounded-full bg-ink pr-2 pl-6 text-white shadow-[0_12px_30px_rgba(31,27,24,0.35)]"
          >
            <ShoppingBag size={20} />
            <span className="flex-1 font-bold">
              {cart.count} {t('bidhaa', cart.count === 1 ? 'item' : 'items')} · {tzs(total)}
            </span>
            <span className="rounded-full bg-card px-5 py-3 text-sm font-extrabold text-ink">{t('Agiza', 'Checkout')}</span>
          </Link>
        </div>
      )}
    </Page>
  )
}

function ProductSheet({
  product,
  onClose,
  onAdd,
  inCart,
  whatsapp,
  shopName,
}: {
  product: PublicProduct | null
  onClose: () => void
  onAdd: (qty: number) => void
  inCart: number
  whatsapp: string
  shopName: string
}) {
  const t = useT()
  const [qty, setQty] = useState(1)
  useEffect(() => setQty(1), [product?.id])
  if (!product) return null
  const max = product.stock == null ? 99 : Math.max(0, product.stock - inCart)
  const soldOut = product.stock === 0
  return (
    <Sheet open={!!product} onClose={onClose}>
      <div className="hide-scroll -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4">
        {(product.images.length ? product.images : [null]).map((k, i) => (
          <Img key={k ?? i} k={k} alt={product.name} className="aspect-square w-[88%] shrink-0 snap-center rounded-[26px]" />
        ))}
      </div>
      <h2 className="mt-5 text-[24px] leading-tight font-extrabold tracking-tight">{product.name}</h2>
      <p className="mt-1 text-[20px] font-extrabold">
        {tzs(product.price)}{' '}
        {product.compare_price && product.compare_price > product.price && (
          <span className="text-sm font-semibold text-muted line-through">{tzs(product.compare_price)}</span>
        )}
      </p>
      {product.description && <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-line text-ink/80">{product.description}</p>}
      <p className="mt-3 text-sm font-semibold text-muted">
        {soldOut
          ? t('Haipo kwa sasa', 'Out of stock')
          : product.stock != null && product.stock <= 5
            ? t(`Zimebaki ${product.stock} tu`, `Only ${product.stock} left`)
            : t('Ipo', 'In stock')}
      </p>

      {!soldOut && (
        <div className="mt-5 flex items-center gap-3">
          <div className="flex h-[54px] items-center rounded-full bg-card shadow-[0_4px_14px_rgba(60,40,20,0.08)]">
            <button type="button" className="flex h-full w-12 items-center justify-center" aria-label="-" onClick={() => setQty(Math.max(1, qty - 1))}>
              <Minus size={18} />
            </button>
            <span className="w-6 text-center font-extrabold">{qty}</span>
            <button type="button" className="flex h-full w-12 items-center justify-center" aria-label="+" onClick={() => setQty(Math.min(max, qty + 1))}>
              <Plus size={18} />
            </button>
          </div>
          <button type="button" className="btn flex-1" disabled={max < 1} onClick={() => onAdd(Math.min(qty, max))}>
            {max < 1 ? t('Zote ziko kwenye kikapu', 'All in your cart') : t('Weka kwenye kikapu', 'Add to cart')}
          </button>
        </div>
      )}
      {whatsapp && (
        <a
          href={waLink(whatsapp, t(`Habari ${shopName}, naulizia: ${product.name} (${tzs(product.price)})`, `Hi ${shopName}, I'm asking about: ${product.name} (${tzs(product.price)})`))}
          target="_blank"
          rel="noreferrer"
          className="btn btn-soft mt-3 w-full"
        >
          <MessageCircle size={18} /> {t('Uliza kwenye WhatsApp', 'Ask on WhatsApp')}
        </a>
      )}
    </Sheet>
  )
}
