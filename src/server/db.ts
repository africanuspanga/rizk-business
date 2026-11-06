import { env } from 'cloudflare:workers'

export const db = () => env.DB
export const media = () => env.MEDIA

export function newId(len = 16) {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'
  const bytes = crypto.getRandomValues(new Uint8Array(len))
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
}

/** Short order code buyers can read out on the phone: no 0/O/1/I. */
export function orderCode() {
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
}

export const now = () => Date.now()

export async function all<T>(sql: string, ...params: unknown[]) {
  const res = await db().prepare(sql).bind(...params).all<T>()
  return res.results
}

export async function first<T>(sql: string, ...params: unknown[]) {
  return db().prepare(sql).bind(...params).first<T>()
}

export async function run(sql: string, ...params: unknown[]) {
  return db().prepare(sql).bind(...params).run()
}
