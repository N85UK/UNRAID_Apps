const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'aws_eum',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'aws_eum',
    charset: 'utf8mb4'
};

async function seedDatabase() {
    let connection;
    
    try {
        console.log('🌱 Connecting to database for seeding...');
        connection = await mysql.createConnection(DB_CONFIG);
        
        console.log('✅ Connected successfully');
        
        // Create default admin user
        await createDefaultAdmin(connection);
        
        // Insert sample analytics data
        await insertSampleAnalytics(connection);
        
        console.log('🎉 Database seeded successfully!');
        
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

async function createDefaultAdmin(connection) {
    console.log('👤 Creating default admin user...');
    
    const defaultAdmin = {
        username: process.env.ADMIN_USERNAME || 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@localhost',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        full_name: 'System Administrator',
        role: 'admin'
    };
    
    // Check if admin user already exists
    const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [defaultAdmin.username, defaultAdmin.email]
    );
    
    if (existingUsers.length > 0) {
        console.log('⚠️  Admin user already exists, skipping...');
        return;
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(defaultAdmin.password, 12);
    
    // Insert admin user
    await connection.execute(
        'INSERT INTO users (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
        [defaultAdmin.username, defaultAdmin.email, passwordHash, defaultAdmin.full_name, defaultAdmin.role]
    );
    
    console.log('✅ Default admin user created:');
    console.log(`   Username: ${defaultAdmin.username}`);
    console.log(`   Email: ${defaultAdmin.email}`);
    console.log(`   Password: ${defaultAdmin.password}`);
    console.log('⚠️  Please change the default password after first login!');
}

async function insertSampleAnalytics(connection) {
    console.log('📊 Inserting sample analytics data...');
    
    const today = new Date();
    const sampleData = [];
    
    // Generate sample data for the last 30 days
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Generate hourly data for each day
        for (let hour = 0; hour < 24; hour++) {
            const totalMessages = Math.floor(Math.random() * 20) + 1;
            const successfulMessages = Math.floor(totalMessages * (0.85 + Math.random() * 0.15));
            const failedMessages = totalMessages - successfulMessages;
            const totalSegments = Math.floor(totalMessages * (1 + Math.random() * 0.5));
            const totalCost = totalSegments * 0.0075;
            const uniqueDestinations = Math.floor(totalMessages * (0.7 + Math.random() * 0.3));
            const uniqueOriginators = Math.min(3, Math.floor(Math.random() * 3) + 1);
            
            sampleData.push([
                dateStr,
                hour,
                totalMessages,
                successfulMessages,
                failedMessages,
                totalSegments,
                totalCost,
                uniqueDestinations,
                uniqueOriginators
            ]);
        }
    }
    
    // Insert sample data
    const query = `
        INSERT IGNORE INTO analytics 
        (date, hour, total_messages, successful_messages, failed_messages, total_segments, total_cost, unique_destinations, unique_originators)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    for (const data of sampleData) {
        await connection.execute(query, data);
    }
    
    console.log(`✅ Inserted ${sampleData.length} analytics records`);
}

// Run seeding if this file is executed directly
if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase };