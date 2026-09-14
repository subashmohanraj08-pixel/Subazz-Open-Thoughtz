const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../services/emailService');

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sanitizeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  displayName: user.displayName,
  bio: user.bio,
  avatar: user.avatar,
  role: user.role,
  status: user.status,
  createdAt: user.createdAt,
});

// @route POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, displayName } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, email and password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Username or email is already in use.' });
    }

    const user = await User.create({
      username,
      email,
      password,
      displayName: displayName || username,
    });

    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
      return res.status(400).json({ success: false, message: 'Email/username and password are required.' });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername }],
    }).select('+password');

    // Same generic message whether user doesn't exist or password is wrong,
    // to avoid leaking which emails are registered.
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'Your account has been blocked. Contact support.' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account is suspended.' });
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);
    res.json({ success: true, token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    res.json({ success: true, user: sanitizeUser(req.user) });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });

    // Always respond success to avoid leaking whether an email is registered.
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists for that email, a reset link has been sent.',
      });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_RESET_SECRET, {
      expiresIn: process.env.JWT_RESET_EXPIRES_IN || '15m',
    });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    const { sentViaRealSmtp } = await sendPasswordResetEmail(user.email, user.username, resetUrl);

    res.json({
      success: true,
      message: 'If an account exists for that email, a reset link has been sent.',
      // devResetUrl is only surfaced when SMTP isn't configured, so local testing
      // still works without setting up a real mail provider. Real deployments with
      // SMTP configured will never include this field.
      ...(!sentViaRealSmtp && process.env.NODE_ENV !== 'production' && { devResetUrl: resetUrl }),
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
    } catch (e) {
      return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired.' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password has been reset. You can now log in.' });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/logout
// JWTs are stateless; logout is handled client-side by discarding the token.
// This endpoint exists for symmetry / future token-blacklisting support.
exports.logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out.' });
};
