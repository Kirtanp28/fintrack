const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { addExpense, getExpenses, updateExpense, deleteExpense, getExpenseAnalytics } = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

const expenseValidation = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('category').isIn(['Food', 'Travel', 'Shopping', 'Bills', 'Investment', 'Other'])
    .withMessage('Invalid category')
];

router.use(protect);

router.get('/analytics', getExpenseAnalytics);
router.post('/', expenseValidation, addExpense);
router.get('/', getExpenses);
router.put('/:id', expenseValidation, updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
