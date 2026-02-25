# AI Implementation Instructions for Shipping Intelligence Platform

## Overview
This document provides detailed instructions for an AI system to implement Phase 1 of the SmartShipping Intelligence Platform. The implementation should follow enterprise Java standards using Spring Boot framework.

---

## Implementation Context

### Project Type
- **Framework**: Spring Boot 3.x with Java 17+
- **Build Tool**: Maven
- **Architecture**: Microservices-ready monolith (modular monolith)
- **Database**: PostgreSQL for transactional data, TimescaleDB for time-series
- **API Style**: RESTful with OpenAPI documentation

### Key Constraints
1. Follow enterprise Java best practices
2. Implement comprehensive error handling
3. Include unit and integration tests
4. Use proper logging (SLF4J with Logback)
5. Implement security from the start (Spring Security)
6. Follow Domain-Driven Design principles

---

## Phase 1 Implementation Tasks

### Task 1: Project Setup and Structure

#### 1.1 Maven Project Configuration
Create a Maven project with the following structure and dependencies:

```xml
<!-- Key dependencies to include -->
- spring-boot-starter-web
- spring-boot-starter-data-jpa
- spring-boot-starter-validation
- spring-boot-starter-security
- postgresql driver
- lombok
- mapstruct for DTO mapping
- springdoc-openapi for API documentation
- spring-boot-starter-test
- testcontainers for integration testing
```

#### 1.2 Package Structure
Create the following package structure:
```
com.smartshipping.platform
├── api
│   ├── controller
│   ├── dto
│   └── mapper
├── domain
│   ├── model
│   ├── repository
│   └── service
├── infrastructure
│   ├── config
│   ├── persistence
│   └── external
├── forecasting
│   ├── model
│   ├── service
│   └── algorithm
├── optimization
│   ├── model
│   ├── service
│   └── algorithm
└── common
    ├── exception
    ├── util
    └── validation
```

### Task 2: Domain Model Implementation

#### 2.1 Core Entities
Implement the following JPA entities with proper relationships:

**Booking Entity**
- Fields: bookingId, customerId, originPort, destinationPort, cargoType, volumeTEU, bookingDate, requestedDate, actualDate, revenue, status
- Relationships: ManyToOne with Customer, Port entities
- Include audit fields (createdAt, updatedAt, createdBy, updatedBy)

**Vessel Entity**
- Fields: vesselId, name, imoNumber, capacity, currentLocation, status, specifications
- Relationships: OneToMany with Voyage

**Voyage Entity**
- Fields: voyageId, vesselId, route, departureTime, arrivalTime, fuelConsumed, distanceTraveled, weatherConditions
- Relationships: ManyToOne with Vessel, ManyToMany with Port

**Port Entity**
- Fields: portId, code, name, country, latitude, longitude, facilities, restrictions
- Include port operational metrics

**Customer Entity**
- Fields: customerId, name, type, segment, creditRating, shippingPatterns

#### 2.2 Repository Layer
Create Spring Data JPA repositories with custom query methods:
- Include pagination support
- Add custom queries for complex aggregations
- Implement Specification pattern for dynamic queries

### Task 3: Data Pipeline Infrastructure

#### 3.1 Data Ingestion Service
Create services to handle:
- CSV/Excel file imports for historical data
- Batch processing with Spring Batch
- Data validation and cleansing
- Error handling and recovery mechanisms

#### 3.2 Data Models for Analytics
Create separate models for:
- Time series data storage
- Aggregated metrics
- Forecast results storage

### Task 4: Basic Demand Forecasting Implementation

#### 4.1 Forecasting Service
Implement a basic forecasting service with:
- Simple moving average as baseline
- Linear regression for trend analysis
- Seasonal decomposition
- Interface for pluggable algorithms

#### 4.2 Forecast Model Structure
```java
public interface ForecastingAlgorithm {
    ForecastResult forecast(HistoricalData data, ForecastingParameters params);
    double calculateAccuracy(ForecastResult forecast, ActualData actual);
}
```

#### 4.3 Implementation Requirements
- Support multiple time granularities (daily, weekly, monthly)
- Calculate confidence intervals
- Store forecast results with versioning
- Include accuracy metrics (MAPE, RMSE)

### Task 5: Simple Route Optimization

#### 5.1 Graph Model
Create a graph representation of shipping routes:
- Nodes represent ports
- Edges represent shipping lanes with weights (distance, time, cost)
- Support for dynamic weight updates

#### 5.2 Dijkstra Algorithm Implementation
Implement basic shortest path algorithm with:
- Multiple optimization criteria (time, distance, cost)
- Constraint handling (vessel capacity, port restrictions)
- Alternative route generation

#### 5.3 Route Service
```java
public interface RouteOptimizationService {
    OptimalRoute findOptimalRoute(String origin, String destination, OptimizationCriteria criteria);
    List<Route> findAlternativeRoutes(String origin, String destination, int maxAlternatives);
    RouteMetrics calculateRouteMetrics(Route route);
}
```

### Task 6: REST API Development

#### 6.1 API Endpoints to Implement

**Forecasting APIs**
```
POST /api/v1/forecast/demand
GET  /api/v1/forecast/{forecastId}
GET  /api/v1/forecast/accuracy
POST /api/v1/forecast/retrain
```

**Route Optimization APIs**
```
POST /api/v1/routes/optimize
GET  /api/v1/routes/{routeId}
GET  /api/v1/routes/alternatives
POST /api/v1/routes/simulate
```

**Data Management APIs**
```
POST /api/v1/data/import
GET  /api/v1/data/status
POST /api/v1/data/validate
```

**Booking APIs**
```
GET  /api/v1/bookings
POST /api/v1/bookings
GET  /api/v1/bookings/{bookingId}
PUT  /api/v1/bookings/{bookingId}
```

#### 6.2 API Requirements
- Implement proper HTTP status codes
- Add request/response validation
- Include pagination for list endpoints
- Implement rate limiting
- Add API versioning
- Generate OpenAPI documentation

### Task 7: Configuration and Security

#### 7.1 Application Configuration
Create configuration for:
- Database connections (with connection pooling)
- External service endpoints
- Algorithm parameters
- Cache settings
- Security settings

#### 7.2 Security Implementation
- JWT-based authentication
- Role-based authorization (ADMIN, OPERATOR, VIEWER)
- API key management for external integrations
- Audit logging for all operations

### Task 8: Testing Structure

#### 8.1 Unit Tests
Create unit tests for:
- All service methods
- Algorithm implementations
- Data transformations
- Validation logic

#### 8.2 Integration Tests
Create integration tests for:
- REST API endpoints
- Database operations
- End-to-end workflows
- External service integrations

#### 8.3 Test Data
Create test fixtures for:
- Sample bookings (minimum 1000 records)
- Historical voyage data
- Port information
- Customer profiles

### Task 9: Monitoring and Logging

#### 9.1 Logging Configuration
- Use SLF4J with Logback
- Implement structured logging (JSON format)
- Different log levels for different packages
- Include correlation IDs for request tracking

#### 9.2 Metrics Collection
Implement metrics for:
- API response times
- Forecast accuracy
- Algorithm performance
- Database query performance

### Task 10: Documentation

#### 10.1 Code Documentation
- JavaDoc for all public methods
- README files for each module
- Architecture decision records (ADRs)

#### 10.2 API Documentation
- OpenAPI/Swagger specification
- Example requests/responses
- Error code documentation
- Integration guides

---

## Implementation Order

### Week 1-2: Foundation
1. Set up Maven project with Spring Boot
2. Create package structure
3. Implement domain models and repositories
4. Set up database schema and migrations
5. Configure Spring Security

### Week 3-4: Core Services
1. Implement data ingestion pipeline
2. Create basic forecasting service
3. Implement simple route optimization
4. Add service layer with business logic

### Week 5-6: API Layer
1. Develop REST controllers
2. Implement DTOs and mappers
3. Add validation and error handling
4. Generate API documentation

### Week 7-8: Testing and Refinement
1. Write comprehensive unit tests
2. Create integration tests
3. Perform load testing
4. Fix bugs and optimize performance

### Week 9-12: Enhancement and Deployment
1. Add monitoring and metrics
2. Implement caching
3. Create Docker configuration
4. Prepare deployment scripts
5. Complete documentation

---

## Code Quality Guidelines

### 1. Java Best Practices
- Use Optional for nullable returns
- Implement builder pattern for complex objects
- Use streams for collection operations
- Follow SOLID principles
- Implement proper equals/hashCode for entities

### 2. Spring Boot Best Practices
- Use constructor injection over field injection
- Implement @ConfigurationProperties for configuration
- Use @Transactional appropriately
- Handle exceptions with @ControllerAdvice
- Use profiles for different environments

### 3. Database Best Practices
- Use database migrations (Flyway or Liquibase)
- Implement optimistic locking
- Use database indexes appropriately
- Implement connection pooling
- Use batch operations for bulk data

### 4. API Best Practices
- Follow REST conventions
- Use proper HTTP methods and status codes
- Implement HATEOAS where appropriate
- Version your APIs
- Include comprehensive error responses

### 5. Testing Best Practices
- Aim for >80% code coverage
- Use meaningful test names
- Mock external dependencies
- Use TestContainers for database tests
- Implement contract testing for APIs

---

## Expected Deliverables

### Phase 1 Completion Criteria
1. **Working Application**
   - Spring Boot application running successfully
   - All core endpoints functional
   - Basic authentication working

2. **Data Pipeline**
   - Ability to import historical data
   - Data validation and cleansing functional
   - Batch processing operational

3. **Forecasting Module**
   - Basic forecasting algorithm implemented
   - Accuracy metrics calculated
   - Results stored and retrievable

4. **Route Optimization**
   - Dijkstra algorithm working
   - Multiple routes generated
   - Cost calculations accurate

5. **Testing**
   - Unit test coverage >80%
   - All integration tests passing
   - Performance benchmarks met

6. **Documentation**
   - API documentation complete
   - README files present
   - Setup instructions clear

---

## Performance Requirements

### Response Times
- API responses: <500ms for 95th percentile
- Forecast generation: <5 seconds for monthly forecast
- Route optimization: <2 seconds for single route

### Scalability
- Support 100 concurrent users
- Handle 1000 requests per minute
- Process 100,000 historical records

### Reliability
- 99.9% uptime
- Graceful degradation for external service failures
- Automatic recovery from transient errors

---

## Additional Notes for AI Implementation

1. **Start Small**: Begin with the simplest implementation and gradually add complexity
2. **Test Frequently**: Run tests after implementing each component
3. **Use Real Data Structures**: Model actual shipping industry data accurately
4. **Error Handling**: Implement comprehensive error handling from the start
5. **Logging**: Add detailed logging for debugging and monitoring
6. **Security First**: Don't treat security as an afterthought
7. **Documentation**: Document as you code, not after
8. **Version Control**: Make logical commits with clear messages

---

## Questions to Address During Implementation

1. What specific forecasting algorithms should be prioritized?
2. Which external data sources should be integrated first?
3. What are the specific performance SLAs required?
4. Which shipping routes should be included in the initial implementation?
5. What are the specific compliance requirements?

---

## Success Metrics

The Phase 1 implementation will be considered successful when:
1. All core features are implemented and tested
2. The system can process historical data and generate forecasts
3. Basic route optimization is functional
4. APIs are documented and accessible
5. The codebase is maintainable and well-structured
6. Performance requirements are met
7. Security measures are in place

---

*This document should be used as the primary guide for implementing Phase 1 of the Shipping Intelligence Platform. Update it as requirements evolve.*