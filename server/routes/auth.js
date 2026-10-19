const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

// Register
router.post('/register', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ tên tài khoản và mật khẩu!' });
    }

    const cleanUsername = username.trim();
    if (cleanUsername.length < 3 || cleanUsername.length > 20) {
      return res.status(400).json({ error: 'Tên tài khoản phải từ 3 đến 20 ký tự!' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự!' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE username = ? COLLATE NOCASE').get(cleanUsername);
    if (existingUser) {
      return res.status(400).json({ error: 'Tên tài khoản này đã được sử dụng!' });
    }

    const hash = bcrypt.hashSync(password, 10);
    const insert = db.prepare(`
      INSERT INTO users (username, password_hash, coins, avatar, badge) 
      VALUES (?, ?, 100, '🎮', 'Tân thủ')
    `);
    const result = insert.run(cleanUsername, hash);
    const userId = Number(result.lastInsertRowid);

    // Initialize daily wheel entry
    db.prepare('INSERT OR IGNORE INTO daily_wheel (user_id, last_free_spin, total_spins) VALUES (?, NULL, 0)').run(userId);

    const token = jwt.sign({ id: userId, username: cleanUsername }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Đăng ký thành công! Bạn nhận được 100 xu tân thủ!',
      token,
      user: {
        id: userId,
        username: cleanUsername,
        coins: 100,
        avatar: '🎮',
        badge: 'Tân thủ'
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Đã xảy ra lỗi máy chủ trong quá trình đăng ký!' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập tên tài khoản và mật khẩu!' });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ? COLLATE NOCASE').get(username.trim());
    if (!user) {
      return res.status(400).json({ error: 'Tài khoản hoặc mật khẩu không chính xác!' });
    }

    const match = bcrypt.compareSync(password, user.password_hash);
    if (!match) {
      return res.status(400).json({ error: 'Tài khoản hoặc mật khẩu không chính xác!' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: user.id,
        username: user.username,
        coins: user.coins,
        avatar: user.avatar,
        badge: user.badge
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ khi đăng nhập!' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, username, coins, avatar, badge, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Người dùng không tồn tại!' });
    }

    const inventory = db.prepare('SELECT item_id, item_type, bought_at FROM inventory WHERE user_id = ?').all(user.id);
    
    // Get user best scores per game
    const bestCaro = db.prepare('SELECT MAX(score) as best FROM scores WHERE user_id = ? AND game = ?').get(user.id, 'caro');
    const bestSnake = db.prepare('SELECT MAX(score) as best FROM scores WHERE user_id = ? AND game = ?').get(user.id, 'snake');
    const best2048 = db.prepare('SELECT MAX(score) as best FROM scores WHERE user_id = ? AND game = ?').get(user.id, '2048');

    // Get daily wheel status
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
      user,
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
    console.error('Me error:', err);
    res.status(500).json({ error: 'Lỗi lấy thông tin người dùng!' });
  }
});

// Update profile avatar/badge
router.put('/profile', authenticateToken, (req, res) => {
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
      return res.status(400).json({ error: 'Không có thông tin cần cập nhật!' });
    }

    params.push(req.user.id);
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const updatedUser = db.prepare('SELECT id, username, coins, avatar, badge FROM users WHERE id = ?').get(req.user.id);

    res.json({
      message: 'Cập nhật hồ sơ thành công!',
      user: updatedUser
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Lỗi cập nhật hồ sơ!' });
  }
});

module.exports = router;
