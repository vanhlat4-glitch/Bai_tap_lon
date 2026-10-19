const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// Lesson 6 - Authorization (Role-based access: Admin only) & Lesson 11 - Data management
router.get('/admin/stats', authenticateToken, authorizeRoles('admin'), userController.getAdminStats);
router.delete('/scores/:id', authenticateToken, authorizeRoles('admin'), userController.deleteScore);
router.get('/', authenticateToken, authorizeRoles('admin'), userController.getAllUsers);
router.get('/:id', authenticateToken, userController.getUserById);
router.put('/:id', authenticateToken, authorizeRoles('admin'), userController.updateUser);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), userController.deleteUser);

module.exports = router;
