const responseFactory = require('../factories/responseFactory');
const catchAsync = require('../utils/catchAsync');
const userService = require('../services/userService');
const getSignedImageUrl = require('../utils/getSignedImageUrl');
const { createSendTokens } = require('../middlewares/createToken');

const signUserPhotos = async (users) => {
  if (!Array.isArray(users) || users.length === 0) return;
  await Promise.all(
    users.map(async (user) => {
      if (user.photoBlob) {
        user.photo = await getSignedImageUrl(
          user.photoBlob,
          300,
          'ubior-user-photos',
        );
        user.photoBlob = undefined;
      }
    }),
  );
};

exports.getMe = catchAsync(async (req, res) => {
  const meDoc = await userService.getMe(req.userId);
  const me = meDoc.toObject();

  if (me.photoBlob) {
    const key = me.photoBlob;
    const signedUrl = await getSignedImageUrl(key, 300, 'ubior-user-photos');
    me.photoBlob = undefined;
    me.photo = signedUrl;
  }

  res.status(200).json(responseFactory.createResponse({ me }));
});

exports.getMyStats = catchAsync(async (req, res) => {
  const stats = await userService.getMyStats(req.user.id);
  res.status(200).json(responseFactory.createResponse({ stats }));
});

exports.getMyFollowers = catchAsync(async (req, res) => {
  const followersDocs = await userService.getMyFollowers(req.user.id);
  const followers = followersDocs.map((doc) => doc.toObject());
  await signUserPhotos(followers);
  res.status(200).json(responseFactory.createResponse({ followers }, true));
});

exports.getMyFollowing = catchAsync(async (req, res) => {
  const followingDocs = await userService.getMyFollowing(req.user.id);
  const following = followingDocs.map((doc) => doc.toObject());
  await signUserPhotos(following);
  res.status(200).json(responseFactory.createResponse({ following }, true));
});

exports.getMyRequests = catchAsync(async (req, res) => {
  const requestsDocs = await userService.getMyRequests(req.user.id);
  const requests = requestsDocs.map((doc) => doc.toObject());
  await signUserPhotos(requests);
  res.status(200).json(responseFactory.createResponse({ requests }, true));
});

exports.getMyPosts = catchAsync(async (req, res, next) => {
  req.params.username = req.user.username;
  next();
});

exports.updateMyPhoto = catchAsync(async (req, res) => {
  await userService.updateUser(req.user.id, { photoBlob: req.file.r2key });

  res.status(200).json({ status: 'success' });
});

exports.updateMe = catchAsync(async (req, res) => {
  const data = {
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    country: req.body.country,
    bio: req.body.bio,
  };

  const user = await userService.updateUser(req.user.id, data);

  res.status(200).json(responseFactory.createResponse({ user }));
});

exports.updateMyPrivacy = catchAsync(async (req, res) => {
  const status = await userService.updatePrivacy(req.user.id);
  res.status(200).json(responseFactory.createResponse({ status }));
});

exports.updateMyPassword = catchAsync(async (req, res) => {
  const data = {
    passwordCurrent: req.body.passwordCurrent,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  };

  const user = await userService.updatePassword(req.user.id, data);

  createSendTokens(user, 200, req, res);
});

exports.deleteMe = catchAsync(async (req, res) => {
  await userService.deleteMe(req.user.id);
  res.status(204).json(responseFactory.createResponse(null));
});

exports.follow = catchAsync(async (req, res) => {
  const status = await userService.followUser(
    req.user.username,
    req.params.username,
  );
  res.status(200).json(responseFactory.createResponse({ status }));
});

exports.removeFollower = catchAsync(async (req, res) => {
  const status = await userService.removeFollower(
    req.user.username,
    req.params.username,
  );
  res.status(200).json(responseFactory.createResponse({ status }));
});

exports.handleRequest = (action = 'deny') => {
  return catchAsync(async (req, res) => {
    const status = await userService.handleRequest(
      req.user.username,
      req.params.username,
      action,
    );
    res.status(200).json(responseFactory.createResponse({ status }));
  });
};

exports.getWardrobe = catchAsync(async (req, res) => {
  const search = req.body.search ?? null;

  const itemsDocs = await userService.getWardrobe(req.user.id, search);
  const items = itemsDocs.map((doc) => doc.toObject());

  if (Array.isArray(items) && items.length > 0) {
    await Promise.all(
      items.map(async (item) => {
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

  res.status(200).json(responseFactory.createResponse({ items }, true));
});

exports.addWardrobeItems = catchAsync(async (req, res) => {
  const itemsDocs = await userService.addWardrobeItems(
    req.user.id,
    req.body.items,
  );
  const items = itemsDocs.map((doc) => doc.toObject());

  if (Array.isArray(items) && items.length > 0) {
    await Promise.all(
      items.map(async (item) => {
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

  res.status(200).json(responseFactory.createResponse({ items }, true));
});

exports.removeWardrobeItems = catchAsync(async (req, res) => {
  const itemsDocs = await userService.removeWardrobeItems(
    req.user.id,
    req.body.items,
  );
  const items = itemsDocs.map((doc) => doc.toObject());

  if (Array.isArray(items) && items.length > 0) {
    await Promise.all(
      items.map(async (item) => {
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

  res.status(200).json(responseFactory.createResponse({ items }, true));
});
