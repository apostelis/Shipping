# Executive Demo Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-running, clickable executive demo showcasing AI-powered demand forecasting and route optimization for shipping operations.

**Architecture:** Spring Boot backend with seed data and scenario-switching API, React 18 frontend with Stripe-inspired design system. Three views: dashboard home, route optimizer with Leaflet map, demand forecast with Recharts charts. Four demo scenarios loaded from backend.

**Tech Stack:** Java 21, Spring Boot 3.2, PostgreSQL, Liquibase, React 18, Vite, Tailwind CSS, Recharts, Leaflet, React Router

**Spec:** `docs/superpowers/specs/2026-04-08-executive-demo-dashboard-design.md`

---

## File Structure

### Backend (new/modified files)

| File | Responsibility |
|------|---------------|
| Create: `src/main/java/.../common/exception/GlobalExceptionHandler.java` | `@ControllerAdvice` for consistent error responses |
| Create: `src/main/java/.../common/exception/ResourceNotFoundException.java` | 404 exception |
| Create: `src/main/java/.../common/exception/ErrorResponse.java` | Error response DTO |
| Create: `src/main/java/.../api/controller/ScenarioController.java` | Scenario switching endpoint |
| Create: `src/main/java/.../api/controller/PortController.java` | Port listing endpoint for frontend |
| Create: `src/main/java/.../api/controller/DashboardController.java` | KPI aggregation endpoint |
| Create: `src/main/java/.../api/dto/ScenarioResponse.java` | Scenario data DTO |
| Create: `src/main/java/.../api/dto/DashboardKpiResponse.java` | Dashboard KPI DTO |
| Create: `src/main/java/.../api/dto/PortResponse.java` | Port data DTO |
| Create: `src/main/resources/db/migration/V2__seed_demo_data.sql` | Ports, lanes, vessels, historical demand seed data |
| Modify: `src/main/java/.../infrastructure/config/SecurityConfig.java` | Permit all `/api/v1/**` for demo |
| Modify: `src/main/java/.../optimization/service/RouteOptimizationService.java` | Add scenario-aware lane filtering |

*Note: `...` = `com/smartshipping/platform` throughout this plan.*

### Frontend (all new)

| File | Responsibility |
|------|---------------|
| `frontend/package.json` | React 18, Vite, Tailwind, Recharts, Leaflet, React Router deps |
| `frontend/vite.config.js` | Vite config with API proxy to port 8080 |
| `frontend/tailwind.config.js` | Stripe design tokens (colors, shadows, fonts) |
| `frontend/index.html` | Entry HTML with Inter font |
| `frontend/src/main.jsx` | React entry point |
| `frontend/src/App.jsx` | Router + layout shell (sidebar, top bar, scenario selector) |
| `frontend/src/api/client.js` | Fetch wrapper for backend API |
| `frontend/src/components/Layout.jsx` | Sidebar nav + top bar + scenario dropdown |
| `frontend/src/components/KpiCard.jsx` | Animated KPI card with trend arrow |
| `frontend/src/components/RouteMap.jsx` | Leaflet map with ports and route lines |
| `frontend/src/components/ForecastChart.jsx` | Recharts line chart with confidence band |
| `frontend/src/components/ComparisonTable.jsx` | Route comparison table (AI vs naive) |
| `frontend/src/components/IntroOverlay.jsx` | First-visit intro screen |
| `frontend/src/pages/DashboardPage.jsx` | Home view with KPI cards and summary chart |
| `frontend/src/pages/RoutesPage.jsx` | Route optimizer view |
| `frontend/src/pages/ForecastPage.jsx` | Demand forecast view |
| `frontend/src/hooks/useScenario.js` | Scenario state management (React context) |
| `frontend/src/styles/stripe.css` | Stripe shadow utilities, animation classes |

---

## Phase 1: Backend Stabilization & Seed Data

### Task 1: Global Error Handling

**Files:**
- Create: `src/main/java/com/smartshipping/platform/common/exception/ErrorResponse.java`
- Create: `src/main/java/com/smartshipping/platform/common/exception/ResourceNotFoundException.java`
- Create: `src/main/java/com/smartshipping/platform/common/exception/GlobalExceptionHandler.java`
- Test: `src/test/java/com/smartshipping/platform/common/exception/GlobalExceptionHandlerTest.java`

- [ ] **Step 1: Write ErrorResponse record**

```java
// src/main/java/com/smartshipping/platform/common/exception/ErrorResponse.java
package com.smartshipping.platform.common.exception;

import java.time.LocalDateTime;

public record ErrorResponse(
    int status,
    String message,
    LocalDateTime timestamp
) {
    public ErrorResponse(int status, String message) {
        this(status, message, LocalDateTime.now());
    }
}
```

- [ ] **Step 2: Write ResourceNotFoundException**

```java
// src/main/java/com/smartshipping/platform/common/exception/ResourceNotFoundException.java
package com.smartshipping.platform.common.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

- [ ] **Step 3: Write GlobalExceptionHandler**

```java
// src/main/java/com/smartshipping/platform/common/exception/GlobalExceptionHandler.java
package com.smartshipping.platform.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(404, ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(400, ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(500, "Internal server error"));
    }
}
```

- [ ] **Step 4: Write test for GlobalExceptionHandler**

```java
// src/test/java/com/smartshipping/platform/common/exception/GlobalExceptionHandlerTest.java
package com.smartshipping.platform.common.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleNotFound_returns404WithMessage() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Port not found");
        ResponseEntity<ErrorResponse> response = handler.handleNotFound(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals(404, response.getBody().status());
        assertEquals("Port not found", response.getBody().message());
        assertNotNull(response.getBody().timestamp());
    }

    @Test
    void handleBadRequest_returns400WithMessage() {
        IllegalArgumentException ex = new IllegalArgumentException("Invalid port code");
        ResponseEntity<ErrorResponse> response = handler.handleBadRequest(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals(400, response.getBody().status());
        assertEquals("Invalid port code", response.getBody().message());
    }

    @Test
    void handleGeneral_returns500WithGenericMessage() {
        Exception ex = new RuntimeException("unexpected");
        ResponseEntity<ErrorResponse> response = handler.handleGeneral(ex);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals(500, response.getBody().status());
        assertEquals("Internal server error", response.getBody().message());
    }
}
```

- [ ] **Step 5: Run tests**

Run: `./mvnw test -Dtest=GlobalExceptionHandlerTest -pl .`
Expected: 3 tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/main/java/com/smartshipping/platform/common/exception/ src/test/java/com/smartshipping/platform/common/exception/
git commit -m "feat: add global exception handler with ErrorResponse and ResourceNotFoundException"
```

---

### Task 2: Open Security for Demo

**Files:**
- Modify: `src/main/java/com/smartshipping/platform/infrastructure/config/SecurityConfig.java`

- [ ] **Step 1: Modify SecurityConfig to permit all API requests for the demo**

In `SecurityConfig.java`, replace the `authorizeHttpRequests` block:

```java
// Replace this:
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
    .requestMatchers("/api/v1/auth/**").permitAll()
    .requestMatchers("/actuator/health").permitAll()
    .anyRequest().authenticated()
)

// With this:
.authorizeHttpRequests(auth -> auth
    .anyRequest().permitAll()
)
```

- [ ] **Step 2: Commit**

```bash
git add src/main/java/com/smartshipping/platform/infrastructure/config/SecurityConfig.java
git commit -m "feat: permit all API requests for demo mode"
```

---

### Task 3: Seed Data Migration

**Files:**
- Create: `src/main/resources/db/migration/V2__seed_demo_data.sql`

This is the largest single task. The SQL inserts realistic shipping data for all 4 demo scenarios.

- [ ] **Step 1: Create seed data SQL migration**

```sql
-- V2__seed_demo_data.sql
-- Seed data for executive demo

-- ============================================
-- PORTS (15 major global shipping ports)
-- ============================================
INSERT INTO ports (id, code, name, country, latitude, longitude, time_zone) VALUES
  (uuid_generate_v4(), 'PIRAEUS',   'Port of Piraeus',        'Greece',       37.9475000, 23.6350000, 'Europe/Athens'),
  (uuid_generate_v4(), 'ROTTERDAM', 'Port of Rotterdam',      'Netherlands',  51.9066000, 4.4883000,  'Europe/Amsterdam'),
  (uuid_generate_v4(), 'SHANGHAI',  'Port of Shanghai',       'China',        31.3600000, 121.6200000,'Asia/Shanghai'),
  (uuid_generate_v4(), 'SINGAPORE', 'Port of Singapore',      'Singapore',    1.2644000,  103.8200000,'Asia/Singapore'),
  (uuid_generate_v4(), 'HAMBURG',   'Port of Hamburg',        'Germany',      53.5333000, 9.9667000,  'Europe/Berlin'),
  (uuid_generate_v4(), 'VALENCIA',  'Port of Valencia',       'Spain',        39.4500000, -0.3200000, 'Europe/Madrid'),
  (uuid_generate_v4(), 'JEDDAH',    'Jeddah Islamic Port',    'Saudi Arabia', 21.4858000, 39.1925000, 'Asia/Riyadh'),
  (uuid_generate_v4(), 'DUBAI',     'Jebel Ali Port',         'UAE',          25.0150000, 55.0600000, 'Asia/Dubai'),
  (uuid_generate_v4(), 'MUMBAI',    'Nhava Sheva Port',       'India',        18.9500000, 72.9500000, 'Asia/Kolkata'),
  (uuid_generate_v4(), 'LOSANGELES','Port of Los Angeles',    'USA',          33.7395000, -118.2720000,'America/Los_Angeles'),
  (uuid_generate_v4(), 'SANTOS',    'Port of Santos',         'Brazil',       -23.9608000,-46.3336000,'America/Sao_Paulo'),
  (uuid_generate_v4(), 'ALGECIRAS', 'Port of Algeciras',      'Spain',        36.1300000, -5.4400000, 'Europe/Madrid'),
  (uuid_generate_v4(), 'TANGIER',   'Tanger Med',             'Morocco',      35.8800000, -5.5000000, 'Africa/Casablanca'),
  (uuid_generate_v4(), 'COLOMBO',   'Port of Colombo',        'Sri Lanka',    6.9400000,  79.8500000, 'Asia/Colombo'),
  (uuid_generate_v4(), 'CAPETOWN',  'Port of Cape Town',      'South Africa', -33.9000000,18.4300000, 'Africa/Johannesburg');

-- ============================================
-- SHIPPING LANES (25+ lanes with realistic costs)
-- ============================================
-- Asia to Europe (via Suez)
INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
SELECT uuid_generate_v4(), o.id, d.id, 8500, 408, 45000, 28000, 3500, 15000, true
FROM ports o, ports d WHERE o.code = 'SHANGHAI' AND d.code = 'ROTTERDAM';

INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
SELECT uuid_generate_v4(), o.id, d.id, 8200, 394, 43000, 27000, 3200, 15000, true
FROM ports o, ports d WHERE o.code = 'SHANGHAI' AND d.code = 'HAMBURG';

INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
SELECT uuid_generate_v4(), o.id, d.id, 6200, 298, 32000, 20500, 2800, 15000, true
FROM ports o, ports d WHERE o.code = 'SHANGHAI' AND d.code = 'PIRAEUS';

-- Singapore hub connections
INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
SELECT uuid_generate_v4(), o.id, d.id, 2500, 120, 13000, 8200, 1500, 0, true
FROM ports o, ports d WHERE o.code = 'SHANGHAI' AND d.code = 'SINGAPORE';

INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
SELECT uuid_generate_v4(), o.id, d.id, 7900, 379, 41000, 26000, 3000, 15000, true
FROM ports o, ports d WHERE o.code = 'SINGAPORE' AND d.code = 'ROTTERDAM';

INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
SELECT uuid_generate_v4(), o.id, d.id, 1600, 77, 8500, 5300, 1000, 0, true
FROM ports o, ports d WHERE o.code = 'SINGAPORE' AND d.code = 'COLOMBO';

INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
SELECT uuid_generate_v4(), o.id, d.id, 3300, 158, 17000, 10800, 2000, 0, true
FROM ports o, ports d WHERE o.code = 'SINGAPORE' AND d.code = 'MUMBAI';

INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
SELECT uuid_generate_v4(), o.id, d.id, 3400, 163, 17500, 11200, 2100, 0, true
FROM ports o, ports d WHERE o.code = 'SINGAPORE' AND d.code = 'DUBAI';

-- Gulf/Middle East connections (through Strait of Hormuz)
INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
SELECT uuid_generate_v4(), o.id, d.id, 750, 36, 4000, 2500, 500, 0, true
FROM ports o, ports d WHERE o.code = 'DUBAI' AND d.code = 'JEDDAH';

INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
SELECT uuid_generate_v4(), o.id, d.id, 4400, 211, 23000, 14500, 2500, 15000, true
FROM ports o, ports d WHERE o.code = 'DUBAI' AND d.code = 'ROTTERDAM';

INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
SELECT uuid_generate_v4(), o.id, d.id, 3700, 178, 19000, 12200, 2200, 15000, true
FROM ports o, ports d WHERE o.code = 'JEDDAH' AND d.code = 'ROTTERDAM';

INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
SELECT uuid_generate_v4(), o.id, d.id, 2300, 110, 12000, 7600, 1800, 15000, true
FROM ports o, ports d WHERE o.code = 'JEDDAH' AND d.code = 'PIRAEUS';

-- Mediterranean connections
INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
SELECT uuid_generate_v4(), o.id, d.id, 520, 25, 2800, 1700, 400, 0, true
FROM ports o, ports d WHERE o.code = 'PIRAEUS' AND d.code = 'VALENCIA';

INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
SELECT uuid_generate_v4(), o.id, d.id, 900, 43, 4800, 3000, 600, 0, true
FROM ports o, ports d WHERE o.code = 'PIRAEUS' AND d.code = 'ALGECIRAS';

INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
SELECT uuid_generate_v4(), o.id, d.id, 100, 5, 500, 300, 100, 0, true
FROM ports o, ports d WHERE o.code = 'ALGECIRAS' AND d.code = 'TANGIER';

INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
SELECT uuid_generate_v4(), o.id, d.id, 700, 34, 3700, 2300, 500, 0, true
FROM ports o, ports d WHERE o.code = 'VALENCIA' AND d.code = 'ROTTERDAM';

-- Europe to Northern Europe
INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
SELECT uuid_generate_v4(), o.id, d.id, 450, 22, 2400, 1500, 350, 0, true
FROM ports o, ports d WHERE o.code = 'ROTTERDAM' AND d.code = 'HAMBURG';

-- Transatlantic
INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
SELECT uuid_generate_v4(), o.id, d.id, 5500, 264, 29000, 18000, 3000, 0, true
FROM ports o, ports d WHERE o.code = 'ROTTERDAM' AND d.code = 'LOSANGELES';

INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
SELECT uuid_generate_v4(), o.id, d.id, 5800, 278, 30500, 19000, 3200, 0, true
FROM ports o, ports d WHERE o.code = 'ROTTERDAM' AND d.code = 'SANTOS';

-- Indian Ocean
INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
SELECT uuid_generate_v4(), o.id, d.id, 1200, 58, 6400, 4000, 800, 0, true
FROM ports o, ports d WHERE o.code = 'MUMBAI' AND d.code = 'DUBAI';

INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
SELECT uuid_generate_v4(), o.id, d.id, 600, 29, 3200, 2000, 400, 0, true
FROM ports o, ports d WHERE o.code = 'MUMBAI' AND d.code = 'COLOMBO';

-- Cape route alternatives (used when Hormuz/Suez blocked)
INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
SELECT uuid_generate_v4(), o.id, d.id, 4200, 202, 22000, 13800, 2400, 0, true
FROM ports o, ports d WHERE o.code = 'MUMBAI' AND d.code = 'CAPETOWN';

INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
SELECT uuid_generate_v4(), o.id, d.id, 6300, 302, 33000, 20700, 3500, 0, true
FROM ports o, ports d WHERE o.code = 'CAPETOWN' AND d.code = 'ROTTERDAM';

INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
SELECT uuid_generate_v4(), o.id, d.id, 3800, 182, 20000, 12500, 2200, 0, true
FROM ports o, ports d WHERE o.code = 'COLOMBO' AND d.code = 'CAPETOWN';

-- ============================================
-- VESSELS (6 vessels)
-- ============================================
INSERT INTO vessels (id, name, imo_number, call_sign, flag, capacity_teu, current_location_id, status, year_built, operator, created_at, updated_at)
SELECT uuid_generate_v4(), 'MSC Aurora', 'IMO9839430', 'MSCA1', 'Panama', 23756, p.id, 'ACTIVE', 2023, 'Mediterranean Shipping Company', NOW(), NOW()
FROM ports p WHERE p.code = 'SHANGHAI';

INSERT INTO vessels (id, name, imo_number, call_sign, flag, capacity_teu, current_location_id, status, year_built, operator, created_at, updated_at)
SELECT uuid_generate_v4(), 'Ever Forward', 'IMO9811000', 'EVRF1', 'Taiwan', 20124, p.id, 'ACTIVE', 2022, 'Evergreen Marine', NOW(), NOW()
FROM ports p WHERE p.code = 'SINGAPORE';

INSERT INTO vessels (id, name, imo_number, call_sign, flag, capacity_teu, current_location_id, status, year_built, operator, created_at, updated_at)
SELECT uuid_generate_v4(), 'Maersk Emerald', 'IMO9778920', 'MKEM1', 'Denmark', 15226, p.id, 'ACTIVE', 2021, 'Maersk Line', NOW(), NOW()
FROM ports p WHERE p.code = 'ROTTERDAM';

INSERT INTO vessels (id, name, imo_number, call_sign, flag, capacity_teu, current_location_id, status, year_built, operator, created_at, updated_at)
SELECT uuid_generate_v4(), 'CMA Athena', 'IMO9745678', 'CMAA1', 'France', 14000, p.id, 'ACTIVE', 2020, 'CMA CGM', NOW(), NOW()
FROM ports p WHERE p.code = 'PIRAEUS';

INSERT INTO vessels (id, name, imo_number, call_sign, flag, capacity_teu, current_location_id, status, year_built, operator, created_at, updated_at)
SELECT uuid_generate_v4(), 'Cosco Galaxy', 'IMO9756234', 'COSG1', 'China', 19100, p.id, 'ACTIVE', 2022, 'COSCO Shipping', NOW(), NOW()
FROM ports p WHERE p.code = 'DUBAI';

INSERT INTO vessels (id, name, imo_number, call_sign, flag, capacity_teu, current_location_id, status, year_built, operator, created_at, updated_at)
SELECT uuid_generate_v4(), 'Hapag Atlas', 'IMO9712345', 'HAPA1', 'Germany', 10500, p.id, 'IN_MAINTENANCE', 2019, 'Hapag-Lloyd', NOW(), NOW()
FROM ports p WHERE p.code = 'HAMBURG';

-- ============================================
-- HISTORICAL DEMAND (12 months, 6 major trade lanes)
-- Generated with realistic seasonal patterns
-- ============================================

-- Helper: Generate 12 months of daily data for a trade lane
-- Trade Lane 1: ASIA-EUROPE (Shanghai -> Rotterdam) - high volume, seasonal peak in Q4
INSERT INTO historical_demand (id, trade_lane, origin_port_id, destination_port_id, cargo_type, date, teu_volume, revenue, booking_count, created_at)
SELECT
    uuid_generate_v4(),
    'ASIA-EUROPE',
    o.id, d.id,
    'CONTAINER',
    gs::date,
    -- Base 850 TEU/day + seasonal pattern (peak Oct-Dec) + noise
    ROUND((850 + 200 * SIN(2 * PI() * (EXTRACT(DOY FROM gs::date) - 60) / 365) + (RANDOM() * 100 - 50))::numeric, 2),
    -- Revenue: ~$1800/TEU
    ROUND((850 + 200 * SIN(2 * PI() * (EXTRACT(DOY FROM gs::date) - 60) / 365) + (RANDOM() * 100 - 50))::numeric * 1800, 2),
    -- Bookings: ~TEU/20 per booking
    ROUND((850 + 200 * SIN(2 * PI() * (EXTRACT(DOY FROM gs::date) - 60) / 365) + (RANDOM() * 100 - 50))::numeric / 20)::integer,
    NOW()
FROM
    generate_series('2025-04-01'::date, '2026-03-31'::date, '1 day'::interval) gs,
    ports o, ports d
WHERE o.code = 'SHANGHAI' AND d.code = 'ROTTERDAM';

-- Trade Lane 2: EUROPE-AMERICAS (Rotterdam -> Los Angeles) - moderate, steady
INSERT INTO historical_demand (id, trade_lane, origin_port_id, destination_port_id, cargo_type, date, teu_volume, revenue, booking_count, created_at)
SELECT
    uuid_generate_v4(),
    'EUROPE-AMERICAS',
    o.id, d.id,
    'CONTAINER',
    gs::date,
    ROUND((420 + 80 * SIN(2 * PI() * (EXTRACT(DOY FROM gs::date) - 90) / 365) + (RANDOM() * 60 - 30))::numeric, 2),
    ROUND((420 + 80 * SIN(2 * PI() * (EXTRACT(DOY FROM gs::date) - 90) / 365) + (RANDOM() * 60 - 30))::numeric * 2200, 2),
    ROUND((420 + 80 * SIN(2 * PI() * (EXTRACT(DOY FROM gs::date) - 90) / 365) + (RANDOM() * 60 - 30))::numeric / 20)::integer,
    NOW()
FROM
    generate_series('2025-04-01'::date, '2026-03-31'::date, '1 day'::interval) gs,
    ports o, ports d
WHERE o.code = 'ROTTERDAM' AND d.code = 'LOSANGELES';

-- Trade Lane 3: GULF-EUROPE (Dubai -> Rotterdam) - oil/gas influenced
INSERT INTO historical_demand (id, trade_lane, origin_port_id, destination_port_id, cargo_type, date, teu_volume, revenue, booking_count, created_at)
SELECT
    uuid_generate_v4(),
    'GULF-EUROPE',
    o.id, d.id,
    'MIXED',
    gs::date,
    ROUND((380 + 120 * SIN(2 * PI() * (EXTRACT(DOY FROM gs::date) - 30) / 365) + (RANDOM() * 70 - 35))::numeric, 2),
    ROUND((380 + 120 * SIN(2 * PI() * (EXTRACT(DOY FROM gs::date) - 30) / 365) + (RANDOM() * 70 - 35))::numeric * 2000, 2),
    ROUND((380 + 120 * SIN(2 * PI() * (EXTRACT(DOY FROM gs::date) - 30) / 365) + (RANDOM() * 70 - 35))::numeric / 18)::integer,
    NOW()
FROM
    generate_series('2025-04-01'::date, '2026-03-31'::date, '1 day'::interval) gs,
    ports o, ports d
WHERE o.code = 'DUBAI' AND d.code = 'ROTTERDAM';

-- Trade Lane 4: INTRA-ASIA (Shanghai -> Singapore) - high frequency
INSERT INTO historical_demand (id, trade_lane, origin_port_id, destination_port_id, cargo_type, date, teu_volume, revenue, booking_count, created_at)
SELECT
    uuid_generate_v4(),
    'INTRA-ASIA',
    o.id, d.id,
    'CONTAINER',
    gs::date,
    ROUND((650 + 150 * SIN(2 * PI() * (EXTRACT(DOY FROM gs::date) - 45) / 365) + (RANDOM() * 80 - 40))::numeric, 2),
    ROUND((650 + 150 * SIN(2 * PI() * (EXTRACT(DOY FROM gs::date) - 45) / 365) + (RANDOM() * 80 - 40))::numeric * 900, 2),
    ROUND((650 + 150 * SIN(2 * PI() * (EXTRACT(DOY FROM gs::date) - 45) / 365) + (RANDOM() * 80 - 40))::numeric / 15)::integer,
    NOW()
FROM
    generate_series('2025-04-01'::date, '2026-03-31'::date, '1 day'::interval) gs,
    ports o, ports d
WHERE o.code = 'SHANGHAI' AND d.code = 'SINGAPORE';

-- Trade Lane 5: MED-NORTHEUROPE (Piraeus -> Rotterdam) - with demand spike in Feb 2026
INSERT INTO historical_demand (id, trade_lane, origin_port_id, destination_port_id, cargo_type, date, teu_volume, revenue, booking_count, created_at)
SELECT
    uuid_generate_v4(),
    'MED-NORTHEUROPE',
    o.id, d.id,
    'CONTAINER',
    gs::date,
    ROUND((
        300 + 70 * SIN(2 * PI() * (EXTRACT(DOY FROM gs::date) - 75) / 365)
        + CASE WHEN gs::date BETWEEN '2026-02-01' AND '2026-02-28'
               THEN 250  -- demand spike!
               ELSE 0 END
        + (RANDOM() * 50 - 25)
    )::numeric, 2),
    ROUND((
        300 + 70 * SIN(2 * PI() * (EXTRACT(DOY FROM gs::date) - 75) / 365)
        + CASE WHEN gs::date BETWEEN '2026-02-01' AND '2026-02-28' THEN 250 ELSE 0 END
        + (RANDOM() * 50 - 25)
    )::numeric * 1500, 2),
    ROUND((
        300 + 70 * SIN(2 * PI() * (EXTRACT(DOY FROM gs::date) - 75) / 365)
        + CASE WHEN gs::date BETWEEN '2026-02-01' AND '2026-02-28' THEN 250 ELSE 0 END
        + (RANDOM() * 50 - 25)
    )::numeric / 20)::integer,
    NOW()
FROM
    generate_series('2025-04-01'::date, '2026-03-31'::date, '1 day'::interval) gs,
    ports o, ports d
WHERE o.code = 'PIRAEUS' AND d.code = 'ROTTERDAM';

-- Trade Lane 6: INDIA-GULF (Mumbai -> Dubai) - growing trend
INSERT INTO historical_demand (id, trade_lane, origin_port_id, destination_port_id, cargo_type, date, teu_volume, revenue, booking_count, created_at)
SELECT
    uuid_generate_v4(),
    'INDIA-GULF',
    o.id, d.id,
    'MIXED',
    gs::date,
    ROUND((
        200 + 0.5 * (gs::date - '2025-04-01'::date)  -- growing trend
        + 50 * SIN(2 * PI() * (EXTRACT(DOY FROM gs::date)) / 365)
        + (RANDOM() * 40 - 20)
    )::numeric, 2),
    ROUND((
        200 + 0.5 * (gs::date - '2025-04-01'::date)
        + 50 * SIN(2 * PI() * (EXTRACT(DOY FROM gs::date)) / 365)
        + (RANDOM() * 40 - 20)
    )::numeric * 1100, 2),
    ROUND((
        200 + 0.5 * (gs::date - '2025-04-01'::date)
        + 50 * SIN(2 * PI() * (EXTRACT(DOY FROM gs::date)) / 365)
        + (RANDOM() * 40 - 20)
    )::numeric / 12)::integer,
    NOW()
FROM
    generate_series('2025-04-01'::date, '2026-03-31'::date, '1 day'::interval) gs,
    ports o, ports d
WHERE o.code = 'MUMBAI' AND d.code = 'DUBAI';
```

- [ ] **Step 2: Verify the SQL is valid by checking Liquibase changelog includes V2**

The existing `changelog-master.xml` should auto-discover the file. If not, check the changelog format and add an `<include>` entry. Read `src/main/resources/db/migration/changelog-master.xml` first to confirm the inclusion mechanism.

- [ ] **Step 3: Commit**

```bash
git add src/main/resources/db/migration/V2__seed_demo_data.sql
git commit -m "feat: add seed data with 15 ports, 25 shipping lanes, 6 vessels, and 12-month historical demand"
```

---

### Task 4: Scenario API

**Files:**
- Create: `src/main/java/com/smartshipping/platform/api/dto/ScenarioResponse.java`
- Create: `src/main/java/com/smartshipping/platform/api/dto/PortResponse.java`
- Create: `src/main/java/com/smartshipping/platform/api/dto/DashboardKpiResponse.java`
- Create: `src/main/java/com/smartshipping/platform/api/controller/ScenarioController.java`
- Create: `src/main/java/com/smartshipping/platform/api/controller/PortController.java`
- Create: `src/main/java/com/smartshipping/platform/api/controller/DashboardController.java`
- Modify: `src/main/java/com/smartshipping/platform/optimization/service/RouteOptimizationService.java`

- [ ] **Step 1: Create PortResponse DTO**

```java
// src/main/java/com/smartshipping/platform/api/dto/PortResponse.java
package com.smartshipping.platform.api.dto;

import java.math.BigDecimal;

public record PortResponse(
    String code,
    String name,
    String country,
    BigDecimal latitude,
    BigDecimal longitude
) {}
```

- [ ] **Step 2: Create ScenarioResponse DTO**

```java
// src/main/java/com/smartshipping/platform/api/dto/ScenarioResponse.java
package com.smartshipping.platform.api.dto;

import java.util.List;

public record ScenarioResponse(
    String id,
    String name,
    String description,
    List<String> disabledLanes,
    List<String> disabledPorts
) {}
```

- [ ] **Step 3: Create DashboardKpiResponse DTO**

```java
// src/main/java/com/smartshipping/platform/api/dto/DashboardKpiResponse.java
package com.smartshipping.platform.api.dto;

import java.math.BigDecimal;

public record DashboardKpiResponse(
    BigDecimal costSavingsPercent,
    BigDecimal forecastAccuracyPercent,
    int routesOptimized,
    BigDecimal avgTransitReductionPercent,
    String scenarioId
) {}
```

- [ ] **Step 4: Create ScenarioController**

```java
// src/main/java/com/smartshipping/platform/api/controller/ScenarioController.java
package com.smartshipping.platform.api.controller;

import com.smartshipping.platform.api.dto.ScenarioResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/scenarios")
@Tag(name = "Demo Scenarios", description = "Demo scenario management")
public class ScenarioController {

    private static final List<ScenarioResponse> SCENARIOS = List.of(
        new ScenarioResponse(
            "normal",
            "Normal Operations",
            "Steady demand with standard routing. AI optimizes for cost and time savings across all lanes.",
            List.of(),
            List.of()
        ),
        new ScenarioResponse(
            "demand-spike",
            "Demand Spike",
            "Sudden demand surge on the MED-NORTHEUROPE lane. AI forecasting detected the spike 3 weeks early.",
            List.of(),
            List.of()
        ),
        new ScenarioResponse(
            "port-disruption",
            "Port Disruption - Rotterdam",
            "Rotterdam port is closed due to severe weather. AI reroutes traffic through Hamburg and Antwerp.",
            List.of(),
            List.of("ROTTERDAM")
        ),
        new ScenarioResponse(
            "hormuz-blockade",
            "Strait of Hormuz Blockade",
            "The Strait of Hormuz is closed. All Gulf traffic must reroute around the Cape of Good Hope.",
            List.of("DUBAI-JEDDAH", "MUMBAI-DUBAI"),
            List.of()
        )
    );

    @GetMapping
    @Operation(summary = "List scenarios", description = "Get all available demo scenarios")
    public ResponseEntity<List<ScenarioResponse>> listScenarios() {
        return ResponseEntity.ok(SCENARIOS);
    }

    @GetMapping("/{scenarioId}")
    @Operation(summary = "Get scenario", description = "Get a specific demo scenario by ID")
    public ResponseEntity<ScenarioResponse> getScenario(@PathVariable String scenarioId) {
        return SCENARIOS.stream()
                .filter(s -> s.id().equals(scenarioId))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
```

- [ ] **Step 5: Create PortController**

```java
// src/main/java/com/smartshipping/platform/api/controller/PortController.java
package com.smartshipping.platform.api.controller;

import com.smartshipping.platform.api.dto.PortResponse;
import com.smartshipping.platform.domain.repository.PortRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ports")
@Tag(name = "Ports", description = "Port information")
public class PortController {

    private final PortRepository portRepository;

    public PortController(PortRepository portRepository) {
        this.portRepository = portRepository;
    }

    @GetMapping
    @Operation(summary = "List ports", description = "Get all ports with coordinates")
    public ResponseEntity<List<PortResponse>> listPorts() {
        List<PortResponse> ports = portRepository.findAll().stream()
                .map(p -> new PortResponse(p.getCode(), p.getName(), p.getCountry(), p.getLatitude(), p.getLongitude()))
                .toList();
        return ResponseEntity.ok(ports);
    }
}
```

- [ ] **Step 6: Create DashboardController**

```java
// src/main/java/com/smartshipping/platform/api/controller/DashboardController.java
package com.smartshipping.platform.api.controller;

import com.smartshipping.platform.api.dto.DashboardKpiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/dashboard")
@Tag(name = "Dashboard", description = "Dashboard KPI aggregation")
public class DashboardController {

    @GetMapping("/kpis")
    @Operation(summary = "Get KPIs", description = "Get dashboard KPI metrics for a scenario")
    public ResponseEntity<DashboardKpiResponse> getKpis(
            @RequestParam(defaultValue = "normal") String scenarioId) {

        DashboardKpiResponse kpis = switch (scenarioId) {
            case "demand-spike" -> new DashboardKpiResponse(
                new BigDecimal("18.5"), new BigDecimal("91.2"), 42,
                new BigDecimal("12.3"), scenarioId
            );
            case "port-disruption" -> new DashboardKpiResponse(
                new BigDecimal("23.1"), new BigDecimal("87.6"), 38,
                new BigDecimal("8.7"), scenarioId
            );
            case "hormuz-blockade" -> new DashboardKpiResponse(
                new BigDecimal("31.4"), new BigDecimal("84.3"), 56,
                new BigDecimal("15.9"), scenarioId
            );
            default -> new DashboardKpiResponse(
                new BigDecimal("14.2"), new BigDecimal("93.8"), 47,
                new BigDecimal("11.5"), "normal"
            );
        };

        return ResponseEntity.ok(kpis);
    }
}
```

- [ ] **Step 7: Add scenario-aware route filtering to RouteOptimizationService**

Add a method to `RouteOptimizationService.java` that rebuilds the graph excluding certain lanes/ports:

```java
// Add this method to RouteOptimizationService.java after the existing refreshRouteGraph() method:

public void applyScenario(List<String> disabledPorts, List<String> disabledLaneKeys) {
    this.routeOptimizer = new DijkstraRouteOptimizer();

    List<ShippingLane> lanes = shippingLaneRepository.findAllActive();

    List<DijkstraRouteOptimizer.LaneData> laneDataList = lanes.stream()
            .filter(lane -> !disabledPorts.contains(lane.getOriginPort().getCode())
                    && !disabledPorts.contains(lane.getDestinationPort().getCode()))
            .filter(lane -> !disabledLaneKeys.contains(
                    lane.getOriginPort().getCode() + "-" + lane.getDestinationPort().getCode()))
            .map(lane -> new DijkstraRouteOptimizer.LaneData(
                    lane.getOriginPort().getCode(),
                    lane.getDestinationPort().getCode(),
                    lane.getDistanceNm(),
                    lane.getEstimatedTimeHours(),
                    lane.getBaseCost(),
                    lane.getFuelCost(),
                    lane.getTransitFee(),
                    lane.getCanalFee()
            ))
            .toList();

    routeOptimizer.loadFromShippingLanes(laneDataList);
}
```

- [ ] **Step 8: Commit**

```bash
git add src/main/java/com/smartshipping/platform/api/controller/ScenarioController.java \
        src/main/java/com/smartshipping/platform/api/controller/PortController.java \
        src/main/java/com/smartshipping/platform/api/controller/DashboardController.java \
        src/main/java/com/smartshipping/platform/api/dto/ScenarioResponse.java \
        src/main/java/com/smartshipping/platform/api/dto/PortResponse.java \
        src/main/java/com/smartshipping/platform/api/dto/DashboardKpiResponse.java \
        src/main/java/com/smartshipping/platform/optimization/service/RouteOptimizationService.java
git commit -m "feat: add scenario API, port listing, dashboard KPIs, and scenario-aware route filtering"
```

---

## Phase 2: Frontend Dashboard

### Task 5: React Project Scaffold

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/postcss.config.js`
- Create: `frontend/index.html`
- Create: `frontend/src/main.jsx`
- Create: `frontend/src/styles/stripe.css`

- [ ] **Step 1: Initialize React project**

```bash
cd /Users/a.palogos/IdeaProjects/Shipping
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install react-router-dom recharts leaflet react-leaflet tailwindcss @tailwindcss/vite
```

- [ ] **Step 2: Configure Vite with API proxy and Tailwind**

```javascript
// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
```

- [ ] **Step 3: Configure Tailwind with Stripe design tokens**

```javascript
// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'stripe-purple': '#533afd',
        'stripe-purple-hover': '#4434d4',
        'stripe-purple-deep': '#2e2b8c',
        'stripe-purple-light': '#b9b9f9',
        'stripe-navy': '#061b31',
        'stripe-label': '#273951',
        'stripe-body': '#64748d',
        'stripe-border': '#e5edf5',
        'stripe-dark': '#1c1e54',
        'stripe-success': '#15be53',
        'stripe-success-text': '#108c3d',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        mono: ['Source Code Pro', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        'stripe': 'rgba(50,50,93,0.25) 0px 30px 45px -30px, rgba(0,0,0,0.1) 0px 18px 36px -18px',
        'stripe-sm': 'rgba(23,23,23,0.08) 0px 15px 35px 0px',
        'stripe-ambient': 'rgba(23,23,23,0.06) 0px 3px 6px',
      },
      borderRadius: {
        'stripe': '6px',
      }
    }
  },
  plugins: [],
}
```

- [ ] **Step 4: Create index.html with Inter font**

```html
<!-- frontend/index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SmartShipping Intelligence Platform</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@500;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create main.jsx entry point**

```jsx
// frontend/src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/stripe.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
```

- [ ] **Step 6: Create stripe.css with Tailwind imports and custom utilities**

```css
/* frontend/src/styles/stripe.css */
@import "tailwindcss";
@config "../../tailwind.config.js";

/* Stripe typography defaults */
body {
  font-family: 'Inter', 'SF Pro Display', system-ui, sans-serif;
  font-weight: 300;
  color: #061b31;
  -webkit-font-smoothing: antialiased;
}

/* Stripe heading weight */
h1, h2, h3, h4 {
  font-weight: 300;
  color: #061b31;
}

h1 { font-size: 3rem; letter-spacing: -0.96px; line-height: 1.15; }
h2 { font-size: 2rem; letter-spacing: -0.64px; line-height: 1.10; }
h3 { font-size: 1.375rem; letter-spacing: -0.22px; line-height: 1.10; }

/* Count-up animation for KPI numbers */
@keyframes countUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-count-up {
  animation: countUp 0.6s ease-out forwards;
}

/* Route draw animation */
@keyframes drawRoute {
  from { stroke-dashoffset: 1000; }
  to { stroke-dashoffset: 0; }
}

/* Leaflet overrides */
.leaflet-container {
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
}
```

- [ ] **Step 7: Verify the dev server starts**

Run: `cd frontend && npm run dev`
Expected: Vite dev server starts on http://localhost:3000

- [ ] **Step 8: Commit**

```bash
git add frontend/
git commit -m "feat: scaffold React frontend with Vite, Tailwind, and Stripe design tokens"
```

---

### Task 6: API Client & Scenario Context

**Files:**
- Create: `frontend/src/api/client.js`
- Create: `frontend/src/hooks/useScenario.js`

- [ ] **Step 1: Create API client**

```javascript
// frontend/src/api/client.js
const BASE = '/api/v1'

async function fetchJson(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || `HTTP ${res.status}`)
  }
  return res.json()
}

async function postJson(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  getScenarios: () => fetchJson('/scenarios'),
  getScenario: (id) => fetchJson(`/scenarios/${id}`),
  getKpis: (scenarioId) => fetchJson(`/dashboard/kpis?scenarioId=${scenarioId}`),
  getPorts: () => fetchJson('/ports'),
  getTradeLanes: () => fetchJson('/forecast/trade-lanes'),
  getAlgorithms: () => fetchJson('/forecast/algorithms'),
  generateForecast: (body) => postJson('/forecast/demand', body),
  optimizeRoute: (body) => postJson('/routes/optimize', body),
  getAlternativeRoutes: (origin, dest, max = 3) =>
    fetchJson(`/routes/alternatives?origin=${origin}&destination=${dest}&maxAlternatives=${max}`),
  applyScenario: (scenarioId) => postJson(`/routes/refresh`, null),
}
```

- [ ] **Step 2: Create scenario context hook**

```jsx
// frontend/src/hooks/useScenario.js
import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api/client'

const ScenarioContext = createContext(null)

export function ScenarioProvider({ children }) {
  const [scenarios, setScenarios] = useState([])
  const [activeScenario, setActiveScenario] = useState('normal')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getScenarios().then(setScenarios).finally(() => setLoading(false))
  }, [])

  const switchScenario = async (scenarioId) => {
    setActiveScenario(scenarioId)
    await api.applyScenario(scenarioId)
  }

  return (
    <ScenarioContext.Provider value={{ scenarios, activeScenario, switchScenario, loading }}>
      {children}
    </ScenarioContext.Provider>
  )
}

export function useScenario() {
  const ctx = useContext(ScenarioContext)
  if (!ctx) throw new Error('useScenario must be used within ScenarioProvider')
  return ctx
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/api/ frontend/src/hooks/
git commit -m "feat: add API client and scenario context for frontend"
```

---

### Task 7: Layout Shell & Navigation

**Files:**
- Create: `frontend/src/components/Layout.jsx`
- Create: `frontend/src/App.jsx`

- [ ] **Step 1: Create Layout component with sidebar and scenario dropdown**

```jsx
// frontend/src/components/Layout.jsx
import { NavLink, Outlet } from 'react-router-dom'
import { useScenario } from '../hooks/useScenario'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/routes', label: 'Route Optimizer', icon: '◈' },
  { to: '/forecast', label: 'Demand Forecast', icon: '◲' },
]

export default function Layout() {
  const { scenarios, activeScenario, switchScenario } = useScenario()

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-60 border-r border-stripe-border flex flex-col">
        <div className="p-6 border-b border-stripe-border">
          <h1 className="text-lg font-light tracking-tight text-stripe-navy">
            SmartShipping
          </h1>
          <p className="text-xs text-stripe-body mt-1">Intelligence Platform</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-stripe text-sm transition-colors ${
                  isActive
                    ? 'bg-stripe-purple/5 text-stripe-purple font-normal'
                    : 'text-stripe-body hover:text-stripe-navy hover:bg-gray-50'
                }`
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-stripe-border">
          <p className="text-xs text-stripe-body mb-2 font-normal">Demo Scenario</p>
          <select
            value={activeScenario}
            onChange={(e) => switchScenario(e.target.value)}
            className="w-full text-sm border border-stripe-border rounded px-2 py-1.5 text-stripe-navy focus:border-stripe-purple focus:outline-none"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Create App with routing**

```jsx
// frontend/src/App.jsx
import { Routes, Route } from 'react-router-dom'
import { ScenarioProvider } from './hooks/useScenario'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import RoutesPage from './pages/RoutesPage'
import ForecastPage from './pages/ForecastPage'

export default function App() {
  return (
    <ScenarioProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="routes" element={<RoutesPage />} />
          <Route path="forecast" element={<ForecastPage />} />
        </Route>
      </Routes>
    </ScenarioProvider>
  )
}
```

- [ ] **Step 3: Create placeholder page components**

```jsx
// frontend/src/pages/DashboardPage.jsx
export default function DashboardPage() {
  return <div className="p-8"><h2>Dashboard</h2></div>
}
```

```jsx
// frontend/src/pages/RoutesPage.jsx
export default function RoutesPage() {
  return <div className="p-8"><h2>Route Optimizer</h2></div>
}
```

```jsx
// frontend/src/pages/ForecastPage.jsx
export default function ForecastPage() {
  return <div className="p-8"><h2>Demand Forecast</h2></div>
}
```

- [ ] **Step 4: Verify navigation works in browser**

Run: `cd frontend && npm run dev`
Navigate to http://localhost:3000 — sidebar should render with nav links. Clicking between Dashboard/Routes/Forecast should switch content area.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/
git commit -m "feat: add layout shell with sidebar navigation and route placeholders"
```

---

### Task 8: KPI Card Component & Dashboard Page

**Files:**
- Create: `frontend/src/components/KpiCard.jsx`
- Modify: `frontend/src/pages/DashboardPage.jsx`

- [ ] **Step 1: Create KpiCard component**

```jsx
// frontend/src/components/KpiCard.jsx
import { useEffect, useState } from 'react'

export default function KpiCard({ label, value, unit, trend, description }) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    const target = parseFloat(value)
    if (isNaN(target)) { setDisplayed(value); return }

    let start = 0
    const duration = 800
    const startTime = performance.now()

    function tick(now) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed((eased * target).toFixed(1))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])

  const trendColor = trend === 'up' ? 'text-stripe-success-text' : 'text-red-500'
  const trendArrow = trend === 'up' ? '\u2191' : '\u2193'

  return (
    <div className="bg-white border border-stripe-border rounded-stripe p-6 shadow-stripe-ambient hover:shadow-stripe-sm transition-shadow">
      <p className="text-sm text-stripe-body font-normal">{label}</p>
      <div className="flex items-baseline gap-2 mt-2">
        <span className="text-3xl font-light tracking-tight text-stripe-navy animate-count-up">
          {displayed}
        </span>
        <span className="text-lg text-stripe-body font-light">{unit}</span>
        {trend && (
          <span className={`text-sm font-normal ${trendColor}`}>
            {trendArrow}
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-stripe-body mt-2">{description}</p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Implement DashboardPage with KPI cards**

```jsx
// frontend/src/pages/DashboardPage.jsx
import { useEffect, useState } from 'react'
import { useScenario } from '../hooks/useScenario'
import { api } from '../api/client'
import KpiCard from '../components/KpiCard'

export default function DashboardPage() {
  const { activeScenario, scenarios } = useScenario()
  const [kpis, setKpis] = useState(null)

  useEffect(() => {
    api.getKpis(activeScenario).then(setKpis)
  }, [activeScenario])

  const scenario = scenarios.find(s => s.id === activeScenario)

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h2>AI Shipping Intelligence</h2>
        {scenario && (
          <p className="text-stripe-body mt-2 text-base font-light">
            {scenario.description}
          </p>
        )}
      </div>

      {kpis && (
        <div className="grid grid-cols-4 gap-6 mb-8">
          <KpiCard
            label="Cost Savings"
            value={kpis.costSavingsPercent}
            unit="%"
            trend="up"
            description="vs. unoptimized routing"
          />
          <KpiCard
            label="Forecast Accuracy"
            value={kpis.forecastAccuracyPercent}
            unit="%"
            trend="up"
            description="MAPE across all lanes"
          />
          <KpiCard
            label="Routes Optimized"
            value={kpis.routesOptimized}
            unit=""
            description="active optimized routes"
          />
          <KpiCard
            label="Avg Transit Reduction"
            value={kpis.avgTransitReductionPercent}
            unit="%"
            trend="up"
            description="time saved per voyage"
          />
        </div>
      )}

      {/* Quick action cards */}
      <div className="grid grid-cols-2 gap-6">
        <a href="/routes" className="block bg-white border border-stripe-border rounded-stripe p-6 shadow-stripe-ambient hover:shadow-stripe transition-shadow">
          <h3>Route Optimizer</h3>
          <p className="text-stripe-body text-sm mt-2 font-light">
            Find optimal shipping routes with AI-powered cost, time, and distance optimization.
          </p>
          <span className="inline-block mt-4 text-sm text-stripe-purple font-normal">
            Explore routes &rarr;
          </span>
        </a>
        <a href="/forecast" className="block bg-white border border-stripe-border rounded-stripe p-6 shadow-stripe-ambient hover:shadow-stripe transition-shadow">
          <h3>Demand Forecast</h3>
          <p className="text-stripe-body text-sm mt-2 font-light">
            AI-powered demand prediction with confidence intervals and trend analysis.
          </p>
          <span className="inline-block mt-4 text-sm text-stripe-purple font-normal">
            View forecasts &rarr;
          </span>
        </a>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify dashboard renders with KPI cards**

Run backend: `./mvnw spring-boot:run` (requires PostgreSQL running)
Run frontend: `cd frontend && npm run dev`
Navigate to http://localhost:3000 — KPI cards should display with animated numbers.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/KpiCard.jsx frontend/src/pages/DashboardPage.jsx
git commit -m "feat: add KPI cards with count-up animation and dashboard page"
```

---

### Task 9: Route Optimizer Page with Leaflet Map

**Files:**
- Create: `frontend/src/components/RouteMap.jsx`
- Create: `frontend/src/components/ComparisonTable.jsx`
- Modify: `frontend/src/pages/RoutesPage.jsx`

- [ ] **Step 1: Create RouteMap component**

```jsx
// frontend/src/components/RouteMap.jsx
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default marker icon issue in Leaflet + Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function FitBounds({ ports }) {
  const map = useMap()
  useEffect(() => {
    if (ports.length > 0) {
      const bounds = ports.map(p => [parseFloat(p.latitude), parseFloat(p.longitude)])
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [ports, map])
  return null
}

export default function RouteMap({ ports, optimizedRoute, naiveRoute }) {
  return (
    <MapContainer
      center={[30, 50]}
      zoom={3}
      className="h-[500px] w-full rounded-stripe border border-stripe-border shadow-stripe-ambient"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <FitBounds ports={ports} />

      {ports.map((port) => (
        <Marker
          key={port.code}
          position={[parseFloat(port.latitude), parseFloat(port.longitude)]}
        >
          <Popup>
            <strong>{port.name}</strong><br />
            {port.country} ({port.code})
          </Popup>
        </Marker>
      ))}

      {naiveRoute && (
        <Polyline
          positions={naiveRoute}
          pathOptions={{ color: '#94a3b8', weight: 2, dashArray: '8 4', opacity: 0.6 }}
        />
      )}

      {optimizedRoute && (
        <Polyline
          positions={optimizedRoute}
          pathOptions={{ color: '#533afd', weight: 3, opacity: 0.9 }}
        />
      )}
    </MapContainer>
  )
}
```

- [ ] **Step 2: Create ComparisonTable component**

```jsx
// frontend/src/components/ComparisonTable.jsx
export default function ComparisonTable({ optimized, naive }) {
  if (!optimized) return null

  const savings = naive ? {
    cost: ((1 - optimized.totalCost / naive.totalCost) * 100).toFixed(1),
    time: ((1 - optimized.totalTimeHours / naive.totalTimeHours) * 100).toFixed(1),
    distance: ((1 - optimized.totalDistanceNm / naive.totalDistanceNm) * 100).toFixed(1),
  } : null

  const fmt = (v) => parseFloat(v).toLocaleString()

  return (
    <div className="bg-white border border-stripe-border rounded-stripe overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stripe-border bg-gray-50/50">
            <th className="text-left px-4 py-3 font-normal text-stripe-label">Metric</th>
            <th className="text-right px-4 py-3 font-normal text-stripe-purple">AI Optimized</th>
            {naive && <th className="text-right px-4 py-3 font-normal text-stripe-body">Direct Route</th>}
            {savings && <th className="text-right px-4 py-3 font-normal text-stripe-success-text">Savings</th>}
          </tr>
        </thead>
        <tbody className="font-light">
          <tr className="border-b border-stripe-border">
            <td className="px-4 py-3 text-stripe-navy">Distance (nm)</td>
            <td className="text-right px-4 py-3 text-stripe-navy">{fmt(optimized.totalDistanceNm)}</td>
            {naive && <td className="text-right px-4 py-3 text-stripe-body">{fmt(naive.totalDistanceNm)}</td>}
            {savings && <td className="text-right px-4 py-3 text-stripe-success-text">{savings.distance}%</td>}
          </tr>
          <tr className="border-b border-stripe-border">
            <td className="px-4 py-3 text-stripe-navy">Transit Time (hrs)</td>
            <td className="text-right px-4 py-3 text-stripe-navy">{fmt(optimized.totalTimeHours)}</td>
            {naive && <td className="text-right px-4 py-3 text-stripe-body">{fmt(naive.totalTimeHours)}</td>}
            {savings && <td className="text-right px-4 py-3 text-stripe-success-text">{savings.time}%</td>}
          </tr>
          <tr>
            <td className="px-4 py-3 text-stripe-navy">Total Cost ($)</td>
            <td className="text-right px-4 py-3 text-stripe-navy">${fmt(optimized.totalCost)}</td>
            {naive && <td className="text-right px-4 py-3 text-stripe-body">${fmt(naive.totalCost)}</td>}
            {savings && <td className="text-right px-4 py-3 text-stripe-success-text">{savings.cost}%</td>}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 3: Implement RoutesPage**

```jsx
// frontend/src/pages/RoutesPage.jsx
import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useScenario } from '../hooks/useScenario'
import RouteMap from '../components/RouteMap'
import ComparisonTable from '../components/ComparisonTable'

export default function RoutesPage() {
  const { activeScenario } = useScenario()
  const [ports, setPorts] = useState([])
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [objective, setObjective] = useState('BALANCED')
  const [result, setResult] = useState(null)
  const [alternatives, setAlternatives] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.getPorts().then((data) => {
      setPorts(data)
      if (data.length >= 2) {
        setOrigin(data.find(p => p.code === 'SHANGHAI')?.code || data[0].code)
        setDestination(data.find(p => p.code === 'ROTTERDAM')?.code || data[1].code)
      }
    })
  }, [])

  const handleOptimize = async () => {
    if (!origin || !destination) return
    setLoading(true)
    try {
      const [optimized, alts] = await Promise.all([
        api.optimizeRoute({ originPortCode: origin, destinationPortCode: destination, objectiveType: objective }),
        api.getAlternativeRoutes(origin, destination, 3),
      ])
      setResult(optimized)
      setAlternatives(alts)
    } finally {
      setLoading(false)
    }
  }

  const getPortCoords = (code) => {
    const p = ports.find(port => port.code === code)
    return p ? [parseFloat(p.latitude), parseFloat(p.longitude)] : null
  }

  const routeToCoords = (route) => {
    if (!route?.segments) return null
    const coords = [getPortCoords(route.segments[0]?.originPortCode)]
    route.segments.forEach(seg => coords.push(getPortCoords(seg.destinationPortCode)))
    return coords.filter(Boolean)
  }

  const optimizedCoords = result ? routeToCoords(result) : null
  const naiveCoords = (origin && destination) ? [getPortCoords(origin), getPortCoords(destination)].filter(Boolean) : null

  return (
    <div className="p-8 max-w-6xl">
      <h2>Route Optimizer</h2>
      <p className="text-stripe-body mt-2 mb-6 font-light">
        Select origin and destination ports to find AI-optimized shipping routes.
      </p>

      {/* Controls */}
      <div className="flex gap-4 mb-6">
        <select value={origin} onChange={e => setOrigin(e.target.value)}
          className="border border-stripe-border rounded px-3 py-2 text-sm text-stripe-navy focus:border-stripe-purple focus:outline-none">
          {ports.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
        </select>
        <span className="self-center text-stripe-body">&rarr;</span>
        <select value={destination} onChange={e => setDestination(e.target.value)}
          className="border border-stripe-border rounded px-3 py-2 text-sm text-stripe-navy focus:border-stripe-purple focus:outline-none">
          {ports.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
        </select>
        <select value={objective} onChange={e => setObjective(e.target.value)}
          className="border border-stripe-border rounded px-3 py-2 text-sm text-stripe-navy focus:border-stripe-purple focus:outline-none">
          <option value="BALANCED">Balanced</option>
          <option value="COST">Minimize Cost</option>
          <option value="TIME">Minimize Time</option>
          <option value="DISTANCE">Minimize Distance</option>
        </select>
        <button onClick={handleOptimize} disabled={loading}
          className="bg-stripe-purple text-white px-4 py-2 rounded text-sm font-normal hover:bg-stripe-purple-hover transition-colors disabled:opacity-50">
          {loading ? 'Optimizing...' : 'Optimize Route'}
        </button>
      </div>

      {/* Map */}
      <RouteMap ports={ports} optimizedRoute={optimizedCoords} naiveRoute={naiveCoords} />

      {/* Results */}
      {result && (
        <div className="mt-6 space-y-6">
          {/* Savings callout */}
          {result.totalCost > 0 && (
            <div className="bg-stripe-purple/5 border border-stripe-purple-light rounded-stripe p-4 flex items-center gap-3">
              <span className="text-stripe-purple text-2xl font-light">AI</span>
              <div>
                <p className="text-sm font-normal text-stripe-navy">Route optimized with {result.segments?.length || 0} stops</p>
                <p className="text-xs text-stripe-body">Total cost: ${parseFloat(result.totalCost).toLocaleString()} | Transit: {parseFloat(result.totalTimeHours).toFixed(0)}h</p>
              </div>
            </div>
          )}

          <ComparisonTable optimized={result} naive={alternatives[alternatives.length - 1]} />

          {/* Alternative routes */}
          {alternatives.length > 1 && (
            <div>
              <h3 className="mb-3">Alternative Routes</h3>
              <div className="grid grid-cols-3 gap-4">
                {alternatives.map((alt, i) => (
                  <div key={alt.routeId} className="bg-white border border-stripe-border rounded-stripe p-4 shadow-stripe-ambient">
                    <p className="text-sm font-normal text-stripe-navy">Route {i + 1}</p>
                    <p className="text-xs text-stripe-body mt-1">
                      {alt.segments?.map(s => s.originPortCode).join(' → ')} → {alt.segments?.[alt.segments.length - 1]?.destinationPortCode}
                    </p>
                    <div className="mt-2 flex gap-4 text-xs text-stripe-body">
                      <span>${parseFloat(alt.totalCost).toLocaleString()}</span>
                      <span>{parseFloat(alt.totalTimeHours).toFixed(0)}h</span>
                      <span>{parseFloat(alt.totalDistanceNm).toLocaleString()} nm</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Verify route optimizer page works**

Navigate to http://localhost:3000/routes — should see map with port markers, dropdowns, and optimize button. Clicking "Optimize Route" should show AI route on map and comparison table.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/RouteMap.jsx frontend/src/components/ComparisonTable.jsx frontend/src/pages/RoutesPage.jsx
git commit -m "feat: add route optimizer page with Leaflet map and comparison table"
```

---

### Task 10: Forecast Page with Recharts

**Files:**
- Create: `frontend/src/components/ForecastChart.jsx`
- Modify: `frontend/src/pages/ForecastPage.jsx`

- [ ] **Step 1: Create ForecastChart component**

```jsx
// frontend/src/components/ForecastChart.jsx
import {
  ResponsiveContainer, ComposedChart, Line, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'

export default function ForecastChart({ historicalData, forecastData, algorithmName }) {
  // Merge historical + forecast into one dataset
  const chartData = [
    ...historicalData.map(d => ({
      date: d.date,
      actual: parseFloat(d.value),
    })),
    // Overlap point: last historical = first forecast reference
    ...forecastData.map(d => ({
      date: d.date,
      predicted: parseFloat(d.predicted),
      upperBound: parseFloat(d.upperBound),
      lowerBound: parseFloat(d.lowerBound),
    })),
  ]

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5edf5" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#64748d', fontWeight: 300 }}
          tickFormatter={(d) => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#64748d', fontWeight: 300 }}
          tickFormatter={(v) => `${v.toLocaleString()} TEU`}
        />
        <Tooltip
          contentStyle={{
            border: '1px solid #e5edf5',
            borderRadius: '6px',
            boxShadow: 'rgba(50,50,93,0.25) 0px 6px 12px -6px',
            fontSize: '12px',
            fontWeight: 300,
          }}
        />
        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 300 }} />

        {/* Confidence band */}
        <Area
          dataKey="upperBound"
          stroke="none"
          fill="#533afd"
          fillOpacity={0.08}
          name="Upper Bound"
          dot={false}
        />
        <Area
          dataKey="lowerBound"
          stroke="none"
          fill="#ffffff"
          fillOpacity={1}
          name="Lower Bound"
          dot={false}
        />

        {/* Actual historical line */}
        <Line
          dataKey="actual"
          stroke="#061b31"
          strokeWidth={2}
          dot={false}
          name="Historical Demand"
        />

        {/* Forecast line */}
        <Line
          dataKey="predicted"
          stroke="#533afd"
          strokeWidth={2}
          strokeDasharray="6 3"
          dot={false}
          name={`AI Forecast (${algorithmName})`}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 2: Implement ForecastPage**

```jsx
// frontend/src/pages/ForecastPage.jsx
import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useScenario } from '../hooks/useScenario'
import ForecastChart from '../components/ForecastChart'

export default function ForecastPage() {
  const { activeScenario } = useScenario()
  const [tradeLanes, setTradeLanes] = useState([])
  const [algorithms, setAlgorithms] = useState([])
  const [selectedLane, setSelectedLane] = useState('')
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('SIMPLE_MOVING_AVERAGE')
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([api.getTradeLanes(), api.getAlgorithms()])
      .then(([lanes, algs]) => {
        setTradeLanes(lanes)
        setAlgorithms(algs)
        if (lanes.length > 0) setSelectedLane(lanes[0])
      })
  }, [])

  useEffect(() => {
    if (!selectedLane) return
    setLoading(true)
    api.generateForecast({
      tradeLane: selectedLane,
      cargoType: 'CONTAINER',
      forecastHorizon: 30,
      granularity: 'DAILY',
      algorithm: selectedAlgorithm,
    })
      .then(setForecast)
      .finally(() => setLoading(false))
  }, [selectedLane, selectedAlgorithm, activeScenario])

  const isDemandSpike = activeScenario === 'demand-spike' && selectedLane === 'MED-NORTHEUROPE'

  return (
    <div className="p-8 max-w-6xl">
      <h2>Demand Forecast</h2>
      <p className="text-stripe-body mt-2 mb-6 font-light">
        AI-powered demand prediction with confidence intervals across shipping lanes.
      </p>

      {/* Controls */}
      <div className="flex gap-4 mb-6">
        <select value={selectedLane} onChange={e => setSelectedLane(e.target.value)}
          className="border border-stripe-border rounded px-3 py-2 text-sm text-stripe-navy focus:border-stripe-purple focus:outline-none">
          {tradeLanes.map(lane => <option key={lane} value={lane}>{lane}</option>)}
        </select>
        <select value={selectedAlgorithm} onChange={e => setSelectedAlgorithm(e.target.value)}
          className="border border-stripe-border rounded px-3 py-2 text-sm text-stripe-navy focus:border-stripe-purple focus:outline-none">
          {algorithms.map(alg => <option key={alg} value={alg}>{alg.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Demand spike callout */}
      {isDemandSpike && (
        <div className="bg-stripe-purple/5 border border-stripe-purple-light rounded-stripe p-4 mb-6 flex items-center gap-3">
          <span className="text-stripe-purple text-lg">AI</span>
          <div>
            <p className="text-sm font-normal text-stripe-navy">
              Demand spike detected on MED-NORTHEUROPE lane
            </p>
            <p className="text-xs text-stripe-body">
              AI predicted this surge 3 weeks in advance, enabling proactive capacity planning.
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      {loading && <p className="text-stripe-body text-sm">Loading forecast...</p>}
      {forecast && forecast.forecastPoints && (
        <div className="bg-white border border-stripe-border rounded-stripe p-6 shadow-stripe-ambient">
          <ForecastChart
            historicalData={[]}
            forecastData={forecast.forecastPoints}
            algorithmName={forecast.algorithm?.replace(/_/g, ' ') || selectedAlgorithm}
          />
        </div>
      )}

      {/* Forecast metrics */}
      {forecast && (
        <div className="mt-6 flex gap-4">
          <div className="bg-white border border-stripe-border rounded-stripe px-4 py-3">
            <p className="text-xs text-stripe-body">Predicted Avg</p>
            <p className="text-lg font-light text-stripe-navy">
              {parseFloat(forecast.predictedValue).toLocaleString()} TEU
            </p>
          </div>
          <div className="bg-white border border-stripe-border rounded-stripe px-4 py-3">
            <p className="text-xs text-stripe-body">Confidence Range</p>
            <p className="text-lg font-light text-stripe-navy">
              {parseFloat(forecast.confidenceLower).toLocaleString()} - {parseFloat(forecast.confidenceUpper).toLocaleString()} TEU
            </p>
          </div>
          {forecast.accuracyMape && (
            <div className="bg-white border border-stripe-border rounded-stripe px-4 py-3">
              <span className="inline-block bg-green-50 text-stripe-success-text text-xs px-2 py-0.5 rounded border border-green-200 font-normal">
                MAPE: {parseFloat(forecast.accuracyMape).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify forecast page renders**

Navigate to http://localhost:3000/forecast — should show lane/algorithm dropdowns, chart with forecast data, and metric cards below.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/ForecastChart.jsx frontend/src/pages/ForecastPage.jsx
git commit -m "feat: add demand forecast page with Recharts chart and confidence intervals"
```

---

## Phase 3: Demo Polish

### Task 11: Intro Overlay

**Files:**
- Create: `frontend/src/components/IntroOverlay.jsx`
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Create IntroOverlay component**

```jsx
// frontend/src/components/IntroOverlay.jsx
import { useState, useEffect } from 'react'

export default function IntroOverlay() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const seen = sessionStorage.getItem('intro-seen')
    if (!seen) setVisible(true)
  }, [])

  const dismiss = () => {
    sessionStorage.setItem('intro-seen', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stripe-dark/95 backdrop-blur-sm">
      <div className="text-center max-w-lg px-8">
        <h1 className="text-5xl font-light tracking-tight text-white" style={{ letterSpacing: '-1.4px' }}>
          SmartShipping
        </h1>
        <p className="text-white/70 text-lg font-light mt-4">
          AI-Powered Shipping Intelligence
        </p>
        <p className="text-white/50 text-sm font-light mt-2 max-w-md mx-auto">
          Explore how artificial intelligence optimizes routes, predicts demand,
          and handles disruptions across global shipping operations.
        </p>
        <button
          onClick={dismiss}
          className="mt-8 bg-stripe-purple text-white px-6 py-2.5 rounded text-sm font-normal hover:bg-stripe-purple-hover transition-colors"
        >
          Start Exploring
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add IntroOverlay to App.jsx**

In `App.jsx`, import and render `IntroOverlay` inside the `ScenarioProvider`, before the `Routes`:

```jsx
import IntroOverlay from './components/IntroOverlay'

// In the return, add before <Routes>:
<ScenarioProvider>
  <IntroOverlay />
  <Routes>
    ...
  </Routes>
</ScenarioProvider>
```

- [ ] **Step 3: Verify overlay appears on first visit**

Navigate to http://localhost:3000 — dark overlay should appear. Click "Start Exploring" to dismiss. Refresh page — overlay should not reappear (within same session).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/IntroOverlay.jsx frontend/src/App.jsx
git commit -m "feat: add intro overlay with Stripe dark brand styling"
```

---

### Task 12: Scenario Switching Integration

**Files:**
- Modify: `frontend/src/hooks/useScenario.js`
- Modify: `frontend/src/api/client.js`
- Create: `src/main/java/com/smartshipping/platform/api/controller/ScenarioActivationController.java`

- [ ] **Step 1: Add scenario activation endpoint to backend**

```java
// src/main/java/com/smartshipping/platform/api/controller/ScenarioActivationController.java
package com.smartshipping.platform.api.controller;

import com.smartshipping.platform.optimization.service.RouteOptimizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/scenarios")
@Tag(name = "Demo Scenarios", description = "Scenario activation")
public class ScenarioActivationController {

    private final RouteOptimizationService routeOptimizationService;

    public ScenarioActivationController(RouteOptimizationService routeOptimizationService) {
        this.routeOptimizationService = routeOptimizationService;
    }

    @PostMapping("/{scenarioId}/activate")
    @Operation(summary = "Activate scenario", description = "Apply a scenario by disabling lanes/ports in the route graph")
    public ResponseEntity<Map<String, String>> activateScenario(@PathVariable String scenarioId) {
        switch (scenarioId) {
            case "port-disruption" ->
                routeOptimizationService.applyScenario(List.of("ROTTERDAM"), List.of());
            case "hormuz-blockade" ->
                routeOptimizationService.applyScenario(List.of(), List.of("DUBAI-JEDDAH", "MUMBAI-DUBAI"));
            default ->
                routeOptimizationService.applyScenario(List.of(), List.of());
        }
        return ResponseEntity.ok(Map.of("status", "activated", "scenario", scenarioId));
    }
}
```

**Note:** This creates a separate controller class for the POST endpoint. The existing `ScenarioController` handles GET requests (listing scenarios). Both share the `/api/v1/scenarios` base path — Spring will route GET vs POST correctly.

- [ ] **Step 2: Update API client with activation endpoint**

In `frontend/src/api/client.js`, replace the `applyScenario` entry:

```javascript
// Replace:
applyScenario: (scenarioId) => postJson(`/routes/refresh`, null),

// With:
applyScenario: (scenarioId) => postJson(`/scenarios/${scenarioId}/activate`, {}),
```

- [ ] **Step 3: Update useScenario to trigger data refresh on switch**

Replace `switchScenario` in `frontend/src/hooks/useScenario.js`:

```javascript
const switchScenario = async (scenarioId) => {
  setLoading(true)
  try {
    await api.applyScenario(scenarioId)
    setActiveScenario(scenarioId)
  } finally {
    setLoading(false)
  }
}
```

- [ ] **Step 4: Verify scenario switching works end-to-end**

1. Navigate to http://localhost:3000/routes
2. Optimize a route Shanghai → Rotterdam (should work normally)
3. Switch scenario to "Strait of Hormuz Blockade" in sidebar
4. Optimize Dubai → Rotterdam — route should now go via Cape Town instead of direct

- [ ] **Step 5: Commit**

```bash
git add src/main/java/com/smartshipping/platform/api/controller/ScenarioActivationController.java \
        frontend/src/api/client.js frontend/src/hooks/useScenario.js
git commit -m "feat: add scenario activation with route graph filtering"
```

---

### Task 13: Docker Compose for Full Stack

**Files:**
- Modify: `docker-compose.yml`
- Create: `frontend/Dockerfile`

- [ ] **Step 1: Create frontend Dockerfile**

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
```

- [ ] **Step 2: Create nginx config for frontend**

```nginx
# frontend/nginx.conf
server {
    listen 3000;
    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://app:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

- [ ] **Step 3: Add frontend service to docker-compose.yml**

Add to `docker-compose.yml` under `services`:

```yaml
  frontend:
    build: ./frontend
    container_name: shipping-frontend
    ports:
      - "3000:3000"
    depends_on:
      - app
```

- [ ] **Step 4: Verify full stack starts with docker-compose**

Run: `docker-compose up --build`
Navigate to http://localhost:3000 — full demo should work.

- [ ] **Step 5: Commit**

```bash
git add docker-compose.yml frontend/Dockerfile frontend/nginx.conf
git commit -m "feat: add frontend Docker service for full-stack demo deployment"
```

---

### Task 14: Final Polish & Animations

**Files:**
- Modify: `frontend/src/styles/stripe.css`
- Modify: `frontend/src/pages/RoutesPage.jsx`
- Modify: `frontend/src/pages/DashboardPage.jsx`

- [ ] **Step 1: Add page transition animations to stripe.css**

Append to `frontend/src/styles/stripe.css`:

```css
/* Page transitions */
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-page-in {
  animation: fadeSlideIn 0.3s ease-out forwards;
}

/* Card hover lift */
.card-lift {
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.card-lift:hover {
  box-shadow: rgba(50,50,93,0.25) 0px 30px 45px -30px, rgba(0,0,0,0.1) 0px 18px 36px -18px;
  transform: translateY(-1px);
}

/* Powered by AI badge */
.ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 400;
  color: #533afd;
  background: rgba(83, 58, 253, 0.05);
  border: 1px solid #b9b9f9;
  border-radius: 4px;
  padding: 1px 6px;
}
```

- [ ] **Step 2: Wrap page content with animation class**

In `DashboardPage.jsx`, wrap the outer `<div>` with `animate-page-in`:

```jsx
<div className="p-8 max-w-6xl animate-page-in">
```

Do the same in `RoutesPage.jsx` and `ForecastPage.jsx`.

- [ ] **Step 3: Add "Powered by AI" badges to insight sections**

In `RoutesPage.jsx`, inside the savings callout `<div>`, add after the text:

```jsx
<span className="ai-badge">Powered by AI</span>
```

In `ForecastPage.jsx`, add the same badge next to the forecast metrics section.

- [ ] **Step 4: Verify animations and badges render**

Navigate through all three pages — should see fade-in animation on each page transition and "Powered by AI" badges on insight cards.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/styles/stripe.css frontend/src/pages/
git commit -m "feat: add page animations, hover effects, and AI badges for demo polish"
```
