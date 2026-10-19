const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Lesson 4 - MongoDB Schema & Lesson 6 - Authorization & Lesson 7 - Hash password
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Tên tài khoản là bắt buộc!'],
    unique: true,
    trim: true,
    minlength: [3, 'Tên tài khoản tối thiểu 3 ký tự!'],
    maxlength: [20, 'Tên tài khoản tối đa 20 ký tự!']
  },
  password: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc!'],
    minlength: [6, 'Mật khẩu tối thiểu 6 ký tự!']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user' // Lesson 6: Phân quyền Authorization (user/admin)
  },
  coins: {
    type: Number,
    default: 100,
    min: 0
  },
  avatar: {
    type: String,
    default: '🎮'
  },
  badge: {
    type: String,
    default: 'Tân thủ'
  }
}, {
  timestamps: true // Tự động tạo createdAt và updatedAt
});

// Hash password before saving (Lesson 7)
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to verify password (Lesson 7)
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
