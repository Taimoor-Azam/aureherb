# Oracle Always Free — Medusa + Postgres

Compose stack for `api.aureherb.com`. Full click-through (create the VM, dump Railway, cut over DNS) is in [DEPLOY.md](../../DEPLOY.md).

```bash
# on the Ubuntu ARM VM
bash deploy/oracle/setup-vm.sh
# edit deploy/oracle/.env
bash deploy/oracle/restore-from-dump.sh ./railway.dump   # if migrating
cd deploy/oracle && docker compose up -d --build
bash deploy/oracle/backup-postgres.sh --install
```
