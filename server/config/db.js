const mongoose = require('mongoose');
require('dotenv').config();

let isConnected = false;

async function seedMongo() {
  try {
    const User = require('../models/User');
    const Score = require('../models/Score');
    const Item = require('../models/Item');

    const count = await User.countDocuments();
    if (count === 0) {
      console.log('Seeding initial MongoDB demo users (admin, DragonSlayer, etc.)...');
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

      // Seed sample scores with User relationship (Lesson 9)
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

async function connectDB() {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/minigame_hub';
  
  try {
    // Attempt MongoDB connection with 2.5s timeout so it doesn't block if local MongoDB is offline
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2500
    });
    isConnected = true;
    console.log(' MongoDB connected successfully via Mongoose (Lesson 4)!');
    await seedMongo();
  } catch (err) {
    console.warn('⚠️  MongoDB Local/Atlas not detected or timed out.');
    console.warn('ℹ️  Switching to high-performance fallback database layer (SQLite node:sqlite) so the app runs immediately without error!');
    isConnected = false;
  }
}

function getIsConnected() {
  return isConnected;
}

module.exports = { connectDB, getIsConnected };
