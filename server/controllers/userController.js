const db = require('../db');

// @desc    Get all users with Search, Filter, Sort & Pagination (Lesson 11 - Data management & Lesson 6 - Authorization)
// @route   GET /api/users
// @access  Admin only
exports.getAllUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const search = req.query.search ? req.query.search.trim() : '';
    const sortBy = ['coins', 'created_at', 'username'].includes(req.query.sortBy) ? req.query.sortBy : 'created_at';
    const order = req.query.order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    let countQuery = 'SELECT COUNT(*) as total FROM users';
    let dataQuery = 'SELECT id, username, coins, avatar, badge, created_at FROM users';
    const params = [];

    if (search) {
      countQuery += ' WHERE username LIKE ?';
      dataQuery += ' WHERE username LIKE ?';
      params.push(`%${search}%`);
    }

    const total = db.prepare(countQuery).get(...params).total;

    dataQuery += ` ORDER BY ${sortBy} ${order} LIMIT ? OFFSET ?`;
    const users = db.prepare(dataQuery).all(...params, limit, offset);

    res.json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single user details & game history (Lesson 9 - Database Relationships)
// @route   GET /api/users/:id
// @access  Admin or Self
exports.getUserById = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const user = db.prepare('SELECT id, username, coins, avatar, badge, created_at FROM users WHERE id = ?').get(targetId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng!' });
    }

    // Relationship: Get scores and items owned by user (Lesson 9)
    const scores = db.prepare('SELECT id, game, score, details, played_at FROM scores WHERE user_id = ? ORDER BY played_at DESC LIMIT 10').all(targetId);
    const inventory = db.prepare('SELECT item_id, item_type, bought_at FROM inventory WHERE user_id = ?').all(targetId);

    res.json({
      success: true,
      user,
      relationships: {
        recentScores: scores,
        inventory
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user coins or badge (Admin action - Lesson 11)
// @route   PUT /api/users/:id
// @access  Admin only
exports.updateUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const { coins, badge } = req.body;

    const updates = [];
    const params = [];

    if (coins !== undefined) {
      updates.push('coins = ?');
      params.push(Math.max(0, parseInt(coins, 10) || 0));
    }
    if (badge) {
      updates.push('badge = ?');
      params.push(badge.trim());
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'Không có dữ liệu cập nhật!' });
    }

    params.push(targetId);
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const updated = db.prepare('SELECT id, username, coins, avatar, badge FROM users WHERE id = ?').get(targetId);

    res.json({
      success: true,
      message: 'Cập nhật người dùng thành công!',
      user: updated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user (Admin action - Lesson 11)
// @route   DELETE /api/users/:id
// @access  Admin only
exports.deleteUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    if (parseInt(targetId, 10) === req.user.id) {
      return res.status(400).json({ success: false, error: 'Không thể tự xóa tài khoản của chính mình!' });
    }

    const info = db.prepare('DELETE FROM users WHERE id = ?').run(targetId);

    if (info.changes === 0) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng để xóa!' });
    }

    res.json({
      success: true,
      message: `Đã xóa người dùng #${targetId} thành công!`
    });
  } catch (err) {
    next(err);
  }
};
