const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const photo = require('../middlewares/photo');
const postController = require('../controllers/postController');

// Protect middleware
router.use(auth.protect);

router.post(
  '/create',
  photo.uploadPhoto,
  postController.createPost,
  photo.resizePhoto('post', 800, undefined, 'ubior-post-photos'),
  postController.finalizePost,
);

router.get('/feed', postController.getFeed);
router.get('/user/:username', postController.getUserPosts);
router.get('/:postId', postController.getPost);
router.patch('/like/:postId', postController.likePost);

router.delete('/:postId', postController.deletePost);

module.exports = router;
