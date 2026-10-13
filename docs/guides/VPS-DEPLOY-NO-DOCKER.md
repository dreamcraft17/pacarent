# Deploy API di VPS (tanpa Docker)

> **Author:** Dozer  
> **Date:** 2026-10-13  
> **Status:** Active

Frontend di **Vercel**; di VPS hanya **PostgreSQL (native) + API .NET + Nginx**.

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

---

## 5. Nginx + HTTPS (subdomain API)

File `/etc/nginx/sites-available/pacarent-api` — ganti domain:

```nginx
server {
    listen 80;
    server_name api.pacarent.id;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -sf /etc/nginx/sites-available/pacarent-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d api.pacarent.id
```

DNS: **A** `api` → IP VPS.

---

## 6. Vercel

Env **Production + Preview:**

| Key | Value |
|-----|--------|
| `VITE_API_BASE` | `https://api.pacarent.id` |

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
| 502 Nginx | `curl 127.0.0.1:5000/health`; pastikan `pacarrent-api` active |

Lihat juga: [`VERCEL-QUICKSTART.md`](VERCEL-QUICKSTART.md).
