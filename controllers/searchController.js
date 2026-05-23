const searchService = require('../services/searchService');
const responseFactory = require('../factories/responseFactory');
const catchAsync = require('../utils/catchAsync');
const { signPosts, signUsers, signItems } = require('../utils/signPhotos');
const AppError = require('../utils/appError');

exports.search = catchAsync(async (req, res, next) => {
  const { q: search, type } = req.query;

  if (!search || typeof search !== 'string') {
    return next(new AppError('Please provide a search term.', 400));
  }

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

  const raw = await searchService.search(
    req.user.id,
    search,
    type,
    cursor,
    take,
  );

  if (type === 'users') {
    const users = raw.users.map((d) => d.toObject());
    await signUsers(users);
    return res.status(200).json(
      responseFactory.createResponse(
        {
          users,
          pagination: {
            limit: take,
            nextCursor: raw.nextCursor
              ? Buffer.from(JSON.stringify(raw.nextCursor), 'utf8').toString(
                  'base64url',
                )
              : null,
          },
        },
        true,
      ),
    );
  }

  if (type === 'posts') {
    const posts = await signPosts(raw.posts, req.user.id);
    return res.status(200).json(
      responseFactory.createResponse(
        {
          posts,
          pagination: {
            limit: take,
            nextCursor: raw.nextCursor
              ? Buffer.from(JSON.stringify(raw.nextCursor), 'utf8').toString(
                  'base64url',
                )
              : null,
          },
        },
        true,
      ),
    );
  }

  if (type === 'items') {
    const items = raw.items.map((d) => d.toObject());
    await signItems(items);
    return res.status(200).json(
      responseFactory.createResponse(
        {
          items,
          pagination: {
            limit: take,
            nextCursor: raw.nextCursor
              ? Buffer.from(JSON.stringify(raw.nextCursor), 'utf8').toString(
                  'base64url',
                )
              : null,
          },
        },
        true,
      ),
    );
  }

  const users = raw.users.map((d) => d.toObject());
  const posts = await signPosts(raw.posts, req.user.id);
  const items = raw.items.map((d) => d.toObject());

  await Promise.all([signUsers(users), signItems(items)]);

  res.status(200).json(responseFactory.createResponse({ users, posts, items }));
});
