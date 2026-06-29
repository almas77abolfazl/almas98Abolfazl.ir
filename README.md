# almas98Abolfazl.ir

A production-ready personal portfolio website built with a clean-architecture monorepo, containerized with Docker Compose.

## Architecture

This project uses a multi-container Docker architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Compose Stack                       │
├──────────────┬──────────────┬───────────────────────────────┤
│  frontend-    │  frontend-  │  backend                      │
│  site         │  admin      │                               │
│  (Nginx)      │  (Nginx)    │  (NestJS + Prisma)            │
│  Port 3001    │  /admin     │  Port 3000                    │
├──────────────┴────────────┴───────────────────────────────┤
│                     PostgreSQL 17                            │
│                    Port 5432                                │
└─────────────────────────────────────────────────────────────┘
```

**Traffic Flow:**
- Public website served by `frontend-site` on `http://localhost:3001`
- Admin panel proxied through `frontend-site` at `/admin`
- All API requests routed to the `backend` NestJS service via Nginx reverse proxy

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS, Prisma ORM, PostgreSQL |
| Admin Frontend | Angular 20, Standalone Components, Signals, Tailwind CSS |
| Public Frontend | Angular 20, SSG/Static Build, Tailwind CSS |
| Reverse Proxy | Nginx Alpine |
| Containerization | Docker Compose |

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS) or [Docker Engine + Compose](https://docs.docker.com/compose/install/) (Linux/WSL)
- Git

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/almas98Abolfazl.ir.git
   cd almas98Abolfazl.ir
   ```

2. (Optional) Create a `.env` file in the root directory to override default database credentials:
   ```env
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=almas98abolfazl
   ```

## Running the Application

Build and start all services:

```bash
docker-compose up --build
```

First startup will:
1. Pull the PostgreSQL 17 Alpine image
2. Build the NestJS backend (generating Prisma client and compiling TypeScript)
3. Build the Angular admin panel and public site
4. Run database migrations via Prisma
5. Start all services with healthchecks and resource limits

Once healthy, access:
- **Public website:** [http://localhost:3001](http://localhost:3001)
- **Admin panel:** [http://localhost:3001/admin](http://localhost:3001/admin)
  - Default credentials: `admin` / `admin123`

## Project Structure

```
almas98Abolfazl.ir/
├── backend/                  # NestJS API
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   ├── src/
│   │   ├── admin/            # Admin business logic
│   │   ├── auth/             # JWT authentication
│   │   ├── about-me/         # Public Endpoints
│   │   ├── experiences/      # Public Endpoints
│   │   ├── educations/       # Public Endpoints
│   │   ├── skills/           # Public Endpoints
│   │   ├── articles/         # Public Endpoints
│   │   ├── analytics/        # Page view tracking
│   │   └── prisma/           # PrismaService
│   └── Dockerfile
├── frontend-site/            # Angular public website
│   ├── src/
│   └── Dockerfile
├── frontend-admin/           # Angular admin panel
│   ├── src/
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Stopping the Stack

```bash
docker-compose down
```

To remove the PostgreSQL data volume as well:

```bash
docker-compose down -v
```

## Development

### Quick Start (Full Stack)

Run the complete development stack with one command (PostgreSQL in Docker + Backend + Frontend):

```powershell
.\dev.ps1
```

Or on Windows cmd:

```cmd
dev.bat
```

This will:
1. Start PostgreSQL in Docker
2. Run Prisma migrations
3. Start the NestJS backend in watch mode on port 3000
4. Start the Angular dev server on port 4200
5. Open Chrome automatically

To stop the development stack:

```powershell
.\dev-stop.ps1
```

### Individual Services

### Backend

```bash
cd backend
npm install
npm run start:dev
```

### Frontend (Public Site)

```bash
cd frontend-site
npm install
npm start
```

### Frontend (Admin)

```bash
cd frontend-admin
npm install
npm start
```
