const Outfit = require('../models/outfitModel');

class OutfitRepository {
  async create(userId, data) {
    return await Outfit.create({ user: userId, ...data });
  }

  async update(outfitId, userId, data) {
    return await Outfit.findOneAndUpdate(
      { _id: outfitId, user: userId },
      data,
      {
        new: true,
        runValidators: true,
      },
    );
  }

  async findByIdAndUser(outfitId, userId) {
    return await Outfit.findOne({ _id: outfitId, user: userId });
  }

  async delete(outfitId, userId) {
    return await Outfit.findOneAndDelete({ _id: outfitId, user: userId });
  }
}

module.exports = new OutfitRepository();
