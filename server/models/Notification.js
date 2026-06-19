import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['warning', 'success', 'info'],
      default: 'info',
    },
    read: { type: Boolean, default: false },
    archived: { type: Boolean, default: false, index: true },
    linkPath: { type: String, trim: true, default: '' },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
