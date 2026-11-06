import { Link, useRouter } from '@tanstack/react-router'
import { ChevronLeft, ImageIcon, Plus } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { STATUS_LABEL, imgUrl, type OrderStatus } from '#/lib/format'
import { useLang, type Lang } from '#/lib/i18n'
import { setLang } from '#/lib/api/session'

export function Page({ children, nav = false, wide = false }: { children: ReactNode; nav?: boolean; wide?: boolean }) {
  return (
    <div
      className={`mx-auto min-h-dvh w-full px-4 pt-[max(16px,env(safe-area-inset-top))] ${wide ? 'max-w-[1120px] md:px-8 md:pt-8' : 'max-w-[520px]'} ${nav ? 'pb-32 md:pb-12' : 'pb-10'}`}
    >
      {children}
    </div>
  )
}

export function TopBar({ title, sub, back, right }: { title: ReactNode; sub?: ReactNode; back?: string; right?: ReactNode }) {
  const router = useRouter()
  return (
    <header className="mb-5 flex items-start gap-3 pt-2">
      {back && (
        <button
          type="button"
          aria-label="Back"
          className="icon-btn mt-0.5"
          onClick={() => (window.history.length > 1 ? router.history.back() : router.navigate({ to: back }))}
        >
          <ChevronLeft size={20} />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="text-[28px] leading-tight font-extrabold tracking-tight">{title}</h1>
        {sub && <p className="mt-1 text-[15px] text-muted">{sub}</p>}
      </div>
      {right && <div className="flex shrink-0 gap-2">{right}</div>}
    </header>
  )
}

export function Chips<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { id: T; label: string; count?: number }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="hide-scroll -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 py-1">
      {options.map((o) => (
        <button key={o.id} type="button" className="chip" data-active={value === o.id} onClick={() => onChange(o.id)}>
          {o.label}
          {o.count ? <span className="opacity-60">{o.count}</span> : null}
        </button>
      ))}
    </div>
  )
}

export function StatusPill({ status }: { status: OrderStatus }) {
  const lang = useLang()
  const s = STATUS_LABEL[status]
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${s.tone}`}>{s[lang]}</span>
}

export function Img({ k, alt, className = '' }: { k: string | null | undefined; alt: string; className?: string }) {
  if (!k) {
    return (
      <div className={`flex items-center justify-center bg-peach/60 text-peach-deep ${className}`}>
        <ImageIcon size={28} />
      </div>
    )
  }
  return <img src={imgUrl(k)} alt={alt} loading="lazy" className={`object-cover ${className}`} />
}

export function DashedAdd({ to, title, sub }: { to: string; title: string; sub: string }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-1 rounded-[28px] border-2 border-dashed border-[#e2d6cb] px-6 py-6 text-center"
    >
      <span className="flex items-center gap-3 text-[17px] font-bold">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-peach">
          <Plus size={20} />
        </span>
        {title}
      </span>
      <span className="text-sm text-muted">{sub}</span>
    </Link>
  )
}

export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/35" onClick={onClose} />
      <div className="relative max-h-[92dvh] w-full max-w-[520px] overflow-y-auto rounded-t-[32px] bg-canvas px-4 pt-3 pb-[max(20px,env(safe-area-inset-bottom))]">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-line" />
        {children}
      </div>
    </div>
  )
}

export function LangSwitch() {
  const lang = useLang()
  const router = useRouter()
  const next: Lang = lang === 'sw' ? 'en' : 'sw'
  return (
    <button
      type="button"
      className="icon-btn text-xs font-extrabold"
      aria-label={lang === 'sw' ? 'Switch to English' : 'Badilisha kuwa Kiswahili'}
      onClick={async () => {
        await setLang({ data: { lang: next } })
        router.invalidate()
      }}
    >
      {next.toUpperCase()}
    </button>
  )
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null
  return <p className="rounded-2xl bg-[#fbe3de] px-4 py-3 text-sm font-semibold text-bad">{children}</p>
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small className="mt-1.5 ml-1 block text-xs text-muted">{hint}</small>}
    </label>
  )
}

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[20px] font-extrabold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

