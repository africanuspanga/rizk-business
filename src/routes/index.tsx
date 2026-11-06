import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowRight,
  BarChart3,
  Banknote,
  Check,
  CheckCircle2,
  ChevronDown,
  Link2,
  MapPin,
  MessageCircle,
  Package,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Store,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { LangSwitch } from '#/components/ui'
import { CATEGORIES } from '#/lib/format'
import { useLang, useT } from '#/lib/i18n'

export const Route = createFileRoute('/')({ component: Landing })

const GREEN = '#3d8a56'

function Landing() {
  const t = useT()
  const { session } = Route.useRouteContext()
  const start = session.user ? (session.shop ? '/app' : '/onboard') : '/signup'
  const startLabel = session.shop ? t('Nenda kwenye duka', 'Go to my shop') : t('Fungua duka bure', 'Open your shop free')

  return (
    <div className="overflow-x-hidden">
      <Nav start={start} signedIn={!!session.user} />
      <Hero start={start} startLabel={startLabel} />
      <Categories />
      <Steps />
      <Payments />
      <Orders />
      <Dashboard />
      <Everything />
      <Pricing start={start} />
      <Faq />
      <Closing start={start} startLabel={startLabel} />
      <footer className="mx-auto max-w-[1120px] px-4 pt-6 pb-10 text-center text-xs text-muted md:px-8">
        RIZK · Risk to get Rizk · © {new Date().getFullYear()} Driftmark Technologies Limited · Dar es Salaam
      </footer>
    </div>
  )
}

function Wrap({ children, className = '', id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`mx-auto w-full max-w-[1120px] px-4 md:px-8 ${className}`}>
      {children}
    </section>
  )
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-xs font-bold tracking-[0.14em] text-muted uppercase">{children}</p>
}

function H2({ children }: { children: ReactNode }) {
  return <h2 className="mt-2 text-[32px] leading-[1.05] font-extrabold tracking-tight md:text-[48px]">{children}</h2>
}

/* ---------- Nav ---------- */

function Nav({ start, signedIn }: { start: string; signedIn: boolean }) {
  const t = useT()
  return (
    <header className="sticky top-0 z-40 border-b border-transparent bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center gap-3 px-4 md:px-8">
        <span className="text-[22px] font-extrabold tracking-tight">RIZK</span>
        <nav className="ml-6 hidden gap-6 text-[15px] text-ink/70 md:flex">
          <a href="#how">{t('Inavyofanya kazi', 'How it works')}</a>
          <a href="#pay">{t('Malipo', 'Payments')}</a>
          <a href="#pricing">{t('Bei', 'Pricing')}</a>
          <a href="#faq">{t('Maswali', 'FAQ')}</a>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <LangSwitch />
          {!signedIn && (
            <Link to="/login" className="hidden px-3 text-[15px] font-semibold sm:block">
              {t('Ingia', 'Log in')}
            </Link>
          )}
          <Link to={start} className="btn btn-sm">
            {signedIn ? t('Duka langu', 'My shop') : t('Fungua duka', 'Open shop')} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </header>
  )
}

/* ---------- Hero ---------- */

function Hero({ start, startLabel }: { start: string; startLabel: string }) {
  const t = useT()
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,#f7e2d3_0%,transparent_70%)]" />
      <Wrap className="pt-10 text-center md:pt-20">
        <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-sm font-semibold shadow-[0_4px_14px_rgba(60,40,20,0.06)]">
          <span className="h-2 w-2 rounded-full" style={{ background: GREEN }} />
          <span className="sm:hidden">{t('Kwa wauzaji wa mitandaoni', 'For social sellers')}</span>
          <span className="hidden sm:inline">{t('Kwa wauzaji wa Instagram, TikTok na WhatsApp', 'For Instagram, TikTok and WhatsApp sellers')}</span>
        </span>
        <h1 className="mx-auto mt-6 max-w-[900px] text-[44px] leading-[0.98] font-extrabold tracking-[-0.03em] md:text-[84px]">
          {/* Brand tagline: English wordplay in both languages (risk = courage, rizk = riziki, livelihood). */}
          <span className="block">Risk to get</span>
          <span className="block" style={{ color: GREEN }}>
            Rizk.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-[620px] text-[16px] leading-relaxed text-ink/70 md:text-[19px]">
          {t(
            'Fungua duka la mtandaoni kwa dakika 5. Wateja wanaagiza wenyewe kwa jina, namba na eneo, wanalipa Lipa Namba yako au cash wakipokea, na wewe unaona kila oda sehemu moja. Hakuna tena DM elfu.',
            'Open an online shop in 5 minutes. Buyers order by themselves with their name, number and area, pay your Lipa Namba or cash on delivery, and you see every order in one place. No more endless DMs.',
          )}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to={start} className="btn w-full sm:w-auto">
            {startLabel} <ArrowRight size={18} />
          </Link>
          <a href="#how" className="btn btn-soft w-full sm:w-auto">
            {t('Ona inavyofanya kazi', 'See how it works')}
          </a>
        </div>
        <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-ink/70">
          {[t('Bure kuanza', 'Free to start'), t('Hakuna kamisheni kwenye mauzo', 'No commission on sales'), t('Pesa inaenda kwako moja kwa moja', 'Money goes straight to you')].map((x) => (
            <li key={x} className="flex items-center gap-1.5">
              <Check size={16} style={{ color: GREEN }} strokeWidth={3} /> {x}
            </li>
          ))}
        </ul>
      </Wrap>
      <Wrap className="mt-12 md:mt-16">
        <Showcase />
      </Wrap>
    </div>
  )
}

const MOCK_PRODUCTS = [
  { name: 'Gauni la kitenge', price: '35,000', bg: 'linear-gradient(135deg,#f2b591,#c4613a)' },
  { name: 'Sandali za ngozi', price: '28,000', bg: 'linear-gradient(135deg,#e9d8b5,#a88a52)' },
  { name: 'Manukato Oud', price: '45,000', bg: 'linear-gradient(135deg,#d9cdef,#7d68b0)' },
  { name: 'Kanga mpya', price: '15,000', bg: 'linear-gradient(135deg,#cfe3c4,#5f9a5a)' },
]

/** Faux UI of the real product: the storefront, a paid order and the seller's day. */
function Showcase() {
  const t = useT()
  return (
    <div className="relative mx-auto flex max-w-[980px] flex-col items-center gap-5 md:flex-row md:items-end md:justify-center md:gap-10">
      {/* Seller phone */}
      <Phone className="hidden md:block">
        <p className="text-[11px] text-muted">{t('Habari, Amina', 'Hello, Amina')}</p>
        <div className="mt-2 rounded-2xl bg-ink p-3 text-white">
          <p className="text-[9px] tracking-wider text-white/60 uppercase">{t('Mauzo leo', 'Sales today')}</p>
          <p className="mt-0.5 text-[20px] font-extrabold">TSh 184,000</p>
          <p className="text-[10px] text-white/60">{t('Oda 6 · 2 za kufunga', '6 orders · 2 to pack')}</p>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
          {[
            ['2', t('Kufunga', 'To pack')],
            ['3', t('Njiani', 'Out')],
            ['41', t('Wageni', 'Visits')],
          ].map(([n, l]) => (
            <div key={l} className="rounded-xl border border-line bg-white py-1.5">
              <p className="text-[14px] font-extrabold">{n}</p>
              <p className="text-[8px] text-muted">{l}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[9px] font-bold tracking-wider text-muted uppercase">{t('Oda mpya', 'New orders')}</p>
        {[
          ['Baraka M.', '39,000', t('Imelipwa', 'Paid')],
          ['Neema K.', '28,000', 'Cash'],
          ['Juma S.', '60,000', t('Imelipwa', 'Paid')],
        ].map(([n, a, s]) => (
          <div key={n} className="mt-1.5 flex items-center gap-2 rounded-xl border border-line bg-white px-2 py-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-peach text-[10px] font-bold">{n[0]}</span>
            <span className="flex-1 text-[10px] font-semibold">{n}</span>
            <span className="rounded-full bg-[#e7f4ea] px-1.5 text-[8px] font-bold" style={{ color: GREEN }}>
              {s}
            </span>
            <span className="text-[10px] font-bold">{a}</span>
          </div>
        ))}
      </Phone>

      {/* Buyer phone: the storefront */}
      <Phone big>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-peach text-[11px] font-extrabold">ZF</span>
          <div className="min-w-0">
            <p className="text-[13px] font-extrabold">Zuri Fashion</p>
            <p className="text-[9px] text-muted">rizk.tz/zuri-fashion</p>
          </div>
        </div>
        <div className="mt-3 flex gap-1.5">
          <span className="rounded-full bg-ink px-2.5 py-1 text-[9px] font-bold text-white">{t('Zote', 'All')}</span>
          <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-bold">{t('Mpya', 'New')}</span>
          <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-bold">{t('Punguzo', 'Sale')}</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {MOCK_PRODUCTS.map((p) => (
            <div key={p.name} className="overflow-hidden rounded-2xl bg-white">
              <div className="aspect-square" style={{ background: p.bg }} />
              <div className="p-2">
                <p className="truncate text-[10px] font-bold">{p.name}</p>
                <p className="text-[10px] font-extrabold">TSh {p.price}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-full bg-ink py-1.5 pr-1.5 pl-3 text-white">
          <span className="flex-1 text-[10px] font-bold">2 {t('bidhaa', 'items')} · TSh 63,000</span>
          <span className="rounded-full bg-white px-3 py-1 text-[9px] font-extrabold text-ink">{t('Agiza', 'Checkout')}</span>
        </div>
      </Phone>

      {/* Floating proof: payment checked */}
      <div className="w-[290px] rounded-[20px] bg-ink p-4 text-white shadow-[0_20px_40px_rgba(31,27,24,0.3)] md:absolute md:right-0 md:bottom-10">
        <p className="text-[11px] font-bold tracking-wider text-white/60 uppercase">{t('Malipo yamekaguliwa', 'Payment checked')}</p>
        {[t('Kiasi: TSh 63,000', 'Amount: TSh 63,000'), t('Jina: ZURI FASHION', 'Name: ZURI FASHION'), t('Muamala: haujatumika', 'Transaction: never used')].map((x) => (
          <p key={x} className="mt-1.5 flex items-center gap-2 text-[13px]">
            <CheckCircle2 size={15} className="text-[#7fd49a]" /> {x}
          </p>
        ))}
      </div>
    </div>
  )
}

function Phone({ children, big, className = '' }: { children: ReactNode; big?: boolean; className?: string }) {
  return (
    <div className={`shrink-0 rounded-[38px] bg-ink p-2 shadow-[0_30px_60px_rgba(31,27,24,0.22)] ${big ? 'w-[290px] md:w-[300px]' : 'mb-10 w-[240px]'} ${className}`}>
      <div className="relative h-full overflow-hidden rounded-[30px] bg-canvas px-3 pt-8 pb-4">
        <span className="absolute top-2 left-1/2 h-5 w-20 -translate-x-1/2 rounded-full bg-ink" />
        {children}
      </div>
    </div>
  )
}

/* ---------- Categories marquee ---------- */

function Categories() {
  const lang = useLang()
  const items = CATEGORIES.filter((c) => c.id !== 'other').map((c) => c[lang])
  const row = [...items, ...items, ...items]
  return (
    <div className="mt-20 overflow-hidden border-y border-line bg-card py-5 md:mt-24">
      <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-8 motion-reduce:animate-none">
        {[...row, ...row].map((c, i) => (
          <span key={i} className="flex items-center gap-8 text-[20px] font-bold whitespace-nowrap text-ink/70 md:text-[24px]">
            {c} <span className="h-1.5 w-1.5 rounded-full bg-peach-deep" />
          </span>
        ))}
      </div>
    </div>
  )
}

/* ---------- How it works ---------- */

function Steps() {
  const t = useT()
  const steps = [
    {
      icon: Store,
      bg: 'bg-peach',
      title: t('Fungua duka', 'Open your shop'),
      body: t('Jina, link na WhatsApp yako. Weka Lipa Namba na maeneo ya delivery. Dakika tano tu.', 'Your name, link and WhatsApp. Add your Lipa Namba and delivery areas. Five minutes.'),
    },
    {
      icon: Package,
      bg: 'bg-lime',
      title: t('Weka bidhaa', 'Add your products'),
      body: t('Piga picha kwa simu, weka bei na idadi. Picha zinapunguzwa ukubwa ili wateja wasitumie bando nyingi.', 'Snap a photo, set the price and stock. Photos are shrunk so buyers spend less data.'),
    },
    {
      icon: Link2,
      bg: 'bg-lilac',
      title: t('Shiriki na uuze', 'Share and sell'),
      body: t('Weka link kwenye bio ya Instagram, TikTok na status ya WhatsApp. Oda zinakuja zikiwa kamili.', 'Put the link in your Instagram and TikTok bio and your WhatsApp status. Orders arrive complete.'),
    },
  ]
  return (
    <Wrap id="how" className="scroll-mt-20 pt-20 md:pt-28">
      <Eyebrow>{t('Inavyofanya kazi', 'How it works')}</Eyebrow>
      <H2>{t('Hatua tatu hadi mauzo ya kwanza.', 'Three steps to your first sale.')}</H2>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {steps.map((s, i) => (
          <div key={s.title} className="card p-6">
            <div className="flex items-center justify-between">
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${s.bg}`}>
                <s.icon size={22} />
              </span>
              <span className="text-[40px] font-extrabold text-line">0{i + 1}</span>
            </div>
            <h3 className="mt-6 text-[22px] font-extrabold">{s.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink/70">{s.body}</p>
          </div>
        ))}
      </div>
    </Wrap>
  )
}

/* ---------- Payments ---------- */

function Payments() {
  const t = useT()
  return (
    <Wrap id="pay" className="scroll-mt-20 pt-20 md:pt-28">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <Eyebrow>{t('Malipo', 'Payments')}</Eyebrow>
          <H2>{t('Kila shilingi inaenda kwako.', 'Every shilling goes to you.')}</H2>
          <p className="mt-4 text-[17px] leading-relaxed text-ink/70">
            {t(
              'Mteja analipa Lipa Namba yako moja kwa moja, kisha anabandika SMS ya malipo. RIZK inakagua kiasi, jina na namba ya muamala, na haikubali muamala uliotumika kwenye oda nyingine. Wewe unathibitisha kwa kubofya mara moja.',
              'The buyer pays your Lipa Namba directly, then pastes the payment SMS. RIZK checks the amount, the name and the transaction ID, and refuses a transaction already used on another order. You confirm with one tap.',
            )}
          </p>
          <ul className="mt-6 space-y-3">
            {[
              [Smartphone, t('M-Pesa, Mixx by Yas, Airtel Money, HaloPesa', 'M-Pesa, Mixx by Yas, Airtel Money, HaloPesa')],
              [Banknote, t('Cash wakati wa kupokea, ukitaka', 'Cash on delivery, if you want it')],
              [ShieldCheck, t('RIZK haishiki pesa yako hata siku moja', 'RIZK never holds your money')],
            ].map(([Icon, label]) => {
              const I = Icon as typeof Smartphone
              return (
                <li key={label as string} className="flex items-center gap-3 text-[15px] font-semibold">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-[0_4px_14px_rgba(60,40,20,0.06)]">
                    <I size={17} />
                  </span>
                  {label as string}
                </li>
              )
            })}
          </ul>
        </div>
        <div className="card p-5 md:p-7">
          <p className="text-sm font-bold">{t('SMS ya mteja', 'Buyer’s SMS')}</p>
          <p className="mt-2 rounded-2xl bg-canvas px-4 py-3 font-mono text-[13px] leading-relaxed text-ink/80">
            QK48ZX91 Imethibitishwa. Tsh63,000.00 imelipwa kwa ZURI FASHION tarehe 6/11/26 saa 4:12 PM.
          </p>
          <div className="mt-4 space-y-2.5">
            {[
              t('Kiasi kinalingana na oda', 'Amount matches the order'),
              t('Jina ni la duka lako', 'Name is your shop’s'),
              t('Namba ya muamala haijatumika', 'Transaction ID never used before'),
            ].map((x) => (
              <p key={x} className="flex items-center gap-2.5 text-[15px]">
                <CheckCircle2 size={19} style={{ color: GREEN }} /> {x}
              </p>
            ))}
          </div>
          <div className="mt-5 rounded-2xl bg-ink py-3.5 text-center text-[15px] font-bold text-white">{t('Nimepokea malipo', 'Payment received')}</div>
        </div>
      </div>
    </Wrap>
  )
}

/* ---------- Orders ---------- */

function Orders() {
  const t = useT()
  const statuses = [t('Imepokelewa', 'Received'), t('Imethibitishwa', 'Confirmed'), t('Njiani', 'On the way'), t('Imefika', 'Delivered')]
  return (
    <Wrap className="pt-20 md:pt-28">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div className="order-2 card p-5 md:order-1 md:p-7">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[20px] font-extrabold">Baraka Mollel</p>
              <p className="text-sm text-muted">+255 713 456 789</p>
            </div>
            <span className="rounded-full bg-sky px-3 py-1 text-xs font-bold">#8UU3RE</span>
          </div>
          <p className="mt-3 flex items-center gap-2 text-[15px]">
            <MapPin size={16} /> <b>Mikocheni</b> · {t('karibu na Shell', 'near the Shell station')}
          </p>
          <div className="mt-5 flex items-center">
            {statuses.map((s, i) => (
              <div key={s} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full ${i < 3 ? 'bg-ink text-white' : 'bg-line text-muted'}`}>
                    {i < 2 ? <Check size={14} strokeWidth={3} /> : <span className="text-[11px] font-bold">{i + 1}</span>}
                  </span>
                  <span className="w-16 text-center text-[10px] font-semibold text-muted">{s}</span>
                </div>
                {i < statuses.length - 1 && <div className={`mx-1 mb-4 h-1 flex-1 rounded-full ${i < 2 ? 'bg-ink' : 'bg-line'}`} />}
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-line py-3 text-center text-sm font-bold">{t('Piga', 'Call')}</div>
            <div className="rounded-2xl bg-[#1f8f4e] py-3 text-center text-sm font-bold text-white">WhatsApp</div>
          </div>
        </div>
        <div className="order-1 md:order-2">
          <Eyebrow>{t('Oda', 'Orders')}</Eyebrow>
          <H2>{t('Oda kamili. Bila kuuliza mara kumi.', 'Complete orders. No ten questions.')}</H2>
          <p className="mt-4 text-[17px] leading-relaxed text-ink/70">
            {t(
              'Kila oda inakuja na jina, namba, eneo, alama ya karibu na bidhaa zote. Mteja anapata ukurasa wa kufuatilia oda yake, na kitufe cha kukutumia oda kwa WhatsApp. Stock inapungua yenyewe ukithibitisha.',
              'Every order comes with the name, number, area, a nearby landmark and every item. The buyer gets a page to follow the order, plus a button to send it to you on WhatsApp. Stock goes down by itself when you confirm.',
            )}
          </p>
        </div>
      </div>
    </Wrap>
  )
}

/* ---------- Dashboard ---------- */

function Dashboard() {
  const t = useT()
  const bars = [22, 38, 30, 55, 42, 68, 90]
  return (
    <Wrap className="pt-20 md:pt-28">
      <div className="text-center">
        <Eyebrow>{t('Dashibodi', 'Dashboard')}</Eyebrow>
        <H2>{t('Biashara yako, kwa namba.', 'Your business, in numbers.')}</H2>
        <p className="mx-auto mt-4 max-w-[560px] text-[17px] text-ink/70">
          {t('Mauzo, oda, wageni na bidhaa zinazopendwa. Pia unajua wateja wametoka Instagram, TikTok au WhatsApp.', 'Sales, orders, visitors and your best products. You also see whether buyers came from Instagram, TikTok or WhatsApp.')}
        </p>
      </div>
      <div className="mx-auto mt-10 max-w-[900px] overflow-hidden rounded-[20px] border border-[#ebe9e6] bg-white">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {[
            [t('Mauzo', 'Sales'), 'TSh 1.2M', '+22%'],
            [t('Oda', 'Orders'), '38', '+12%'],
            [t('Wageni', 'Visitors'), '1,240', '+31%'],
            [t('Wanaonunua', 'Conversion'), '3.1%', '+0.4%'],
          ].map(([l, v, d], i) => (
            <div key={l} className={`border-[#ebe9e6] p-4 md:p-5 ${i % 2 === 0 ? 'border-r' : ''} ${i < 2 ? 'border-b md:border-b-0' : ''} ${i === 1 ? 'md:border-r' : ''}`}>
              <p className="text-[13px] text-muted">{l}</p>
              <p className="mt-1 text-[22px] font-extrabold md:text-[26px]">{v}</p>
              <span className="mt-2 inline-block rounded-full bg-[#e7f4ea] px-2 py-0.5 text-xs font-bold" style={{ color: GREEN }}>
                {d}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-[#ebe9e6] p-5">
          <div className="flex h-36 items-end gap-2 md:gap-4">
            {bars.map((h, i) => (
              <span key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%`, background: i === bars.length - 1 ? GREEN : '#efeeeb' }} />
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-muted">{t('Mfano wa namba, si data halisi.', 'Example numbers, not real data.')}</p>
    </Wrap>
  )
}

/* ---------- Everything else ---------- */

function Everything() {
  const t = useT()
  const items = [
    [Link2, t('Link yako', 'Your own link'), 'rizk.tz/dukalako'],
    [Package, t('Bidhaa na stock', 'Products and stock'), t('Picha 6, bei, punguzo, idadi', '6 photos, price, sale, stock')],
    [Smartphone, 'Lipa Namba', t('Ukaguzi wa SMS ya malipo', 'Payment SMS check')],
    [Banknote, t('Cash ukipokea', 'Cash on delivery'), t('Washa au zima', 'Turn on or off')],
    [MapPin, 'Delivery', t('Maeneo na bei zako', 'Your areas and fees')],
    [ReceiptText, t('Oda', 'Orders'), t('Hatua kwa hatua', 'Step by step')],
    [MessageCircle, 'WhatsApp', t('Oda na maswali moja kwa moja', 'Orders and questions, direct')],
    [BarChart3, t('Takwimu', 'Analytics'), t('Wageni, mauzo, vyanzo', 'Visitors, sales, sources')],
  ] as const
  return (
    <Wrap className="pt-20 md:pt-28">
      <Eyebrow>{t('Na kila kitu kingine', 'And everything else')}</Eyebrow>
      <H2>{t('Zana za duka kubwa, kwenye simu yako.', 'Big-store tools, on your phone.')}</H2>
      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map(([Icon, title, sub]) => (
          <div key={title} className="card p-5">
            <Icon size={22} />
            <p className="mt-5 text-[16px] font-extrabold">{title}</p>
            <p className="mt-1 text-[13px] text-muted">{sub}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted">
        {t('Inakuja hivi karibuni: Rizko, msaidizi wa AI anayejibu wateja, na kura za bidhaa bora za wiki.', 'Coming soon: Rizko, an AI assistant that answers buyers, and weekly best-product votes.')}
      </p>
    </Wrap>
  )
}

/* ---------- Pricing ---------- */

function Pricing({ start }: { start: string }) {
  const t = useT()
  return (
    <Wrap id="pricing" className="scroll-mt-20 pt-20 md:pt-28">
      <div className="text-center">
        <Eyebrow>{t('Bei', 'Pricing')}</Eyebrow>
        <H2>{t('Anza bure. Leo.', 'Start free. Today.')}</H2>
      </div>
      <div className="card mx-auto mt-10 max-w-[480px] p-7">
        <p className="text-[15px] font-bold">{t('Wauzaji wa kwanza', 'Early sellers')}</p>
        <p className="mt-2 text-[44px] leading-none font-extrabold">
          TSh 0 <span className="text-[16px] font-semibold text-muted">/ {t('mwezi', 'month')}</span>
        </p>
        <p className="mt-2 text-sm text-muted">{t('Hakuna kamisheni kwenye mauzo yako.', 'No commission on your sales.')}</p>
        <ul className="mt-6 space-y-2.5 text-[15px]">
          {[
            t('Duka lako kwenye rizk.tz/jina', 'Your shop at rizk.tz/name'),
            t('Lipa Namba na cash wakati wa kupokea', 'Lipa Namba and cash on delivery'),
            t('Oda, stock na delivery', 'Orders, stock and delivery'),
            t('Dashibodi na takwimu', 'Dashboard and analytics'),
            t('Kiswahili na Kiingereza', 'Swahili and English'),
          ].map((x) => (
            <li key={x} className="flex items-center gap-2.5">
              <Check size={17} strokeWidth={3} style={{ color: GREEN }} /> {x}
            </li>
          ))}
        </ul>
        <Link to={start} className="btn mt-7 w-full">
          {t('Anza bure', 'Start free')}
        </Link>
      </div>
    </Wrap>
  )
}

/* ---------- FAQ ---------- */

function Faq() {
  const t = useT()
  const qs = [
    [
      t('RIZK inagharimu kiasi gani?', 'What does RIZK cost?'),
      t('Ni bure kuanza, na hatuchukui kamisheni kwenye mauzo yako. Tutatangaza vifurushi vya kulipia mapema kabla havijaanza.', 'It is free to start and we take no commission on your sales. We will announce paid plans well before they start.'),
    ],
    [
      t('Napokeaje pesa?', 'How do I get paid?'),
      t('Mteja analipa Lipa Namba au namba yako moja kwa moja, au cash akipokea mzigo. Pesa haipiti kwetu.', 'The buyer pays your Lipa Namba or number directly, or cash on delivery. The money never passes through us.'),
    ],
    [
      t('Nitajuaje kama mteja amelipa kweli?', 'How do I know a buyer really paid?'),
      t('Mteja anabandika SMS ya malipo. Tunakagua kiasi, jina na namba ya muamala, na tunakataa muamala uliotumika tayari. Bado angalia simu yako kabla ya kuthibitisha.', 'The buyer pastes the payment SMS. We check the amount, name and transaction ID and refuse one already used. Still check your phone before you confirm.'),
    ],
    [
      t('Nahitaji website au programmer?', 'Do I need a website or a developer?'),
      t('Hapana. Unafungua duka kwenye simu yako kwa dakika chache, na unapata link ya kushiriki.', 'No. You open the shop on your phone in a few minutes and get a link to share.'),
    ],
    [
      t('Nani anafanya delivery?', 'Who does the delivery?'),
      t('Kwa sasa wewe, na boda yako. Unaweka maeneo yako na bei ya delivery kila eneo, na mteja anachagua wakati wa kuagiza.', 'For now you do, with your own boda. You set your areas and a fee for each, and the buyer picks one when ordering.'),
    ],
    [
      t('Naweza kuuza nini?', 'What can I sell?'),
      t('Nguo, viatu, vipodozi, manukato, elektroniki, chakula na zaidi. Bidhaa haramu haziruhusiwi.', 'Clothes, shoes, cosmetics, perfumes, electronics, food and more. Illegal goods are not allowed.'),
    ],
  ]
  return (
    <Wrap id="faq" className="scroll-mt-20 pt-20 md:pt-28">
      <div className="grid gap-8 md:grid-cols-[1fr_1.5fr]">
        <div>
          <Eyebrow>{t('Maswali', 'Questions')}</Eyebrow>
          <H2>{t('Vizuri kujua.', 'Good to know.')}</H2>
        </div>
        <div className="card divide-y divide-line">
          {qs.map(([q, a]) => (
            <details key={q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-bold">
                {q}
                <ChevronDown size={18} className="shrink-0 transition group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-[15px] leading-relaxed text-ink/70">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </Wrap>
  )
}

/* ---------- Closing ---------- */

function Closing({ start, startLabel }: { start: string; startLabel: string }) {
  const t = useT()
  return (
    <Wrap className="pt-20 pb-10 md:pt-28">
      <div className="overflow-hidden rounded-[32px] bg-ink px-6 py-14 text-center text-white md:py-20">
        <h2 className="mx-auto max-w-[700px] text-[34px] leading-[1.05] font-extrabold tracking-tight md:text-[52px]">
          {t('Wateja wako tayari wako kwenye simu. Wafikie huko.', 'Your buyers are already on their phones. Meet them there.')}
        </h2>
        <p className="mt-4 text-[17px] text-white/70">{t('Fungua duka lako la RIZK leo. Ni bure kuanza.', 'Open your RIZK shop today. It is free to start.')}</p>
        <Link to={start} className="btn mt-8 bg-white text-ink">
          {startLabel} <ArrowRight size={18} />
        </Link>
      </div>
    </Wrap>
  )
}
