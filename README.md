ProfitOS — Profit Intelligence for Small E-commerce Sellers

ProfitOS is a Docker-first web application designed to help small and mid-sized e-commerce sellers understand their real net profit, identify products that appear profitable but actually generate losses, and make pricing decisions based on data rather than intuition.

This project was built as a senior-level portfolio application, with a strong emphasis on modern architecture, developer experience (DX), automation, and sound engineering practices.

Project Goals

Demonstrate proficiency in modern full-stack architecture

Showcase practical use of Docker, CI/CD, and cloud infrastructure

Build a realistic, potentially sellable product

Prioritize thoughtful technical decisions over feature quantity

Architecture Overview

The application follows a fully containerized architecture. All services run in isolated Docker containers and communicate through the internal Docker network.

Frontend (React/Vite)
        │
        ▼
Backend (Fastify API)
        │
        ▼
   PostgreSQL

The backend is fully stateless. All persistence is handled by PostgreSQL and external object storage (Cloudflare R2).

Docker Compose orchestrates all services, ensuring environment parity between development and production.

Components
Frontend

React + Vite

UI focused on clarity and decision-making

REST-based communication with the backend

Tailwind CSS + shadcn/ui

Biome for linting and formatting

Backend

Node.js + Fastify + TypeScript

Modular architecture (routes, services, domain)

Strict TypeScript configuration

Isolated financial calculation engine

Environment-based configuration

Health check endpoint

Data validation

Biome for linting and formatting

The domain layer is intentionally isolated from transport and persistence concerns, enabling clear separation of business logic from infrastructure.

Database

PostgreSQL running in a dedicated container

Persistent data storage via Docker volumes

Versioned migrations

Internal Docker network communication

Infrastructure (Docker-First Approach)

The project was designed to run identically in:

Local development environments

Production environments (Oracle Cloud Always Free)

No dependencies are installed directly on the host machine other than:

Docker

Docker Compose

Main containers:

frontend

backend

db

Why Docker-First?

Ensures environment parity between local and production

Eliminates “works on my machine” issues

Improves reproducibility

Encourages infrastructure awareness from day one

Cloud & Deployment

Oracle Cloud Always Free

Ubuntu Linux VM

Docker + Docker Compose

Zero-cost infrastructure

Reproducible and documented deployment

Automated Deployment (Prepared)

GitHub Actions pipeline

Triggered on pushes to main

Remote deployment via SSH

docker compose up -d --build

The production environment is fully prepared, though the primary focus of this project remains architecture, automation, and technical quality. Deployment is production-ready but intentionally staged for future activation.

Authentication

JWT + Refresh Token

API-based authentication

Token consumption via HTTP on the frontend

Environment-driven configuration

The seeded user (test@gmail.com) is strictly for local development and must not be used in production environments.

Business Domain (Core)

ProfitOS is not an ERP system.

Its primary goal is to provide profit intelligence and decision-support capabilities.

Core responsibilities:

Real net profit calculation

Margin analysis

Price simulation

Identification of low or negative profitability products

Main domain entities:

Product

Sale

Cost

Channel

FeeRule

The financial calculation engine is fully isolated from transport, infrastructure, and persistence layers.

Code Quality

Biome for linting and formatting

Strict TypeScript configuration

Consistent standards across frontend and backend

Automated development scripts

Testing (Planned)

Domain-level tests (financial calculations)

API-level tests (critical routes)

Tests focused on business logic rather than UI rendering

Roadmap (MVP)

Docker infrastructure fully operational

Backend with health check endpoint

Frontend connected to the API

Authentication system

Product management

Profit calculation engine

Basic reporting

Automated deployment pipeline

Key Technical Decisions

Docker from the first commit

Fastify for performance, type safety, and ecosystem maturity

Biome for simplicity and developer experience

Oracle Cloud Always Free for zero-cost, production-capable infrastructure

Strong emphasis on domain modeling over generic CRUD implementations
