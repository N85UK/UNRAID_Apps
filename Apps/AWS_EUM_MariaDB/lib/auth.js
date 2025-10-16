const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

class AuthManager {
    constructor(database) {
        this.db = database;
    }

    async hashPassword(password) {
        return await bcrypt.hash(password, 12);
    }

    async comparePassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }

    generateToken(user) {
        return jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                email: user.email, 
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return null;
        }
    }

    async authenticateUser(username, password) {
        try {
            // Get user by username or email
            let user = await this.db.getUserByUsername(username);
            if (!user) {
                user = await this.db.getUserByEmail(username);
            }

            if (!user) {
                return { success: false, message: 'User not found' };
            }

            if (!user.is_active) {
                return { success: false, message: 'Account is disabled' };
            }

            const isValidPassword = await this.comparePassword(password, user.password_hash);
            if (!isValidPassword) {
                return { success: false, message: 'Invalid password' };
            }

            // Update last login
            await this.db.updateUserLastLogin(user.id);

            // Generate token
            const token = this.generateToken(user);

            // Remove password hash from user object
            delete user.password_hash;

            return {
                success: true,
                user,
                token
            };
        } catch (error) {
            console.error('Authentication error:', error);
            return { success: false, message: 'Authentication failed' };
        }
    }

    async createUser(userData) {
        try {
            const { username, email, password, full_name, role = 'user' } = userData;

            // Check if user already exists
            const existingUser = await this.db.getUserByUsername(username);
            if (existingUser) {
                return { success: false, message: 'Username already exists' };
            }

            const existingEmail = await this.db.getUserByEmail(email);
            if (existingEmail) {
                return { success: false, message: 'Email already exists' };
            }

            // Hash password
            const password_hash = await this.hashPassword(password);

            // Create user
            const user = await this.db.createUser({
                username,
                email,
                password_hash,
                full_name,
                role
            });

            // Remove password hash from response
            delete user.password_hash;

            return { success: true, user };
        } catch (error) {
            console.error('User creation error:', error);
            return { success: false, message: 'Failed to create user' };
        }
    }

    // Middleware functions
    requireAuth(req, res, next) {
        const token = req.headers.authorization?.replace('Bearer ', '') || 
                     req.session?.token ||
                     req.cookies?.token;

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = this.verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = decoded;
        next();
    }

    requireRole(roles) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];
            const requiredRoles = Array.isArray(roles) ? roles : [roles];

            const hasRole = requiredRoles.some(role => userRoles.includes(role));
            if (!hasRole) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }

            next();
        };
    }

    // Session-based authentication middleware
    requireSession(req, res, next) {
        if (!req.session?.userId) {
            if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            return res.redirect('/login');
        }

        // Add user info to request
        this.db.getUserById(req.session.userId)
            .then(user => {
                if (user && user.is_active) {
                    req.user = user;
                    next();
                } else {
                    req.session.destroy();
                    if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                        return res.status(401).json({ error: 'User not found or inactive' });
                    }
                    res.redirect('/login');
                }
            })
            .catch(error => {
                console.error('Session auth error:', error);
                res.status(500).json({ error: 'Authentication error' });
            });
    }

    // Optional authentication (doesn't fail if not authenticated)
    optionalAuth(req, res, next) {
        const token = req.headers.authorization?.replace('Bearer ', '') || 
                     req.session?.token ||
                     req.cookies?.token;

        if (token) {
            const decoded = this.verifyToken(token);
            if (decoded) {
                req.user = decoded;
            }
        }

        next();
    }
}

module.exports = AuthManager;