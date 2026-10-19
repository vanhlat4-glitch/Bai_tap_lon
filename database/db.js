const mongoose = require('mongoose');
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

let isConnected = false;

// Ensure sqlite fallback directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.join(dataDir, 'database.sqlite');
const sqliteDb = new DatabaseSync(dbPath);
sqliteDb.exec('PRAGMA foreign_keys = ON;');

// Initialize SQLite fallback tables
function initSqlite() {
  sqliteDb.exec(`
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

    CREATE TABLE IF NOT EXISTS login_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      username TEXT NOT NULL,
      status TEXT NOT NULL,
      ip TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_scores_game ON scores(game, score DESC);
    CREATE INDEX IF NOT EXISTS idx_scores_user ON scores(user_id);
    CREATE INDEX IF NOT EXISTS idx_login_logs_time ON login_logs(created_at DESC);
  `);

  const checkUser = sqliteDb.prepare('SELECT COUNT(*) as count FROM users').get();
  if (checkUser.count === 0) {
    const hash = bcrypt.hashSync('123456', 10);
    const insert = sqliteDb.prepare(`
      INSERT INTO users (username, password_hash, coins, avatar, badge) 
      VALUES (?, ?, ?, ?, ?)
    `);
    const admin = insert.run('admin', hash, 1500, '👑', 'Admin VIP');
    const dragon = insert.run('DragonSlayer', hash, 850, '🐉', 'Bá Chủ 2048');
    const ninja = insert.run('CyberNinja', hash, 620, '🥷', 'Thần Rắn');

    const insertScore = sqliteDb.prepare(`
      INSERT INTO scores (user_id, game, score, details, played_at) 
      VALUES (?, ?, ?, ?, datetime('now', ?))
    `);
    insertScore.run(admin.lastInsertRowid, 'caro', 20, 'Bất bại 20 trận', '-1 hour');
    insertScore.run(dragon.lastInsertRowid, '2048', 28420, 'Tạo ô 2048', '-4 hours');
    insertScore.run(ninja.lastInsertRowid, 'snake', 420, 'Độ dài 42', '-5 hours');
  }

  // Seed sample login logs if empty
  const checkLogs = sqliteDb.prepare('SELECT COUNT(*) as count FROM login_logs').get();
  if (checkLogs.count === 0) {
    const insertLog = sqliteDb.prepare(`
      INSERT INTO login_logs (user_id, username, status, ip, user_agent, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now', ?))
    `);
    insertLog.run(1, 'admin', 'success', '127.0.0.1', 'Chrome/124.0.0', '-10 minutes');
    insertLog.run(2, 'DragonSlayer', 'success', '192.168.1.15', 'Firefox/125.0', '-45 minutes');
    insertLog.run(3, 'CyberNinja', 'success', '192.168.1.28', 'Edge/123.0', '-2 hours');
    insertLog.run(null, 'guest_hacker', 'failed', '10.0.0.99', 'Python-requests', '-3 hours');
    insertLog.run(1, 'admin', 'registered', '127.0.0.1', 'Chrome/124.0.0', '-1 day');
  }
}

initSqlite();

// Auto seed MongoDB (Lesson 4)
async function seedMongo() {
  try {
    const User = require('../models/User');
    const Score = require('../models/Score');

    const count = await User.countDocuments();
    if (count === 0) {
      console.log('Seeding initial MongoDB demo users (admin, DragonSlayer, CyberNinja)...');
      const admin = await User.create({
        username: 'admin',
        password: '123456',
        role: 'admin',
        coins: 1500,
        avatar: '👑',
        badge: 'Admin VIP'
      });

      const dragon = await User.create({
        username: 'DragonSlayer',
        password: '123456',
        role: 'user',
        coins: 850,
        avatar: '🐉',
        badge: 'Bá Chủ 2048'
      });

      const ninja = await User.create({
        username: 'CyberNinja',
        password: '123456',
        role: 'user',
        coins: 620,
        avatar: '🥷',
        badge: 'Thần Rắn'
      });

      await Score.create([
        { user: admin._id, game: 'caro', score: 20, details: 'Bất bại 20 trận' },
        { user: dragon._id, game: '2048', score: 28420, details: 'Tạo ô 2048' },
        { user: ninja._id, game: 'snake', score: 420, details: 'Độ dài 42' }
      ]);

      console.log('MongoDB demo data seeded successfully!');
    }
  } catch (err) {
    console.error('Error seeding MongoDB:', err);
  }
}

// Connect MongoDB via Mongoose (Lesson 4)
async function connectDB() {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/minigame_hub';
  try {
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 2500 });
    isConnected = true;
    console.log(' MongoDB connected successfully via Mongoose (Lesson 4)!');
    await seedMongo();
  } catch (err) {
    console.warn('⚠️  MongoDB Local/Atlas not detected or timed out.');
    console.warn('ℹ️  Using SQLite engine as instant fallback so the app runs everywhere without setup!');
    isConnected = false;
  }
}

function getIsConnected() {
  return isConnected;
}

module.exports = {
  connectDB,
  getIsConnected,
  sqliteDb
};
