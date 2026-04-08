const Expense = require('../models/Expense');
const Income = require('../models/Income');

// POST /api/ai/analyze
const analyzeFinances = async (req, res) => {
  try {
    const userId = req.user.id;
    const expenses = await Expense.find({ userId });
    const incomes = await Income.find({ userId });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : 0;

    // Spending by category
    const byCategory = {};
    expenses.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    const sortedCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
    const topCategory = sortedCategories.length > 0 ? sortedCategories[0] : null;

    // Generate insights
    const insights = [];

    if (totalIncome === 0) {
      insights.push({
        type: 'info',
        title: 'Start tracking income',
        message: 'Add your income sources to get personalized financial insights.'
      });
    } else if (parseFloat(savingsRate) < 10) {
      insights.push({
        type: 'warning',
        title: 'Low savings rate',
        message: `Your savings rate is ${savingsRate}%. Aim for at least 20% by reducing discretionary spending.`
      });
    } else if (parseFloat(savingsRate) >= 20) {
      insights.push({
        type: 'success',
        title: 'Great savings rate!',
        message: `You're saving ${savingsRate}% of your income. Consider investing the surplus for long-term growth.`
      });
    }

    if (topCategory) {
      insights.push({
        type: 'info',
        title: `Top spending: ${topCategory[0]}`,
        message: `You spent $${topCategory[1].toFixed(2)} on ${topCategory[0]}. Review if this aligns with your financial goals.`
      });
    }

    if (byCategory['Food'] && totalExpenses > 0 && (byCategory['Food'] / totalExpenses) > 0.35) {
      insights.push({
        type: 'warning',
        title: 'High food spending',
        message: 'Food takes up more than 35% of your expenses. Consider meal prepping to reduce costs.'
      });
    }

    if (byCategory['Investment'] && totalIncome > 0 && (byCategory['Investment'] / totalIncome) >= 0.15) {
      insights.push({
        type: 'success',
        title: 'Good investing habit',
        message: "You're investing over 15% of your income. Keep it up for long-term financial health!"
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: 'info',
        title: 'Add more data',
        message: 'Track more expenses and income to receive personalized AI insights.'
      });
    }

    res.json({
      success: true,
      analysis: {
        totalIncome,
        totalExpenses,
        savings,
        savingsRate: parseFloat(savingsRate),
        byCategory,
        insights
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { analyzeFinances };
