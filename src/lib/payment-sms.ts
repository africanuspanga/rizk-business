/**
 * Reads a pasted mobile money confirmation SMS. Network formats differ and we
 * have no real samples yet, so this is deliberately loose: it pulls out what it
 * can and the merchant always makes the final call.
 */
export type ParsedSms = { txnId: string | null; amount: number | null; name: string | null }

const TXN_AFTER_KEYWORD =
  /(?:muamala|kumbukumbu|utambulisho|ref(?:erence)?|txn ?id|trans(?:action)? ?id|transaction|tid)\s*(?:no\.?|namba|number|#)?\s*[:.]?\s*([A-Z0-9][A-Z0-9.]{5,24})/i
const LEADING_CODE = /^\s*([A-Z0-9]{8,14})\b/
const ANY_CODE = /\b(?=[A-Z0-9]*\d)(?=[A-Z0-9]*[A-Z])[A-Z0-9]{8,14}\b/
const AMOUNT = /(?:tsh|tzs|sh)\.?\s*([\d,]+(?:\.\d{1,2})?)/i
const NAME_AFTER = /\b(?:kwa|to|kutoka kwa|from)\s+([A-Z][A-Za-z'.-]+(?:\s+[A-Z][A-Za-z'.-]+){0,4})/

export function parsePaymentSms(raw: string): ParsedSms {
  const text = raw.replace(/\s+/g, ' ').trim()
  const txnId =
    text.match(TXN_AFTER_KEYWORD)?.[1] ?? text.match(LEADING_CODE)?.[1] ?? text.match(ANY_CODE)?.[0] ?? null
  const amountRaw = text.match(AMOUNT)?.[1]
  const amount = amountRaw ? Math.round(Number(amountRaw.replace(/,/g, ''))) : null
  const name = text.match(NAME_AFTER)?.[1]?.trim() ?? null
  return {
    txnId: txnId ? txnId.replace(/\.$/, '').toUpperCase() : null,
    amount: Number.isFinite(amount) ? amount : null,
    name,
  }
}

const words = (s: string) =>
  s
    .toUpperCase()
    .replace(/[^A-Z ]/g, ' ')
    .split(' ')
    .filter((w) => w.length > 1)

/** True when at least one real word of the merchant's Lipa name appears in the SMS name. */
export function namesMatch(smsName: string | null, lipaName: string) {
  if (!smsName || !lipaName) return null
  const want = new Set(words(lipaName))
  return words(smsName).some((w) => want.has(w))
}

export type PaymentCheck = {
  parsed: ParsedSms
  amount: 'ok' | 'low' | 'unknown'
  name: 'ok' | 'mismatch' | 'unknown'
  txn: 'ok' | 'reused' | 'unknown'
}
