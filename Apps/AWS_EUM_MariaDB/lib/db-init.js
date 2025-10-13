const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

/**
 * Database Auto-Initialization Module
 * Automatically creates database and all required tables if they don't exist
 */

const migrations = [
    // Users table for authentication and user management
    {
        name: 'users',
        sql: `CREATE TABLE IF NOT EXISTS users (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    },
    // Messages table for SMS history
    {
        name: 'messages',
        sql: `CREATE TABLE IF NOT EXISTS messages (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    },
    // Originators table for AWS phone numbers and sender IDs
    {
        name: 'originators',
        sql: `CREATE TABLE IF NOT EXISTS originators (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    },
    // Settings table for application configuration
    {
        name: 'settings',
        sql: `CREATE TABLE IF NOT EXISTS settings (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    },
    // Analytics table for message statistics
    {
        name: 'analytics',
        sql: `CREATE TABLE IF NOT EXISTS analytics (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    },
    // Sessions table for user sessions
    {
        name: 'sessions',
        sql: `CREATE TABLE IF NOT EXISTS sessions (
            session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
            expires INT(11) UNSIGNED NOT NULL,
            data MEDIUMTEXT COLLATE utf8mb4_bin,
            PRIMARY KEY (session_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    },
    // API keys table for external integrations
    {
        name: 'api_keys',
        sql: `CREATE TABLE IF NOT EXISTS api_keys (
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
    }
];

const defaultSettings = [
    ['app_name', 'AWS End User Messaging', 'Application name', 'general', 'string', false],
    ['app_version', '2.1.2', 'Application version', 'general', 'string', true],
    ['max_message_length', '1600', 'Maximum message length', 'messaging', 'number', false],
    ['cost_per_segment', '0.0075', 'Cost per SMS segment', 'messaging', 'number', false],
    ['default_country_code', '+44', 'Default country code', 'messaging', 'string', false],
    ['enable_analytics', 'true', 'Enable analytics collection', 'analytics', 'boolean', false],
    ['analytics_retention_days', '365', 'Analytics data retention in days', 'analytics', 'number', false],
    ['rate_limit_messages', '10', 'Rate limit: messages per minute', 'security', 'number', false],
    ['session_timeout', '3600', 'Session timeout in seconds', 'security', 'number', false],
    ['enable_registration', 'false', 'Enable user registration', 'security', 'boolean', false]
];

/**
 * Initialize database and create all required tables
 * @param {Object} config - Database configuration
 * @returns {Promise<boolean>} - True if initialization successful
 */
async function initializeDatabase(config) {
    let connection;
    
    try {
        console.log('🔄 Initializing database...');
        
        // First, connect without specifying database to check if it exists
        const baseConfig = {
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            charset: 'utf8mb4'
        };
        
        connection = await mysql.createConnection(baseConfig);
        
        // Create database if it doesn't exist
        const dbName = config.database || 'aws_eum';
        console.log(`📊 Checking database: ${dbName}`);
        
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`✅ Database ${dbName} ready`);
        
        // Switch to the database
        await connection.query(`USE \`${dbName}\``);
        
        // Run migrations to create tables
        console.log('🏗️  Creating tables...');
        let tablesCreated = 0;
        
        for (const migration of migrations) {
            try {
                await connection.query(migration.sql);
                console.log(`  ✅ Table '${migration.name}' ready`);
                tablesCreated++;
            } catch (error) {
                console.error(`  ❌ Error creating table '${migration.name}':`, error.message);
                throw error;
            }
        }
        
        console.log(`✅ All ${tablesCreated} tables created successfully`);
        
        // Insert default settings
        await insertDefaultSettings(connection);
        
        // Create default admin user if none exists
        await createDefaultAdmin(connection, config);
        
        console.log('🎉 Database initialization complete!');
        return true;
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        
        // Provide helpful error messages
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('');
            console.error('🔐 Database Access Denied!');
            console.error('   Check your database credentials:');
            console.error(`   - DB_HOST: ${config.host}`);
            console.error(`   - DB_USER: ${config.user}`);
            console.error('   - DB_PASSWORD: (check environment variable)');
            console.error('');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('');
            console.error('🔌 Database Connection Refused!');
            console.error(`   Cannot connect to database server at ${config.host}:${config.port}`);
            console.error('   - Ensure MariaDB/MySQL server is running');
            console.error('   - Check DB_HOST and DB_PORT are correct');
            console.error('');
        } else if (error.code === 'ENOTFOUND') {
            console.error('');
            console.error('🌐 Database Host Not Found!');
            console.error(`   Cannot resolve hostname: ${config.host}`);
            console.error('   - Check DB_HOST is correct');
            console.error('   - Ensure DNS resolution works');
            console.error('');
        }
        
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

/**
 * Insert default settings if they don't exist
 */
async function insertDefaultSettings(connection) {
    console.log('⚙️  Configuring default settings...');
    
    for (const [key_name, value, description, category, data_type, is_system] of defaultSettings) {
        try {
            await connection.execute(
                'INSERT IGNORE INTO settings (key_name, value, description, category, data_type, is_system) VALUES (?, ?, ?, ?, ?, ?)',
                [key_name, value, description, category, data_type, is_system]
            );
        } catch (error) {
            // Setting already exists, skip
        }
    }
    
    console.log('✅ Default settings configured');
}

/**
 * Create default admin user if no users exist
 */
async function createDefaultAdmin(connection, config) {
    try {
        // Check if any users exist
        const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
        
        if (users[0].count === 0) {
            console.log('👤 Creating default admin user...');
            
            const bcrypt = require('bcryptjs');
            const adminUsername = process.env.ADMIN_USERNAME || 'admin';
            const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
            const passwordHash = await bcrypt.hash(adminPassword, 12);
            
            await connection.execute(
                'INSERT INTO users (username, email, password_hash, full_name, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
                [adminUsername, `${adminUsername}@localhost`, passwordHash, 'Administrator', 'admin', true]
            );
            
            console.log(`✅ Default admin user created: ${adminUsername}`);
            
            if (adminPassword === 'admin123') {
                console.log('');
                console.log('⚠️  WARNING: Default admin password is being used!');
                console.log('   Please change the password immediately after first login');
                console.log('   Or set ADMIN_PASSWORD environment variable');
                console.log('');
            }
        } else {
            console.log(`👤 Found ${users[0].count} existing user(s)`);
        }
    } catch (error) {
        console.error('⚠️  Could not create default admin user:', error.message);
        // Don't throw - this is not critical
    }
}

/**
 * Check if database and tables exist
 */
async function checkDatabaseStatus(config) {
    let connection;
    
    try {
        const baseConfig = {
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            charset: 'utf8mb4'
        };
        
        connection = await mysql.createConnection(baseConfig);
        
        const dbName = config.database || 'aws_eum';
        
        // Check if database exists
        const [databases] = await connection.query('SHOW DATABASES LIKE ?', [dbName]);
        
        if (databases.length === 0) {
            return { exists: false, tables: [] };
        }
        
        // Switch to database and check tables
        await connection.query(`USE \`${dbName}\``);
        const [tables] = await connection.query('SHOW TABLES');
        
        const tableNames = tables.map(row => Object.values(row)[0]);
        
        return {
            exists: true,
            tables: tableNames,
            complete: migrations.every(m => tableNames.includes(m.name))
        };
        
    } catch (error) {
        return { exists: false, tables: [], error: error.message };
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

module.exports = {
    initializeDatabase,
    checkDatabaseStatus,
    migrations
};
