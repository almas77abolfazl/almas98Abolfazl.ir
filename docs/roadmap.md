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

**Status:** 7.1–7.4, 7.6 done (7.5 toggle animation dropped by decision — minor polish). Introduced a custom **"Iris Violet"** identity — iris-violet primary + orchid gradient partner + muted-jade success + iris-tinted neutrals — applied by overriding Tailwind v4 color scales in `styles.css` `@theme` (no UI restructure). Light mode now uses a soft off-white base so cards no longer vanish into white; dark mode uses deep iris-charcoal instead of default slate-blue. Added FOBT-prevention inline script, live OS-preference following, and `theme-color` sync.

- System preference detection + live change listening ✅
- Prevent flash of wrong theme (inline script) ✅
- Theme-aware color audit + semantic tokens ✅
- Theme toggle animation 🔲

## Phase 8: Admin Panel UI Overhaul 🔶

**Goal:** Turn the functional admin panel into a modern dashboard.

**Status:** 8.0–8.7, 8.8, 8.9, 8.10, 8.11 done. 8.7 drag-and-drop ordering (Angular CDK) and 8.11 site settings (skills card-view toggle) now complete.

Completed deliverables:
- Responsive sidebar, mobile drawer, active route highlighting (8.1)
- Visual stat cards + daily-traffic chart (8.2)
- Bilingual admin UI with language toggle (8.10)
- Sortable tables, empty states, toast + confirm modals (8.3)
- Form validation, unsaved-changes guard (8.4)
- Markdown rich-text editor for articles (8.5)
- Media / avatar / article cover image uploads (8.6, 8.8, 8.9) — see *Media & Uploads* below
- Drag-and-drop ordering (8.7) — Angular CDK reorder of experiences/educations/skills via `PATCH /api/admin/{entity}/reorder`
- Site settings (8.11) — singleton `SiteSettings` (skills card-view toggle); public `GET /api/settings`, admin `GET/PUT /api/admin/settings`; see *Site Settings* below

### Media & Uploads (8.6 / 8.8 / 8.9)

A single generic image-upload pipeline serves every image need:

- **Backend**: `POST /api/admin/media/upload` (admin-guarded, `FileInterceptor`, images only, 5 MB cap) saves to `backend/uploads/` and creates a `Media` record. Files are served at `/api/uploads/*` by the NestJS app (`app.useStaticAssets` in `main.ts`).
- **Admin UI**: reusable `ImageUploadComponent` (drag-and-drop + click, preview, progress, remove) bound to `coverUrl` (articles), `thumbnailUrl` (videos), `avatarUrl` (about-me).
- **Inline article images**: the Markdown editor toolbar has an "Insert image" button that uploads and inserts `![alt](url)` at the cursor; rendered inline on the public site.
- **Persistence**: `docker-compose.yml` mounts `./uploads:/app/uploads`; `backend/uploads/` is git-ignored.
- The public site already renders `coverUrl` (blog cards + article header + OG image), `thumbnailUrl` (videos), and `avatarUrl` (home hero).

### Site Settings (8.11)

A singleton settings row drives site-wide display options.

- **Schema**: `SiteSettings` model `{ id, skillsCardView Boolean @default(false), createdAt, updatedAt }` — `prisma db push` applied.
- **Backend**: `SiteSettingsModule` exposes public `GET /api/settings` (returns or lazily creates the singleton row) and is reused by `AdminController` for admin `GET/PUT /api/admin/settings` (admin-guarded). `SiteSettingsService.getSettings()` creates the row on first read.
- **Admin UI**: a toggle card on the Skills page controls `skillsCardView` (bilingual `skills_display` / `skills_display_help`), persisted via `PUT /api/admin/settings`.
- **Public site**: `ApiService.getSettings()` provides `skillsCardView`; the Skills page renders either proficiency bars (default) or compact pill cards.

### Testimonials on Public Site (9.2)

Approved testimonials are now surfaced on the homepage, and visitors can submit new ones.

- **Backend**: public `TestimonialsModule` — `GET /api/testimonials` returns only `APPROVED` rows (newest first); `POST /api/testimonials` accepts public submissions stored with `status: PENDING` (admin approves/rejects in the panel). A public `POST /api/testimonials/upload` endpoint (image-only, 5 MB cap) reuses `UploadsService` to store avatars in `backend/uploads/` and returns `{ url }`. Registered in `AppModule`.
- **Frontend**: `ApiService.getTestimonials()` + `postTestimonial()` + `uploadTestimonialImage()`. The homepage shows a responsive grid of approved testimonial cards (content with `contentFa`→`content` fallback, author + role/company with `Fa` fallback, `authorImageUrl` avatar with initials fallback) plus a "Leave a testimonial" form (name, role/company, message, optional photo upload via drag-and-drop/click) that posts to the public endpoint. Public submissions mirror the entered text into both EN and Fa fields so testimonials are visible in either site language. Star rating removed entirely. Bilingual i18n keys added.
- **Admin**: the testimonials page shows each entry with the uploaded avatar (or initials), bilingual name/role/content (respects the admin language toggle), the submitter's email (stored, never shown publicly), a created-date, a status badge, and Approve/Reject actions; filter tabs (All / Pending / Approved / Rejected with counts) let the owner review uploaded photos before approving.
- **Email + anti-spam**: both testimonials and contact messages now require a valid email (server-validated, `400` on bad input). A `RateLimitService` (5 submissions / 10 min per IP) returns `429` on the public `POST` endpoints; `main.ts` trusts the proxy so rate limits use the real client IP. The admin mobile drawer hide transform is now direction-aware (correct in both LTR and RTL).

## Phase 9: Additional Features 🔶

**Goal:** Optional enhancements and new sections.

**Status:** 9.2 (public testimonials), 9.3 (RSS feed), 9.9 (custom 404), and 9.10 (reading progress bar — already shipped in Phase 4.6) are done. The following were **dropped by decision** as low-value for a personal portfolio:

- **9.4 PWA** — visitors don't install/offline-use a portfolio.
- **9.5 Search** — only a handful of articles; revisit only if the blog grows large.
- **9.6 OG image generation** — heavy (puppeteer/canvas) for a small VPS; a default OG image + manual article covers suffices.
- **9.7 Newsletter** — email-sending infra is heavy; RSS (9.3) already covers "follow for new posts".
- **9.8 Copy-code buttons** — nice-to-have, not needed.

Remaining portfolio work moved to **Phase 10** below (Projects section + résumé download).

### RSS Feed (9.3)

Published articles are exposed as an RSS 2.0 feed for readers and feed aggregators.

- **Backend**: `RssModule` — public `GET /api/feed.xml` builds RSS 2.0 XML from published articles (newest first, capped at 50). Supports an optional `?lang=fa`/`?lang=en` filter. Each item carries `title`, `link`, `guid` (permalink), `pubDate` (RFC-822), `description` (excerpt), a `category` per tag, and the full Markdown body in `content:encoded` (CDATA-wrapped). Base URL from `SITE_URL`; channel title/description overridable via `SITE_NAME`/`SITE_DESCRIPTION`.
- **Nginx**: maps public `/feed.xml` → backend `/api/feed.xml` (same pattern as the sitemap).
- **Discovery**: `<link rel="alternate" type="application/rss+xml" href="/feed.xml">` added to `index.html` so browsers/readers autodiscover the feed. A visible RSS link + icon also lives in the site footer.

## Phase 10: Portfolio Polish ✅

**Goal:** Round out the portfolio with the features that matter most for showcasing work.

- **10.1 Projects / Portfolio section** ✅ — `Projects` model (bilingual, `techStack[]`, `liveUrl`/`repoUrl`/`coverUrl`, `order`); public `GET /api/projects` + admin CRUD + reorder; card grid with tech badges and links.
- **10.2 Résumé / CV download (PDF)** ✅ — "Download résumé" button on the About page plus a prominent **Resume** button in the header (shown when `resumeUrl` is set). Resume is uploaded via the admin About page (`FileUploadComponent`) — same endpoint as the avatar, now accepting PDF/DOC.
- **10.3 Grouped skills with managed categories** ✅ — new `SkillCategory` model (bilingual titles + order) + relation on `Skill`; public `GET /api/skill-categories` (with nested skills); admin CRUD page; skills form uses a category dropdown instead of free-text. Legacy `category` field kept as a fallback.

## Phase 11: Site Customization ✅

- **11.1 Theme color customization** ✅ — `SiteSettings` gained `themeMode` (`default`/`custom`), `themePrimary`, `themeSecondary`. The public site's themeable utilities already read `--brand-*` CSS variables; a new `ThemeColorService` applies them at bootstrap from `GET /api/settings` (persisted to `localStorage`, re-applied before first paint via an `index.html` inline script). The dedicated Admin **Settings** page (`/admin/settings`) has a **Theme** card: Default + 3 curated presets (Iris Violet / Crimson Rose / Azure / Amber Glow) + a 2-color custom picker with live preview, saved via `PUT /api/admin/settings`. Primary buttons use the brand gradient. The site name/logo uses the brand gradient too. Admin panel keeps its own fixed palette.
- **11.2 Section visibility toggles** — add boolean flags to `SiteSettings` (`showAbout`, `showSkills`, `showProjects`, `showVideos`, `showTestimonials`, `showArticles`, `showExperiences`, `showEducations`, `showContact`); the public site's nav/footer/home hide a section when its flag is off. Managed from a "Sections" area in admin Settings.
- **11.3 Admin login page redesign** ✅ — a branded, full-screen centered login card (logo mark, gradient accent, EN/FA labels, back-to-site link, language toggle) reusing the brand palette. Auth flow unchanged.

## Phase 12: Content Flow & UX Polish 🔲

**Goal:** make the home → dedicated-page navigation logical and polish a few component visuals.

- **12.1 Home → About Me content flow** ✅ — the home hero previously rendered the *full* `bio` and the "About Me / بیشتر بدانید" CTA linked to `/about-me` which rendered the *same* full `bio` (redundant). The hero now shows the bio as a short teaser (`line-clamp-3`); the full biography lives only on the About Me page, so "read more" reveals genuinely *more*.
- **12.2 Skills group-name appearance** ✅ — `/skills` group headers use a gradient initial badge + bold title + skill-count chip.
- **12.3 Persian hero greeting** ✅ — `خوش آمدید` → `درود`; `سلام، من ابوالفضل` → `ابوالفضل هستم`.
- **12.4 Testimonials: horizontal scroll + ellipsis + modal** ✅ — horizontal scroll carousel with `line-clamp` text, prev/next buttons, drag-to-scroll, RTL-aware direction, and a full-text modal (click card → modal; Esc / backdrop / × to close; body scroll lock).
- **12.5 Admin sidebar group headers** ✅ — group labels (Content / Engagement / System) use a colored dot (iris / jade / amber) + trailing divider, on both the desktop sidebar and mobile drawer.



- **6.7 SSR / Prerender** — **deferred by decision.** Client-side `SeoService` works for Google (renders JS), and the homepage — the primary shared link — already has correct static OG tags in `index.html`. The only gap is per-route social previews for *deep* links, which are rare for a personal portfolio. Prerendering the static routes wouldn't fix article previews anyway (only full SSR would), and full SSR requires a persistent Node process (breaks pure-static Nginx) — disproportionate here. Revisit with **full SSR** (or a targeted backend OG endpoint) only if/when individual article links are actively shared on social media.
- **7.5 Theme toggle animation** — dropped by decision (minor polish).

## Phase 13: About Me Hub, Contact & Social Footer ✅

> **Status:** 13.1–13.8 implemented and committed (tabbed About Me hub, contact tab, social footer, resume link fix). The homepage hero shows a bio teaser; standalone `/experiences` + `/skills` routes redirect to `/about-me`.

- **13.1 AboutMe profile + social fields** — add nullable `email`, `phone`, `location`, and social URLs (`linkedinUrl`, `githubUrl`, `youtubeUrl`, `twitterUrl`, `instagramUrl`) to `AboutMe`; `prisma db push` applied. Public `GET /about-me` already returns the full row so new fields flow through.
- **13.2 Admin About Me form** — add contact + social inputs (persisted via `POST /api/admin/about-me`).
- **13.3 Tabbed About Me page** — `/about-me` becomes **Bio | Experience | Education | Skills | Contact**; reuses existing experiences/skills rendering and adds a new Education tab (there is currently no public Educations page). Tabs gated by the Phase 11.2 visibility flags.
- **13.4 Routing cleanup** — drop standalone `/experiences` + `/skills` routes; redirect old links to `/about-me`; keep home teasers.
- **13.5 Contact tab** — personal-info card (email `mailto:`, phone `tel:`, location) + the existing message form moved here from the home page; home gets a compact CTA instead of the duplicated form.
- **13.6 Footer social links** — `FooterComponent` renders owner-editable social/profile icons (LinkedIn / GitHub / YouTube / Twitter / Instagram) alongside the existing RSS link.
- **13.7 Person JSON-LD `sameAs`** — populate the home `Person` structured data from the AboutMe social URLs.
- **13.8 Resume link bug** — add `download` to resume links, make the `/api/uploads/...` URL robust (prefix `SITE_URL` if relative), verify nginx serves uploads, drop the seed placeholder.

## Phase 14: Dynamic Site Identity & Admin Token Handling 🔲

> **Goal:** remove every hard-coded owner name and domain so the project is fork-friendly, and harden the admin session.

- **14.1 Dynamic owner name** ✅ — the owner name is no longer hard-coded in templates, SEO meta, JSON-LD or the RSS feed. All reads come from `AboutMe.fullName` / `fullNameFa` (editable in the admin About Me form) via the frontend-site `SiteConfigService` and the backend RSS service.
- **14.2 Dynamic site name + domain** ✅ — `SiteSettings` gained `siteName` and `siteUrl` (editable in the admin **Settings** page). `SITE_URL` / `SITE_NAME` env vars remain as fallbacks. The frontend-site `SiteConfigService` resolves the canonical URL for SEO/OG/canonical/sitemap; backend `sitemap` + `rss` services prefer the DB value, then the env, then a default. The footer shows the configured site name and a derived brand glyph.
- **14.3 SEO description placeholder** ✅ — `i18n` SEO description strings use a `{name}` token resolved at runtime against the owner name, so they stay bilingual and fork-friendly.
- **14.4 Admin token handling** ✅ — `AuthService.isLoggedIn()` now validates the JWT `exp` (best-effort client check) and the `ErrorInterceptor` logs the admin out and redirects to `/login` on any `401` from a guarded endpoint. Expired/invalid tokens therefore never silently persist.
- **14.5 Dashboard Top Pages — friendly names** ✅ — the Top Pages list now shows localized page names instead of raw route paths (a `pageLabel()` helper maps `/`, `/about-me`, `/blog`, `/blog/:slug`, `/videos`, `/projects`, … using the admin i18n keys; article URLs render as `Article · <slug>`). New i18n keys `page_blog` / `page_article` / `page_notFound`.
- **14.6 Dashboard horizontal scroll fix** ✅ — the dashboard's phantom horizontal scrollbar (caused by the daily-traffic chart's `whitespace-nowrap` hover tooltips overflowing the chart card while the shell `<main>` is `overflow-auto`) is fixed by clipping horizontal overflow on the chart container (`overflow-x-clip`).

## Timeline

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Backend + Main Website | ✅ Done |
| 2 | Admin Panel + Testimonials | ✅ Done |
| 3 | Analytics | ✅ Done |
| 3.5 | Bilingual + UI Polish | ✅ Done |
| 4 | Article System Overhaul | ✅ Done |
| 5 | Video Embeds | ✅ Done |
| 6 | SEO Optimization | 🔶 6.1–6.6 done (6.7 SSR/prerender deferred by decision) |
| 7 | Dark/Light Theme Polish | 🔶 7.1–7.4, 7.6 done (7.5 dropped by decision) |
| 8 | Admin Panel UI Overhaul | ✅ 8.0–8.11 done |
| 9 | Additional Features | 🔶 9.2, 9.3, 9.9, 9.10 done; 9.4–9.8 dropped |
| 11 | Site Customization | ✅ 11.1 theme colors ✅; 11.2 section visibility ✅; 11.3 login redesign ✅ |
| 12 | Content Flow & UX Polish | 🔶 12.1–12.5 done (home/about-me flow, skills/hero/testimonials/admin polish) |
| 13 | About Me Hub, Contact & Social Footer | ✅ 13.1–13.8 done (tabbed about-me, contact tab, social footer, resume bug) |
| 14 | Dynamic Site Identity & Admin Token Handling | 🔲 14.1–14.4 done (dynamic name/domain, SEO placeholder, admin 401 logout) |

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
