#!/usr/bin/env bash
# Bootstrap Ubuntu (Oracle Ampere ARM) for AureHerb Medusa.
# Run as ubuntu with sudo:  bash deploy/oracle/setup-vm.sh
set -euo pipefail

if [[ "${EUID}" -eq 0 ]]; then
  echo "Run this as ubuntu (it will sudo), not as root."
  exit 1
fi

if [[ "$(uname -m)" != "aarch64" ]]; then
  echo "Warning: this VM is $(uname -m), not aarch64. Oracle Always Free Ampere is ARM."
fi

echo "==> Installing Docker"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sudo sh
fi
sudo usermod -aG docker "$USER" || true

echo "==> 4G swap (helps the Medusa admin build)"
if ! sudo swapon --show | grep -q .; then
  sudo fallocate -l 4G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

echo "==> Opening 80/443 in iptables (Oracle Ubuntu default DROP)"
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT || true
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT || true
if command -v netfilter-persistent >/dev/null 2>&1; then
  sudo netfilter-persistent save || true
elif sudo dpkg -s iptables-persistent >/dev/null 2>&1; then
  sudo netfilter-persistent save || true
else
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y iptables-persistent >/dev/null
  sudo netfilter-persistent save || true
fi

echo "==> Unattended security updates"
sudo apt-get update -y
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y unattended-upgrades
sudo dpkg-reconfigure -f noninteractive unattended-upgrades || true

ROOT="$(cd "$(dirname "$0")" && pwd)"
if [[ ! -f "$ROOT/.env" ]]; then
  cp "$ROOT/env.example" "$ROOT/.env"
  echo "Created $ROOT/.env from env.example — edit it before starting compose."
fi

echo
echo "Next:"
echo "  1. Log out and back in (or: newgrp docker) so docker works without sudo"
echo "  2. Edit $ROOT/.env  (copy secrets from Railway; set POSTGRES_PASSWORD)"
echo "  3. Restore a dump if migrating:  bash $ROOT/restore-from-dump.sh /path/to/railway.dump"
echo "  4. Point api.aureherb.com A record at this VM, then:"
echo "       cd $ROOT && docker compose up -d --build"
echo "  5. Nightly backup cron is in backup-postgres.sh --install"
