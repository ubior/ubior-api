const getSignedImageUrl = require('./getSignedImageUrl');

const signPost = async (postDoc, userId) => {
  const post = postDoc.toObject({ virtuals: true });

  const likeIds = Array.isArray(post.likes) ? post.likes : [];
  post.likesCount = likeIds.length;
  post.liked = userId
    ? likeIds.some((id) => id.toString() === userId.toString())
    : false;

  post.likes = undefined;

  if (post.user?.photoBlob) {
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
};

const signPosts = async (posts, userId) => {
  if (!Array.isArray(posts) || posts.length === 0) return [];
  return await Promise.all(posts.map((post) => signPost(post, userId)));
};

const signUser = async (user) => {
  if (user.photoBlob) {
    const key = user.photoBlob;
    const signedUrl = await getSignedImageUrl(key, 300, 'ubior-user-photos');
    user.photoBlob = undefined;
    user.photo = signedUrl;
  }
};

const signUsers = async (users) => {
  if (!Array.isArray(users) || users.length === 0) return;
  await Promise.all(
    users.map(async (user) => {
      if (user.photoBlob) {
        user.photo = await getSignedImageUrl(
          user.photoBlob,
          300,
          'ubior-user-photos',
        );
        user.photoBlob = undefined;
      }
    }),
  );
};

const signItem = async (item) => {
  if (item.photoBlob) {
    const key = item.photoBlob;
    const signedUrl = await getSignedImageUrl(key, 300, 'ubior-item-photos');
    item.photoBlob = undefined;
    item.photo = signedUrl;
  }
};

const signItems = async (items, signOwner = false) => {
  if (!Array.isArray(items) || items.length === 0) return;
  await Promise.all(
    items.map(async (item) => {
      if (item.photoBlob) {
        item.photo = await getSignedImageUrl(
          item.photoBlob,
          300,
          'ubior-item-photos',
        );
        item.photoBlob = undefined;
      }

      if (signOwner && item.user?.photoBlob) {
        item.user.photo = await getSignedImageUrl(
          item.user.photoBlob,
          300,
          'ubior-user-photos',
        );
        item.user.photoBlob = undefined;
      }
    }),
  );
};

const signOutfit = async (outfit) => {
  if (outfit.photoBlob) {
    const key = outfit.photoBlob;
    const signedUrl = await getSignedImageUrl(key, 300, 'ubior-outfit-photos');
    outfit.photoBlob = undefined;
    outfit.photo = signedUrl;

    if (Array.isArray(outfit.items)) {
      await Promise.all(
        outfit.items.map(async (item) => {
          if (!item?.photoBlob) return;

          item.photo = await getSignedImageUrl(
            item.photoBlob,
            300,
            'ubior-item-photos',
          );
          item.photoBlob = undefined;
        }),
      );
    }
  }
};

const signOutfits = async (outfits) => {
  if (!Array.isArray(outfits) || outfits.length === 0) return;
  await Promise.all(
    outfits.map(async (outfit) => {
      outfit.itemsCount = Array.isArray(outfit.items) ? outfit.items.length : 0;
      outfit.items = undefined;

      if (outfit.photoBlob) {
        outfit.photo = await getSignedImageUrl(
          outfit.photoBlob,
          300,
          'ubior-outfit-photos',
        );
        outfit.photoBlob = undefined;
      }
    }),
  );
};

const signCloset = async (closet) => {
  if (closet.photoBlob) {
    const key = closet.photoBlob;
    const signedUrl = await getSignedImageUrl(key, 300, 'ubior-closet-photos');
    closet.photoBlob = undefined;
    closet.photo = signedUrl;

    if (Array.isArray(closet.items)) {
      await Promise.all(
        closet.items.map(async (item) => {
          if (!item?.photoBlob) return;

          item.photo = await getSignedImageUrl(
            item.photoBlob,
            300,
            'ubior-item-photos',
          );
          item.photoBlob = undefined;
        }),
      );
    }
  }
};

const signClosets = async (closets) => {
  if (!Array.isArray(closets) || closets.length === 0) return;
  await Promise.all(
    closets.map(async (closet) => {
      closet.itemsCount = Array.isArray(closet.items) ? closet.items.length : 0;
      closet.items = undefined;

      if (closet.photoBlob) {
        closet.photo = await getSignedImageUrl(
          closet.photoBlob,
          300,
          'ubior-closet-photos',
        );
        closet.photoBlob = undefined;
      }
    }),
  );
};

module.exports = {
  signPost,
  signPosts,
  signUser,
  signUsers,
  signItem,
  signItems,
  signOutfit,
  signOutfits,
  signCloset,
  signClosets,
};
