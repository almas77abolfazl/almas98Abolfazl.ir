# Product Delivery History

> This document is a concise record of delivered milestones.
> The single source of truth for active work is [`.ai/tasks.md`](../.ai/tasks.md).

## Delivered foundation

- **Phases 1–3.5:** portfolio, public content, admin foundation, authentication, uploads, and core content management.
- **Phases 4–5:** public-site polish, responsive behavior, admin management workflows, and analytics foundations.
- **Phases 6–15:** public pages, dashboard/reporting, content management, site settings, security, deployment, and design-system improvements.

## Phase 16 — Angular, content, reporting, and SEO

### Platform upgrade and content experience

- Both frontends were upgraded to Angular 22.1.1 and TypeScript 6.0.3 with zoneless change detection.
- The article editor gained an editor-container sticky toolbar, improved long-form editing, table presentation, and responsive behavior.
- Admin article preview now follows the same public article content rules and visual treatment without creating a shared frontend package.
- Publication-date behavior now assigns `publishedAt` on first publication only and preserves it during later edits.

### Reporting

- Daily Activity Report supports a selectable day range, retains zero-day API data, and presents activity in an RTL-aware table with incremental display.

### Static prerender and SEO

- Angular static prerender generates public static pages plus published article and public/current project detail pages.
- Prerender uses the explicit build-time `PRERENDER_API_BASE_URL`; browser API requests remain relative to `/api`.
- Generated HTML contains public content and route-specific SEO data, including canonical, Open Graph, Twitter metadata, and applicable JSON-LD.
- Repository Docker/Nginx configuration serves prerendered route HTML and uses `index.csr.html` for new dynamic content and invalid-route CSR fallback.
- Deployment remains safe by building the frontend image before recreating the running frontend container. Host Nginx on the VPS remains unchanged.

## Operational references

- Deployment procedure: [`DEPLOYMENT.md`](DEPLOYMENT.md)
- Architecture and runtime details: [`.ai/architecture.md`](../.ai/architecture.md)
- Active tasks: [`.ai/tasks.md`](../.ai/tasks.md)
