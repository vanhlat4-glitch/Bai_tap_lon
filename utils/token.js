const jwt = require('jsonwebtoken');

// Lesson 8 - Token & Refresh Token Implementation (khoatranpc curriculum)
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_minigame_key_2026_mindx';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'super_secret_refresh_token_key_2026_mindx';

// Generate Access Token (Short-lived, e.g. 15m - 2h)
function generateAccessToken(user) {
  const payload = {
    id: user.id || user._id,
    username: user.username,
    role: user.role || 'user'
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
}

// Generate Refresh Token (Long-lived, e.g. 7d)
function generateRefreshToken(user) {
  const payload = {
    id: user.id || user._id,
    username: user.username,
    role: user.role || 'user'
  };
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
}

// Verify Refresh Token
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = {
  JWT_SECRET,
  REFRESH_SECRET,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
};
