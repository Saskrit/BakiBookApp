import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    shopkeeper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    normalizedName: { type: String, required: true, trim: true, lowercase: true },
    lastPrice: { type: Number, default: 0, min: 0 },
    usageCount: { type: Number, default: 0, min: 0 },
    lastUsedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

productSchema.index({ shopkeeper: 1, normalizedName: 1 }, { unique: true });
productSchema.index({ shopkeeper: 1, usageCount: -1, lastUsedAt: -1 });

export default mongoose.model('Product', productSchema);
