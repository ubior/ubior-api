const outfitRepository = require('../repositories/outfitRepository');
const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/appError');
const { buildSequentialRegex } = require('../utils/buildSequentialRegex');

class OutfitService {
  async _ownItems(userId, items) {
    const user = await userRepository.findWardrobe(userId);
    const invalid = items.filter((id) => !user.items.includes(id));
    if (invalid.length > 0) {
      throw new AppError('All outfit items must be in your wardrobe.', 400);
    }
  }

  async createOutfit(userId, data) {
    if (Array.isArray(data.items) && data.items.length > 0) {
      await this._ownItems(userId, data.items);
    }
    return await outfitRepository.create(userId, data);
  }

  async getMyOutfits(userId, search) {
    const nameRegex = buildSequentialRegex(search);
    return await outfitRepository.findAllByUser(userId, nameRegex);
  }

  async updateOutfit(outfitId, userId, data) {
    if (Array.isArray(data.items) && data.items.length > 0) {
      await this._ownItems(userId, data.items);
    }
    const outfit = await outfitRepository.update(outfitId, userId, data);
    if (!outfit) {
      throw new AppError('Outfit not found.', 404);
    }
    return outfit;
  }

  async getOutfit(outfitId, userId) {
    const outfit = await outfitRepository.findByIdAndUser(outfitId, userId);
    if (!outfit) {
      throw new AppError('Outfit not found.', 404);
    }
    return outfit;
  }

  async deleteOutfit(outfitId, userId) {
    return await outfitRepository.delete(outfitId, userId);
  }
}

module.exports = new OutfitService();
