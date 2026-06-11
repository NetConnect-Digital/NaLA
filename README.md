# NaLA Shop — Headless Next.js Frontend

A fully headless [Next.js](https://nextjs.org) frontend for the National Lifeline
Association WooCommerce store (`shop.nalalifeline.org`). It reproduces the live
site's design (Lato/Open Sans, NaLA navy/cyan/green palette) and fetches all data
from the existing WordPress + WooCommerce backend via API.

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **React 19**
- **Tailwind CSS v4** with NaLA brand tokens (`app/globals.css`)
- **TanStack Query** for client cart/auth state
- **Stripe.js** for headless card payments
- Data sources:
  - WooCommerce **Store API** (`wc/store/v1`) — products, categories, cart, checkout
  - WordPress **REST** (`wp/v2`) — pages/content
  - WooCommerce **REST** (`wc/v3`, server-only) — customer order history

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev                  # http://localhost:3000
```

Catalog/content pages work against the live backend out of the box. Auth, order
history, contact form, and payments require the backend setup below.

## Environment variables (`.env.local`)

| Variable | Required for | Notes |
|---|---|---|
| `NEXT_PUBLIC_WP_URL` | everything | Backend base URL (default `https://shop.nalalifeline.org`) |
| `WC_CONSUMER_KEY` / `WC_CONSUMER_SECRET` | order history | WooCommerce REST keys (read). Server-only. |
| `JWT_AUTH_SECRET` | login/register | Must match the JWT plugin's secret on the backend |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | checkout | Stripe publishable key (use **test** key first) |
| `CONTACT_FORM_ID` | contact form | The Contact Form 7 form ID |

## Backend prerequisites (WordPress admin)

These enable the authenticated/payment parts of the headless frontend:

1. **JWT auth plugin** — install **Simple JWT Login** (or adjust `lib/auth.ts`'s
   `JWT_NS` for another plugin). Enable the Auth, Register, and Reset-Password
   endpoints and "Allow Authentication" so a Bearer token authorizes `wp/v2`
   requests. Set the secret to match `JWT_AUTH_SECRET`.
2. **CORS** — the Route Handlers in `app/api/*` proxy all browser→Store API calls
   server-side, so browser CORS is largely avoided. If you call the backend
   directly from the browser, allow this app's origin.
3. **WooCommerce REST keys** — WooCommerce → Settings → Advanced → REST API →
   create a read key; set `WC_CONSUMER_KEY` / `WC_CONSUMER_SECRET`.
4. **Stripe** — confirm the WooCommerce Stripe Gateway supports the Store API /
   Blocks checkout. Verify the exact `payment_method` id and `payment_data` keys
   in `components/checkout/CheckoutForm.tsx` against your gateway version using
   **Stripe test keys**.
5. **Contact Form 7** — note the form ID and confirm field names
   (`your-name`, `your-email`, `your-message`) in `app/api/contact/route.ts`.

## Project layout

```
app/                 # routes (pages + Route Handlers under app/api)
components/
  layout/            # Header, Footer
  commerce/          # ProductCard, PriceTag, AddToCart, SponsorshipGrid
  checkout/          # Stripe provider + checkout form
  auth/              # auth shell, profile form, logout
lib/
  config.ts          # env + API base URLs
  woocommerce.ts     # Store API catalog reads (server)
  wordpress.ts       # wp/v2 content reads (server)
  store-server.ts    # Store API cart/checkout proxy + Cart-Token cookie
  wc-admin.ts        # wc/v3 order reads (server, keys)
  auth.ts            # JWT cookie helpers (server)
  cart-hooks.ts      # TanStack Query cart hooks (client)
  auth-hooks.ts      # TanStack Query auth hooks (client)
  conference.ts      # 2026 registration tiers
```

## Verification checklist

- Catalog: `/shop`, `/2026-conference` show live prices and Sold-Out states.
- Cart: add/update/remove persists across reload (Cart-Token cookie).
- Auth: register → login → `/my-account` shows your data; logout clears the cookie.
- Checkout: place a test order with Stripe **test keys**; confirm it appears in
  WooCommerce admin and on `/thank-you` + `/my-account`.

## Items to confirm against the live WooCommerce config

- Registration date-window cutovers and whether Funding pricing is membership-gated
  (`lib/conference.ts`).
- Stripe `payment_data` key names for the installed gateway version.
- Contact Form 7 field names and form ID.
