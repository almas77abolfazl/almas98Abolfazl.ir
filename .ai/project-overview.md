# Project Overview

**almas98Abolfazl.ir** — Personal portfolio website for Abolfazl Nasiri Almas (almas98).

A full-stack bilingual (Persian/English) portfolio platform with a public-facing site and a private admin panel.

---

## Stack

| Layer | Technology |
|---|---|
| Backend | NestJS 11 + Prisma 7 + PostgreSQL 17 |
| Frontend (public) | Angular 20 (standalone, signals) + Tailwind CSS v4 |
| Frontend (admin) | Angular 20 (standalone, lazy loading) + Tailwind CSS v4 |
| Web Server | Nginx Alpine (reverse proxy + static serving) |
| Containerization | Docker Compose |
| Deployment Target | Ubuntu 24 VPS — 2 CPU, 2 GB RAM, 40 GB SSD |

---

## Modules

- **Public Website** (`frontend-site`) — Portfolio site visible to visitors. Bilingual EN/FA, dark/light mode, RTL/LTR switching.
- **Admin Panel** (`frontend-admin`) — Password-protected CMS for managing all portfolio content.
- **REST API** (`backend`) — NestJS API with public and admin-guarded endpoints. Global prefix `/api`.

---

## Monorepo Structure

```
almas98Abolfazl.ir/
├── backend/                  # NestJS API
│   ├── prisma/
│   │   └── schema.prisma     # Single source of truth for DB schema
│   └── src/
│       ├── admin/            # Protected CRUD admin endpoints
│       ├── auth/             # JWT authentication
│       ├── about-me/         # Public GET endpoint
│       ├── experiences/      # Public GET endpoint
│       ├── educations/       # Public GET endpoint
│       ├── skills/           # Public GET endpoint
│       ├── articles/          # Public GET endpoints
│       ├── media/             # Public GET endpoint
│       ├── videos/            # Public GET endpoint (YouTube/Aparat embeds)
│       ├── contact-messages/ # Public POST + admin GET/DELETE
│       ├── analytics/        # PageView tracking + admin stats
│       └── prisma/           # PrismaService (singleton)
├── frontend-site/            # Angular public site
│   └── src/app/
│       ├── features/         # home, about-me, experiences, skills, blog, article-detail, videos
│       └── shared/           # header, footer, i18n.service, theme.service, api.service
├── frontend-admin/           # Angular admin SPA
│   └── src/app/
│       ├── features/         # dashboard, about-me, experiences, educations, skills,
│       │                     # articles, videos, testimonials, contact-messages
│       └── core/             # auth interceptor, error interceptor, auth guard, services
├── nginx/                    # Nginx config
├── docker-compose.yml        # Production compose
├── docker-compose.dev.yml    # Dev compose (only postgres)
└── .ai/                      # AI context files (this folder)
```

---

## Goals

- Clean Architecture — feature-based modules, separation of concerns
- Bilingual — Persian (RTL, Vazirmatn font) and English (LTR, Inter font)
- SEO Friendly — Angular SSR or meta tags, Open Graph, structured data
- Production Ready — Docker, Nginx, health checks, resource limits
- Mobile First — responsive Tailwind layouts

---

## Key Technical Decisions Made

1. **Bilingual data strategy**: All translatable fields have a `*Fa` variant in the database (e.g., `fullName` + `fullNameFa`). The frontend shows the FA field if available, falls back to EN. Exception: Articles use a `language` field (not bilingual per article) — see roadmap.

2. **Auth**: JWT stored in `localStorage` by `AuthService`. `AuthInterceptor` attaches `Bearer` token to all `/api/admin/*` requests. Uses `withInterceptorsFromDi()` for class-based interceptors in Angular 20.

3. **Prisma driver**: Uses `@prisma/adapter-pg` (pool-based, lazy connection). `DATABASE_URL` is loaded via `import 'dotenv/config'` at the top of `main.ts`.

4. **BigInt serialization**: Prisma's `$queryRaw` returns PostgreSQL `int8` as JavaScript `BigInt`. Wrap all raw query numeric results with `Number()` before returning JSON responses.

5. **Dev workflow**: `docker-compose.dev.yml` runs only PostgreSQL. Backend and frontends run locally via npm scripts. VS Code `launch.json` + `tasks.json` are configured for full-stack debugging.

6. **Tailwind v4**: Uses CSS-first config (`@theme` block in `styles.css`). Class names differ from v3: `bg-gradient-to-r` → `bg-linear-to-r`, `flex-shrink-0` → `shrink-0`, `start-*` → `inset-s-*`.

---

## Current State (as of session ending)

- All three phases complete (backend, admin panel, analytics)
- Bilingual database fields added to all models (`*Fa` fields)
- Frontend-site redesigned with modern minimal UI (indigo/emerald palette, timeline experiences, animated skill bars)
- Admin panel forms updated with side-by-side EN/FA input layout
- VS Code debugging fully configured
- `prisma db push` + `prisma generate` applied ✅
