const itemService = require('../services/itemService');
const responseFactory = require('../factories/responseFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const getSignedImageUrl = require('../utils/getSignedImageUrl');

exports.createItem = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload a photo for this item.', 400));
  }

  const data = {
    name: req.body.name,
    category: req.body.category,
    color: req.body.color,
    fabric: req.body.fabric,
    brand: req.body.brand,
  };
  const item = await itemService.createItem(req.user.id, data);

  req.item = item;
  req.itemId = item.id;

  next();
});

exports.finalizeItem = catchAsync(async (req, res) => {
  let item = req.item;

  if (req.file && req.itemId) {
    item = await itemService.updateItem(req.itemId, req.user.id, {
      photoBlob: req.file.r2key,
    });
    item = item.toObject();
  }

  if (item.photoBlob) {
    const key = item.photoBlob;
    const signedUrl = await getSignedImageUrl(key, 300, 'ubior-item-photos');
    item.photoBlob = undefined;
    item.photo = signedUrl;
  }

  res.status(201).json(responseFactory.createResponse({ item }));
});

exports.getItem = catchAsync(async (req, res) => {
  const itemDoc = await itemService.getItem(req.params.itemId, req.user.id);
  const item = itemDoc.toObject();

  const key = item.photoBlob;
  const signedUrl = await getSignedImageUrl(key, 300, 'ubior-item-photos');
  item.photoBlob = undefined;
  item.photo = signedUrl;

  res.status(200).json(responseFactory.createResponse({ item }));
});

exports.deleteItem = catchAsync(async (req, res) => {
  await itemService.deleteItem(req.params.itemId, req.user.id);
  res.status(204).json(responseFactory.createResponse(null));
});
