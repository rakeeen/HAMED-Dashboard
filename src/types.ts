export type DynamicSectionType = 'text' | 'image' | 'video';

export interface LocalizedString {
  en: string;
  ar: string;
  it: string;
}

export type LocalizedField = LocalizedString | string;

export interface DynamicSection {
  id: string;
  type: DynamicSectionType;
  content: LocalizedField;
  order: number;
}

export interface Project {
  id: string;
  title: LocalizedField;
  description: LocalizedField;
  tags: LocalizedField[];
  image: string;
  detailImages?: string[];
  category: LocalizedField;
  featured?: boolean;
  link?: string;
  github?: string;
  content?: string;
  client?: LocalizedField;
  role?: LocalizedField;
  duration?: LocalizedField;
  challenge?: LocalizedField;
  painPoints?: LocalizedField;
  solution?: LocalizedField;
  architecture?: LocalizedField;
  strategy?: LocalizedField;
  dynamicSections?: DynamicSection[];
}

export interface TimelineItem {
  year: LocalizedField;
  role: LocalizedField;
  company: LocalizedField;
  description: LocalizedField;
  tags: LocalizedField[];
}

export interface Competency {
  id: string;
  title: LocalizedField;
  description: LocalizedField;
  icon: string;
}
