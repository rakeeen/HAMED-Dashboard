export type DynamicSectionType = 'text' | 'image' | 'video';
export interface DynamicSection {
  id: string;
  type: DynamicSectionType;
  content: string;
  order: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  image: string;
  detailImages?: string[];
  category: string;
  featured?: boolean;
  link?: string;
  github?: string;
  content?: string;
  client?: string;
  role?: string;
  duration?: string;
  challenge?: string;
  painPoints?: string;
  solution?: string;
  architecture?: string;
  strategy?: string;
  dynamicSections?: DynamicSection[];
}

export interface TimelineItem {
  year: string;
  role: string;
  company: string;
  description: string;
  tags: string[];
}

export interface Competency {
  title: string;
  description: string;
  icon: string;
}
