// Lesson 1 - Web service & Lesson 2 - ExpressJs & Lesson 7 - ENV
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Lesson 4 - MongoDB & Local Database
const { connectDB } = require('./config/db');
require('./db'); // Ensure fallback database engine is ready

// Lesson 5 - Mô hình MVC: Import Routes
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const userRoutes = require('./routes/userRoutes');
const gameRoutes = require('./routes/games');
const { router: shopRoutes } = require('./routes/shop');
const wheelRoutes = require('./routes/wheel');

// Lesson 5 - Middleware: Centralized Error Handler
const { errorHandler } = require('./middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Database connection (Lesson 4)
connectDB();

// Global Middlewares (Lesson 2, 5)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lesson 10 - Upload file: Serve uploaded avatars statically
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Serve React build if frontend/dist exists, otherwise serve client/
const reactDist = path.join(__dirname, '../frontend/dist');
const clientStatic = fs.existsSync(reactDist) ? reactDist : path.join(__dirname, '../client');
app.use(express.static(clientStatic));

// Mount API Routes (Lesson 1, 2, 5)
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes); // Lesson 10 - Upload file
app.use('/api/users', userRoutes);   // Lesson 6 - Authorization & Lesson 11 - Data management
app.use('/api/games', gameRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/wheel', wheelRoutes);

// Health check / Service info endpoint (Lesson 1 - Web service)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    name: 'Cyber Minigame Hub API (React + Redux Toolkit Edition)',
    lessons: {
      lesson1_webService: 'RESTful API with JSON format',
      lesson2_expressJs: 'Express Router, Body Parser, Static Middleware',
      lesson4_mongoDB: 'Mongoose schemas & models (User, Score, Item, Inventory)',
      lesson5_mvc_middleware: 'Clean MVC (Models, Views, Controllers, Middlewares)',
      lesson6_auth_authorization: 'JWT Authentication & Role-based Access Control (Admin/User)',
      lesson7_hash_password_env: 'bcryptjs salt & hash, dotenv configuration',
      lesson8_token: 'JWT token signing, expiration and Bearer verification',
      lesson9_database_relationships: 'User hasMany Scores & Inventory (ObjectId refs & joins)',
      lesson10_upload_file: 'Multer image upload for custom profile avatars',
      lesson11_data_management: 'Pagination, Search, Filter & Admin CRUD',
      lesson13_redux_toolkit: 'Redux Toolkit Store, createSlice (auth, games, shop), Provider'
    }
  });
});

// Fallback to React index.html for Single Page Application
app.get('*', (req, res) => {
  res.sendFile(path.join(clientStatic, 'index.html'));
});

// Centralized error handler (Must be placed after all routes - Lesson 5)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Cyber Minigame Hub Server is running!`);
  console.log(`🌐 Local URL:       http://localhost:${PORT}`);
  console.log(`📡 API Base:        http://localhost:${PORT}/api`);
  console.log(`📁 File Uploads:    http://localhost:${PORT}/uploads`);
  console.log(`📑 Health & Course: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
