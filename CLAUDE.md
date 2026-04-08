# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SmartShipping Intelligence Platform — a Spring Boot 3.2 application providing AI-powered demand forecasting and route optimization for shipping operations. Java 21, PostgreSQL, Liquibase migrations.

## Build & Run Commands

```bash
# Build
./mvnw clean package

# Run tests
./mvnw test

# Run a single test class
./mvnw test -Dtest=SimpleMovingAverageAlgorithmTest

# Run a single test method
./mvnw test -Dtest=SimpleMovingAverageAlgorithmTest#testForecastWithValidData

# Start PostgreSQL only (for local dev)
docker-compose up -d postgres

# Run app locally (requires PostgreSQL running)
./mvnw spring-boot:run

# Full stack via Docker
docker-compose up -d
```

## Architecture

Layered architecture with domain-driven separation:

- **`api/`** — REST controllers (`/api/v1/forecasts`, `/api/v1/routes`) and DTOs. MapStruct mappers go in `api/mapper/`.
- **`domain/`** — JPA entities (Port, ShippingLane, Vessel, Voyage, Booking, Customer), repositories, and domain services. All entities extend `BaseEntity` (UUID PK, audit fields via `@CreatedDate`/`@LastModifiedDate`).
- **`forecasting/`** — `ForecastingAlgorithm` interface with SMA and LinearRegression implementations. `ForecastingService` orchestrates algorithm selection.
- **`optimization/`** — `DijkstraRouteOptimizer` for route planning with configurable objectives (MINIMIZE_COST/TIME/DISTANCE/BALANCED). Supports k-alternative routes.
- **`infrastructure/`** — Spring config (SecurityConfig with stateless JWT auth, CORS for localhost:3000/8080).
- **`common/`** — Exceptions, utilities, validation.

## Key Conventions

- **Entity IDs**: UUID (not Long), generated with `GenerationType.UUID`
- **Database migrations**: Liquibase in `src/main/resources/db/migration/`, master changelog at `changelog-master.xml`
- **Tests**: JUnit 5 with H2 in-memory database (test config in `src/test/resources/application.yml` disables Liquibase, uses `ddl-auto: create-drop`)
- **Annotations**: Lombok (`@Getter/@Setter/@Builder`) + MapStruct for DTO mapping
- **Caching**: Caffeine (1000 max entries, 10m TTL) — `@EnableCaching` is active
- **Security**: JWT-based stateless auth (JJWT 0.12.3), CSRF disabled
- **API docs**: SpringDoc OpenAPI at `/swagger-ui.html` and `/api-docs`

## AI Assistant Rules

Detailed implementation guidelines live in `.aiassistant/rules/java-rules.md`. Key points:
- Follow hexagonal architecture; domain layer should have no framework dependencies
- Always run `./mvnw test` before committing
- Keep planning brief (max 10 lines), then start coding
- Use Java 21 features: records, sealed classes, pattern matching

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `DB_URL` | `jdbc:postgresql://localhost:5432/shipping_db` | Database URL |
| `DB_USERNAME` | `postgres` | DB user |
| `DB_PASSWORD` | `postgres` | DB password |
| `JWT_SECRET` | (built-in default) | JWT signing key |