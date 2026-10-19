const mongoose = require('mongoose');

// Lesson 4 - MongoDB Item Model
const ItemSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['avatar', 'badge'],
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Item || mongoose.model('Item', ItemSchema);
