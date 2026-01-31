ProfitOS
Profit Intelligence for Small E-commerce Sellers

ProfitOS is a Docker-first web application created to help e-commerce sellers
understand their real net profit, identify products that appear profitable but
actually generate losses, and make pricing decisions based on data — not guesswork.

This project was developed as a senior-level portfolio project, with a strong focus
on modern architecture, developer experience (DX), automation, and software
engineering best practices.

==================================================
PROJECT GOALS
==================================================

- Demonstrate proficiency in modern full-stack architecture
- Showcase practical use of Docker, CI/CD, and Cloud infrastructure
- Build a realistic and potentially sellable product
- Prioritize conscious technical decisions over feature quantity

==================================================
ARCHITECTURE OVERVIEW
==================================================

The application follows a fully containerized architecture, with isolated services
communicating through the Docker network.

┌─────────────┐      HTTP       ┌──────────────┐
│  Frontend   │ ─────────────▶ │   Backend    │
│ React/Vite  │                │  Fastify API │
└─────────────┘                └───────┬──────┘
                                        │
                                        │ SQL
                                        ▼
                                ┌──────────────┐
                                │ PostgreSQL   │
                                │   Database   │
                                └──────────────┘

All services run inside Docker containers and are orchestrated using Docker Compose.

==================================================
COMPONENTS
==================================================

FRONTEND
- React + Vite
- UI focused on data clarity and decision-making
- Communication via REST API
- Styling with Tailwind CSS + shadcn/ui
- Linting and formatting with Biome

BACKEND
- Node.js + Fastify + TypeScript
- REST API
- Modular architecture (routes, services, domain)
- Isolated domain layer for financial calculations
- Configuration via environment variables
- Health check endpoint
- Data validation
- Linting and formatting with Biome

DATABASE
- PostgreSQL
- Running in a dedicated container
- Data persistence via Docker volumes
- Versioned migrations
- Communication through Docker internal network

==================================================
INFRASTRUCTURE (DOCKER-FIRST)
==================================================

The project is designed to run the same way in:

- Local development environments
- Production environments (Oracle Cloud)

No dependencies are installed directly on the host machine other than:
- Docker
- Docker Compose

Main containers:
- frontend
- backend
- db

==================================================
CLOUD & DEPLOYMENT
==================================================

Oracle Cloud Always Free
- Linux VM (Ubuntu)
- Docker + Docker Compose
- Zero-cost infrastructure
- Simple, reproducible, and well-documented setup

AUTOMATED DEPLOYMENT (PREPARED)
- GitHub Actions
- Pipeline triggered by pushes to the main branch
- Build and deploy via SSH
- docker compose up -d --build

NOTE:
The production environment is fully prepared, but production deployment will not
be executed initially. The primary focus of the project is architecture, automation,
and technical quality, keeping production ready for future use.

==================================================
AUTHENTICATION
==================================================

- JWT + Refresh Token
- API-based authentication
- Frontend consumes tokens via HTTP
- Environment-based configuration
- The user created by `pnpm db:seed` (test@gmail.com) is for local/testing only and must not be used in production.

==================================================
BUSINESS DOMAIN (CORE)
==================================================

ProfitOS is not an ERP system.

The main focus of the application is to provide profit intelligence and
decision-support capabilities.

Core domain responsibilities:
- Real net profit calculation
- Margin analysis
- Price simulation
- Identification of low or negative profitability products

Main entities:
- Product
- Sale
- Cost
- Channel
- FeeRule

The financial calculation engine is isolated from the rest of the application.

==================================================
CODE QUALITY
==================================================

- Biome for linting and formatting
- Strict TypeScript configuration
- Consistent standards across frontend and backend
- Automated development scripts

==================================================
TESTING (PLANNED)
==================================================

- Domain-level tests (financial calculations)
- API tests (critical routes)
- Tests focused on business logic, not only UI

==================================================
ROADMAP (MVP)
==================================================

1. Docker infrastructure up and running
2. Backend with health check endpoint
3. Frontend connected to the API
4. Authentication
5. Product management
6. Profit calculation engine
7. Basic reports
8. Automated deployment pipeline

==================================================
KEY TECHNICAL DECISIONS
==================================================

- Docker from the very first commit
- Fastify for performance, strong typing, and modern ecosystem
- Biome for simplicity and excellent developer experience
- Oracle Cloud Always Free for zero-cost yet production-ready infrastructure
- Focus on domain modeling and business decisions rather than generic CRUD
