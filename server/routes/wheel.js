const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const WHEEL_SEGMENTS = [
  { id: 0, label: '+10 Xu', type: 'coins', value: 10, color: '#f59e0b', weight: 30 },
  { id: 1, label: '+25 Xu', type: 'coins', value: 25, color: '#10b981', weight: 25 },
  { id: 2, label: '+50 Xu', type: 'coins', value: 50, color: '#3b82f6', weight: 15 },
  { id: 3, label: '🎁 Huy Hiệu Đỏ', type: 'badge', value: 'Vận May Đỏ', color: '#ec4899', weight: 5 },
  { id: 4, label: '+15 Xu', type: 'coins', value: 15, color: '#8b5cf6', weight: 25 },
  { id: 5, label: '💎 +100 Xu', type: 'coins', value: 100, color: '#06b6d4', weight: 8 },
  { id: 6, label: '💥 JACKPOT 300', type: 'coins', value: 300, color: '#ef4444', weight: 2 },
  { id: 7, label: '🍀 +80 Xu', type: 'coins', value: 80, color: '#14b8a6', weight: 10 }
];

// Get wheel segments configuration
router.get('/config', (req, res) => {
  res.json({
    segments: WHEEL_SEGMENTS.map(s => ({ id: s.id, label: s.label, color: s.color, type: s.type, value: s.value })),
    spinCost: 20,
    freeCooldownHours: 6
  });
});

// Spin the wheel
router.post('/spin', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const SPIN_COST = 20;

    // Check last free spin
    let wheelRow = db.prepare('SELECT last_free_spin, total_spins FROM daily_wheel WHERE user_id = ?').get(userId);
    if (!wheelRow) {
      db.prepare('INSERT INTO daily_wheel (user_id, last_free_spin, total_spins) VALUES (?, NULL, 0)').run(userId);
      wheelRow = { last_free_spin: null, total_spins: 0 };
    }

    let isFreeSpin = true;
    if (wheelRow.last_free_spin) {
      const lastTime = new Date(wheelRow.last_free_spin).getTime();
      const now = Date.now();
      const diffHours = (now - lastTime) / (1000 * 60 * 60);
      if (diffHours < 6) {
        isFreeSpin = false;
      }
    }

    const user = db.prepare('SELECT coins FROM users WHERE id = ?').get(userId);

    // If not free spin, deduct cost
    if (!isFreeSpin) {
      if (user.coins < SPIN_COST) {
        return res.status(400).json({
          error: `Bạn cần ${SPIN_COST} xu để quay thêm lượt (Hiện có: ${user.coins} xu)!`
        });
      }
      db.prepare('UPDATE users SET coins = coins - ? WHERE id = ?').run(SPIN_COST, userId);
    }

    // Weighted random selection
    const totalWeight = WHEEL_SEGMENTS.reduce((sum, s) => sum + s.weight, 0);
    let rand = Math.random() * totalWeight;
    let selectedSegment = WHEEL_SEGMENTS[0];

    for (const segment of WHEEL_SEGMENTS) {
      if (rand < segment.weight) {
        selectedSegment = segment;
        break;
      }
      rand -= segment.weight;
    }

    // Award reward
    if (selectedSegment.type === 'coins') {
      db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(selectedSegment.value, userId);
    } else if (selectedSegment.type === 'badge') {
      db.prepare('UPDATE users SET badge = ? WHERE id = ?').run(selectedSegment.value, userId);
      db.prepare('INSERT OR IGNORE INTO inventory (user_id, item_id, item_type) VALUES (?, ?, ?)')
        .run(userId, 'badge_lucky_wheel', 'badge');
    }

    // Update wheel stats & timestamps
    if (isFreeSpin) {
      db.prepare(`
        UPDATE daily_wheel 
        SET last_free_spin = datetime('now'), total_spins = total_spins + 1 
        WHERE user_id = ?
      `).run(userId);
    } else {
      db.prepare('UPDATE daily_wheel SET total_spins = total_spins + 1 WHERE user_id = ?').run(userId);
    }

    const updatedUser = db.prepare('SELECT coins, avatar, badge FROM users WHERE id = ?').get(userId);

    res.json({
      segmentId: selectedSegment.id,
      prize: selectedSegment,
      isFreeSpin,
      coinsSpent: isFreeSpin ? 0 : SPIN_COST,
      user: updatedUser,
      message: `🎉 Bạn đã trúng: ${selectedSegment.label}!`
    });
  } catch (err) {
    console.error('Wheel spin error:', err);
    res.status(500).json({ error: 'Lỗi khi quay vòng quay may mắn!' });
  }
});

module.exports = router;
