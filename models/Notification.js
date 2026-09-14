const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['like', 'comment', 'follow', 'mention', 'report_update'],
      required: true,
    },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
