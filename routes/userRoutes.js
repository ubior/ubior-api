const express = require('express');
const router = express.Router();
const photo = require('../middlewares/photo');
const auth = require('../middlewares/auth');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');

const test = (req, res) => {
  res.send('Hello World');
};

router.post(
  '/signup',
  photo.uploadPhoto,
  authController.signup,
  photo.resizePhoto('user', 500, 500, 'ubior-user-photos'),
  authController.finalizeSignup,
);
router.post('/login', authController.login);
router.post('/refreshToken', authController.refreshToken);
router.get('/logout', authController.logout);

router.post('/forgotPassword', test);
router.patch('/resetPassword/:token', test);

// Protect middleware
router.use(auth.protect);

router.get('/authStatus', authController.getAuthStatus);

router.get('/me', userController.getMe);
router.get('/me/stats', userController.getMyStats);
router.get('/me/followers', userController.getMyFollowers);
router.get('/me/following', userController.getMyFollowing);
router.get('/me/requests', userController.getMyRequests);
router.get('/me/posts', userController.getMyPosts, postController.getUserPosts);

router.patch(
  '/updateMyPhoto',
  photo.uploadPhoto,
  photo.resizePhoto('user', 500, 500, 'ubior-user-photos'),
  userController.updateMyPhoto,
);

router.patch('/updateMe', userController.updateMe);
router.patch('/updateMyPrivacy', userController.updateMyPrivacy);
router.patch('/updateMyPassword', userController.updateMyPassword);
router.delete('/deleteMe', userController.deleteMe);

router.patch('/follow/:username', userController.follow);
router.patch('/removeFollower/:username', userController.removeFollower);

router.patch(
  '/acceptRequest/:username',
  userController.handleRequest('accept'),
);
router.patch('/denyRequest/:username', userController.handleRequest('deny'));

router.get('/wardrobe', userController.getWardrobe);
router
  .route('/wardrobe/items')
  .post(userController.addWardrobeItems)
  .delete(userController.removeWardrobeItems);

module.exports = router;
