import { createServerFn } from '@tanstack/react-start'
import { all, db, first, newId, now, orderCode, run } from '#/server/db'
import { normalizePhone, type OrderStatus } from '#/lib/format'
import { namesMatch, parsePaymentSms, type PaymentCheck } from '#/lib/payment-sms'

export type PublicShop = {
  id: string
  slug: string
  name: string
  bio: string
  category: string
  logo_key: string | null
  whatsapp: string
  instagram: string
  tiktok: string
  facebook: string
  location: string
  hours: string
  lipa_number: string
  lipa_name: string
  lipa_network: string
  cod_enabled: number
}
export type PublicProduct = {
  id: string
  name: string
  description: string
  price: number
  compare_price: number | null
  stock: number | null
  images: string[]
}

const SHOP_COLS = `id, slug, name, bio, category, logo_key, whatsapp, instagram, tiktok, facebook, location, hours,
  lipa_number, lipa_name, lipa_network, cod_enabled`

export const getStorefront = createServerFn({ method: 'GET' })
  .validator((d: { slug: string }) => ({ slug: String(d.slug).toLowerCase() }))
  .handler(async ({ data }) => {
    const shop = await first<PublicShop>(`SELECT ${SHOP_COLS} FROM shops WHERE slug = ? AND status = 'active'`, data.slug)
    if (!shop) return null
    const [products, areas] = await Promise.all([
      all<Omit<PublicProduct, 'images'> & { images: string }>(
        `SELECT id, name, description, price, compare_price, stock, images FROM products
         WHERE shop_id = ? AND active = 1 ORDER BY created_at DESC`,
        shop.id,
      ),
      all<{ id: string; name: string; fee: number }>(
        'SELECT id, name, fee FROM delivery_areas WHERE shop_id = ? ORDER BY sort',
        shop.id,
      ),
    ])
    return {
      shop,
      areas,
      products: products.map((p) => ({ ...p, images: JSON.parse(p.images) as string[] })),
    }
  })

const EVENT_TYPES = new Set(['view_shop', 'view_product', 'share', 'add_to_cart'])

export const trackEvent = createServerFn({ method: 'POST' })
  .validator((d: { shopId: string; productId?: string; type: string; source?: string }) => d)
  .handler(async ({ data }) => {
    if (!EVENT_TYPES.has(data.type)) return
    await run(
      'INSERT INTO events (shop_id, product_id, type, source, created_at) VALUES (?, ?, ?, ?, ?)',
      String(data.shopId).slice(0, 40),
      data.productId ? String(data.productId).slice(0, 40) : null,
      data.type,
      String(data.source ?? '').slice(0, 30),
      now(),
    )
    if (data.type === 'view_product' && data.productId) {
      await run('UPDATE products SET views = views + 1 WHERE id = ? AND shop_id = ?', data.productId, data.shopId)
    }
  })

export const placeOrder = createServerFn({ method: 'POST' })
  .validator(
    (d: {
      shopId: string
      items: { productId: string; qty: number }[]
      name: string
      phone: string
      areaId: string
      landmark: string
      note: string
      payment: 'lipa' | 'cod'
    }) => d,
  )
  .handler(async ({ data }) => {
    const shop = await first<{ id: string; cod_enabled: number; lipa_number: string }>(
      `SELECT id, cod_enabled, lipa_number FROM shops WHERE id = ? AND status = 'active'`,
      data.shopId,
    )
    if (!shop) return { error: 'shop' as const }
    const name = String(data.name ?? '').trim().slice(0, 60)
    const phone = normalizePhone(String(data.phone ?? ''))
    if (!name) return { error: 'name' as const }
    if (!phone) return { error: 'phone' as const }
    const payment = data.payment === 'cod' ? 'cod' : 'lipa'
    if (payment === 'cod' && !shop.cod_enabled) return { error: 'payment' as const }
    if (payment === 'lipa' && !shop.lipa_number) return { error: 'payment' as const }

    const wanted = (data.items ?? []).filter((i) => i.qty > 0).slice(0, 30)
    if (!wanted.length) return { error: 'empty' as const }
    const ids = wanted.map((i) => i.productId)
    const products = await all<{ id: string; name: string; price: number; stock: number | null; images: string }>(
      `SELECT id, name, price, stock, images FROM products WHERE shop_id = ? AND active = 1
       AND id IN (${ids.map(() => '?').join(',')})`,
      shop.id,
      ...ids,
    )
    const lines = []
    for (const item of wanted) {
      const p = products.find((x) => x.id === item.productId)
      if (!p) return { error: 'gone' as const }
      const qty = Math.min(99, Math.max(1, Math.round(item.qty)))
      if (p.stock != null && p.stock < qty) return { error: 'stock' as const, product: p.name }
      lines.push({ p, qty })
    }
    const area = data.areaId
      ? await first<{ name: string; fee: number }>(
          'SELECT name, fee FROM delivery_areas WHERE id = ? AND shop_id = ?',
          data.areaId,
          shop.id,
        )
      : null
    const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0)
    const fee = area?.fee ?? 0
    const id = newId()
    const code = orderCode()
    const t = now()
    await db().batch([
      db()
        .prepare(
          `INSERT INTO orders (id, shop_id, code, customer_name, customer_phone, area, landmark, note, subtotal,
             delivery_fee, total, payment_method, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          id, shop.id, code, name, phone, area?.name ?? '', String(data.landmark ?? '').slice(0, 200),
          String(data.note ?? '').slice(0, 500), subtotal, fee, subtotal + fee, payment,
          payment === 'cod' ? 'confirmed' : 'awaiting_payment', t, t,
        ),
      ...lines.map((l) =>
        db()
          .prepare('INSERT INTO order_items (order_id, product_id, name, price, qty, image) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(id, l.p.id, l.p.name, l.p.price, l.qty, (JSON.parse(l.p.images) as string[])[0] ?? null),
      ),
    ])
    if (payment === 'cod') {
      // Cash on delivery is confirmed at once, so stock is held now.
      await run(
        `UPDATE products SET stock = MAX(0, stock - (SELECT SUM(qty) FROM order_items WHERE order_id = ? AND product_id = products.id))
         WHERE stock IS NOT NULL AND id IN (SELECT product_id FROM order_items WHERE order_id = ?)`,
        id,
        id,
      )
    }
    return { ok: true as const, code }
  })

export type TrackedOrder = {
  code: string
  status: OrderStatus
  customer_name: string
  area: string
  landmark: string
  subtotal: number
  delivery_fee: number
  total: number
  payment_method: 'lipa' | 'cod'
  payment_check: string | null
  created_at: number
  shop: { slug: string; name: string; logo_key: string | null; whatsapp: string; lipa_number: string; lipa_name: string; lipa_network: string }
  lines: { name: string; price: number; qty: number; image: string | null }[]
}

export const getTrackedOrder = createServerFn({ method: 'GET' })
  .validator((d: { code: string }) => ({ code: String(d.code).toUpperCase().slice(0, 10) }))
  .handler(async ({ data }) => {
    const order = await first<Omit<TrackedOrder, 'shop' | 'lines'> & { id: string; shop_id: string }>(
      `SELECT id, shop_id, code, status, customer_name, area, landmark, subtotal, delivery_fee, total, payment_method,
         payment_check, created_at FROM orders WHERE code = ?`,
      data.code,
    )
    if (!order) return null
    const [shop, lines] = await Promise.all([
      first<TrackedOrder['shop']>(
        'SELECT slug, name, logo_key, whatsapp, lipa_number, lipa_name, lipa_network FROM shops WHERE id = ?',
        order.shop_id,
      ),
      all<TrackedOrder['lines'][number]>('SELECT name, price, qty, image FROM order_items WHERE order_id = ?', order.id),
    ])
    const { id: _id, shop_id: _s, ...rest } = order
    return { ...rest, shop: shop!, lines } as TrackedOrder
  })

/** The buyer pastes the confirmation SMS. We check what we can; the merchant decides. */
export const submitPaymentSms = createServerFn({ method: 'POST' })
  .validator((d: { code: string; sms: string }) => ({
    code: String(d.code).toUpperCase().slice(0, 10),
    sms: String(d.sms ?? '').slice(0, 1000),
  }))
  .handler(async ({ data }) => {
    const order = await first<{ id: string; total: number; status: OrderStatus; lipa_name: string }>(
      `SELECT o.id, o.total, o.status, s.lipa_name FROM orders o JOIN shops s ON s.id = o.shop_id WHERE o.code = ?`,
      data.code,
    )
    if (!order) return { error: 'order' as const }
    if (!['awaiting_payment', 'payment_claimed'].includes(order.status)) return { error: 'status' as const }
    if (data.sms.trim().length < 20) return { error: 'short' as const }
    const parsed = parsePaymentSms(data.sms)
    const reused = parsed.txnId
      ? await first('SELECT 1 FROM orders WHERE txn_id = ? AND id != ?', parsed.txnId, order.id)
      : null
    if (reused) return { error: 'reused' as const }
    const nameOk = namesMatch(parsed.name, order.lipa_name)
    const check: PaymentCheck = {
      parsed,
      amount: parsed.amount == null ? 'unknown' : parsed.amount >= order.total ? 'ok' : 'low',
      name: nameOk == null ? 'unknown' : nameOk ? 'ok' : 'mismatch',
      txn: parsed.txnId ? 'ok' : 'unknown',
    }
    try {
      await run(
        `UPDATE orders SET status = 'payment_claimed', payment_sms = ?, txn_id = ?, payment_check = ?,
           paid_claimed_at = ?, updated_at = ? WHERE id = ?`,
        data.sms, parsed.txnId, JSON.stringify(check), now(), now(), order.id,
      )
    } catch {
      return { error: 'reused' as const }
    }
    return { ok: true as const, check }
  })
