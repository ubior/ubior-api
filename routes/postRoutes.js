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

router.delete('/:postId', postController.deletePost);

module.exports = router;
