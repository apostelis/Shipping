-- V2__seed_demo_data.sql
-- SmartShipping Intelligence Platform - Seed Data for Executive Demo

-- ============================================================
-- PORTS (15 major global ports with real coordinates)
-- ============================================================

INSERT INTO ports (id, code, name, country, latitude, longitude, time_zone, facilities, operational_metrics) VALUES
(uuid_generate_v4(), 'GRPIR', 'Piraeus',       'Greece',         37.9475000, 23.6350000, 'Europe/Athens',
 '{"cranes": 38, "berths": 12, "maxDraft": 18.5, "containerTerminals": 3}',
 '{"avgTurnaroundHrs": 18, "annualTEU": 5650000, "utilizationPct": 78}'),

(uuid_generate_v4(), 'NLRTM', 'Rotterdam',     'Netherlands',    51.9066000,  4.4883000, 'Europe/Amsterdam',
 '{"cranes": 96, "berths": 32, "maxDraft": 24.0, "containerTerminals": 7}',
 '{"avgTurnaroundHrs": 22, "annualTEU": 14500000, "utilizationPct": 85}'),

(uuid_generate_v4(), 'CNSHA', 'Shanghai',       'China',          31.3600000, 121.6200000, 'Asia/Shanghai',
 '{"cranes": 130, "berths": 50, "maxDraft": 16.0, "containerTerminals": 9}',
 '{"avgTurnaroundHrs": 24, "annualTEU": 47000000, "utilizationPct": 91}'),

(uuid_generate_v4(), 'SGSIN', 'Singapore',      'Singapore',       1.2644000, 103.8200000, 'Asia/Singapore',
 '{"cranes": 110, "berths": 45, "maxDraft": 18.0, "containerTerminals": 6}',
 '{"avgTurnaroundHrs": 16, "annualTEU": 37000000, "utilizationPct": 88}'),

(uuid_generate_v4(), 'DEHAM', 'Hamburg',         'Germany',        53.5333000,   9.9667000, 'Europe/Berlin',
 '{"cranes": 52, "berths": 18, "maxDraft": 15.1, "containerTerminals": 4}',
 '{"avgTurnaroundHrs": 20, "annualTEU": 8700000, "utilizationPct": 80}'),

(uuid_generate_v4(), 'ESVLC', 'Valencia',       'Spain',          39.4500000,  -0.3200000, 'Europe/Madrid',
 '{"cranes": 30, "berths": 10, "maxDraft": 16.0, "containerTerminals": 2}',
 '{"avgTurnaroundHrs": 16, "annualTEU": 5600000, "utilizationPct": 74}'),

(uuid_generate_v4(), 'SAJED', 'Jeddah',         'Saudi Arabia',   21.4858000,  39.1925000, 'Asia/Riyadh',
 '{"cranes": 42, "berths": 14, "maxDraft": 18.0, "containerTerminals": 3}',
 '{"avgTurnaroundHrs": 20, "annualTEU": 4800000, "utilizationPct": 72}'),

(uuid_generate_v4(), 'AEJEA', 'Dubai',          'UAE',            25.0150000,  55.0600000, 'Asia/Dubai',
 '{"cranes": 60, "berths": 22, "maxDraft": 17.0, "containerTerminals": 4}',
 '{"avgTurnaroundHrs": 18, "annualTEU": 14800000, "utilizationPct": 82}'),

(uuid_generate_v4(), 'INNSA', 'Mumbai',         'India',          18.9500000,  72.9500000, 'Asia/Kolkata',
 '{"cranes": 28, "berths": 8, "maxDraft": 14.0, "containerTerminals": 3}',
 '{"avgTurnaroundHrs": 26, "annualTEU": 5500000, "utilizationPct": 76}'),

(uuid_generate_v4(), 'USLAX', 'Los Angeles',    'United States',  33.7395000, -118.2720000, 'America/Los_Angeles',
 '{"cranes": 72, "berths": 24, "maxDraft": 16.2, "containerTerminals": 6}',
 '{"avgTurnaroundHrs": 28, "annualTEU": 9600000, "utilizationPct": 79}'),

(uuid_generate_v4(), 'BRSSZ', 'Santos',         'Brazil',        -23.9608000, -46.3336000, 'America/Sao_Paulo',
 '{"cranes": 34, "berths": 12, "maxDraft": 15.0, "containerTerminals": 3}',
 '{"avgTurnaroundHrs": 30, "annualTEU": 4300000, "utilizationPct": 71}'),

(uuid_generate_v4(), 'ESALG', 'Algeciras',      'Spain',          36.1300000,  -5.4400000, 'Europe/Madrid',
 '{"cranes": 26, "berths": 8, "maxDraft": 18.0, "containerTerminals": 2}',
 '{"avgTurnaroundHrs": 14, "annualTEU": 5100000, "utilizationPct": 76}'),

(uuid_generate_v4(), 'MAPTM', 'Tangier Med',    'Morocco',        35.8800000,  -5.5000000, 'Africa/Casablanca',
 '{"cranes": 32, "berths": 10, "maxDraft": 18.0, "containerTerminals": 2}',
 '{"avgTurnaroundHrs": 12, "annualTEU": 7200000, "utilizationPct": 80}'),

(uuid_generate_v4(), 'LKCMB', 'Colombo',        'Sri Lanka',       6.9400000,  79.8500000, 'Asia/Colombo',
 '{"cranes": 24, "berths": 8, "maxDraft": 17.0, "containerTerminals": 3}',
 '{"avgTurnaroundHrs": 20, "annualTEU": 7200000, "utilizationPct": 74}'),

(uuid_generate_v4(), 'ZACPT', 'Cape Town',      'South Africa',  -33.9000000,  18.4300000, 'Africa/Johannesburg',
 '{"cranes": 14, "berths": 6, "maxDraft": 14.5, "containerTerminals": 1}',
 '{"avgTurnaroundHrs": 24, "annualTEU": 900000, "utilizationPct": 62}');


-- ============================================================
-- VESSELS (6 ultra-large / large container vessels)
-- ============================================================

INSERT INTO vessels (id, name, imo_number, call_sign, flag, capacity_teu, current_location_id, status, year_built, operator, specifications) VALUES

(uuid_generate_v4(), 'MSC Aurora',      'IMO9839012', 'MSCA1', 'Panama',       23756,
 (SELECT id FROM ports WHERE code = 'CNSHA'), 'ACTIVE', 2022, 'Mediterranean Shipping Company',
 '{"lengthM": 399.9, "beamM": 61.5, "draftM": 16.5, "speedKnots": 22.5, "fuelType": "LNG/VLSFO"}'),

(uuid_generate_v4(), 'Ever Forward',    'IMO9893890', 'EVRF2', 'Panama',       20124,
 (SELECT id FROM ports WHERE code = 'SGSIN'), 'ACTIVE', 2021, 'Evergreen Marine',
 '{"lengthM": 400.0, "beamM": 58.8, "draftM": 16.0, "speedKnots": 22.0, "fuelType": "VLSFO"}'),

(uuid_generate_v4(), 'Maersk Emerald',  'IMO9778901', 'MAER3', 'Denmark',      15226,
 (SELECT id FROM ports WHERE code = 'NLRTM'), 'ACTIVE', 2019, 'Maersk Line',
 '{"lengthM": 368.0, "beamM": 51.0, "draftM": 15.5, "speedKnots": 23.0, "fuelType": "VLSFO/Methanol"}'),

(uuid_generate_v4(), 'CMA Athena',      'IMO9867234', 'CMAA4', 'France',       14000,
 (SELECT id FROM ports WHERE code = 'GRPIR'), 'ACTIVE', 2020, 'CMA CGM',
 '{"lengthM": 366.0, "beamM": 51.2, "draftM": 15.0, "speedKnots": 22.0, "fuelType": "LNG"}'),

(uuid_generate_v4(), 'Cosco Galaxy',    'IMO9912345', 'COSG5', 'China',        19100,
 (SELECT id FROM ports WHERE code = 'AEJEA'), 'ACTIVE', 2023, 'COSCO Shipping',
 '{"lengthM": 400.0, "beamM": 58.6, "draftM": 16.0, "speedKnots": 22.0, "fuelType": "LNG/VLSFO"}'),

(uuid_generate_v4(), 'Hapag Atlas',     'IMO9801567', 'HAPA6', 'Germany',      10500,
 (SELECT id FROM ports WHERE code = 'DEHAM'), 'IN_MAINTENANCE', 2017, 'Hapag-Lloyd',
 '{"lengthM": 332.0, "beamM": 48.2, "draftM": 14.5, "speedKnots": 21.5, "fuelType": "VLSFO"}');


-- ============================================================
-- SHIPPING LANES (25+ routes with realistic distances/costs/times)
-- ============================================================

-- Helper: speed ~18 knots avg laden, cost ~$0.07/TEU/nm base
-- Canal fees: Suez ~$250k-$700k per transit, simplified as per-lane

-- Asia-Europe via Suez
INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active) VALUES
(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'CNSHA'), (SELECT id FROM ports WHERE code = 'NLRTM'),
 10560, 587, 185000, 420000, 12000, 550000, true),

(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'CNSHA'), (SELECT id FROM ports WHERE code = 'DEHAM'),
 10790, 599, 189000, 430000, 12000, 550000, true),

(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'CNSHA'), (SELECT id FROM ports WHERE code = 'GRPIR'),
 8560, 476, 150000, 340000, 10000, 550000, true),

-- Singapore hub connections
(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'CNSHA'), (SELECT id FROM ports WHERE code = 'SGSIN'),
 2230, 124, 39000, 88000, 5000, 0, true),

(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'SGSIN'), (SELECT id FROM ports WHERE code = 'NLRTM'),
 8360, 464, 146000, 332000, 12000, 550000, true),

(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'SGSIN'), (SELECT id FROM ports WHERE code = 'LKCMB'),
 1580, 88, 28000, 63000, 4000, 0, true),

(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'SGSIN'), (SELECT id FROM ports WHERE code = 'INNSA'),
 2440, 136, 43000, 97000, 5000, 0, true),

(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'SGSIN'), (SELECT id FROM ports WHERE code = 'AEJEA'),
 3440, 191, 60000, 137000, 6000, 0, true),

-- Gulf connections through Hormuz / Red Sea
(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'AEJEA'), (SELECT id FROM ports WHERE code = 'SAJED'),
 1780, 99, 31000, 71000, 4500, 0, true),

(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'AEJEA'), (SELECT id FROM ports WHERE code = 'NLRTM'),
 6440, 358, 113000, 256000, 10000, 550000, true),

(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'SAJED'), (SELECT id FROM ports WHERE code = 'NLRTM'),
 5960, 331, 104000, 237000, 9000, 320000, true),

(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'SAJED'), (SELECT id FROM ports WHERE code = 'GRPIR'),
 3240, 180, 57000, 129000, 6000, 320000, true),

-- Mediterranean
(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'GRPIR'), (SELECT id FROM ports WHERE code = 'ESVLC'),
 1430, 79, 25000, 57000, 4000, 0, true),

(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'GRPIR'), (SELECT id FROM ports WHERE code = 'ESALG'),
 1260, 70, 22000, 50000, 3500, 0, true),

(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'ESALG'), (SELECT id FROM ports WHERE code = 'MAPTM'),
 18, 2, 1500, 800, 500, 0, true),

(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'ESVLC'), (SELECT id FROM ports WHERE code = 'NLRTM'),
 2100, 117, 37000, 84000, 5000, 0, true),

-- Europe internal
(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'NLRTM'), (SELECT id FROM ports WHERE code = 'DEHAM'),
 260, 18, 8000, 10000, 2000, 0, true),

-- Transatlantic
(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'NLRTM'), (SELECT id FROM ports WHERE code = 'USLAX'),
 8050, 447, 141000, 320000, 12000, 0, true),

(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'NLRTM'), (SELECT id FROM ports WHERE code = 'BRSSZ'),
 5700, 317, 100000, 227000, 8000, 0, true),

-- Indian Ocean
(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'INNSA'), (SELECT id FROM ports WHERE code = 'AEJEA'),
 1220, 68, 21000, 49000, 4000, 0, true),

(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'INNSA'), (SELECT id FROM ports WHERE code = 'LKCMB'),
 880, 49, 15000, 35000, 3000, 0, true),

-- Cape route alternatives
(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'INNSA'), (SELECT id FROM ports WHERE code = 'ZACPT'),
 4280, 238, 75000, 170000, 7000, 0, true),

(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'ZACPT'), (SELECT id FROM ports WHERE code = 'NLRTM'),
 6820, 379, 119000, 271000, 10000, 0, true),

(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'LKCMB'), (SELECT id FROM ports WHERE code = 'ZACPT'),
 3960, 220, 69000, 157000, 6000, 0, true),

-- Additional connectivity
(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'GRPIR'), (SELECT id FROM ports WHERE code = 'NLRTM'),
 3050, 169, 53000, 121000, 6000, 0, true),

(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'MAPTM'), (SELECT id FROM ports WHERE code = 'NLRTM'),
 2020, 112, 35000, 80000, 5000, 0, true);


-- ============================================================
-- HISTORICAL DEMAND (12 months, 6 trade lanes, daily data)
-- ============================================================
-- Date range: 2025-04-01 to 2026-03-31
-- Patterns: base + seasonal(SIN) + trend + noise(RANDOM)

-- 1. ASIA-EUROPE (Shanghai → Rotterdam)
--    Base 850 TEU/day, strong seasonal peak in Q3 (pre-holiday inventory push)
INSERT INTO historical_demand (id, trade_lane, origin_port_id, destination_port_id, cargo_type, date, teu_volume, revenue, booking_count)
SELECT
    uuid_generate_v4(),
    'ASIA-EUROPE',
    (SELECT id FROM ports WHERE code = 'CNSHA'),
    (SELECT id FROM ports WHERE code = 'NLRTM'),
    'MIXED_CONTAINER',
    d::date,
    ROUND((
        850
        + 180 * SIN(2 * PI() * (EXTRACT(DOY FROM d) - 60) / 365)   -- seasonal peak ~Aug
        + 40  * SIN(4 * PI() * EXTRACT(DOY FROM d) / 365)           -- secondary cycle
        + (RANDOM() * 80 - 40)                                       -- noise ±40
    )::numeric, 1),
    ROUND((
        (850 + 180 * SIN(2 * PI() * (EXTRACT(DOY FROM d) - 60) / 365)) * 1450
        + (RANDOM() * 20000 - 10000)
    )::numeric, 2),
    GREATEST(1, ROUND((
        850 + 180 * SIN(2 * PI() * (EXTRACT(DOY FROM d) - 60) / 365)
    ) / 42)::int + FLOOR(RANDOM() * 4)::int)
FROM generate_series('2025-04-01'::date, '2026-03-31'::date, '1 day'::interval) AS d;

-- 2. EUROPE-AMERICAS (Rotterdam → Los Angeles)
--    Base 420 TEU/day, moderate seasonality
INSERT INTO historical_demand (id, trade_lane, origin_port_id, destination_port_id, cargo_type, date, teu_volume, revenue, booking_count)
SELECT
    uuid_generate_v4(),
    'EUROPE-AMERICAS',
    (SELECT id FROM ports WHERE code = 'NLRTM'),
    (SELECT id FROM ports WHERE code = 'USLAX'),
    'MIXED_CONTAINER',
    d::date,
    ROUND((
        420
        + 70 * SIN(2 * PI() * (EXTRACT(DOY FROM d) - 90) / 365)    -- peak ~Oct
        + (RANDOM() * 50 - 25)                                       -- noise ±25
    )::numeric, 1),
    ROUND((
        (420 + 70 * SIN(2 * PI() * (EXTRACT(DOY FROM d) - 90) / 365)) * 1650
        + (RANDOM() * 15000 - 7500)
    )::numeric, 2),
    GREATEST(1, ROUND((
        420 + 70 * SIN(2 * PI() * (EXTRACT(DOY FROM d) - 90) / 365)
    ) / 38)::int + FLOOR(RANDOM() * 3)::int)
FROM generate_series('2025-04-01'::date, '2026-03-31'::date, '1 day'::interval) AS d;

-- 3. GULF-EUROPE (Dubai → Rotterdam)
--    Base 380 TEU/day, oil-influenced (higher in winter heating season)
INSERT INTO historical_demand (id, trade_lane, origin_port_id, destination_port_id, cargo_type, date, teu_volume, revenue, booking_count)
SELECT
    uuid_generate_v4(),
    'GULF-EUROPE',
    (SELECT id FROM ports WHERE code = 'AEJEA'),
    (SELECT id FROM ports WHERE code = 'NLRTM'),
    'MIXED_CONTAINER',
    d::date,
    ROUND((
        380
        + 90 * SIN(2 * PI() * (EXTRACT(DOY FROM d) + 30) / 365)    -- winter peak (Jan/Feb)
        + (RANDOM() * 60 - 30)                                       -- noise ±30
    )::numeric, 1),
    ROUND((
        (380 + 90 * SIN(2 * PI() * (EXTRACT(DOY FROM d) + 30) / 365)) * 1550
        + (RANDOM() * 12000 - 6000)
    )::numeric, 2),
    GREATEST(1, ROUND((
        380 + 90 * SIN(2 * PI() * (EXTRACT(DOY FROM d) + 30) / 365)
    ) / 45)::int + FLOOR(RANDOM() * 3)::int)
FROM generate_series('2025-04-01'::date, '2026-03-31'::date, '1 day'::interval) AS d;

-- 4. INTRA-ASIA (Shanghai → Singapore)
--    Base 650 TEU/day, high frequency, slight CNY dip
INSERT INTO historical_demand (id, trade_lane, origin_port_id, destination_port_id, cargo_type, date, teu_volume, revenue, booking_count)
SELECT
    uuid_generate_v4(),
    'INTRA-ASIA',
    (SELECT id FROM ports WHERE code = 'CNSHA'),
    (SELECT id FROM ports WHERE code = 'SGSIN'),
    'MIXED_CONTAINER',
    d::date,
    ROUND((
        650
        + 100 * SIN(2 * PI() * (EXTRACT(DOY FROM d) - 45) / 365)   -- peak mid-year
        - CASE WHEN EXTRACT(MONTH FROM d) = 2 THEN 120 ELSE 0 END   -- CNY dip in Feb
        + (RANDOM() * 60 - 30)                                       -- noise ±30
    )::numeric, 1),
    ROUND((
        (650 + 100 * SIN(2 * PI() * (EXTRACT(DOY FROM d) - 45) / 365)) * 680
        + (RANDOM() * 8000 - 4000)
    )::numeric, 2),
    GREATEST(1, ROUND((
        650 + 100 * SIN(2 * PI() * (EXTRACT(DOY FROM d) - 45) / 365)
    ) / 28)::int + FLOOR(RANDOM() * 5)::int)
FROM generate_series('2025-04-01'::date, '2026-03-31'::date, '1 day'::interval) AS d;

-- 5. MED-NORTHEUROPE (Piraeus → Rotterdam)
--    Base 300 TEU/day, WITH A DEMAND SPIKE in Feb 2026 (+250 TEU)
INSERT INTO historical_demand (id, trade_lane, origin_port_id, destination_port_id, cargo_type, date, teu_volume, revenue, booking_count)
SELECT
    uuid_generate_v4(),
    'MED-NORTHEUROPE',
    (SELECT id FROM ports WHERE code = 'GRPIR'),
    (SELECT id FROM ports WHERE code = 'NLRTM'),
    'MIXED_CONTAINER',
    d::date,
    ROUND((
        300
        + 50 * SIN(2 * PI() * (EXTRACT(DOY FROM d) - 80) / 365)    -- mild seasonal
        + CASE
            WHEN d >= '2026-02-01' AND d < '2026-03-01' THEN 250    -- DEMAND SPIKE Feb 2026
            WHEN d >= '2026-01-25' AND d < '2026-02-01' THEN 125    -- ramp-up
            WHEN d >= '2026-03-01' AND d < '2026-03-08' THEN 100    -- ramp-down
            ELSE 0
          END
        + (RANDOM() * 40 - 20)                                       -- noise ±20
    )::numeric, 1),
    ROUND((
        (300 + 50 * SIN(2 * PI() * (EXTRACT(DOY FROM d) - 80) / 365)
         + CASE
             WHEN d >= '2026-02-01' AND d < '2026-03-01' THEN 250
             WHEN d >= '2026-01-25' AND d < '2026-02-01' THEN 125
             WHEN d >= '2026-03-01' AND d < '2026-03-08' THEN 100
             ELSE 0
           END
        ) * 1350
        + (RANDOM() * 10000 - 5000)
    )::numeric, 2),
    GREATEST(1, ROUND((
        300 + 50 * SIN(2 * PI() * (EXTRACT(DOY FROM d) - 80) / 365)
        + CASE
            WHEN d >= '2026-02-01' AND d < '2026-03-01' THEN 250
            ELSE 0
          END
    ) / 35)::int + FLOOR(RANDOM() * 3)::int)
FROM generate_series('2025-04-01'::date, '2026-03-31'::date, '1 day'::interval) AS d;

-- 6. INDIA-GULF (Mumbai → Dubai)
--    Base 200 TEU/day, growing trend (+0.5 TEU/day linear growth)
INSERT INTO historical_demand (id, trade_lane, origin_port_id, destination_port_id, cargo_type, date, teu_volume, revenue, booking_count)
SELECT
    uuid_generate_v4(),
    'INDIA-GULF',
    (SELECT id FROM ports WHERE code = 'INNSA'),
    (SELECT id FROM ports WHERE code = 'AEJEA'),
    'MIXED_CONTAINER',
    d::date,
    ROUND((
        200
        + 0.5 * (d::date - '2025-04-01'::date)                       -- linear growth trend
        + 30 * SIN(2 * PI() * (EXTRACT(DOY FROM d) - 60) / 365)    -- mild seasonal
        + (RANDOM() * 30 - 15)                                       -- noise ±15
    )::numeric, 1),
    ROUND((
        (200 + 0.5 * (d::date - '2025-04-01'::date)
         + 30 * SIN(2 * PI() * (EXTRACT(DOY FROM d) - 60) / 365)) * 820
        + (RANDOM() * 6000 - 3000)
    )::numeric, 2),
    GREATEST(1, ROUND((
        200 + 0.5 * (d::date - '2025-04-01'::date)
    ) / 32)::int + FLOOR(RANDOM() * 2)::int)
FROM generate_series('2025-04-01'::date, '2026-03-31'::date, '1 day'::interval) AS d;
