# Database Design

## Tables

### AboutMe
- `id` UUID PK
- `fullName` VARCHAR(255)
- `title` VARCHAR(255)
- `bio` TEXT
- `email` VARCHAR(255)
- `phone` VARCHAR(50) nullable
- `location` VARCHAR(255) nullable
- `avatarUrl` VARCHAR(500) nullable
- `resumeUrl` VARCHAR(500) nullable
- `socialLinks` JSONB nullable
- `createdAt` TIMESTAMP
- `updatedAt` TIMESTAMP

### Experiences
- `id` UUID PK
- `company` VARCHAR(255)
- `position` VARCHAR(255)
- `description` TEXT nullable
- `startDate` DATE
- `endDate` DATE nullable (null = currently working)
- `technologies` TEXT[] nullable
- `order` INT DEFAULT 0
- `createdAt` TIMESTAMP
- `updatedAt` TIMESTAMP

### Educations
- `id` UUID PK
- `institution` VARCHAR(255)
- `degree` VARCHAR(255)
- `field` VARCHAR(255) nullable
- `startDate` DATE
- `endDate` DATE nullable
- `description` TEXT nullable
- `order` INT DEFAULT 0
- `createdAt` TIMESTAMP
- `updatedAt` TIMESTAMP

### Skills
- `id` UUID PK
- `name` VARCHAR(255)
- `category` VARCHAR(255) nullable
- `level` INT nullable (0-100 یا-style)
- `order` INT DEFAULT 0
- `createdAt` TIMESTAMP
- `updatedAt` TIMESTAMP

### Articles
- `id` UUID PK
- `title` VARCHAR(500)
- `slug` VARCHAR(500) UNIQUE
- `excerpt` TEXT nullable
- `content` TEXT
- `coverImage` VARCHAR(500) nullable
- `published` BOOLEAN DEFAULT false
- `publishedAt` TIMESTAMP nullable
- `viewCount` INT DEFAULT 0
- `createdAt` TIMESTAMP
- `updatedAt` TIMESTAMP

### Media
- `id` UUID PK
- `type` VARCHAR(50) (image یا video)
- `url` VARCHAR(500)
- `embedHtml` TEXT nullable (for video embeds)
- `caption` VARCHAR(500) nullable
- `order` INT DEFAULT 0
- `createdAt` TIMESTAMP

### Testimonials
- `id` UUID PK
- `authorName` VARCHAR(255)
- `authorRole` VARCHAR(255) nullable
- `authorCompany` VARCHAR(255) nullable
- `content` TEXT
- `avatarUrl` VARCHAR(500) nullable
- `isApproved` BOOLEAN DEFAULT false
- `createdAt` TIMESTAMP
- `updatedAt` TIMESTAMP

### ContactMessages
- `id` UUID PK
- `name` VARCHAR(255)
- `email` VARCHAR(255)
- `subject` VARCHAR(500) nullable
- `message` TEXT
- `isRead` BOOLEAN DEFAULT false
- `createdAt` TIMESTAMP

### PageViews
- `id` UUID PK
- `path` VARCHAR(500)
- `ipAddress` VARCHAR(45) nullable
- `userAgent` TEXT nullable
- `referrer` VARCHAR(500) nullable
- `createdAt` TIMESTAMP

## Indexes

- Articles: slug (unique), published + publishedAt
- Experiences: order
- Educations: order
- Skills: order, category
- Testimonials: isApproved, createdAt
- ContactMessages: isRead, createdAt
- PageViews: path, createdAt

## Prisma Schema

```prisma
model AboutMe {
  id          String   @id @default(uuid())
  fullName    String
  title       String
  bio         String
  email       String
  phone       String?
  location    String?
  avatarUrl   String?
  resumeUrl   String?
  socialLinks Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("about_me")
}

model Experience {
  id          String   @id @default(uuid())
  company     String
  position    String
  description String?
  startDate   DateTime
  endDate     DateTime?
  technologies String[]
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("experiences")
}

model Education {
  id          String   @id @default(uuid())
  institution String
  degree      String
  field       String?
  startDate   DateTime
  endDate     DateTime?
  description String?
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("educations")
}

model Skill {
  id        String   @id @default(uuid())
  name      String
  category  String?
  level     Int?
  order     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("skills")
}

model Article {
  id          String   @id @default(uuid())
  title       String
  slug        String   @unique
  excerpt      String?
  content     String
  coverImage  String?
  published   Boolean  @default(false)
  publishedAt DateTime?
  viewCount   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([slug])
  @@index([published, publishedAt])
  @@map("articles")
}

model Media {
  id        String   @id @default(uuid())
  type      String
  url       String
  embedHtml String?
  caption   String?
  order     Int      @default(0)
  createdAt DateTime @default(now())

  @@map("media")
}

model Testimonial {
  id          String   @id @default(uuid())
  authorName  String
  authorRole  String?
  authorCompany String?
  content     String
  avatarUrl   String?
  isApproved  Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([isApproved, createdAt])
  @@map("testimonials")
}

model ContactMessage {
  id        String   @id @default(uuid())
  name      String
  email     String
  subject   String?
  message   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([isRead, createdAt])
  @@map("contact_messages")
}

model PageView {
  id         String   @id @default(uuid())
  path       String
  ipAddress  String?
  userAgent  String?
  referrer   String?
  createdAt  DateTime @default(now())

  @@index([path, createdAt])
  @@map("page_views")
}
```
