const jwt = require('jsonwebtoken');

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
    req.user = decoded;
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
        req.user = decoded;
      }
      next();
    });
  } else {
    next();
  }
}

module.exports = { authenticateToken, optionalAuth };
