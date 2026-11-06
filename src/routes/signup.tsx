import { Link, createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { ErrorText, Field, Page, TopBar } from '#/components/ui'
import { signup } from '#/lib/api/session'
import { useT } from '#/lib/i18n'

export const Route = createFileRoute('/signup')({
  beforeLoad: ({ context }) => {
    if (context.session.user) throw redirect({ to: context.session.shop ? '/app' : '/onboard' })
  },
  component: Signup,
})

function Signup() {
  const t = useT()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const errors = {
    name: t('Andika jina lako.', 'Enter your name.'),
    phone: t('Namba ya simu si sahihi. Mfano: 0754 123 456', 'That phone number looks wrong. Example: 0754 123 456'),
    password: t('Nenosiri liwe na herufi 6 au zaidi.', 'Use at least 6 characters for the password.'),
    exists: t('Namba hii ina akaunti tayari. Ingia.', 'This number already has an account. Log in.'),
  }
  return (
    <Page>
      <TopBar back="/" title={t('Fungua akaunti', 'Create account')} sub={t('Hatua ya 1 kati ya 2', 'Step 1 of 2')} />
      <form
        className="card space-y-4 p-5"
        onSubmit={async (e) => {
          e.preventDefault()
          setBusy(true)
          setError('')
          const res = await signup({ data: form })
          setBusy(false)
          if ('error' in res && res.error) return setError(errors[res.error])
          await router.invalidate()
          router.navigate({ to: '/onboard' })
        }}
      >
        <Field label={t('Jina lako', 'Your name')}>
          <input className="input" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label={t('Namba ya simu', 'Phone number')}>
          <input className="input" type="tel" inputMode="tel" autoComplete="tel" placeholder="0754 123 456" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </Field>
        <Field label={t('Nenosiri', 'Password')}>
          <input className="input" type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>
        <ErrorText>{error}</ErrorText>
        <button className="btn w-full" disabled={busy}>
          {busy ? t('Subiri...', 'Please wait...') : t('Endelea', 'Continue')}
        </button>
      </form>
      <p className="mt-6 text-center text-[15px] text-muted">
        {t('Una akaunti?', 'Have an account?')}{' '}
        <Link to="/login" className="font-bold text-ink underline">
          {t('Ingia', 'Log in')}
        </Link>
      </p>
    </Page>
  )
}
