# Database Design

**Engine:** PostgreSQL 17 via Docker  
**ORM:** Prisma 7 with `@prisma/adapter-pg` (pool-based driver adapter)  
**Schema file:** `backend/prisma/schema.prisma`

> ⚠️ This file documents the **actual current schema**. After any schema change, always run:
> ```
> cd backend
> npx prisma db push        # apply to DB
> npx prisma generate       # regenerate client
> ```

---

## Models

### AboutMe (singleton — only 1 row)
| Field | Type | Notes |
|---|---|---|
| id | String UUID PK | |
| fullName | String | EN |
| fullNameFa | String? | FA |
| title | String | EN job title |
| titleFa | String? | FA job title |
| bio | String? Text | EN biography |
| bioFa | String? Text | FA biography |
| avatarUrl | String? | Profile image URL |
| resumeUrl | String? | CV/Resume URL |
| createdAt | DateTime | |
| updatedAt | DateTime | @updatedAt |

### Experiences
| Field | Type | Notes |
|---|---|---|
| id | String UUID PK | |
| role | String | EN job role |
| roleFa | String? | FA job role |
| company | String | EN company name |
| companyFa | String? | FA company name |
| startDate | DateTime | |
| endDate | DateTime? | null = currently working |
| description | String? Text | EN description |
| descriptionFa | String? Text | FA description |
| technologies | String[] | tech stack array |
| order | Int default 0 | display order |
| createdAt | DateTime | |
| updatedAt | DateTime | @updatedAt |

### Educations
| Field | Type | Notes |
|---|---|---|
| id | String UUID PK | |
| degree | String | EN degree title |
| degreeFa | String? | FA degree title |
| institution | String | EN university/school |
| institutionFa | String? | FA university/school |
| field | String? | EN field of study |
| fieldFa | String? | FA field of study |
| startDate | DateTime | |
| endDate | DateTime? | |
| description | String? Text | EN |
| descriptionFa | String? Text | FA |
| order | Int default 0 | display order |
| createdAt | DateTime | |
| updatedAt | DateTime | @updatedAt |

### Skills
| Field | Type | Notes |
|---|---|---|
| id | String UUID PK | |
| name | String | EN skill name |
| nameFa | String? | FA skill name |
| category | String | EN category |
| categoryFa | String? | FA category |
| proficiency | Int? default 0 | 0–100 percentage |
| order | Int default 0 | display order |
| createdAt | DateTime | |
| updatedAt | DateTime | @updatedAt |

### Articles
| Field | Type | Notes |
|---|---|---|
| id | String UUID PK | |
| title | String | article title (single language) |
| slug | String @unique | URL slug |
| content | String Text | article body — stored as **Markdown**, rendered to HTML on the public site via `marked` |
| excerpt | String? Text | short summary |
| coverUrl | String? | Cover image URL |
| language | String default "en" | `'en'` \| `'fa'` — article is single-language |
| tags | String[] | tag strings |
| readingTime | Int default 0 | estimated minutes, auto-calculated (`ceil(words / 200)`) |
| likeCount | Int default 0 | cached like count, incremented by likes API |
| published | Boolean default false | |
| publishedAt | DateTime? | |
| createdAt | DateTime | |
| updatedAt | DateTime | @updatedAt |
| likes | ArticleLike[] | relation to likes |

> **Note**: Articles are single-language (no `*Fa` fields). The public list endpoint filters by language via `GET /api/articles?lang=fa`. `readingTime` is recalculated on every create/update from the content word count.

### ArticleLike
| Field | Type | Notes |
|---|---|---|
| id | String UUID PK | |
| articleId | String FK → Articles.id | `onDelete: Cascade` |
| ipHash | String | SHA-256 hash of requester IP |
| createdAt | DateTime | |
| UNIQUE (articleId, ipHash) | | one like per IP per article |

### Videos
| Field | Type | Notes |
|---|---|---|
| id | String UUID PK | |
| title | String | EN title |
| titleFa | String? | FA title |
| description | String? Text | EN description |
| descriptionFa | String? Text | FA description |
| platform | String | `'youtube'` \| `'aparat'` |
| videoId | String | YouTube video ID or Aparat video hash |
| thumbnailUrl | String? | optional custom thumbnail |
| order | Int default 0 | display order (asc) |
| createdAt | DateTime | |
| updatedAt | DateTime | @updatedAt |

> **Note**: `embedUrl` is **not stored** — it is computed at read time by `backend/src/videos/embed-url.util.ts` (`buildEmbedUrl(platform, videoId)`) and returned in the public `GET /api/videos` response. The public site derives a YouTube thumbnail (`img.youtube.com/vi/{id}/hqdefault.jpg`) when `thumbnailUrl` is empty.

### Media
| Field | Type | Notes |
|---|---|---|
| id | String UUID PK | |
| filename | String | stored filename |
| originalName | String | original upload name |
| mimeType | String | e.g., `image/jpeg` |
| sizeBytes | Int | file size |
| url | String | serving URL (e.g. `/api/uploads/<uuid>.<ext>`); served by the backend via `app.useStaticAssets` |
| alt | String? | alt text |
| createdAt | DateTime | |
| updatedAt | DateTime | @updatedAt |

### ContactMessage
| Field | Type | Notes |
|---|---|---|
| id | String UUID PK | |
| name | String | sender name |
| email | String | sender email |
| subject | String? | |
| message | String Text | |
| isRead | Boolean default false | |
| createdAt | DateTime | |

### Testimonial
| Field | Type | Notes |
|---|---|---|
| id | String UUID PK | |
| authorName | String | EN |
| authorNameFa | String? | FA |
| companyRole | String? | EN |
| companyRoleFa | String? | FA |
| content | String Text | EN |
| contentFa | String? Text | FA |
| rating | Int? | 1–5 stars |
| status | TestimonialStatus | PENDING / APPROVED / REJECTED |
| createdAt | DateTime | |

### PageView
| Field | Type | Notes |
|---|---|---|
| id | String UUID PK | |
| url | String | tracked URL path |
| ipHash | String? | hashed IP for uniqueness |
| createdAt | DateTime | |

---

## Planned Tables (future phases)

_None currently — Phase 4 (`ArticleLike`) and Phase 5 (`Videos`) tables are now live and documented above._

---

## Notes

- `AboutMe.upsertAboutMe()` in `admin.service.ts` handles the singleton pattern (update if exists, create if not).
- `$queryRaw` returns `BigInt` for `COUNT(*)` via `@prisma/adapter-pg` — always wrap with `Number()`.
- Prisma client is regenerated at `backend/node_modules/@prisma/client` and `backend/node_modules/.prisma/client`.
