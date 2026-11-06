import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ErrorText, Field, Page, TopBar } from '#/components/ui'
import { checkSlug, createShop } from '#/lib/api/merchant'
import { CATEGORIES, slugify } from '#/lib/format'
import { useLang, useT } from '#/lib/i18n'

export const Route = createFileRoute('/onboard')({
  beforeLoad: ({ context }) => {
    if (!context.session.user) throw redirect({ to: '/signup' })
    if (context.session.shop) throw redirect({ to: '/app' })
  },
  component: Onboard,
})

function Onboard() {
  const t = useT()
  const lang = useLang()
  const router = useRouter()
  const { session } = Route.useRouteContext()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [category, setCategory] = useState('fashion')
  const [whatsapp, setWhatsapp] = useState(session.user?.phone ?? '')
  const [free, setFree] = useState<boolean | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name))
  }, [name, slugTouched])

  useEffect(() => {
    if (slug.length < 3) return setFree(null)
    const id = setTimeout(async () => setFree((await checkSlug({ data: { slug } })).free), 350)
    return () => clearTimeout(id)
  }, [slug])

  return (
    <Page>
      <TopBar title={t('Duka lako', 'Your shop')} sub={t('Hatua ya 2 kati ya 2', 'Step 2 of 2')} />
      <form
        className="space-y-5"
        onSubmit={async (e) => {
          e.preventDefault()
          setBusy(true)
          setError('')
          const res = await createShop({ data: { name, slug, category, whatsapp } })
          setBusy(false)
          if ('error' in res) {
            return setError(
              res.error === 'name'
                ? t('Andika jina la duka.', 'Enter a shop name.')
                : t('Link hii imeshachukuliwa. Jaribu nyingine.', 'That link is taken. Try another.'),
            )
          }
          await router.invalidate()
          router.navigate({ to: '/app' })
        }}
      >
        <div className="card space-y-4 p-5">
          <Field label={t('Jina la duka', 'Shop name')}>
            <input className="input" placeholder="Zuri Fashion" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field
            label={t('Link ya duka', 'Shop link')}
            hint={
              free === false
                ? t('Imeshachukuliwa', 'Already taken')
                : free
                  ? t('Inapatikana ✓', 'Available ✓')
                  : t('Herufi ndogo, namba na -', 'Lowercase letters, numbers and -')
            }
          >
            <div className="input flex items-center gap-1 focus-within:border-ink">
              <span className="text-muted">rizk.tz/</span>
              <input
                className="min-w-0 flex-1 bg-transparent outline-none"
                value={slug}
                autoCapitalize="none"
                onChange={(e) => {
                  setSlugTouched(true)
                  setSlug(slugify(e.target.value))
                }}
              />
            </div>
          </Field>
          <Field label={t('WhatsApp ya duka', 'Shop WhatsApp')} hint={t('Wateja watawasiliana nawe hapa', 'Buyers reach you here')}>
            <input className="input" type="tel" inputMode="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </Field>
        </div>

        <div>
          <p className="mb-3 ml-1 text-[15px] font-bold">{t('Unauza nini?', 'What do you sell?')}</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button key={c.id} type="button" className="chip" data-active={category === c.id} onClick={() => setCategory(c.id)}>
                {c[lang]}
              </button>
            ))}
          </div>
        </div>

        <ErrorText>{error}</ErrorText>
        <button className="btn w-full" disabled={busy || free === false}>
          {busy ? t('Tunafungua...', 'Opening...') : t('Fungua duka', 'Open my shop')}
        </button>
      </form>
    </Page>
  )
}
