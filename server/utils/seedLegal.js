import LegalDocument from '../models/LegalDocument.js';
import { legalSeedDocuments } from '../data/legalSeed.js';

export const seedLegalDocuments = async () => {
  for (const doc of legalSeedDocuments) {
    const existing = await LegalDocument.findOne({ slug: doc.slug });

    if (!existing) {
      await LegalDocument.create(doc);
      console.log(`Seeded legal document: ${doc.slug}`);
    }
  }
};
