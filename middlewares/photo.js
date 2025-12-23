const multer = require('multer');
const sharp = require('sharp');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const r2 = require('../utils/r2Client');
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

exports.resizePhoto = (model, width, height, bucket) => {
  return catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    const resizedBuffer = await sharp(req.file.buffer)
      .resize(width, height || undefined)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();

    const key = `${req[`${model}Id`]}-${Date.now()}.jpeg`;

    await r2.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: resizedBuffer,
        ContentType: 'image/jpeg',
      })
    );

    req.file.r2key = key;
    next();
  });
};
