-- PostgreSQL 17.5 + Directus Production Optimizations
-- Based on performance tuning documentation

-- Enable pg_stat_statements extension for monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Create indexes for common Directus queries
-- These indexes optimize the most frequent Directus operations

-- Directus revisions table optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_directus_revisions_activity 
ON directus_revisions(activity);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_directus_revisions_collection_item 
ON directus_revisions(collection, item);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_directus_revisions_timestamp 
ON directus_revisions(timestamp DESC);

-- Directus activity table optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_directus_activity_timestamp 
ON directus_activity(timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_directus_activity_user 
ON directus_activity("user");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_directus_activity_collection_item 
ON directus_activity(collection, item);

-- Directus files table optimizations (for asset management)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_directus_files_folder 
ON directus_files(folder);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_directus_files_type 
ON directus_files(type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_directus_files_uploaded_on 
ON directus_files(uploaded_on DESC);

-- Directus sessions table optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_directus_sessions_expires 
ON directus_sessions(expires);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_directus_sessions_token 
ON directus_sessions(token);

-- Generic optimization for user tables (common Directus pattern)
-- Note: This will be applied to custom collections when they're created
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_created_on ON users(date_created DESC);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_status ON users(status);

-- Set optimal autovacuum settings for Directus tables
-- These tables have high update frequency

ALTER TABLE directus_activity SET (
    autovacuum_vacuum_scale_factor = 0.05,
    autovacuum_analyze_scale_factor = 0.02,
    autovacuum_vacuum_cost_delay = 10
);

ALTER TABLE directus_revisions SET (
    autovacuum_vacuum_scale_factor = 0.05,
    autovacuum_analyze_scale_factor = 0.02,
    autovacuum_vacuum_cost_delay = 10
);

ALTER TABLE directus_sessions SET (
    autovacuum_vacuum_scale_factor = 0.1,
    autovacuum_analyze_scale_factor = 0.05,
    autovacuum_vacuum_cost_delay = 5
);

-- Optimize statistics collection for better query planning
ALTER TABLE directus_activity ALTER COLUMN timestamp SET STATISTICS 1000;
ALTER TABLE directus_revisions ALTER COLUMN timestamp SET STATISTICS 1000;
ALTER TABLE directus_files ALTER COLUMN uploaded_on SET STATISTICS 1000;

-- Create function to analyze query performance (useful for monitoring)
CREATE OR REPLACE FUNCTION analyze_directus_performance()
RETURNS TABLE(
    query_text text,
    calls bigint,
    mean_exec_time numeric,
    total_exec_time numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pss.query,
        pss.calls,
        pss.mean_exec_time,
        pss.total_exec_time
    FROM pg_stat_statements pss
    WHERE pss.query ILIKE '%directus%'
    ORDER BY pss.total_exec_time DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Create function to monitor index usage
CREATE OR REPLACE FUNCTION check_unused_indexes()
RETURNS TABLE(
    schemaname text,
    tablename text,
    indexname text,
    idx_scan bigint,
    idx_tup_read bigint,
    idx_tup_fetch bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        psi.schemaname::text,
        psi.relname::text,
        psi.indexrelname::text,
        psi.idx_scan,
        psi.idx_tup_read,
        psi.idx_tup_fetch
    FROM pg_stat_user_indexes psi
    WHERE psi.idx_scan < 100  -- Indexes used less than 100 times
    ORDER BY psi.idx_scan;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions for monitoring
GRANT EXECUTE ON FUNCTION analyze_directus_performance() TO directus;
GRANT EXECUTE ON FUNCTION check_unused_indexes() TO directus;

-- Vacuum and analyze all Directus tables to update statistics
VACUUM ANALYZE directus_activity;
VACUUM ANALYZE directus_revisions;
VACUUM ANALYZE directus_files;
VACUUM ANALYZE directus_sessions;
VACUUM ANALYZE directus_users;
VACUUM ANALYZE directus_roles;
VACUUM ANALYZE directus_permissions;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Directus production optimizations applied successfully';
    RAISE NOTICE 'PostgreSQL version: %', version();
    RAISE NOTICE 'pg_stat_statements enabled: %', 
        CASE WHEN EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements') 
             THEN 'YES' ELSE 'NO' END;
END $$;