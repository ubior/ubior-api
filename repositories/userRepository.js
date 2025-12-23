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
}

module.exports = new UserRepository();
