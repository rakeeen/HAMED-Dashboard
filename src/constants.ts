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
  heroGiantText: {
    en: '',
    ar: '',
    it: ''
  },
  button1Text: {
    en: '',
    ar: '',
    it: ''
  },
  button2Text: {
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
  tools: [],
  contactForm: {
    enabled: true,
    heading: { en: 'Send a Letter', ar: 'ابعت رسالة بروح زمان', it: 'Invia una Lettera' },
    subtitle: { en: 'Old school vibes. New school response time.', ar: 'طابع كلاسيكي، بس برد عليك طيارة.', it: 'Atmosfera vintage. Tempi di risposta moderni.' },
    labelName: { en: 'Your Name', ar: 'اسمك إيه؟', it: 'Il tuo Nome' },
    labelEmail: { en: 'Your Email', ar: 'إيميلك', it: 'La tua Email' },
    labelMessage: { en: 'Your Message', ar: 'عايز تقول إيه؟', it: 'Il tuo Messaggio' },
    placeholderName: { en: "Who's writing?", ar: 'سجل اسمك هنا', it: 'Chi scrive?' },
    placeholderEmail: { en: 'So I can write back', ar: 'عشان أعرف أرد عليك', it: 'Così posso risponderti' },
    placeholderMessage: { en: "What's on your mind?", ar: 'حابب تقول إيه؟', it: 'Cosa hai in mente?' },
    btnText: { en: 'Send It!', ar: 'طيّر الرسالة', it: 'Invia!' },
    successHeading: { en: 'Letter sent!', ar: 'الرسالة طارت!', it: 'Lettera inviata!' },
    successBody: { en: "I'll get back to you. Promise.", ar: 'هرد عليك قريب، مفيش كلام.', it: 'Ti risponderò presto. Promesso.' },
    responseTime: { en: 'I respond within 24hrs', ar: 'برد في أقل من يوم', it: 'Rispondo entro 24 ore' },
  }
};

export const PROJECTS: Project[] = [];

export const TIMELINE: TimelineItem[] = [];

export const COMPETENCIES: Competency[] = [];
