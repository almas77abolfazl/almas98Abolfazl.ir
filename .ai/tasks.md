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

## Phase 4: Article System Overhaul 🔲

> **Goal**: Replace the current bilingual article approach with a proper per-language system. Each article is either EN or FA — no dual-language fields.

- [ ] 4.1 **Schema migration**
  - Remove `titleFa`, `contentFa`, `excerptFa` from `Articles` model
  - Add `language String @default("en")` — values: `'en'` or `'fa'`
  - Add `tags String[]` — array of tag strings
  - Add `readingTime Int @default(0)` — estimated reading time in minutes (auto-calculated from content length)
  - Add `likeCount Int @default(0)` — cached count, incremented by likes API
  - Create `ArticleLike` model: `{ id, articleId FK, ipHash String, createdAt }` with `@@unique([articleId, ipHash])`
  - Run `prisma db push` + `prisma generate`

- [ ] 4.2 **Backend: Article likes API**
  - `POST /api/articles/:slug/like` — public endpoint
  - Hash the requester's IP with SHA-256, attempt `prisma.articleLike.create()`
  - On unique constraint error = already liked (return 200 with `alreadyLiked: true`)
  - On success: increment `Articles.likeCount` via `prisma.articles.update({ data: { likeCount: { increment: 1 } } })`
  - Response: `{ likeCount: number, alreadyLiked: boolean }`

- [ ] 4.3 **Backend: Update `GET /api/articles` and `GET /api/articles/:slug`**
  - Add `language` filter param: `GET /api/articles?lang=fa` — filter by language
  - Return `likeCount`, `readingTime`, `tags` in responses
  - Auto-calculate `readingTime` on create/update: `Math.ceil(wordCount / 200)` minutes

- [ ] 4.4 **Admin: Article form update**
  - Add `language` dropdown (`English` / `فارسی`) — sets `dir` of content textarea
  - Add `tags` input (comma-separated chips)
  - Remove `titleFa`, `contentFa`, `excerptFa` fields from the form
  - Show `readingTime` as auto-calculated read-only field

- [ ] 4.5 **Frontend: Blog page**
  - Filter articles by current `i18n.currentLang()` automatically: fetch `?lang=fa` or `?lang=en`
  - Show tags as pills on article cards
  - Show reading time badge
  - Show like count on cards

- [ ] 4.6 **Frontend: Article detail page**
  - Show language badge (EN/FA indicator)
  - Show reading time
  - Show tags
  - Show like count with a clickable like button (heart icon)
  - Like button: POST to likes API, disable after liked (store in `localStorage` as `liked_${slug}`)
  - Reading progress bar at top of page (scroll-based, CSS/JS)

---

## Phase 5: Video Embeds 🔲

> **Goal**: Add a Videos section to the portfolio where YouTube and Aparat videos can be embedded and displayed.

- [ ] 5.1 **Schema: `Videos` model**
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

- [ ] 5.2 **Backend: Public GET + Admin CRUD**
  - `GET /api/videos` — public, ordered by `order asc`
  - `POST /api/admin/videos` — create
  - `PUT /api/admin/videos/:id` — update
  - `DELETE /api/admin/videos/:id` — delete
  - Helper: generate embed URL from platform + videoId:
    - YouTube: `https://www.youtube.com/embed/{videoId}`
    - Aparat: `https://www.aparat.com/video/video/embed/videohash/{videoId}/t/1`

- [ ] 5.3 **Admin: Videos management page**
  - New route: `/admin/videos`
  - Add to shell sidebar nav
  - Form: title (EN/FA), platform dropdown, videoId input, description (EN/FA), thumbnailUrl, order
  - List with preview thumbnail

- [ ] 5.4 **Frontend: Videos page or section**
  - New route: `/videos` or integrate into homepage as a section
  - Responsive grid of video cards with thumbnail + title
  - Clicking a card opens an inline embed (or modal) using `<iframe>` with the embed URL
  - Lazy load iframes (only embed when user clicks play / enters viewport)
  - Support `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"` attributes

---

## Phase 6: SEO Optimization 🔲

> **Goal**: Make every page crawlable with rich metadata for search engines and social sharing.

- [ ] 6.1 **Angular Meta service setup**
  - Install `@angular/platform-browser` (already included)
  - Create `SeoService` in `frontend-site/src/app/shared/services/seo.service.ts`
  - Methods: `setTitle(title)`, `setMeta(description, image?, url?)`, `setArticleMeta(article)`
  - Use Angular's `Title` and `Meta` services from `@angular/platform-browser`

- [ ] 6.2 **Meta tags per page**
  - `<title>`: `Page Name | Abolfazl Nasiri Almas`
  - `<meta name="description">`: page-specific description
  - Open Graph: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`
  - Twitter Card: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
  - Call `SeoService` in each component's `ngOnInit`

- [ ] 6.3 **Structured data (JSON-LD)**
  - HomePage: `Person` schema with name, jobTitle, url, sameAs (social links)
  - Article pages: `Article` schema with headline, datePublished, author, image
  - Inject via `<script type="application/ld+json">` using Angular's `DOCUMENT` token

- [ ] 6.4 **`sitemap.xml`**
  - Static sitemap with all public routes
  - Dynamic: NestJS endpoint `GET /sitemap.xml` that queries DB for published article slugs
  - Or: generate static sitemap at build time

- [ ] 6.5 **`robots.txt`**
  - Allow all crawlers
  - Point to sitemap URL
  - Block `/admin/*` from indexing

- [ ] 6.6 **`index.html` base tags**
  - Add canonical URL `<link rel="canonical">`
  - Add `lang` attribute set correctly per language

- [ ] 6.7 **Angular SSR (optional, major upgrade)**
  - Consider `@angular/ssr` for server-side rendering to make pages indexable without JS
  - Trade-off: requires Node.js to serve (can't be pure static Nginx)
  - Alternative: prerendering with `ng build --prerender`

---

## Phase 7: Dark/Light Theme Polish 🔲

> **Goal**: Make the theme system feel polished, native, and glitch-free.

- [ ] 7.1 **System preference on first load**
  - Currently: reads `prefers-color-scheme` media query in `ThemeService` — verify it works correctly
  - Add: listen for `prefers-color-scheme` changes during session via `window.matchMedia(...).addEventListener('change', ...)`

- [ ] 7.2 **Prevent flash of wrong theme (FOBT)**
  - Add a small inline `<script>` in `index.html` `<head>` that reads `localStorage` and applies `.dark` class before Angular hydrates
  - This prevents the white flash on dark-mode page load

- [ ] 7.3 **Theme-aware colors audit**
  - Audit all components for hardcoded colors that don't switch with dark mode
  - Ensure all text, backgrounds, borders have both light and dark variants

- [ ] 7.4 **CSS custom properties for smoother transitions**
  - Define semantic color tokens in `styles.css` `@theme` that automatically change in `.dark`
  - Replace one-off `dark:` Tailwind classes with token-based classes where appropriate

- [ ] 7.5 **Theme toggle animation**
  - Animate the sun/moon icon transition in header (rotate + scale)

---

## Phase 8: Admin Panel UI Overhaul 🔲

> **Goal**: Make the admin panel look and feel like a real modern dashboard (currently functional but minimal/raw).

- [ ] 8.1 **Layout improvements**
  - Responsive sidebar with collapse/expand
  - Mobile hamburger menu
  - Active route highlighting in nav
  - User avatar + logout in sidebar footer

- [ ] 8.2 **Dashboard stats cards**
  - Replace simple text with visual stat cards (icon + number + label)
  - Add mini sparkline charts for page views trend

- [ ] 8.3 **Table improvements**
  - Sortable columns
  - Pagination or infinite scroll for large lists
  - Empty state illustrations
  - Row hover effects

- [ ] 8.4 **Form improvements**
  - Toast notifications instead of `alert()` / inline saved messages
  - Unsaved changes warning before navigation
  - Field validation with inline error messages
  - Confirmation modal for delete actions (replace browser `confirm()`)

- [ ] 8.5 **Article rich text editor**
  - Replace plain `<textarea>` with a Markdown editor (e.g., `ngx-markdown-editor` or custom CodeMirror)
  - Preview panel showing rendered Markdown
  - Toolbar for common formatting (bold, italic, headings, code blocks, links)

- [ ] 8.6 **Media upload**
  - File upload UI (drag-and-drop zone)
  - Backend: handle file uploads and store to disk or cloud (S3/Cloudflare R2)
  - Currently: media is added by URL — real upload is not implemented

- [ ] 8.7 **Drag-and-drop ordering**
  - Experiences, Educations, Skills list have an `order` field
  - Implement drag-and-drop reordering (CDK DragDrop or similar)
  - `PATCH /api/admin/{entity}/reorder` — accept `[{ id, order }]` and bulk update

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
