import { Link, createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { ErrorText, Field, Page, TopBar } from '#/components/ui'
import { login } from '#/lib/api/session'
import { useT } from '#/lib/i18n'

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    if (context.session.user) throw redirect({ to: context.session.shop ? '/app' : '/onboard' })
  },
  component: Login,
})

function Login() {
  const t = useT()
  const router = useRouter()
  const [form, setForm] = useState({ phone: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  return (
    <Page>
      <TopBar back="/" title={t('Karibu tena', 'Welcome back')} sub={t('Ingia kwenye duka lako', 'Log in to your shop')} />
      <form
        className="card space-y-4 p-5"
        onSubmit={async (e) => {
          e.preventDefault()
          setBusy(true)
          setError('')
          const res = await login({ data: form })
          setBusy(false)
          if ('error' in res) return setError(t('Namba au nenosiri si sahihi.', 'Wrong phone number or password.'))
          await router.invalidate()
          router.navigate({ to: '/app' })
        }}
      >
        <Field label={t('Namba ya simu', 'Phone number')}>
          <input className="input" type="tel" inputMode="tel" autoComplete="tel" placeholder="0754 123 456" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </Field>
        <Field label={t('Nenosiri', 'Password')}>
          <input className="input" type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>
        <ErrorText>{error}</ErrorText>
        <button className="btn w-full" disabled={busy}>
          {busy ? t('Subiri...', 'Please wait...') : t('Ingia', 'Log in')}
        </button>
      </form>
      <p className="mt-6 text-center text-[15px] text-muted">
        {t('Huna akaunti?', 'No account yet?')}{' '}
        <Link to="/signup" className="font-bold text-ink underline">
          {t('Fungua duka', 'Open a shop')}
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-muted">
        {t('Umesahau nenosiri? Tuandikie WhatsApp.', 'Forgot your password? Message us on WhatsApp.')}
      </p>
    </Page>
  )
}
