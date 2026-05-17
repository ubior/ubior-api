const Closet = require('../models/closetModel');

class ClosetRepository {
  async create(userId, data) {
    return await Closet.create({ user: userId, ...data });
  }

  async update(closetId, userId, data) {
    return await Closet.findOneAndUpdate(
      { _id: closetId, user: userId },
      data,
      {
        new: true,
        runValidators: true,
      },
    )
      .select('-user')
      .populate({
        path: 'items',
        select: 'name category color fabric brand photoBlob',
      });
  }

  async findAllByUser(userId, nameRegex = null) {
    const filter = { user: userId };
    if (nameRegex) filter.name = nameRegex;

    return await Closet.find(filter).sort({ createdAt: -1 }).select('-user');
  }

  async findByIdAndUser(closetId, userId) {
    return await Closet.findOne({ _id: closetId, user: userId })
      .select('-user')
      .populate({
        path: 'items',
        select: 'name category color fabric brand photoBlob',
      });
  }

  async delete(closetId, userId) {
    return await Closet.findOneAndDelete({ _id: closetId, user: userId });
  }
}

module.exports = new ClosetRepository();
