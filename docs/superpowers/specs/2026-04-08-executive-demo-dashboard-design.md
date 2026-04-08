# SmartShipping Intelligence Platform — Executive Demo Dashboard

## Purpose

A self-running, clickable demo for executive audiences showcasing what AI can offer in shipping — specifically demand forecasting and route optimization. The executive can explore independently without technical guidance.

## Target Audience

Shipping industry executives evaluating AI investment. No technical background assumed. The demo should tell a clear visual story: "AI saves money, predicts demand, and handles crises."

---

## Phase 1: Backend Stabilization & Seed Data

### Global Error Handling

- `@ControllerAdvice` with `@ExceptionHandler` for `ResourceNotFoundException`, `ForecastingException`, `OptimizationException`
- Consistent JSON error responses: `{ status, message, timestamp }`

### Seed Data

Realistic Mediterranean/global shipping data loaded via Liquibase migration or `CommandLineRunner`:

**Ports (12-15):**
Piraeus, Rotterdam, Shanghai, Singapore, Hamburg, Valencia, Jeddah, Dubai, Mumbai, Los Angeles, Santos, Algeciras, Tangier Med, Colombo

**Shipping lanes (20+):**
Connecting the above ports with realistic distances, transit times, and cost breakdowns (base rate, fuel surcharge, canal fees for Suez/Panama).

**Vessels (5-8):**
Varying TEU capacity (2,000–20,000), different operational statuses.

**Historical demand data:**
12 months per major lane with realistic patterns — seasonal peaks, a demand spike event, and steady-state periods.

**Pre-computed forecast results:**
So the demo loads instantly with meaningful AI-generated predictions already visible.

### API Adjustments

- Forecast endpoints return rich results: predicted values, confidence intervals, accuracy metrics
- Route optimization returns multiple alternatives with clear cost/time/distance trade-offs
- Add endpoint to list available demo scenarios (for Phase 3 scenario selector)

---

## Phase 2: Frontend Dashboard

### Tech Stack

- **Framework:** React 18 + Vite
- **Charts:** Recharts
- **Maps:** Leaflet (free, no API key required)
- **Styling:** Tailwind CSS customized to Stripe design system
- **Font:** Inter (open-source alternative to Stripe's proprietary sohne-var) — supports variable weights, geometric feel, works well at weight 300

### Stripe Design System Application

The frontend follows the Stripe design specification:

- **Colors:** Deep navy headings (`#061b31`), Stripe purple accents (`#533afd`), slate body text (`#64748d`), white card backgrounds, soft blue borders (`#e5edf5`)
- **Typography:** Inter variable font, weight 300 for headings and body (Stripe's signature light-weight authority), weight 400 for buttons/links. Tight negative letter-spacing at display sizes.
- **Shadows:** Blue-tinted multi-layer shadows — `rgba(50,50,93,0.25) 0px 30px 45px -30px, rgba(0,0,0,0.1) 0px 18px 36px -18px` for elevated cards
- **Border radius:** Conservative 4px-8px, no pill shapes
- **Dark sections:** Brand dark (`#1c1e54`) for immersive hero/intro areas

Full Stripe design reference: `design-md/stripe/DESIGN.md` from VoltAgent/awesome-design-md

### View 1: Home Dashboard

- **KPI cards** across the top: "Cost Savings", "Forecast Accuracy", "Routes Optimized", "Avg Transit Reduction" — large numbers with trend arrows
- **Summary chart** showing demand forecast accuracy over time
- **Quick-action cards** linking to Route Optimizer and Demand Forecast views
- Stripe style: white cards with blue-tinted shadows, deep navy numbers, purple accents on positive metrics

### View 2: Route Optimizer

- **Leaflet map** showing ports as markers, shipping lanes as lines
- **User selects** origin/destination port and optimization objective (cost / time / distance / balanced)
- **Results panel** slides in showing:
  - AI-optimized route on map (purple line) vs. direct/naive route (gray line)
  - Comparison table: cost, time, distance, CO2 estimate
  - "AI saved you X%" callout prominently displayed
- **Route alternatives** listed as cards below the map

### View 3: Demand Forecast

- **Line chart** showing 12 months historical data + forecast projection with confidence interval band (shaded purple)
- **Algorithm toggle** between SMA and Linear Regression to compare predictions side-by-side
- **Shipping lane selector** dropdown
- **Callout card:** "AI detected upcoming demand spike — 3 weeks advance warning"
- **Accuracy metrics** displayed as Stripe-style badges

### Layout

- Sidebar navigation: Home / Routes / Forecast
- Clean top bar with app name and scenario selector (Phase 3)
- Optimized for desktop/tablet (executive demo context)
- Responsive but desktop-first

---

## Phase 3: Demo Polish

### Scenario Presets

A dropdown in the top bar with 4 pre-built scenarios. Each scenario triggers a backend API call (`GET /api/v1/scenarios/{scenarioId}`) that returns scenario-specific data: adjusted shipping lanes (with blocked routes removed/modified), pre-computed forecasts reflecting the scenario conditions, and updated KPI metrics. The frontend re-renders all three views with the returned data:

**1. "Normal Operations"**
Steady demand, optimized routes show moderate savings (10-15%). Baseline scenario demonstrating day-to-day AI value.

**2. "Demand Spike"**
Seasonal surge in a major lane. Forecast view highlights how AI predicted it 3 weeks early, enabling proactive capacity planning. KPI cards show forecast accuracy improvement.

**3. "Port Disruption — Rotterdam"**
Rotterdam is blocked. Route optimizer reroutes through Hamburg, Antwerp, and alternative Northern European ports. Side-by-side comparison shows AI vs. naive rerouting impact.

**4. "Strait of Hormuz Blockade"**
The strait is closed, forcing rerouting of all Gulf traffic (Dubai, Jeddah). The most dramatic scenario:
- Route optimizer recalculates all Gulf-connected lanes with the strait removed from the graph
- Side-by-side: "without AI" (delayed, expensive Cape of Good Hope route) vs. "with AI" (optimized multi-stop alternative)
- Forecast view shows predicted demand redistribution across alternative lanes
- KPI card: "Crisis mitigation: AI reduced disruption cost by X%"

The scenario mechanism is extensible — future scenarios (Suez Canal blocked, Panama drought restrictions) require only new seed data sets.

### Intro Screen

- Landing overlay on first visit: platform name, one-liner ("AI-Powered Shipping Intelligence"), "Start Exploring" button
- Stripe dark brand section (`#1c1e54`) with light weight Inter typography, purple CTA

### Transitions & Animations

- Smooth fade/slide transitions between views
- Chart data points animate in on load
- Map route lines draw from origin to destination
- Loading skeletons with Stripe ambient shadow style
- KPI numbers count up to final value on load

### Executive-Friendly Touches

- No technical jargon visible — labels use business language ("Cost Savings" not "OptimizationCriteria.MINIMIZE_COST")
- Currency and percentage formatting throughout
- Subtle "Powered by AI" badge on algorithmically-generated insights
- Print/screenshot-friendly layout (clean backgrounds, no dark scrollbars)

---

## Technical Notes

### Backend (existing Spring Boot app)

- Java 21, Spring Boot 3.2, PostgreSQL, Liquibase
- Existing endpoints: `/api/v1/forecasts`, `/api/v1/routes`
- Forecasting algorithms: SimpleMovingAverage, LinearRegression
- Route optimization: Dijkstra with k-alternatives
- Caching: Caffeine (already configured)
- API docs: SpringDoc OpenAPI at `/swagger-ui.html`

### Frontend (new)

- Separate React app served by Vite dev server (or built static files)
- Communicates with backend via REST API on port 8080
- CORS already configured for `localhost:3000` and `localhost:8080`
- No authentication required for demo (security can be relaxed for demo endpoints)

### Docker

- Existing docker-compose.yml supports PostgreSQL + app
- Frontend can be added as a third service or served as static files from the Spring Boot app

---

## Out of Scope

- Production security hardening (auth flow, rate limiting)
- Real-time data ingestion
- Multi-tenant support
- Mobile-optimized layout
- CI/CD pipeline
- Comprehensive test coverage (beyond what's needed for demo reliability)