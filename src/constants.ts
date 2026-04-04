import { Project, TimelineItem, Competency } from './types';

export const SITE_CONFIG = {
  name: { en: 'Hamed Walid', ar: 'حامد وليد', it: 'Hamed Walid' },
  role: { 
    en: 'Product-Focused UI/UX Designer', 
    ar: 'UX/UI ديزاينر مركز ع المنتج', 
    it: 'UI/UX Designer Focalizzato sul Prodotto' 
  },
  location: { en: '', ar: '', it: '' },
  email: 'Hamed.rakeeen@gmail.com',
  summary: {
    en: '',
    ar: '',
    it: ''
  },
  detailed_summary: {
    en: '',
    ar: '',
    it: ''
  },
  socials: {
    x: 'https://x.com/Rakeeeeeeen',
    linkedin: 'https://www.linkedin.com/in/rakeeen/',
    behance: 'https://www.behance.net/rakeeen',
  },
  siteImages: {
    aboutPortrait: '',
    contactBackground: '',
    projectDetail1: '',
    projectDetail2: '',
    projectDetail3: ''
  },
  tools: []
};

export const PROJECTS: Project[] = [];

export const TIMELINE: TimelineItem[] = [];

export const COMPETENCIES: Competency[] = [];
