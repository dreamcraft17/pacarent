# Deploy API di VPS (tanpa Docker)

> **Author:** Dozer  
> **Date:** 2026-10-13  
> **Status:** Active

Frontend di **Vercel**; di VPS hanya **PostgreSQL (native) + API .NET + Nginx**.

**Cheat sheet** (update rutin + syntax `dotnet publish`): [`VPS-DEPLOY-CHEATSHEET.md`](VPS-DEPLOY-CHEATSHEET.md).  
**Auto deploy setelah `git pull`:** jalankan sekali `./deploy/scripts/install-vps-auto-deploy.sh` di VPS.

## Prasyarat

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx postgresql postgresql-contrib
```

**.NET 8 SDK** (build) atau **Runtime** (jika build di mesin lain):  
https://learn.microsoft.com/dotnet/core/install/linux-ubuntu

Untuk build di VPS: **Node.js 20+** (hanya jika menjalankan `deploy/scripts/deploy.sh` lengkap).

---

## 1. PostgreSQL

```bash
sudo -u postgres psql <<'SQL'
CREATE USER pacarent WITH PASSWORD 'GANTI_PASSWORD_KUAT';
CREATE DATABASE pacarent OWNER pacarent;
GRANT ALL PRIVILEGES ON DATABASE pacarent TO pacarent;
SQL
```

PostgreSQL 15+ / ownership schema (jika migrasi gagal permission):

```bash
sudo -u postgres psql -d pacarent -c "GRANT ALL ON SCHEMA public TO pacarent;"
```

---

## 2. Build API

Di VPS (butuh SDK + Node jika pakai skrip penuh):

```bash
cd ~/pacarent
chmod +x deploy/scripts/deploy.sh
./deploy/scripts/deploy.sh
```

Hanya API (tanpa build web untuk Vercel):

```bash
export PATH="$HOME/.dotnet:$PATH"
dotnet publish ~/pacarent/api/PacaRent.Api/PacaRent.Api.csproj -c Release -o ~/pacarent/publish/api
```

Atau build di laptop, lalu `rsync -avz publish/api/ dntech@vps:~/pacarent/publish/api/`.

---

## 3. Pasang binary + env

```bash
sudo mkdir -p /opt/pacarent/api /var/lib/pacarent/documents
sudo cp -r ~/pacarent/publish/api/* /opt/pacarent/api/

sudo mkdir -p /etc/pacarrent
sudo cp ~/pacarent/deploy/scripts/api.env.example /etc/pacarrent/api.env
sudo chmod 600 /etc/pacarrent/api.env
sudo nano /etc/pacarrent/api.env
```

Isi minimal (sesuaikan password DB):

```bash
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://127.0.0.1:5000
Database__UseInMemory=false
ConnectionStrings__DefaultConnection=Host=127.0.0.1;Port=5432;Database=pacarent;Username=pacarent;Password=GANTI_PASSWORD_KUAT
Jwt__Secret=ISI_MIN_32_KARAKTER
PacaRent__DocumentEncryptionKey=ISI_MIN_32_KARAKTER
PacaRent__DocumentStoragePath=/var/lib/pacarent/documents
Smtp__UseMock=true
Doku__UseSandboxMock=true
```

Generate secret:

```bash
openssl rand -base64 32
```

---

## 4. systemd

```bash
sudo useradd -r -s /usr/sbin/nologin pacarent 2>/dev/null || true
sudo chown -R pacarent:pacarent /opt/pacarent /var/lib/pacarent

sudo cp ~/pacarent/deploy/systemd/pacarrent-api.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now pacarrent-api
journalctl -u pacarrent-api -f
```

Tes:

```bash
curl -s http://127.0.0.1:5000/health
curl -s http://127.0.0.1:5000/api/categories
```

Migrasi EF jalan otomatis saat API start.

### Alternatif: PM2 (ganti systemd)

Jangan jalankan **systemd dan PM2** bersamaan (port 5000 bentrok).

```bash
sudo systemctl stop pacarrent-api
sudo systemctl disable pacarrent-api

# PM2 user (dntech) harus bisa baca env
sudo chgrp dntech /etc/pacarrent/api.env
sudo chmod 640 /etc/pacarrent/api.env

cd ~/pacarent
git pull
chmod +x deploy/scripts/run-api.sh

# Node + PM2 (sekali)
command -v pm2 >/dev/null || npm install -g pm2

pm2 start deploy/pm2/ecosystem.config.cjs
pm2 save
pm2 startup   # ikuti perintah sudo yang dicetak PM2
```

Log: `pm2 logs pacarrent-api` · restart: `pm2 restart pacarrent-api`

---

## 5. Nginx + HTTPS (subdomain API)

Contoh host production: **`api.pacarent.dntech.id`**. Template repo: [`deploy/nginx/pacarent-api.dntech.id.conf`](../../deploy/nginx/pacarent-api.dntech.id.conf).

```bash
sudo cp ~/pacarent/deploy/nginx/pacarent-api.dntech.id.conf /etc/nginx/sites-available/pacarent-api
sudo ln -sf /etc/nginx/sites-available/pacarent-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d api.pacarent.dntech.id
```

DNS: record **A** `api.pacarent.dntech.id` → IP VPS (atau CNAME ke host yang sama).

Tes setelah SSL:

```bash
curl -s https://api.pacarent.dntech.id/health
```

---

## 6. Vercel

Env **Production + Preview:**

| Key | Value |
|-----|--------|
| `VITE_API_BASE` | `https://api.pacarent.dntech.id` |

Redeploy web setelah env diset.

---

## Ops: web juga di VPS (bukan Vercel)

Copy `publish/web` ke `/var/www/pacarent/web`, pakai [`deploy/nginx/pacarrent.conf`](../../deploy/nginx/pacarrent.conf) (static + `/api` proxy).

---

## Troubleshooting

| Masalah | Tindakan |
|---------|----------|
| API exit / DB error | `journalctl -u pacarrent-api -n 80`; cek connection string & `Database__UseInMemory=false` |
| `password authentication failed` | Reset password user `pacarent` di Postgres |
| 502 Nginx | `curl 127.0.0.1:5000/health`; pastikan API jalan (`systemctl` atau `pm2 status`) |
| PM2 env denied | `chmod 640` + `chgrp dntech` pada `/etc/pacarrent/api.env` |

Lihat juga: [`VERCEL-QUICKSTART.md`](VERCEL-QUICKSTART.md).
