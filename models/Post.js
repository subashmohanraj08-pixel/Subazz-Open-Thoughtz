const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, trim: true, maxlength: 150, default: '' },
    content: { type: String, required: [true, 'Post content is required'], maxlength: 5000 },
    image: { type: String, default: '' },
    video: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    savesCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    isHidden: { type: Boolean, default: false }, // admin moderation
    hiddenReason: { type: String, default: '' },
  },
  { timestamps: true }
);

PostSchema.index({ content: 'text', title: 'text' });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ likesCount: -1 });

module.exports = mongoose.model('Post', PostSchema);
