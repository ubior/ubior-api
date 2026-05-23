const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const searchController = require('../controllers/searchController');

router.use(auth.protect);
router.get('/', searchController.search);

module.exports = router;
