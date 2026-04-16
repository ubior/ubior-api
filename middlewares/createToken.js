const jwt = require('jsonwebtoken');
const responseFactory = require('../factories/responseFactory');
const userService = require('../services/userService');

const signAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  });
};

const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};

const getRefreshTokenExpiryDate = () => {
  return new Date(
    Date.now() +
      process.env.JWT_REFRESH_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
  );
};

const setRefreshTokenCookie = (res, refreshToken, req) => {
  res.cookie('refreshToken', refreshToken, {
    expires: getRefreshTokenExpiryDate(),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'lax',
  });
};

const clearRefreshTokenCookie = (res, req) => {
  res.cookie('refreshToken', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'lax',
  });
};

const createSendTokens = async (user, statusCode, req, res) => {
  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  const refreshTokenExpiresAt = getRefreshTokenExpiryDate();

  await userService.saveRefreshToken(
    user.id,
    refreshToken,
    refreshTokenExpiresAt,
  );

  setRefreshTokenCookie(res, refreshToken, req);

  res.status(statusCode).json(
    responseFactory.createResponse({
      accessToken,
    }),
  );
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  createSendTokens,
  clearRefreshTokenCookie,
};
