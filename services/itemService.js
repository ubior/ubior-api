const itemRepository = require('../repositories/itemRepository');
const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/appError');

class ItemService {
  async getAllItems(cursor, limit = 20) {
    const docs = await itemRepository.findPage(cursor, limit);

    const last = docs.at(-1);
    const nextCursor =
      docs.length === limit && last ? { _id: last._id.toString() } : null;

    return { items: docs, nextCursor };
  }

  async createItem(userId, data) {
    const item = await itemRepository.create(userId, data);

    await userRepository.addWardrobeItems(userId, [item._id]);

    return item;
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
