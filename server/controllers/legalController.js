import LegalDocument from '../models/LegalDocument.js';

const formatDocument = (doc) => ({
  slug: doc.slug,
  title: doc.title,
  sections: doc.sections,
  lastUpdated: doc.lastUpdated,
  updatedAt: doc.updatedAt,
});

export const listLegalDocuments = async (_req, res) => {
  try {
    const documents = await LegalDocument.find()
      .select('slug title lastUpdated updatedAt')
      .sort({ slug: 1 });

    res.json({
      success: true,
      documents: documents.map((doc) => ({
        slug: doc.slug,
        title: doc.title,
        lastUpdated: doc.lastUpdated,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLegalDocument = async (req, res) => {
  try {
    const { slug } = req.params;
    const document = await LegalDocument.findOne({ slug });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Legal document not found' });
    }

    res.json({ success: true, document: formatDocument(document) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLegalDocument = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, sections } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    if (!Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one section is required' });
    }

    const document = await LegalDocument.findOneAndUpdate(
      { slug },
      {
        title: title.trim(),
        sections,
        lastUpdated: new Date(),
        updatedBy: req.user._id,
      },
      { new: true, runValidators: true }
    );

    if (!document) {
      return res.status(404).json({ success: false, message: 'Legal document not found' });
    }

    res.json({
      success: true,
      message: 'Legal document updated',
      document: formatDocument(document),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
