const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    displayName: { type: String, trim: true, maxlength: 60 },
    bio: { type: String, trim: true, maxlength: 300, default: '' },
    avatar: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    status: { type: String, enum: ['active', 'suspended', 'blocked'], default: 'active' },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    postCount: { type: Number, default: 0 },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    username: this.username,
    displayName: this.displayName,
    bio: this.bio,
    avatar: this.avatar,
    coverImage: this.coverImage,
    role: this.role,
    followersCount: this.followers?.length || 0,
    followingCount: this.following?.length || 0,
    postCount: this.postCount,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', UserSchema);
