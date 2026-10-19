// Lesson 6 - Authorization: Phân quyền vai trò (Role-based access control)
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Chưa xác thực người dùng!'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Truy cập bị từ chối! Yêu cầu quyền: [${allowedRoles.join(', ')}]. Vai trò hiện tại của bạn là: [${req.user.role || 'user'}].`
      });
    }

    next();
  };
}

module.exports = { authorizeRoles };
