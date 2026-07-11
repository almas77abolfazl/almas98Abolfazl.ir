# Roadmap

## Project Overview

Personal portfolio website for `almas98Abolfazl.ir` with public showcase, admin management panel, and analytics dashboard.

- **Stack:** NestJS + Prisma + PostgreSQL (backend), Angular 20 (frontend), Nginx + Docker Compose (deployment)
- **Deployment target:** Single VPS (2 CPU, 2GB RAM, 40GB SSD)
- **Constraint:** No staging environments, no microservices, no enterprise complexity

## Architecture

```
almas98Abolfazl.ir/
├── backend/           # NestJS API
├── frontend-site/     # Angular SSG/Static (public)
├── frontend-admin/    # Angular SPA (admin panel)
└── docker-compose.yml
```

Services:
- **nginx** — Serves static frontend builds and proxies API requests to backend
- **backend** — NestJS API (single instance)
- **postgres** — PostgreSQL database

## Database Schema

| Table | Purpose |
|-------|---------|
| AboutMe | Personal information and bio |
| Experiences | Work history |
| Educations | Academic background |
| Skills | Technical skills with categories |
| Articles | Blog posts (published/unpublished) |
| Media | Images and video embeds |
| Testimonials | User reviews with admin approval |
| ContactMessages | Contact form submissions |
| PageViews | Page view tracking for analytics |

## Phase 1: Backend + Main Website ✅

**Goal:** Launch a functional public portfolio website.

Deliverables:
- Docker Compose setup with nginx, postgres, and backend
- Prisma schema and migrations for core tables (AboutMe, Experiences, Educations, Skills, Articles, Media)
- Public REST API endpoints for all public content
- Angular static site with homepage, about page, experiences, skills sections
- Responsive styling and Nginx static serving configuration

Key endpoints:
- `GET /api/about-me`
- `GET /api/experiences`
- `GET /api/educations`
- `GET /api/skills`
- `GET /api/articles`
- `GET /api/articles/:slug`
- `GET /api/media`

## Phase 2: Admin Panel + Testimonials ✅

**Goal:** Enable content management and user interaction features.

Deliverables:
- JWT authentication system (single admin user)
- Admin APIs for CRUD operations on all content types
- Angular admin SPA with login, dashboard, and management pages
- Contact form on public site with API endpoint
- Testimonial submission and admin approval workflow
- Blog section on public site with article detail pages

Key features:
- Admin login with JWT
- Dashboard with basic stats
- Content management (articles, experiences, skills, media)
- Contact messages inbox
- Testimonial moderation (approve/reject)

## Phase 3: Analytics ✅

**Goal:** Add visit tracking and reporting.

Deliverables:
- PageViews table and tracking middleware
- Analytics API endpoints
- Simple charts in admin dashboard
- Performance optimization and final polish

Key features:
- Page view tracking per URL
- Daily/weekly visit reports
- Basic chart visualization

## Phase 3.5: Bilingual + UI Polish ✅

**Goal:** Make the site fully bilingual (Persian/English) and modernize the UI.

Deliverables:
- `*Fa` fields added to all translatable Prisma models
- Admin forms with side-by-side EN/FA inputs
- Frontend-site bilingual display (FA falls back to EN)
- Modern minimal UI redesign (indigo/emerald palette, timeline, progress bars, hero)
- Blog + article-detail migrated to Angular 20 control flow syntax
- VS Code full-stack debug setup (`launch.json` + `tasks.json`)

## Phase 4: Article System Overhaul ✅

**Goal:** Replace bilingual article fields with a proper per-language system.

- Schema: remove `*Fa` fields; add `language`, `tags`, `readingTime`, `likeCount`; add `ArticleLike` model
- Backend: article likes API + `language` filter + auto reading-time calculation
- Admin: language dropdown, tags input, remove FA fields
- Frontend: language-filtered blog, tags, reading time, like button, reading progress bar

## Phase 5: Video Embeds ✅

**Goal:** Add a Videos section supporting YouTube and Aparat embeds.

- Schema: `Videos` model
- Backend: public GET + admin CRUD + embed URL helper
- Admin: videos management page
- Frontend: responsive video grid with lazy-loaded iframes

## Phase 6: SEO Optimization 🔶

**Goal:** Make every page crawlable with rich metadata.

**Status:** 6.1–6.6 done (client-side `SeoService`, per-page meta + Open Graph + Twitter, `Person`/`Article` JSON-LD, dynamic `sitemap.xml`, `robots.txt`, canonical/base tags). 6.7 (SSR/prerender) deferred by decision — the site stays static + Nginx for now.

## Phase 7: Dark/Light Theme Polish 🔶

**Goal:** Make the theme system polished and glitch-free.

**Status:** 7.1–7.4 done (7.5 toggle animation pending). Introduced a custom **"Iris Violet"** identity — iris-violet primary + orchid gradient partner + muted-jade success + iris-tinted neutrals — applied by overriding Tailwind v4 color scales in `styles.css` `@theme` (no UI restructure). Light mode now uses a soft off-white base so cards no longer vanish into white; dark mode uses deep iris-charcoal instead of default slate-blue. Added FOBT-prevention inline script, live OS-preference following, and `theme-color` sync.

- System preference detection + live change listening ✅
- Prevent flash of wrong theme (inline script) ✅
- Theme-aware color audit + semantic tokens ✅
- Theme toggle animation 🔲

## Phase 8: Admin Panel UI Overhaul 🔲

**Goal:** Turn the functional admin panel into a modern dashboard.

- Responsive sidebar, mobile menu, active route highlighting
- Visual stat cards + sparklines
- Sortable/paginated tables, empty states
- Toast notifications, validation, confirmation modals
- Markdown rich-text editor for articles
- Media / avatar / article cover image uploads
- Drag-and-drop ordering

## Phase 9: Additional Features 🔲

**Goal:** Optional enhancements and new sections.

- Projects section, public testimonials, RSS feed, PWA support
- Search, OG image generation, newsletter, copy-code buttons, custom 404, reading progress

## Timeline

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Backend + Main Website | ✅ Done |
| 2 | Admin Panel + Testimonials | ✅ Done |
| 3 | Analytics | ✅ Done |
| 3.5 | Bilingual + UI Polish | ✅ Done |
| 4 | Article System Overhaul | ✅ Done |
| 5 | Video Embeds | ✅ Done |
| 6 | SEO Optimization | 🔶 6.1–6.6 done (6.7 SSR deferred) |
| 7 | Dark/Light Theme Polish | 🔶 7.1–7.4 done (7.5 toggle animation pending) |
| 8 | Admin Panel UI Overhaul | 🔲 Not started |
| 9 | Additional Features | 🔲 Not started |

> Detailed task breakdowns for all phases live in `.ai/tasks.md`.

## Commit Convention

All commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`

Examples:
- `feat(backend): add AboutMe API endpoint`
- `fix(frontend-site): resolve responsive layout issue on mobile`
- `docs(roadmap): add phase 3 analytics section`
- `chore(docker): update nginx alpine base image`
