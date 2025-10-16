-- AWS EUM MariaDB Database Initialization Script
-- This script is automatically executed when MariaDB container starts for the first time

-- Set timezone
SET time_zone = '+00:00';

-- Use the database
USE aws_eum;

-- Ensure proper character set
ALTER DATABASE aws_eum CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant privileges to the application user
GRANT ALL PRIVILEGES ON aws_eum.* TO 'aws_eum'@'%';
FLUSH PRIVILEGES;

-- The application will create tables via the migrate.js script
-- This init script just ensures the database is ready with proper settings

-- Optional: Create a health check table for monitoring
CREATE TABLE IF NOT EXISTS health_check (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status VARCHAR(50) DEFAULT 'healthy',
    last_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO health_check (status) VALUES ('initialized') 
ON DUPLICATE KEY UPDATE last_check = CURRENT_TIMESTAMP;