const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  totalBudget: { type: Number, default: 0 },
  categoryBudgets: {
    Food: { type: Number, default: 0 },
    Travel: { type: Number, default: 0 },
    Shopping: { type: Number, default: 0 },
    Bills: { type: Number, default: 0 },
    Investment: { type: Number, default: 0 },
    Other: { type: Number, default: 0 }
  }
}, { timestamps: true });

budgetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
