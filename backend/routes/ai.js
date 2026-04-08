const express = require('express');
const router = express.Router();
const { analyzeFinances } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/analyze', protect, analyzeFinances);

module.exports = router;
