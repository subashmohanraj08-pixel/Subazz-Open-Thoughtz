const Category = require('../models/Category');

// @route GET /api/categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/categories (admin only - enforced by route middleware)
exports.createCategory = async (req, res, next) => {
  try {
    const { name, emoji, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required.' });

    const category = await Category.create({ name, emoji, description });
    res.status(201).json({ success: true, category });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/categories/:id (admin only)
exports.updateCategory = async (req, res, next) => {
  try {
    const { name, emoji, description } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, emoji, description },
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.json({ success: true, category });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/categories/:id (admin only)
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.json({ success: true, message: 'Category deleted.' });
  } catch (err) {
    next(err);
  }
};
