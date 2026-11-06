/**
 * Demo shop with three months of activity, for screenshots and local testing.
 * Everything here is fictional: the shop, the buyers, the orders and the numbers.
 *
 *   node scripts/seed-demo.mjs          # local database and local photo storage only
 *
 * Demo login (local only): phone 0700 000 001, password demo1234
 */
import { execFileSync } from 'node:child_process'
import { pbkdf2Sync, randomBytes } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const OUT = join(process.cwd(), '.demo')
mkdirSync(OUT, { recursive: true })

const DAY = 86400_000
const NOW = Date.now()
const TZ = 3 * 3600_000
const startOfToday = Math.floor((NOW + TZ) / DAY) * DAY - TZ

// Seeded random so every run makes the same shop.
let seed = 20261106
const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296)
const pick = (a) => a[Math.floor(rand() * a.length)]
const between = (a, b) => a + Math.floor(rand() * (b - a + 1))
const id = (n = 16) => Array.from({ length: n }, () => '0123456789abcdefghijklmnopqrstuvwxyz'[Math.floor(rand() * 36)]).join('')
const code = () => Array.from({ length: 6 }, () => '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(rand() * 32)]).join('')
const q = (v) => (v == null ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`)

/* ---------- Owner and shop ---------- */

const userId = 'demo0000owner001'
const shopId = 'demo0000shop0001'
const salt = randomBytes(16)
const hash = pbkdf2Sync('demo1234', salt, 100_000, 32, 'sha256')
const passHash = `pbkdf2$100000$${salt.toString('base64')}$${hash.toString('base64')}`

/* ---------- Product photos: black and white kanga and jali patterns ---------- */

function patternSvg(kind, dark) {
  const bg = dark ? '#0e0e0e' : '#ecebe8'
  const fg = dark ? '#f2f2f2' : '#0e0e0e'
  const tiles = {
    lattice: `<rect x="11" y="11" width="18" height="18" fill="none" stroke="${fg}" stroke-width="1.4"/><rect x="11" y="11" width="18" height="18" fill="none" stroke="${fg}" stroke-width="1.4" transform="rotate(45 20 20)"/><circle cx="20" cy="20" r="3.5" fill="none" stroke="${fg}" stroke-width="1.4"/>`,
    diamond: `<path d="M20 6 L32 20 L20 34 L8 20 Z" fill="none" stroke="${fg}" stroke-width="1.4"/><circle cx="20" cy="20" r="2.6" fill="${fg}"/>`,
    stripe: `<path d="M0 10 H40 M0 30 H40" stroke="${fg}" stroke-width="3"/><circle cx="10" cy="20" r="2.4" fill="${fg}"/><circle cx="30" cy="20" r="2.4" fill="${fg}"/>`,
    dots: `<circle cx="10" cy="10" r="4" fill="${fg}"/><circle cx="30" cy="30" r="4" fill="${fg}"/><circle cx="30" cy="10" r="1.6" fill="${fg}"/><circle cx="10" cy="30" r="1.6" fill="${fg}"/>`,
    arch: `<path d="M8 36 V20 A12 12 0 0 1 32 20 V36" fill="none" stroke="${fg}" stroke-width="1.8"/><path d="M14 36 V22 A6 6 0 0 1 26 22 V36" fill="none" stroke="${fg}" stroke-width="1.2"/>`,
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">
    <defs><pattern id="p" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="scale(4)">${tiles[kind]}</pattern></defs>
    <rect width="800" height="800" fill="${bg}"/><rect width="800" height="800" fill="url(#p)" opacity="0.85"/>
  </svg>`
}

const PRODUCTS = [
  ['Gauni la kitenge', 'Kitenge dress, cotton, sizes S to XL.', 35000, 42000, 14, 'diamond', false],
  ['Kanga ya Pwani', 'Pair of kangas, 100% cotton, with a saying on each.', 15000, null, 40, 'lattice', true],
  ['Sandali za ngozi', 'Handmade leather sandals, sizes 37 to 44.', 28000, null, 9, 'stripe', true],
  ['Manukato Oud 50ml', 'Oud perfume, long lasting, 50ml bottle.', 45000, 55000, 6, 'arch', false],
  ['Kikoi cha ufukweni', 'Striped kikoi, beach or home.', 18000, null, 22, 'stripe', false],
  ['Shati la batiki', 'Batik shirt, short sleeves, men and women.', 32000, null, 11, 'dots', true],
  ['Mkoba wa ukili', 'Woven palm-leaf bag, lined inside.', 25000, 30000, 8, 'lattice', false],
  ['Hereni za shaba', 'Brass earrings, light, hypoallergenic hooks.', 12000, null, 30, 'dots', false],
  ['Kofia ya kofia', 'Embroidered cap, one size.', 20000, null, 5, 'arch', true],
  ['Mafuta ya nazi 250ml', 'Cold-pressed coconut oil for skin and hair.', 9000, null, 50, 'diamond', true],
]

/* ---------- Orders and visits over 90 days ---------- */

const NAMES = ['Wanjiru Kamau', 'Baraka Mollel', 'Neema Kileo', 'Juma Salim', 'Amina Said', 'Rehema Mushi', 'Fatma Ali', 'Halima Omari', 'Grace Mwakyusa', 'Zawadi Mrema', 'Saida Hassan', 'Joyce Lyimo', 'Mariam Juma', 'Esther Swai', 'Khadija Nassor', 'Upendo Massawe', 'Asha Bakari', 'Tumaini Shayo', 'Lulu Mbwambo', 'Rose Temba']
const AREAS = [['Mikocheni', 4000], ['Sinza', 3000], ['Kariakoo', 2000], ['Masaki', 5000], ['Mbezi Beach', 6000], ['Kinondoni', 3000], ['Ubungo', 4000], ['Kijitonyama', 3000]]
const LANDMARKS = ['karibu na Shell', 'jirani na msikiti', 'nyuma ya shule ya msingi', 'geti jeusi, nyumba ya pili', 'mbele ya duka la dawa', 'karibu na kituo cha daladala']
const SOURCES = [['instagram', 45], ['tiktok', 25], ['whatsapp', 20], ['direct', 10]]
const source = () => {
  let r = rand() * 100
  for (const [s, w] of SOURCES) if ((r -= w) < 0) return s
  return 'direct'
}

const sql = []
sql.push(`DELETE FROM events WHERE shop_id = '${shopId}';`)
sql.push(`DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE shop_id = '${shopId}');`)
sql.push(`DELETE FROM orders WHERE shop_id = '${shopId}';`)
sql.push(`DELETE FROM products WHERE shop_id = '${shopId}';`)
sql.push(`DELETE FROM delivery_areas WHERE shop_id = '${shopId}';`)
sql.push(`DELETE FROM shops WHERE id = '${shopId}';`)
sql.push(`DELETE FROM sessions WHERE user_id = '${userId}';`)
sql.push(`DELETE FROM users WHERE id = '${userId}';`)
sql.push(`INSERT INTO users (id, phone, name, pass_hash, created_at) VALUES ('${userId}', '+255700000001', 'Amina Juma', ${q(passHash)}, ${NOW - 95 * DAY});`)

const logoKey = `s/${shopId}/logo.webp`
sql.push(`INSERT INTO shops (id, owner_id, slug, name, bio, category, logo_key, whatsapp, instagram, tiktok, location, hours, lipa_number, lipa_name, lipa_network, cod_enabled, created_at)
  VALUES ('${shopId}', '${userId}', 'zuri-fashion', 'Zuri Fashion', 'Kitenge, kanga and Swahili coast style. Delivery across Dar.', 'fashion', '${logoKey}',
  '+255700000001', 'zurifashion.tz', 'zurifashion.tz', 'Mikocheni B, Dar es Salaam', 'Mon to Sat, 9:00 to 19:00', '5512345', 'ZURI FASHION', 'Lipa Namba', 1, ${NOW - 92 * DAY});`)
AREAS.forEach(([name, fee], i) => sql.push(`INSERT INTO delivery_areas (id, shop_id, name, fee, sort) VALUES ('${id()}', '${shopId}', ${q(name)}, ${fee}, ${i});`))

const products = PRODUCTS.map(([name, description, price, compare, stock, kind, dark], i) => {
  const pid = `demoprod${String(i).padStart(8, '0')}`
  const key = `s/${shopId}/p${i}.webp`
  return { pid, name, description, price, compare, stock, kind, dark, key, views: 0 }
})

const orderRows = []
const itemRows = []
const eventRows = []
const sold = Object.fromEntries(products.map((p) => [p.pid, 0]))

for (let d = 89; d >= 0; d--) {
  const dayStart = startOfToday - d * DAY
  const growth = 1 + (89 - d) / 30 // the shop grows month on month
  const weekday = new Date(dayStart + TZ).getUTCDay()
  const weekend = weekday === 5 || weekday === 6 ? 1.35 : 1
  const lastWeek = d >= 1 && d <= 6 ? 1.2 : 1 // the most recent week is the best so far
  const target = d === 0 ? 6 : Math.max(0, Math.round((2 + rand() * 3) * growth * weekend * lastWeek))
  const visits = Math.round(target * between(18, 30) + between(10, 40))
  const span = d === 0 ? Math.max(1, NOW - dayStart - 600_000) : DAY - 3_600_000

  for (let v = 0; v < visits; v++) {
    const t = dayStart + Math.floor(rand() * span)
    const s = source()
    eventRows.push(`('${shopId}', NULL, 'view_shop', '${s}', ${t})`)
    const looks = between(0, 3)
    for (let k = 0; k < looks; k++) {
      const p = pick(products)
      p.views++
      eventRows.push(`('${shopId}', '${p.pid}', 'view_product', '${s}', ${t + k * 20_000})`)
    }
    if (rand() < 0.04) eventRows.push(`('${shopId}', NULL, 'share', '${s}', ${t + 60_000})`)
  }

  for (let o = 0; o < target; o++) {
    const created = dayStart + Math.floor(rand() * span)
    const oid = id()
    const lines = []
    const n = rand() < 0.65 ? 1 : rand() < 0.7 ? 2 : 3
    for (let k = 0; k < n; k++) {
      const p = pick(products)
      if (!lines.some((l) => l.p === p)) lines.push({ p, qty: rand() < 0.85 ? 1 : 2 })
    }
    const [area, fee] = pick(AREAS)
    const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0)
    const method = rand() < 0.62 ? 'lipa' : 'cod'
    let status
    if (d >= 3) status = rand() < 0.93 ? 'delivered' : 'cancelled'
    else if (d >= 1) status = pick(['delivered', 'delivered', 'dispatched', 'confirmed'])
    else status = ['payment_claimed', 'confirmed', 'confirmed', 'awaiting_payment', 'dispatched', 'payment_claimed'][o % 6]
    if (method === 'cod' && (status === 'awaiting_payment' || status === 'payment_claimed')) status = 'confirmed'
    const paid = method === 'lipa' && status !== 'awaiting_payment' && status !== 'cancelled'
    const txn = paid ? `${code()}${code()}`.slice(0, 10) : null
    const total = subtotal + fee
    const sms = paid
      ? `${txn} Imethibitishwa. Tsh${total.toLocaleString('en-US')}.00 imelipwa kwa ZURI FASHION. Salio jipya ni Tsh${between(5, 90) * 1000}.`
      : null
    const check = paid ? JSON.stringify({ parsed: { txnId: txn, amount: total, name: 'ZURI FASHION' }, amount: 'ok', name: 'ok', txn: 'ok' }) : null
    const name = pick(NAMES)
    const phone = `+2557${between(10000000, 99999999)}`
    orderRows.push(
      `(${q(oid)}, '${shopId}', ${q(code())}, ${q(name)}, ${q(phone)}, ${q(area)}, ${q(pick(LANDMARKS))}, '', ${subtotal}, ${fee}, ${total}, '${method}', '${status}', ${q(sms)}, ${q(txn)}, ${q(check)}, ${paid ? created + 1_200_000 : 'NULL'}, ${created}, ${created + (d === 0 ? 0 : 7_200_000)})`,
    )
    for (const l of lines) {
      itemRows.push(`(${q(oid)}, '${l.p.pid}', ${q(l.p.name)}, ${l.p.price}, ${l.qty}, '${l.p.key}')`)
      if (['confirmed', 'dispatched', 'delivered'].includes(status)) sold[l.p.pid] += l.qty
    }
    eventRows.push(`('${shopId}', '${lines[0].p.pid}', 'add_to_cart', '${source()}', ${created - 120_000})`)
  }
}

for (const p of products) {
  sql.push(
    `INSERT INTO products (id, shop_id, name, description, price, compare_price, stock, images, active, views, created_at) VALUES ('${p.pid}', '${shopId}', ${q(p.name)}, ${q(p.description)}, ${p.price}, ${q(p.compare)}, ${p.stock}, '${JSON.stringify([p.key])}', 1, ${p.views}, ${NOW - 90 * DAY});`,
  )
}
const chunk = (rows, head) => {
  for (let i = 0; i < rows.length; i += 200) sql.push(`${head} VALUES ${rows.slice(i, i + 200).join(',\n')};`)
}
chunk(orderRows, 'INSERT INTO orders (id, shop_id, code, customer_name, customer_phone, area, landmark, note, subtotal, delivery_fee, total, payment_method, status, payment_sms, txn_id, payment_check, paid_claimed_at, created_at, updated_at)')
chunk(itemRows, 'INSERT INTO order_items (order_id, product_id, name, price, qty, image)')
chunk(eventRows, 'INSERT INTO events (shop_id, product_id, type, source, created_at)')

writeFileSync(join(OUT, 'seed.sql'), sql.join('\n'))

/* ---------- Write photos into local storage, then load the data ---------- */

const wrangler = (...args) => execFileSync('npx', ['wrangler', ...args], { stdio: ['ignore', 'ignore', 'inherit'] })

const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#0e0e0e"/>
  <g transform="translate(200 200)" fill="none" stroke="#fff" stroke-width="10"><rect x="-80" y="-80" width="160" height="160"/><rect x="-80" y="-80" width="160" height="160" transform="rotate(45)"/></g>
  <text x="200" y="232" text-anchor="middle" font-family="Georgia, serif" font-size="96" fill="#fff">Z</text></svg>`
await sharp(Buffer.from(logoSvg)).webp({ quality: 85 }).toFile(join(OUT, 'logo.webp'))
wrangler('r2', 'object', 'put', `rizk-media/${logoKey}`, '--local', '--file', join(OUT, 'logo.webp'), '--content-type', 'image/webp')
for (const [i, p] of products.entries()) {
  const file = join(OUT, `p${i}.webp`)
  await sharp(Buffer.from(patternSvg(p.kind, p.dark))).resize(800, 800).webp({ quality: 82 }).toFile(file)
  wrangler('r2', 'object', 'put', `rizk-media/${p.key}`, '--local', '--file', file, '--content-type', 'image/webp')
}
wrangler('d1', 'execute', 'rizk', '--local', '--file', join(OUT, 'seed.sql'))

const totalSales = orderRows.length
console.log(`Demo shop ready: /zuri-fashion · ${products.length} products · ${totalSales} orders · ${eventRows.length} events over 90 days`)
