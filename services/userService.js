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
}

module.exports = new UserService();
