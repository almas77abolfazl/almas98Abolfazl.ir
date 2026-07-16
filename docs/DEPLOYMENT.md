# Deployment Guide — almas98abolfazl.ir on Ubuntu VPS

Goal: visit `https://almas98abolfazl.ir` (public site) and `https://almas98abolfazl.ir/admin`
(admin panel) — no separate subdomain required, the stack already proxies `/admin`.

## 0. Fix the backend build (already applied locally)
The backend `Dockerfile` ran `prisma generate` during `npm install` (postinstall) before
`schema.prisma` was copied, causing the build to fail. The fix copies the schema first:

```dockerfile
COPY package*.json ./
COPY prisma/schema.prisma ./prisma/schema.prisma   # <- added
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
```

Commit it and pull on the server (or it is already in the repo).

## 1. Firewall / open ports
The Docker stack only publishes port `3001` (frontend-site). Nothing needs to be opened
*for Docker itself*. What you must open on the VPS firewall (ufw / provider panel):

- `22`   — SSH (keep open!)
- `80`   — HTTP (Certbot / Let's Encrypt challenge)
- `443`  — HTTPS (final traffic)

Do NOT open 3000/3001 publicly; they stay internal to Docker.

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 2. Build & start the stack (Docker network is internal)
```bash
cd /portfolio/almas98Abolfazl.ir
docker compose up -d --build
docker compose ps          # all should be "healthy"/"running"
docker compose logs -f backend   # confirm migrations ran (RUN_MIGRATIONS / db push)
```
The stack now serves everything on `http://localhost:3001` (site + /admin).

## 3. Install a host-level reverse proxy + TLS
Docker listens on 3001; we put an Nginx (or Caddy) on the host in front of it to handle
the domain and HTTPS. Using Nginx + Certbot:

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

Create `/etc/nginx/sites-available/almas98abolfazl.ir`:
```nginx
server {
    listen 80;
    server_name almas98abolfazl.ir www.almas98abolfazl.ir;

    # Let's Encrypt challenge
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
```bash
sudo ln -s /etc/nginx/sites-available/almas98abolfazl.ir /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d almas98abolfazl.ir -d www.almas98abolfazl.ir
```
Certbot auto-rewrites the server block to add 443 + redirect. Renewal is automatic.

## 4. Point DNS
In your DNS provider, set:
- `A`  `almas98abolfazl.ir`      → VPS public IP
- `A`  `www.almas98abolfazl.ir`  → VPS public IP

(Optional subdomain) If you prefer `admin.almas98abolfazl.ir`, add an `A` record for it
too and a second Nginx server block proxying to 3001 with `location / { proxy_pass ...:3001/admin/ }`.
The built-in `/admin` path already works, so this is optional.

## 5. Verify
- https://almas98abolfazl.ir        → public site
- https://almas98abolfazl.ir/admin  → admin panel (default `admin` / `admin123`)

## 6. Post-deploy hardening (important)
1. Change the admin password — find how it is seeded (look for `seed.ts` / auth module) and
   update the default `admin`/`admin123`.
2. Set a real `.env` (copy from `.env.example` if present, else create):
   ```env
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=<strong-random>
   POSTGRES_DB=almas98abolfazl
   SITE_URL=https://almas98abolfazl.ir
   ```
   Then recreate: `docker compose up -d` (env is read at container start).
3. `uploads/` is mounted from `./uploads`; it persists on the host. Back it up.

## 7. Updates later
```bash
cd /portfolio/almas98Abolfazl.ir
git pull
docker compose up -d --build
```
