const mongoose = require('mongoose');

// Lesson 4 - MongoDB & Lesson 9 - Database Relationships (ref: 'User')
const ScoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Lesson 9: Relationship 1-N giữa User và Scores
    required: true
  },
  game: {
    type: String,
    enum: ['caro', 'snake', '2048', 'wheel'],
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  details: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

ScoreSchema.index({ game: 1, score: -1 });
ScoreSchema.index({ user: 1 });

module.exports = mongoose.models.Score || mongoose.model('Score', ScoreSchema);
