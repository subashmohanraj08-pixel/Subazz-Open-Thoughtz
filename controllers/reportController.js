const Report = require('../models/Report');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');

// @route POST /api/reports
exports.createReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason, details } = req.body;
    if (!['post', 'comment', 'user'].includes(targetType)) {
      return res.status(400).json({ success: false, message: 'Invalid target type.' });
    }
    const validReasons = ['spam', 'harassment', 'hate_abuse', 'misinformation', 'inappropriate', 'other'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({ success: false, message: 'Invalid reason.' });
    }

    const Model = { post: Post, comment: Comment, user: User }[targetType];
    const target = await Model.findById(targetId);
    if (!target) return res.status(404).json({ success: false, message: 'Reported content not found.' });

    const report = await Report.create({
      reporter: req.user._id,
      targetType,
      targetId,
      reason,
      details,
    });

    res.status(201).json({ success: true, report });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/reports/mine
exports.getMyReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ reporter: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, reports });
  } catch (err) {
    next(err);
  }
};
