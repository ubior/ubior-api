const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const userService = require('../services/userService');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const {
  createSendTokens,
  signAccessToken,
  signRefreshToken,
} = require('../middlewares/createToken');
const responseFactory = require('../factories/responseFactory');

exports.signup = catchAsync(async (req, res, next) => {
  const data = {
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    country: req.body.country,
    bio: req.body.bio,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  };

  const user = await userService.createUser(data);

  req.user = user;
  req.userId = user.id;

  next();
});

exports.finalizeSignup = catchAsync(async (req, res) => {
  let user = req.user;

  if (req.file && req.userId) {
    user = await userService.updateUser(req.userId, {
      photoBlob: req.file.r2key,
    });
  }

  await createSendTokens(user, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return next(
      new AppError('Please provide email/username and password', 400),
    );
  }

  const user = await userService.login(identifier, password);
  await createSendTokens(user, 200, req, res);
});

exports.refreshToken = catchAsync(async (req, res, next) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return next(new AppError('Refresh token missing.', 401));
  }

  const decoded = await promisify(jwt.verify)(
    refreshToken,
    process.env.JWT_REFRESH_SECRET,
  );

  const user = await userService.validateRefreshToken(decoded.id, refreshToken);

  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401),
    );
  }

  if (user.loggedOutAfter && user.loggedOutAfter(decoded.iat)) {
    return next(new AppError('Session ended. Please log in again.', 401));
  }

  const newAccessToken = signAccessToken(user.id);
  const newRefreshToken = signRefreshToken(user.id);
  const refreshTokenExpiresAt = new Date(
    Date.now() + process.env.JWT_REFRESH_EXPIRES_IN_NUM * 24 * 60 * 60 * 1000,
  );

  await userService.saveRefreshToken(
    user.id,
    newRefreshToken,
    refreshTokenExpiresAt,
  );

  res.status(200).json(
    responseFactory.createResponse({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }),
  );
});

exports.logout = catchAsync(async (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (refreshToken) {
    try {
      const decoded = await promisify(jwt.verify)(
        refreshToken,
        process.env.JWT_REFRESH_SECRET,
      );

      await userService.revokeRefreshToken(decoded.id);
      await userService.logout(decoded.id);
    } catch (err) {}
  }

  res.status(200).json({ status: 'success' });
});

exports.getAuthStatus = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Not authenticated.', 401));
  }

  res.status(200).json(responseFactory.createResponse({ loggedIn: true }));
};
