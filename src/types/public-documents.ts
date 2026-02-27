export type Jurisdiction = 'quebec' | 'canada' | 'europe' | 'france' | 'usa';

export interface PublicDocument {
  id: string;
  jurisdiction: Jurisdiction;
  category_slug: string;
  category_name: string;
  category_description: string;
  category_order: number;
  title: string;
  file_name: string;
  file_type: 'pdf' | 'html';
  file_url: string;
  summary_purpose: string;
  summary_content: string;
  summary_governance: string;
  document_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentCategory {
  slug: string;
  name: string;
  description: string;
  order: number;
  documents: PublicDocument[];
}

export const JURISDICTIONS: { value: Jurisdiction; label: string }[] = [
  { value: 'quebec', label: 'Qu\u00e9bec' },
  { value: 'canada', label: 'Canada' },
  { value: 'europe', label: 'Europe' },
  { value: 'france', label: 'France' },
  { value: 'usa', label: 'USA' },
];
