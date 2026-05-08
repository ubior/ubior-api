const postService = require('../services/postService');
const responseFactory = require('../factories/responseFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createPost = catchAsync(async (req, res, next) => {
  if (req.body.postType === 'photo' && !req.file) {
    return next(new AppError('Please upload a photo for this post.', 400));
  }

  const data = {
    caption: req.body.caption,
    postType: req.body.postType,
    item: req.body.item || undefined,
    outfit: req.body.outfit || undefined,
  };
  const post = await postService.createPost(req.user.id, data);

  req.post = post;
  req.postId = post.id;

  next();
});

exports.finalizePost = catchAsync(async (req, res) => {
  let post = req.post;

  if (req.file && req.postId) {
    post = await postService.updatePost(req.postId, req.user.id, {
      photoBlob: req.file.r2key,
    });
  }

  res.status(201).json(responseFactory.createResponse({ post }));
});

exports.getFeed = catchAsync(async (req, res) => {
  const limit = Number.parseInt(req.query.limit, 10);
  const take = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 10;

  let cursor = null;
  if (req.query.cursor) {
    try {
      const json = Buffer.from(req.query.cursor, 'base64url').toString('utf8');
      cursor = JSON.parse(json);
    } catch {
      throw new AppError('Invalid cursor.', 400);
    }
  }

  const { posts, nextCursor } = await postService.getFeed(
    req.user.id,
    cursor,
    take,
  );

  res.status(200).json(
    responseFactory.createResponse({
      posts,
      pagination: {
        limit: take,
        nextCursor: nextCursor
          ? Buffer.from(JSON.stringify(nextCursor), 'utf8').toString(
              'base64url',
            )
          : null,
      },
    }),
  );
});

exports.getPost = catchAsync(async (req, res) => {
  const post = await postService.getPost(req.params.postId, req.user.id);
  res.status(200).json(responseFactory.createResponse({ post }));
});

exports.deletePost = catchAsync(async (req, res) => {
  await postService.deletePost(req.params.postId, req.user.id);
  res.status(204).json(responseFactory.createResponse(null));
});
