const User = require('../models/userModel');
const postRepository = require('../repositories/postRepository');
const AppError = require('../utils/appError');
const getSignedImageUrl = require('../utils/getSignedImageUrl');

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function signFeedPost(postDoc, userId) {
  const post = postDoc.toObject({ virtuals: true });

  const likeIds = Array.isArray(post.likes) ? post.likes : [];
  post.likesCount = likeIds.length;
  post.liked = userId
    ? likeIds.some((id) => id.toString() === userId.toString())
    : false;

  post.likes = undefined;

  if (post.user?.photoBlob && post.user.photoBlob !== 'default.png') {
    const url = await getSignedImageUrl(
      post.user.photoBlob,
      300,
      'ubior-user-photos',
    );
    post.user.photoBlob = undefined;
    post.user.photo = url;
  }

  if (post.postType === 'photo') {
    if (!post.photoBlob) return post;

    post.photo = await getSignedImageUrl(
      post.photoBlob,
      300,
      'ubior-post-photos',
    );
    return post;
  }

  if (post.postType === 'item') {
    if (!post.item?.photoBlob) return post;

    post.photo = await getSignedImageUrl(
      post.item.photoBlob,
      300,
      'ubior-item-photos',
    );
    post.item.photoBlob = undefined;
    return post;
  }

  if (post.postType === 'outfit') {
    if (!post.outfit?.photoBlob) return post;

    post.photo = await getSignedImageUrl(
      post.outfit.photoBlob,
      300,
      'ubior-outfit-photos',
    );
    post.outfit.photoBlob = undefined;
    return post;
  }

  return post;
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

    return await signFeedPost(postDoc, userId);
  }

  async getFeed(userId, cursor, limit) {
    const docs = await postRepository.findFeedPage(userId, cursor, limit);

    const signedPosts = await Promise.all(
      docs.map((d) => signFeedPost(d, userId)),
    );

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
    return await signFeedPost(post, userId);
  }

  async deletePost(postId, userId) {
    return await postRepository.delete(postId, userId);
  }
}

module.exports = new PostService();
