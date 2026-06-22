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

## Phase 1: Backend + Main Website

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

## Phase 2: Admin Panel + Testimonials

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

## Phase 3: Analytics

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

## Timeline

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Backend + Main Website | Pending |
| 2 | Admin Panel + Testimonials | Pending |
| 3 | Analytics | Pending |

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
