const mongoose = require('mongoose');
const Closet = require('../models/closetModel');
const Item = require('../models/itemModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

class UserRepository {
  async create(userData) {
    return await User.create(userData);
  }

  async setLoggedOutAt(userId, date) {
    return await User.findByIdAndUpdate(
      userId,
      { loggedOutAt: date },
      { new: true, runValidators: false },
    );
  }

  async findByIdWithRefreshToken(userId) {
    return await User.findById(userId).select(
      '+refreshTokenHash +refreshTokenExpiresAt',
    );
  }

  async updateRefreshToken(userId, refreshTokenHash, refreshTokenExpiresAt) {
    return await User.findByIdAndUpdate(
      userId,
      { refreshTokenHash, refreshTokenExpiresAt },
      { new: true, runValidators: false },
    );
  }

  async clearRefreshToken(userId) {
    return await User.findByIdAndUpdate(
      userId,
      {
        refreshTokenHash: null,
        refreshTokenExpiresAt: null,
      },
      { new: true, runValidators: false },
    );
  }

  async findByEmailOrUsername(identifier) {
    return await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select('+password');
  }

  async update(userId, data) {
    return await User.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true,
    });
  }

  async updatePassword(userId, data) {
    const user = await User.findById(userId).select('+password');
    const { passwordCurrent, password, passwordConfirm } = data;

    if (!(await user.correctPassword(passwordCurrent, user.password))) {
      throw new AppError('Your current password is wrong.', 401);
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    return await user.save();
  }

  async delete(userId) {
    return await User.findByIdAndDelete(userId);
  }

  async findById(userId) {
    return await User.findById(userId);
  }

  async findByUsername(username) {
    return await User.findOne({ username });
  }

  async findMe(userId) {
    return await User.findById(userId).select('name username photoBlob bio');
  }

  async findStats(userId) {
    const [stats] = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'user',
          as: 'posts',
        },
      },
      {
        $addFields: {
          followersCount: { $size: { $ifNull: ['$followers', []] } },
          followingCount: { $size: { $ifNull: ['$following', []] } },
          postsCount: { $size: { $ifNull: ['$posts', []] } },
        },
      },
      {
        $project: {
          _id: 0,
          followersCount: 1,
          followingCount: 1,
          postsCount: 1,
        },
      },
    ]);

    if (!stats) throw new AppError('User not found.', 404);
    return stats;
  }

  async findFollowers(userId) {
    const user = await User.findById(userId)
      .select('followers')
      .populate({ path: 'followers', select: 'name username photoBlob' });
    if (!user) throw new AppError('User not found.', 404);
    return user.followers;
  }

  async findFollowing(userId) {
    const user = await User.findById(userId)
      .select('following')
      .populate({ path: 'following', select: 'name username photoBlob' });
    if (!user) throw new AppError('User not found.', 404);
    return user.following;
  }

  async findRequests(userId) {
    const user = await User.findById(userId)
      .select('requests')
      .populate({ path: 'requests', select: 'name username photoBlob' });
    if (!user) throw new AppError('User not found.', 404);
    return user.requests;
  }

  async addFollower(userId, targetId) {
    return await this.update(userId, {
      $addToSet: { followers: targetId },
    });
  }

  async addFollowing(userId, targetId) {
    return await this.update(userId, {
      $addToSet: { following: targetId },
    });
  }

  async addRequest(userId, targetId) {
    return await this.update(userId, { $addToSet: { requests: targetId } });
  }

  async removeFollower(userId, targetId) {
    return await this.update(userId, { $pull: { followers: targetId } });
  }

  async removeFollowing(userId, targetId) {
    return await this.update(userId, { $pull: { following: targetId } });
  }

  async removeRequest(userId, targetId) {
    return await this.update(userId, { $pull: { requests: targetId } });
  }

  async addWardrobeItems(userId, items) {
    return await User.findByIdAndUpdate(
      userId,
      { $addToSet: { items: { $each: items } } },
      {
        new: true,
        runValidators: true,
      },
    ).populate({
      path: 'items',
      select: 'name category color fabric brand photoBlob',
    });
  }

  async removeWardrobeItems(userId, items) {
    await Closet.updateMany(
      { user: userId },
      { $pull: { items: { $in: items } } },
    );

    return await User.findByIdAndUpdate(
      userId,
      { $pull: { items: { $in: items } } },
      {
        new: true,
        runValidators: true,
      },
    ).populate({
      path: 'items',
      select: 'name category color fabric brand photoBlob',
    });
  }

  async findWardrobe(userId) {
    return await User.findById(userId).select('items').populate({
      path: 'items',
      select: 'name category color fabric brand photoBlob',
    });
  }

  async findWardrobeItems(userId, nameRegex = null) {
    const user = await User.findById(userId).select('items');
    if (!user?.items?.length) return [];

    const filter = { _id: { $in: user.items } };

    if (nameRegex) {
      filter.$or = [
        { name: nameRegex },
        { category: nameRegex },
        { color: nameRegex },
        { brand: nameRegex },
      ];
    }

    return await Item.find(filter)
      .sort({ createdAt: -1 })
      .select('name category color fabric brand photoBlob');
  }
}

module.exports = new UserRepository();
