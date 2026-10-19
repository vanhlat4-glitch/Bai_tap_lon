// Lesson 5 - Mô hình MVC: Centralized Error Handler Middleware
function errorHandler(err, req, res, next) {
  console.error('[Error Handler]:', err.message || err);

  // Multer errors (File size, file type)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'Kích thước file ảnh vượt quá giới hạn tối đa (5MB)!'
      });
    }
    return res.status(400).json({
      success: false,
      error: `Lỗi tải file: ${err.message}`
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      error: messages.join(', ')
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: 'Dữ liệu đã tồn tại trong hệ thống (trùng lặp giá trị unique)!'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Đã xảy ra sự cố nội bộ máy chủ!'
  });
}

module.exports = { errorHandler };
