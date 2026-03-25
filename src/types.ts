export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  image: string;
  detailImages?: string[];
  category: string;
  featured?: boolean;
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
