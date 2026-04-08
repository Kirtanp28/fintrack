const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

// GET /api/budget
const getBudget = async (req, res) => {
  try {
    const today = new Date();
    const month = parseInt(req.query.month) || today.getMonth() + 1;
    const year = parseInt(req.query.year) || today.getFullYear();

    let budget = await Budget.findOne({ userId: req.user.id, month, year });
    
    // Default budget if not assigned
    if (!budget) {
      budget = new Budget({
        userId: req.user.id,
        month,
        year,
        totalBudget: 0,
        categoryBudgets: {
          Food: 0,
          Travel: 0,
          Shopping: 0,
          Bills: 0,
          Investment: 0,
          Other: 0
        }
      });
      await budget.save();
    }

    // Calculate spending for this month properly in UTC
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const expenses = await Expense.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });

    let totalSpent = 0;
    const spendingByCategory = {};

    expenses.forEach(e => {
      // If expenses are stored as negative (e.g. -100), we should probably take the absolute value or just add. 
      // Let's take Math.abs() in case frontend sends negative amounts, though schema expects > 0.
      const amount = Math.abs(e.amount);
      totalSpent += amount;
      spendingByCategory[e.category] = (spendingByCategory[e.category] || 0) + amount;
    });
    
    res.json({ success: true, budget, totalSpent, spendingByCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/budget
const updateBudget = async (req, res) => {
  try {
    const today = new Date();
    const month = parseInt(req.body.month) || today.getMonth() + 1;
    const year = parseInt(req.body.year) || today.getFullYear();

    let budget = await Budget.findOne({ userId: req.user.id, month, year });
    
    if (!budget) {
      budget = new Budget({ 
        userId: req.user.id, 
        month, 
        year, 
        totalBudget: req.body.totalBudget || 0,
        categoryBudgets: req.body.categoryBudgets || {}
      });
    } else {
      if (req.body.totalBudget !== undefined) budget.totalBudget = req.body.totalBudget;
      if (req.body.categoryBudgets) {
        budget.categoryBudgets = { ...budget.categoryBudgets, ...req.body.categoryBudgets };
      }
    }

    await budget.save();
    
    res.json({ success: true, budget });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getBudget, updateBudget };
