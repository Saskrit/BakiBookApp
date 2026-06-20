import { request } from './client';

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  contactEmail?: string;
};

export type LegalDocument = {
  slug: string;
  title: string;
  sections: LegalSection[];
  lastUpdated?: string;
};

export const fetchLegalDocuments = () =>
  request<{
    success: boolean;
    documents: Array<{ slug: string; title: string; lastUpdated?: string }>;
  }>('/legal');

export const fetchLegalDocument = (slug: string) =>
  request<{ success: boolean; document: LegalDocument }>(`/legal/${slug}`);
