
const multer = require('multer');
const multerS3 = require('multer-s3');
const { s3 } = require('../utils/s3');
const { ApiError } = require('./errorHandler');
const path = require('path');
const crypto = require('crypto');

// Generate random filename
const generateFileName = (originalname) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalname);
  return `${timestamp}-${randomString}${extension}`;
};

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Invalid file type. Only JPEG, PNG, GIF and WebP images are allowed.'), false);
  }
};

// Create S3 upload middleware
const createS3Upload = (folder, fileSize = 5 * 1024 * 1024) => {
  return multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.AWS_S3_BUCKET,
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => {
        const fileName = generateFileName(file.originalname);
        const fullPath = `${folder}/${fileName}`;
        cb(null, fullPath);
      }
    }),
    limits: {
      fileSize: fileSize // Default 5MB
    },
    fileFilter: fileFilter
  });
};

// Middleware for various upload types
const uploadProfileImage = createS3Upload('profiles').single('avatar');
const uploadPostImage = createS3Upload('posts').single('image');
const uploadCampaignImage = createS3Upload('campaigns').single('image');
const uploadEventImage = createS3Upload('events').single('image');

// Handle multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large' });
    }
    return res.status(400).json({ message: err.message });
  }
  next(err);
};

module.exports = {
  uploadProfileImage,
  uploadPostImage,
  uploadCampaignImage,
  uploadEventImage,
  handleMulterError
};
