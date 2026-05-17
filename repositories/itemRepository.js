const Item = require('../models/itemModel');

class ItemRepository {
  async countOwned(userId, items) {
    return await Item.countDocuments({ _id: { $in: items }, user: userId });
  }

  async create(userId, data) {
    return await Item.create({ user: userId, ...data });
  }

  async update(itemId, userId, data) {
    return await Item.findOneAndUpdate({ _id: itemId, user: userId }, data, {
      new: true,
      runValidators: true,
    });
  }

  async findById(itemId) {
    return await Item.findById(itemId);
  }

  async delete(itemId, userId) {
    return await Item.findOneAndDelete({ _id: itemId, user: userId });
  }
}

module.exports = new ItemRepository();
