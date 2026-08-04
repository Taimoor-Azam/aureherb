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
AUTH_MFA_ENCRYPTION_KEY=<generate-another-long-random-string>
STORE_CORS=https://www.aureherb.com,https://aureherb.com
ADMIN_CORS=https://api.aureherb.com,https://www.aureherb.com
AUTH_CORS=https://api.aureherb.com,https://www.aureherb.com,https://aureherb.com
NODE_ENV=production
MEDUSA_BACKEND_URL=https://api.aureherb.com

# Google customer SSO (OAuth web client — see section below)
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
GOOGLE_CALLBACK_URL=https://www.aureherb.com/auth/google/callback

# Order emails via Resend (HTTPS — works on Railway Hobby; Gmail SMTP is blocked there)
RESEND_API_KEY=<resend-api-key>
RESEND_FROM=AureHerb <orders@aureherb.com>
RESEND_REPLY_TO=info.aure.herb@gmail.com

# Cloudflare R2 (persistent product images — not local static/ disk)
# When S3_BUCKET is set, Medusa uses R2; otherwise it falls back to local static/
S3_FILE_URL=https://pub-xxxxx.r2.dev
S3_ACCESS_KEY_ID=<r2-access-key-id>
S3_SECRET_ACCESS_KEY=<r2-secret-access-key>
S3_REGION=auto
S3_BUCKET=aureherb-media
S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com

# WhatsApp Cloud API bot (see section below)
WHATSAPP_TOKEN=<meta-access-token>
WHATSAPP_PHONE_NUMBER_ID=<phone-number-id>
WHATSAPP_VERIFY_TOKEN=<meta-webhook-verify-token>
WHATSAPP_APP_SECRET=<meta-app-secret>
WHATSAPP_USE_TEMPLATES=false
GEMINI_API_KEY=<google-ai-studio-key>
```

### Cloudflare R2 setup

1. Open [R2 Overview](https://dash.cloudflare.com/?to=/:account/r2/overview) and **enable / purchase R2** if prompted (required once per account).
2. Create bucket `aureherb-media`.
3. Bucket **Settings** → enable **Public Development URL** (r2.dev) and copy `S3_FILE_URL` (e.g. `https://pub-xxxxx.r2.dev`). For production later, prefer a custom domain like `media.aureherb.com`.
4. **Manage R2 API Tokens** → create token with Object Read & Write on that bucket → copy Access Key ID + Secret.
5. Account ID from R2 overview → `S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com`.
6. Optional CORS: origins `https://api.aureherb.com`, `http://localhost:9000`; methods `GET`, `PUT`, `HEAD`.

After R2 is live, re-upload product images in admin (old `/static/` URLs will 404).

### Google customer SSO

Storefront keeps email/password and adds **Continue with Google**.

1. Open [Google Cloud Console](https://console.cloud.google.com/) → create/select a project.
2. **APIs & Services → OAuth consent screen** → configure for external users (add test users while in Testing).
3. **Credentials → Create Credentials → OAuth client ID → Web application**.
4. Authorized JavaScript origins:
   - `https://www.aureherb.com`
   - `https://aureherb.com`
   - `http://localhost:8000` (local)
5. Authorized redirect URIs:
   - `https://www.aureherb.com/auth/google/callback`
   - `http://localhost:8000/auth/google/callback` (local)
6. Copy Client ID + Client Secret into Railway as `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
7. Set `GOOGLE_CALLBACK_URL=https://www.aureherb.com/auth/google/callback` on Railway (local: `http://localhost:8000/auth/google/callback`).
8. Set `AUTH_MFA_ENCRYPTION_KEY` to a long random string (can reuse the same generator as JWT/COOKIE secrets).
9. Redeploy the backend after adding the variables.

The storefront middleware prepends the country code (`/pk/...`) when Google redirects to the non-country callback URL, so register the URI **without** a country segment.

### WhatsApp Cloud API bot (free Meta path)

Outbound order confirm/shipped messages + inbound confirm/cancel, oils Q&A (Gemini), and reorder.

1. Create a Meta app → add **WhatsApp** product → start with the test number (then attach your business number).
2. In Meta → WhatsApp → **Configuration**:
   - Callback URL: `https://api.aureherb.com/hooks/whatsapp`
   - Verify token: any long random string (same as `WHATSAPP_VERIFY_TOKEN` below)
3. Subscribe to the `messages` webhook field.
4. Copy **Phone number ID** and a permanent **System User** access token (`WHATSAPP_TOKEN`).
5. Create and submit message templates (utility) for approval (required to message customers first outside the 24h window):

| Template name (default) | Purpose | Example body vars |
|-------------------------|---------|-------------------|
| `order_placed_confirm` | Ask Confirm/Cancel | `{{1}}` = display id, `{{2}}` = total |
| `order_shipped` | Courier handed over | `{{1}}` = display id |

Until templates are approved, leave `WHATSAPP_USE_TEMPLATES` unset/`false` — the bot sends interactive Confirm/Cancel buttons (works after the customer has messaged you / in the test window).

6. Get a free [Google AI Studio](https://aistudio.google.com/apikey) key for Gemini oils Q&A → `GEMINI_API_KEY`.

Add to Railway variables:

```env
WHATSAPP_TOKEN=<meta-access-token>
WHATSAPP_PHONE_NUMBER_ID=<phone-number-id>
WHATSAPP_VERIFY_TOKEN=<same-as-meta-verify-token>
WHATSAPP_APP_SECRET=<meta-app-secret>
WHATSAPP_USE_TEMPLATES=false
# Optional overrides once approved:
# WHATSAPP_TEMPLATE_ORDER_CONFIRM=order_placed_confirm
# WHATSAPP_TEMPLATE_ORDER_SHIPPED=order_shipped
# WHATSAPP_API_VERSION=v21.0
GEMINI_API_KEY=<google-ai-studio-key>
# GEMINI_MODEL=gemini-2.0-flash
```

**Behaviour**

- `order.placed` with a shipping phone → WhatsApp Confirm/Cancel (Confirm only logs `metadata.whatsapp_confirmed_at`; Cancel runs Medusa cancel).
- `shipment.created` → “handed to courier” WhatsApp notice.
- Free-form chat → Gemini oils-only answers (refuses off-topic).
- “reorder” / “order again” → list recent orders for that phone → recreate COD cart/order.

Storefront floating button can stay on `+923137022646` for human chat; the Cloud API number can be the same after migration or a dedicated bot number.

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

`NEXT_PUBLIC_BASE_URL` is also used to build the Google OAuth callback URL (`/auth/google/callback`) when starting Google sign-in.

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
- [ ] Cloudflare R2 `S3_*` vars set on Railway; product images re-uploaded (R2 URLs, not `/static/`)
- [ ] Resend: domain `aureherb.com` verified + `RESEND_API_KEY` set on Railway so order/shipped emails send
- [ ] WhatsApp Cloud API: Railway env vars + Meta webhook `https://api.aureherb.com/hooks/whatsapp` + templates approved before `WHATSAPP_USE_TEMPLATES=true`
- [ ] Gemini: `GEMINI_API_KEY` set for oils Q&A
- [ ] Revoke old Gmail App Password if it was used for SMTP (no longer needed)
