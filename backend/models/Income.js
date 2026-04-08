const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  source: {
    type: String,
    required: [true, 'Source is required'],
    trim: true,
    maxlength: [100, 'Source cannot exceed 100 characters']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    default: ''
  }
}, { timestamps: true });

incomeSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Income', incomeSchema);
