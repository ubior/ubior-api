const outfitService = require('../services/outfitService');
const responseFactory = require('../factories/responseFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { signOutfit, signOutfits } = require('../utils/signPhotos');

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
    outfit = outfit.toObject();
  }

  await signOutfit(outfit);

  res.status(201).json(responseFactory.createResponse({ outfit }));
});

exports.getMyOutfits = catchAsync(async (req, res) => {
  const search = req.body.search ?? null;

  const outfitsDocs = await outfitService.getMyOutfits(req.user.id, search);
  const outfits = outfitsDocs.map((doc) => doc.toObject());

  await signOutfits(outfits);

  res.status(200).json(responseFactory.createResponse({ outfits }, true));
});

exports.getOutfit = catchAsync(async (req, res) => {
  const outfitDoc = await outfitService.getOutfit(
    req.params.outfitId,
    req.user.id,
  );
  const outfit = outfitDoc.toObject();

  await signOutfit(outfit);

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

  const outfitDoc = await outfitService.updateOutfit(
    req.params.outfitId,
    req.user.id,
    data,
  );
  const outfit = outfitDoc.toObject();

  await signOutfit(outfit);

  res.status(200).json(responseFactory.createResponse({ outfit }));
});

exports.deleteOutfit = catchAsync(async (req, res) => {
  await outfitService.deleteOutfit(req.params.outfitId, req.user.id);
  res.status(204).json(responseFactory.createResponse(null));
});
