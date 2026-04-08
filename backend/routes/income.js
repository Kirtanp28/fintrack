const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { addIncome, getIncome, deleteIncome, getIncomeAnalytics } = require('../controllers/incomeController');
const { protect } = require('../middleware/auth');

const incomeValidation = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('source').trim().notEmpty().withMessage('Source is required')
];

router.use(protect);

router.get('/analytics', getIncomeAnalytics);
router.post('/', incomeValidation, addIncome);
router.get('/', getIncome);
router.delete('/:id', deleteIncome);

module.exports = router;
