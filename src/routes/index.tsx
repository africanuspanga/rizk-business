import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Banknote,
  Check,
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
import { Arch, DiamondRow, Lattice, Rosette } from '#/components/motifs'
import { CATEGORIES } from '#/lib/format'


export const Route = createFileRoute('/')({ component: Landing })

/** The landing page is English only for now (owner, 2026-11-06). Swahili strings stay beside each line for later. */
const en = (_sw: string, english: string) => english

/* Black and white only. Ink, paper, and greys between. */
const INK = '#0e0e0e'

function Landing() {
  const t = en
  const { session } = Route.useRouteContext()
  const start = session.user ? (session.shop ? '/app' : '/onboard') : '/signup'
  const startLabel = session.shop ? t('Nenda kwenye duka', 'Go to my shop') : t('Fungua duka bure', 'Open your shop free')

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#efeeeb] text-[#0e0e0e]">
      <div className="mx-auto max-w-[1280px] px-3 pt-3 md:px-5 md:pt-5">
        <Nav start={start} signedIn={!!session.user} />
        <Hero start={start} startLabel={startLabel} />
        <Strip />
      </div>
      <Steps />
      <Payments />
      <Orders />
      <Dashboard />
      <Everything />
      <Pricing start={start} />
      <Faq />
      <Closing start={start} startLabel={startLabel} />
      <footer className="mx-auto flex max-w-[1280px] flex-col items-center gap-3 px-4 pt-4 pb-10 text-center text-xs text-[#6b6b6b] md:px-5">
        <Rosette size={14} className="text-[#0e0e0e]" />
        <p>RIZK · Risk to get Rizk · © {new Date().getFullYear()} Driftmark Technologies Limited · Dar es Salaam</p>
      </footer>
    </div>
  )
}

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[28px] bg-white ${className}`}>{children}</div>
}

function Section({ children, id, className = '' }: { children: ReactNode; id?: string; className?: string }) {
  return (
    <section id={id} className={`mx-auto max-w-[1280px] scroll-mt-24 px-3 pt-16 md:px-5 md:pt-24 ${className}`}>
      {children}
    </section>
  )
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 border-b border-black/15 pb-1.5 text-[13px] font-medium tracking-[0.08em] uppercase">
      <span className="h-2 w-2 rounded-full bg-[#0e0e0e]" />
      {children}
    </p>
  )
}

function Display({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h2 className={`font-display text-[44px] leading-[0.95] tracking-[-0.01em] md:text-[68px] ${className}`}>{children}</h2>
}

/* ---------- Nav ---------- */

function Nav({ start, signedIn }: { start: string; signedIn: boolean }) {
  const t = en
  return (
    <header className="sticky top-3 z-40 rounded-[22px] bg-white/90 p-2 backdrop-blur md:top-5">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex h-11 items-center gap-2 rounded-[14px] border border-black/10 bg-[#f6f5f3] px-3.5">
          <Rosette size={16} className="[--rosette-hole:#f6f5f3]" />
          <span className="font-display text-[24px] leading-none">Rizk</span>
        </Link>
        <nav className="mx-auto hidden items-center gap-1 text-[15px] md:flex">
          {[
            ['#how', t('Inavyofanya kazi', 'How it works')],
            ['#pay', t('Malipo', 'Payments')],
            ['#pricing', t('Bei', 'Pricing')],
            ['#faq', t('Maswali', 'FAQ')],
          ].map(([href, label]) => (
            <a key={href} href={href} className="rounded-full px-3.5 py-1.5 hover:bg-[#f2f1ee]">
              {label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {!signedIn && (
            <Link to="/login" className="hidden px-2 text-[15px] sm:block">
              {t('Ingia', 'Log in')}
            </Link>
          )}
          <Link to={start} className="flex h-11 items-center gap-2 rounded-[14px] bg-[#0e0e0e] px-4 text-[15px] font-semibold text-white">
            {signedIn ? t('Duka langu', 'My shop') : t('Fungua duka', 'Open shop')}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </header>
  )
}

/* ---------- Hero ---------- */

function Hero({ start, startLabel }: { start: string; startLabel: string }) {
  const t = en
  return (
    <div className="mt-3 grid grid-cols-1 gap-3 md:mt-5 md:grid-cols-[1.05fr_1fr] md:gap-5">
      {/* Words */}
      <Panel className="flex min-w-0 flex-col p-6 md:p-12">
        <div className="pt-4 md:pt-10">
          <Eyebrow>{t('Kwa wauzaji wa mitandaoni', 'For social sellers')}</Eyebrow>
          <h1 className="mt-6 font-display text-[64px] leading-[0.9] tracking-[-0.015em] md:text-[112px]">
            Risk to get <em className="italic">Rizk.</em>
          </h1>
          <p className="mt-6 max-w-[500px] text-[17px] leading-relaxed text-[#4a4a4a]">
            {t(
              'Duka la mtandaoni linaloishi kwenye link moja. Wateja wanaagiza wenyewe, wanalipa Lipa Namba yako au cash wakipokea, na wewe unaona kila oda sehemu moja.',
              'An online shop that lives in one link. Buyers order by themselves, pay your Lipa Namba or cash on delivery, and you see every order in one place.',
            )}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link to={start} className="flex h-14 items-center gap-3 rounded-[16px] bg-[#0e0e0e] pr-5 pl-2 text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-white/12">
                <Store size={19} />
              </span>
              <span className="text-left leading-tight">
                <span className="block text-[11px] text-white/60">{t('Dakika 5 tu', 'Just 5 minutes')}</span>
                <span className="block text-[16px] font-semibold">{startLabel}</span>
              </span>
            </Link>
            <a href="#how" className="flex items-center gap-1.5 border-b border-black/30 pb-1 text-[15px] font-medium">
              {t('Ona inavyofanya kazi', 'See how it works')} <ArrowRight size={16} />
            </a>
          </div>
        </div>

        <div className="flex-1" />
        <div className="mt-12 flex items-center gap-4 rounded-[20px] border border-black/10 p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0e0e0e] text-white">
            <ReceiptText size={19} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold">{t('Oda zinakuja kamili', 'Orders arrive complete')}</p>
            <p className="text-[13px] text-[#6b6b6b]">{t('Jina, namba, eneo na alama ya karibu', 'Name, number, area and a nearby landmark')}</p>
          </div>
          <ShieldCheck size={22} className="hidden shrink-0 sm:block" />
        </div>
      </Panel>

      {/* Product, framed by a door arch on a lattice screen */}
      <div className="relative overflow-hidden rounded-[28px] bg-[#0e0e0e] px-6 pt-14 text-white md:pt-16">
        <Lattice size={46} stroke="#fff" opacity={0.13} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0e0e0e] to-transparent" />
        <Arch dark className="relative mx-auto h-[520px] w-[290px] md:h-[600px] md:w-[320px]">
          <div className="h-full bg-[#1b1b1b] p-2 pt-16">
            <PhoneScreen />
          </div>
        </Arch>
        <div className="absolute right-4 bottom-6 left-4 z-10 mx-auto flex max-w-[330px] items-center gap-3 rounded-full bg-white py-2 pr-4 pl-2 text-[#0e0e0e] shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0e0e0e] text-white">
            <Check size={17} strokeWidth={3} />
          </span>
          <span className="text-[14px] leading-tight">
            <b>{t('Malipo yamekaguliwa', 'Payment checked')}</b>
            <span className="block text-[12px] text-[#6b6b6b]">{t('Kiasi, jina na muamala', 'Amount, name and transaction')}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

/* Product tiles drawn in black and white kanga and jali patterns, never stock photos. */
const TILES = [
  { name: 'Kanga ya Pwani', price: '15,000', dark: true, kind: 'lattice' },
  { name: 'Gauni la kitenge', price: '35,000', dark: false, kind: 'diamond' },
  { name: 'Manukato Oud', price: '45,000', dark: false, kind: 'lattice' },
  { name: 'Sandali za ngozi', price: '28,000', dark: true, kind: 'diamond' },
] as const

function Tile({ dark, kind }: { dark: boolean; kind: 'lattice' | 'diamond' }) {
  return (
    <div className={`relative aspect-square overflow-hidden ${dark ? 'bg-[#0e0e0e] text-white' : 'bg-[#ecebe8] text-[#0e0e0e]'}`}>
      {kind === 'lattice' ? (
        <Lattice size={22} stroke="currentColor" opacity={0.45} />
      ) : (
        <div className="absolute inset-0 flex flex-col justify-around py-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <DiamondRow key={i} className="opacity-60" />
          ))}
        </div>
      )}
    </div>
  )
}

function PhoneScreen() {
  const t = en
  return (
    <div className="h-full rounded-t-[130px] rounded-b-[18px] bg-white px-3 pt-12 text-[#0e0e0e]">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0e0e0e] font-display text-[15px] text-white">Z</span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold">Zuri Fashion</p>
          <p className="text-[9px] text-[#6b6b6b]">rizk.tz/zuri-fashion</p>
        </div>
      </div>
      <div className="mt-3 flex gap-1.5">
        <span className="rounded-full bg-[#0e0e0e] px-2.5 py-1 text-[9px] font-semibold text-white">{t('Zote', 'All')}</span>
        <span className="rounded-full border border-black/10 px-2.5 py-1 text-[9px] font-semibold">{t('Mpya', 'New')}</span>
        <span className="rounded-full border border-black/10 px-2.5 py-1 text-[9px] font-semibold">{t('Punguzo', 'Sale')}</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {TILES.map((p) => (
          <div key={p.name} className="overflow-hidden rounded-xl border border-black/8">
            <Tile dark={p.dark} kind={p.kind} />
            <div className="px-2 py-1.5">
              <p className="truncate text-[10px] font-semibold">{p.name}</p>
              <p className="text-[10px]">TSh {p.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- Strip ---------- */

function Strip() {
  const items = CATEGORIES.filter((c) => c.id !== 'other').map((c) => c.en)
  const row = [...items, ...items]
  return (
    <div className="mt-3 overflow-hidden rounded-[22px] bg-white/60 py-6 md:mt-5">
      <div className="flex w-max animate-[marquee_45s_linear_infinite] items-center gap-10 motion-reduce:animate-none">
        {[...row, ...row].map((c, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-[30px] whitespace-nowrap text-[#0e0e0e]/45 md:text-[36px]">
            {c}
            <Rosette size={12} className="text-[#0e0e0e]/35 [--rosette-hole:#f6f6f4]" />
          </span>
        ))}
      </div>
    </div>
  )
}

/* ---------- How it works ---------- */

function Steps() {
  const t = en
  const steps = [
    [Store, t('Fungua duka', 'Open your shop'), t('Jina, link na WhatsApp yako. Weka Lipa Namba na maeneo ya delivery.', 'Your name, link and WhatsApp. Add your Lipa Namba and delivery areas.')],
    [Package, t('Weka bidhaa', 'Add products'), t('Piga picha kwa simu, weka bei na idadi. Picha zinapunguzwa ili wateja watumie bando kidogo.', 'Snap a photo, set price and stock. Photos are shrunk so buyers spend less data.')],
    [Link2, t('Shiriki na uuze', 'Share and sell'), t('Weka link kwenye bio ya Instagram, TikTok na status ya WhatsApp.', 'Put the link in your Instagram and TikTok bio and your WhatsApp status.')],
  ] as const
  return (
    <Section id="how">
      <div className="grid gap-6 md:grid-cols-[1fr_1.4fr] md:items-end">
        <div>
          <Eyebrow>{t('Inavyofanya kazi', 'How it works')}</Eyebrow>
          <Display className="mt-5">{t('Hatua tatu hadi mauzo ya kwanza.', 'Three steps to your first sale.')}</Display>
        </div>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-5">
        {steps.map(([Icon, title, body], i) => (
          <Panel key={title} className="p-6 md:p-8">
            <div className="flex items-start justify-between">
              <Arch className="h-16 w-12" frame={false}>
                <div className="flex h-full items-end justify-center bg-[#0e0e0e] pb-3 text-white">
                  <Icon size={20} />
                </div>
              </Arch>
              <span className="font-display text-[56px] leading-none text-[#0e0e0e]/15">0{i + 1}</span>
            </div>
            <h3 className="mt-8 font-display text-[32px] leading-none">{title}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a4a]">{body}</p>
          </Panel>
        ))}
      </div>
    </Section>
  )
}

/* ---------- Payments ---------- */

function Payments() {
  const t = en
  return (
    <Section id="pay">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5">
        <Panel className="p-6 md:p-12">
          <Eyebrow>{t('Malipo', 'Payments')}</Eyebrow>
          <Display className="mt-5">{t('Kila shilingi inaenda kwako.', 'Every shilling goes to you.')}</Display>
          <p className="mt-5 text-[16px] leading-relaxed text-[#4a4a4a]">
            {t(
              'Mteja analipa Lipa Namba yako moja kwa moja, kisha anabandika SMS ya malipo. RIZK inakagua kiasi, jina na namba ya muamala, na haikubali muamala uliotumika kwenye oda nyingine. Wewe unathibitisha kwa kubofya mara moja.',
              'The buyer pays your Lipa Namba, then pastes the payment confirmation SMS. RIZK checks the amount, the name and the transaction ID, and refuses one already used on another order. You confirm with one tap.',
            )}
          </p>
          <ul className="mt-8 divide-y divide-black/10 border-y border-black/10">
            {[
              [Smartphone, t('Lipa Namba yako, na ukaguzi wa SMS', 'Your own Lipa Namba, with an SMS check')],
              [Banknote, t('Cash wakati wa kupokea, ukitaka', 'Cash on delivery, if you want it')],
              [ShieldCheck, t('RIZK haishiki pesa yako hata siku moja', 'RIZK never holds your money')],
            ].map(([Icon, label]) => {
              const I = Icon as typeof Smartphone
              return (
                <li key={label as string} className="flex items-center gap-3 py-3.5 text-[15px]">
                  <I size={18} /> {label as string}
                </li>
              )
            })}
          </ul>
        </Panel>
        <div className="relative overflow-hidden rounded-[28px] bg-[#0e0e0e] p-6 text-white md:p-12">
          <Lattice size={52} stroke="#fff" opacity={0.08} />
          <div className="relative">
            <p className="text-[13px] tracking-[0.08em] text-white/50 uppercase">{t('SMS ya mteja', 'Buyer’s SMS')}</p>
            <p className="mt-3 rounded-[18px] border border-white/15 bg-white/5 px-5 py-4 font-mono text-[13px] leading-relaxed text-white/85">
              QK48ZX91 Imethibitishwa. Tsh63,000.00 imelipwa kwa ZURI FASHION tarehe 6/11/26 saa 4:12 PM.
            </p>
            <div className="mt-6 space-y-0 divide-y divide-white/10">
              {[
                t('Kiasi kinalingana na oda', 'Amount matches the order'),
                t('Jina ni la duka lako', 'Name is your shop’s'),
                t('Namba ya muamala haijatumika', 'Transaction ID never used before'),
              ].map((x) => (
                <p key={x} className="flex items-center gap-3 py-3.5 text-[15px]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#0e0e0e]">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  {x}
                </p>
              ))}
            </div>
            <div className="mt-6 rounded-[16px] bg-white py-4 text-center text-[15px] font-semibold text-[#0e0e0e]">{t('Nimepokea malipo', 'Payment received')}</div>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ---------- Orders ---------- */

function Orders() {
  const t = en
  const statuses = [t('Imepokelewa', 'Received'), t('Imethibitishwa', 'Confirmed'), t('Njiani', 'On the way'), t('Imefika', 'Delivered')]
  return (
    <Section>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr] md:gap-5">
        <Panel className="order-2 p-6 md:order-1 md:p-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-display text-[32px] leading-none">Baraka Mollel</p>
              <p className="mt-1 text-sm text-[#6b6b6b]">+255 713 456 789</p>
            </div>
            <span className="rounded-full border border-black/15 px-3 py-1 font-mono text-xs">#8UU3RE</span>
          </div>
          <p className="mt-4 flex items-center gap-2 text-[15px]">
            <MapPin size={16} /> <b>Mikocheni</b> · {t('karibu na Shell', 'near the Shell station')}
          </p>
          <div className="mt-7 flex items-center">
            {statuses.map((s, i) => (
              <div key={s} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full ${i < 3 ? 'bg-[#0e0e0e] text-white' : 'border border-black/20 text-[#6b6b6b]'}`}>
                    {i < 2 ? <Check size={15} strokeWidth={3} /> : <span className="text-xs font-semibold">{i + 1}</span>}
                  </span>
                  <span className="w-16 text-center text-[11px] text-[#6b6b6b]">{s}</span>
                </div>
                {i < statuses.length - 1 && <div className={`mx-1 mb-5 h-px flex-1 ${i < 2 ? 'bg-[#0e0e0e]' : 'bg-black/15'}`} />}
              </div>
            ))}
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3">
            <div className="rounded-[14px] border border-black/15 py-3.5 text-center text-sm font-semibold">{t('Piga', 'Call')}</div>
            <div className="flex items-center justify-center gap-2 rounded-[14px] bg-[#0e0e0e] py-3.5 text-center text-sm font-semibold text-white">
              <MessageCircle size={16} /> WhatsApp
            </div>
          </div>
        </Panel>
        <Panel className="order-1 p-6 md:order-2 md:p-12">
          <Eyebrow>{t('Oda', 'Orders')}</Eyebrow>
          <Display className="mt-5">{t('Oda kamili. Bila kuuliza mara kumi.', 'Complete orders. No ten questions.')}</Display>
          <p className="mt-5 text-[16px] leading-relaxed text-[#4a4a4a]">
            {t(
              'Kila oda inakuja na jina, namba, eneo, alama ya karibu na bidhaa zote. Mteja anapata ukurasa wa kufuatilia oda yake, na kitufe cha kukutumia oda kwa WhatsApp. Stock inapungua yenyewe ukithibitisha.',
              'Every order comes with the name, number, area, a nearby landmark and every item. The buyer gets a page to follow the order and a button to send it to you on WhatsApp. Stock goes down by itself when you confirm.',
            )}
          </p>
        </Panel>
      </div>
    </Section>
  )
}

/* ---------- Dashboard ---------- */

function Dashboard() {
  const t = en
  const bars = [22, 38, 30, 55, 42, 68, 90]
  return (
    <Section>
      <div className="text-center">
        <Eyebrow>{t('Dashibodi', 'Dashboard')}</Eyebrow>
        <Display className="mx-auto mt-5 max-w-[760px]">{t('Biashara yako, kwa namba.', 'Your business, in numbers.')}</Display>
        <p className="mx-auto mt-5 max-w-[560px] text-[16px] text-[#4a4a4a]">
          {t('Mauzo, oda, wageni na bidhaa zinazopendwa. Pia unajua wateja wametoka Instagram, TikTok au WhatsApp.', 'Sales, orders, visitors and your best products. You also see whether buyers came from Instagram, TikTok or WhatsApp.')}
        </p>
      </div>
      <Panel className="mx-auto mt-10 max-w-[960px] overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {[
            [t('Mauzo', 'Sales'), 'TSh 1.2M', '+22%'],
            [t('Oda', 'Orders'), '38', '+12%'],
            [t('Wageni', 'Visitors'), '1,240', '+31%'],
            [t('Wanaonunua', 'Conversion'), '3.1%', '+0.4%'],
          ].map(([l, v, d], i) => (
            <div key={l} className={`border-black/10 p-5 md:p-6 ${i % 2 === 0 ? 'border-r' : ''} ${i < 2 ? 'border-b md:border-b-0' : ''} ${i === 1 ? 'md:border-r' : ''}`}>
              <p className="text-[13px] text-[#6b6b6b]">{l}</p>
              <p className="mt-1 font-display text-[34px] leading-none md:text-[40px]">{v}</p>
              <span className="mt-3 inline-block rounded-full border border-black/15 px-2 py-0.5 text-xs font-semibold">{d}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-black/10 p-6">
          <div className="flex h-36 items-end gap-2 md:gap-4">
            {bars.map((h, i) => (
              <span key={i} className="flex-1 rounded-t-full" style={{ height: `${h}%`, background: i === bars.length - 1 ? INK : '#e6e5e2' }} />
            ))}
          </div>
        </div>
      </Panel>
      <p className="mt-3 text-center text-xs text-[#6b6b6b]">{t('Mfano wa namba, si data halisi.', 'Example numbers, not real data.')}</p>
    </Section>
  )
}

/* ---------- Everything else ---------- */

function Everything() {
  const t = en
  const items = [
    [Link2, t('Link yako', 'Your own link'), 'rizk.tz/dukalako'],
    [Package, t('Bidhaa na stock', 'Products and stock'), t('Picha 6, bei, punguzo, idadi', '6 photos, price, sale, stock')],
    [Smartphone, 'Lipa Namba', t('Ukaguzi wa SMS ya malipo', 'Payment SMS check')],
    [Banknote, t('Cash ukipokea', 'Cash on delivery'), t('Washa au zima', 'Turn on or off')],
    [MapPin, 'Delivery', t('Maeneo na bei zako', 'Your areas and fees')],
    [ReceiptText, t('Oda', 'Orders'), t('Hatua kwa hatua', 'Step by step')],
    [MessageCircle, 'WhatsApp', t('Oda na maswali moja kwa moja', 'Orders and questions in your chats')],
    [BarChart3, t('Takwimu', 'Analytics'), t('Wageni, mauzo, vyanzo', 'Visitors, sales, sources')],
  ] as const
  return (
    <Section>
      <Eyebrow>{t('Na kila kitu kingine', 'And everything else')}</Eyebrow>
      <Display className="mt-5 max-w-[760px]">{t('Zana za duka kubwa, kwenye simu yako.', 'Big-store tools, on your phone.')}</Display>
      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        {items.map(([Icon, title, sub]) => (
          <Panel key={title} className="p-5 md:p-6">
            <Icon size={22} />
            <p className="mt-6 text-[16px] font-semibold">{title}</p>
            <p className="mt-1 text-[13px] text-[#6b6b6b]">{sub}</p>
          </Panel>
        ))}
      </div>
      <p className="mt-5 flex items-center gap-2 text-sm text-[#6b6b6b]">
        <Rosette size={12} className="text-[#0e0e0e] [--rosette-hole:#efeeeb]" />
        {t('Inakuja hivi karibuni: Rizko, msaidizi wa AI anayejibu wateja, na kura za bidhaa bora za wiki.', 'Coming soon: Rizko, an AI assistant that answers buyers, and weekly best-product votes.')}
      </p>
    </Section>
  )
}

/* ---------- Pricing ---------- */

function Pricing({ start }: { start: string }) {
  const t = en
  return (
    <Section id="pricing">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5">
        <Panel className="p-6 md:p-12">
          <Eyebrow>{t('Bei', 'Pricing')}</Eyebrow>
          <Display className="mt-5">{t('Anza bure. Leo.', 'Start free. Today.')}</Display>
          <p className="mt-5 text-[16px] text-[#4a4a4a]">{t('Hakuna kamisheni kwenye mauzo yako. Tutatangaza vifurushi vya kulipia mapema kabla havijaanza.', 'No commission on your sales. We will announce paid plans well before they start.')}</p>
        </Panel>
        <div className="relative overflow-hidden rounded-[28px] bg-[#0e0e0e] p-6 text-white md:p-12">
          <Lattice size={52} stroke="#fff" opacity={0.08} />
          <div className="relative">
            <p className="text-[15px] text-white/60">{t('Wauzaji wa kwanza', 'Early sellers')}</p>
            <p className="mt-2 font-display text-[72px] leading-none">
              TSh 0 <span className="font-sans text-[16px] text-white/50">/ {t('mwezi', 'month')}</span>
            </p>
            <ul className="mt-8 divide-y divide-white/10 border-y border-white/10">
              {[
                t('Duka lako kwenye rizk.tz/jina', 'Your shop at rizk.tz/name'),
                t('Lipa Namba na cash wakati wa kupokea', 'Lipa Namba and cash on delivery'),
                t('Oda, stock na delivery', 'Orders, stock and delivery'),
                t('Dashibodi na takwimu', 'Dashboard and analytics'),
                t('Kiswahili na Kiingereza', 'Swahili and English'),
              ].map((x) => (
                <li key={x} className="flex items-center gap-3 py-3 text-[15px]">
                  <Check size={16} strokeWidth={3} /> {x}
                </li>
              ))}
            </ul>
            <Link to={start} className="mt-8 flex h-14 items-center justify-center gap-2 rounded-[16px] bg-white text-[16px] font-semibold text-[#0e0e0e]">
              {t('Anza bure', 'Start free')} <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ---------- FAQ ---------- */

function Faq() {
  const t = en
  const qs = [
    [t('RIZK inagharimu kiasi gani?', 'What does RIZK cost?'), t('Ni bure kuanza, na hatuchukui kamisheni kwenye mauzo yako. Tutatangaza vifurushi vya kulipia mapema kabla havijaanza.', 'It is free to start and we take no commission on your sales. We will announce paid plans well before they start.')],
    [t('Napokeaje pesa?', 'How do I get paid?'), t('Mteja analipa Lipa Namba au namba yako moja kwa moja, au cash akipokea mzigo. Pesa haipiti kwetu.', 'The buyer pays your Lipa Namba or cash on delivery, the way they already pay sellers today. The money never passes through us.')],
    [t('Nitajuaje kama mteja amelipa kweli?', 'How do I know a buyer really paid?'), t('Mteja anabandika SMS ya malipo. Tunakagua kiasi, jina na namba ya muamala, na tunakataa muamala uliotumika tayari. Bado angalia simu yako kabla ya kuthibitisha.', 'The buyer pastes the payment SMS. We check the amount, name and transaction ID and refuse one already used. Still check your phone before you confirm.')],
    [t('Nahitaji website au programmer?', 'Do I need a website or a developer?'), t('Hapana. Unafungua duka kwenye simu yako kwa dakika chache, na unapata link ya kushiriki.', 'No. You open the shop on your phone in a few minutes and get a link to share.')],
    [t('Nani anafanya delivery?', 'Who does the delivery?'), t('Kwa sasa wewe, na boda yako. Unaweka maeneo yako na bei ya delivery kila eneo, na mteja anachagua wakati wa kuagiza.', 'For now you do, with your own boda. You set your areas and a fee for each, and the buyer picks one when ordering.')],
    [t('Naweza kuuza nini?', 'What can I sell?'), t('Nguo, viatu, vipodozi, manukato, elektroniki, chakula na zaidi. Bidhaa haramu haziruhusiwi.', 'Clothes, shoes, cosmetics, perfumes, electronics, food and more. Illegal goods are not allowed.')],
  ]
  return (
    <Section id="faq">
      <div className="grid gap-6 md:grid-cols-[1fr_1.5fr] md:gap-5">
        <div className="md:pt-4">
          <Eyebrow>{t('Maswali', 'Questions')}</Eyebrow>
          <Display className="mt-5">{t('Vizuri kujua.', 'Good to know.')}</Display>
        </div>
        <Panel className="divide-y divide-black/10 px-6 md:px-8">
          {qs.map(([q, a]) => (
            <details key={q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-medium">
                {q}
                <ChevronDown size={18} className="shrink-0 transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a4a]">{a}</p>
            </details>
          ))}
        </Panel>
      </div>
    </Section>
  )
}

/* ---------- Closing ---------- */

function Closing({ start, startLabel }: { start: string; startLabel: string }) {
  const t = en
  return (
    <Section className="pb-10">
      <div className="relative overflow-hidden rounded-[28px] bg-[#0e0e0e] px-6 py-16 text-center text-white md:py-24">
        <Lattice size={52} stroke="#fff" opacity={0.1} />
        <div className="relative">
          <Rosette size={22} className="mx-auto [--rosette-hole:#0e0e0e]" />
          <h2 className="mx-auto mt-6 max-w-[820px] font-display text-[48px] leading-[0.95] md:text-[84px]">
            Risk to get <em>Rizk.</em>
          </h2>
          <p className="mt-5 text-[17px] text-white/65">{t('Wateja wako tayari wako kwenye simu. Fungua duka lako leo.', 'Your buyers are already on their phones. Open your shop today.')}</p>
          <Link to={start} className="mt-9 inline-flex h-14 items-center gap-2 rounded-[16px] bg-white px-7 text-[16px] font-semibold text-[#0e0e0e]">
            {startLabel} <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </Section>
  )
}
