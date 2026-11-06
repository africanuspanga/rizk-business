import { deleteCookie, getCookie, setCookie } from '@tanstack/react-start/server'
import { first, newId, now, run } from './db'

const COOKIE = 'rizk_sid'
const SESSION_DAYS = 60
const ITERATIONS = 100_000

const b64 = (buf: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
const unb64 = (s: string) => {
  const bin = atob(s)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function derive(password: string, salt: Uint8Array<ArrayBuffer>) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS }, key, 256)
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return `pbkdf2$${ITERATIONS}$${b64(salt)}$${b64(await derive(password, salt))}`
}

export async function verifyPassword(password: string, stored: string) {
  const [, , salt, hash] = stored.split('$')
  if (!salt || !hash) return false
  const got = new Uint8Array(await derive(password, unb64(salt)))
  const want = unb64(hash)
  if (got.length !== want.length) return false
  let diff = 0
  for (let i = 0; i < got.length; i++) diff |= got[i] ^ want[i]
  return diff === 0
}

export async function startSession(userId: string) {
  const token = newId(32)
  const expires = now() + SESSION_DAYS * 86400_000
  await run('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)', token, userId, expires)
  setCookie(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 86400,
  })
}

export async function endSession() {
  const token = getCookie(COOKIE)
  if (token) await run('DELETE FROM sessions WHERE token = ?', token)
  deleteCookie(COOKIE, { path: '/' })
}

export type SessionUser = { id: string; phone: string; name: string; is_admin: number }

export async function currentUser(): Promise<SessionUser | null> {
  const token = getCookie(COOKIE)
  if (!token) return null
  return first<SessionUser>(
    `SELECT u.id, u.phone, u.name, u.is_admin FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = ? AND s.expires_at > ?`,
    token,
    now(),
  )
}

export async function requireUser() {
  const user = await currentUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  return user
}

export type OwnShop = { id: string; slug: string; name: string }

export async function requireShop() {
  const user = await requireUser()
  const shop = await first<OwnShop>('SELECT id, slug, name FROM shops WHERE owner_id = ? LIMIT 1', user.id)
  if (!shop) throw new Error('NO_SHOP')
  return { user, shop }
}
