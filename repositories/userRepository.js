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
}

module.exports = new UserRepository();
