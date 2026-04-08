const express = require('express');
const router = express.Router();
const { getBudget, updateBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getBudget);
router.put('/', updateBudget);

module.exports = router;
