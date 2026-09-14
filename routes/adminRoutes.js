const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// Every single route below requires a valid JWT AND role === 'admin'.
router.use(protect, requireRole('admin'));

router.get('/stats', admin.getStats);

router.get('/users', admin.getAllUsers);
router.get('/users/:id', admin.getUserById);
router.put('/users/:id', admin.updateUser);
router.put('/users/:id/suspend', admin.suspendUser);
router.put('/users/:id/block', admin.blockUser);
router.put('/users/:id/reactivate', admin.reactivateUser);
router.delete('/users/:id', admin.deleteUser);

router.get('/posts', admin.getAllPosts);
router.put('/posts/:id', admin.adminUpdatePost);
router.put('/posts/:id/hide', admin.hidePost);
router.put('/posts/:id/unhide', admin.unhidePost);
router.delete('/posts/:id', admin.adminDeletePost);

router.get('/comments', admin.getAllComments);
router.put('/comments/:id', admin.adminUpdateComment);
router.delete('/comments/:id', admin.adminDeleteComment);

router.get('/reports', admin.getAllReports);
router.put('/reports/:id', admin.updateReportStatus);

module.exports = router;
