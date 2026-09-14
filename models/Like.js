const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  },
  { timestamps: true }
);

// A user can only like a given post once
LikeSchema.index({ user: 1, post: 1 }, { unique: true });

module.exports = mongoose.model('Like', LikeSchema);
