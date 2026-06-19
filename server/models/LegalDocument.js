import mongoose from 'mongoose';

const subsectionSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: '' },
    paragraphs: [{ type: String, trim: true }],
    bullets: [{ type: String, trim: true }],
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    paragraphs: [{ type: String, trim: true }],
    bullets: [{ type: String, trim: true }],
    subsections: [subsectionSchema],
    contactEmail: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const legalDocumentSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      enum: ['terms', 'data-policy'],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    sections: {
      type: [sectionSchema],
      default: [],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

const LegalDocument = mongoose.model('LegalDocument', legalDocumentSchema);

export default LegalDocument;
