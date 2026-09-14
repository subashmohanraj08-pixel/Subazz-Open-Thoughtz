const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

router.get('/search', userController.searchUsers);
router.get('/me/saved', protect, userController.getSavedPosts);
router.put('/me', protect, userController.updateMe);
router.post('/me/avatar', protect, uploadAvatar.single('avatar'), userController.uploadAvatar);

router.get('/:username', optionalAuth, userController.getProfile);
router.get('/:username/posts', userController.getUserPosts);
router.post('/:username/follow', protect, userController.followUser);
router.delete('/:username/follow', protect, userController.unfollowUser);

module.exports = router;
