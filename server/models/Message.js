import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    shopkeeper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['shopkeeper', 'customer'],
      required: true,
    },
    body: { type: String, required: true, trim: true },
    readByShopkeeper: { type: Boolean, default: false },
    readByCustomer: { type: Boolean, default: false },
    deliveredToShopkeeper: { type: Boolean, default: false },
    deliveredToCustomer: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Message', messageSchema);
