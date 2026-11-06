import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import { currentUser, endSession, hashPassword, startSession, verifyPassword } from '#/server/auth'
import { first, newId, now, run } from '#/server/db'
import { normalizePhone } from '#/lib/format'
import type { Lang } from '#/lib/i18n'

export const getSession = createServerFn({ method: 'GET' }).handler(async () => {
  const lang: Lang = getCookie('rizk_lang') === 'en' ? 'en' : 'sw'
  const user = await currentUser()
  const shop = user
    ? await first<{ id: string; slug: string; name: string; logo_key: string | null }>(
        'SELECT id, slug, name, logo_key FROM shops WHERE owner_id = ? LIMIT 1',
        user.id,
      )
    : null
  return { lang, user, shop }
})

export const setLang = createServerFn({ method: 'POST' })
  .validator((d: { lang: Lang }) => ({ lang: d.lang === 'en' ? 'en' : 'sw' }))
  .handler(async ({ data }) => {
    setCookie('rizk_lang', data.lang, { path: '/', maxAge: 365 * 86400, sameSite: 'lax' })
    return data.lang
  })

export const signup = createServerFn({ method: 'POST' })
  .validator((d: { name: string; phone: string; password: string }) => ({
    name: String(d.name ?? '').trim().slice(0, 60),
    phone: normalizePhone(String(d.phone ?? '')),
    password: String(d.password ?? ''),
  }))
  .handler(async ({ data }) => {
    if (!data.name) return { error: 'name' as const }
    if (!data.phone) return { error: 'phone' as const }
    if (data.password.length < 6) return { error: 'password' as const }
    const exists = await first('SELECT id FROM users WHERE phone = ?', data.phone)
    if (exists) return { error: 'exists' as const }
    const id = newId()
    await run(
      'INSERT INTO users (id, phone, name, pass_hash, created_at) VALUES (?, ?, ?, ?, ?)',
      id,
      data.phone,
      data.name,
      await hashPassword(data.password),
      now(),
    )
    await startSession(id)
    return { ok: true as const }
  })

export const login = createServerFn({ method: 'POST' })
  .validator((d: { phone: string; password: string }) => ({
    phone: normalizePhone(String(d.phone ?? '')),
    password: String(d.password ?? ''),
  }))
  .handler(async ({ data }) => {
    const user = await first<{ id: string; pass_hash: string }>(
      'SELECT id, pass_hash FROM users WHERE phone = ?',
      data.phone,
    )
    if (!user || !(await verifyPassword(data.password, user.pass_hash))) return { error: 'invalid' as const }
    await startSession(user.id)
    return { ok: true as const }
  })

export const logout = createServerFn({ method: 'POST' }).handler(async () => {
  await endSession()
  return { ok: true }
})
