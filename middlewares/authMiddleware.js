const jwt = require('jsonwebtoken');
const { sqliteDb, ensureSqliteUser } = require('../database/db');

function resolveUserPayload(decoded) {
  if (!decoded) return decoded;
  try {
    let sqliteUser = null;
    if (typeof decoded.id === 'number' || /^\d+$/.test(String(decoded.id))) {
      sqliteUser = sqliteDb.prepare('SELECT id, username FROM users WHERE id = ?').get(Number(decoded.id));
    }
    if (!sqliteUser && decoded.username) {
      sqliteUser = ensureSqliteUser({ username: decoded.username });
    }
    if (sqliteUser) {
      decoded.id = sqliteUser.id;
      decoded.username = sqliteUser.username;
      if (sqliteUser.username.toLowerCase() === 'admin') {
        decoded.role = 'admin';
      }
    }
  } catch (e) {
    // Fallback to decoded as-is
  }
  return decoded;
}

// Lesson 6 - Authentication & Lesson 8 - Token verification
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Vui lòng đăng nhập hoặc cung cấp JWT token hợp lệ!'
    });
  }

  const secret = process.env.JWT_SECRET || 'super_secret_jwt_minigame_key_2026_mindx';

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Token không hợp lệ hoặc đã hết hạn phiên làm việc!'
      });
    }
    req.user = resolveUserPayload(decoded);
    next();
  });
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_minigame_key_2026_mindx';
    jwt.verify(token, secret, (err, decoded) => {
      if (!err) {
        req.user = resolveUserPayload(decoded);
      }
      next();
    });
  } else {
    next();
  }
}

module.exports = { authenticateToken, optionalAuth };
