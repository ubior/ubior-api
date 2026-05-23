const { buildSequentialRegex } = require('../utils/buildSequentialRegex');
const itemRepository = require('../repositories/itemRepository');
const postRepository = require('../repositories/postRepository');
const userRepository = require('../repositories/userRepository');

class SearchService {
  async search(userId, term, type, cursor, limit) {
    const regex = buildSequentialRegex(term);
    if (!regex) return { users: [], posts: [], items: [] };

    if (type === 'users') {
      const { users, nextCursor } = await userRepository.searchUsers(
        regex,
        limit,
        cursor,
      );
      return { users, nextCursor };
    }

    if (type === 'posts') {
      const { posts, nextCursor } = await postRepository.searchPosts(
        regex,
        userId,
        limit,
        cursor,
      );
      return { posts, nextCursor };
    }

    if (type === 'items') {
      const { items, nextCursor } = await itemRepository.searchItems(
        regex,
        limit,
        cursor,
      );
      return { items, nextCursor };
    }

    const [users, posts, items] = await Promise.all([
      userRepository.searchUsers(regex, 3),
      postRepository.searchPosts(regex, userId, 3),
      itemRepository.searchItems(regex, 4),
    ]);

    return { users: users.users, posts: posts.posts, items: items.items };
  }
}

module.exports = new SearchService();
