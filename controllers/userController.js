const User = require('../models/User');
const Follow = require('../models/Follow');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

// @route GET /api/users/:username
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    let isFollowing = false;
    if (req.user) {
      isFollowing = !!(await Follow.findOne({ follower: req.user._id, following: user._id }));
    }

    res.json({ success: true, user: user.toPublicJSON(), isFollowing, isSelf: req.user?._id.toString() === user._id.toString() });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/users/me
// A user may only ever update the document belonging to req.user (from the verified JWT) -
// there is no userId taken from the request body, so this cannot touch another account.
exports.updateMe = async (req, res, next) => {
  try {
    const allowedFields = ['displayName', 'bio', 'avatar', 'coverImage'];
    const updates = {};
    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/users/me/avatar
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true });
    res.json({ success: true, avatar: avatarUrl, user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/users/:username/follow
exports.followUser = async (req, res, next) => {
  try {
    const target = await User.findOne({ username: req.params.username });
    if (!target) return res.status(404).json({ success: false, message: 'User not found.' });
    if (target._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself.' });
    }

    const existing = await Follow.findOne({ follower: req.user._id, following: target._id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Already following this user.' });
    }

    await Follow.create({ follower: req.user._id, following: target._id });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: target._id } });
    await User.findByIdAndUpdate(target._id, { $addToSet: { followers: req.user._id } });

    await Notification.create({
      recipient: target._id,
      sender: req.user._id,
      type: 'follow',
      message: `${req.user.username} started following you.`,
    });

    res.json({ success: true, message: 'Followed successfully.' });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/users/:username/follow
exports.unfollowUser = async (req, res, next) => {
  try {
    const target = await User.findOne({ username: req.params.username });
    if (!target) return res.status(404).json({ success: false, message: 'User not found.' });

    await Follow.findOneAndDelete({ follower: req.user._id, following: target._id });
    await User.findByIdAndUpdate(req.user._id, { $pull: { following: target._id } });
    await User.findByIdAndUpdate(target._id, { $pull: { followers: req.user._id } });

    res.json({ success: true, message: 'Unfollowed successfully.' });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/users/:username/posts
exports.getUserPosts = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;

    const posts = await Post.find({ author: user._id, isHidden: false })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'username displayName avatar')
      .populate('category', 'name emoji slug');

    res.json({ success: true, posts, page });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/users/me/saved
exports.getSavedPosts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedPosts',
      populate: [
        { path: 'author', select: 'username displayName avatar' },
        { path: 'category', select: 'name emoji slug' },
      ],
      options: { sort: { createdAt: -1 } },
    });
    res.json({ success: true, posts: user.savedPosts });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/users/search?q=
exports.searchUsers = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    const users = await User.find({
      $or: [{ username: new RegExp(q, 'i') }, { displayName: new RegExp(q, 'i') }],
    })
      .limit(20)
      .select('username displayName avatar bio');
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};
