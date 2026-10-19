const express = require('express');
const router = express.Router();
const { sqliteDb: db } = require('../database/db');
const { optionalAuth, authenticateToken } = require('../middlewares/authMiddleware');

// Submit a game score & calculate coin rewards
router.post('/score', optionalAuth, (req, res) => {
  try {
    const { game, score, details } = req.body;

    if (!game || score === undefined || score === null) {
      return res.status(400).json({ error: 'Thiếu thông tin game hoặc điểm số!' });
    }

    const validGames = ['caro', 'snake', '2048', 'wheel'];
    if (!validGames.includes(game)) {
      return res.status(400).json({ error: 'Tên game không hợp lệ!' });
    }

    const numScore = Math.max(0, parseInt(score, 10) || 0);

    // If played as guest (not logged in)
    if (!req.user) {
      return res.json({
        message: 'Điểm số của bạn rất tuyệt! Hãy đăng nhập để lưu vào Bảng xếp hạng và nhận Xu thưởng!',
        isGuest: true,
        score: numScore,
        coinsEarned: 0
      });
    }

    const userId = req.user.id;

    // Calculate coin rewards based on performance
    let coinsEarned = 0;
    if (game === 'caro') {
      // score in caro represents wins or result: e.g. 1 for win AI, 2 for hard AI win
      if (numScore >= 1) {
        coinsEarned = (numScore === 2) ? 35 : 20; // Hard vs Normal AI
      }
    } else if (game === 'snake') {
      coinsEarned = Math.floor(numScore / 10);
      if (numScore >= 300) coinsEarned += 20; // Bonus for high score
    } else if (game === '2048') {
      coinsEarned = Math.floor(numScore / 150);
      if (numScore >= 2048) coinsEarned += 30; // Bonus for reaching 2048
    }

    // Cap single match earnings to prevent abuse
    coinsEarned = Math.min(coinsEarned, 200);

    // Check personal best
    const currentBest = db.prepare('SELECT MAX(score) as best FROM scores WHERE user_id = ? AND game = ?').get(userId, game);
    const isNewPersonalBest = !currentBest?.best || numScore > currentBest.best;

    // Save score
    db.prepare(`
      INSERT INTO scores (user_id, game, score, details, played_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).run(userId, game, numScore, details || '');

    // Add coins to user balance
    if (coinsEarned > 0) {
      db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(coinsEarned, userId);
    }

    const user = db.prepare('SELECT coins FROM users WHERE id = ?').get(userId);

    res.json({
      message: isNewPersonalBest ? '🎉 Kỷ lục cá nhân mới!' : 'Lưu kết quả thành công!',
      isNewPersonalBest,
      score: numScore,
      coinsEarned,
      totalCoins: user.coins
    });
  } catch (err) {
    console.error('Submit score error:', err);
    res.status(500).json({ error: 'Lỗi ghi nhận điểm số!' });
  }
});

// Get Leaderboard
router.get('/leaderboard', (req, res) => {
  try {
    const game = req.query.game || 'snake';

    let leaderboard = [];

    if (game === 'coins') {
      // Wealthiest players leaderboard
      leaderboard = db.prepare(`
        SELECT id as user_id, username, avatar, badge, coins as score, created_at as played_at
        FROM users
        ORDER BY coins DESC
        LIMIT 20
      `).all();
    } else if (game === 'all') {
      // Cross-game overall ranking: sum of high scores
      leaderboard = db.prepare(`
        SELECT u.id as user_id, u.username, u.avatar, u.badge,
               SUM(s.max_score) as score,
               COUNT(s.game) as games_played
        FROM users u
        JOIN (
          SELECT user_id, game, MAX(score) as max_score
          FROM scores
          GROUP BY user_id, game
        ) s ON u.id = s.user_id
        GROUP BY u.id
        ORDER BY score DESC
        LIMIT 20
      `).all();
    } else {
      // Specific game leaderboard: highest score per user
      leaderboard = db.prepare(`
        SELECT u.id as user_id, u.username, u.avatar, u.badge, 
               MAX(s.score) as score, s.details, MAX(s.played_at) as played_at
        FROM scores s
        JOIN users u ON s.user_id = u.id
        WHERE s.game = ?
        GROUP BY u.id
        ORDER BY score DESC
        LIMIT 20
      `).all(game);
    }

    // Attach ranks
    const ranked = leaderboard.map((item, index) => ({
      rank: index + 1,
      ...item
    }));

    res.json({
      game,
      leaderboard: ranked
    });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Lỗi lấy bảng xếp hạng!' });
  }
});

// Recent match history ticker
router.get('/history', (req, res) => {
  try {
    const history = db.prepare(`
      SELECT s.id, s.game, s.score, s.details, s.played_at,
             u.username, u.avatar, u.badge
      FROM scores s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.played_at DESC
      LIMIT 12
    `).all();

    res.json({ history });
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ error: 'Lỗi lấy lịch sử đấu!' });
  }
});

// Server Statistics
router.get('/stats', (req, res) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get()?.count || 0;
    const totalMatches = db.prepare('SELECT COUNT(*) as count FROM scores').get()?.count || 0;
    const bestSnake = db.prepare("SELECT MAX(score) as max FROM scores WHERE game = 'snake'").get()?.max || 0;
    const best2048 = db.prepare("SELECT MAX(score) as max FROM scores WHERE game = '2048'").get()?.max || 0;
    const bestCaro = db.prepare("SELECT MAX(score) as max FROM scores WHERE game = 'caro'").get()?.max || 0;

    res.json({
      totalUsers,
      totalMatches,
      records: {
        snake: bestSnake,
        game2048: best2048,
        caro: bestCaro
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Lỗi lấy số liệu thống kê!' });
  }
});

module.exports = router;
