import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'beehive-secret-key-change-in-production';
export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const token = authHeader.substring(7);
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role,
                name: decoded.name || decoded.email // Fallback to email if name not in token
            };
            next();
        }
        catch (error) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
    }
    catch (error) {
        return res.status(500).json({ error: 'Authentication error' });
    }
};
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};
