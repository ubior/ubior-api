const User = require('../models/userModel');

class UserRepository {
  async create(userData) {
    return await User.create(userData);
  }

  async setLoggedOutAt(userId, date) {
    return await User.findByIdAndUpdate(
      userId,
      { loggedOutAt: date },
      { new: true, runValidators: false },
    );
  }

  async findByIdWithRefreshToken(userId) {
    return await User.findById(userId).select(
      '+refreshTokenHash +refreshTokenExpiresAt',
    );
  }

  async updateRefreshToken(userId, refreshTokenHash, refreshTokenExpiresAt) {
    return await User.findByIdAndUpdate(
      userId,
      { refreshTokenHash, refreshTokenExpiresAt },
      { new: true, runValidators: false },
    );
  }

  async clearRefreshToken(userId) {
    return await User.findByIdAndUpdate(
      userId,
      {
        refreshTokenHash: null,
        refreshTokenExpiresAt: null,
      },
      { new: true, runValidators: false },
    );
  }

  async findByEmailOrUsername(identifier) {
    return await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select('+password');
  }

  async update(userId, data) {
    return await User.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true,
    });
  }

  async findById(userId) {
    return await User.findById(userId);
  }

  async findByUsername(username) {
    return await User.findOne({ username });
  }

  async findMe(userId) {
    return await User.findById(userId).select('name username photoBlob bio');
  }

  async addFollower(userId, targetId) {
    return await this.update(userId, {
      $addToSet: { followers: targetId },
    });
  }

  async addFollowing(userId, targetId) {
    return await this.update(userId, {
      $addToSet: { following: targetId },
    });
  }

  async addRequest(userId, targetId) {
    return await this.update(userId, { $addToSet: { requests: targetId } });
  }

  async removeFollower(userId, targetId) {
    return await this.update(userId, { $pull: { followers: targetId } });
  }

  async removeFollowing(userId, targetId) {
    return await this.update(userId, { $pull: { following: targetId } });
  }

  async removeRequest(userId, targetId) {
    return await this.update(userId, { $pull: { requests: targetId } });
  }
}

module.exports = new UserRepository();
