const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const photo = require('../middlewares/photo');
const closetController = require('../controllers/closetController');

// Protect middleware
router.use(auth.protect);

router
  .route('/')
  .post(
    photo.uploadPhoto,
    closetController.createCloset,
    photo.resizePhoto('closet', 500, undefined, 'ubior-closet-photos'),
    closetController.finalizeCloset,
  );

router
  .route('/:closetId')
  .get(closetController.getCloset)
  .patch(
    closetController.getClosetId,
    photo.uploadPhoto,
    photo.resizePhoto('closet', 500, undefined, 'ubior-closet-photos'),
    closetController.updateCloset,
  )
  .delete(closetController.deleteCloset);

router
  .route('/:closetId/items')
  .post(closetController.addItems)
  .delete(closetController.removeItems);

module.exports = router;
