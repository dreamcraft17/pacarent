# Cheat sheet — deploy API PacaRent di VPS

> **Author:** Dozer  
> **Date:** 2026-10-14  
> **Status:** Active

## Summary

Panduan singkat copy-paste untuk VPS (`~/pacarent`, PM2, Nginx `api.pacarent.dntech.id`). Frontend tetap di **Vercel**. Panduan lengkap: [`VPS-DEPLOY-NO-DOCKER.md`](VPS-DEPLOY-NO-DOCKER.md).

---

## Path penting

| Apa | Path |
|-----|------|
| Repo clone | `~/pacarent` |
| Hasil `dotnet publish` | `~/pacarent/publish/api/` |
| Binary jalan | `/opt/pacarent/api/PacaRent.Api.dll` |
| Env production | `/etc/pacarrent/api.env` |
| Dokumen mitra | `/var/lib/pacarent/documents` |

---

## Auto deploy: cukup `git pull`

Git hook **`post-merge`** menjalankan build/deploy **otomatis** setelah pull berhasil.

**Sekali** di VPS (setelah skrip ini ada di repo):

```bash
cd ~/pacarent
git pull
chmod +x deploy/scripts/install-vps-auto-deploy.sh
./deploy/scripts/install-vps-auto-deploy.sh
```

**Sehari-hari** — kamu hanya:

```bash
cd ~/pacarent && git pull
```

| Situasi | Yang terjadi |
|---------|----------------|
| Pull bawa perubahan `api/` atau `deploy/scripts/run-api.sh` | `dotnet publish` → sync `/opt/pacarent/api` → `pm2 restart` → cek health |
| Pull cuma `web/`, `docs/`, dll. | Log: *lewati build* (frontend deploy di Vercel terpisah) |
| Laptop dev (tanpa `/opt/pacarent/api`) | Hook diam — tidak deploy |

Pakai **`git pull`** biasa (merge). **`git pull --rebase`** tidak memicu hook — hindari di VPS.

Deploy paksa tanpa peduli diff: `./deploy/scripts/vps-deploy-api.sh --force`

Hook hanya jalan jika folder **`/opt/pacarent/api`** sudah terpasang.

**Error `bash\r: No such file or directory`** — line ending Windows (CRLF). Di VPS:

```bash
sed -i 's/\r$//' deploy/scripts/*.sh deploy/git-hooks/post-merge
chmod +x deploy/scripts/*.sh deploy/git-hooks/post-merge
./deploy/scripts/install-vps-auto-deploy.sh
```

Deploy manual (tanpa pull):

```bash
~/pacarent/deploy/scripts/vps-deploy-api.sh
```

**Sudo:** hook butuh `sudo cp` — kalau diminta password, pasang NOPASSWD (lihat output skrip install) atau:

```bash
sudo chown -R dntech:dntech /opt/pacarent/api
```

(tanpa sudo di skrip — bisa disesuaikan nanti).

---

## Update rutin manual (tanpa hook)

Jalankan sebagai user deploy (mis. `dntech`):

```bash
cd ~/pacarent
git pull

export PATH="$HOME/.dotnet:$PATH"
dotnet publish ~/pacarent/api/PacaRent.Api/PacaRent.Api.csproj -c Release -o ~/pacarent/publish/api

sudo cp -r ~/pacarent/publish/api/* /opt/pacarent/api/
pm2 restart pacarrent-api
```

Verifikasi:

```bash
curl -s http://127.0.0.1:5000/health
curl -s https://api.pacarent.dntech.id/health
pm2 logs pacarrent-api --lines 25
```

---

## Perintah `dotnet` yang sering dipakai

| Tujuan | Perintah |
|--------|----------|
| Publish Release ke folder | `dotnet publish ~/pacarent/api/PacaRent.Api/PacaRent.Api.csproj -c Release -o ~/pacarent/publish/api` |
| Cek SDK terpasang | `dotnet --version` |
| Cek runtime | `dotnet --list-runtimes` |
| Build saja (tanpa output deploy) | `dotnet build ~/pacarent/api/PacaRent.Api/PacaRent.Api.csproj -c Release` |

Jika `dotnet: command not found`:

```bash
export PATH="$HOME/.dotnet:$PATH"
# atau pasang SDK/runtime: https://learn.microsoft.com/dotnet/core/install/linux-ubuntu
```

Runtime minimal di VPS (kalau tidak build di sini): `aspnetcore-runtime-8.0` + `dotnet-runtime-8.0`.

---

## PM2 (setup / recovery)

**Jangan** jalankan systemd `pacarrent-api` dan PM2 bersamaan (port **5000** bentrok).

```bash
sudo systemctl stop pacarrent-api 2>/dev/null
sudo systemctl disable pacarrent-api 2>/dev/null

sudo chgrp dntech /etc/pacarrent/api.env
sudo chmod 640 /etc/pacarrent/api.env

cd ~/pacarent
chmod +x deploy/scripts/run-api.sh
pm2 delete pacarrent-api 2>/dev/null || true
pm2 start deploy/scripts/run-api.sh --name pacarrent-api --interpreter bash
pm2 save
pm2 status
```

Autostart setelah reboot — jalankan perintah `sudo env PATH=...` yang dicetak `pm2 startup` (sekali).

---

## Env `/etc/pacarrent/api.env`

Edit:

```bash
sudo nano /etc/pacarrent/api.env
```

Generate secret (JWT / encryption):

```bash
openssl rand -base64 32
```

**Nilai ada spasi atau `( )`** — bungkus single quote, contoh:

```env
PacaRent__EmergencyHelpLabel='Hubungi 112 (Darurat)'
ConnectionStrings__DefaultConnection='Host=127.0.0.1;Port=5432;Database=pacarent;Username=pacarent;Password=PASSWORD_KAMU'
```

Template lengkap: [`deploy/scripts/api.env.example`](../../deploy/scripts/api.env.example).

Reset password Postgres jika API log `28P01`:

```bash
sudo -u postgres psql -c "ALTER USER pacarent WITH PASSWORD 'PasswordBaruKuat';"
```

---

## Nginx + SSL (sekali / ganti domain)

```bash
sudo cp ~/pacarent/deploy/nginx/pacarent-api.dntech.id.conf /etc/nginx/sites-available/pacarent-api
sudo ln -sf /etc/nginx/sites-available/pacarent-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d api.pacarent.dntech.id
```

---

## Vercel (frontend)

Set env **Production + Preview**, lalu **redeploy** (env `VITE_*` dibaca saat build):

| Key | Contoh |
|-----|--------|
| `VITE_API_BASE` | `https://api.pacarent.dntech.id` |

Quickstart: [`VERCEL-QUICKSTART.md`](VERCEL-QUICKSTART.md).

---

## Troubleshooting cepat

| Gejala | Cek |
|--------|-----|
| `dotnet publish` gagal missing project | `git pull`; pastikan folder `api/PacaRent.Infra/Data/` ada di repo |
| PM2 `errored` | `pm2 logs pacarrent-api` — env syntax, DB password, DLL missing |
| `curl` 127.0.0.1:5000 gagal | `pm2 status`; port bentrok `ss -tlnp \| grep 5000` |
| 502 dari HTTPS | API lokal health OK? `curl 127.0.0.1:5000/health` |
| Web Vercel kosong | `VITE_API_BASE` + redeploy |
| Login/daftar aneh | `PacaRent__SkipRegistrationOtp=true` untuk fase testing |

---

## Satu blok: deploy penuh dari pull

Dengan auto-deploy terpasang:

```bash
cd ~/pacarent && git pull
curl -s https://api.pacarent.dntech.id/health && echo
```

Tanpa hook:

```bash
cd ~/pacarent && git pull
~/pacarent/deploy/scripts/vps-deploy-api.sh
curl -s https://api.pacarent.dntech.id/health && echo
```
