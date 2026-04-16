const userService = require('../services/userService');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { createSendToken } = require('../middlewares/createToken');
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

  createSendToken(user, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return next(
      new AppError('Please provide email/username and password', 400),
    );
  }

  const user = await userService.login(identifier, password);
  createSendToken(user, 200, req, res);
});

exports.logout = catchAsync(async (req, res) => {
  if (!req.userId) return next(new AppError('Not authenticated.', 401));

  await userService.logout(req.userId);

  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'lax',
  });

  res.status(200).json({ status: 'success' });
});

exports.getAuthStatus = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Not authenticated.', 401));
  }

  res.status(200).json(responseFactory.createResponse({ loggedIn: true }));
};
