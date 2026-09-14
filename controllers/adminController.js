const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Report = require('../models/Report');
const Notification = require('../models/Notification');

// Every function here is mounted behind `protect` + `requireRole('admin')` in routes/adminRoutes.js.

// @route GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalPosts, totalComments, totalLikes, pendingReports, suspendedUsers] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Comment.countDocuments(),
      Like.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      User.countDocuments({ status: { $in: ['suspended', 'blocked'] } }),
    ]);

    const last7Days = await Post.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      stats: { totalUsers, totalPosts, totalComments, totalLikes, pendingReports, suspendedUsers },
      postsLast7Days: last7Days,
    });
  } catch (err) {
    next(err);
  }
};

// -------------------- USERS --------------------

// @route GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const q = req.query.q || '';

    const filter = q
      ? { $or: [{ username: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }] }
      : {};

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(filter);
    res.json({ success: true, users, page, totalPages: Math.ceil(total / limit), total });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/admin/users/:id
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/admin/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { displayName, bio, role, status } = req.body;
    const updates = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (bio !== undefined) updates.bio = bio;
    if (role !== undefined) updates.role = role;
    if (status !== undefined) updates.status = status;

    // Prevent an admin from accidentally demoting/suspending themselves out of the only admin seat.
    if (req.params.id === req.user._id.toString() && (updates.role === 'user' || updates.status !== 'active')) {
      const otherAdmins = await User.countDocuments({ role: 'admin', _id: { $ne: req.user._id } });
      if (otherAdmins === 0) {
        return res.status(400).json({
          success: false,
          message: 'You are the only admin. Promote another admin before changing your own role/status.',
        });
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/admin/users/:id/suspend
exports.suspendUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'suspended' }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: 'User suspended.', user });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/admin/users/:id/block
exports.blockUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'blocked' }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: 'User blocked.', user });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/admin/users/:id/reactivate
exports.reactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: 'User reactivated.', user });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account here.' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Cascade cleanup
    const posts = await Post.find({ author: user._id }).select('_id');
    const postIds = posts.map((p) => p._id);
    await Comment.deleteMany({ $or: [{ author: user._id }, { post: { $in: postIds } }] });
    await Like.deleteMany({ $or: [{ user: user._id }, { post: { $in: postIds } }] });
    await Post.deleteMany({ author: user._id });

    res.json({ success: true, message: 'User and their content deleted.' });
  } catch (err) {
    next(err);
  }
};

// -------------------- POSTS --------------------

// @route GET /api/admin/posts
exports.getAllPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const filter = {};
    if (req.query.hidden === 'true') filter.isHidden = true;

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'username displayName avatar')
      .populate('category', 'name emoji');

    const total = await Post.countDocuments(filter);
    res.json({ success: true, posts, page, totalPages: Math.ceil(total / limit), total });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/admin/posts/:id
exports.adminUpdatePost = async (req, res, next) => {
  try {
    const { content, title, category } = req.body;
    const updates = {};
    if (content !== undefined) updates.content = content;
    if (title !== undefined) updates.title = title;
    if (category !== undefined) updates.category = category;

    const post = await Post.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('author', 'username displayName avatar');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    res.json({ success: true, post });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/admin/posts/:id/hide
exports.hidePost = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { isHidden: true, hiddenReason: reason || 'Violates community guidelines' },
      { new: true }
    );
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    res.json({ success: true, message: 'Post hidden.', post });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/admin/posts/:id/unhide
exports.unhidePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { isHidden: false, hiddenReason: '' }, { new: true });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    res.json({ success: true, message: 'Post unhidden.', post });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/admin/posts/:id
exports.adminDeletePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    await Comment.deleteMany({ post: post._id });
    await Like.deleteMany({ post: post._id });
    await User.findByIdAndUpdate(post.author, { $inc: { postCount: -1 } });
    res.json({ success: true, message: 'Post deleted by admin.' });
  } catch (err) {
    next(err);
  }
};

// -------------------- COMMENTS --------------------

// @route GET /api/admin/comments
exports.getAllComments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 30;

    const comments = await Comment.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'username displayName avatar')
      .populate('post', 'content');

    const total = await Comment.countDocuments();
    res.json({ success: true, comments, page, totalPages: Math.ceil(total / limit), total });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/admin/comments/:id
exports.adminUpdateComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { content, isEdited: true },
      { new: true, runValidators: true }
    ).populate('author', 'username displayName avatar');
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });
    res.json({ success: true, comment });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/admin/comments/:id
exports.adminDeleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });
    res.json({ success: true, message: 'Comment deleted by admin.' });
  } catch (err) {
    next(err);
  }
};

// -------------------- REPORTS --------------------

// @route GET /api/admin/reports
exports.getAllReports = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .populate('reporter', 'username displayName avatar')
      .populate('reviewedBy', 'username');

    res.json({ success: true, reports });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/admin/reports/:id
exports.updateReportStatus = async (req, res, next) => {
  try {
    const { status, reviewNote } = req.body;
    const validStatuses = ['pending', 'reviewed', 'action_taken', 'dismissed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, reviewNote, reviewedBy: req.user._id },
      { new: true }
    );
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });

    await Notification.create({
      recipient: report.reporter,
      sender: req.user._id,
      type: 'report_update',
      message: `Your report has been reviewed: ${status.replace('_', ' ')}.`,
    });

    res.json({ success: true, report });
  } catch (err) {
    next(err);
  }
};
