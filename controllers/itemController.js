const itemService = require('../services/itemService');
const responseFactory = require('../factories/responseFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const getSignedImageUrl = require('../utils/getSignedImageUrl');

exports.getAllItems = catchAsync(async (req, res) => {
  const limit = Number.parseInt(req.query.limit, 10);
  const take = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 20;

  let cursor = null;
  if (req.query.cursor) {
    try {
      const json = Buffer.from(req.query.cursor, 'base64url').toString('utf8');
      cursor = JSON.parse(json);
    } catch {
      throw new AppError('Invalid cursor.', 400);
    }
  }

  const { items: itemsDocs, nextCursor } = await itemService.getAllItems(
    cursor,
    take,
  );

  const items = itemsDocs.map((doc) => doc.toObject());

  if (items.length > 0) {
    await Promise.all(
      items.map(async (item) => {
        if (item.photoBlob) {
          item.photo = await getSignedImageUrl(
            item.photoBlob,
            300,
            'ubior-item-photos',
          );
          item.photoBlob = undefined;
        }

        if (item.user?.photoBlob) {
          item.user.photo = await getSignedImageUrl(
            item.user.photoBlob,
            300,
            'ubior-user-photos',
          );
          item.user.photoBlob = undefined;
        }
      }),
    );
  }

  res.status(200).json(
    responseFactory.createResponse({
      items,
      pagination: {
        limit: take,
        nextCursor: nextCursor
          ? Buffer.from(JSON.stringify(nextCursor), 'utf8').toString(
              'base64url',
            )
          : null,
      },
    }),
  );
});

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
