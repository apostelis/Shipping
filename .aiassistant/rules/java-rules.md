---
apply: always
---

# Java Implementation Rules for Shipping Intelligence Platform

## Overview
This document provides detailed Java/Spring Boot implementation guidelines for the SmartShipping Intelligence Platform. Follow these rules and standards for all Java-based components.

**Critical Guidelines:**
- Always test before committing - run `./mvnw test` and fix all compilation errors
- Implementation over planning - keep planning brief (max 10 lines) then start coding
- Follow hexagonal architecture with clear separation of concerns
- Domain layer has NO external dependencies (no Spring, no JPA)

---

## Technology Stack Requirements

### Core Technologies
- **Java Version**: 21 (Latest LTS - leverage modern features: records, sealed classes, pattern matching, virtual threads)
- **Framework**: Spring Boot 3.3.x
- **Build Tool**: Maven Wrapper (mvnw) - ensures consistent Maven version across environments
- **Database**: PostgreSQL 16+ with TimescaleDB extension (use Testcontainers for tests)
- **Container**: Docker 24+ with multi-stage builds
- **API Documentation**: OpenAPI 3.0 with SpringDoc
- **Architecture Validation**: ArchUnit for enforcing architecture rules

### Required Dependencies
```xml
<dependencies>
    <!-- Core Spring Boot -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>

    <!-- Database -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
    </dependency>
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-core</artifactId>
    </dependency>

    <!-- Utilities -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
    </dependency>
    <dependency>
        <groupId>org.mapstruct</groupId>
        <artifactId>mapstruct</artifactId>
    </dependency>

    <!-- API Documentation -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    </dependency>

    <!-- Testing -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>testcontainers</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>postgresql</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>com.tngtech.archunit</groupId>
        <artifactId>archunit-junit5</artifactId>
        <version>1.2.1</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

---

## Package Structure Rules - Hexagonal Architecture

### Mandatory Package Organization (Ports and Adapters Pattern)
```
com.smartshipping.platform
├── domain/                      # Core business logic (NO framework dependencies)
│   ├── model/                  # Entities, Value Objects, Aggregates
│   │   ├── booking/           # Booking aggregate
│   │   ├── vessel/            # Vessel aggregate
│   │   └── port/              # Port aggregate
│   ├── service/                # Domain Services
│   ├── port/                   # Interfaces (Ports)
│   │   ├── in/                # Input ports (use cases)
│   │   └── out/               # Output ports (repository interfaces)
│   └── event/                  # Domain Events
├── application/                 # Application services (orchestration)
│   └── usecase/                # Use case implementations
├── adapter/                     # Adapters (framework-specific)
│   ├── in/
│   │   ├── web/               # REST controllers
│   │   └── messaging/         # Message listeners
│   └── out/
│       ├── persistence/       # JPA/JDBC implementations
│       └── external/          # External API clients
├── infrastructure              # Technical infrastructure
│   ├── config                 # Spring configurations
│   ├── security              # Security configurations
│   ├── persistence           # Database configurations
│   └── integration           # External service integrations
├── common                      # Shared components
│   ├── exception             # Custom exceptions
│   ├── util                  # Utility classes
│   ├── validator             # Custom validators
│   └── constant              # Application constants
└── Application.java           # Main Spring Boot class
```

---

## Coding Standards

### 1. Class Design Rules

#### Entity Classes
```java
@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "booking_seq")
    @SequenceGenerator(name = "booking_seq", sequenceName = "booking_sequence", allocationSize = 1)
    private Long id;

    @Column(nullable = false, unique = true)
    private String bookingReference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Version
    private Long version; // Optimistic locking
}
```

#### Service Classes
```java
@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;
    private final EventPublisher eventPublisher;

    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        log.debug("Creating booking for customer: {}", request.getCustomerId());

        // Validate request
        validateBookingRequest(request);

        // Create entity
        Booking booking = bookingMapper.toEntity(request);
        booking.setStatus(BookingStatus.PENDING);

        // Save
        booking = bookingRepository.save(booking);

        // Publish event
        eventPublisher.publishEvent(new BookingCreatedEvent(booking));

        log.info("Booking created successfully: {}", booking.getBookingReference());
        return bookingMapper.toResponse(booking);
    }
}
```

#### Controller Classes
```java
@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Validated
@Tag(name = "Booking Management", description = "Operations related to booking management")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new booking")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Booking created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request"),
        @ApiResponse(responseCode = "409", description = "Booking already exists")
    })
    public BookingResponse createBooking(@Valid @RequestBody BookingRequest request) {
        return bookingService.createBooking(request);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get booking by ID")
    public BookingResponse getBooking(@PathVariable Long id) {
        return bookingService.findById(id);
    }
}
```

### 2. Data Transfer Object Rules

#### Request DTO
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Booking creation request")
public class BookingRequest {

    @NotNull(message = "Customer ID is required")
    @Schema(description = "Customer identifier", example = "12345")
    private Long customerId;

    @NotBlank(message = "Origin port is required")
    @Size(min = 3, max = 5, message = "Port code must be 3-5 characters")
    @Schema(description = "Origin port code", example = "SGSIN")
    private String originPort;

    @NotBlank(message = "Destination port is required")
    @Size(min = 3, max = 5, message = "Port code must be 3-5 characters")
    @Schema(description = "Destination port code", example = "NLRTM")
    private String destinationPort;

    @NotNull(message = "Cargo volume is required")
    @Min(value = 1, message = "Volume must be at least 1 TEU")
    @Max(value = 10000, message = "Volume cannot exceed 10000 TEU")
    @Schema(description = "Cargo volume in TEU", example = "100")
    private Integer volumeTEU;

    @Future(message = "Requested date must be in the future")
    @Schema(description = "Requested shipping date")
    private LocalDate requestedDate;
}
```

### 3. Repository Rules

```java
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long>, JpaSpecificationExecutor<Booking> {

    Optional<Booking> findByBookingReference(String reference);

    @Query("SELECT b FROM Booking b WHERE b.customer.id = :customerId AND b.status = :status")
    Page<Booking> findByCustomerAndStatus(@Param("customerId") Long customerId,
                                          @Param("status") BookingStatus status,
                                          Pageable pageable);

    @Modifying
    @Query("UPDATE Booking b SET b.status = :status WHERE b.id = :id")
    void updateStatus(@Param("id") Long id, @Param("status") BookingStatus status);

    @Query(value = "SELECT * FROM bookings WHERE created_at >= :startDate", nativeQuery = true)
    List<Booking> findRecentBookings(@Param("startDate") LocalDateTime startDate);
}
```

### 4. Exception Handling Rules

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(EntityNotFoundException ex) {
        log.error("Entity not found: {}", ex.getMessage());
        return ErrorResponse.builder()
            .code("ENTITY_NOT_FOUND")
            .message(ex.getMessage())
            .timestamp(LocalDateTime.now())
            .build();
    }

    @ExceptionHandler(ValidationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidation(ValidationException ex) {
        return ErrorResponse.builder()
            .code("VALIDATION_ERROR")
            .message(ex.getMessage())
            .timestamp(LocalDateTime.now())
            .build();
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        Map<String, String> errors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                FieldError::getDefaultMessage
            ));

        return ErrorResponse.builder()
            .code("VALIDATION_ERROR")
            .message("Validation failed")
            .details(errors)
            .timestamp(LocalDateTime.now())
            .build();
    }
}
```

### 5. Configuration Rules

```java
@Configuration
@ConfigurationProperties(prefix = "app.shipping")
@Data
@Validated
public class ShippingConfiguration {

    @NotNull
    private ForecastConfig forecast;

    @NotNull
    private OptimizationConfig optimization;

    @Data
    public static class ForecastConfig {
        @Min(1)
        @Max(365)
        private Integer horizonDays = 30;

        @Min(0)
        @Max(100)
        private Double confidenceLevel = 95.0;

        private Algorithm algorithm = Algorithm.MOVING_AVERAGE;

        public enum Algorithm {
            MOVING_AVERAGE,
            LINEAR_REGRESSION,
            EXPONENTIAL_SMOOTHING
        }
    }

    @Data
    public static class OptimizationConfig {
        @Min(1)
        @Max(10)
        private Integer maxAlternativeRoutes = 3;

        private Map<String, Double> weights = Map.of(
            "distance", 0.3,
            "time", 0.4,
            "cost", 0.3
        );
    }
}
```

---

## Testing Rules - Test Pyramid Strategy

### Testing Distribution
- **Unit Tests (70%)**: Fast, isolated domain logic tests
- **Integration Tests (20%)**: Test adapters with real dependencies using Testcontainers
- **End-to-End Tests (10%)**: Critical user flows only

### ArchUnit Architecture Tests
```java
@Test
void domainShouldNotDependOnAdapters() {
    noClasses()
        .that().resideInAPackage("..domain..")
        .should().dependOnClassesThat()
        .resideInAnyPackage("..adapter..", "..application..", "org.springframework..")
        .check(importedClasses);
}

@Test
void adaptersShouldOnlyTalkToPorts() {
    classes()
        .that().resideInAPackage("..adapter..")
        .should().onlyDependOnClassesThat()
        .resideInAnyPackage("..domain.port..", "..adapter..", "java..", "org.springframework..")
        .check(importedClasses);
}
```

### 1. Unit Test Structure

```java
@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BookingMapper bookingMapper;

    @InjectMocks
    private BookingService bookingService;

    @Test
    @DisplayName("Should create booking successfully")
    void testCreateBooking_Success() {
        // Given
        BookingRequest request = createValidBookingRequest();
        Booking booking = createBookingEntity();
        BookingResponse expectedResponse = createBookingResponse();

        when(bookingMapper.toEntity(request)).thenReturn(booking);
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);
        when(bookingMapper.toResponse(booking)).thenReturn(expectedResponse);

        // When
        BookingResponse actualResponse = bookingService.createBooking(request);

        // Then
        assertThat(actualResponse).isEqualTo(expectedResponse);
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    @DisplayName("Should throw exception when customer not found")
    void testCreateBooking_CustomerNotFound() {
        // Given
        BookingRequest request = createInvalidBookingRequest();

        // When & Then
        assertThrows(EntityNotFoundException.class,
            () -> bookingService.createBooking(request));
    }
}
```

### 2. Integration Test Structure

```java
@SpringBootTest
@AutoConfigureMockMvc
@TestContainers
@ActiveProfiles("test")
class BookingControllerIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:14")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BookingRepository bookingRepository;

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Test
    @DisplayName("Should create booking via API")
    void testCreateBookingAPI() throws Exception {
        // Given
        String requestJson = """
            {
                "customerId": 1,
                "originPort": "SGSIN",
                "destinationPort": "NLRTM",
                "volumeTEU": 100,
                "requestedDate": "2024-06-01"
            }
            """;

        // When & Then
        mockMvc.perform(post("/api/v1/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.bookingReference").exists())
                .andExpect(jsonPath("$.status").value("PENDING"));

        assertThat(bookingRepository.count()).isEqualTo(1);
    }
}
```

---

## Database Rules

### 1. Migration Scripts (Flyway)

```sql
-- V1__create_booking_tables.sql
CREATE SEQUENCE booking_sequence START 1 INCREMENT 1;

CREATE TABLE bookings (
    id BIGINT PRIMARY KEY DEFAULT nextval('booking_sequence'),
    booking_reference VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    origin_port VARCHAR(5) NOT NULL,
    destination_port VARCHAR(5) NOT NULL,
    volume_teu INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    requested_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    version BIGINT DEFAULT 0,
    CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE INDEX idx_booking_customer ON bookings(customer_id);
CREATE INDEX idx_booking_status ON bookings(status);
CREATE INDEX idx_booking_created ON bookings(created_at);
```

### 2. Database Configuration

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/shipping_platform
    username: ${DB_USERNAME:shipping_user}
    password: ${DB_PASSWORD:shipping_pass}
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000

  jpa:
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        jdbc:
          batch_size: 20
        order_inserts: true
        order_updates: true
    show-sql: false
    open-in-view: false

  flyway:
    enabled: true
    baseline-on-migrate: true
    locations: classpath:db/migration
```

---

## Security Rules - OWASP Compliance

### 1. Security Configuration with OWASP Best Practices

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .headers(headers -> headers
                .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'"))
                .frameOptions(frame -> frame.deny())
                .xssProtection(xss -> xss.headerValue(XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK))
                .contentTypeOptions(Customizer.withDefaults()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**", "/swagger-ui/**", "/v3/api-docs/**")
                    .permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/bookings/**")
                    .hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/bookings/**")
                    .hasAnyRole("OPERATOR", "ADMIN")
                .anyRequest()
                    .authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    // OWASP: Return 404 instead of 401 for authorization failures
                    response.sendError(HttpServletResponse.SC_NOT_FOUND);
                }))
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Use Argon2 for stronger security
        return Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8();
}
```

---

## Performance Rules

### 1. Query Optimization
- Always use pagination for list queries
- Use projection DTOs for read-only queries
- Implement query result caching where appropriate
- Use batch operations for bulk inserts/updates
- Avoid N+1 query problems with proper fetch strategies

### 2. Caching Strategy
```java
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager(
            "forecasts",
            "routes",
            "ports",
            "customers"
        );
    }
}

// Usage in service
@Cacheable(value = "forecasts", key = "#tradeLane + '_' + #startDate")
public ForecastResult getForecast(String tradeLane, LocalDate startDate) {
    // Expensive computation
}
```

### 3. Async Processing
```java
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean
    public TaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-");
        executor.initialize();
        return executor;
    }
}

// Usage in service
@Async
public CompletableFuture<ForecastResult> calculateForecastAsync(ForecastRequest request) {
    // Long-running operation
}
```

---

## Logging Rules

### 1. Logging Configuration

```yaml
logging:
  level:
    root: INFO
    com.smartshipping.platform: DEBUG
    org.springframework.web: INFO
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
  file:
    name: logs/shipping-platform.log
    max-size: 10MB
    max-history: 30
```

### 2. Logging Best Practices
```java
@Slf4j
public class BookingService {

    public void processBooking(Long bookingId) {
        log.debug("Starting to process booking: {}", bookingId);

        try {
            // Process booking
            log.info("Successfully processed booking: {}", bookingId);
        } catch (Exception e) {
            log.error("Failed to process booking: {}", bookingId, e);
            throw new ProcessingException("Booking processing failed", e);
        }
    }
}
```

---

## API Documentation Rules

### OpenAPI Annotations
```java
@Operation(
    summary = "Create a new booking",
    description = "Creates a new shipping booking for a customer"
)
@ApiResponses(value = {
    @ApiResponse(
        responseCode = "201",
        description = "Booking created successfully",
        content = @Content(
            mediaType = "application/json",
            schema = @Schema(implementation = BookingResponse.class)
        )
    ),
    @ApiResponse(
        responseCode = "400",
        description = "Invalid request data",
        content = @Content(
            mediaType = "application/json",
            schema = @Schema(implementation = ErrorResponse.class)
        )
    )
})
```

---

## Quality Checklist

Before committing code, ensure:

- [ ] Code compiles without warnings
- [ ] All tests pass (unit and integration)
- [ ] Code coverage is above 80%
- [ ] No TODO comments without JIRA ticket references
- [ ] All public methods have JavaDoc
- [ ] No hardcoded values (use configuration)
- [ ] Proper exception handling implemented
- [ ] Logging statements added for debugging
- [ ] Security considerations addressed
- [ ] Database migrations tested
- [ ] API documentation updated
- [ ] Performance impact considered
- [ ] Code reviewed by at least one team member

---

## Docker Configuration

### Multi-Stage Build (Production-Ready)
```dockerfile
# Build stage
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /build
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN ./mvnw dependency:go-offline
COPY src src
RUN ./mvnw package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Docker Compose for Development
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=dev
      - DB_HOST=postgres
    depends_on:
      - postgres
      - timescaledb

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=shipping_platform
      - POSTGRES_USER=shipping_user
      - POSTGRES_PASSWORD=shipping_pass
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  timescaledb:
    image: timescale/timescaledb:latest-pg16
    environment:
      - POSTGRES_DB=shipping_metrics
      - POSTGRES_USER=metrics_user
      - POSTGRES_PASSWORD=metrics_pass
    volumes:
      - timescale-data:/var/lib/postgresql/data
    ports:
      - "5433:5432"

volumes:
  postgres-data:
  timescale-data:
```

---

## Maven Wrapper Setup

### Initialize Maven Wrapper
```bash
# Add Maven Wrapper to project
mvn wrapper:wrapper -Dmaven=3.9.5

# Use wrapper commands
./mvnw clean install
./mvnw test
./mvnw spring-boot:run
```

### Required Files
- `mvnw` - Unix/Linux/Mac script
- `mvnw.cmd` - Windows script
- `.mvn/wrapper/maven-wrapper.properties` - Configuration
- `.mvn/wrapper/maven-wrapper.jar` - Wrapper JAR

---

## Application Profiles

### Required Profiles Configuration

#### application-dev.yml
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/shipping_dev
  jpa:
    show-sql: true
    hibernate:
      ddl-auto: update
  h2:
    console:
      enabled: true
logging:
  level:
    root: DEBUG
    com.smartshipping: TRACE
springdoc:
  swagger-ui:
    enabled: true
```

#### application-test.yml
```yaml
spring:
  datasource:
    url: jdbc:tc:postgresql:16:///shipping_test
  jpa:
    show-sql: false
logging:
  level:
    root: WARN
```

#### application-prod.yml
```yaml
spring:
  datasource:
    url: ${DATABASE_URL}
    username: ${DATABASE_USER}
    password: ${DATABASE_PASSWORD}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
  jpa:
    show-sql: false
    properties:
      hibernate:
        jdbc:
          batch_size: 20
logging:
  level:
    root: INFO
    com.smartshipping: INFO
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,prometheus
```

---

## Prohibited Practices

1. **Never** use `@Autowired` for field injection - use constructor injection
2. **Never** catch generic `Exception` - catch specific exceptions
3. **Never** log sensitive data (passwords, tokens, PII)
4. **Never** use `System.out.println()` - use proper logging
5. **Never** hardcode credentials or secrets
6. **Never** ignore null checks - use `Optional` or validation
7. **Never** use mutable static fields
8. **Never** bypass security checks for convenience
9. **Never** commit commented-out code
10. **Never** use `SELECT *` in queries - specify columns explicitly
11. **Never** skip running tests before committing
12. **Never** return detailed error messages to clients (OWASP)

---

*This document defines the mandatory coding standards for Java implementation. All code must comply with these rules.*