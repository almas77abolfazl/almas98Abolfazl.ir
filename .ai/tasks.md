# Tasks

## Phase 1: Backend + Main Website

- [x] 1.1 Create monorepo folder structure (backend, frontend-site, frontend-admin)
- [x] 1.2 Create base docker-compose.yml (nginx, postgres, backend)
- [x] 1.3 Set up PostgreSQL database with Prisma
- [x] 1.4 Create initial tables (AboutMe, Experiences, Educations, Skills, Articles, Media)
- [x] 1.5 Implement public API endpoints for main website
  - [x] GET /api/about-me
  - [x] GET /api/experiences
  - [x] GET /api/educations
  - [x] GET /api/skills
  - [x] GET /api/articles (published only)
  - [x] GET /api/articles/:slug
  - [x] GET /api/media
  - [x] Seed script and Docker db push entrypoint
- [ ] 1.6 Build frontend site first phase (homepage, about me, experiences, skills)
- [ ] 1.7 Initial styling and responsive layout
- [ ] 1.8 Optimize build for static serving via Nginx

## Phase 2: Admin Panel + Testimonials

- [ ] 2.1 Implement authentication in backend
- [ ] 2.2 Create required tables (ContactMessages, Testimonials)
- [ ] 2.3 Admin APIs for articles, experiences, skills, and media
- [ ] 2.4 Build admin login page
- [ ] 2.5 Admin dashboard
- [ ] 2.6 Testimonial management (approve/reject)
- [ ] 2.7 Contact form on main site + API
- [ ] 2.8 Build blog page and article detail page
- [ ] 2.9 Connect admin panel to frontend

## Phase 3: Analytics

- [ ] 3.1 Create PageViews table
- [ ] 3.2 View tracking middleware in backend
- [ ] 3.3 Analytics APIs (page view counts, daily visits)
- [ ] 3.4 Simple charts in admin dashboard
- [ ] 3.5 Final optimization
