const jwt = require('jsonwebtoken');
const db = require('../db');
const bcrypt = require('bcryptjs');

function resolveUserPayload(decoded) {
  if (!decoded) return decoded;
  try {
    let sqliteUser = null;
    if (typeof decoded.id === 'number' || /^\d+$/.test(String(decoded.id))) {
      sqliteUser = db.prepare('SELECT id, username FROM users WHERE id = ?').get(Number(decoded.id));
    }
    if (!sqliteUser && decoded.username) {
      sqliteUser = db.prepare('SELECT id, username FROM users WHERE username = ? COLLATE NOCASE').get(decoded.username);
      if (!sqliteUser) {
        const hash = bcrypt.hashSync('123456', 10);
        const res = db.prepare("INSERT INTO users (username, password_hash, coins, avatar, badge) VALUES (?, ?, 100, '🎮', 'Tân thủ')").run(decoded.username, hash);
        const userId = Number(res.lastInsertRowid);
        db.prepare('INSERT OR IGNORE INTO daily_wheel (user_id, last_free_spin, total_spins) VALUES (?, NULL, 0)').run(userId);
        sqliteUser = { id: userId, username: decoded.username };
      }
    }
    if (sqliteUser) {
      decoded.id = sqliteUser.id;
      decoded.username = sqliteUser.username;
    }
  } catch (e) {}
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
