/**
 * middleware/authMiddleware.js – JWT Authentication & Role-Based Access Control
 *
 * authenticateToken – Verifies JWT and attaches user to req.user
 * authorize(...roles) – Restricts route to specific roles (STUDENT, CUSTODIAN, ADMIN)
 */

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

/**
 * authenticateToken – Express middleware that protects a route.
 * Reads the Authorization header, verifies the JWT, and attaches
 * the decoded payload to req.user.
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token.' });
        }
        req.user = decoded;
        next();
    });
};

/**
 * authorize – Factory function that returns middleware restricting access
 * to users with one of the specified roles.
 *
 * Usage:
 *   router.post('/hostels', authenticateToken, authorize('CUSTODIAN', 'ADMIN'), createHostel);
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required.' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: `Access denied. Required role: ${roles.join(' or ')}.`,
            });
        }
        next();
    };
};

module.exports = { authenticateToken, authorize };
