const { default: mongoose } = require('mongoose');
const Post = require('../models/postModel');
const User = require('../models/userModel');

class PostRepository {
  async create(userId, data) {
    return await Post.create({ user: userId, ...data });
  }

  async update(postId, userId, data) {
    return await Post.findOneAndUpdate({ _id: postId, user: userId }, data, {
      new: true,
      runValidators: true,
    });
  }

  async findByIdDetailed(postId) {
    return await Post.findById(postId)
      .populate({ path: 'user', select: 'name username photoBlob private' })
      .populate({ path: 'item', select: 'name category photoBlob user' })
      .populate({
        path: 'outfit',
        select: 'name category photoBlob user items',
      });
  }

  async findFeedPage(userId, cursor, limit) {
    const me = await User.findById(userId).select('following');
    if (!me) return [];

    const followingIds = me.following || [];

    const allowedAuthors = await User.find({
      $or: [
        { _id: userId },
        { private: false },
        { _id: { $in: followingIds } },
      ],
    }).select('_id');

    const allowedAuthorIds = allowedAuthors.map((u) => u._id);

    const filter = {
      user: { $in: allowedAuthorIds },
    };

    if (cursor?.createdAt && cursor?._id) {
      const cursorCreatedAt = new Date(cursor.createdAt);

      filter.$or = [
        { createdAt: { $lt: cursorCreatedAt } },
        {
          createdAt: cursorCreatedAt,
          _id: { $lt: cursor._id },
        },
      ];
    }

    return await Post.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit)
      .populate({ path: 'user', select: 'name username photoBlob private' })
      .populate({ path: 'item', select: 'name category photoBlob user' })
      .populate({
        path: 'outfit',
        select: 'name category photoBlob user items',
      });
  }

  async findUserPosts(authorId, cursor, limit) {
    const filter = { user: authorId };

    if (cursor?.createdAt && cursor?._id) {
      const cursorCreatedAt = new Date(cursor.createdAt);

      filter.$or = [
        { createdAt: { $lt: cursorCreatedAt } },
        {
          createdAt: cursorCreatedAt,
          _id: { $lt: cursor._id },
        },
      ];
    }

    return await Post.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit)
      .populate({ path: 'user', select: 'name username photoBlob private' })
      .populate({ path: 'item', select: 'name category photoBlob user' })
      .populate({
        path: 'outfit',
        select: 'name category photoBlob user items',
      });
  }

  async addLike(postId, userId) {
    return await Post.findByIdAndUpdate(
      postId,
      {
        $addToSet: { likes: new mongoose.Types.ObjectId(userId) },
      },
      { new: true, runValidators: true },
    );
  }

  async removeLike(postId, userId) {
    return await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: new mongoose.Types.ObjectId(userId) },
      },
      { new: true, runValidators: true },
    );
  }

  async delete(postId, userId) {
    return await Post.findByIdAndDelete({ _id: postId, user: userId });
  }
}

module.exports = new PostRepository();
