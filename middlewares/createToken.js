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
    Date.now() + process.env.JWT_REFRESH_EXPIRES_IN_NUM * 24 * 60 * 60 * 1000,
  );
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

  res.status(statusCode).json(
    responseFactory.createResponse({
      accessToken,
      refreshToken,
    }),
  );
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  createSendTokens,
};
