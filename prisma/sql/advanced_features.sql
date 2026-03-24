-- =============================================================================
-- Alumni Tracker — Advanced MySQL Features
-- Run with: npx prisma db execute --file prisma/sql/advanced_features.sql
-- =============================================================================

-- Drop existing objects (safe re-run)
DROP TRIGGER IF EXISTS after_alumni_profile_update;
DROP VIEW IF EXISTS vw_batch_employment_stats;
DROP VIEW IF EXISTS vw_top_companies;
DROP VIEW IF EXISTS vw_country_distribution;
DROP PROCEDURE IF EXISTS sp_batch_summary;

-- =============================================================================
-- TRIGGER: Auto-log AuditLog on AlumniProfile UPDATE
-- =============================================================================
CREATE TRIGGER after_alumni_profile_update
AFTER UPDATE ON AlumniProfile
FOR EACH ROW
BEGIN
  INSERT INTO AuditLog (id, userId, action, entity, entityId, createdAt)
  VALUES (
    UUID(),
    NEW.userId,
    'UPDATE',
    'AlumniProfile',
    NEW.id,
    NOW()
  );
END;

-- =============================================================================
-- VIEW: Batch-wise employment summary
-- =============================================================================
CREATE VIEW vw_batch_employment_stats AS
SELECT
  batchYear                                   AS batch_year,
  program,
  COUNT(*)                                    AS total_alumni,
  SUM(isVerified)                             AS verified_alumni,
  SUM(isEmployed)                             AS employed_alumni,
  ROUND(SUM(isEmployed) / COUNT(*) * 100, 1) AS employment_rate_pct,
  ROUND(
    SUM(isEmployed) / NULLIF(SUM(isVerified), 0) * 100, 1
  )                                           AS verified_employment_rate_pct
FROM AlumniProfile
GROUP BY batchYear, program
ORDER BY batchYear DESC, program;

-- =============================================================================
-- VIEW: Top companies by alumni count
-- =============================================================================
CREATE VIEW vw_top_companies AS
SELECT
  currentCompany       AS company,
  COUNT(*)             AS alumni_count,
  SUM(isVerified)      AS verified_count,
  MIN(batchYear)       AS earliest_batch,
  MAX(batchYear)       AS latest_batch
FROM AlumniProfile
WHERE currentCompany IS NOT NULL
  AND currentCompany != ''
  AND isVerified = 1
GROUP BY currentCompany
ORDER BY alumni_count DESC
LIMIT 20;

-- =============================================================================
-- VIEW: Country distribution
-- =============================================================================
CREATE VIEW vw_country_distribution AS
SELECT
  country,
  COUNT(*)  AS alumni_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS percentage
FROM AlumniProfile
WHERE isVerified = 1
GROUP BY country
ORDER BY alumni_count DESC;

-- =============================================================================
-- STORED PROCEDURE: Comprehensive batch summary with window functions
-- Usage: CALL sp_batch_summary();
-- =============================================================================
CREATE PROCEDURE sp_batch_summary()
BEGIN
  SELECT
    batchYear                                                   AS batch_year,
    COUNT(*)                                                    AS total_alumni,
    SUM(isVerified)                                             AS verified,
    SUM(isEmployed)                                             AS employed,
    ROUND(SUM(isEmployed) / NULLIF(SUM(isVerified), 0) * 100, 1)
                                                                AS employment_rate,
    RANK() OVER (ORDER BY SUM(isEmployed) / NULLIF(SUM(isVerified), 0) DESC)
                                                                AS employment_rank,
    SUM(SUM(isVerified)) OVER (ORDER BY batchYear DESC ROWS UNBOUNDED PRECEDING)
                                                                AS cumulative_verified
  FROM AlumniProfile
  GROUP BY batchYear
  ORDER BY batchYear DESC;
END;
