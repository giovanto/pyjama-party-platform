-- Analytics Events Table for Privacy-First Advocacy Data Collection
-- Migration 002: Analytics foundation for transparent advocacy data
-- Created: 2025-01-27
-- Purpose: Track user engagement for advocacy dashboard with automatic expiry

-- Analytics events table for dashboard aggregation
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Event data
  event_name VARCHAR(100) NOT NULL,
  properties JSONB DEFAULT '{}'::jsonb,
  event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Privacy compliance
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- Auto-delete after 30 days
  anonymized BOOLEAN DEFAULT TRUE, -- No PII stored
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Performance indexes
  CONSTRAINT analytics_events_event_name_check CHECK (char_length(event_name) <= 100),
  CONSTRAINT analytics_events_future_timestamp_check CHECK (event_timestamp <= NOW() + INTERVAL '1 hour')
);

-- Indexes for efficient querying and cleanup
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events (event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events (event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_expires_at ON analytics_events (expires_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_properties ON analytics_events USING GIN (properties);

-- Composite index for dashboard queries (removed WHERE clause due to NOW() immutability)
CREATE INDEX IF NOT EXISTS idx_analytics_events_dashboard ON analytics_events (event_name, event_timestamp DESC, expires_at);

-- Enable Row Level Security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy for public insert (rate-limited by application)
CREATE POLICY "Allow public insert on analytics_events" ON analytics_events
  FOR INSERT WITH CHECK (anonymized = true);

-- Policy for public read of non-expired events only
CREATE POLICY "Allow public read on non-expired analytics_events" ON analytics_events
  FOR SELECT USING (expires_at > NOW());

-- Function to automatically clean up expired events
CREATE OR REPLACE FUNCTION cleanup_expired_analytics_events()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM analytics_events WHERE expires_at <= NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to aggregate event data for dashboard
CREATE OR REPLACE FUNCTION get_analytics_summary(
  event_name_filter TEXT DEFAULT NULL,
  days_back INTEGER DEFAULT 30
) RETURNS TABLE (
  event_name TEXT,
  event_count BIGINT,
  first_seen TIMESTAMP WITH TIME ZONE,
  last_seen TIMESTAMP WITH TIME ZONE,
  properties_summary JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ae.event_name::TEXT,
    COUNT(*)::BIGINT as event_count,
    MIN(ae.event_timestamp) as first_seen,
    MAX(ae.event_timestamp) as last_seen,
    jsonb_object_agg(
      prop_key, 
      jsonb_build_object(
        'unique_values', COUNT(DISTINCT prop_value),
        'total_occurrences', COUNT(*)
      )
    ) as properties_summary
  FROM analytics_events ae,
  LATERAL jsonb_each_text(ae.properties) AS props(prop_key, prop_value)
  WHERE 
    ae.expires_at > NOW()
    AND ae.event_timestamp >= NOW() - INTERVAL '1 day' * days_back
    AND (event_name_filter IS NULL OR ae.event_name = event_name_filter)
  GROUP BY ae.event_name;
END;
$$ LANGUAGE plpgsql;

-- Schedule automatic cleanup to run daily
-- Note: This would typically be set up as a cron job or scheduled function
-- For demonstration, we create the function that can be called periodically

CREATE OR REPLACE FUNCTION schedule_analytics_cleanup()
RETURNS VOID AS $$
BEGIN
  -- This function can be called by a cron job or scheduled task
  PERFORM cleanup_expired_analytics_events();
  
  -- Log the cleanup (optional)
  INSERT INTO analytics_events (
    event_name, 
    properties, 
    event_timestamp, 
    expires_at
  ) VALUES (
    'system_cleanup_completed',
    jsonb_build_object('cleaned_records', cleanup_expired_analytics_events()),
    NOW(),
    NOW() + INTERVAL '7 days' -- Keep cleanup logs for 7 days
  );
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE analytics_events IS 'Privacy-first analytics events for advocacy dashboard with automatic 30-day expiry';
COMMENT ON COLUMN analytics_events.event_name IS 'Event type: dream_submission_completed, participation_level_selected, etc.';
COMMENT ON COLUMN analytics_events.properties IS 'Event properties: participation level, countries, etc. (no PII)';
COMMENT ON COLUMN analytics_events.expires_at IS 'Automatic expiry timestamp for GDPR compliance (30 days)';
COMMENT ON FUNCTION cleanup_expired_analytics_events IS 'Removes expired analytics events for privacy compliance';
COMMENT ON FUNCTION get_analytics_summary IS 'Aggregates analytics data for public dashboard display';