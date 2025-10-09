const mysql = require('mysql2/promise');

class Database {
    constructor(config) {
        this.config = config;
        this.pool = null;
    }

    async connect() {
        try {
            this.pool = mysql.createPool({
                ...this.config,
                waitForConnections: true,
                connectionLimit: this.config.connectionLimit || 10,
                queueLimit: 0,
                acquireTimeout: this.config.acquireTimeout || 60000,
                timeout: this.config.timeout || 60000,
                reconnect: true
            });

            // Test the connection
            const connection = await this.pool.getConnection();
            await connection.ping();
            connection.release();

            console.log('✅ Database connected successfully');
            return true;
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            throw error;
        }
    }

    async query(sql, params = []) {
        try {
            const [rows] = await this.pool.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('Database query error:', error.message);
            throw error;
        }
    }

    async transaction(callback) {
        const connection = await this.pool.getConnection();
        
        try {
            await connection.beginTransaction();
            const result = await callback(connection);
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            console.log('📴 Database connection closed');
        }
    }

    // User management methods
    async createUser(userData) {
        const { username, email, password_hash, full_name, role = 'user' } = userData;
        
        const result = await this.query(
            'INSERT INTO users (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
            [username, email, password_hash, full_name, role]
        );
        
        return { id: result.insertId, ...userData };
    }

    async getUserById(id) {
        const users = await this.query('SELECT * FROM users WHERE id = ?', [id]);
        return users[0] || null;
    }

    async getUserByUsername(username) {
        const users = await this.query('SELECT * FROM users WHERE username = ?', [username]);
        return users[0] || null;
    }

    async getUserByEmail(email) {
        const users = await this.query('SELECT * FROM users WHERE email = ?', [email]);
        return users[0] || null;
    }

    async updateUserLastLogin(userId) {
        await this.query('UPDATE users SET last_login = NOW() WHERE id = ?', [userId]);
    }

    // Message management methods
    async saveMessage(messageData) {
        const {
            message_id, user_id, originator, destination, message_text,
            message_length, segments, estimated_cost, status = 'pending'
        } = messageData;

        const result = await this.query(
            `INSERT INTO messages 
             (message_id, user_id, originator, destination, message_text, message_length, segments, estimated_cost, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [message_id, user_id, originator, destination, message_text, message_length, segments, estimated_cost, status]
        );

        return { id: result.insertId, ...messageData };
    }

    async updateMessageStatus(messageId, status, awsMessageId = null, statusMessage = null) {
        await this.query(
            'UPDATE messages SET status = ?, aws_message_id = ?, aws_status_message = ?, updated_at = NOW() WHERE message_id = ?',
            [status, awsMessageId, statusMessage, messageId]
        );
    }

    async getMessageHistory(userId = null, limit = 100, offset = 0) {
        let query = `
            SELECT m.*, u.username 
            FROM messages m 
            LEFT JOIN users u ON m.user_id = u.id
        `;
        let params = [];

        if (userId) {
            query += ' WHERE m.user_id = ?';
            params.push(userId);
        }

        query += ' ORDER BY m.sent_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        return await this.query(query, params);
    }

    async getMessageById(messageId) {
        const messages = await this.query(
            'SELECT m.*, u.username FROM messages m LEFT JOIN users u ON m.user_id = u.id WHERE m.message_id = ?',
            [messageId]
        );
        return messages[0] || null;
    }

    // Originator management methods
    async saveOriginators(originators) {
        if (!originators || Object.keys(originators).length === 0) return;

        const values = Object.entries(originators).map(([label, info]) => [
            info.value,
            label,
            info.type,
            info.country_code || null
        ]);

        // Use INSERT ... ON DUPLICATE KEY UPDATE to handle existing originators
        await this.query(
            `INSERT INTO originators (value, label, type, country_code, last_refreshed) 
             VALUES ${values.map(() => '(?, ?, ?, ?, NOW())').join(', ')}
             ON DUPLICATE KEY UPDATE 
             label = VALUES(label), 
             type = VALUES(type), 
             country_code = VALUES(country_code), 
             last_refreshed = NOW()`,
            values.flat()
        );
    }

    async getOriginators(activeOnly = true) {
        let query = 'SELECT * FROM originators';
        let params = [];

        if (activeOnly) {
            query += ' WHERE is_active = ?';
            params.push(true);
        }

        query += ' ORDER BY type, label';

        const rows = await this.query(query, params);
        
        // Convert to the format expected by the application
        const originators = {};
        rows.forEach(row => {
            originators[row.label] = {
                value: row.value,
                type: row.type,
                country_code: row.country_code
            };
        });

        return originators;
    }

    async updateOriginatorUsage(originator) {
        await this.query(
            'UPDATE originators SET total_messages = total_messages + 1, last_used = NOW() WHERE value = ?',
            [originator]
        );
    }

    // Analytics methods
    async recordAnalytics(date, hour, messageData) {
        const {
            total_messages = 1,
            successful_messages = 0,
            failed_messages = 0,
            total_segments = 1,
            total_cost = 0,
            unique_destinations = 1,
            unique_originators = 1
        } = messageData;

        await this.query(
            `INSERT INTO analytics 
             (date, hour, total_messages, successful_messages, failed_messages, total_segments, total_cost, unique_destinations, unique_originators)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             total_messages = total_messages + VALUES(total_messages),
             successful_messages = successful_messages + VALUES(successful_messages),
             failed_messages = failed_messages + VALUES(failed_messages),
             total_segments = total_segments + VALUES(total_segments),
             total_cost = total_cost + VALUES(total_cost),
             unique_destinations = GREATEST(unique_destinations, VALUES(unique_destinations)),
             unique_originators = GREATEST(unique_originators, VALUES(unique_originators))`,
            [date, hour, total_messages, successful_messages, failed_messages, total_segments, total_cost, unique_destinations, unique_originators]
        );
    }

    async getAnalytics(startDate, endDate, groupBy = 'day') {
        let dateFormat = '%Y-%m-%d';
        let groupByClause = 'DATE(date)';

        if (groupBy === 'hour') {
            dateFormat = '%Y-%m-%d %H:00:00';
            groupByClause = 'date, hour';
        }

        const query = `
            SELECT 
                DATE_FORMAT(CONCAT(date, ' ', LPAD(hour, 2, '0'), ':00:00'), ?) as period,
                SUM(total_messages) as total_messages,
                SUM(successful_messages) as successful_messages,
                SUM(failed_messages) as failed_messages,
                SUM(total_segments) as total_segments,
                SUM(total_cost) as total_cost,
                AVG(unique_destinations) as avg_unique_destinations,
                AVG(unique_originators) as avg_unique_originators
            FROM analytics 
            WHERE date BETWEEN ? AND ?
            GROUP BY ${groupByClause}
            ORDER BY date, hour
        `;

        return await this.query(query, [dateFormat, startDate, endDate]);
    }

    // Settings methods
    async getSetting(key) {
        const settings = await this.query('SELECT value, data_type FROM settings WHERE key_name = ?', [key]);
        if (settings.length === 0) return null;

        const setting = settings[0];
        const { value, data_type } = setting;

        switch (data_type) {
            case 'number':
                return parseFloat(value);
            case 'boolean':
                return value === 'true';
            case 'json':
                return JSON.parse(value);
            default:
                return value;
        }
    }

    async setSetting(key, value, description = null, category = 'general', dataType = 'string') {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        
        await this.query(
            `INSERT INTO settings (key_name, value, description, category, data_type) 
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
             value = VALUES(value), 
             description = COALESCE(VALUES(description), description), 
             updated_at = NOW()`,
            [key, stringValue, description, category, dataType]
        );
    }

    async getAllSettings(category = null) {
        let query = 'SELECT * FROM settings';
        let params = [];

        if (category) {
            query += ' WHERE category = ?';
            params.push(category);
        }

        query += ' ORDER BY category, key_name';

        return await this.query(query, params);
    }
}

module.exports = Database;