const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'aws_eum',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'aws_eum',
    charset: 'utf8mb4'
};

const migrations = [
    // Users table for authentication and user management
    `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        role ENUM('admin', 'user', 'readonly') DEFAULT 'user',
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username),
        INDEX idx_email (email),
        INDEX idx_role (role)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Messages table for SMS history
    `CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        message_id VARCHAR(255) UNIQUE NOT NULL,
        user_id INT,
        originator VARCHAR(100) NOT NULL,
        destination VARCHAR(20) NOT NULL,
        message_text TEXT NOT NULL,
        message_length INT NOT NULL,
        segments INT NOT NULL DEFAULT 1,
        estimated_cost DECIMAL(10, 6) DEFAULT 0.000000,
        actual_cost DECIMAL(10, 6) DEFAULT 0.000000,
        status ENUM('pending', 'sent', 'delivered', 'failed', 'unknown') DEFAULT 'pending',
        aws_message_id VARCHAR(255),
        aws_status VARCHAR(50),
        aws_status_message TEXT,
        error_message TEXT,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        delivered_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_message_id (message_id),
        INDEX idx_user_id (user_id),
        INDEX idx_originator (originator),
        INDEX idx_destination (destination),
        INDEX idx_status (status),
        INDEX idx_sent_at (sent_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Originators table for AWS phone numbers and sender IDs
    `CREATE TABLE IF NOT EXISTS originators (
        id INT AUTO_INCREMENT PRIMARY KEY,
        value VARCHAR(100) UNIQUE NOT NULL,
        label VARCHAR(255) NOT NULL,
        type ENUM('phone_number', 'sender_id') NOT NULL,
        country_code VARCHAR(5),
        is_active BOOLEAN DEFAULT TRUE,
        last_used TIMESTAMP NULL,
        total_messages INT DEFAULT 0,
        last_refreshed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_value (value),
        INDEX idx_type (type),
        INDEX idx_country_code (country_code),
        INDEX idx_is_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Settings table for application configuration
    `CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        key_name VARCHAR(100) UNIQUE NOT NULL,
        value TEXT,
        description TEXT,
        category VARCHAR(50) DEFAULT 'general',
        data_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
        is_system BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_key_name (key_name),
        INDEX idx_category (category)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Analytics table for message statistics
    `CREATE TABLE IF NOT EXISTS analytics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL,
        hour TINYINT NOT NULL DEFAULT 0,
        total_messages INT DEFAULT 0,
        successful_messages INT DEFAULT 0,
        failed_messages INT DEFAULT 0,
        total_segments INT DEFAULT 0,
        total_cost DECIMAL(10, 6) DEFAULT 0.000000,
        unique_destinations INT DEFAULT 0,
        unique_originators INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY idx_date_hour (date, hour),
        INDEX idx_date (date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Sessions table for user sessions
    `CREATE TABLE IF NOT EXISTS sessions (
        session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
        expires INT(11) UNSIGNED NOT NULL,
        data MEDIUMTEXT COLLATE utf8mb4_bin,
        PRIMARY KEY (session_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // API keys table for external integrations
    `CREATE TABLE IF NOT EXISTS api_keys (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        key_name VARCHAR(100) NOT NULL,
        api_key VARCHAR(255) UNIQUE NOT NULL,
        permissions JSON,
        last_used TIMESTAMP NULL,
        expires_at TIMESTAMP NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_api_key (api_key),
        INDEX idx_user_id (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
];

async function runMigrations() {
    let connection;
    
    try {
        console.log('🔄 Connecting to database...');
        connection = await mysql.createConnection(DB_CONFIG);
        
        console.log('✅ Connected to database successfully');
        console.log('🏗️  Running migrations...');
        
        for (let i = 0; i < migrations.length; i++) {
            const migration = migrations[i];
            const tableName = migration.match(/CREATE TABLE.*?`?(\w+)`?/)[1];
            
            console.log(`📋 Creating table: ${tableName}`);
            await connection.execute(migration);
            console.log(`✅ Table ${tableName} created successfully`);
        }
        
        console.log('🎉 All migrations completed successfully!');
        
        // Insert default settings
        await insertDefaultSettings(connection);
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

async function insertDefaultSettings(connection) {
    console.log('⚙️  Inserting default settings...');
    
    const defaultSettings = [
        ['app_name', 'AWS End User Messaging', 'Application name', 'general', 'string', false],
        ['app_version', '2.1.0', 'Application version', 'general', 'string', true],
        ['max_message_length', '1600', 'Maximum message length', 'messaging', 'number', false],
        ['cost_per_segment', '0.0075', 'Cost per SMS segment', 'messaging', 'number', false],
        ['default_country_code', '+44', 'Default country code', 'messaging', 'string', false],
        ['enable_analytics', 'true', 'Enable analytics collection', 'analytics', 'boolean', false],
        ['analytics_retention_days', '365', 'Analytics data retention in days', 'analytics', 'number', false],
        ['rate_limit_messages', '10', 'Rate limit: messages per minute', 'security', 'number', false],
        ['session_timeout', '3600', 'Session timeout in seconds', 'security', 'number', false],
        ['enable_registration', 'false', 'Enable user registration', 'security', 'boolean', false]
    ];
    
    for (const [key_name, value, description, category, data_type, is_system] of defaultSettings) {
        try {
            await connection.execute(
                'INSERT IGNORE INTO settings (key_name, value, description, category, data_type, is_system) VALUES (?, ?, ?, ?, ?, ?)',
                [key_name, value, description, category, data_type, is_system]
            );
        } catch (error) {
            console.log(`⚠️  Setting ${key_name} already exists, skipping...`);
        }
    }
    
    console.log('✅ Default settings inserted');
}

// Run migrations if this file is executed directly
if (require.main === module) {
    runMigrations();
}

module.exports = { runMigrations, DB_CONFIG };