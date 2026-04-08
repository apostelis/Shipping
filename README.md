# SmartShipping Intelligence Platform

AI-Powered Demand Forecasting & Route Optimization for Shipping Operations.

## Overview

The SmartShipping Intelligence Platform is a Spring Boot application that provides:
- **Demand Forecasting**: Predict shipping demand using multiple algorithms (Simple Moving Average, Linear Regression)
- **Route Optimization**: Find optimal shipping routes using Dijkstra's algorithm with configurable optimization criteria

## Technology Stack

- **Framework**: Spring Boot 3.x
- **Language**: Java 17+
- **Database**: PostgreSQL
- **Migration**: Liquibase
- **Caching**: Caffeine
- **API Documentation**: OpenAPI 3.0 (Swagger)
- **Containerization**: Docker & Docker Compose

## Project Structure

```
src/main/java/com/smartshipping/platform/
├── api/
│   ├── controller/          # REST API endpoints
│   │   ├── ForecastController.java
│   │   └── RouteController.java
│   └── dto/                 # Request/Response DTOs
├── domain/
│   ├── model/               # JPA entities (Booking, Vessel, Port, Voyage, etc.)
│   └── repository/          # Spring Data JPA repositories
├── forecasting/
│   ├── algorithm/           # Forecasting algorithms
│   │   ├── ForecastingAlgorithm.java (interface)
│   │   ├── SimpleMovingAverageAlgorithm.java
│   │   └── LinearRegressionAlgorithm.java
│   ├── model/               # Forecasting domain models
│   └── service/             # ForecastingService
├── optimization/
│   ├── algorithm/           # Route optimization algorithms
│   │   └── DijkstraRouteOptimizer.java
│   ├── model/               # Optimization domain models
│   └── service/             # RouteOptimizationService
└── infrastructure/
    └── config/              # Security and application configuration
```

## API Endpoints

### Forecasting API (`/api/v1/forecasts`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/forecasts` | Generate demand forecast |
| GET | `/api/v1/forecasts/{id}` | Get forecast by ID |
| GET | `/api/v1/forecasts/lane/{laneId}` | Get forecasts for shipping lane |
| GET | `/api/v1/forecasts/algorithms` | List available algorithms |

### Route Optimization API (`/api/v1/routes`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/routes/optimize` | Find optimal route |
| GET | `/api/v1/routes/{routeId}` | Get route by ID |
| GET | `/api/v1/routes/lanes` | Get all shipping lanes |
| POST | `/api/v1/routes/refresh` | Refresh route graph cache |

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_URL` | `jdbc:postgresql://localhost:5432/shipping_db` | Database connection URL |
| `DB_USERNAME` | `postgres` | Database username |
| `DB_PASSWORD` | `postgres` | Database password |
| `JWT_SECRET` | (default key) | JWT signing secret |

### Application Properties

- Server port: `8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- API Docs: `http://localhost:8080/api-docs`

## Running the Application

### Using Docker Compose

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database on port 5432
- Application on port 8080

### Local Development

1. Start PostgreSQL:
```bash
docker-compose up -d postgres
```

2. Run the application:
```bash
./mvnw spring-boot:run
```

### Building

```bash
./mvnw clean package
```

## Domain Model

### Core Entities

- **Port**: Shipping ports with location and capacity information
- **ShippingLane**: Routes between ports with distance, transit time, and cost
- **Vessel**: Ships with capacity, status, and operational details
- **Voyage**: Scheduled trips with vessel assignments
- **Booking**: Customer cargo bookings
- **Customer**: Customer information with segmentation

### Forecasting Models

- **HistoricalData**: Time-series data for demand analysis
- **ForecastingParameters**: Algorithm configuration (window size, horizon, confidence level)
- **ForecastResult**: Predicted values with confidence intervals

### Optimization Models

- **OptimizationCriteria**: Route optimization parameters (objective type, constraints)
- **OptimalRoute**: Calculated route with segments, total distance, time, and cost

## Forecasting Algorithms

### Simple Moving Average (SMA)
Calculates forecasts based on the average of recent historical data points within a configurable window.

### Linear Regression
Uses least squares regression to identify trends and project future demand.

## Route Optimization

The Dijkstra-based optimizer finds optimal routes considering:
- **Objective Types**: MINIMIZE_COST, MINIMIZE_TIME, MINIMIZE_DISTANCE, BALANCED
- **Constraints**: Maximum transit time, maximum cost, required ports

## Testing

```bash
./mvnw test
```

## License

Proprietary - SmartShipping Platform
