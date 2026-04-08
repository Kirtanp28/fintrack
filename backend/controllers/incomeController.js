const { validationResult } = require('express-validator');
const Income = require('../models/Income');

// POST /api/income
const addIncome = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { amount, source, description, date } = req.body;
  
  try {
    const income = new Income({
      userId: req.user.id,
      amount: parseFloat(amount),
      source,
      notes: description || '',
      date: date ? new Date(date) : new Date()
    });

    await income.save();

    const incomeObj = income.toObject();
    incomeObj.description = incomeObj.notes;
    incomeObj.id = incomeObj._id;

    res.status(201).json({ success: true, income: incomeObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// GET /api/income
const getIncome = async (req, res) => {
  try {
    const userIncomes = await Income.find({ userId: req.user.id }).sort({ date: -1 });
    
    const formattedIncomes = userIncomes.map(i => {
      const obj = i.toObject();
      obj.id = obj._id;
      obj.description = obj.notes;
      return obj;
    });

    res.json({ success: true, incomes: formattedIncomes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/income/:id
const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!income) {
      return res.status(404).json({ success: false, message: 'Income not found' });
    }
    
    res.json({ success: true, message: 'Income deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/income/analytics
const getIncomeAnalytics = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    const incomes = await Income.find({ 
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });
    
    const monthTotals = {};

    incomes.forEach(i => {
      const month = i.date.getMonth() + 1;
      monthTotals[month] = (monthTotals[month] || 0) + i.amount;
    });

    const monthlyIncome = Object.keys(monthTotals).map(m => ({
      _id: { month: parseInt(m) },
      total: monthTotals[m]
    }));

    res.json({ success: true, monthlyIncome });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { addIncome, getIncome, deleteIncome, getIncomeAnalytics };
