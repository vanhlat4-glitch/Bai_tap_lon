const bcrypt = require('bcryptjs');
const { sqliteDb, getIsConnected } = require('../database/db');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/token');

const db = sqliteDb;

function recordLoginLog(userId, username, status, req) {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const userAgent = (req.headers['user-agent'] || 'Unknown').substring(0, 150);
    db.prepare('INSERT INTO login_logs (user_id, username, status, ip, user_agent) VALUES (?, ?, ?, ?, ?)').run(
      userId || null,
      username || 'Unknown',
      status,
      ip,
      userAgent
    );
  } catch (e) {
    // Ignore logging error
  }
}


// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public (Lesson 1, 2, 6, 7, 8)
exports.register = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Vui lòng cung cấp đầy đủ tên tài khoản và mật khẩu!' });
    }

    const cleanUsername = username.trim();
    if (cleanUsername.length < 3 || cleanUsername.length > 20) {
      return res.status(400).json({ success: false, error: 'Tên tài khoản phải từ 3 đến 20 ký tự!' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Mật khẩu phải có tối thiểu 6 ký tự!' });
    }

    // Role setup: 'admin' if username is 'admin', otherwise 'user'
    const role = cleanUsername.toLowerCase() === 'admin' ? 'admin' : 'user';

    // If MongoDB is connected via Mongoose (Lesson 4)
    if (getIsConnected()) {
      const existing = await User.findOne({ username: new RegExp(`^${cleanUsername}$`, 'i') });
      if (existing) {
        return res.status(400).json({ success: false, error: 'Tên tài khoản này đã được sử dụng!' });
      }

      const newUser = await User.create({
        username: cleanUsername,
        password, // Pre-save hook hashes with bcrypt (Lesson 7)
        role,
        coins: 100,
        avatar: '🎮',
        badge: 'Tân thủ'
      });

      const token = generateAccessToken(newUser);
      const refreshToken = generateRefreshToken(newUser);
      recordLoginLog(newUser._id, cleanUsername, 'registered', req);
      return res.status(201).json({
        success: true,
        message: 'Đăng ký thành công! Bạn nhận được 100 Xu tân thủ!',
        token,
        refreshToken,
        user: {
          id: newUser._id,
          username: newUser.username,
          role: newUser.role,
          coins: newUser.coins,
          avatar: newUser.avatar,
          badge: newUser.badge
        }
      });
    }

    // High performance database engine fallback
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ? COLLATE NOCASE').get(cleanUsername);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Tên tài khoản này đã được sử dụng!' });
    }

    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(`
      INSERT INTO users (username, password_hash, coins, avatar, badge) 
      VALUES (?, ?, 100, '🎮', 'Tân thủ')
    `).run(cleanUsername, hash);

    const userId = Number(result.lastInsertRowid);
    db.prepare('INSERT OR IGNORE INTO daily_wheel (user_id, last_free_spin, total_spins) VALUES (?, NULL, 0)').run(userId);
    recordLoginLog(userId, cleanUsername, 'registered', req);

    const token = generateAccessToken({ id: userId, username: cleanUsername, role });
    const refreshToken = generateRefreshToken({ id: userId, username: cleanUsername, role });

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công! Bạn nhận được 100 Xu tân thủ!',
      token,
      refreshToken,
      user: {
        id: userId,
        username: cleanUsername,
        role,
        coins: 100,
        avatar: '🎮',
        badge: 'Tân thủ'
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public (Lesson 6, 7, 8)
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Vui lòng nhập tên tài khoản và mật khẩu!' });
    }

    const cleanUsername = username.trim();

    if (getIsConnected()) {
      const user = await User.findOne({ username: new RegExp(`^${cleanUsername}$`, 'i') });
      if (user) {
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          recordLoginLog(null, cleanUsername, 'failed', req);
          return res.status(400).json({ success: false, error: 'Tài khoản hoặc mật khẩu không chính xác!' });
        }

        recordLoginLog(user._id, cleanUsername, 'success', req);
        const token = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        return res.json({
          success: true,
          message: 'Đăng nhập thành công (Mongoose)!',
          token,
          refreshToken,
          user: {
            id: user._id,
            username: user.username,
            role: user.role,
            coins: user.coins,
            avatar: user.avatar,
            badge: user.badge
          }
        });
      }
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ? COLLATE NOCASE').get(cleanUsername);
    if (!user) {
      recordLoginLog(null, cleanUsername, 'failed', req);
      return res.status(400).json({ success: false, error: 'Tài khoản hoặc mật khẩu không chính xác!' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      recordLoginLog(null, cleanUsername, 'failed', req);
      return res.status(400).json({ success: false, error: 'Tài khoản hoặc mật khẩu không chính xác!' });
    }

    const role = user.username.toLowerCase() === 'admin' ? 'admin' : 'user';
    recordLoginLog(user.id, cleanUsername, 'success', req);
    const token = generateAccessToken({ id: user.id, username: user.username, role });
    const refreshToken = generateRefreshToken({ id: user.id, username: user.username, role });

    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        role,
        coins: user.coins,
        avatar: user.avatar,
        badge: user.badge
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile & stats
// @route   GET /api/auth/me
// @access  Private (Lesson 6 & 8)
exports.getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = db.prepare('SELECT id, username, coins, avatar, badge, created_at FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Người dùng không tồn tại!' });
    }

    const role = user.username.toLowerCase() === 'admin' ? 'admin' : (req.user.role || 'user');
    const inventory = db.prepare('SELECT item_id, item_type, bought_at FROM inventory WHERE user_id = ?').all(user.id);
    
    // User best scores
    const bestCaro = db.prepare('SELECT MAX(score) as best FROM scores WHERE user_id = ? AND game = ?').get(user.id, 'caro');
    const bestSnake = db.prepare('SELECT MAX(score) as best FROM scores WHERE user_id = ? AND game = ?').get(user.id, 'snake');
    const best2048 = db.prepare('SELECT MAX(score) as best FROM scores WHERE user_id = ? AND game = ?').get(user.id, '2048');

    // Daily wheel status
    const wheelStatus = db.prepare('SELECT last_free_spin, total_spins FROM daily_wheel WHERE user_id = ?').get(user.id) || { last_free_spin: null, total_spins: 0 };
    let canFreeSpin = true;
    let secondsUntilFreeSpin = 0;
    if (wheelStatus.last_free_spin) {
      const last = new Date(wheelStatus.last_free_spin).getTime();
      const now = Date.now();
      const diffHours = (now - last) / (1000 * 60 * 60);
      if (diffHours < 6) {
        canFreeSpin = false;
        secondsUntilFreeSpin = Math.ceil((6 * 3600) - ((now - last) / 1000));
      }
    }

    res.json({
      success: true,
      user: { ...user, role },
      inventory,
      stats: {
        bestCaro: bestCaro?.best || 0,
        bestSnake: bestSnake?.best || 0,
        best2048: best2048?.best || 0
      },
      wheel: {
        canFreeSpin,
        secondsUntilFreeSpin,
        totalSpins: wheelStatus.total_spins
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile avatar/badge
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { avatar, badge } = req.body;
    const updates = [];
    const params = [];

    if (avatar) {
      updates.push('avatar = ?');
      params.push(avatar);
    }
    if (badge) {
      updates.push('badge = ?');
      params.push(badge);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'Không có dữ liệu cập nhật!' });
    }

    params.push(req.user.id);
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const updated = db.prepare('SELECT id, username, coins, avatar, badge FROM users WHERE id = ?').get(req.user.id);

    res.json({
      success: true,
      message: 'Cập nhật hồ sơ thành công!',
      user: updated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Refresh access token (add refresh token - Lesson 8)
// @route   POST /api/auth/refresh-token
// @access  Public
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: 'Thiếu Refresh Token!' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(403).json({ success: false, error: 'Refresh Token không hợp lệ hoặc đã hết hạn!' });
    }

    const user = { id: decoded.id, username: decoded.username, role: decoded.role };
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    next(err);
  }
};

