const multer = require('multer');
const sharp = require('sharp');
const { put } = require('@vercel/blob');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) return cb(null, true);
  return cb(
    new AppError('Not an image! Please upload only images.', 400),
    false
  );
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPhoto = upload.single('photo');

exports.resizePhoto = (model, width, height) => {
  return catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    const resizedBuffer = await sharp(req.file.buffer)
      .resize(width, height || undefined)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();

    const blob = await put(
      `images/${model}s/${model}-${req[`${model}Id`]}-${Date.now()}.jpeg`,
      resizedBuffer,
      {
        access: 'public',
        contentType: 'image/jpeg',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      }
    );

    req.file.blobPath = blob.pathname;
    next();
  });
};
