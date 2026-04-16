const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/appError');

class UserService {
  async createUser(userData) {
    return await userRepository.create(userData);
  }

  async login(identifier, password) {
    const user = await userRepository.findByEmailOrUsername(identifier);
    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new AppError('Invalid email/username or password', 401);
    }
    return user;
  }

  async logout(userId) {
    const user = await userRepository.setLoggedOutAt(userId, new Date());
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return user;
  }

  async saveRefreshToken(userId, refreshToken, expiresAt) {
    const user = await userRepository.findByIdWithRefreshToken(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const refreshTokenHash = user.hashRefreshToken(refreshToken);

    return await userRepository.updateRefreshToken(
      userId,
      refreshTokenHash,
      expiresAt,
    );
  }

  async validateRefreshToken(userId, refreshToken) {
    const user = await userRepository.findByIdWithRefreshToken(userId);

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    if (!user.refreshTokenHash || !user.refreshTokenExpiresAt) {
      throw new AppError('Invalid refresh session.', 401);
    }

    if (user.refreshTokenExpiresAt < new Date()) {
      throw new AppError('Refresh token expired.', 401);
    }

    if (!user.correctRefreshToken(refreshToken)) {
      throw new AppError('Invalid refresh token.', 401);
    }

    return user;
  }

  async revokeRefreshToken(userId) {
    const user = await userRepository.clearRefreshToken(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return user;
  }

  async updateUser(userId, data) {
    const user = await userRepository.update(userId, data);
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return user;
  }

  async getUserById(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return user;
  }

  async getMe(userId) {
    const user = await userRepository.findMe(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return user;
  }
}

module.exports = new UserService();
