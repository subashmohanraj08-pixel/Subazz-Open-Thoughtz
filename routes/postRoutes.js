const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const { protect, optionalAuth } = require('../middleware/auth');
const { requireOwnershipOrAdmin } = require('../middleware/rbac');
const { uploadPostMedia } = require('../middleware/upload');
const Post = require('../models/Post');

router.get('/', optionalAuth, postController.getFeed);
router.get('/search', postController.searchPosts);
router.get('/:id', optionalAuth, postController.getPostById);

router.post('/', protect, uploadPostMedia, postController.createPost);

// Ownership (or admin) is verified server-side before any mutation is allowed -
// this is what stops "DELETE /posts/anotherUserPost" from another user.
router.put('/:id', protect, requireOwnershipOrAdmin(Post, 'author'), uploadPostMedia, postController.updatePost);
router.delete('/:id', protect, requireOwnershipOrAdmin(Post, 'author'), postController.deletePost);

router.post('/:id/like', protect, postController.likePost);
router.delete('/:id/like', protect, postController.unlikePost);
router.post('/:id/save', protect, postController.savePost);
router.delete('/:id/save', protect, postController.unsavePost);
router.post('/:id/share', protect, postController.sharePost);

// Comments nested under a post
router.get('/:postId/comments', commentController.getComments);
router.post('/:postId/comments', protect, commentController.createComment);

module.exports = router;
