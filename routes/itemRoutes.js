const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const photo = require('../middlewares/photo');
const itemController = require('../controllers/itemController');

// Protect middleware
router.use(auth.protect);

router
  .route('/')
  .get(itemController.getAllItems)
  .post(
    photo.uploadPhoto,
    itemController.createItem,
    photo.resizePhoto('item', 500, undefined, 'ubior-item-photos'),
    itemController.finalizeItem,
  );

router
  .route('/:itemId')
  .get(itemController.getItem)
  .delete(itemController.deleteItem);

module.exports = router;
