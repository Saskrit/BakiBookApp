import mongoose from 'mongoose';

const EXPENSE_CATEGORIES = [
  'Stock',
  'Rent',
  'Utilities',
  'Transport',
  'Salary',
  'Marketing',
  'Maintenance',
  'Other',
];

const expenseSchema = new mongoose.Schema(
  {
    shopkeeper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: EXPENSE_CATEGORIES,
      default: 'Other',
    },
    note: { type: String, trim: true, default: '' },
    expenseDate: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

expenseSchema.index({ shopkeeper: 1, expenseDate: -1 });

export { EXPENSE_CATEGORIES };
export default mongoose.model('Expense', expenseSchema);
