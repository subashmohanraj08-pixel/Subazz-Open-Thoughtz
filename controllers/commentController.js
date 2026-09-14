const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

// @route GET /api/posts/:postId/comments
exports.getComments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const comments = await Comment.find({ post: req.params.postId, isHidden: false })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'username displayName avatar');

    res.json({ success: true, comments, page });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/posts/:postId/comments
exports.createComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required.' });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    const comment = await Comment.create({
      post: post._id,
      author: req.user._id, // always the authenticated user
      content,
    });

    post.commentsCount += 1;
    await post.save();

    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'comment',
        post: post._id,
        comment: comment._id,
        message: `${req.user.username} commented on your post.`,
      });
    }

    const populated = await comment.populate('author', 'username displayName avatar');
    res.status(201).json({ success: true, comment: populated });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/comments/:id
// Protected by requireOwnershipOrAdmin middleware upstream - req.resource is the comment.
exports.updateComment = async (req, res, next) => {
  try {
    const comment = req.resource;
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required.' });
    }

    comment.content = content;
    comment.isEdited = true;
    await comment.save();

    const populated = await comment.populate('author', 'username displayName avatar');
    res.json({ success: true, comment: populated });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/comments/:id
// Protected by requireOwnershipOrAdmin middleware upstream.
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = req.resource;
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });
    await comment.deleteOne();
    res.json({ success: true, message: 'Comment deleted.' });
  } catch (err) {
    next(err);
  }
};
