const User = require('../models/userModel');

class UserRepository {
  async create(userData) {
    return await User.create(userData);
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

  async findMe(userId) {
    return await User.findById(userId).select('name username photoBlob bio');
  }
}

module.exports = new UserRepository();
