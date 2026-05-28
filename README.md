# Tech Cuisine App

Frontend for Tech Cuisine — a kitchen management platform for professional chefs. Built with Next.js 15, JWT + cookie auth, Tailwind CSS, and Radix UI.

---

## What is implemented

Next.js App Router application with internationalization (next-intl), dark/light theme, and full authentication flow (login, register, forgot password). Dashboard with recipe management, ingredient and plate tracking, suppliers, sales records, and user configuration. Stripe subscription integration and admin panel.

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in your values. Never commit `.env.local` or any file that contains real secrets.

| Variable | Required | Description |
|---|---|---|
| `BACKEND_API_URL` | **Yes** | Base URL of the Tech Cuisine API, e.g. `http://localhost:8000`. |
| `BACKEND_STATIC_TOKEN` | **Yes** | Static bearer token for server-to-API calls that do not carry a user token. |
| `BACKEND_APIKEY` | **Yes** | API key used by internal Next.js route handlers when calling the backend. |
| `NEXTAUTH_URL` | **Yes** | Canonical base URL of this app (used by `getBaseUrl()` for server-side redirects and links). |
| `NEXT_PUBLIC_APP_URL` | **Yes** | Public base URL; exposed to the browser for client-side links. |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | No | Default currency code, e.g. `BRL`. |
| `ACCESS_COOKIE_NAME` | No | Name of the access token cookie (default `tc-access`). |
| `REFRESH_COOKIE_NAME` | No | Name of the refresh token cookie (default `tc-refresh`). |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | Access token lifetime in minutes (default `30`). |
| `REFRESH_TOKEN_EXPIRE_DAYS` | No | Refresh token lifetime in days (default `7`). |
| `SESSION_CHECK_INTERVAL_MINUTES` | No | Interval for background session validation (default `5`). |
| `STRIPE_SECRET_KEY` | No | Stripe secret key. Payment features are disabled when absent. |
| `STRIPE_PRICE_ID` | No | Stripe Price ID for the subscription plan. |
| `ADMIN_CLEANUP_KEY` | No | Secret key for the admin token-cleanup endpoint. |

---

## How to run

**Prerequisites:** Node.js 20+, running Tech Cuisine API

**Install dependencies:**
```bash
npm install
```

**Start the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Tests

**Stack:** Jest + React Testing Library + `jest-dom`

### Running locally

```bash
npm test
```

### Configuration chain

| Source | Committed? | Purpose |
|---|---|---|
| `.env.test` | **Yes** (no secrets) | Non-sensitive test defaults loaded by `jest.setup.js`. |
| `.env.local` | No (`.gitignore`) | Local developer secrets loaded as fallback (never overwrites `.env.test` values). |

Tests must not depend on real secrets. Use `jest.mock` or `process.env` overrides inside individual test files for secret-dependent code paths.

### Tests by area

Tests live alongside the code they cover (`*.test.ts` / `*.test.tsx`). Key areas:

| Area | Location |
|---|---|
| Auth flow | `lib/auth-config.test.ts`, `components/auth/` |
| API route handlers | `app/api/**/route.test.ts` |
| Hooks | `hooks/*.test.ts` |
| Shared utilities | `lib/*.test.ts`, `lib/shared/*.test.ts` |
| UI components | `components/**/*.test.tsx` |
| Pages | `app/**/*.test.tsx` |

---

## Project structure

```
tech-cuisine-app/
├── app/
│   ├── api/                   # Next.js route handlers (server-side)
│   └── [locale]/              # Internationalised pages (next-intl)
├── components/
│   ├── auth/                  # Login, register, session guard
│   ├── features/              # Domain components (recipes, plates, etc.)
│   ├── layout/                # Header, sidebar, footer
│   └── cookie/                # Cookie consent UI
├── hooks/                     # React hooks
├── lib/                       # Shared utilities and API clients
├── messages/                  # i18n JSON files (en, pt)
├── public/                    # Static assets
├── .env.example               # Template — copy to .env.local and fill secrets
├── .env.test                  # Committed non-sensitive test defaults
├── jest.config.js
├── jest.setup.js
├── next.config.ts
└── tsconfig.json
```

---

## License

Licensed under [CC BY-NC-SA 4.0 with additional terms](license).

Non-commercial use. Production use, modification and distribution require prior written permission — see the `license` file for full details.

Licensor: Daniel Fonseca da Silva

Contact: dafondeveloper@gmail.com

Website: https://www.daniel-fonseca.online

Company: https://www.dafon.online
