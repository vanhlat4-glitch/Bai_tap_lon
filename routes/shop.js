const express = require('express');
const router = express.Router();
const { sqliteDb: db } = require('../database/db');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Shop Catalog
const SHOP_ITEMS = [
  // Avatars
  { id: 'avatar_fox', name: 'Hồ Ly Tinh Anh', type: 'avatar', icon: '🦊', price: 150, description: 'Avatar Cáo thông minh, nhanh nhẹn' },
  { id: 'avatar_robot', name: 'Cyber Mech 3000', type: 'avatar', icon: '🤖', price: 220, description: 'Robot tương lai bách chiến bách thắng' },
  { id: 'avatar_lightning', name: 'Lôi Thần Sấm Sét', type: 'avatar', icon: '⚡', price: 280, description: 'Nhanh như chớp, phản xạ vô đối' },
  { id: 'avatar_dragon', name: 'Hỏa Long Huyền Thoại', type: 'avatar', icon: '🐉', price: 380, description: 'Rồng thần uy lực tối thượng' },
  { id: 'avatar_wizard', name: 'Pháp Sư Tối Thượng', type: 'avatar', icon: '🧙‍♂️', price: 180, description: 'Khai mở trí tuệ thần bí' },
  { id: 'avatar_unicorn', name: 'Kỳ Lân May Mắn', type: 'avatar', icon: '🦄', price: 320, description: 'Biểu tượng của may mắn bất tận' },
  { id: 'avatar_king', name: 'Vương Giả Tối Cao', type: 'avatar', icon: '👑', price: 500, description: 'Vương miện vàng dành riêng cho nhà vô địch' },
  { id: 'avatar_ninja', name: 'Bóng Ma Ninja', type: 'avatar', icon: '🥷', price: 260, description: 'Ẩn hiện khó lường trong từng nước đi' },

  // Badges / Titles
  { id: 'badge_reflex', name: 'Chúa Tể Phản Xạ', type: 'badge', icon: '🎯', price: 180, description: 'Danh hiệu cho cao thủ ngón tay thần tốc' },
  { id: 'badge_tactician', name: 'Chiến Lược Gia', type: 'badge', icon: '🧠', price: 250, description: 'Tính toán từng nước đi chính xác' },
  { id: 'badge_unbeatable', name: 'Bất Bại Cao Thủ', type: 'badge', icon: '🔥', price: 350, description: 'Danh hiệu khiến mọi đối thủ dè chừng' },
  { id: 'badge_2048_master', name: 'Huyền Thoại 2048', type: 'badge', icon: '💎', price: 400, description: 'Đỉnh cao tư duy toán học' },
  { id: 'badge_millionaire', name: 'Đại Gia Phố Cổ', type: 'badge', icon: '💰', price: 600, description: 'Danh hiệu vương giả rủng rỉnh túi tiền' },
  { id: 'badge_god_gamer', name: 'Thần Thoại Gaming', type: 'badge', icon: '🏆', price: 750, description: 'Danh hiệu quyền lực tối cao của Game Hub' }
];

// Get shop items with ownership status for logged in user
router.get('/items', (req, res) => {
  res.json({ items: SHOP_ITEMS });
});

// Purchase an item
router.post('/buy', authenticateToken, (req, res) => {
  try {
    const { itemId, equipNow } = req.body;
    const userId = req.user.id;

    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({ error: 'Vật phẩm không tồn tại trong Cửa Hàng!' });
    }

    // Check if user already owns the item
    const owned = db.prepare('SELECT id FROM inventory WHERE user_id = ? AND item_id = ?').get(userId, itemId);
    if (owned) {
      return res.status(400).json({ error: 'Bạn đã sở hữu vật phẩm này rồi!' });
    }

    // Check user coins
    const user = db.prepare('SELECT coins FROM users WHERE id = ?').get(userId);
    if (user.coins < item.price) {
      return res.status(400).json({ 
        error: `Không đủ xu! Bạn có ${user.coins} xu, còn thiếu ${item.price - user.coins} xu nữa.` 
      });
    }

    // Deduct coins & add to inventory
    db.prepare('UPDATE users SET coins = coins - ? WHERE id = ?').run(item.price, userId);
    db.prepare('INSERT INTO inventory (user_id, item_id, item_type) VALUES (?, ?, ?)').run(userId, item.id, item.type);

    // Auto equip if requested
    if (equipNow) {
      if (item.type === 'avatar') {
        db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(item.icon, userId);
      } else if (item.type === 'badge') {
        db.prepare('UPDATE users SET badge = ? WHERE id = ?').run(item.name, userId);
      }
    }

    const updatedUser = db.prepare('SELECT id, username, coins, avatar, badge FROM users WHERE id = ?').get(userId);
    const updatedInventory = db.prepare('SELECT item_id, item_type FROM inventory WHERE user_id = ?').all(userId);

    res.json({
      message: `🎉 Chúc mừng! Bạn đã mua thành công "${item.name}"!`,
      user: updatedUser,
      inventory: updatedInventory,
      boughtItem: item
    });
  } catch (err) {
    console.error('Buy error:', err);
    res.status(500).json({ error: 'Lỗi giao dịch mua vật phẩm!' });
  }
});

module.exports = { router, SHOP_ITEMS };
