# almas98Abolfazl.ir

A production-ready bilingual (Persian/English) personal portfolio website, built as a full-stack monorepo with Docker Compose.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       Docker Compose Stack                       │
├─────────────────┬──────────────────┬────────────────────────────┤
│  frontend-site  │  frontend-admin  │  backend                   │
│  (Nginx)        │  (Nginx)         │  (NestJS + Prisma)         │
│  Port 3001      │  /admin          │  Port 3000                 │
├─────────────────┴──────────────────┴────────────────────────────┤
│                        PostgreSQL 17                             │
│                         Port 5432                               │
└─────────────────────────────────────────────────────────────────┘
```

**Traffic Flow:**
- Public website served by `frontend-site` on `http://localhost:3001`
- Admin panel proxied through `frontend-site` at `/admin`
- All API requests routed to the `backend` NestJS service via Nginx reverse proxy (`/api/*`)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | NestJS 11, Prisma 7 ORM, PostgreSQL 17 |
| Admin Frontend | Angular 20, Standalone Components, Signals, Tailwind CSS v4 |
| Public Frontend | Angular 20, SSG/Static Build, Signals, Tailwind CSS v4 |
| Reverse Proxy | Nginx Alpine |
| Containerization | Docker Compose |
| Deployment Target | Ubuntu 24 VPS (2 CPU / 2 GB RAM / 40 GB SSD) |

## Features

- **Bilingual (EN/FA)** — All content has Persian and English variants; RTL/LTR layout switches automatically
- **Dark / Light mode** — System-preference-aware with manual toggle
- **Portfolio sections** — About me, Experience (timeline), Education, Skills (animated progress bars), Blog articles
- **Admin CMS** — JWT-protected dashboard for managing all content (CRUD for every section)
- **Analytics** — Page-view tracking with daily chart and top-pages stats in the admin dashboard
- **Contact form** — Visitors can send messages; admin receives and manages them
- **Testimonials** — Admin can approve/reject visitor testimonials
- **Containerized** — Full Docker Compose stack with health checks, resource limits, and Nginx hardening

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS) or [Docker Engine + Compose](https://docs.docker.com/compose/install/) (Linux/WSL)
- Git

## Quick Start (Docker)

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/almas98Abolfazl.ir.git
   cd almas98Abolfazl.ir
   ```

2. (Optional) Create a `.env` file in the root directory to override default credentials:
   ```env
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=almas98abolfazl
   ```

3. Build and start all services:
   ```bash
   docker-compose up --build
   ```

First startup will:
1. Pull the PostgreSQL 17 Alpine image
2. Build the NestJS backend (generating Prisma client and compiling TypeScript)
3. Build the Angular admin panel and public site
4. Run database migrations via Prisma
5. Start all services with health checks and resource limits

Once healthy, access:
- **Public website:** [http://localhost:3001](http://localhost:3001)
- **Admin panel:** [http://localhost:3001/admin](http://localhost:3001/admin)
  - Default credentials: `admin` / `admin123`

## Development

### Quick Start (Full Stack Dev)

Run the complete development stack with one command — PostgreSQL in Docker, backend + frontends locally with hot reload:

```powershell
.\dev.ps1
```

Or on Windows CMD:

```cmd
dev.bat
```

This will:
1. Start PostgreSQL in Docker (`docker-compose.dev.yml`)
2. Run Prisma migrations
3. Start the NestJS backend in watch mode on port `3000`
4. Start the Angular public site dev server on port `4200`
5. Start the Angular admin panel dev server on port `4201`

To stop the development stack:

```powershell
.\dev-stop.ps1
```

### Individual Services

**Backend:**
```bash
cd backend
npm install
npm run start:dev
```

**Frontend (Public Site):**
```bash
cd frontend-site
npm install
npm start
```

**Frontend (Admin Panel):**
```bash
cd frontend-admin
npm install
npm start
```

### VS Code Full-Stack Debugging

The repository includes `.vscode/launch.json` and `.vscode/tasks.json` configured for full-stack debugging. Use the **"Full Stack"** compound launch configuration to start and attach the debugger to both the backend and Angular dev servers simultaneously.

## Project Structure

```
almas98Abolfazl.ir/
├── backend/                    # NestJS REST API
│   ├── prisma/
│   │   └── schema.prisma       # Single source of truth for DB schema
│   └── src/
│       ├── admin/              # Protected CRUD admin endpoints
│       ├── auth/               # JWT authentication
│       ├── about-me/           # Public GET endpoint
│       ├── experiences/        # Public GET endpoint
│       ├── educations/         # Public GET endpoint
│       ├── skills/             # Public GET endpoint
│       ├── articles/           # Public GET endpoints + likes
│       ├── media/              # Public GET endpoint
│       ├── contact-messages/   # Public POST + admin GET/DELETE
│       ├── analytics/          # PageView tracking + admin stats
│       └── prisma/             # PrismaService (singleton)
├── frontend-site/              # Angular public website (SSG)
│   └── src/app/
│       ├── features/           # home, about-me, experiences, skills, blog, article-detail
│       └── shared/             # header, footer, i18n.service, theme.service, api.service
├── frontend-admin/             # Angular admin SPA
│   └── src/app/
│       ├── features/           # dashboard, about-me, experiences, educations,
│       │                       # skills, articles, testimonials, contact-messages
│       └── core/               # auth interceptor, error interceptor, auth guard, services
├── nginx/                      # Nginx configuration
├── .ai/                        # AI context files (architecture, tasks, decisions)
├── docker-compose.yml          # Production Compose
├── docker-compose.dev.yml      # Dev Compose (PostgreSQL only)
├── dev.ps1                     # Development quick-start script (PowerShell)
├── dev.bat                     # Development quick-start script (CMD)
└── README.md
```

## API Overview

All endpoints are prefixed with `/api`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/about-me` | — | Portfolio owner info |
| `GET` | `/api/experiences` | — | Work experience list |
| `GET` | `/api/educations` | — | Education list |
| `GET` | `/api/skills` | — | Skills list |
| `GET` | `/api/articles` | — | Published articles (supports `?lang=en|fa`) |
| `GET` | `/api/articles/:slug` | — | Article detail |
| `POST` | `/api/articles/:slug/like` | — | Like an article |
| `GET` | `/api/media` | — | Media list |
| `POST` | `/api/contact-messages` | — | Submit a contact message |
| `POST` | `/api/auth/login` | — | Admin login → JWT |
| `GET/POST/PUT/DELETE` | `/api/admin/*` | JWT | Full CRUD for all entities |
| `GET` | `/api/admin/analytics` | JWT | Page view stats |

## Stopping the Stack

```bash
docker-compose down
```

To also remove the PostgreSQL data volume:

```bash
docker-compose down -v
```

## Roadmap

See [.ai/tasks.md](.ai/tasks.md) for the full phased roadmap.

Upcoming highlights:
- **Phase 4** — Article system overhaul (per-language articles, likes, tags, reading time)
- **Phase 5** — Video embeds (YouTube + Aparat)
- **Phase 6** — SEO (meta tags, Open Graph, JSON-LD, sitemap)
- **Phase 7** — Dark/Light theme polish (FOUT fix, system preference sync)
- **Phase 8** — Admin UI overhaul (sidebar, rich text editor, real file/image upload, drag-drop ordering)
- **Phase 9** — Extra features (Projects section, RSS, PWA, search, newsletter)
