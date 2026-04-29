const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const photo = require('../middlewares/photo');
const outfitController = require('../controllers/outfitController');

// Protect middleware
router.use(auth.protect);

router
  .route('/')
  .post(
    photo.uploadPhoto,
    outfitController.createOutfit,
    photo.resizePhoto('outfit', 500, undefined, 'ubior-outfit-photos'),
    outfitController.finalizeOutfit,
  );

router
  .route('/:outfitId')
  .get(outfitController.getOutfit)
  .patch(
    outfitController.getOutfitId,
    photo.uploadPhoto,
    photo.resizePhoto('outfit', 500, undefined, 'ubior-outfit-photos'),
    outfitController.updateOutfit,
  )
  .delete(outfitController.deleteOutfit);

module.exports = router;
