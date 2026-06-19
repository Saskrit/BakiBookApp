import mongoose from 'mongoose';

const paymentSubmissionSchema = new mongoose.Schema(
  {
    shopkeeper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ['eSewa', 'Khalti', 'Bank Transfer'],
      required: true,
    },
    payType: {
      type: String,
      enum: ['custom', 'transaction', 'item'],
      default: 'custom',
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      default: null,
    },
    itemIndex: { type: Number, default: null },
    itemName: { type: String, trim: true, default: '' },
    payLabel: { type: String, trim: true, default: '' },
    screenshotUrl: { type: String, required: true, trim: true },
    note: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'reported'],
      default: 'pending',
      index: true,
    },
    reviewNote: { type: String, trim: true, default: '' },
    reportReason: { type: String, trim: true, default: '' },
    reviewedAt: { type: Date, default: null },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('PaymentSubmission', paymentSubmissionSchema);
