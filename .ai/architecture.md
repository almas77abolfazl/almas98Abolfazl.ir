# Architecture

## Monorepo Layout

```
almas98Abolfazl.ir/
├── backend/                   NestJS API
├── frontend-site/             Angular 20 — public portfolio site
├── frontend-admin/            Angular 20 — admin panel (SPA)
├── nginx/                     Nginx config files
├── docker-compose.yml         Production (all services)
├── docker-compose.dev.yml     Development (postgres only)
└── .vscode/
    ├── launch.json            Full-stack debug configs
    └── tasks.json             Build/start tasks for debugging
```

---

## Services (Docker)

### `postgres`
- Image: `postgres:17-alpine`
- Port: `5432`
- DB name: `almas98abolfazl`
- Healthcheck: `pg_isready`
- Data persisted via named volume

### `backend`
- Multi-stage build from `backend/Dockerfile`
- Runs on port `3000` (internal)
- `main.ts` starts with `import 'dotenv/config'` to load `.env`
- `app.setGlobalPrefix('api')` — all routes are under `/api`
- `prisma db push` runs as an entrypoint step before the app starts

### `frontend-site`
- Built to static files in multi-stage Docker build
- Served by Nginx on port `80`

### `frontend-admin`
- Built to static files in multi-stage Docker build
- Served by Nginx at `/admin` path or a separate port

### `nginx`
- Reverse proxy
- Routes `/api/*` → `backend:3000`
- Routes `/admin/*` → `frontend-admin` static files
- Routes `/*` → `frontend-site` static files
- Handles SPA fallback (`try_files $uri $uri/ /index.html`)

---

## Backend Architecture (NestJS)

### Module structure (feature-based)
```
src/
├── main.ts                    Bootstrap + dotenv + global prefix
├── app.module.ts              Root module — imports all feature modules
├── prisma/
│   └── prisma.service.ts      Singleton PrismaClient with @prisma/adapter-pg pool
├── auth/
│   ├── auth.controller.ts     POST /api/auth/login → returns JWT
│   ├── auth.service.ts        bcrypt password check, JwtService.sign()
│   ├── auth.guard.ts          JwtAuthGuard for protected routes
│   └── auth.module.ts
├── admin/
│   ├── admin.controller.ts    All /api/admin/* CRUD endpoints (guarded)
│   ├── admin.service.ts       Business logic for all admin operations
│   └── admin.module.ts
├── about-me/                  GET /api/about-me (public)
├── experiences/               GET /api/experiences (public)
├── educations/                GET /api/educations (public)
├── skills/                    GET /api/skills (public)
├── articles/                  GET /api/articles (published only), GET /api/articles/:slug
├── media/                     GET /api/media (public)
├── contact-messages/          POST /api/contact-messages (public submit)
└── analytics/
    ├── analytics.controller.ts  POST /api/analytics/track, GET /api/analytics/stats (guarded)
    └── analytics.module.ts
```

### Key patterns
- `PrismaService` uses `@prisma/adapter-pg` with a lazy pool (no pre-connect)
- Raw `$queryRaw` results from PostgreSQL return `BigInt` for `COUNT(*)` — must call `Number()` before returning
- No DTOs/validators currently (inline body types). Future improvement: add `class-validator` DTOs.

### File uploads & Media
- `UploadsService` (`src/uploads/uploads.service.ts`) writes image files to `backend/uploads/` with a UUID filename and returns a public URL `/api/uploads/<file>`.
- `POST /api/admin/media/upload` (in `AdminController`, admin-guarded) accepts `multipart/form-data`, saves the file, and creates a `Media` record.
- Files are served by the NestJS app itself: `app.useStaticAssets(uploadsDir, { prefix: '/api/uploads' })` in `main.ts`. In production the host Nginx proxies `/api` → backend, so `/api/uploads/*` is reachable from both frontends under the same origin.
- Article `content` is **Markdown**. The public `article-detail` renders it via `marked` and Angular's built-in `[innerHTML]` sanitization (XSS-safe). The admin `MarkdownEditorComponent` provides a live preview and an "Insert image" toolbar button that uploads a file and embeds `![alt](url)` at the cursor.

---

## Frontend-Site Architecture (Angular 20)

### Key services
| Service | Responsibility |
|---|---|
| `ApiService` | HTTP calls to `/api/*` — typed interfaces for all models |
| `I18nService` | Language toggle (en/fa), translation map, RTL/LTR via `html[dir]`, `currentLang` signal |
| `ThemeService` | Dark/light toggle, `html.classList.add('dark')`, `isDark` signal, persisted to localStorage |
| `AnalyticsService` | Tracks page views on every router `NavigationEnd` |

### Routing
```
'' → HomeComponent
'/about-me' → AboutMeComponent
'/experiences' → ExperiencesComponent
'/skills' → SkillsComponent
'/blog' → BlogComponent
'/blog/:slug' → ArticleDetailComponent
'**' → redirect to ''
```

### i18n strategy
- `I18nService.t(key)` for static UI labels
- Bilingual data: `i18n.isFa ? (item.nameFa || item.name) : item.name` — FA falls back to EN
- `html[dir="rtl"]` + Vazirmatn font auto-applied when FA is active

### Tailwind v4 notes
- Config is CSS-first in `styles.css` via `@theme { ... }` block
- Deprecated class names: `bg-gradient-to-*` → `bg-linear-to-*`, `flex-shrink-0` → `shrink-0`, `start-*` → `inset-s-*`

---

## Frontend-Admin Architecture (Angular 20)

### Auth flow
1. Login page POSTs to `POST /api/auth/login` → receives `{ access_token: string }`
2. `AuthService` stores token in `localStorage`
3. `AuthInterceptor` (class-based, registered via `HTTP_INTERCEPTORS`) attaches `Authorization: Bearer <token>` to every request
4. `AdminGuard` checks `AuthService.isLoggedIn()` to protect all admin routes
5. `withInterceptorsFromDi()` is required in `provideHttpClient()` for class-based interceptors to work in Angular 17+

### Component pattern
- All admin components are inline-template standalone components
- Lazy loaded via `loadComponent` in routes
- Side-by-side EN/FA layout: EN fields labeled in blue, FA fields labeled in green with `dir="rtl"`

### Error handling
- `ErrorInterceptor` catches HTTP errors and dispatches to `NotificationService`
- 401 errors trigger logout + redirect to `/login`

---

## Dev Workflow

### Starting full stack locally
```bash
# 1. Start PostgreSQL
docker-compose -f docker-compose.dev.yml up -d postgres

# 2. Backend
cd backend
cp .env.development .env
npm run prisma:push
npm run start:debug     # node --inspect on port 9229

# 3. Frontend Site
cd frontend-site
npm start               # port 4200, proxies /api → localhost:3000

# 4. Frontend Admin
cd frontend-admin
npm start -- --port 4201  # port 4201, proxies /api → localhost:3000
```

### VS Code debug
- `Full Stack: Debug All` compound config in `launch.json` starts all three
- NestJS attaches to port `9229`
- Angular debugs via Chrome DevTools protocol

### After schema changes
```bash
cd backend
npx prisma db push      # apply schema to DB
npx prisma generate     # regenerate Prisma client types
# Then restart backend (nest start --watch does NOT pick up node_modules changes)
```
