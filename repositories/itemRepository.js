const Item = require('../models/itemModel');

class ItemRepository {
  async searchItems(nameRegex, limit = null, cursor = null) {
    const filter = {
      $or: [
        { name: nameRegex },
        { category: nameRegex },
        { color: nameRegex },
        { brand: nameRegex },
      ],
    };

    if (cursor?._id) {
      filter._id = { $lt: cursor._id };
    }

    let query = Item.find(filter)
      .sort({ _id: -1 })
      .populate({ path: 'user', select: 'name username photoBlob' });

    if (limit) query = query.limit(limit);

    const items = await query;
    const last = items.at(-1);
    const nextCursor =
      items.length === limit && last ? { _id: last._id.toString() } : null;

    return { items, nextCursor };
  }

  async findPage(cursor, limit) {
    const filter = {};

    if (cursor?._id) {
      filter._id = { $lt: cursor._id };
    }

    return await Item.find(filter)
      .sort({ _id: -1 })
      .limit(limit)
      .populate({ path: 'user', select: 'name username photoBlob' });
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
