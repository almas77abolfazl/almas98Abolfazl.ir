# Tasks

## Phase 1: Backend + Main Website ✅

- [x] 1.1 Create monorepo folder structure (backend, frontend-site, frontend-admin)
- [x] 1.2 Create base docker-compose.yml (nginx, postgres, backend)
- [x] 1.3 Set up PostgreSQL database with Prisma
- [x] 1.4 Create initial tables (AboutMe, Experiences, Educations, Skills, Articles, Media)
- [x] 1.5 Implement public API endpoints for main website
- [x] 1.6 Build frontend site first phase (homepage, about me, experiences, skills)
- [x] 1.7 Initial styling and responsive layout
- [x] 1.8 Optimize build for static serving via Nginx

## Phase 2: Admin Panel + Testimonials ✅

- [x] 2.1 JWT authentication in backend
- [x] 2.2 ContactMessages + Testimonials tables
- [x] 2.3 Admin APIs for all entities (CRUD)
- [x] 2.4 Admin login page
- [x] 2.5 Admin dashboard
- [x] 2.6 Testimonial moderation (approve/reject)
- [x] 2.7 Contact form on main site
- [x] 2.8 Blog page + article detail page
- [x] 2.9 Admin panel connected to API

## Phase 3: Analytics ✅

- [x] 3.1 PageViews table
- [x] 3.2 Page view tracking on frontend (NavigationEnd)
- [x] 3.3 Analytics API (totals, top pages, daily chart)
- [x] 3.4 Simple stats display in admin dashboard

## Phase 3.5: Bilingual + UI Polish ✅

- [x] 3.5.1 Add `*Fa` fields to all translatable Prisma models (AboutMe, Experiences, Educations, Skills, Articles, Testimonials)
- [x] 3.5.2 Run `prisma db push` + `prisma generate`
- [x] 3.5.3 Update `admin.service.ts` + `admin.controller.ts` to accept FA fields
- [x] 3.5.4 Update admin panel forms with side-by-side EN/FA inputs
- [x] 3.5.5 Update `api.service.ts` interfaces with FA fields
- [x] 3.5.6 Update frontend-site components for bilingual display (FA fallback to EN)
- [x] 3.5.7 Redesign frontend-site UI — modern minimal (indigo/emerald, timeline, progress bars, hero)
- [x] 3.5.8 Blog + article-detail migrated to new Angular control flow syntax
- [x] 3.5.9 VS Code launch.json + tasks.json full-stack debug setup

---

## Phase 4: Article System Overhaul ✅

> **Goal**: Replace the current bilingual article approach with a proper per-language system. Each article is either EN or FA — no dual-language fields.

- [x] 4.1 **Schema migration**
  - Remove `titleFa`, `contentFa`, `excerptFa` from `Articles` model
  - Add `language String @default("en")` — values: `'en'` or `'fa'`
  - Add `tags String[]` — array of tag strings
  - Add `readingTime Int @default(0)` — estimated reading time in minutes (auto-calculated from content length)
  - Add `likeCount Int @default(0)` — cached count, incremented by likes API
  - Create `ArticleLike` model: `{ id, articleId FK, ipHash String, createdAt }` with `@@unique([articleId, ipHash])`
  - Run `prisma db push` + `prisma generate`

- [x] 4.2 **Backend: Article likes API**
  - `POST /api/articles/:slug/like` — public endpoint
  - Hash the requester's IP with SHA-256, attempt `prisma.articleLike.create()`
  - On unique constraint error = already liked (return 200 with `alreadyLiked: true`)
  - On success: increment `Articles.likeCount` via `prisma.articles.update({ data: { likeCount: { increment: 1 } } })`
  - Response: `{ likeCount: number, alreadyLiked: boolean }`

- [x] 4.3 **Backend: Update `GET /api/articles` and `GET /api/articles/:slug`**
  - Add `language` filter param: `GET /api/articles?lang=fa` — filter by language
  - Return `likeCount`, `readingTime`, `tags` in responses
  - Auto-calculate `readingTime` on create/update: `Math.ceil(wordCount / 200)` minutes

- [x] 4.4 **Admin: Article form update**
  - Add `language` dropdown (`English` / `فارسی`) — sets `dir` of content textarea
  - Add `tags` input (comma-separated chips)
  - Remove `titleFa`, `contentFa`, `excerptFa` fields from the form
  - Show `readingTime` as auto-calculated read-only field

- [x] 4.5 **Frontend: Blog page**
  - Filter articles by current `i18n.currentLang()` automatically: fetch `?lang=fa` or `?lang=en`
  - Show tags as pills on article cards
  - Show reading time badge
  - Show like count on cards

- [x] 4.6 **Frontend: Article detail page**
  - Show language badge (EN/FA indicator)
  - Show reading time
  - Show tags
  - Show like count with a clickable like button (heart icon)
  - Like button: POST to likes API, disable after liked (store in `localStorage` as `liked_${slug}`)
  - Reading progress bar at top of page (scroll-based, CSS/JS)

---

## Phase 5: Video Embeds ✅

> **Goal**: Add a Videos section to the portfolio where YouTube and Aparat videos can be embedded and displayed.

- [x] 5.1 **Schema: `Videos` model**
  ```prisma
  model Videos {
    id           String   @id @default(uuid())
    title        String
    titleFa      String?
    description  String?  @db.Text
    descriptionFa String? @db.Text
    platform     String   // 'youtube' | 'aparat'
    videoId      String   // YouTube video ID or Aparat video hash
    thumbnailUrl String?
    order        Int      @default(0)
    createdAt    DateTime @default(now())
    updatedAt    DateTime @updatedAt
  }
  ```
  - Run `prisma db push` + `prisma generate`

- [x] 5.2 **Backend: Public GET + Admin CRUD**
  - `GET /api/videos` — public, ordered by `order asc`
  - `GET /api/admin/videos` — admin list
  - `POST /api/admin/videos` — create
  - `PUT /api/admin/videos/:id` — update
  - `DELETE /api/admin/videos/:id` — delete
  - Helper (`videos/embed-url.util.ts`): generate embed URL from platform + videoId, exposed as computed `embedUrl` in the public response:
    - YouTube: `https://www.youtube.com/embed/{videoId}`
    - Aparat: `https://www.aparat.com/video/video/embed/videohash/{videoId}/t/1`

- [x] 5.3 **Admin: Videos management page**
  - New route: `/admin/videos`
  - Added to shell sidebar nav
  - Form: title (EN/FA), platform dropdown, videoId input, description (EN/FA), thumbnailUrl, order
  - List with preview thumbnail (auto-derives YouTube thumbnail when none provided)

- [x] 5.4 **Frontend: Videos page**
  - New route: `/videos` + header nav link
  - Responsive grid of video cards with thumbnail + title
  - Clicking a card swaps the thumbnail for an inline `<iframe>` using the embed URL
  - Lazy load iframes (only rendered when user clicks play; YouTube gets `autoplay=1`)
  - `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"` + `allowfullscreen`
  - iframe URLs sanitized via `DomSanitizer.bypassSecurityTrustResourceUrl`

---

## Phase 6: SEO Optimization 🔶 (6.1–6.6 done · 6.7 SSR deferred)

> **Goal**: Make every page crawlable with rich metadata for search engines and social sharing.
>
> **Implementation notes**: Domain is `https://almas98abolfazl.ir` (frontend: `shared/site-config.ts`; backend: `SITE_URL` env). Meta tags are applied client-side by `SeoService` — Google renders JS so this works for search, but JS-less social scrapers won't see per-route OG tags until SSR/prerender (6.7) is done.

- [x] 6.1 **Angular Meta service setup**
  - Created `SeoService` in `frontend-site/src/app/shared/services/seo.service.ts`
  - Uses `Title`, `Meta`, and `DOCUMENT`; methods: `setTitle`, `update(SeoData)`, `setJsonLd`, `clearJsonLd`
  - Shared constants in `shared/site-config.ts` (`SITE_URL`, `SITE_NAME`, `AUTHOR_NAME`, `DEFAULT_OG_IMAGE`, `SOCIAL_LINKS`)

- [x] 6.2 **Meta tags per page**
  - `<title>`: `Page Name | almas98Abolfazl.ir`
  - `<meta name="description">`: per-page, bilingual (i18n `seo*Desc` keys)
  - Open Graph: `og:title`, `og:description`, `og:type`, `og:url`, `og:site_name`, `og:locale`, `og:image`
  - Twitter Card: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
  - `SeoService.update()` called in each component (`home`, `about-me`, `experiences`, `skills`, `blog`, `videos`, `article-detail`)

- [x] 6.3 **Structured data (JSON-LD)**
  - HomePage: `Person` schema (name, jobTitle, url, image, optional `sameAs`)
  - Article pages: `Article` schema (headline, description, author, datePublished, dateModified, image, inLanguage)
  - Injected via a single managed `<script type="application/ld+json">`; `update()` clears stale JSON-LD on navigation

- [x] 6.4 **`sitemap.xml`**
  - Dynamic NestJS endpoint: `SitemapModule` → `GET /api/sitemap.xml` (static routes + published article slugs with `lastmod`)
  - Nginx maps public `/sitemap.xml` → backend `/api/sitemap.xml`
  - Base URL from `SITE_URL` env (added to `.env`, `.env.development`, `docker-compose.yml`)

- [x] 6.5 **`robots.txt`**
  - Static `frontend-site/public/robots.txt` — allows all crawlers, disallows `/admin`, points to sitemap URL

- [x] 6.6 **`index.html` base tags**
  - Default description, author, `theme-color`, OG defaults, Twitter card, and a canonical link (overridden per-route by `SeoService`)
  - `lang`/`dir` attributes managed at runtime by `I18nService`

- [ ] 6.7 **Angular SSR (optional, major upgrade)** — _deferred by decision_
  - Investigated (2026-07): homepage (primary shared link) already has correct static OG in `index.html`; Google indexes JS fine. Only gap = deep-link social previews (rare for a portfolio). Prerender-static wouldn't fix article previews (only full SSR would); full SSR needs a persistent Node process (breaks pure-static Nginx). Not worth it now.
  - Blockers to address if revisited: `ThemeService` (`window.matchMedia` in a field initializer) and `I18nService` (`localStorage`) need `isPlatformBrowser` guards; `SeoService` already uses the `DOCUMENT` token (SSR-safe).
  - Revisit with **full SSR** (or a targeted backend OG endpoint) only if individual article links get actively shared on social media.

---

## Phase 7: Dark/Light Theme Polish 🔶 (7.1–7.4, 7.6 done · 7.5 dropped)

> **Goal**: Make the theme system feel polished, native, and glitch-free.
>
> **Visual identity — "Iris Violet"**: A custom, minimal palette replaces the generic default-Tailwind indigo/emerald look. Implemented by overriding Tailwind v4 color SCALES in `styles.css` `@theme` so the new identity propagates to every existing utility class without touching UI structure:
> - `indigo-*` → **Iris Violet** (primary brand accent)
> - `violet-*` → **Orchid** (secondary / gradient partner — brand gradients are now iris→orchid, previously indigo→emerald)
> - `emerald-*` → **Muted Jade** (reserved for success & status only — online dot, "message sent")
> - `slate-*` → **Iris-tinted cool neutrals** (all backgrounds, borders, text)
>
> **Light contrast fix**: body base is a soft cool-gray (`--color-background: #eceef4`) so white cards/elements no longer get lost in white space; muted-text neutrals (`slate-400/500/600`) are darkened in light mode and re-lightened inside `.dark` for readable contrast in both modes.
> **Dark identity**: deep iris-charcoal (`#0f0f17` / `#1a1a26`) instead of default slate-blue.
> Brand gradient stops swapped from `to-emerald-*` → `to-violet-400` across header/footer logos, page-title underlines, skill/reading progress bars, and the decorative hero blob.

- [x] 7.1 **System preference on first load**
  - `ThemeService` reads `prefers-color-scheme` when no stored choice exists
  - Live-listens for `prefers-color-scheme` changes via `matchMedia(...).addEventListener('change', ...)` — follows the OS only while the user hasn't made an explicit choice

- [x] 7.2 **Prevent flash of wrong theme (FOBT)**
  - Inline `<script>` in `index.html` `<head>` reads `localStorage('app_theme')` (falling back to system pref) and applies `.dark` before first paint
  - `ThemeService` also syncs the `<meta name="theme-color">` to the active theme

- [x] 7.3 **Theme-aware colors audit**
  - Palette centralized via scale overrides — every text/bg/border utility resolves to the new identity in both modes
  - Semantic colors preserved: success/status = jade green, likes = rose, errors = red

- [x] 7.4 **CSS custom properties for smoother transitions**
  - Semantic tokens (`--color-secondary`, `--color-accent`, `--color-background`, `--color-surface`, `--color-text`, `--color-text-muted`) defined in `@theme` and overridden in `.dark`
  - `body` transitions background/color; `gradient-text`, `divider`, `timeline`, `skill-tag` all driven by tokens

- [~] 7.5 **Theme toggle animation** — _dropped by decision (minor polish, not worth the time for a personal site)_

- [x] 7.6 **Typography & spacing system (8-point scale)**
  - Central shared primitives in `styles.css` `@layer components` (via `@apply`) applied across every page — no arbitrary margins/paddings:
    - `.page-shell` — common max-width container (`max-w-6xl` + responsive px); also used by header/footer for alignment
    - `.page-section` — vertical rhythm (`pt-10 pb-16 sm:pt-12 sm:pb-20`) so first content sits high
    - `.page-header` — gap between title block and content (`mb-8 sm:mb-10`)
    - Hierarchy: `.section-label` (eyebrow) → `.page-title` / `.section-title` → `.page-subtitle` → `.prose-measure`
    - `.title-underline` — iris→orchid accent bar
    - `.prose-measure` — caps body text to `65ch` with `leading-8` for readability
  - Applied to Home, About, Experiences, Skills, Blog, Videos, Article detail, Contact (+ header/footer container)
  - Reduced hero top padding, removed oversized `lg:text-6xl`, standardized heading sizes/weights with `tracking-tight`
  - RTL typography: latin letter-spacing removed for Persian labels/headings, extra line-height (2.1) for Persian long-form text
  - Responsive spacing tuned for mobile/tablet via `sm:` steps

---

## Phase 8: Admin Panel UI Overhaul 🔶 (8.1, 8.2, 8.3, 8.4, 8.10 done · 8.5+ pending)

> **Goal**: Make the admin panel look and feel like a real modern dashboard (currently functional but minimal/raw).
>
> **Design system unified with the public site**: `frontend-admin/src/styles.css` now carries the same **Iris Violet** identity (the `indigo-*`/`violet-*`/`emerald-*`/`slate-*` scale overrides) and the critical `@custom-variant dark (&:where(.dark, .dark *));` so `dark:` utilities respond to the `.dark` class (previously broken — admin dark mode was effectively non-functional). Shared primitives added in `@layer components`: `.admin-card`, `.admin-stat`, `.admin-stat-icon`, `.admin-title`, `.admin-nav-link(-active)`.

- [x] 8.0 **Design system + dark mode**
  - Iris Violet palette + `@custom-variant dark` applied to `frontend-admin/src/styles.css`
  - New `ThemeService` (mirrors public site) + toggle button in the header so dark mode actually switches
  - Shared admin component classes (`.admin-card`, `.admin-stat`, `.admin-stat-icon`, `.admin-title`, `.admin-nav-link`)

- [x] 8.1 **Layout improvements**
  - `ShellComponent` rewritten: responsive sidebar (desktop `lg:flex` fixed; mobile `lg:hidden` drawer with backdrop + slide-in)
  - Mobile hamburger in top header opens/closes the drawer; drawer closes on link click
  - Active route highlighting via `routerLinkActive` (`admin-nav-link-active`)
  - Sidebar footer: avatar + "Admin / almas98" + Logout button (desktop and drawer)

- [x] 8.2 **Dashboard stats cards**
  - Stat cards rebuilt as `.admin-stat` (icon chip + label + value); messages, pending testimonials (amber), page views
  - Daily-traffic bar chart recolored to iris→orchid gradient; Top Pages list kept; rhythm via `admin-title` + spacing tokens

- [x] 8.10 **Bilingual admin UI (language toggle)**
  - New `AdminI18nService` (`core/services/admin-i18n.service.ts`): signal-based `currentLang` ('en'/'fa'), `t(key, params?)` with `{n}` interpolation, `toggleLang()`, persistence in `localStorage('admin_lang')`, applies `html.lang`/`html.dir` (defaults to **fa** so the owner's panel opens in Persian/RTL)
  - Language toggle button added to the shell header (next to the theme toggle)
  - All admin chrome translatable: nav, titles, buttons (Add/Update/Cancel/Save/Edit/Delete), table headers, status badges, login form, dashboard labels
  - Remaining admin forms restyled to the Iris Violet design system + bilingual EN/FA content fields: `articles`, `videos`, `testimonials`, `contact-messages`, `auth/login` (previously raw `bg-gray-*` Tailwind)

- [x] 8.3 **Table improvements**
  - New `ToastService` (`core/services/toast.service.ts`): signal-based stack, auto-dismiss, success/error/info types
  - New `ConfirmService` + `ConfirmDialogComponent` (`core/components`): reusable confirmation modal (used for all delete actions, replaces inline delete)
  - Sortable columns on all entity tables (educations, skills, experiences, articles, videos) with asc/desc toggle + arrow indicator
  - Empty-state rows for tables and empty-state cards for testimonials/contact-messages (`@empty` + `noItems` key)
  - Row hover effect via `.admin-row` class

- [x] 8.4 **Form improvements**
  - Toast notifications on save/add/update/delete (replaces the inline "Saved successfully!" message in About Me)
  - Confirmation modal for delete actions (8.3 above)
  - Unsaved-changes warning before navigation via `pendingChangesGuard` (`core/guards`) + `canDeactivate()` on form components (tracks `dirty` via form `input`/`change` listeners)
  - Field validation: native `required` attributes preserved; *pagination/infinite scroll for very large lists is deferred* (current datasets are small)

- [x] 8.5 **Article rich text editor** ✅ (custom `app-markdown-editor` with live preview + toolbar)

- [x] 8.6 **Media upload** ✅
  - Reusable `ImageUploadComponent` (drag-and-drop zone + click, preview, progress spinner, remove) in `frontend-admin/src/app/core/components/image-upload.component.ts` + `.html`
  - Backend: `POST /api/admin/media/upload` (admin-guarded, `FileInterceptor`, images only, 5MB limit) saves to `backend/uploads/` and creates a `Media` record; files served at `/api/uploads` via `app.useStaticAssets(uploadsDir, { prefix: '/api/uploads' })` in `main.ts`
  - Implemented as a **single generic image-upload endpoint** reused by avatar/cover/thumbnail rather than separate per-entity endpoints (simpler, consistent)
  - `.gitignore` ignores `backend/uploads/`; `docker-compose.yml` mounts `./uploads:/app/uploads` so uploads persist
  - Frontend: blog/article already consumes `coverUrl`, videos consume `thumbnailUrl`, home already renders `aboutMe.avatarUrl`

- [x] 8.8 **Admin user avatar upload** ✅
  - About Me form now uses `ImageUploadComponent` (`shape="avatar"`) bound to `avatarUrl`
  - Backend saves via the generic `/api/admin/media/upload` endpoint (no separate `about-me/avatar` endpoint needed)
  - Public site already renders `aboutMe.avatarUrl` in the hero/about section

- [x] 8.9 **Article cover image upload** ✅
  - Article form uses `ImageUploadComponent` bound to `coverUrl` (the `Articles` model already had `coverUrl` — no schema migration required)
  - Shown at the top of the article-detail header and already used as `og:image` (wired in Phase 6 SEO)

- [x] 8.7 **Drag-and-drop ordering** ✅
  - Experiences, Educations, Skills list have an `order` field
  - Implement drag-and-drop reordering via Angular CDK `DragDropModule` (drag handle + preview/placeholder global styles in `frontend-admin/src/styles.css`)
  - Backend: `PATCH /api/admin/{experiences,educations,skills}/reorder` — accept `[{ id, order }]` and bulk-update inside a `$transaction`
  - Admin tables (educations, experiences, skills) use `cdkDropList`/`cdkDrag`/`cdkDragHandle`; `reorder()` calls the endpoint, reloads, and toasts

- [x] 8.11 **Site settings** ✅
  - New `SiteSettings` Prisma model: `{ id, skillsCardView Boolean @default(false), createdAt, updatedAt }` (singleton row)
  - Backend `SiteSettingsModule` (`site-settings/`): public `GET /api/settings` (returns/creates the singleton), reused by `AdminController` for admin `GET/PUT /api/admin/settings`
  - `SiteSettingsService.getSettings()` lazily creates the row on first read
  - Admin: skills page has a toggle card (`.admin-card`) controlling `skillsCardView` — bilingual label `skills_display`/`skills_display_help`, persisted via `PUT /api/admin/settings`
  - Public site: `ApiService.getSettings()` → `skillsCardView`; Skills page renders either proficiency bars (default) or compact pill cards (`cardView()` signal)
  - Run `prisma db push` + `prisma generate` to create the `SiteSettings` table

---

## Phase 9: Additional Features (My Ideas) 🔲

- [ ] 9.1 **Portfolio / Projects section**
  - Add `Projects` model: `{ title, titleFa, description, descriptionFa, techStack String[], liveUrl?, repoUrl?, coverUrl?, order }`
  - Separate from Experiences — these are personal side projects / open source
  - Display as cards with tech badges and links

- [x] 9.2 **Testimonials on public site** ✅
  - Previously: testimonials managed in admin but NOT shown publicly, and no public submit endpoint
  - Backend: new public `TestimonialsModule` (`testimonials/`) — `GET /api/testimonials` returns only `APPROVED` testimonials (ordered by `createdAt desc`); `POST /api/testimonials` lets visitors submit (stored with `status: PENDING`, admin approves in panel)
  - Frontend-site: `ApiService` `getTestimonials()` + `postTestimonial()` + `uploadTestimonialImage()` + `Testimonial` interface
  - Homepage: a responsive grid of approved testimonial cards (quote icon, content with `contentFa`→`content` fallback, author name + role/company with `Fa` fallback, circular avatar or initials fallback)
  - Public submission is **bilingual**: the entered name/role/content is mirrored into both the EN (`authorName`/`companyRole`/`content`) and FA (`*Fa`) fields so a testimonial is visible in either site language
  - Backend: public `POST /api/testimonials/upload` (image-only, 5 MB cap, unauthenticated) reuses `UploadsService` to save into `backend/uploads/` and returns `{ url }`; the form then posts `authorImageUrl`
  - Homepage: a "Leave a testimonial" form (name, role/company, message, optional photo upload via drag-and-drop/click) posting to the public endpoint with success/error states
  - Optional `authorImageUrl` on the `Testimonial` model — visitors may upload a photo; cards show the avatar (circular) with an initials fallback
  - Star rating removed entirely (schema `rating` column dropped, all UI/API references gone)
  - Admin panel: testimonials page redesigned to show each entry with the uploaded avatar (or initials), bilingual name/role/content (respects the admin language toggle), a created-date, a status badge, and Approve/Reject actions; filter tabs (All / Pending / Approved / Rejected with counts) let the owner review uploaded photos before approving. Added `filter_all` i18n key
  - Email is now collected for **both** testimonials and contact messages (required, server-validated). Testimonial `email` is stored but **never shown on the public site** (only visible to the owner in the admin review card)
  - **Anti-spam**: a `RateLimitService` (in-memory sliding window, 5 submissions / 10 min per IP) guards `POST /api/testimonials` and `POST /api/contact-messages`; exceeding it returns `429`. `main.ts` sets `trust proxy` so `req.ip` reflects the real client behind Nginx. Public endpoints also enforce required-field validation (name + message + valid email) returning `400` instead of storing bad data
  - **Admin mobile drawer fix**: the `ShellComponent` drawer used `translate-x-full` to hide, which left it stuck mid-screen in LTR (and wrong direction in RTL). Replaced with an `admin-mobile-drawer` class whose hide transform is direction-aware via global CSS (`translateX(-100%)` in LTR, `translateX(100%)` in RTL)
  - i18n keys added (EN/FA): `testimonialsTitle`, `testimonialsSubtitle`, `noTestimonials`, `testimonialLeave`, `testimonialLeaveDesc`, `testimonialName`, `testimonialCompany`, `testimonialEmail`, `testimonialContent`, `testimonialImage`, `testimonialUploadHint`, `testimonialUploading`, `testimonialChoose`, `testimonialReplace`, `testimonialRemove`, `testimonialUploadFailed`, `testimonialSubmit`, `testimonialSuccess`

- [x] 9.3 **RSS feed** ✅
  - New `RssModule` (`rss/`) — public `GET /api/feed.xml` returns RSS 2.0 XML for published articles (newest first by `publishedAt`→`createdAt`, capped at 50)
  - Optional `?lang=fa`/`?lang=en` filter (mirrors the articles language filter); `<language>` channel tag reflects it
  - Per-item: `title`, `link`, `guid` (permalink), `pubDate` (RFC-822), `description` (excerpt), `category` per tag, and full Markdown body in `content:encoded` (CDATA-wrapped, `]]>`-safe)
  - `Content-Type: application/rss+xml`; base URL from `SITE_URL` env (channel title/description overridable via `SITE_NAME`/`SITE_DESCRIPTION`)
  - Nginx maps public `/feed.xml` → backend `/api/feed.xml` (same pattern as sitemap)
  - `<link rel="alternate" type="application/rss+xml" href="/feed.xml">` added to `index.html` `<head>` for feed autodiscovery
  - Visible RSS link + icon added to the site footer (bilingual `rssFeed` i18n key), opening `/feed.xml`
  - Dev proxy fix: `frontend-site/proxy.conf.json` now forwards `/feed.xml` and `/sitemap.xml` to the backend so they work on the Angular dev server (port 4200), not just behind Nginx
  - Cleaned a broken published article (empty title/slug) from the DB so it no longer appears in the feed

  - **9.3 follow-ups (future, optional):**
    - [ ] Per-language feed discovery: add `<link rel="alternate" ... href="/feed.xml?lang=fa">` / `?lang=en` in `<head>`, and expose both feeds (EN/FA) in the footer instead of one generic link
    - [ ] Add `<enclosure>`/media namespace for the article `coverUrl` so readers show a thumbnail
    - [ ] Add author info (`<dc:creator>` via the Dublin Core namespace)
    - [ ] Rewrite relative image/link URLs inside `content:encoded` (e.g. `/api/uploads/...`) to absolute URLs so feed readers can load images
    - [ ] Feed caching / conditional GET (`ETag` or `Last-Modified` + `If-Modified-Since`) to avoid re-rendering on every crawler hit
    - [ ] Consider a summary-only variant (drop `content:encoded`) if full-content syndication/scraping becomes a concern

- [~] 9.4 **PWA support** — _dropped (low ROI for a personal portfolio; visitors don't install/offline-use a portfolio)_

- [~] 9.5 **Search** — _dropped for now (only 2–3 articles; revisit only if the blog grows large)_

- [~] 9.6 **Open Graph image generation** — _dropped (heavy: puppeteer/canvas on a small VPS; a good default OG image + manual article covers is enough)_

- [~] 9.7 **Newsletter subscription** — _dropped (email-sending infra + subscriber management is heavy; the RSS feed (9.3) already covers "follow for new posts")_

- [~] 9.8 **Copy code blocks** — _dropped by decision (nice-to-have, not needed)_

- [x] 9.9 **404 page** ✅
  - `NotFoundComponent` (bilingual EN/FA) with styled 404, back-to-home + articles links
  - Wildcard route now renders it (`{ path: '**', component: NotFoundComponent }`) instead of redirecting to home
  - i18n keys: `notFoundTitle`, `notFoundMessage`, `backToHome`
  - `SeoService.update()` gained a `noindex` flag (adds `robots: noindex, follow`, reset to `index, follow` on every other page so it doesn't leak); 404 sets it

- [x] 9.10 **Reading progress bar** ✅ _(already implemented in 4.6)_
  - Article detail pages show a thin top progress bar driven by `@HostListener('window:scroll')` + a `progress` signal (`article-detail.component.ts`/`.html`)

---

## Phase 10: Portfolio Polish 🔲

- [x] 10.1 **Projects / Portfolio section** ✅
  - `Projects` Prisma model: `{ id, title, titleFa?, description?, descriptionFa?, techStack String[], liveUrl?, repoUrl?, coverUrl?, order, timestamps }` (`prisma db push` applied)
  - Backend: public `GET /api/projects` (`ProjectsModule`, ordered by `order asc`); admin CRUD in `AdminController`/`AdminService` (`GET/POST/PUT/DELETE /api/admin/projects`) + `PATCH /api/admin/projects/reorder` (bulk `$transaction`, added `'projects'` to `bulkReorder` union)
  - Admin: `/admin/projects` page (bilingual EN/FA form, comma-separated tech stack, live/repo URLs, `ImageUploadComponent` cover, drag-and-drop reorder, sortable table) + sidebar nav item + i18n keys (`nav_projects`, `proj_*`)
  - Frontend-site: `/projects` route + header nav (desktop + mobile), `ApiService.getProjects()` + `Project` interface, responsive card grid (cover image, bilingual title/description, tech badges, live-demo + source-code links), SEO via `SeoService`, i18n keys (`projects`, `projectsTitle/Subtitle`, `noProjects`, `projectLive/Code`, `seoProjectsDesc`)
  - Sitemap: added `/projects` to `STATIC_PATHS`
  - Verified end-to-end: login → create → public GET (ordered) → reorder → delete, all green

- [x] 10.2 **Resume / CV download (PDF)** ✅
  - The About page already rendered a "Download Resume" button when `aboutMe.resumeUrl` is set
  - Added a prominent **Resume** button in the header (desktop controls + mobile nav), shown only when `resumeUrl` exists — header now fetches `about-me` for this
  - i18n key `downloadResume` (EN "Resume" / FA "رزومه")
  - **Resume file upload (replaces the old text URL field):** admin About page now has a `FileUploadComponent` (like the avatar upload) that uploads PDF/DOC/DOCX via `POST /api/admin/media/upload`; `about-me` singleton persists `resumeUrl` + `resumeName` (new `resumeName` column; `prisma db push` applied; backend DTO/upsert updated). `media/upload` file filter now accepts images **or** `*.pdf|doc|docx` (limit raised to 10 MB) and returns `{ url, originalName }`. Verified: PDF upload returns original name, `.txt` rejected (400), `resumeName` round-trips through public `GET /about-me`.
  - Content step done: upload the actual PDF via the admin About page (`resumeUrl`)

## Phase 10: Portfolio Polish 🔲 (cont.)

- [x] 10.3 **Grouped skills with managed categories** ✅
  - `SkillCategory` model: `{ id, title, titleFa?, order, createdAt, updatedAt }` + relation `Skills.categoryRef` (FK `categoryId`, `onDelete: SetNull`); legacy `category`/`categoryFa` kept as nullable fallback so existing data is preserved. (`prisma db push` applied)
  - Backend: `SkillCategoriesModule` — public `GET /api/skill-categories` (categories ordered, each with nested `skills`); admin CRUD in `AdminController`/`AdminService` (`GET/POST/PUT/DELETE /api/admin/skill-categories`) + `PATCH /api/admin/skill-categories/reorder` (added `'skillCategory'` to `bulkReorder` union). `GET /api/skills` now `include`s `categoryRef` (returns category title). Creating/updating a skill with `categoryId` auto-fills `category`/`categoryFa` from the category title.
  - Admin: new `/admin/skill-categories` page (bilingual title form, order, sortable list with skill count, delete with confirm) + sidebar nav + i18n keys (`nav_skill_categories`, `cat_*`). Skills form now has a **category dropdown** (populated from `/api/admin/skill-categories`) instead of a free-text field; a "Manage categories" link jumps to the new page.
  - Frontend-site: `SkillCategory` interface + `ApiService.getSkillCategories()`; `/skills` now renders groups from `GET /api/skill-categories` (per-category bilingual title, nested skills). Falls back to the legacy `category` grouping (and shows an "Other Skills" group for uncategorized) if the endpoint returns nothing.
  - Verified end-to-end: create 2 categories → create skill with `categoryId` → public `/skill-categories` groups correctly → `/skills` includes `categoryRef.title` → cleanup.

