const mongoose = require('mongoose');

// Lesson 9 - Database Relationships (User has Many Items via Inventory)
const InventorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemId: {
    type: String,
    required: true
  },
  itemType: {
    type: String,
    enum: ['avatar', 'badge'],
    required: true
  }
}, {
  timestamps: true
});

InventorySchema.index({ user: 1, itemId: 1 }, { unique: true });

module.exports = mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema);
