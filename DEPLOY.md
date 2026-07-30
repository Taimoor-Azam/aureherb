# Deploy AureHerb (www.aureherb.com)

Stack: **Hostinger Premium** (domain/DNS) + **Railway** (Medusa + Postgres) + **Vercel** (storefront).

Target URLs:

| Service | URL |
|---------|-----|
| Shop | https://www.aureherb.com |
| API / Admin | https://api.aureherb.com (`/app` for admin) |
| Apex | https://aureherb.com → redirect to www |

Repo: https://github.com/Taimoor-Azam/aureherb

---

## 1. Hostinger (do this first)

1. Log in to [hPanel](https://hpanel.hostinger.com).
2. Open the website for **aureherb.com**.
3. **Backup** WordPress (Files + Database).
4. After backup, remove/disconnect WordPress (or empty `public_html`). Do not cancel the domain.
5. Open **DNS / DNS Zone** for `aureherb.com` and keep it ready for Phase 4.

---

## 2. Railway — Medusa + Postgres

1. Sign up / log in at [railway.app](https://railway.app) (GitHub login is easiest).
2. **New Project** → **Deploy from GitHub repo** → `Taimoor-Azam/aureherb`.
3. Add a **PostgreSQL** plugin to the same project.
4. Select the GitHub-deployed service → **Settings**:
   - **Root Directory:** `apps/backend`
   - **Build Command:** `cd ../.. && pnpm install --frozen-lockfile && pnpm --filter=@dtc/backend build`
   - **Start Command:** `cd ../.. && pnpm --filter=@dtc/backend start`
   - Or use the `railway.toml` in `apps/backend` if Railway picks it up with that root.
5. **Variables** (Settings → Variables). Reference Postgres with Railway’s variable reference UI where possible:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<generate-a-long-random-string>
COOKIE_SECRET=<generate-another-long-random-string>
STORE_CORS=https://www.aureherb.com,https://aureherb.com
ADMIN_CORS=https://api.aureherb.com,https://www.aureherb.com
AUTH_CORS=https://api.aureherb.com,https://www.aureherb.com,https://aureherb.com
NODE_ENV=production
MEDUSA_BACKEND_URL=https://api.aureherb.com

# Order emails (Gmail SMTP via info.aure.herb@gmail.com App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info.aure.herb@gmail.com
SMTP_PASS=<gmail-app-password>
SMTP_FROM=AureHerb <info.aure.herb@gmail.com>
```

Generate secrets locally (PowerShell):

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

6. Deploy. Open the service **HTTP** URL (Railway gives a `*.up.railway.app` URL).
7. In Railway → service → **Settings → Networking → Custom Domain** → add `api.aureherb.com`.
8. Run migrations once the service is up (Railway shell / one-off):

```bash
cd apps/backend && npx medusa db:migrate
npx medusa user -e admin@aureherb.com -p "<strong-password>"
```

9. Open `https://<railway-url>/app` (or later `https://api.aureherb.com/app`), sign in, create a **Publishable API Key** (Settings → Publishable API Keys). Copy it for Vercel.

---

## 3. Vercel — storefront

1. Sign up / log in at [vercel.com](https://vercel.com) with GitHub.
2. **Add New Project** → import `Taimoor-Azam/aureherb`.
3. Configure:
   - **Root Directory:** `apps/storefront`
   - **Framework:** Next.js
   - **Install Command:** `cd ../.. && pnpm install --frozen-lockfile`
   - **Build Command:** `pnpm build` (runs in `apps/storefront`)
4. **Environment Variables:**

```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.aureherb.com
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_DEFAULT_REGION=pk
NEXT_PUBLIC_BASE_URL=https://www.aureherb.com
NODE_ENV=production
```

Until `api.aureherb.com` DNS works, you can temporarily use the Railway `*.up.railway.app` URL as `NEXT_PUBLIC_MEDUSA_BACKEND_URL`, then update and redeploy.

5. Deploy.
6. Project → **Settings → Domains** → add `www.aureherb.com` and `aureherb.com` (redirect apex → www).

---

## 4. Hostinger DNS

In Hostinger DNS Zone for `aureherb.com`, replace conflicting `@` / `www` / `api` records with:

| Type | Name | Value | Purpose |
|------|------|--------|---------|
| CNAME | `www` | `26649f6ff147f06b.vercel-dns-017.com` | Shop |
| A | `@` | `216.198.79.1` | Apex (Vercel) |
| A | `@` | `64.29.17.1` | Apex (Vercel) |
| CNAME | `api` | `8v2bq31u.up.railway.app` | Medusa API |
| TXT | `_railway-verify.api` | `railway-verify=205b4de6eb1153e22d494c9fe19664eb8fe481562cfd2a2f7b003d9224351f73` | Railway ownership |

If Hostinger only allows one A for `@`, use `76.76.21.21` instead of the two A records above.

Remove old WordPress A/CNAME records that conflict after you backup Files + Database.

Wait for DNS (often 5–60 minutes). Confirm:

- https://www.aureherb.com loads the shop  
- https://api.aureherb.com/health or `/store/...` responds  
- https://api.aureherb.com/app opens admin  

If CORS errors appear, confirm Railway CORS vars match the final URLs and redeploy.

---

## 5. Production data checklist

- [ ] Catalog: Hair Growth Oil published, PKR prices set  
- [ ] Shipping: PKR 249 under 3000 / free at 3000+  
- [ ] COD payment enabled  
- [ ] Publishable key matches Vercel env  
- [ ] Product images uploaded on production (local `static/` files may need re-upload)
- [ ] SMTP_PASS set on Railway (Gmail App Password for `info.aure.herb@gmail.com`) so order/shipped emails send
