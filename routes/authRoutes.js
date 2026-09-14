const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const auth = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Stricter limiter on auth endpoints to slow brute-force attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, auth.register);
router.post('/login', authLimiter, auth.login);
router.post('/forgot-password', authLimiter, auth.forgotPassword);
router.post('/reset-password', authLimiter, auth.resetPassword);
router.post('/logout', protect, auth.logout);
router.get('/me', protect, auth.getMe);

module.exports = router;
