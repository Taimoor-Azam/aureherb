# AureHerb

E-commerce storefront for botanical remedies, built on **Medusa** (Node.js) and **Next.js**. Checkout supports **cash on delivery only**.

## Stack

| Layer | Tech |
|-------|------|
| Backend + Admin | Medusa v2 (`apps/backend`) |
| Storefront | Next.js App Router (`apps/storefront`) |
| Database | PostgreSQL |
| Payments | Cash on delivery (`pp_system_default`) |

## Prerequisites (Windows)

- Node.js 20+ (22 LTS recommended; avoid Node 25+ for the storefront)
- [pnpm](https://pnpm.io/) 10+
- PostgreSQL 15+ running locally
- Git

## First-time setup

1. Install dependencies from the repo root:

```powershell
cd C:\Users\EpazzTech\Projects\aureherb
pnpm install
```

2. Create the database (example with `psql`):

```powershell
createdb -U postgres medusa-aureherb
```

3. Configure backend env:

```powershell
copy apps\backend\.env.template apps\backend\.env
```

Edit `apps/backend/.env` and set:

```
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/medusa-aureherb
```

4. Migrate and seed herbal catalog + COD payment region:

```powershell
pnpm backend:migrate
```

The seed prints a **publishable API key** (`pk_...`). Copy it.

5. Create an admin user:

```powershell
pnpm --filter=@dtc/backend exec medusa user -e admin@aureherb.local -p supersecret
```

6. Configure storefront env:

```powershell
copy apps\storefront\.env.template apps\storefront\.env.local
```

Set in `apps/storefront/.env.local`:

```
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_DEFAULT_REGION=pk
NEXT_PUBLIC_BASE_URL=http://localhost:8000
```

## Run locally

From the repo root (both apps):

```powershell
pnpm dev
```

Or separately:

```powershell
pnpm backend:dev
pnpm storefront:dev
```

| App | URL |
|-----|-----|
| Storefront | http://localhost:8000 |
| Medusa Admin | http://localhost:9000/app |
| Admin login | `admin@aureherb.local` / `supersecret` |

## Cash on delivery

- Regions are seeded with only `pp_system_default` (manual/system provider).
- The storefront labels this as **Cash on Delivery**.
- Orders are placed unpaid; capture payment in Admin after delivery.

## Project layout

```
apps/
  backend/       Medusa API + Admin
  storefront/    Next.js customer storefront
```

## Deploy next steps

- Host PostgreSQL (managed) and the Medusa backend (Medusa Cloud, Railway, Render, or a VPS).
- Deploy the storefront to Vercel or similar; set production env vars and CORS.
- Change `JWT_SECRET`, `COOKIE_SECRET`, and admin password before going live.
- Add email notifications, analytics, and real shipping rates when ready.
