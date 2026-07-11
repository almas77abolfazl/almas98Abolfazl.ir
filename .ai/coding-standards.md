# Coding Standards

## General

- Follow SOLID principles
- Clean, readable code over clever code
- No duplicate code — extract shared logic
- Prefer composition over inheritance
- All code, comments, commit messages, and documentation in **English only**
- Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`

---

## Angular (Frontend)

### Component rules
- **Always use standalone components** — no NgModules
- **Angular 20+ control flow syntax**: `@if`, `@else`, `@for`, `@switch` — never `*ngIf`, `*ngFor`, `*ngSwitch`
- Use `OnPush` change detection where possible
- Use Angular Signals (`signal()`, `computed()`, `effect()`) for reactive state
- Lazy-load route components via `loadComponent` in route definitions
- Never use `any` type — define proper interfaces

### Tailwind v4 (CSS-first)
- Config lives in `styles.css` inside `@theme { ... }` block — **not** `tailwind.config.js`
- **Class-based dark mode is required**: `styles.css` declares `@custom-variant dark (&:where(.dark, .dark *));` so every `dark:` utility responds to the `.dark` class on `<html>` (managed by `ThemeService`). Without this line, Tailwind v4 defaults the `dark:` variant to the `prefers-color-scheme` media query and the manual theme toggle only half-works — do NOT remove it.
- The brand palette is applied by **overriding Tailwind color scales** in `@theme` (`--color-indigo-*` = Iris Violet, `--color-violet-*` = Orchid, `--color-emerald-*` = Muted Jade, `--color-slate-*` = neutrals). Change colors there, not per-template.
- Shared typography/spacing primitives live in `@layer components` (`.page-shell`, `.page-section`, `.page-header`, `.section-label`, `.page-title`, `.section-title`, `.page-subtitle`, `.title-underline`, `.prose-measure`) — use these on pages instead of ad-hoc margins/paddings (8-point spacing system).
- Updated class names (v4 canonical):
  - `bg-gradient-to-*` → `bg-linear-to-*`
  - `flex-shrink-0` → `shrink-0`
  - `flex-grow` → `grow`
  - `overflow-ellipsis` → `text-ellipsis`
  - `start-*` positional → `inset-s-*`
- Dark mode via `.dark` class on `<html>` (managed by `ThemeService`)
- RTL via `dir="rtl"` on `<html>` (managed by `I18nService`)

### i18n / bilingual pattern
- Static UI strings: use `I18nService.t('key')` — add new keys to both `en` and `fa` maps
- Dynamic data from API: `i18n.isFa ? (item.nameFa || item.name) : item.name`
  - Always fallback: FA → EN if FA field is empty/null
- FA input fields: use `dir="rtl"` attribute on the input element
- Fonts: Inter for EN, Vazirmatn for FA (auto-applied via CSS `html[dir="rtl"] body`)

### HTTP / API
- All API calls go through `ApiService` in `frontend-site`
- Admin panel components inject `HttpClient` directly (no shared service)
- Always import `provideHttpClient(withInterceptorsFromDi())` for class-based interceptors

---

## NestJS (Backend)

### Structure
- Feature-based modules (one module per domain entity)
- Public read endpoints: simple controller → service → Prisma
- Admin endpoints: all in `AdminController` / `AdminService` under `@UseGuards(AuthGuard)`
- No DTO validation currently — future: add `class-validator` + `ValidationPipe`

### Prisma usage
- Always access via `PrismaService` (injected singleton)
- `$queryRaw` results with `COUNT(*)`: wrap in `Number()` — PostgreSQL returns `BigInt` via `@prisma/adapter-pg`
- After schema changes: `npx prisma db push` then `npx prisma generate` then **restart backend**
- `import 'dotenv/config'` must be the FIRST line in `main.ts` — NestJS CLI does not auto-load `.env`

### Auth
- JWT via `@nestjs/jwt`
- `AuthGuard` validates Bearer token on every request to `/api/admin/*`
- Password stored as bcrypt hash in environment variable (not in DB)

---

## Database

- PostgreSQL — UUID primary keys (`@default(uuid())`)
- Bilingual fields: base field (EN) is required, `*Fa` variant is optional String
- `order Int @default(0)` on all list models (Experiences, Educations, Skills) for manual ordering
- Run `prisma db push` for dev, use migrations for production schema changes

---

## Git

```
feat: add article likes feature
fix: resolve BigInt serialization in analytics
chore: run prisma generate after schema update
refactor: extract bilingual helper function
docs: update .ai context files
```

---

## What NOT to do

- Do not use `*ngIf` / `*ngFor` — use `@if` / `@for`
- Do not use `ngModel` with template-driven forms in new components — prefer signals-based reactive approach
- Do not use `bg-gradient-to-*` in Tailwind classes — use `bg-linear-to-*`
- Do not return `BigInt` in JSON responses — wrap `$queryRaw` counts with `Number()`
- Do not start NestJS without `import 'dotenv/config'` at top of `main.ts`
- Do not use `as any` in Prisma queries — run `prisma generate` first if types are missing
- Do not write FA text directly in Angular templates without `dir="rtl"` on the element
