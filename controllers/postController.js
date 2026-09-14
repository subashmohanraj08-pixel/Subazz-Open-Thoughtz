const Post = require('../models/Post');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Notification = require('../models/Notification');

const populatePost = (query) =>
  query.populate('author', 'username displayName avatar').populate('category', 'name emoji slug');

// @route GET /api/posts  (main feed)
exports.getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { sort = 'latest', category } = req.query;

    const filter = { isHidden: false };
    if (category) filter.category = category;

    let sortOption = { createdAt: -1 };
    if (sort === 'trending' || sort === 'most_liked') sortOption = { likesCount: -1, createdAt: -1 };
    if (sort === 'most_commented') sortOption = { commentsCount: -1, createdAt: -1 };

    const posts = await populatePost(
      Post.find(filter)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit)
    );

    let likedPostIds = new Set();
    if (req.user) {
      const likes = await Like.find({ user: req.user._id, post: { $in: posts.map((p) => p._id) } });
      likedPostIds = new Set(likes.map((l) => l.post.toString()));
    }

    const enriched = posts.map((p) => ({
      ...p.toObject(),
      isLikedByMe: likedPostIds.has(p._id.toString()),
    }));

    const total = await Post.countDocuments(filter);
    res.json({ success: true, posts: enriched, page, totalPages: Math.ceil(total / limit), total });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/posts/search?q=
exports.searchPosts = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    const posts = await populatePost(
      Post.find({ $text: { $search: q }, isHidden: false }).limit(30)
    );
    res.json({ success: true, posts });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/posts/:id
exports.getPostById = async (req, res, next) => {
  try {
    const post = await populatePost(Post.findById(req.params.id));
    if (!post || (post.isHidden && req.user?.role !== 'admin')) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    let isLikedByMe = false;
    if (req.user) {
      isLikedByMe = !!(await Like.findOne({ user: req.user._id, post: post._id }));
    }

    res.json({ success: true, post: { ...post.toObject(), isLikedByMe } });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/posts
exports.createPost = async (req, res, next) => {
  try {
    const { content, title, category } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Post content is required.' });
    }

    const image = req.files?.image?.[0] ? `/uploads/images/${req.files.image[0].filename}` : '';
    const video = req.files?.video?.[0] ? `/uploads/videos/${req.files.video[0].filename}` : '';

    const post = await Post.create({
      author: req.user._id, // always the authenticated user - never trust a client-supplied author id
      content,
      title,
      category: category || undefined,
      image,
      video,
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { postCount: 1 } });

    const populated = await populatePost(Post.findById(post._id));
    res.status(201).json({ success: true, post: populated });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/posts/:id
// Protected by requireOwnershipOrAdmin middleware upstream - req.resource is the post.
exports.updatePost = async (req, res, next) => {
  try {
    const post = req.resource;
    const { content, title, category } = req.body;

    if (content !== undefined) post.content = content;
    if (title !== undefined) post.title = title;
    if (category !== undefined) post.category = category || undefined;

    if (req.files?.image?.[0]) post.image = `/uploads/images/${req.files.image[0].filename}`;
    if (req.files?.video?.[0]) post.video = `/uploads/videos/${req.files.video[0].filename}`;

    await post.save();
    const populated = await populatePost(Post.findById(post._id));
    res.json({ success: true, post: populated });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/posts/:id
// Protected by requireOwnershipOrAdmin middleware upstream.
exports.deletePost = async (req, res, next) => {
  try {
    const post = req.resource;
    await Comment.deleteMany({ post: post._id });
    await Like.deleteMany({ post: post._id });
    await User.findByIdAndUpdate(post.author, { $inc: { postCount: -1 } });
    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted.' });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/posts/:id/like
exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    const existing = await Like.findOne({ user: req.user._id, post: post._id });
    if (existing) return res.status(409).json({ success: false, message: 'Already liked.' });

    await Like.create({ user: req.user._id, post: post._id });
    post.likesCount += 1;
    await post.save();

    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'like',
        post: post._id,
        message: `${req.user.username} liked your post.`,
      });
    }

    res.json({ success: true, likesCount: post.likesCount, isLikedByMe: true });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/posts/:id/like
exports.unlikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    const existing = await Like.findOneAndDelete({ user: req.user._id, post: post._id });
    if (existing) {
      post.likesCount = Math.max(0, post.likesCount - 1);
      await post.save();
    }

    res.json({ success: true, likesCount: post.likesCount, isLikedByMe: false });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/posts/:id/save
exports.savePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    await User.findByIdAndUpdate(req.user._id, { $addToSet: { savedPosts: post._id } });
    post.savesCount += 1;
    await post.save();

    res.json({ success: true, message: 'Post saved.' });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/posts/:id/save
exports.unsavePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    await User.findByIdAndUpdate(req.user._id, { $pull: { savedPosts: post._id } });
    post.savesCount = Math.max(0, post.savesCount - 1);
    await post.save();

    res.json({ success: true, message: 'Post removed from saved.' });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/posts/:id/share
// Just increments a counter and returns a shareable link; actual sharing happens client-side.
exports.sharePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { sharesCount: 1 } }, { new: true });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    res.json({ success: true, sharesCount: post.sharesCount, shareUrl: `${process.env.CLIENT_URL}/post/${post._id}` });
  } catch (err) {
    next(err);
  }
};
