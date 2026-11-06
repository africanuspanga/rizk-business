import { Link, Outlet, createFileRoute, redirect, useLocation } from '@tanstack/react-router'
import { ExternalLink, Home, Package, Plus, ReceiptText, Store } from 'lucide-react'
import { Img } from '#/components/ui'
import { useT } from '#/lib/i18n'

export const Route = createFileRoute('/app')({
  beforeLoad: ({ context }) => {
    if (!context.session.user) throw redirect({ to: '/login' })
    if (!context.session.shop) throw redirect({ to: '/onboard' })
    return { shop: context.session.shop, user: context.session.user }
  },
  component: AppLayout,
})

function useTabs() {
  const t = useT()
  return [
    { to: '/app', icon: Home, label: t('Dashibodi', 'Dashboard'), match: (p: string) => p === '/app' || p === '/app/' },
    { to: '/app/products', icon: Package, label: t('Bidhaa', 'Products'), match: (p: string) => p.startsWith('/app/products') },
    { to: '/app/orders', icon: ReceiptText, label: t('Oda', 'Orders'), match: (p: string) => p.startsWith('/app/orders') },
    { to: '/app/shop', icon: Store, label: t('Duka', 'Shop'), match: (p: string) => p.startsWith('/app/shop') },
  ]
}

function AppLayout() {
  return (
    <div className="app-shell md:flex">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

function Sidebar() {
  const t = useT()
  const tabs = useTabs()
  const { shop } = Route.useRouteContext()
  const path = useLocation({ select: (l) => l.pathname })
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-[#ebe9e6] bg-white px-4 py-6 md:flex">
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-sm font-extrabold text-white">R</span>
        <span className="text-[20px] font-extrabold tracking-tight">RIZK</span>
      </div>
      <nav className="space-y-1">
        {tabs.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] ${tab.match(path) ? 'bg-[#f1f0ee] font-bold' : 'text-ink/75 hover:bg-[#f7f6f4]'}`}
          >
            <tab.icon size={19} /> {tab.label}
          </Link>
        ))}
      </nav>
      <Link to="/app/products/new" className="btn btn-sm mt-6">
        <Plus size={17} /> {t('Ongeza bidhaa', 'Add product')}
      </Link>
      <a href={`/${shop.slug}`} target="_blank" rel="noreferrer" className="mt-auto flex items-center gap-3 rounded-xl border border-[#ebe9e6] p-3">
        <Img k={shop.logo_key} alt={shop.name} className="h-9 w-9 rounded-full" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold">{shop.name}</span>
          <span className="block truncate text-xs text-muted">rizk.tz/{shop.slug}</span>
        </span>
        <ExternalLink size={15} className="text-muted" />
      </a>
    </aside>
  )
}

function BottomNav() {
  const t = useT()
  const tabs = useTabs()
  const path = useLocation({ select: (l) => l.pathname })
  const items = [tabs[0], tabs[1], null, tabs[2], tabs[3]]
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#ebe9e6] bg-white/95 pb-[max(6px,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-[520px] items-center justify-around px-2 pt-2">
        {items.map((tab) =>
          tab ? (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex w-16 flex-col items-center gap-1 text-[11px] ${tab.match(path) ? 'font-bold text-ink' : 'text-muted'}`}
            >
              <tab.icon size={22} strokeWidth={tab.match(path) ? 2.4 : 1.8} />
              {tab.label}
            </Link>
          ) : (
            <Link
              key="add"
              to="/app/products/new"
              aria-label={t('Ongeza bidhaa', 'Add product')}
              className="-mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white shadow-[0_8px_20px_rgba(31,27,24,0.25)]"
            >
              <Plus size={26} />
            </Link>
          ),
        )}
      </div>
    </nav>
  )
}
