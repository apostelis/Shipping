-- Seed customers for demo bookings
INSERT INTO customers (id, name, type, segment, credit_rating, contact_email, created_at, updated_at) VALUES
(uuid_generate_v4(), 'Maersk Logistics GmbH', 'LOGISTICS_PROVIDER'::customer_type, 'PLATINUM'::customer_segment, 5, 'ops@maersk-logistics.com', NOW(), NOW()),
(uuid_generate_v4(), 'Shanghai Electronics Corp', 'INDUSTRIAL'::customer_type, 'GOLD'::customer_segment, 4, 'shipping@sh-electronics.cn', NOW(), NOW()),
(uuid_generate_v4(), 'Mediterranean Fresh Foods', 'RETAIL'::customer_type, 'SILVER'::customer_segment, 3, 'logistics@medfresh.eu', NOW(), NOW());

-- Seed bookings with different statuses and routes
-- Pending bookings (these show in the queue)
INSERT INTO bookings (id, booking_reference, customer_id, origin_port_id, destination_port_id, cargo_type, volume_teu, weight_kg, status, booking_date, requested_date, created_at, updated_at) VALUES
(uuid_generate_v4(), 'BK-2026-0451',
 (SELECT id FROM customers WHERE name = 'Shanghai Electronics Corp'),
 (SELECT id FROM ports WHERE code = 'CNSHA'), (SELECT id FROM ports WHERE code = 'NLRTM'),
 'Electronics', 240, 3360000, 'PENDING'::booking_status, NOW(), NOW() + interval '5 days', NOW(), NOW()),

(uuid_generate_v4(), 'BK-2026-0452',
 (SELECT id FROM customers WHERE name = 'Maersk Logistics GmbH'),
 (SELECT id FROM ports WHERE code = 'AEJEA'), (SELECT id FROM ports WHERE code = 'DEHAM'),
 'Mixed Cargo', 180, 2520000, 'PENDING'::booking_status, NOW(), NOW() + interval '3 days', NOW(), NOW()),

(uuid_generate_v4(), 'BK-2026-0453',
 (SELECT id FROM customers WHERE name = 'Mediterranean Fresh Foods'),
 (SELECT id FROM ports WHERE code = 'GRPIR'), (SELECT id FROM ports WHERE code = 'NLRTM'),
 'Perishables', 95, 1330000, 'PENDING'::booking_status, NOW(), NOW() + interval '2 days', NOW(), NOW()),

(uuid_generate_v4(), 'BK-2026-0454',
 (SELECT id FROM customers WHERE name = 'Shanghai Electronics Corp'),
 (SELECT id FROM ports WHERE code = 'CNSHA'), (SELECT id FROM ports WHERE code = 'USLAX'),
 'Consumer Goods', 320, 4480000, 'PENDING'::booking_status, NOW(), NOW() + interval '7 days', NOW(), NOW()),

(uuid_generate_v4(), 'BK-2026-0455',
 (SELECT id FROM customers WHERE name = 'Maersk Logistics GmbH'),
 (SELECT id FROM ports WHERE code = 'INNSA'), (SELECT id FROM ports WHERE code = 'NLRTM'),
 'Textiles', 150, 2100000, 'PENDING'::booking_status, NOW(), NOW() + interval '4 days', NOW(), NOW()),

(uuid_generate_v4(), 'BK-2026-0456',
 (SELECT id FROM customers WHERE name = 'Mediterranean Fresh Foods'),
 (SELECT id FROM ports WHERE code = 'SGSIN'), (SELECT id FROM ports WHERE code = 'GRPIR'),
 'Spices & Food', 60, 840000, 'PENDING'::booking_status, NOW(), NOW() + interval '6 days', NOW(), NOW());

-- Confirmed bookings (already routed)
INSERT INTO bookings (id, booking_reference, customer_id, origin_port_id, destination_port_id, cargo_type, volume_teu, weight_kg, status, booking_date, requested_date, created_at, updated_at) VALUES
(uuid_generate_v4(), 'BK-2026-0441',
 (SELECT id FROM customers WHERE name = 'Shanghai Electronics Corp'),
 (SELECT id FROM ports WHERE code = 'CNSHA'), (SELECT id FROM ports WHERE code = 'SGSIN'),
 'Electronics', 180, 2520000, 'CONFIRMED'::booking_status, NOW() - interval '2 days', NOW() + interval '1 day', NOW(), NOW()),

(uuid_generate_v4(), 'BK-2026-0442',
 (SELECT id FROM customers WHERE name = 'Maersk Logistics GmbH'),
 (SELECT id FROM ports WHERE code = 'NLRTM'), (SELECT id FROM ports WHERE code = 'BRSSZ'),
 'Machinery', 200, 2800000, 'CONFIRMED'::booking_status, NOW() - interval '1 day', NOW() + interval '3 days', NOW(), NOW());

-- In transit
INSERT INTO bookings (id, booking_reference, customer_id, origin_port_id, destination_port_id, cargo_type, volume_teu, weight_kg, status, booking_date, requested_date, created_at, updated_at) VALUES
(uuid_generate_v4(), 'BK-2026-0430',
 (SELECT id FROM customers WHERE name = 'Mediterranean Fresh Foods'),
 (SELECT id FROM ports WHERE code = 'ESVLC'), (SELECT id FROM ports WHERE code = 'USLAX'),
 'Wine & Olive Oil', 75, 1050000, 'IN_TRANSIT'::booking_status, NOW() - interval '10 days', NOW() - interval '8 days', NOW(), NOW()),

(uuid_generate_v4(), 'BK-2026-0431',
 (SELECT id FROM customers WHERE name = 'Shanghai Electronics Corp'),
 (SELECT id FROM ports WHERE code = 'CNSHA'), (SELECT id FROM ports WHERE code = 'DEHAM'),
 'Auto Parts', 280, 3920000, 'IN_TRANSIT'::booking_status, NOW() - interval '15 days', NOW() - interval '14 days', NOW(), NOW());
