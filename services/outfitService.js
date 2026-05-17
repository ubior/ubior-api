const outfitRepository = require('../repositories/outfitRepository');
const AppError = require('../utils/appError');

class OutfitService {
  async createOutfit(userId, data) {
    return await outfitRepository.create(userId, data);
  }

  async getMyOutfits(userId) {
    return await outfitRepository.findAllByUser(userId);
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
