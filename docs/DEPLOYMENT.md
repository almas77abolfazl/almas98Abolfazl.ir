# Deployment Guide — almas98abolfazl.ir

Production deployment of the portfolio monorepo (NestJS + Angular ×2 + PostgreSQL)
behind a host-level Nginx reverse proxy with Let's Encrypt TLS.

---

## Topology

```
                       Internet
                           │
                 almas98abolfazl.ir  (Cloudflare → VPS)
                           │
                  ┌────────┴─────────┐
                  │  Host Nginx :80/443 (TLS, Certbot)
                  └────────┬─────────┘
            ┌──────────────┼───────────────────┐
            │              │                   │
        :3001          :3002              (internal)
   frontend-site    frontend-admin     backend :3000 (VPS loopback only)
   (public site)    (panel.almas...)
            │              │                   │
            └──────────────┴───────┬───────────┘
                            PostgreSQL :5432 (Docker network only)
```

- **Public site:** `https://almas98abolfazl.ir`
- **Admin panel:** `https://panel.almas98abolfazl.ir`  (also reachable at `https://almas98abolfazl.ir/admin`)
- Docker publishes `3001` (site) and `3002` (admin) to the host. Backend port `3000` is bound to `127.0.0.1` only for prerender builds; it is not publicly reachable. PostgreSQL stays internal.

---

## 1. Prerequisites (on the VPS)

```bash
sudo apt update && sudo apt -y upgrade
# Docker + Compose (already installed per the prompt: Docker 29.6.1 / Compose v5.3.1)
# Host Nginx + Certbot:
sudo apt install -y nginx certbot python3-certbot-nginx
```

## 2. Firewall

Open only what the public needs. Docker manages its own chains; you expose via the host proxy.

```bash
sudo ufw allow 22/tcp      # SSH — keep open
sudo ufw allow 80/tcp      # HTTP (ACME challenge + redirect)
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable
```

> Do **not** open 3000/3001/3002 publicly — they are reverse-proxied internally.

## 3. DNS (Cloudflare)

Create `A` records pointing to the VPS public IP:

| Type | Name        | Content (VPS IP) | Proxy |
|------|-------------|------------------|-------|
| A    | `almas98abolfazl.ir`  | `<VPS_IP>` | Proxied (orange) or DNS-only |
| A    | `www`                | `<VPS_IP>` | same as above |
| A    | `panel`              | `<VPS_IP>` | same as above |

> If using Cloudflare's orange cloud (proxied), the TLS cert is issued by Cloudflare and
> Certbot (below) will still work for the origin using HTTP-01 challenge over port 80.
> For simplicity this guide issues the cert on the VPS; set Cloudflare SSL mode to
> **Full (strict)** if you also want end-to-end encryption.

## 4. Start the Docker stack

```bash
cd /portfolio/almas98Abolfazl.ir
# Build and start the API first: frontend-site prerender uses the VPS loopback.
docker compose build backend frontend-admin
docker compose up -d --wait backend
docker compose build frontend-site
docker compose up -d --no-deps frontend-admin frontend-site
docker compose ps            # all healthy/running
docker compose logs -f backend   # confirm "db push" / migrations applied
```

Default admin credentials (change ASAP): `admin` / `admin123`.

## 5. Host Nginx reverse proxy + TLS

### 5.1 Public site — `/etc/nginx/sites-available/almas98abolfazl.ir`

```nginx
server {
    listen 80;
    server_name almas98abolfazl.ir www.almas98abolfazl.ir;

    # Let's Encrypt HTTP-01 challenge
    location /.well-known/acme-challenge/ { root /var/www/html; }

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        client_max_body_size 50M;
    }
}
```

### 5.2 Admin panel — `/etc/nginx/sites-available/panel.almas98abolfazl.ir`

```nginx
server {
    listen 80;
    server_name panel.almas98abolfazl.ir;

    location /.well-known/acme-challenge/ { root /var/www/html; }

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        client_max_body_size 50M;
    }
}
```

### 5.3 Enable, test, obtain certificates

```bash
sudo ln -s /etc/nginx/sites-available/almas98abolfazl.ir      /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/panel.almas98abolfazl.ir /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

sudo certbot --nginx -d almas98abolfazl.ir -d www.almas98abolfazl.ir -d panel.almas98abolfazl.ir
```

Certbot rewrites both server blocks to add `listen 443 ssl` and an HTTP→HTTPS redirect,
and installs a renewal timer. Verify auto-renewal:

```bash
sudo certbot renew --dry-run
```

## 6. Verify

- `https://almas98abolfazl.ir` → public site
- `https://panel.almas98abolfazl.ir` → admin panel (or `https://almas98abolfazl.ir/admin`)
- `https://almas98abolfazl.ir/api/about-me` → JSON (API reachable)

## 7. Post-deploy hardening (do this first)

1. **Change the admin password.** Inspect `backend/prisma/seed.ts` (or the auth module) to find
   where `admin`/`admin123` is created, update it, then re-seed / update the DB row.
2. **Set a real `.env`** in the project root (read at container start):
   ```env
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=<strong-random>
   POSTGRES_DB=almas98abolfazl
   SITE_URL=https://almas98abolfazl.ir
   ```
   Then `docker compose up -d` to apply.
3. **Back up** the `./uploads` directory and the `postgres_data` volume regularly.

## 8. Updating the stack

### Frontend-site only

Use this when the backend API contract and admin panel have not changed:

```bash
cd /portfolio/almas98Abolfazl.ir
# The backend must be healthy: prerender reads content over the VPS loopback.
docker compose up -d --wait backend
docker compose build frontend-site
docker compose up -d --no-deps frontend-site
docker image prune -f          # clean up old dangling images
```

`frontend-site` prerendering fetches public content during its image build. BuildKit uses host
networking and calls `http://127.0.0.1:3000/api`; Docker binds that backend port to VPS loopback
only, rather than using the public domain. Cloudflare/WAF therefore cannot block prerendering.
Building the frontend image before its container is recreated keeps the currently running site
available if the build fails.

### Full release (backend, admin, or frontend-site changed)

```bash
cd /portfolio/almas98Abolfazl.ir
git pull

# Keep the current site/admin running while these images are built.
docker compose build backend frontend-admin

# The new backend must be healthy before the site is prerendered.
docker compose up -d --wait backend
docker compose build frontend-site

# Recreate only after all required builds have succeeded.
docker compose up -d --no-deps frontend-admin frontend-site
docker compose ps
docker image prune -f
```

Do not export `PRERENDER_API_BASE_URL=https://almas98abolfazl.ir/api` for production Compose
builds. The Compose file explicitly supplies `http://127.0.0.1:3000/api` with BuildKit host
networking. The host Nginx and TLS certificates are untouched by stack updates.

## 9. Troubleshooting

| Symptom | Check |
|---------|-------|
| 502 Bad Gateway | `docker compose ps` (container down?) and `curl -s 127.0.0.1:3001` from the host |
| API 404 on panel | panel proxies to `:3002` only; `/api` must be hit via the site (`:3001`). The admin SPA calls `/api` relative to its own origin, so `panel.*` needs its own API path — see note below |
| Certbot fails | DNS must resolve to this VPS; port 80 reachable; no conflicting Nginx `server_name _` default |
| Styles/JS 404 | `docker compose logs frontend-site` — build may have failed |
| BuildKit reports `network mode "app-network" not supported` | Pull the current repository version. It uses supported BuildKit `network: host` and the backend loopback endpoint instead. |
| Prerender reports `403` for `/api/articles` or `/api/projects` | Confirm the current `docker-compose.yml` is present, then run `docker compose up -d --wait backend` before `docker compose build frontend-site`. The build must use `http://127.0.0.1:3000/api`, not the public domain. |

### Note on the admin panel API path

The admin SPA calls `/api/...` **relative to its own origin** (`panel.almas98abolfazl.ir`).
Because `frontend-admin` (port 3002) only serves static files and does **not** proxy `/api`
to the backend, those calls would 404. Two clean options:

- **Option A (recommended, no code change):** in the `panel.almas98abolfazl.ir` Nginx block,
  add an `/api/` location that proxies to the backend:
  ```nginx
  location /api/ {
      # backend:3000 is private to Docker; frontend-site forwards /api internally.
      proxy_pass http://127.0.0.1:3001;
      proxy_http_version 1.1;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_set_header Connection "";
  }
  ```
  (This mirrors what `frontend-site` already does on `:3001`.)
- **Option B:** keep admin only at `almas98abolfazl.ir/admin` (where `/api` is already proxied)
  and use `panel.almas98abolfazl.ir` purely as a redirect to `/admin`.

This guide uses **Option A** so `panel.almas98abolfazl.ir` is fully functional on its own.
