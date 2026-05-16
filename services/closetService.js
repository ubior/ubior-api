const closetRepository = require('../repositories/closetRepository');
const AppError = require('../utils/appError');

class ClosetService {
  async createCloset(userId, data) {
    return await closetRepository.create(userId, data);
  }

  async updateCloset(closetId, userId, data) {
    const closet = await closetRepository.update(closetId, userId, data);
    if (!closet) {
      throw new AppError('Closet not found.', 404);
    }
    return closet;
  }

  async getCloset(closetId, userId) {
    const closet = await closetRepository.findByIdAndUser(closetId, userId);
    if (!closet) {
      throw new AppError('Closet not found.', 404);
    }
    return closet;
  }

  async deleteCloset(closetId, userId) {
    return await closetRepository.delete(closetId, userId);
  }

  async addItems(closetId, items, userId) {
    const closet = await closetRepository.update(closetId, userId, {
      $addToSet: { items: { $each: items } },
    });
    if (!closet) {
      throw new AppError('Closet not found.', 404);
    }
    return closet;
  }

  async removeItems(closetId, items, userId) {
    const closet = await closetRepository.update(closetId, userId, {
      $pull: { items: { $in: items } },
    });
    if (!closet) {
      throw new AppError('Closet not found.', 404);
    }
    return closet;
  }
}

module.exports = new ClosetService();
