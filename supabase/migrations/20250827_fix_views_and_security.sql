-- Fix sanitized public views to match current schema, adjust column grants,
-- and set security_invoker on flagged views.

BEGIN;

-- 1) Recreate sanitized views with only existing, non-PII columns
CREATE OR REPLACE VIEW public_dreams AS
SELECT 
  id,
  from_station,
  to_station,
  from_latitude,
  from_longitude,
  to_latitude,
  to_longitude,
  created_at,
  updated_at
FROM public.dreams;

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
FROM public.pyjama_parties;

-- 2) Column-level grants (only columns that exist)
REVOKE ALL ON TABLE public.dreams FROM anon, authenticated;
GRANT SELECT (
  id,
  from_station,
  to_station,
  from_latitude,
  from_longitude,
  to_latitude,
  to_longitude,
  created_at,
  updated_at
) ON public.dreams TO anon, authenticated;

REVOKE ALL ON TABLE public.pyjama_parties FROM anon, authenticated;
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
) ON public.pyjama_parties TO anon, authenticated;

-- 3) Ensure anon/authenticated can read sanitized views
GRANT SELECT ON public.public_dreams TO anon, authenticated;
GRANT SELECT ON public.public_pyjama_parties TO anon, authenticated;

-- 4) Set views to security_invoker to avoid running with definer rights
ALTER VIEW public.public_dreams SET (security_invoker = true);
ALTER VIEW public.public_pyjama_parties SET (security_invoker = true);

-- 5) Address Supabase security warning for existing views (if present)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'bot_route_details') THEN
    EXECUTE 'ALTER VIEW public.bot_route_details SET (security_invoker = true)';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'pajama_party_public_stats') THEN
    EXECUTE 'ALTER VIEW public.pajama_party_public_stats SET (security_invoker = true)';
  END IF;
END$$;

COMMIT;

