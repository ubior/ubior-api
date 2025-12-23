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
