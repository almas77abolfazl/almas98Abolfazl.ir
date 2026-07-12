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
  - Consider `@angular/ssr` for server-side rendering to make pages indexable without JS
  - Trade-off: requires Node.js to serve (can't be pure static Nginx)
  - Alternative: prerendering with `ng build --prerender` for the static routes

---

## Phase 7: Dark/Light Theme Polish 🔶 (7.1–7.4, 7.6 done · 7.5 pending)

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

- [ ] 7.5 **Theme toggle animation**
  - Animate the sun/moon icon transition in header (rotate + scale)

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
- [ ] 8.6 **Media upload** (pending)
- [ ] 8.8 **Admin user avatar upload** (pending)
- [ ] 8.9 **Article cover image upload** (pending)
- [ ] 8.7 **Drag-and-drop ordering** (pending)

- [x] 8.5 **Article rich text editor** ✅
  - Custom `MarkdownEditorComponent` (`core/components/markdown-editor.component.ts`) implementing `ControlValueAccessor`
  - Uses `marked` (`package.json` dep) — live preview panel (`[innerHTML]` via `DomSanitizer`)
  - Toolbar: bold, italic, H2/H3, inline code, code block, link, bullet/numbered list, quote
  - Wired into the articles form (`articles.component.html`) replacing the plain content `<textarea>`; `dir`/`isFa` follow the article language
  - Frontend-site `article-detail` now renders stored Markdown as HTML via `marked` (`[innerHTML]`, auto-sanitized by Angular); added `.article-content` prose styles in `frontend-site/src/styles.css` (headings, lists, code/codeblock, blockquote, links, images, RTL)
  - Inline images: Markdown editor toolbar has an "Insert image" button — uploads via `/api/admin/media/upload` and inserts `![alt](url)` at the cursor; rendered inline by the public site (no extra backend work)

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

- [ ] 9.2 **Testimonials on public site**
  - Currently testimonials are managed in admin but NOT shown on the public site
  - Add a Testimonials section to the homepage showing APPROVED testimonials
  - Slider/carousel or grid layout
  - Allow visitors to submit a testimonial via a form (currently no public submit endpoint)

- [ ] 9.3 **RSS feed**
  - `GET /api/feed.xml` — NestJS generates RSS 2.0 XML for published articles
  - Include `<link rel="alternate" type="application/rss+xml">` in `<head>`

- [ ] 9.4 **PWA support**
  - `@angular/pwa` schematics
  - Service worker for offline support
  - `manifest.json` for "Add to Home Screen"
  - Cache API responses for offline browsing

- [ ] 9.5 **Search**
  - `GET /api/search?q=...` — search across articles (title + excerpt + content), skills, experiences
  - Simple `ILIKE` PostgreSQL query
  - Search bar in header (hidden by default, expands on click)
  - Results dropdown with links

- [ ] 9.6 **Open Graph image generation**
  - Auto-generate OG images per article using a canvas/template approach
  - Can use `@vercel/og` or `puppeteer` to render an HTML template as an image
  - `GET /api/og/:slug.png` → returns a 1200×630 PNG

- [ ] 9.7 **Newsletter subscription**
  - Simple `Subscriber` model: `{ email, confirmedAt?, createdAt }`
  - Subscribe form (email input) in footer or dedicated section
  - Confirmation email via SendGrid / Nodemailer
  - Admin: view subscriber list

- [ ] 9.8 **Copy code blocks**
  - When Markdown articles are rendered, add a "Copy" button to `<pre><code>` blocks
  - Angular directive: `[copyCode]` that injects a clipboard button

- [ ] 9.9 **404 page**
  - Custom styled 404 page for the public site
  - Add wildcard route in `app.routes.ts` that shows it

- [ ] 9.10 **Reading progress bar**
  - On article detail pages: a thin bar at top of viewport showing scroll progress
  - Pure CSS + Angular `HostListener('scroll')` or `IntersectionObserver`
