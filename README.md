# Niora BD 🟢

> A Next.js (App Router) e‑commerce storefront built for Bangladesh with multiple payment gateways, authentication, admin dashboard and product scrapers.

---

## Table of contents

- [About](#about)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Install](#install)
  - [Environment variables](#environment-variables)
  - [Run the app](#run-the-app)
- [Notable routes & APIs](#notable-routes--apis)
- [Build & Deployment](#build--deployment)
- [Troubleshooting & Tips](#troubleshooting--tips)
- [Contributing](#contributing)
- [License](#license)

---

## About

Niora BD is an online shop built with the Next.js App Router. It supports:

- User authentication via NextAuth (Google / Facebook / Email, etc.)
- Orders, checkout and multiple payment gateways (SSLCommerz, bKash, Rocket, Nagad, Cash on Delivery)
- Admin dashboard for managing products, scrapers, categories and orders
- Product scrapers using Puppeteer/Cheerio to import product data
- MongoDB as the primary data store

---

## Features ✅

- Product listing, product details and search
- Cart, checkout and order management
- Payment integrations (SSLCommerz, bKash, Rocket, Nagad)
- Order confirmation, payment success/fail flows
- User account pages (profile, addresses, orders, wishlist)
- Admin dashboard for CRUD operations
- Server-side API routes for payments, orders, users, scrapers, reviews
- Responsive UI with Tailwind CSS and Radix/Headless primitives

---

## Tech stack 🔧

- Next.js 16 (Turbopack)
- React 19
- Tailwind CSS 4
- MongoDB (official driver)
- NextAuth for authentication
- Puppeteer & Cheerio for scrapers
- SSLCommerz / bKash / Rocket / Nagad integrations
- Lucide icons, Radix UI components

---

## Getting started

### Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm (preferred)
- MongoDB instance (Atlas, local or other)

### Install

```bash
# clone
git clone <repo-url> niora-bd
cd niora-bd

# install deps (pnpm recommended)
pnpm install
```

### Environment variables

Create a `.env.local` file at project root (do not commit it). Example variables used in this project:

```env
# Database
MONGODB_URI=your_mongodb_connection_string
DB_NAME=your_database_name

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Public app url used by payment callbacks
NEXT_PUBLIC_APP_URL=http://localhost:3000

# IMGBB (image hosting)
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key

# SSLCommerz
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_SANDBOX=true

# Nagad
NAGAD_MERCHANT_ID=your_nagad_merchant_id
NAGAD_MERCHANT_PRIVATE_KEY=your_nagad_private_key

# Rocket
ROCKET_STORE_ID=your_rocket_store_id
ROCKET_STORE_PASSWORD=your_rocket_password
ROCKET_API_KEY=your_rocket_api_key
ROCKET_SANDBOX=true

# Google / Facebook OAuth (optional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_CLIENT_ID=...
FACEBOOK_CLIENT_SECRET=...
```

> Security note: Never commit real secrets or connection strings to the repository. Use environment variables or your deployment secret store (Vercel secrets, etc.).

### Run the app

```bash
# dev
pnpm run dev

# build
pnpm run build
pnpm run start

# lint
pnpm run lint
```

Open http://localhost:3000 to view the site.

---

## Notable routes & APIs

Site pages:

- / — homepage
- /products, /product/[id]
- /checkout
- /payment, /payment/success, /payment/fail
- /order-confirmation
- /account/\* (profile, addresses, orders, wishlist)
- /dashboard/\* (admin)

API routes (server):

- /api/auth/[...nextauth] — authentication
- /api/manage-my-order/\* — order management (create, get by id, cod)
- /api/sslcommerz/\* — SSLCommerz integrations
- /api/bkash, /api/rocket, /api/nagad — payment gateways
- /api/products, /api/reviews, /api/categories, /api/users — product and user APIs
- /api/scrapers — run and manage scrapers

(See `src/app/api` for full list and implementation details.)

---

## Build & Deployment 🚀

- This project is tested with Vercel and works with the Next.js App Router.
- For production, set the same environment variables in your hosting provider.
- Ensure payment gateway callback URLs are set to `https://<your-app>/api/<gateway>/...` and match `NEXT_PUBLIC_APP_URL`.

Deploy on Vercel:

1. Connect repository to Vercel
2. Add the required environment variables in the Vercel dashboard
3. Deploy — Vercel will run `pnpm run build` automatically

---

## Troubleshooting & Tips ⚠️

- If you see build errors related to `useSearchParams()` and Suspense, ensure `useSearchParams` is only used in client components or wrapped in a Suspense boundary. Some pages use a window-based fallback to read query params in a client effect to avoid server prerender errors.
- For local image uploads, ensure `NEXT_PUBLIC_IMGBB_API_KEY` is set.
- If payment redirects aren't working, confirm callback URLs configured in the gateways match `NEXT_PUBLIC_APP_URL`.

---

## Contributing ❤️

- Create issues for bugs or feature requests
- Fork the repo and create feature branches for PRs
- Keep commits small and descriptive

---

## License

This project does not include a license file. Add a license (e.g., MIT) if you intend to publish under specific terms.

---

If you want, I can also:

- Add a `.env.example` file to the repo using placeholders ✅
- Add short developer notes for running scrapers or seeding data ✅

If you'd like those, tell me which option you'd prefer and I'll add them. ✨
