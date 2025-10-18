-- Manual migration: 003_add_webhook_source
-- Run this on your MariaDB if alembic won't work

-- Add webhook_source column
ALTER TABLE alerts 
ADD COLUMN webhook_source VARCHAR(100) DEFAULT 'ucgmax' AFTER alert_id;

-- Create index on webhook_source
CREATE INDEX idx_alerts_webhook_source ON alerts(webhook_source);

-- Drop unique constraint on alert_id (may need to adjust constraint name)
-- First, check the constraint name with:
-- SHOW CREATE TABLE alerts;
-- Then drop it (constraint name might be different):
ALTER TABLE alerts DROP INDEX alert_id;

-- Make fields nullable
ALTER TABLE alerts MODIFY COLUMN source VARCHAR(100) NULL;
ALTER TABLE alerts MODIFY COLUMN device VARCHAR(100) NULL;
ALTER TABLE alerts MODIFY COLUMN severity VARCHAR(50) NULL;
ALTER TABLE alerts MODIFY COLUMN alert_type VARCHAR(100) NULL;
ALTER TABLE alerts MODIFY COLUMN summary TEXT NULL;
ALTER TABLE alerts MODIFY COLUMN details JSON NULL;
ALTER TABLE alerts MODIFY COLUMN idempotency_key VARCHAR(255) NULL;

-- Update alembic version (adjust if your table name is different)
-- INSERT INTO alembic_version (version_num) VALUES ('003_add_webhook_source');
