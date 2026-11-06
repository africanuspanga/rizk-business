export function tzs(n: number | null | undefined) {
  return `TSh ${Math.round(n ?? 0).toLocaleString('en-US')}`
}

/** Tanzanian numbers to +255XXXXXXXXX; anything else keeps its digits with a +. */
export function normalizePhone(raw: string) {
  const digits = raw.replace(/[^\d]/g, '')
  if (/^0[67]\d{8}$/.test(digits)) return `+255${digits.slice(1)}`
  if (/^[67]\d{8}$/.test(digits)) return `+255${digits}`
  if (/^255[67]\d{8}$/.test(digits)) return `+${digits}`
  if (digits.length >= 9 && digits.length <= 15) return `+${digits}`
  return ''
}

export function waLink(phone: string, text?: string) {
  const digits = phone.replace(/[^\d]/g, '')
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30)
}

export const RESERVED_SLUGS = new Set([
  'app', 'admin', 'api', 'img', 'login', 'signup', 'logout', 'onboard', 'discover', 'creators',
  'top-products', 'help', 'about', 'terms', 'privacy', 'pricing', 'rizk', 'rizko', 'shop', 'shops',
  'o', 'order', 'orders', 'static', 'assets', 'favicon.ico', 'robots.txt', 'sitemap.xml',
])

export function imgUrl(key: string | null | undefined) {
  return key ? `/img/${key}` : ''
}

export function timeAgo(ms: number, lang: 'sw' | 'en') {
  const s = Math.max(1, Math.floor((Date.now() - ms) / 1000))
  const units: [number, string, string][] = [
    [86400, 'siku', 'd'],
    [3600, 'saa', 'h'],
    [60, 'dak', 'm'],
  ]
  for (const [size, sw, en] of units) {
    if (s >= size) {
      const n = Math.floor(s / size)
      return lang === 'sw' ? `${sw} ${n} zilizopita` : `${n}${en} ago`
    }
  }
  return lang === 'sw' ? 'sasa hivi' : 'just now'
}

export const CATEGORIES: { id: string; sw: string; en: string }[] = [
  { id: 'fashion', sw: 'Mitindo', en: 'Fashion' },
  { id: 'shoes', sw: 'Viatu', en: 'Shoes' },
  { id: 'clothes', sw: 'Nguo', en: 'Clothes' },
  { id: 'electronics', sw: 'Elektroniki', en: 'Electronics' },
  { id: 'food', sw: 'Chakula', en: 'Food' },
  { id: 'cosmetics', sw: 'Vipodozi', en: 'Cosmetics' },
  { id: 'perfumes', sw: 'Manukato', en: 'Perfumes' },
  { id: 'ebooks', sw: 'Vitabu pepe', en: 'Ebooks' },
  { id: 'other', sw: 'Mengineyo', en: 'Other' },
]

export const NETWORKS = ['M-Pesa', 'Mixx by Yas', 'Airtel Money', 'HaloPesa', 'Benki']

export type OrderStatus =
  | 'awaiting_payment'
  | 'payment_claimed'
  | 'confirmed'
  | 'dispatched'
  | 'delivered'
  | 'cancelled'

export const STATUS_LABEL: Record<OrderStatus, { sw: string; en: string; tone: string }> = {
  awaiting_payment: { sw: 'Inasubiri malipo', en: 'Awaiting payment', tone: 'bg-[#efeeeb] text-ink' },
  payment_claimed: { sw: 'Thibitisha malipo', en: 'Check payment', tone: 'bg-ink text-white' },
  confirmed: { sw: 'Imethibitishwa', en: 'Confirmed', tone: 'border border-ink/80 bg-white text-ink' },
  dispatched: { sw: 'Njiani', en: 'On the way', tone: 'bg-[#e2e1de] text-ink' },
  delivered: { sw: 'Imefika', en: 'Delivered', tone: 'bg-[#f3f2f0] text-muted' },
  cancelled: { sw: 'Imesitishwa', en: 'Cancelled', tone: 'bg-[#f3f2f0] text-muted line-through' },
}
