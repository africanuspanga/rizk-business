import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { getSession } from '#/lib/api/session'
import { LangProvider } from '#/lib/i18n'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  beforeLoad: async () => ({ session: await getSession() }),
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { name: 'theme-color', content: '#f6f1ec' },
      { title: 'RIZK · Risk to get Rizk' },
      { name: 'description', content: 'Fungua duka lako la mtandaoni kwa dakika 5. Link moja kwa Instagram, TikTok na WhatsApp.' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  component: Root,
  shellComponent: RootDocument,
})

function Root() {
  const { session } = Route.useRouteContext()
  return (
    <LangProvider value={session.lang}>
      <Outlet />
    </LangProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sw">
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere]">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
