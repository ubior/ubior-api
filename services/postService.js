const User = require('../models/userModel');
const postRepository = require('../repositories/postRepository');
const AppError = require('../utils/appError');
const { signPost } = require('../utils/signPhotos');

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function canSeePost(userId, author) {
  if (!author?._id) return false;

  if (userId === author._id) return true;

  if (!author.private) return true;

  const user = await User.findById(userId).select('following');
  if (!user) return false;

  return user.following.some((id) => id === author._id);
}

class PostService {
  async createPost(userId, data) {
    return await postRepository.create(userId, data);
  }

  async updatePost(postId, userId, data) {
    const post = await postRepository.update(postId, userId, data);
    if (!post) {
      throw new AppError('Post not found.', 404);
    }
    return post;
  }

  async getPost(postId, userId) {
    const postDoc = await postRepository.findByIdDetailed(postId);
    if (!postDoc) {
      throw new AppError('Post not found.', 404);
    }

    const canSee = await canSeePost(userId, postDoc.user);
    if (!canSee) {
      throw new AppError('Post not found.', 404);
    }

    return await signPost(postDoc, userId);
  }

  async getFeed(userId, cursor, limit) {
    const docs = await postRepository.findFeedPage(userId, cursor, limit);

    if (!Array.isArray(docs) || docs.length === 0) return;
    const signedPosts = await Promise.all(docs.map((d) => signPost(d, userId)));

    shuffleInPlace(signedPosts);

    const last = docs.at(-1);
    const nextCursor =
      docs.length === limit && last
        ? {
            createdAt: last.createdAt.toISOString(),
            _id: last._id.toString(),
          }
        : null;

    return { posts: signedPosts, nextCursor };
  }

  async getUserPosts(userId, username, cursor, limit) {
    const author = await User.findOne({ username })
      .select('_id private')
      .lean();

    if (!author) {
      throw new AppError('User not found.', 404);
    }

    if (author.private) {
      if (userId.toString() !== author._id.toString()) {
        const user = await User.findById(userId).select('following');
        const follows = user?.following?.some(
          (id) => id.toString() === author._id.toString(),
        );
        if (!follows) {
          throw new AppError('User not found.', 404);
        }
      }
    }

    const docs = await postRepository.findUserPosts(author._id, cursor, limit);

    const posts = await Promise.all(docs.map((d) => signPost(d, userId)));

    const last = docs.at(-1);
    const nextCursor =
      docs.length === limit && last
        ? {
            createdAt: last.createdAt.toISOString(),
            _id: last._id.toString(),
          }
        : null;

    return { posts, nextCursor };
  }

  async likePost(postId, userId) {
    const postDoc = await postRepository.findByIdDetailed(postId);
    if (!postDoc) {
      throw new AppError('Post not found.', 404);
    }

    const canSee = await canSeePost(userId, postDoc.user);
    if (!canSee) {
      throw new AppError('Post not found.', 404);
    }

    const alreadyLiked = (postDoc.likes || []).some(
      (id) => id.toString() === userId.toString(),
    );

    const updatedDoc = alreadyLiked
      ? await postRepository.removeLike(postId, userId)
      : await postRepository.addLike(postId, userId);

    const post = await postRepository.findByIdDetailed(updatedDoc._id);
    return await signPost(post, userId);
  }

  async deletePost(postId, userId) {
    return await postRepository.delete(postId, userId);
  }
}

module.exports = new PostService();
