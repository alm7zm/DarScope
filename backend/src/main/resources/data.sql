-- The 8 starting properties, the same as frontend/src/test/portfolio.seed.json. The database
-- issues the IDs, so they are left out (never a written number): inserted in this order they
-- become 1 to 8. Saved as UTF-8, because some districts are Arabic.

-- RP-0001
INSERT INTO property (city, district, front, property_type, size_sqm, property_age_years, bedrooms, bathrooms, living_rooms, kitchen, garage, driver_room, maid_room, furnished, ac, roof, pool, frontyard, basement, stairs, elevator, fireplace, yearly_rent_sar, description, status, tenant_name, lease_start, lease_end, created_at, updated_at)
VALUES ('Riyadh', 'Al Malqa', 'North', 'Villa', 620, 3, 5, 6, 2, TRUE, TRUE, FALSE, TRUE, FALSE, TRUE, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE, FALSE, 190000, 'Spacious family villa with a private pool, close to the northern ring road.', 'Occupied', 'Nora Al Harbi', DATE '2026-02-01', DATE '2027-01-31', TIMESTAMP WITH TIME ZONE '2026-10-01 08:00:00+00:00', TIMESTAMP WITH TIME ZONE '2026-10-01 08:00:00+00:00');

-- RP-0002
INSERT INTO property (city, district, front, property_type, size_sqm, property_age_years, bedrooms, bathrooms, living_rooms, kitchen, garage, driver_room, maid_room, furnished, ac, roof, pool, frontyard, basement, stairs, elevator, fireplace, yearly_rent_sar, description, status, tenant_name, lease_start, lease_end, created_at, updated_at)
VALUES ('Riyadh', 'النرجس', 'Southeast', 'Villa', 450, 1, 4, 4, 2, TRUE, TRUE, FALSE, FALSE, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, 145000, 'فيلا حديثة في حي النرجس قريبة من الخدمات.', 'Vacant', CAST(NULL AS VARCHAR(80)), CAST(NULL AS DATE), CAST(NULL AS DATE), TIMESTAMP WITH TIME ZONE '2026-10-02 08:00:00+00:00', TIMESTAMP WITH TIME ZONE '2026-10-02 08:00:00+00:00');

-- RP-0003
INSERT INTO property (city, district, front, property_type, size_sqm, property_age_years, bedrooms, bathrooms, living_rooms, kitchen, garage, driver_room, maid_room, furnished, ac, roof, pool, frontyard, basement, stairs, elevator, fireplace, yearly_rent_sar, description, status, tenant_name, lease_start, lease_end, created_at, updated_at)
VALUES ('Riyadh', 'Al Yasmin', 'West', 'Duplex', 310, 8, 3, 3, 1, TRUE, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, 95000, 'Upper duplex with a separate entrance.', 'Under maintenance', CAST(NULL AS VARCHAR(80)), CAST(NULL AS DATE), CAST(NULL AS DATE), TIMESTAMP WITH TIME ZONE '2026-10-03 08:00:00+00:00', TIMESTAMP WITH TIME ZONE '2026-10-03 08:00:00+00:00');

-- RP-0004
INSERT INTO property (city, district, front, property_type, size_sqm, property_age_years, bedrooms, bathrooms, living_rooms, kitchen, garage, driver_room, maid_room, furnished, ac, roof, pool, frontyard, basement, stairs, elevator, fireplace, yearly_rent_sar, description, status, tenant_name, lease_start, lease_end, created_at, updated_at)
VALUES ('Jeddah', 'الشاطئ', 'West', 'Villa', 540, 6, 5, 5, 2, TRUE, TRUE, TRUE, FALSE, FALSE, TRUE, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE, FALSE, 210000, 'فيلا على الواجهة البحرية مع مسبح خاص.', 'Occupied', 'Faisal Al Ghamdi', DATE '2026-03-15', DATE '2027-03-14', TIMESTAMP WITH TIME ZONE '2026-10-04 08:00:00+00:00', TIMESTAMP WITH TIME ZONE '2026-10-04 08:00:00+00:00');

-- RP-0005
INSERT INTO property (city, district, front, property_type, size_sqm, property_age_years, bedrooms, bathrooms, living_rooms, kitchen, garage, driver_room, maid_room, furnished, ac, roof, pool, frontyard, basement, stairs, elevator, fireplace, yearly_rent_sar, description, status, tenant_name, lease_start, lease_end, created_at, updated_at)
VALUES ('Jeddah', 'Al Hamra', 'North', 'Duplex', 265, 12, 3, 2, 1, TRUE, FALSE, FALSE, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 78000, 'Furnished duplex a short drive from the corniche.', 'Vacant', CAST(NULL AS VARCHAR(80)), CAST(NULL AS DATE), CAST(NULL AS DATE), TIMESTAMP WITH TIME ZONE '2026-10-05 08:00:00+00:00', TIMESTAMP WITH TIME ZONE '2026-10-05 08:00:00+00:00');

-- RP-0006
INSERT INTO property (city, district, front, property_type, size_sqm, property_age_years, bedrooms, bathrooms, living_rooms, kitchen, garage, driver_room, maid_room, furnished, ac, roof, pool, frontyard, basement, stairs, elevator, fireplace, yearly_rent_sar, description, status, tenant_name, lease_start, lease_end, created_at, updated_at)
VALUES ('Dammam', 'Al Faisaliyah', 'Northeast', 'Villa', 480, 4, 5, 4, 2, TRUE, TRUE, FALSE, FALSE, FALSE, TRUE, TRUE, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, 132000, 'Corner villa with a basement and roof space.', 'Occupied', 'Abdullah Al Qahtani', DATE '2026-01-01', DATE '2026-12-31', TIMESTAMP WITH TIME ZONE '2026-10-06 08:00:00+00:00', TIMESTAMP WITH TIME ZONE '2026-10-06 08:00:00+00:00');

-- RP-0007
INSERT INTO property (city, district, front, property_type, size_sqm, property_age_years, bedrooms, bathrooms, living_rooms, kitchen, garage, driver_room, maid_room, furnished, ac, roof, pool, frontyard, basement, stairs, elevator, fireplace, yearly_rent_sar, description, status, tenant_name, lease_start, lease_end, created_at, updated_at)
VALUES ('Dammam', 'الروضة', 'South', 'Duplex', 240, 15, 2, 2, 1, TRUE, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 56000, 'دوبلكس في حي الروضة بسعر مناسب.', 'Vacant', CAST(NULL AS VARCHAR(80)), CAST(NULL AS DATE), CAST(NULL AS DATE), TIMESTAMP WITH TIME ZONE '2026-10-07 08:00:00+00:00', TIMESTAMP WITH TIME ZONE '2026-10-07 08:00:00+00:00');

-- RP-0008
INSERT INTO property (city, district, front, property_type, size_sqm, property_age_years, bedrooms, bathrooms, living_rooms, kitchen, garage, driver_room, maid_room, furnished, ac, roof, pool, frontyard, basement, stairs, elevator, fireplace, yearly_rent_sar, description, status, tenant_name, lease_start, lease_end, created_at, updated_at)
VALUES ('Al Khobar', 'Al Aqrabiyah', 'Four streets', 'Villa', 700, 0, 6, 6, 3, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, FALSE, TRUE, FALSE, FALSE, FALSE, TRUE, TRUE, 320000, 'Newly built villa with a lift and a fireplace.', 'Vacant', CAST(NULL AS VARCHAR(80)), CAST(NULL AS DATE), CAST(NULL AS DATE), TIMESTAMP WITH TIME ZONE '2026-10-08 08:00:00+00:00', TIMESTAMP WITH TIME ZONE '2026-10-08 08:00:00+00:00');
