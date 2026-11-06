# RIZK

Shop in bio for social sellers. Duka lako. Link yako. Riziki yako.

A seller opens a shop in two minutes, adds products from their phone and shares one link
(`rizk.tz/<shop>`) on Instagram, TikTok and WhatsApp. Buyers order with their name, phone,
delivery area and a landmark, then pay the seller's Lipa Namba (and paste the confirmation SMS)
or pay cash on delivery. RIZK never holds money.

## What works today (MVP)

- Sign up with phone + password, open a shop with its own link
- Products: photos (shrunk to WebP in the browser), price, was-price, stock, hide/show
- Storefront: product grid, product sheet, cart, checkout with delivery areas and fees
- Payments: Lipa Namba with SMS proof (amount, name and transaction ID checked; a transaction ID can
  never be used twice) or cash on delivery; the seller always confirms
- Orders: status flow (awaiting payment, check payment, confirmed, on the way, delivered, cancelled),
  stock held on confirm and returned on cancel, call / WhatsApp the buyer
- Buyer order page `/o/<code>`: pay instructions, SMS paste, progress, "send order on WhatsApp"
- Dashboard: sales, orders, visitors, conversion vs last week, daily sales chart, order status,
  recent orders, top products; traffic source from in-app browsers (Instagram, TikTok, Facebook)
- Swahili and English everywhere (toggle, remembered by cookie)

Not built yet: Rizko AI assistant, Discover and voting, subscriptions and billing, SMS/WhatsApp
alerts, password reset (for now: reset by hand), admin screens, rate limits on public endpoints.

## Stack

TanStack Start on one Cloudflare Worker, D1 (SQLite), R2 for photos, Tailwind 4.

## Run locally

```bash
npm install
npx wrangler d1 migrations apply rizk --local
npm run dev            # http://localhost:3000
```

## First deploy

```bash
npx wrangler login
npx wrangler d1 create rizk          # copy the database_id into wrangler.jsonc
npx wrangler r2 bucket create rizk-media
npx wrangler d1 migrations apply rizk --remote
npm run deploy
```

Then add the custom domain (rizk.tz) to the Worker in the Cloudflare dashboard.
