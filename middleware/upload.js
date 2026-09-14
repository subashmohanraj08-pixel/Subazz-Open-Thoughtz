const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

const makeStorage = (subfolder) => {
  const dest = path.join(__dirname, '..', 'uploads', subfolder);
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const uniqueName = crypto.randomBytes(16).toString('hex');
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uniqueName}${ext}`);
    },
  });
};

const fileFilterFactory = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`), false);
  }
};

const MAX_IMAGE_SIZE = (parseInt(process.env.MAX_IMAGE_SIZE_MB, 10) || 8) * 1024 * 1024;
const MAX_VIDEO_SIZE = (parseInt(process.env.MAX_VIDEO_SIZE_MB, 10) || 100) * 1024 * 1024;

const uploadAvatar = multer({
  storage: makeStorage('avatars'),
  fileFilter: fileFilterFactory(ALLOWED_IMAGE_TYPES),
  limits: { fileSize: MAX_IMAGE_SIZE },
});

const postMediaDest = path.join(__dirname, '..', 'uploads');
['images', 'videos'].forEach((f) => {
  const p = path.join(postMediaDest, f);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

const postMediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.fieldname === 'video' ? 'videos' : 'images';
    cb(null, path.join(postMediaDest, folder));
  },
  filename: (req, file, cb) => {
    const uniqueName = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueName}${ext}`);
  },
});

const uploadPostMedia = multer({
  storage: postMediaStorage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'image') return fileFilterFactory(ALLOWED_IMAGE_TYPES)(req, file, cb);
    if (file.fieldname === 'video') return fileFilterFactory(ALLOWED_VIDEO_TYPES)(req, file, cb);
    cb(new Error('Unexpected field'), false);
  },
  limits: { fileSize: MAX_VIDEO_SIZE },
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]);

module.exports = { uploadAvatar, uploadPostMedia };
