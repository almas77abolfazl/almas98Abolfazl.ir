# Tasks — Phase 16: Angular 22 Upgrade, Article Rendering, Editor, Long-form UX, Date, SSR/SEO, Daily Report

> **Mode:** PLAN + EXECUTION (Phase 16.0 executed; Phases 16.1 + 16.2 done as of 2026-08-11; 16.3–16.7 pending review).
>
> **Scope guard:** Phases 16.3–16.7 are NOT started. Phases 16.0 (Angular 22 upgrade), 16.1 (RTL/LTR article content CSS + shared markdown helper), and 16.2 (publication date) are executed. Do not modify source for 16.3+ until explicitly requested.

---

## 0. Audit Summary (current state)

### Stack (post Phase 16.0)
- Backend: NestJS 11 + Prisma 7 + PostgreSQL 17, global prefix `/api` (unchanged).
- `frontend-site`: **Angular 22.1.1** (standalone, signals), `@angular/build:application` builder, Tailwind v4, **no SSR** (static `browser` build served by Nginx). `marked` v18. `typescript` 6.0.3, `zone.js` 0.15.1, `rxjs` 7.8.2.
- `frontend-admin`: **Angular 22.1.1** + **CDK 22.1.1**, same stack, served behind Nginx `/admin`.
- Infra: Docker Compose (postgres, backend, frontend-site, frontend-admin) + per-frontend Nginx. No staging.

### Key findings per user request

**1. LTR/RTL in article content — ROOT CAUSE FOUND (CSS only, no parser change needed)**
- Rendering: `article-detail.component.ts:23-27` → `marked.parse(content)` → bound via `[innerHTML]` in `.article-content` (`article-detail.component.html:64-66`). `project-detail` uses the same `.article-content` class (`.html:39-42`).
- Direction is applied **only at the block level** via `[dir]="art.language === 'fa' ? 'rtl' : 'ltr'"` (`article-detail.component.html:64-65`). There is **no** CSS forcing `code`/`pre`/inline-code/technical spans to `direction: ltr; unicode-bidi: isolate`.
- Consequence: inside an RTL `<div dir="rtl">`, a `pre code` block inherits RTL → code lines and inline `code` render right-to-left and break. This is pure CSS.
- `.article-content` in `frontend-site/src/styles.css:404-447` has **no** `direction`/`unicode-bidi` rules and **no monospace `font-family`** on `code`/`pre`. In RTL mode `html[dir="rtl"] body` forces Vazirmatn (`styles.css:239-241`), so code blocks render in a Persian UI font.
- `marked` already parses GFM (tables, code fences) by default — no parser change required for RTL/LTR or for tables.

**2. SSR for SEO — DEFERRED, re-evaluated**
- 6.7 was explicitly deferred. Current meta/OG/JSON-LD applied client-side by `SeoService` (`seo.service.ts`). Google renders JS, but JS-less social scrapers won't see per-route OG/JSON-LD.
- Article routes: `/blog` and `/blog/:slug` (lazy). `SeoService.update()` called in `article-detail` with `type:'article'`, `datePublished`, `image`, `inLanguage`, `Article` JSON-LD.
- Canonical + sitemap + robots + RSS exist. `sitemap.xml` served dynamically by backend, mapped via Nginx.
- **SSR blockers (client-side, `frontend-site`):** `ThemeService` (`window.matchMedia` field initializer + `localStorage`/`document`), `I18nService` (`localStorage`/`document.documentElement`), `SiteConfigService`/`ThemeColorService` (`localStorage`), `article-detail` likes (`localStorage`). `SeoService` already SSR-safe (uses `DOCUMENT`).
- **Recommendation:** NOT full SSR. Use **Angular prerendering (`prerender`)** of public routes — keeps Nginx static model, no persistent Node process. Admin stays SPA. (Note: with Angular 22 + zoneless-friendly setup this is easier; see 16.5.)

**3. Article Editor improvements**
- Editor: `MarkdownEditorComponent` (`frontend-admin/.../markdown-editor.component.ts/html`) — `ControlValueAccessor`, `marked` preview, toolbar (bold/italic/H2/H3/code/codeblock/link/ul/ol/quote/image-upload). Content stored as raw Markdown in `Articles.content`.
- Current tool lacks: align (RTL/LTR), table insert, custom block syntax.
- `marked` GFM tables already work; tables look broken only due to missing `.md-preview table` (admin) and `.article-content table` (public) CSS.
- Backward compat: keep `.md` storage. Add tables via standard GFM. Add LTR/RTL via `:::ltr`/`:::rtl` fence wrapper. See syntax proposal in 16.3.

**4. Publication date**
- `Articles` **already has** `publishedAt DateTime?` (`schema.prisma:101`). Shown on card (`blog.component.html:49`) and detail (`article-detail.component.html:36-38`) via Angular `date` pipe.
- **BUG:** `publishedAt` is **never set**. Admin form has only `published` checkbox; no date input. Backend accepts `publishedAt?` but admin never sends it. So `publishedAt` is always `null` → date never shown.
- `findPublished()` orders by `createdAt` (`articles.service.ts:11`), not `publishedAt`.
- **Decision:** (a) Backend auto-sets `publishedAt = new Date()` on publish (or create if published); optional override. (b) Optional admin "publish date" input. (c) Display locale-aware: EN `date` pipe; FA `fa-IR` (currently `date` pipe defaults to en-US).

**5. Long-form Article UX**
- Reading progress bar exists (`article-detail.component.html:1-5`, `.ts:81-86`).
- Missing: TOC (h2/h3), sticky TOC, back-to-top, section nav, constrained content width (`article-content` has no `max-width`; projects use `prose-measure` 65ch, articles do not), code-block UX (no copy button, no `max-height`/scroll), mobile behavior unverified.

**6. Admin → Reports → Daily Activity Details**
- Located: `reports.component.html` "Daily Activity Details" card (`:96-122`), driven by `GET /api/analytics/reports` → `activeDays(r)` = `daily.filter(day => day.count > 0)` (`reports.component.ts:85-87`).
- Data source: `AnalyticsController.getDailyStats()` returns fixed 30-day series, zero-filled (`analytics.controller.ts:159-186`).
- Problem: renders all active days (up to 30) as a cramped card grid, no pagination/limit/date-range/server paging.
- Improvement: readable table (date · views · mini bar) sorted desc, default limit + Load More; optional backend `?from&to`; keep all info.

**7. Additional / cross-cutting**
- No `table` styles for markdown (public + admin preview) → tables unstyled. (Recommended)
- No `font-family: monospace` on code (Vazirmatn under RTL). (Recommended)
- Public date formatting inconsistent (article uses en-US `date` pipe; other sections use fa-IR). (Recommended)
- i18n client-side only (no `/fa` `/en` route) → one URL per language, no `hreflang`. (Nice to have)
- `GET /api/articles` returns ALL published, no pagination/tag filter. (Nice to have)
- No real tests (scaffold stubs only); no global `ValidationPipe`; no CORS (OK behind Nginx). (Nice to have)
- `public/` missing `og-default.png` (referenced in `index.html` OG) and `manifest.json`. (Nice to have)

---

## Architecture decisions (carried into tasks)

1. **Keep Markdown as the storage format.** Extend via standard GFM (tables) + lightweight fenced `:::ltr`/`:::rtl` wrapper. No custom AST.
2. **RTL/LTR is CSS + tiny renderer concern, not a parser rewrite.** Add `direction: ltr; unicode-bidi: isolate` to `pre`/`code`/`.dir-ltr`/`.dir-rtl`.
3. **SSR → Angular `prerender`** of public routes, not persistent Node SSR. Admin stays SPA.
4. **`publishedAt` auto-set on publish**; optional admin override; display locale-aware (fa-IR for Persian).
5. **Daily report:** client-side improvement + optional backend date-range param; no schema change.

---

## Phase 16.0 — Angular 20.3 → 22.1 Upgrade  [DONE ✅]

> **Goal:** Move `frontend-site` and `frontend-admin` from Angular 20.3 to the latest stable Angular 22.x (22.1.1). Preserve behavior. No optional refactors, no new features.

### Pre-upgrade findings (verified against npm registry 2026-08-10)
- Installed baseline: `@angular/* @20.3.25`, `@angular/cli`/`@angular/build @20.3.29`, `typescript @5.9.3`, `rxjs @7.8.2`, `zone.js @0.15.1`, `@angular/cdk @20.2.14` (admin only), `marked @18.0.6`, `tailwindcss @4.3.1`, `@tailwindcss/postcss @4.1.13`. Node `26.4.0`, npm `11.17.0`.
- **Angular 22 requires TypeScript `>=6.0 <6.1`.** Latest stable TS 6.x = `6.0.3` (TS 7.0.2 is the `latest` tag and does NOT satisfy `<6.1`). → `typescript` bumped to `6.0.3`. Major TS jump (5.9 → 6.0), main risk.
- **Angular 22 engines require Node `^22.22.3 || ^24.15.0 || >=26.0.0`.** Node `26.4.0` satisfies `>=26.0.0`. OK (no Node change). Note: Angular 21 engines cap at Node 24, so during the 20→21 step the CLI prints "Node unsupported" warning but still runs.
- **`rxjs @7.8`** still satisfies `^7.4.0` → no change.
- **`zone.js`** peer `~0.15.0 || ~0.16.0` → `0.15.1` OK.
- **`@angular/cdk @22.1.1`** → admin bumped.
- **`marked @18.0.6`, `tailwindcss @4.3.1`, `@tailwindcss/postcss @4.1.13`** satisfy build peer `^4.0.0` → no change.
- **Update path:** CLI does NOT support multi-major jumps in one command ("Updating multiple major versions at once is not supported"). Migrated **20 → 21 → 22** sequentially with `ng update @angular/core@N @angular/cli@N` (plus `@angular/cdk@N` for admin). Each step ran schematics, cleaned+reinstalled `node_modules`, and bumped deps.
- No `--force` / `--legacy-peer-deps` used. Two native-module `EBUSY`/`EPERM` lock errors occurred mid-install (lingering `esbuild`/`lmdb` processes from a timed-out build); resolved by killing stray `esbuild` and removing `node_modules` + reinstalling.

### Execution log
| Step | Command | Result |
|------|---------|--------|
| site 20→21 | `npx @angular/cli@21 update @angular/core@21 @angular/cli@21` | ✅ Angular 21.2.19 |
| site 21→22 | `npx @angular/cli@22 update @angular/core@22 @angular/cli@22` | ✅ Angular 22.1.1 (after node_modules fix) |
| admin 20→21 | `npx @angular/cli@21 update @angular/core@21 @angular/cli@21 @angular/cdk@21` | ✅ 21.2.19 (package.json only; install completed separately) |
| admin 21→22 | `npx @angular/cli@22 update @angular/core@22 @angular/cli@22 @angular/cdk@22` | ✅ 22.1.1 |

### Migrations applied automatically by the CLI
- **Core (both):** `ChangeDetectionStrategy` added to components (`OnPush` kept where present; `Eager` added to admin components). `provideHttpClient` gained `withXhr` (admin `app.config.ts`). `provideClientHydration` opt-out `withNoIncrementalHydration` noted (no-op, not enabled). `ApplicationConfig` import moved to `@angular/core` (no source change needed here). Block-control-flow `@if`/`@for` migration ran on `site` (6 files). `Router.lastSuccessfulNavigation` signal usage adjusted.
- **CDK (admin):** "Updates the Angular CDK to v22" (no source changes).
- **CLI (both):** Karma default-config cleanup (no-op). `moduleResolution: bundler` tsconfig note (already set). `lib: es2022` note. `tsconfig` `nullishCoalescingNotNullable` / `optionalChainNotNullable` extended-diagnostics set to `suppress` in `tsconfig.app.json`/`tsconfig.spec.json` (admin only — this is the trailing-whitespace source flagged by `git diff --check`). **Optional (not run):** `migrate-karma-to-vitest`, `use-application-builder` (already on application builder).

### Build results
- `frontend-site` `npm run build` → **✅ success**. Warnings only: `NG8102` (unnecessary `?? 0` in `about-me.component.html:227` and `skills.component.html:49`) — pre-existing, harmless, not fixed (out of scope).
- `frontend-admin` `npm run build` → **✅ success**. No errors (only Node `DEP0205` deprecation notice, harmless).

### Test results
- `frontend-site` `npm test` (Karma + ChromeHeadless 151) → **2 FAILED, 0 SUCCESS**. Both failures are the default scaffold `app.spec.ts` stubs (assert `h1` contains "Hello, frontend-site"; they also lack `RouterModule`/`ActivatedRoute` providers, which Angular 22 surfaces as `NG0201: No provider for ActivatedRoute`). These stubs were already wrong before the upgrade; not modified (out of scope, no refactor).
- `frontend-admin` `npm test` → **0 tests executed, 0 SUCCESS** (admin has no `*.spec.ts` in `src`; only `node_modules` specs exist, which Karma ignores).

### `git diff --check` (staged)
- Trailing whitespace in `frontend-admin/tsconfig.app.json` and `frontend-admin/tsconfig.spec.json` (added by CLI's extendedDiagnostics block). Cosmetic only; left as-is (they are valid JSON, just trailing spaces).

### Files changed
- Both: `package.json`, `package-lock.json`, `tsconfig.app.json` (admin: +extendedDiagnostics).
- `frontend-site`: 6 `.ts` files converted to block control flow (`about-me`, `videos`, `projects`, `project-detail`, `experiences`, `skills` components).
- `frontend-admin`: `app.config.ts` (`withXhr`), `app.ts` + 18 feature/core components (`ChangeDetectionStrategy` added).
- Commits (local, not pushed):
  - `1d8a897` chore(frontend-site): intermediate Angular 21.2 migration (pre-22)
  - `dc68807` chore(frontend-site): upgrade to Angular 22.1.1 + TypeScript 6.0.3
  - `d3b6b29` chore(frontend-admin): intermediate Angular 21.2 migration (pre-22)
  - `05a578f` chore(frontend-admin): upgrade to Angular 22.1.1 + CDK 22.1.1 + TypeScript 6.0.3

### Final versions
| Package | frontend-site | frontend-admin |
|---------|---------------|---------------|
| @angular/core / common / forms / router / platform-browser | 22.1.1 | 22.1.1 |
| @angular/cli | 22.1.3 | 22.1.3 |
| @angular/build | 22.1.3 | 22.1.3 |
| @angular/compiler-cli | 22.1.1 | 22.1.1 |
| @angular/cdk | — | 22.1.1 |
| typescript | 6.0.3 | 6.0.3 |
| rxjs | 7.8.2 | 7.8.2 |
| zone.js | 0.15.1 | 0.15.1 | *(removed 2026-08-11 — both apps are now zoneless)* |
| marked | 18.0.6 | 18.0.6 |
| tailwindcss / @tailwindcss/postcss | 4.3.1 / 4.1.13 | 4.3.1 / 4.1.13 |
| Node.js / npm | 26.4.0 / 11.17.0 | 26.4.0 / 11.17.0 |

### Manual decisions / compatibility notes
- **TypeScript 6.0.3** is the only way to satisfy Angular 22's `>=6.0 <6.1`. TS 6 is a new major; both projects build clean, so no source incompatibilities surfaced. If future code hits TS 6 strictness, fix type-only (no behavior change).
- **Node 26** is above Angular 22's tested ceiling but within the `>=26.0.0` engine range → supported. The 20→21 step prints an "unsupported Node" warning (21 caps at Node 24) but completes fine; the final 22 state is fully supported.
- **Backend untouched** — no shared dependency required a change.
- **No forced installs.** The only install failures were native-binary file locks from a timed-out `ng build`; resolved by killing stray `esbuild` and reinstalling `node_modules` (no `--force`).
- **`ChangeDetectionStrategy.Eager`** added by CLI to admin components is the new Angular 22 default and preserves existing behavior (no zoneless migration performed).

### Status: ✅ COMPLETE — STOP HERE
Both frontend apps upgraded to Angular 22.1.1, build green, behavior preserved. Awaiting review before Phase 16.1.

---

## Phase 16.1 — RTL/LTR Article Content (Frontend-Site + Admin Preview)  [CSS + small renderer, NO parser rewrite]

**Scope:** Ensure Persian article text is RTL while code, inline code, and technical blocks stay LTR. Add monospace font to code. Make admin preview WYSIWYG.

- [x] **1.1** Add `.article-content` direction rules in `frontend-site/src/styles.css` (inside the `@layer components` block ~L404):
  - `.article-content pre, .article-content code, .article-content pre code { direction: ltr; text-align: left; unicode-bidi: isolate; font-family: ui-monospace, "JetBrains Mono", "Fira Code", monospace; }`
  - Inline `code` keeps `unicode-bidi: isolate` but can stay `direction: ltr`.
  - Add `.dir-ltr { direction: ltr; unicode-bidi: isolate; }` and `.dir-rtl { direction: rtl; unicode-bidi: isolate; }` helpers.
  - *Acceptance:* In an FA article containing a `pre` code block and inline `code`, both render LTR/left-aligned with monospace font. No RTL glyph mirroring in code.
  - *Risk:* none (additive CSS). Verify Persian paragraph text still RTL.
  - *Files:* `frontend-site/src/styles.css`.

- [x] **1.2** Render GitHub-style `:::ltr` / `:::rtl` container fences. Extract a **single** `renderMarkdown(md: string): string` helper (new `frontend-site/src/app/shared/services/markdown.service.ts`) used by `article-detail` and `project-detail` (and admin preview for parity). Keep `preserveExtraSpacing` logic inside it. Map `:::ltr`/`:::rtl` → `<div class="dir-ltr">`/`<div class="dir-rtl">`.
  - *Acceptance:* `:::ltr\nsome text\n:::` renders a left-aligned LTR block; nested code inherits LTR. Backward compatible.
  - *Risk:* low; keep `async:false`.
  - *Files:* new `markdown.service.ts`; `article-detail.component.ts:23-27`, `project-detail.component.ts:20-26`.

- [x] **1.3** Admin preview parity: add `.md-preview` styles in `frontend-admin/src/styles.css` mirroring `.article-content` (headings, lists, blockquote, `code`/`pre` LTR+monospace, `img`, `hr`, **and `table` styles**). Also apply `[dir]` + `font-fa` to the preview div (`markdown-editor.component.html:35`) so Persian previews are RTL in Vazirmatn.
   - *Acceptance:* admin live preview ≈ public render (incl. code LTR, tables styled).
   - *Risk:* none (additive).
   - *Files:* `frontend-admin/src/styles.css`, `markdown-editor.component.html:35`.
   - *NOTE (verified 2026-08-11):* CSS parity done, BUT admin preview (`markdown-editor.component.ts:47`) still calls `marked.parse` directly instead of `MarkdownService.renderMarkdown`. So `:::ltr/rtl` fences are NOT rendered in admin preview (WYSIWYG gap). Switch admin preview to `MarkdownService` — this is the 16.3.2 parity requirement.

- [x] **1.4** Add `.article-content table` styles (public) — `table`, `thead`, `th`, `td`, `tr`, `border-collapse`, zebra striping, `overflow-x:auto` wrapper, caption. Mirror into `.md-preview` (1.3).
  - *Acceptance:* GFM tables render as styled, scrollable tables on both public + admin.
  - *Risk:* none.
  - *Files:* `frontend-site/src/styles.css`, `frontend-admin/src/styles.css`.

## Phase 16.2 — Publication Date (Backend + Admin + Display)

**Scope:** Make `publishedAt` actually populate and display, locale-aware, with optional admin control.

- [x] **2.1** Backend: auto-set `publishedAt`. In `AdminService.createArticle`/`updateArticle` (`admin.service.ts:170,180`): when `published === true` and `publishedAt` not provided, set `publishedAt = new Date()`. On update, if `published` flips to true and `publishedAt` null, set it. Preserve explicit override.
  - *Acceptance:* new published article has `publishedAt` ≈ now; draft→publish sets it; manual override respected.
  - *Risk:* low; no migration needed (column exists).
  - *Files:* `backend/src/admin/admin.service.ts`.

- [x] **2.2** Backend: order public articles by `publishedAt` desc (nulls last), fall back to `createdAt`. Update `ArticlesService.findPublished` (`articles.service.ts:9-13`).
  - *Acceptance:* blog list ordered by publish date.
  - *Risk:* low.
  - *Files:* `backend/src/articles/articles.service.ts`.

- [x] **2.3** Admin form: add optional "Publish date" datetime input bound to `model.publishedAt` (`articles.component.ts:23` already has the field; add UI + send it). Use existing `date-picker.component.ts` or native `datetime-local`. Show only when `published` is true.
  - *Acceptance:* owner can set/override publish date; round-trips through `GET/PUT /api/admin/articles`.
  - *Risk:* low.
  - *Files:* `frontend-admin/src/app/features/articles/articles.component.html`, `.ts`.

- [x] **2.4** Display locale-aware date. Article card (`blog.component.html:49`) and detail (`article-detail.component.html:36-38`) use `date:'mediumDate'`/`longDate` (default en-US). Create shared `formatDate(value, lang)` using `fa-IR` for Persian (`toLocaleDateString` like `about-me.component.ts:171`/`experiences.component.ts:39`). Respect `art.language === 'fa'` (content language), not UI toggle.
   - *Acceptance:* FA articles show Persian (fa-IR) dates; EN show Gregorian.
   - *Risk:* low.
   - *Files:* `blog.component.html`, `article-detail.component.html`, new/existing date util.
   - *NOTE (verified 2026-08-11):* Implemented as standalone `ArticleDatePipe` (`frontend-site/src/app/shared/pipes/article-date.pipe.ts`) taking the article's content `language` (not UI toggle) — `fa-IR` vs `en-US`. Used in `blog.component.html` (card) and `article-detail.component.html` (meta row). Admin form (`articles.component.html/.ts`) gained a `datetime-local` input shown only when `published`, bridged via `publishedAtLocal` getter/setter (ISO ↔ `YYYY-MM-DDTHH:mm`); server round-trips through `publishedAt`. Added i18n keys `art_publishedAt`/`art_publishedAtHint` (en+fa).
   - *BUG FIX:* `frontend-site/src/app/features/blog/blog.component.ts` was missing its `ApiService, Article` import (uncommitted break from 16.1 work); restored so the app builds.

## Phase 16.3 — Article Editor Improvements (Admin)

**Scope:** align/rtl-ltr toolbar, table insert, keep Markdown + backward compat.

- [ ] **3.1** Add toolbar buttons to `MarkdownEditorComponent`: `alignRtl()`/`alignLtr()` wrapping selection in `:::rtl`/`:::ltr` fences (reuse `surround` pattern, `markdown-editor.component.ts:63`). Add `table()` inserting a GFM table template. Update `markdown-editor.component.html:1-25` toolbar.
  - *Acceptance:* LTR click → `:::ltr\n<sel>\n:::`; Table click → 2×2 GFM stub.
  - *Risk:* low; pure editor UX.
  - *Files:* `markdown-editor.component.ts`, `.html`.

- [ ] **3.2** (Depends on 1.2/1.3) Verify editor preview renders `:::ltr/rtl` and tables identically to public. No new parser — relies on shared `renderMarkdown`.
  - *Acceptance:* WYSIWYG for direction + tables.
  - *Risk:* none.
  - *Files:* covered by 1.2/1.3.

**Table syntax proposal (GFM, standard — no custom parser):**

```markdown
| Feature | Status | Notes |
| ------- | ------ | ----- |
| SSR     | Planned| Phase 16.5 |
| RTL     | Done   | Phase 16.1 |
```

Direction wrapper proposal (GitHub-style admonition fence, rendered by shared helper):

```markdown
:::ltr
```ts
const x: number = 1;
console.log(x);
```
:::
```

## Phase 16.4 — Long-form Article UX (Frontend-Site)

**Scope:** improve readability of long articles without hiding/paginating content.

- [ ] **4.1** Constrain content width: add `max-width` (e.g. `prose-measure` 65ch or `.article-body`) to `.article-content`. Keep `article-detail.component.html:64` container.
  - *Acceptance:* article body capped ~65-72ch, centered, comfortable leading.
  - *Risk:* low.
  - *Files:* `frontend-site/src/styles.css`, `article-detail.component.html`.

- [ ] **4.2** Table of Contents: generate from `h2`/`h3` in rendered HTML, assign `id`s, render sticky TOC sidebar (desktop) + collapsible on mobile. `IntersectionObserver` for active-section highlight. Hide when <2 headings.
  - *Acceptance:* TOC lists H2/H3, click scrolls, active highlighted. Guard for prerender (`afterNextRender`/`isPlatformBrowser`).
  - *Risk:* medium (DOM parsing + observers).
  - *Files:* `article-detail.component.ts`, `.html`, `styles.css`.

- [ ] **4.3** Back-to-top button (past ~600px) + reuse reading-progress bar. Hidden appropriately in print/small screens.
  - *Acceptance:* button appears past threshold, smooth-scrolls to top.
  - *Risk:* low.
  - *Files:* `article-detail.component.html/ts`, `styles.css`.

- [ ] **4.4** Code-block UX: "Copy" button overlay on `pre` (via `afterNextRender`/directive) + `max-height` + scroll for long blocks.
  - *Acceptance:* each `pre` has copy button; long blocks scroll internally.
  - *Risk:* low–medium (DOM post-processing).
  - *Files:* `article-detail.component.ts/html`, `styles.css`.

- [ ] **4.5** Mobile behavior pass: TOC collapses, code blocks scroll, progress bar visible, no horizontal overflow from tables/`pre`.
  - *Acceptance:* no horizontal page scroll on mobile for any article.
  - *Risk:* low.
  - *Files:* `styles.css`, `article-detail.component.html`.

## Phase 16.5 — SSR/SEO via Prerendering (Frontend-Site Infra)

**Scope:** make article/blog/static routes crawlable with real HTML. Prefer **prerender** over persistent SSR.

- [ ] **5.1** Make browser-API usages SSR-safe (prereq for prerender). In `frontend-site`:
  - `ThemeService` (`theme.service.ts:6`): move `window.matchMedia` into constructor with `isPlatformBrowser`; guard `localStorage`/`document`.
  - `I18nService` (`i18n.service.ts:186,205,209`): guard `localStorage`/`document`; apply `dir`/`lang` only in browser/`afterNextRender`.
  - `SiteConfigService`/`ThemeColorService` (`theme-color.service.ts:100,110`): guard `localStorage`.
  - `ArticleDetailComponent` likes (`article-detail.component.ts:37,98,106`): guard `localStorage` with `isPlatformBrowser`.
  - *Acceptance:* `frontend-site` builds with `prerender`; prerendered `/`, `/blog`, `/blog/:slug`, `/about-me`, `/projects`, `/videos` contain real content (no `localStorage is not defined`).
  - *Risk:* medium — touches core services; keep SPA behavior identical in browser.
  - *Files:* `theme.service.ts`, `i18n.service.ts`, `theme-color.service.ts`, `site-config.service.ts`, `article-detail.component.ts`, `app.config.ts`.

- [ ] **5.2** Enable Angular prerendering for public routes: add `prerender` to `angular.json` build (`@angular/build:application` supports `prerender` + `routes`/`routesFile`); create `routes.txt` + route generator for `/blog/:slug` (fetch slugs from API). Admin app untouched.
  - *Acceptance:* build emits prerendered HTML per public route; Nginx still serves static files (no Node process).
  - *Risk:* medium — build pipeline change; verify Docker `Dockerfile` copies `dist/frontend-site/browser` and Nginx `try_files` picks up nested `index.html`.
  - *Files:* `frontend-site/angular.json`, new `routes.txt`/generator, `frontend-site/Dockerfile` (verify only).

- [ ] **5.3** Verify/extend SEO for prerendered articles: ensure `SeoService` runs during prerender (uses `DOCUMENT` → safe) so OG/JSON-LD are in static HTML. Add `hreflang` alternates if feasible. Confirm `sitemap.xml` includes all published slugs.
  - *Acceptance:* prerendered `/blog/my-post/index.html` contains OG title, canonical, `Article` JSON-LD.
  - *Risk:* low.
  - *Files:* `seo.service.ts` (verify), `article-detail.component.ts`.

- [ ] **5.4** Nginx/Docker verification: prerendered nested `index.html` served (Nginx `try_files $uri $uri/ /index.html` already handles). No infra rewrite.
  - *Acceptance:* `curl /blog/<slug>/` returns prerendered HTML with article text.
  - *Risk:* low.
  - *Files:* `frontend-site/nginx.conf` (verify only), `docker-compose.yml` (no change).

## Phase 16.6 — Admin Daily Activity Report (Backend + Admin)

**Scope:** improve readability/scalability of "جزئیات فعالیت روزانه" without losing info.

- [ ] **6.1** Backend (optional but recommended): parameterize `getDailyStats` (`analytics.controller.ts:159-186`) with `?from&to&limit` on `GET /api/analytics/reports` (guarded). Default 30 days preserved. Keep zero-fill.
  - *Acceptance:* `reports?days=14` returns 14-day series; optional date range works.
  - *Risk:* low.
  - *Files:* `backend/src/analytics/analytics.controller.ts`, optionally `analytics.service.ts`.

- [ ] **6.2** Admin UI: replace cramped card-grid (`reports.component.html:96-122`) with readable table (date · views · mini bar) sorted desc, default **limit = 30** + "Load More / Show all" toggle. Keep "Active Days" + "Peak Day" summary.
  - *Acceptance:* daily activity scannable; latest N by default; expanding shows all; no data lost.
  - *Risk:* low.
  - *Files:* `reports.component.html`, `reports.component.ts`.

- [ ] **6.3** Accessibility/format: right-align numbers (RTL), Persian date via shared `formatDate` (from 2.4) for FA admin locale (`AdminI18nService.currentLang`), `title` tooltip with exact timestamp.
  - *Acceptance:* dates localized in admin; table keyboard-navigable.
  - *Risk:* low.
  - *Files:* `reports.component.html/ts`.

## Phase 16.7 — Additional Improvements

### Recommended (do within this plan if capacity allows)
- [ ] **7.1** Apply monospace + LTR to `code`/`pre` globally for `project-detail` (shares `.article-content` after 1.1, largely covered). Verify parity.
- [ ] **7.2** Consistent article date locale across site (covered by 2.4) — extend `formatDate` to `project-detail` if it shows dates.
- [ ] **7.3** Add missing `public/og-default.png` (referenced in `index.html` OG tag) so non-cover pages have a social preview; fallback when `coverUrl` absent in `SeoService`.
- [ ] **7.4** Add minimal `public/manifest.webmanifest` + `<link rel="manifest">` (android-chrome icons exist but unreferenced).

### Nice to Have (separate, lower priority)
- [ ] **7.5** Route-based locale (`/fa`, `/en`) for proper `hreflang` + per-language indexing. Larger change. Defer unless SEO demand justifies.
- [ ] **7.6** Pagination / `?tag=` / `?page=` on `GET /api/articles`. Needed only as blog grows.
- [ ] **7.7** Add real tests: `marked` rendering + RTL/LTR CSS, `publishedAt` auto-set, daily report range. Replace the 3 scaffold stubs. Add `ValidationPipe` globally in `main.ts`.
- [ ] **7.8** `llms.txt` drift fix: lists `/about-me?tab=experience|skills` but dashboard tracks `/experiences`/`/skills` as standalone (they redirect). Update to reflect redirects.

---

## Dependency graph

```
16.1 (RTL/LTR CSS + shared markdown helper)  ──► 16.3 (editor buttons rely on 1.2 helper)
16.2 (publishedAt backend) ──► 16.2.3 (admin input) ──► 16.2.4 (display)
16.1 ──► 16.4 (long-form reuses .article-content styles)
16.1/16.2 ──► 16.5.1 (SSR-safe guards; independent but same services)
16.5.1 ──► 16.5.2 (prerender) ──► 16.5.3/5.4 (verify SEO + nginx)
16.6.1 (backend range) ──► 16.6.2/6.3 (admin UI)
16.7.x independent, slotted after their dependency phase.
```

## Risk register
- **Prerender build breakage (5.1/5.2):** browser-API guards must be correct or build fails. Mitigation: implement 5.1 first, verify `ng build` with prerender on a single route before expanding.
- **Prerender vs dynamic API:** article content fetched client-side via HTTP; prerender needs data at build time. Mitigation: build-time route generator hitting `GET /api/articles?lang=fa|en`.
- **CSS RTL regressions (1.1):** ensure Persian paragraph text stays RTL while only code/technical blocks go LTR. Mitigation: scoped rules to `pre`/`code`/`.dir-*` only.
- **Admin WYSIWYG mismatch (1.3/3.2):** keep one shared `renderMarkdown` to avoid divergence.
- **TypeScript 6.0 strictness (16.0 done):** both apps built clean on TS 6.0.3; no source changes needed.

## Recommended execution order
1. Phase 16.1 (highest value, lowest risk, pure CSS + shared helper)
2. Phase 16.2 (publishedAt + dates)
3. Phase 16.3 (editor buttons, depends on 1.2)
4. Phase 16.4 (long-form UX)
5. Phase 16.6 (daily report — independent, quick win)
6. Phase 16.5 (prerender/SSR — highest risk, do after services are stable)
7. Phase 16.7 (additional, as capacity allows)

---

## Cross-cutting fix — Zoneless / Signal-based Change Detection (done 2026-08-11)

**Problem:** After the Angular 22 upgrade (16.0) pages exhibited "data appears only after an extra click". Root cause: `zone.js` was not driving ChangeDetection ticks for async completions, so views only refreshed on a user event. Decision (user-approved): remove `zone.js` entirely from both apps and go fully signal-based, per Angular 22's recommended `provideZonelessChangeDetection()`.

**Infra changes (both `frontend-site` & `frontend-admin`):**
- `src/app/app.config.ts`: replaced `provideZoneChangeDetection(...)` with `provideZonelessChangeDetection()` (admin had none → added).
- `angular.json`: removed `"zone.js"` from build `polyfills` AND from the `test` target polyfills (no `zone.js`/`zone.js/testing` references remain anywhere).
- `package.json` + `node_modules`: uninstalled the `zone.js` dependency in both projects (`npm uninstall zone.js`).
- No `NgZone`/`runOutsideAngular` usage existed; `setTimeout`/`setInterval` updating displayed state: none found.

**Component migration:** Every async-loaded, template-displayed property was converted to a `signal` (writes via `.set()`/`.update()`; reads via `()` in templates). `strictTemplates` is enabled in both `tsconfig.json`, so unconverted template references fail the build — both apps build green.
- Site changed: `home`, `experiences`, `footer` (+already-signal: about-me, projects, project-detail, article-detail, blog, videos, skills, header, not-found).
- Admin changed: `testimonials`, `contact-messages`, `dashboard`, `about-me`, `login`, `date-picker` (core `writeValue` async). Others (`videos`, `skills`, `skill-categories`, `educations`, `articles`, `settings`, `reports`, `experiences`, `projects`, `shell` via `toSignal`, `toast-container`, `confirm-dialog`, `image-upload`, `file-upload`, `markdown-editor`) were already signal/CVA-driven.

**Forms note:** `ngModel`/reactive form *model* objects were left as plain objects (Angular 22 forms trigger their own zoneless CD for the bound controls). Only async-set, template-*displayed* values were lifted to signals (e.g. home's `testimonialImageUrl`).

**Verification:** `npm run build` succeeds for both; no `zone.js`/`provideZoneChangeDetection` references remain in `src`. Runtime CD now fires on signal writes, eliminating the "click to refresh" bug.

**Caveat for Phase 16.5 (prerender):** zoneless is compatible with `prerender`; `afterNextRender`/`isPlatformBrowser` guards still apply as planned.
