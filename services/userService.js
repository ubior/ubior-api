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
