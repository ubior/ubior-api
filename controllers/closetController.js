const closetService = require('../services/closetService');
const responseFactory = require('../factories/responseFactory');
const catchAsync = require('../utils/catchAsync');
const getSignedImageUrl = require('../utils/getSignedImageUrl');

exports.createCloset = catchAsync(async (req, res, next) => {
  const data = {
    name: req.body.name,
    items: req.body.items,
  };
  const closet = await closetService.createCloset(req.user.id, data);

  req.closet = closet;
  req.closetId = closet.id;

  next();
});

exports.finalizeCloset = catchAsync(async (req, res) => {
  let closet = req.closet;

  if (req.file && req.closetId) {
    closet = await closetService.updateCloset(req.closetId, req.user.id, {
      photoBlob: req.file.r2key,
    });
  }

  if (closet.photoBlob) {
    const key = closet.photoBlob;
    const signedUrl = await getSignedImageUrl(key, 300, 'ubior-closet-photos');
    closet.photoBlob = undefined;
    closet.photo = signedUrl;
  }

  closet.user = undefined;

  res.status(201).json(responseFactory.createResponse({ closet }));
});

exports.getCloset = catchAsync(async (req, res) => {
  const closetDoc = await closetService.getCloset(
    req.params.closetId,
    req.user.id,
  );
  const closet = closetDoc.toObject();

  if (closet.photoBlob) {
    const key = closet.photoBlob;
    const signedUrl = await getSignedImageUrl(key, 300, 'ubior-closet-photos');
    closet.photoBlob = undefined;
    closet.photo = signedUrl;
  }

  if (Array.isArray(closet.items)) {
    await Promise.all(
      closet.items.map(async (item) => {
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

  res.status(200).json(responseFactory.createResponse({ closet }));
});

exports.getClosetId = (req, res, next) => {
  req.closetId = req.params.closetId;
  next();
};

exports.updateCloset = catchAsync(async (req, res) => {
  const data = {
    name: req.body.name,
    photoBlob: req.file ? req.file.r2key : undefined,
  };

  const closetDoc = await closetService.updateCloset(
    req.params.closetId,
    req.user.id,
    data,
  );
  const closet = closetDoc.toObject();

  if (closet.photoBlob) {
    const key = closet.photoBlob;
    const signedUrl = await getSignedImageUrl(key, 300, 'ubior-closet-photos');
    closet.photoBlob = undefined;
    closet.photo = signedUrl;
  }

  if (Array.isArray(closet.items)) {
    await Promise.all(
      closet.items.map(async (item) => {
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

  res.status(200).json(responseFactory.createResponse({ closet }));
});

exports.deleteCloset = catchAsync(async (req, res) => {
  await closetService.deleteCloset(req.params.closetId, req.user.id);
  res.status(204).json(responseFactory.createResponse(null));
});

exports.addItems = catchAsync(async (req, res) => {
  const closetDoc = await closetService.addItems(
    req.params.closetId,
    req.body.items,
    req.user.id,
  );
  const closet = closetDoc.toObject();

  if (closet.photoBlob) {
    const key = closet.photoBlob;
    const signedUrl = await getSignedImageUrl(key, 300, 'ubior-closet-photos');
    closet.photoBlob = undefined;
    closet.photo = signedUrl;
  }

  if (Array.isArray(closet.items)) {
    await Promise.all(
      closet.items.map(async (item) => {
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

  res.status(200).json(responseFactory.createResponse({ closet }));
});

exports.removeItems = catchAsync(async (req, res) => {
  const closetDoc = await closetService.removeItems(
    req.params.closetId,
    req.body.items,
    req.user.id,
  );
  const closet = closetDoc.toObject();

  if (closet.photoBlob) {
    const key = closet.photoBlob;
    const signedUrl = await getSignedImageUrl(key, 300, 'ubior-closet-photos');
    closet.photoBlob = undefined;
    closet.photo = signedUrl;
  }

  if (Array.isArray(closet.items)) {
    await Promise.all(
      closet.items.map(async (item) => {
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

  res.status(200).json(responseFactory.createResponse({ closet }));
});
