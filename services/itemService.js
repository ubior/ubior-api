const itemRepository = require('../repositories/itemRepository');
const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/appError');

class ItemService {
  async assertOwnedItems(userId, items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new AppError('Please provide item ids.', 400);
    }

    const ownedCount = await itemRepository.countOwned(userId, items);
    if (ownedCount !== items.length) {
      throw new AppError('One or more items not found.', 404);
    }
  }

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
    const item = await itemRepository.delete(itemId, userId);
    if (!item) return;

    return await userRepository.removeWardrobeItems(userId, [itemId]);
  }
}

module.exports = new ItemService();
