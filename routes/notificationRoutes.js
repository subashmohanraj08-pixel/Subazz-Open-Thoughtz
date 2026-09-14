const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, notificationController.getMyNotifications);
router.put('/read-all', protect, notificationController.markAllAsRead);
router.put('/:id/read', protect, notificationController.markAsRead);

module.exports = router;
