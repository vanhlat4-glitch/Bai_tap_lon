const { sqliteDb: db } = require('../database/db');

// @desc    Upload custom avatar image (Lesson 10 - Upload file)
// @route   POST /api/upload/avatar
// @access  Private
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng chọn một file ảnh để tải lên!'
      });
    }

    // Relative web URL to access the uploaded file
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Update avatar in database
    const userId = req.user.id;
    db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(avatarUrl, userId);

    const updatedUser = db.prepare('SELECT id, username, coins, avatar, badge FROM users WHERE id = ?').get(userId);

    res.json({
      success: true,
      message: '🎉 Tải ảnh đại diện lên thành công (Lesson 10 - Multer Upload)!',
      avatarUrl,
      fileInfo: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: `${(req.file.size / 1024).toFixed(2)} KB`,
        mimeType: req.file.mimetype
      },
      user: updatedUser
    });
  } catch (err) {
    next(err);
  }
};
