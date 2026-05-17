const outfitRepository = require('../repositories/outfitRepository');
const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/appError');
const { buildSequentialRegex } = require('../utils/buildSequentialRegex');

class OutfitService {
  async createOutfit(userId, data) {
    const outfit = await outfitRepository.create(userId, data);

    if (Array.isArray(data.items) && data.items.length > 0) {
      await userRepository.addWardrobeItems(userId, data.items);
    }

    return outfit;
  }

  async getMyOutfits(userId, search) {
    const nameRegex = buildSequentialRegex(search);
    return await outfitRepository.findAllByUser(userId, nameRegex);
  }

  async updateOutfit(outfitId, userId, data) {
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
