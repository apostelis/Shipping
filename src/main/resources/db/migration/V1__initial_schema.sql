-- V1__initial_schema.sql
-- SmartShipping Intelligence Platform - Initial Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');
CREATE TYPE vessel_status AS ENUM ('ACTIVE', 'IN_MAINTENANCE', 'OUT_OF_SERVICE', 'DECOMMISSIONED');
CREATE TYPE customer_type AS ENUM ('INDUSTRIAL', 'RETAIL', 'WHOLESALE', 'LOGISTICS_PROVIDER');
CREATE TYPE customer_segment AS ENUM ('PLATINUM', 'GOLD', 'SILVER', 'BRONZE');

-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type customer_type NOT NULL,
    segment customer_segment NOT NULL,
    credit_rating INTEGER CHECK (credit_rating >= 1 AND credit_rating <= 5),
    shipping_patterns JSONB,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- Ports table
CREATE TABLE ports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    facilities JSONB,
    restrictions JSONB,
    operational_metrics JSONB,
    time_zone VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Vessels table
CREATE TABLE vessels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    imo_number VARCHAR(20) NOT NULL UNIQUE,
    call_sign VARCHAR(20),
    flag VARCHAR(50),
    capacity_teu INTEGER NOT NULL,
    current_location_id UUID REFERENCES ports(id),
    status vessel_status NOT NULL DEFAULT 'ACTIVE',
    specifications JSONB,
    year_built INTEGER,
    operator VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- Voyages table
CREATE TABLE voyages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vessel_id UUID NOT NULL REFERENCES vessels(id),
    voyage_number VARCHAR(20) NOT NULL,
    route JSONB NOT NULL,
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP,
    actual_departure_time TIMESTAMP,
    actual_arrival_time TIMESTAMP,
    fuel_consumed DECIMAL(12, 2),
    distance_traveled DECIMAL(10, 2),
    weather_conditions JSONB,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    UNIQUE(vessel_id, voyage_number)
);

-- Voyage port stops (intermediate ports)
CREATE TABLE voyage_port_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voyage_id UUID NOT NULL REFERENCES voyages(id),
    port_id UUID NOT NULL REFERENCES ports(id),
    arrival_time TIMESTAMP,
    departure_time TIMESTAMP,
    sequence_number INTEGER NOT NULL,
    operations JSONB
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference VARCHAR(50) NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES customers(id),
    origin_port_id UUID NOT NULL REFERENCES ports(id),
    destination_port_id UUID NOT NULL REFERENCES ports(id),
    cargo_type VARCHAR(100) NOT NULL,
    volume_teu DECIMAL(10, 2) NOT NULL,
    weight_kg DECIMAL(12, 2),
    booking_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    requested_date TIMESTAMP,
    actual_date TIMESTAMP,
    revenue DECIMAL(12, 2),
    status booking_status NOT NULL DEFAULT 'PENDING',
    special_instructions TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- Historical demand data for forecasting
CREATE TABLE historical_demand (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trade_lane VARCHAR(50) NOT NULL,
    origin_port_id UUID NOT NULL REFERENCES ports(id),
    destination_port_id UUID NOT NULL REFERENCES ports(id),
    cargo_type VARCHAR(100),
    date DATE NOT NULL,
    teu_volume DECIMAL(12, 2) NOT NULL,
    revenue DECIMAL(12, 2),
    booking_count INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Forecast results
CREATE TABLE forecast_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trade_lane VARCHAR(50) NOT NULL,
    cargo_type VARCHAR(100),
    granularity VARCHAR(20) NOT NULL,
    forecast_date DATE NOT NULL,
    predicted_teu DECIMAL(12, 2) NOT NULL,
    confidence_lower DECIMAL(12, 2),
    confidence_upper DECIMAL(12, 2),
    algorithm VARCHAR(50) NOT NULL,
    model_version VARCHAR(50),
    accuracy_mape DECIMAL(8, 4),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(trade_lane, cargo_type, granularity, forecast_date, algorithm)
);

-- Shipping routes/lanes
CREATE TABLE shipping_lanes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin_port_id UUID NOT NULL REFERENCES ports(id),
    destination_port_id UUID NOT NULL REFERENCES ports(id),
    distance_nm DECIMAL(10, 2) NOT NULL,
    estimated_time_hours DECIMAL(8, 2),
    base_cost DECIMAL(12, 2),
    fuel_cost DECIMAL(12, 2),
    transit_fee DECIMAL(12, 2),
    canal_fee DECIMAL(12, 2),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(origin_port_id, destination_port_id)
);

-- Route waypoints for optimization
CREATE TABLE route_waypoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lane_id UUID NOT NULL REFERENCES shipping_lanes(id),
    port_id UUID NOT NULL REFERENCES ports(id),
    sequence_number INTEGER NOT NULL,
    distance_from_prev_nm DECIMAL(10, 2),
    time_from_prev_hours DECIMAL(8, 2)
);

-- Users table for authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- API keys for external integrations
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Audit log
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_origin ON bookings(origin_port_id);
CREATE INDEX idx_bookings_destination ON bookings(destination_port_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(booking_date);

CREATE INDEX idx_voyages_vessel ON voyages(vessel_id);
CREATE INDEX idx_voyages_departure ON voyages(departure_time);

CREATE INDEX idx_historical_demand_trade_lane ON historical_demand(trade_lane);
CREATE INDEX idx_historical_demand_date ON historical_demand(date);
CREATE INDEX idx_historical_demand_origin_dest ON historical_demand(origin_port_id, destination_port_id);

CREATE INDEX idx_forecast_results_trade_lane ON forecast_results(trade_lane);
CREATE INDEX idx_forecast_results_date ON forecast_results(forecast_date);

CREATE INDEX idx_shipping_lanes_ports ON shipping_lanes(origin_port_id, destination_port_id);

-- Comments for documentation
COMMENT ON TABLE customers IS 'Customer information including type, segment, and credit rating';
COMMENT ON TABLE ports IS 'Port information with location and facilities';
COMMENT ON TABLE vessels IS 'Vessel fleet information';
COMMENT ON TABLE voyages IS 'Voyage records with route and performance data';
COMMENT ON TABLE bookings IS 'Shipping bookings with cargo details';
COMMENT ON TABLE historical_demand IS 'Historical demand data for forecasting';
COMMENT ON TABLE forecast_results IS 'Stored forecast results for analysis';
COMMENT ON TABLE shipping_lanes IS 'Predefined shipping routes between ports';
