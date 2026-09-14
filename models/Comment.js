const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: [true, 'Comment content is required'], maxlength: 1000 },
    isEdited: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CommentSchema.index({ post: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', CommentSchema);
