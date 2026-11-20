const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

const token = authHeader.split('')[1]

if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
}

try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded

    next()

} catch (error) {
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
    }

    return res.status(403).json({ message: 'Invalid Token' });
}

module.exports = {verifyToken}