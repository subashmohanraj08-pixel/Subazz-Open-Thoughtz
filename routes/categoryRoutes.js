const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.get('/', categoryController.getCategories);
router.post('/', protect, requireRole('admin'), categoryController.createCategory);
router.put('/:id', protect, requireRole('admin'), categoryController.updateCategory);
router.delete('/:id', protect, requireRole('admin'), categoryController.deleteCategory);

module.exports = router;
