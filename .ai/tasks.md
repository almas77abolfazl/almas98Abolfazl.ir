# Project Work Tracker

> **Active-work source of truth:** this file.
> `docs/roadmap.md` records delivered milestones and deliberately does not maintain a second task list.

## Active work

No active feature work is currently scheduled.

## Completed Phase 16

| Phase | Status | Delivered outcome |
| --- | --- | --- |
| 16.0 | Done | Both frontends upgraded to Angular 22.1.1 and TypeScript 6.0.3. |
| 16.1 | Done | Article Markdown rendering, RTL/LTR behavior, and public/admin rendering parity improved. |
| 16.2 | Done | Publication-date workflow and legacy-data-safe `publishedAt` behavior completed. |
| 16.3 | Done | Admin article editor toolbar, preview parity, tables, and responsive UX completed. |
| 16.4 | Done | Long-form article UX and responsive content behavior completed. |
| 16.5 | Done | Static prerender, article/project dynamic routes, SEO HTML, and repository Docker/Nginx support completed. |
| 16.6 | Done | Daily Activity Report range API and admin table experience completed. |
| 16.7 | Done | Lightweight default Social/OG image fallback added and `llms.txt` aligned with current public routes. |

## Technical decisions to retain

### Angular 22

- Both frontends use Angular 22.1.1, TypeScript 6.0.3, signals, and zoneless change detection; `zone.js` is not used.
- The VS Code full-stack tasks start the backend before either frontend. The site development task supplies the local prerender API URL.

### Article content

- Existing Markdown remains compatible, including images, code, tables, RTL/LTR directives, and legacy content.
- Admin preview follows the public article renderer and styling without introducing a cross-frontend shared package.
- The article editor toolbar is sticky within its editor container; it is not browser-window sticky.

### Publishing dates

- Publishing an unpublished article assigns `publishedAt` only when the field is empty.
- Editing an already published article preserves `publishedAt`; `updatedAt` retains its normal behavior.
- Legacy records with `published=true` and no `publishedAt` are intentionally not silently backfilled.

### Static prerender and SEO (Phase 16.5)

- `frontend-site` uses Angular static prerendering. Public static routes plus published `/blog/:slug` and public/current `/projects/:id` are generated during build.
- Server/prerender API requests require the absolute `PRERENDER_API_BASE_URL` build-time value. Browser requests continue to use relative `/api/...` URLs.
- Route generation fails clearly if the API is unavailable, preventing a partial prerender build.
- Article and project HTML includes their route-specific SEO data when prerendered: title, metadata, canonical URL, Open Graph, Twitter metadata, and applicable JSON-LD.
- Prerender output uses route `index.html` files and `index.csr.html` as the CSR fallback. New content created after a build and invalid routes are served through that fallback until the next build.
- Analytics/page-view tracking does not run during prerender.

### Social image and AI-readable route reference (Phase 16.7)

- `frontend-site/public/og-default.jpg` is the lightweight default Social/OG image. It is used for Open Graph, Twitter, and JSON-LD image fields when page content has no image of its own.
- `frontend-site/public/llms.txt` lists only the current canonical public routes and documents the legacy `/experiences` and `/skills` redirects.

### Deployment safety

- The frontend-site Docker build receives `PRERENDER_API_BASE_URL` only in the builder stage; it is absent from the final Nginx image.
- Production Docker prerender reaches the already-running backend through the private Compose network (`http://backend:3000/api`), avoiding the public CDN/WAF during the build.
- Repository Nginx serves existing prerendered HTML and falls back to `index.csr.html`; prerender HTML uses revalidation/no-cache headers while hashed assets keep long cache lifetimes.
- Safe deployment sequence: build the `frontend-site` image first, then recreate only that service after a successful build. A failed build leaves the running version available.
- Host Nginx on the VPS has been reviewed but intentionally remains unchanged.

### Validation completed

- Local prerender builds succeeded with the backend available and generated the static, article, and project routes.
- Production-like Docker build succeeded with an explicit build-time API URL.
- Nginx configuration validation and requests for prerender routes, new dynamic routes, and invalid routes succeeded with the expected prerender/CSR behavior.

## Reference documents

- Deployment procedure: `docs/DEPLOYMENT.md`
- Architecture and runtime details: `.ai/architecture.md`
- Delivered product milestones: `docs/roadmap.md`
