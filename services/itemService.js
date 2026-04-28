const itemRepository = require('../repositories/itemRepository');
const AppError = require('../utils/appError');

class ItemService {
  async createItem(userId, data) {
    return await itemRepository.create(userId, data);
  }

  async updateItem(itemId, userId, data) {
    const item = await itemRepository.update(itemId, userId, data);
    if (!item) {
      throw new AppError('Item not found.', 404);
    }
    return item;
  }

  async getItem(itemId) {
    const item = await itemRepository.findById(itemId);
    if (!item) {
      throw new AppError('Item not found.', 404);
    }
    return item;
  }

  async deleteItem(itemId, userId) {
    return await itemRepository.delete(itemId, userId);
  }
}

module.exports = new ItemService();
