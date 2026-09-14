const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.post('/', protect, reportController.createReport);
router.get('/mine', protect, reportController.getMyReports);

module.exports = router;
