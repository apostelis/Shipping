-- V3__additional_lanes.sql
-- Add more direct shipping lanes to avoid all routes funneling through Rotterdam

-- Asia direct to Americas (transpacific)
INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
VALUES
(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'CNSHA'), (SELECT id FROM ports WHERE code = 'USLAX'),
 6380, 354, 112000, 254000, 10000, 0, true),

(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'SGSIN'), (SELECT id FROM ports WHERE code = 'USLAX'),
 8600, 478, 150000, 342000, 12000, 0, true);

-- Asia direct to South America
INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
VALUES
(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'CNSHA'), (SELECT id FROM ports WHERE code = 'BRSSZ'),
 10800, 600, 189000, 430000, 14000, 0, true);

-- Mediterranean direct to Americas
INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
VALUES
(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'ESVLC'), (SELECT id FROM ports WHERE code = 'USLAX'),
 5800, 322, 102000, 231000, 9000, 0, true),

(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'ESALG'), (SELECT id FROM ports WHERE code = 'BRSSZ'),
 4600, 256, 81000, 183000, 7000, 0, true),

(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'MAPTM'), (SELECT id FROM ports WHERE code = 'BRSSZ'),
 4580, 254, 80000, 182000, 7000, 0, true);

-- Gulf direct to India / Asia (more variety)
INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
VALUES
(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'AEJEA'), (SELECT id FROM ports WHERE code = 'INNSA'),
 1220, 68, 21000, 49000, 4000, 0, true),

(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'AEJEA'), (SELECT id FROM ports WHERE code = 'LKCMB'),
 2100, 117, 37000, 84000, 4500, 0, true);

-- Hamburg direct connections (so not everything routes via Rotterdam)
INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
VALUES
(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'DEHAM'), (SELECT id FROM ports WHERE code = 'USLAX'),
 8200, 456, 144000, 326000, 12000, 0, true),

(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'DEHAM'), (SELECT id FROM ports WHERE code = 'BRSSZ'),
 5900, 328, 103000, 235000, 8500, 0, true);

-- Cape Town to Americas (for Hormuz blockade rerouting)
INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
VALUES
(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'ZACPT'), (SELECT id FROM ports WHERE code = 'BRSSZ'),
 3400, 189, 60000, 135000, 6000, 0, true),

(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'ZACPT'), (SELECT id FROM ports WHERE code = 'USLAX'),
 8700, 483, 152000, 346000, 12000, 0, true);

-- Colombo as Indian Ocean hub
INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
VALUES
(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'LKCMB'), (SELECT id FROM ports WHERE code = 'AEJEA'),
 2100, 117, 37000, 84000, 4500, 0, true),

(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'LKCMB'), (SELECT id FROM ports WHERE code = 'GRPIR'),
 4200, 233, 74000, 167000, 7000, 550000, true),

(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'LKCMB'), (SELECT id FROM ports WHERE code = 'SGSIN'),
 1580, 88, 28000, 63000, 4000, 0, true);

-- Piraeus as Eastern Med hub to more destinations
INSERT INTO shipping_lanes (id, origin_port_id, destination_port_id, distance_nm, estimated_time_hours, base_cost, fuel_cost, transit_fee, canal_fee, is_active)
VALUES
(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'GRPIR'), (SELECT id FROM ports WHERE code = 'SAJED'),
 3240, 180, 57000, 129000, 6000, 320000, true),

(uuid_generate_v4(),
 (SELECT id FROM ports WHERE code = 'GRPIR'), (SELECT id FROM ports WHERE code = 'BRSSZ'),
 5600, 311, 98000, 223000, 8000, 0, true);
