import mongoose from 'mongoose';
import crypto from 'crypto';

const customerSchema = new mongoose.Schema(
  {
    shopkeeper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    linkedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    linkStatus: {
      type: String,
      enum: ['unlinked', 'pending', 'linked', 'rejected'],
      default: 'unlinked',
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    address: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    creditScore: {
      type: String,
      enum: ['Excellent', 'Good', 'Average', 'Risky', 'Defaulter'],
      default: 'Good',
    },
    balance: { type: Number, default: 0, min: 0 },
    notes: { type: String, trim: true, default: '' },
    qrCode: { type: String, unique: true, sparse: true },
    messagingBlocked: { type: Boolean, default: false },
    chatHiddenAt: { type: Date, default: null },
    customerChatHiddenAt: { type: Date, default: null },
    lastCreditDate: { type: Date, default: null },
    lastPaymentDate: { type: Date, default: null },
  },
  { timestamps: true }
);

customerSchema.index(
  { shopkeeper: 1, phone: 1 },
  {
    unique: true,
    partialFilterExpression: { phone: { $gt: '' } },
  }
);

customerSchema.pre('save', function generateQr(next) {
  if (!this.qrCode) {
    this.qrCode = `BB-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
  }
  next();
});

export default mongoose.model('Customer', customerSchema);
