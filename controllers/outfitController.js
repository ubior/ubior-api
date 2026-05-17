const outfitService = require('../services/outfitService');
const responseFactory = require('../factories/responseFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const getSignedImageUrl = require('../utils/getSignedImageUrl');

exports.createOutfit = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload a photo for this outfit.', 400));
  }

  const data = {
    name: req.body.name,
    category: req.body.category,
    items: req.body.items,
  };
  const outfit = await outfitService.createOutfit(req.user.id, data);

  req.outfit = outfit;
  req.outfitId = outfit.id;

  next();
});

exports.finalizeOutfit = catchAsync(async (req, res) => {
  let outfit = req.outfit;

  if (req.file && req.outfitId) {
    outfit = await outfitService.updateOutfit(req.outfitId, req.user.id, {
      photoBlob: req.file.r2key,
    });
  }

  res.status(201).json(responseFactory.createResponse({ outfit }));
});

exports.getMyOutfits = catchAsync(async (req, res) => {
  const outfitsDocs = await outfitService.getMyOutfits(req.user.id);
  const outfits = outfitsDocs.map((doc) => doc.toObject());

  if (Array.isArray(outfits) && outfits.length > 0) {
    await Promise.all(
      outfits.map(async (outfit) => {
        outfit.itemsCount = Array.isArray(outfit.items)
          ? outfit.items.length
          : 0;
        outfit.items = undefined;

        if (outfit.photoBlob) {
          outfit.photo = await getSignedImageUrl(
            outfit.photoBlob,
            300,
            'ubior-outfit-photos',
          );
          outfit.photoBlob = undefined;
        }
      }),
    );
  }

  res.status(200).json(responseFactory.createResponse({ outfits }, true));
});

exports.getOutfit = catchAsync(async (req, res) => {
  const outfitDoc = await outfitService.getOutfit(
    req.params.outfitId,
    req.user.id,
  );
  const outfit = outfitDoc.toObject();

  const key = outfit.photoBlob;
  const signedUrl = await getSignedImageUrl(key, 300, 'ubior-outfit-photos');
  outfit.photoBlob = undefined;
  outfit.photo = signedUrl;

  if (Array.isArray(outfit.items)) {
    await Promise.all(
      outfit.items.map(async (item) => {
        if (!item?.photoBlob) return;

        item.photo = await getSignedImageUrl(
          item.photoBlob,
          300,
          'ubior-item-photos',
        );
        item.photoBlob = undefined;
      }),
    );
  }

  res.status(200).json(responseFactory.createResponse({ outfit }));
});

exports.getOutfitId = (req, res, next) => {
  req.outfitId = req.params.outfitId;
  next();
};

exports.updateOutfit = catchAsync(async (req, res) => {
  const data = {
    name: req.body.name,
    category: req.body.category,
    items: req.body.items,
    photoBlob: req.file ? req.file.r2key : undefined,
  };

  const outfit = await outfitService.updateOutfit(
    req.params.outfitId,
    req.user.id,
    data,
  );

  res.status(200).json(responseFactory.createResponse({ outfit }));
});

exports.deleteOutfit = catchAsync(async (req, res) => {
  await outfitService.deleteOutfit(req.params.outfitId, req.user.id);
  res.status(204).json(responseFactory.createResponse(null));
});
