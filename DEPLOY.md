# Deploy AureHerb (www.aureherb.com)

Stack: **Hostinger** (domain/DNS) + **Oracle Cloud Always Free** (Medusa + Postgres) + **Vercel** (storefront).

Target URLs:

| Service | URL |
|---------|-----|
| Shop | https://www.aureherb.com |
| API / Admin | https://api.aureherb.com (`/app` for admin) |
| Apex | https://aureherb.com → redirect to www |

Repo: https://github.com/Taimoor-Azam/aureherb

Oracle files live in [`deploy/oracle/`](deploy/oracle/). This environment **cannot create your Oracle account or VM** — you do sections 1–2 in the Oracle console, then run the scripts on the VM.

---

## 1. Oracle Cloud account

1. Open [cloud.oracle.com](https://www.oracle.com/cloud/free/) and **Start for free**.
2. Use a real email, home address, and a credit card (Oracle authorizes then should not charge if you stay on Always Free shapes).
3. Complete identity verification if asked. Wait until the tenancy is **Active**.
4. Pick a home region that still has Ampere capacity (if “out of capacity”, try another region or retry later).

Stay on **Always Free**: shape **VM.Standard.A1.Flex**, **2 OCPU**, **12 GB RAM**. Do not pick paid shapes.

---

## 2. Create the VM

1. Console → **Compute → Instances → Create instance**.
2. Name: `aureherb-api`.
3. **Image:** Canonical Ubuntu 24.04 (or 22.04).
4. **Shape:** Change shape → **Ampere** → `VM.Standard.A1.Flex` → **2 OCPU**, **12 GB memory**.
5. **Networking:** use the default VCN/subnet. Check **Assign a public IPv4 address**.
6. **SSH keys:** generate a key pair and **download the private key** (or paste your existing public key).
7. Boot volume: **50–100 GB** (Always Free includes 200 GB total).
8. Create the instance. Copy the **Public IP**.

### Open ports (required)

1. Instance → subnet → **Security list** (or NSG).
2. Add ingress **CIDR 0.0.0.0/0**:
   - TCP **22** (SSH)
   - TCP **80** (HTTP / Caddy TLS)
   - TCP **443** (HTTPS)
3. Egress can stay allow-all.

### SSH in

```bash
chmod 600 oracle-private-key.pem
ssh -i oracle-private-key.pem ubuntu@<PUBLIC_IP>
```

---

## 3. Dump Railway Postgres (do this before DNS cutover)

On your laptop (with `pg_dump`) or on the new VM after Docker is installed:

1. Railway → Postgres → **Variables** → copy `DATABASE_URL`.
2. Dump (custom format):

```bash
# from repo root, or copy dump-railway.sh to the VM
DATABASE_URL='postgres://...' bash deploy/oracle/dump-railway.sh
```

Copy the `.dump` file to the VM (`scp`) if you dumped locally.

Keep Railway running until the Oracle stack is verified.

---

## 4. Install Medusa on the VM

```bash
sudo apt-get update && sudo apt-get install -y git
git clone https://github.com/Taimoor-Azam/aureherb.git
cd aureherb
bash deploy/oracle/setup-vm.sh
# log out and back in so the docker group applies
```

Edit `deploy/oracle/.env`:

- Copy **JWT_SECRET, COOKIE_SECRET, AUTH_MFA_ENCRYPTION_KEY** from Railway so existing admin/customer sessions still verify.
- Copy Google, Resend, R2, WhatsApp, Gemini values from Railway.
- Set a new **POSTGRES_PASSWORD** (only used on this VM).
- Leave `MEDUSA_BACKEND_URL=https://api.aureherb.com`.

Restore data, then start:

```bash
bash deploy/oracle/restore-from-dump.sh ~/railway.dump
cd deploy/oracle
docker compose up -d --build
bash deploy/oracle/backup-postgres.sh --install
```

The first `--build` compiles the admin UI and can take several minutes on Ampere. Watch with `docker compose logs -f backend`.

Sanity check on the VM:

```bash
curl -sS http://127.0.0.1:9000/health
# or after Caddy is up and DNS points here:
curl -sS https://api.aureherb.com/health
```

Admin: https://api.aureherb.com/app (same users as Railway after restore).

---

## 5. Point DNS at Oracle (Hostinger)

In Hostinger DNS for `aureherb.com`:

| Type | Name | Value | Purpose |
|------|------|--------|---------|
| CNAME | `www` | `26649f6ff147f06b.vercel-dns-017.com` | Shop (unchanged) |
| A | `@` | `216.198.79.1` | Apex → Vercel |
| A | `@` | `64.29.17.1` | Apex → Vercel |
| **A** | **`api`** | **`<ORACLE_PUBLIC_IP>`** | Medusa (replace Railway CNAME) |

Remove the old `api` CNAME to `*.up.railway.app` and the `_railway-verify.api` TXT record.

Wait 5–60 minutes. Caddy issues Let’s Encrypt for `api.aureherb.com` automatically once the A record hits this VM.

Confirm:

- https://www.aureherb.com loads the shop
- https://api.aureherb.com/health responds
- https://api.aureherb.com/app opens admin
- Place a test COD order; WhatsApp webhook stays `https://api.aureherb.com/hooks/whatsapp` (no Meta change if the hostname is unchanged)

Then you can stop/delete the Railway project.

If Hostinger only allows one A for `@`, use `76.76.21.21` instead of the two A records above.

---

## 6. Vercel — storefront (already live; leave as-is)

Keep:

```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.aureherb.com
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_DEFAULT_REGION=pk
NEXT_PUBLIC_BASE_URL=https://www.aureherb.com
NODE_ENV=production
```

No Vercel change is required if the API hostname stays `api.aureherb.com`.

---

## 7. Same secrets as before (Google, R2, WhatsApp, Resend)

These do not move off their providers. Put the values in `deploy/oracle/.env` instead of Railway variables.

### Cloudflare R2

When `S3_BUCKET` is set, Medusa stores images on R2. Bucket CORS origins should include `https://api.aureherb.com`.

### Google customer SSO

Callback stays `https://www.aureherb.com/auth/google/callback` (no country segment). Same Client ID/Secret in `.env`.

### WhatsApp Cloud API

Callback URL remains `https://api.aureherb.com/hooks/whatsapp`. After cutover, send a test inbound message.

### Resend

Same `RESEND_API_KEY` / From address. Domain `aureherb.com` stays verified on Resend.

Generate a new secret if needed (PowerShell):

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

Do **not** rotate `JWT_SECRET` / `COOKIE_SECRET` on migrate unless you want every login session to drop.

---

## 8. Day-2 operations

| Task | Command (on the VM, in `deploy/oracle`) |
|------|------------------------------------------|
| Logs | `docker compose logs -f backend` |
| Restart | `docker compose restart backend` |
| Update code | `git pull && docker compose up -d --build` |
| Backup now | `bash backup-postgres.sh` |
| New admin user | `docker compose exec backend pnpm --filter=@dtc/backend exec medusa user -e you@aureherb.com -p '<password>'` |

Backups write to `~/aureherb-backups`. Copy a dump off the VM periodically (Oracle can reclaim idle Always Free accounts).

If the VM is replaced, restore with `restore-from-dump.sh` and point the `api` A record at the new IP.

---

## 9. Production checklist

- [ ] Oracle instance is A1.Flex 2 OCPU / 12 GB (Always Free)
- [ ] Security list allows 22, 80, 443
- [ ] Railway dump restored; catalog, orders, admin login work
- [ ] `api.aureherb.com` A record is the Oracle public IP
- [ ] https://api.aureherb.com/app and `/health` work
- [ ] Shop checkout still talks to `https://api.aureherb.com`
- [ ] R2 / Resend / WhatsApp / Google env vars copied
- [ ] Nightly `backup-postgres.sh` cron installed
- [ ] Railway torn down only after a successful test order
