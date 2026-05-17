const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/appError');
const { buildSequentialRegex } = require('../utils/buildSequentialRegex');
const itemService = require('./itemService');

class UserService {
  async createUser(userData) {
    return await userRepository.create(userData);
  }

  async login(identifier, password) {
    const user = await userRepository.findByEmailOrUsername(identifier);
    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new AppError('Invalid email/username or password', 401);
    }
    return user;
  }

  async logout(userId) {
    const user = await userRepository.setLoggedOutAt(userId, new Date());
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return user;
  }

  async saveRefreshToken(userId, refreshToken, expiresAt) {
    const user = await userRepository.findByIdWithRefreshToken(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const refreshTokenHash = user.hashRefreshToken(refreshToken);

    return await userRepository.updateRefreshToken(
      userId,
      refreshTokenHash,
      expiresAt,
    );
  }

  async validateRefreshToken(userId, refreshToken) {
    const user = await userRepository.findByIdWithRefreshToken(userId);

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    if (!user.refreshTokenHash || !user.refreshTokenExpiresAt) {
      throw new AppError('Invalid refresh session.', 401);
    }

    if (user.refreshTokenExpiresAt < new Date()) {
      throw new AppError('Refresh token expired.', 401);
    }

    if (!user.correctRefreshToken(refreshToken)) {
      throw new AppError('Invalid refresh token.', 401);
    }

    return user;
  }

  async revokeRefreshToken(userId) {
    const user = await userRepository.clearRefreshToken(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return user;
  }

  async updateUser(userId, data) {
    const user = await userRepository.update(userId, data);
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return user;
  }

  async getUserById(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return user;
  }

  async getMe(userId) {
    const user = await userRepository.findMe(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return user;
  }

  async updatePrivacy(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const updatedPrivacy = !user.private;

    if (!updatedPrivacy && user.private) {
      await userRepository.update(userId, {
        $set: {
          private: updatedPrivacy,
          requests: [],
        },
        $addToSet: {
          followers: { $each: user.requests },
        },
      });

      for (const requesterId of user.requests) {
        await userRepository.addFollowing(requesterId, userId);
      }

      return 'public';
    }

    const toggled = await userRepository.update(userId, {
      private: updatedPrivacy,
    });

    return toggled.private ? 'private' : 'public';
  }

  async updatePassword(userId, data) {
    return await userRepository.updatePassword(userId, data);
  }

  async deleteMe(userId) {
    return await userRepository.delete(userId);
  }

  #isSameUser(usernameX, usernameY) {
    if (usernameX === usernameY)
      throw new AppError('Could not perform this action.', 400);
  }

  isFollowing(user, target) {
    return (
      user.following.includes(target.id) && target.followers.includes(user.id)
    );
  }

  async followUser(username, targetUsername) {
    this.#isSameUser(username, targetUsername);

    const user = await userRepository.findByUsername(username);
    const targetUser = await userRepository.findByUsername(targetUsername);
    if (!user || !targetUser) {
      throw new AppError('User not found.', 404);
    }

    if (this.isFollowing(user, targetUser)) {
      await userRepository.removeFollower(targetUser.id, user.id);
      await userRepository.removeFollowing(user.id, targetUser.id);
      return 'unfollowed';
    }

    if (targetUser.private) {
      if (targetUser.requests.includes(user.id)) {
        await userRepository.removeRequest(targetUser.id, user.id);
        return 'unrequested';
      }

      await userRepository.addRequest(targetUser.id, user.id);
      return 'requested';
    }

    await userRepository.addFollower(targetUser.id, user.id);
    await userRepository.addFollowing(user.id, targetUser.id);
    return 'followed';
  }

  async removeFollower(username, targetUsername) {
    this.#isSameUser(username, targetUsername);

    const user = await userRepository.findByUsername(username);
    const targetUser = await userRepository.findByUsername(targetUsername);
    if (!user || !targetUser) {
      throw new AppError('User not found.', 404);
    }

    if (this.isFollowing(targetUser, user)) {
      await userRepository.removeFollower(user.id, targetUser.id);
      await userRepository.removeFollowing(targetUser.id, user.id);
      return 'removed';
    }

    throw new AppError('User not found in followers');
  }

  async handleRequest(username, targetUsername, action = 'deny') {
    this.#isSameUser(username, targetUsername);

    const user = await userRepository.findByUsername(username);
    const targetUser = await userRepository.findByUsername(targetUsername);
    if (!user || !targetUser) {
      throw new AppError('User not found.', 404);
    }

    if (user.requests.includes(targetUser.id)) {
      await userRepository.removeRequest(user.id, targetUser.id);
      if (action === 'accept') {
        await userRepository.addFollower(user.id, targetUser.id);
        await userRepository.addFollowing(targetUser.id, user.id);

        return 'accepted';
      } else if (action === 'deny') {
        return 'denied';
      }
      throw new AppError('Could not perform this action.', 400);
    }
    throw new AppError('User not found in requests.', 404);
  }

  async getWardrobe(userId, search) {
    const nameRegex = buildSequentialRegex(search);

    if (!nameRegex) {
      const user = await userRepository.findWardrobe(userId);
      if (!user) {
        throw new AppError('User not found.', 404);
      }
      return user.items;
    }

    return await userRepository.findWardrobeItems(userId, nameRegex);
  }

  async addWardrobeItems(userId, items) {
    const user = await userRepository.addWardrobeItems(userId, items);
    return user.items;
  }

  async removeWardrobeItems(userId, items) {
    const user = await userRepository.removeWardrobeItems(userId, items);
    return user.items;
  }
}

module.exports = new UserService();
