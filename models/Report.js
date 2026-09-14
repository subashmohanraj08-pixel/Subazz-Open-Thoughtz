const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['post', 'comment', 'user'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: {
      type: String,
      enum: ['spam', 'harassment', 'hate_abuse', 'misinformation', 'inappropriate', 'other'],
      required: true,
    },
    details: { type: String, maxlength: 500, default: '' },
    status: { type: String, enum: ['pending', 'reviewed', 'action_taken', 'dismissed'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewNote: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', ReportSchema);
