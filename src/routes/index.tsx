import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, BarChart3, MessageCircle, ShieldCheck, Store } from 'lucide-react'
import { LangSwitch, Page } from '#/components/ui'
import { useT } from '#/lib/i18n'

export const Route = createFileRoute('/')({ component: Landing })

function Landing() {
  const t = useT()
  const { session } = Route.useRouteContext()
  const signedIn = !!session.user
  const steps = [
    { icon: Store, bg: 'bg-peach', title: t('Fungua duka', 'Open your shop'), sub: t('Dakika 5, bure', '5 minutes, free') },
    { icon: MessageCircle, bg: 'bg-lime', title: t('Shiriki link', 'Share your link'), sub: t('Instagram, TikTok, WhatsApp', 'Instagram, TikTok, WhatsApp') },
    { icon: ShieldCheck, bg: 'bg-lilac', title: t('Pokea oda', 'Get orders'), sub: t('Lipa Namba au cash', 'Lipa Namba or cash') },
  ]
  return (
    <Page>
      <header className="flex items-center justify-between pt-2">
        <span className="text-[22px] font-extrabold tracking-tight">RIZK</span>
        <div className="flex gap-2">
          <LangSwitch />
          {!signedIn && (
            <Link to="/login" className="btn btn-soft btn-sm">
              {t('Ingia', 'Log in')}
            </Link>
          )}
        </div>
      </header>

      <section className="card mt-6 overflow-hidden">
        <div className="bg-peach px-6 pt-8 pb-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-sm font-semibold">
            <span className="h-2.5 w-2.5 rounded-full bg-ok" /> {t('Bure kwa wauzaji wa kwanza', 'Free for early sellers')}
          </span>
          <h1 className="mt-5 text-[34px] leading-[1.08] font-extrabold tracking-tight">
            {t('Duka lako. Link yako. Riziki yako.', 'Your shop. Your link. Your business.')}
          </h1>
          <p className="mt-3 text-[16px] text-ink/70">
            {t(
              'Weka bidhaa zako, shiriki link moja, na upokee oda zenye jina, namba na eneo la mteja. Bila DM nyingi.',
              'Add your products, share one link, and get orders with the buyer’s name, number and area. No more endless DMs.',
            )}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3 px-6 py-5">
          <span className="text-[15px] text-muted">rizk.tz/<b className="text-ink">dukalako</b></span>
          <Link
            to={signedIn ? (session.shop ? '/app' : '/onboard') : '/signup'}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white"
            aria-label={t('Anza', 'Start')}
          >
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <h2 className="mt-9 mb-3 text-[20px] font-extrabold tracking-tight">{t('Inavyofanya kazi', 'How it works')}</h2>
      <div className="grid grid-cols-3 gap-3">
        {steps.map((s) => (
          <div key={s.title} className={`rounded-[24px] ${s.bg} p-4`}>
            <s.icon size={26} />
            <p className="mt-6 text-[15px] leading-tight font-extrabold">{s.title}</p>
            <p className="mt-1 text-xs text-ink/60">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="card mt-4 flex items-center gap-4 p-5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky">
          <BarChart3 size={22} />
        </span>
        <p className="text-[15px]">
          {t(
            'Ona watu wangapi wametembelea duka, bidhaa zipi zinapendwa na mauzo ya wiki.',
            'See how many people visited, which products they love and your weekly sales.',
          )}
        </p>
      </div>

      <Link to={signedIn ? (session.shop ? '/app' : '/onboard') : '/signup'} className="btn mt-8 w-full">
        {signedIn ? t('Endelea kwenye duka', 'Go to my shop') : t('Fungua duka lako bure', 'Open your shop free')}
      </Link>
      <p className="mt-6 text-center text-xs text-muted">© Driftmark Technologies Limited · Dar es Salaam</p>
    </Page>
  )
}
