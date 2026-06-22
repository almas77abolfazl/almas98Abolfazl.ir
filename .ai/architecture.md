# Architecture

Monorepo structure:

```
almas98Abolfazl.ir/
├── backend/           # NestJS API
├── frontend-site/     # Angular SPA/SSG for public website
├── frontend-admin/    # Angular SPA for admin panel
└── docker-compose.yml
```

## Services

- **nginx** — Reverse proxy serving static frontend builds
- **backend** — NestJS API
- **postgres** — PostgreSQL database

## Deployment

- Entire project runs via `docker-compose up`.
- Frontend apps are built as static bundles and served by Nginx to keep memory usage minimal on the VPS.
- Single backend instance (no clustering).
- Admin panel accessible via `/admin` path or a separate subdomain.

## Tech Stack

- **Backend:** NestJS + Prisma + PostgreSQL
- **Frontend (Site):** Angular 20 (Standalone + Signals) — SSG/Static
- **Frontend (Admin):** Angular 20 (Standalone + Signals) — SPA
- **Web Server:** Nginx Alpine
