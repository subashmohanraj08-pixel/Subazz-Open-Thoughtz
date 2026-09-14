const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const { requireOwnershipOrAdmin } = require('../middleware/rbac');
const Comment = require('../models/Comment');

// A user may only edit/delete a comment they authored (or an admin can).
router.put('/:id', protect, requireOwnershipOrAdmin(Comment, 'author'), commentController.updateComment);
router.delete('/:id', protect, requireOwnershipOrAdmin(Comment, 'author'), commentController.deleteComment);

module.exports = router;
