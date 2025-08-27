-- Emergency PII hardening: create sanitized public views and restrict column access
-- Date: 2025-08-26

-- 1) Create sanitized views without personal data
CREATE OR REPLACE VIEW public_dreams AS
SELECT 
  id,
  from_station,
  to_station,
  from_latitude,
  from_longitude,
  to_latitude,
  to_longitude,
  route_type,
  travel_purpose,
  estimated_demand,
  status,
  created_at,
  updated_at
FROM dreams;

CREATE OR REPLACE VIEW public_pyjama_parties AS
SELECT
  id,
  station_name,
  city,
  country,
  party_date,
  description,
  attendees_count,
  status,
  created_at,
  updated_at
FROM pyjama_parties;

-- 2) Restrict column-level access to PII for anon/authenticated roles
-- Dreams table: block access to dreamer_name and dreamer_email
REVOKE ALL ON TABLE dreams FROM anon, authenticated;
GRANT SELECT (
  id,
  from_station,
  to_station,
  from_latitude,
  from_longitude,
  to_latitude,
  to_longitude,
  route_type,
  travel_purpose,
  estimated_demand,
  status,
  created_at,
  updated_at
) ON TABLE dreams TO anon, authenticated;

-- Pyjama parties table: block organizer_email (and any organizer PII)
REVOKE ALL ON TABLE pyjama_parties FROM anon, authenticated;
GRANT SELECT (
  id,
  station_name,
  city,
  country,
  party_date,
  description,
  attendees_count,
  status,
  created_at,
  updated_at
) ON TABLE pyjama_parties TO anon, authenticated;

-- 3) Ensure anon/authenticated can read sanitized views
GRANT SELECT ON public_dreams TO anon, authenticated;
GRANT SELECT ON public_pyjama_parties TO anon, authenticated;

-- Notes:
-- - RLS policies remain in place; these grants limit which columns can be returned by anon/authenticated.
-- - Application code should query the sanitized views for public endpoints.
-- - Admin/staff endpoints should use service role (server-only) when PII access is explicitly required.

