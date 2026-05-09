const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // get token from request header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'no token, access denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // attach userId to request
    next(); // move to next function
  } catch (err) {
    res.status(401).json({ error: 'invalid token' });
  }
};

module.exports = authMiddleware;