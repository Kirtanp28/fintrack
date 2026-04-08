const { validationResult } = require('express-validator');
const Expense = require('../models/Expense');

// POST /api/expenses
const addExpense = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { amount, category, description, date } = req.body;
  
  try {
    const expense = new Expense({
      userId: req.user.id,
      amount: parseFloat(amount),
      category,
      notes: description || '',
      date: date ? new Date(date) : new Date()
    });

    await expense.save();

    // To be compatible with frontend expecting `description`
    const expenseObj = expense.toObject();
    expenseObj.description = expenseObj.notes;
    expenseObj.id = expenseObj._id;

    res.status(201).json({ success: true, expense: expenseObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// GET /api/expenses
const getExpenses = async (req, res) => {
  try {
    const userExpenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
    
    // Map to what frontend expects
    const formattedExpenses = userExpenses.map(e => {
      const obj = e.toObject();
      obj.id = obj._id;
      obj.description = obj.notes;
      return obj;
    });

    res.json({ success: true, expenses: formattedExpenses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/expenses/:id
const updateExpense = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user.id });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    const { amount, category, description, date } = req.body;
    if (amount !== undefined) expense.amount = parseFloat(amount);
    if (category !== undefined) expense.category = category;
    if (description !== undefined) expense.notes = description;
    if (date !== undefined) expense.date = new Date(date);

    await expense.save();

    const expenseObj = expense.toObject();
    expenseObj.description = expenseObj.notes;
    expenseObj.id = expenseObj._id;

    res.json({ success: true, expense: expenseObj });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/expenses/:id
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    
    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/expenses/analytics
const getExpenseAnalytics = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    const expenses = await Expense.find({ 
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });
    
    const monthTotals = {};
    const categoryTotals = {};

    expenses.forEach(e => {
      const month = e.date.getMonth() + 1;
      monthTotals[month] = (monthTotals[month] || 0) + e.amount;
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const monthlyData = Object.keys(monthTotals).map(m => ({
      _id: { month: parseInt(m) },
      total: monthTotals[m]
    }));

    const categoryData = Object.keys(categoryTotals).map(c => ({
      _id: c,
      total: categoryTotals[c]
    }));

    res.json({ success: true, monthlyData, categoryData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { addExpense, getExpenses, updateExpense, deleteExpense, getExpenseAnalytics };
