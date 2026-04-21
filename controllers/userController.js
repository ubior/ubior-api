const responseFactory = require('../factories/responseFactory');
const catchAsync = require('../utils/catchAsync');
const userService = require('../services/userService');
const getSignedImageUrl = require('../utils/getSignedImageUrl');

exports.getMe = catchAsync(async (req, res) => {
  const meDoc = await userService.getMe(req.userId);
  const me = meDoc.toObject();

  if (me.photoBlob && me.photoBlob !== 'default.png') {
    const key = me.photoBlob;
    const signedUrl = await getSignedImageUrl(key, 300, 'ubior-user-photos');
    me.photoBlob = undefined;
    me.photo = signedUrl;
  }

  res.status(200).json(responseFactory.createResponse({ me }));
});

exports.updateMyPhoto = catchAsync(async (req, res) => {
  await userService.updateUser(req.user.id, { photoBlob: req.file.r2key });

  res.status(200).json({ status: 'success' });
});
