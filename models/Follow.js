const mongoose = require('mongoose');

const FollowSchema = new mongoose.Schema(
  {
    follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    following: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

module.exports = mongoose.model('Follow', FollowSchema);
