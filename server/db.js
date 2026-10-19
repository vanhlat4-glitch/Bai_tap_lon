const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'database.sqlite');
const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys for speed and reliability
db.exec('PRAGMA foreign_keys = ON;');

// Initialize tables
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      coins INTEGER DEFAULT 100,
      avatar TEXT DEFAULT '🎮',
      badge TEXT DEFAULT 'Tân thủ',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      game TEXT NOT NULL,
      score INTEGER NOT NULL,
      details TEXT,
      played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_id TEXT NOT NULL,
      item_type TEXT NOT NULL,
      bought_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, item_id)
    );

    CREATE TABLE IF NOT EXISTS daily_wheel (
      user_id INTEGER PRIMARY KEY,
      last_free_spin DATETIME,
      total_spins INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_scores_game ON scores(game, score DESC);
    CREATE INDEX IF NOT EXISTS idx_scores_user ON scores(user_id);
  `);

  // Seed sample users & high scores if database is new
  const checkUser = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (checkUser.count === 0) {
    console.log('Seeding initial demo data...');
    const defaultPassword = bcrypt.hashSync('123456', 10);
    
    const insertUser = db.prepare(`
      INSERT INTO users (username, password_hash, coins, avatar, badge) 
      VALUES (?, ?, ?, ?, ?)
    `);

    const admin = insertUser.run('admin', defaultPassword, 1500, '👑', 'Admin VIP');
    const dragon = insertUser.run('DragonSlayer', defaultPassword, 850, '🐉', 'Bá Chủ 2048');
    const cyber = insertUser.run('CyberNinja', defaultPassword, 620, '🥷', 'Thần Rắn');
    const chessPro = insertUser.run('ChessMaster', defaultPassword, 490, '⚡', 'Bậc Thầy Caro');
    const luckyGirl = insertUser.run('LuckyStar', defaultPassword, 300, '🌟', 'Tân thủ');

    // Add some items to admin inventory
    const insertInv = db.prepare('INSERT OR IGNORE INTO inventory (user_id, item_id, item_type) VALUES (?, ?, ?)');
    insertInv.run(admin.lastInsertRowid, 'avatar_crown', 'avatar');
    insertInv.run(admin.lastInsertRowid, 'badge_admin', 'badge');

    // Seed top scores
    const insertScore = db.prepare(`
      INSERT INTO scores (user_id, game, score, details, played_at) 
      VALUES (?, ?, ?, ?, datetime('now', ?))
    `);

    // Caro scores (Wins count / points)
    insertScore.run(chessPro.lastInsertRowid, 'caro', 15, 'Thắng liên tiếp AI Hard', '-1 day');
    insertScore.run(dragon.lastInsertRowid, 'caro', 12, 'Thắng 12 trận', '-2 days');
    insertScore.run(cyber.lastInsertRowid, 'caro', 8, 'Thắng 8 trận', '-3 hours');
    insertScore.run(admin.lastInsertRowid, 'caro', 20, 'Bất bại 20 trận', '-30 minutes');

    // Snake scores
    insertScore.run(cyber.lastInsertRowid, 'snake', 420, 'Độ dài rắn: 42', '-5 hours');
    insertScore.run(dragon.lastInsertRowid, 'snake', 350, 'Độ dài rắn: 35', '-1 day');
    insertScore.run(admin.lastInsertRowid, 'snake', 510, 'Kỷ lục săn táo vàng', '-2 hours');
    insertScore.run(luckyGirl.lastInsertRowid, 'snake', 180, 'Độ dài rắn: 18', '-10 minutes');

    // 2048 scores
    insertScore.run(dragon.lastInsertRowid, '2048', 28420, 'Tạo được ô 2048', '-4 hours');
    insertScore.run(admin.lastInsertRowid, '2048', 35200, 'Tạo được ô 4096', '-1 hour');
    insertScore.run(chessPro.lastInsertRowid, '2048', 14320, 'Tạo được ô 1024', '-1 day');
    insertScore.run(cyber.lastInsertRowid, '2048', 9600, 'Tạo được ô 512', '-2 days');

    console.log('Demo data seeded successfully!');
  }
}

initDatabase();

module.exports = db;
