const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { uploadAvatar } = require('../middlewares/uploadMiddleware');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Lesson 10 - Upload file route
// Endpoint: POST /api/upload/avatar (form-data: avatar file)
router.post('/avatar', authenticateToken, uploadAvatar.single('avatar'), uploadController.uploadAvatar);

module.exports = router;
