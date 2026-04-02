import { Project, TimelineItem, Competency } from './types';

export const SITE_CONFIG = {
  name: { en: 'Hamed Walid', ar: 'حامد وليد', it: 'Hamed Walid' },
  role: { 
    en: 'Product-Focused UI/UX Designer | AI Integrator', 
    ar: 'UX/UI ديزاينر مركز ع المنتج | مدمج ذكاء اصطناعي', 
    it: 'UI/UX Designer Focalizzato sul Prodotto | Integratore AI' 
  },
  location: { en: '', ar: '', it: '' },
  email: 'Hamed.rakeeen@gmail.com',
  summary: {
    en: 'UI/UX Designer bridging complex business logic and human-centered design. Leveraging AI workflows to accelerate delivery by 10X — every pixel serves a purpose.',
    ar: 'UX/UI ديزاينر بيوصل بين منطق البيزنس المعقد وتصميم مريح للناس. بستخدم الـ AI عشان أسرع التسليم 10 أضعاف — كل بكسل له دور.',
    it: 'UI/UX Designer che unisce la complessa logica aziendale e il design orientato all\'uomo. Sfrutto l\'intelligenza artificiale per accelerare la consegna di 10 volte — ogni pixel ha uno scopo.'
  },
  detailed_summary: {
    en: 'UI/UX Designer bridging complex business logic and human-centered design. Leveraging AI workflows to accelerate delivery by 10X — every pixel serves a purpose.',
    ar: 'UX/UI ديزاينر بيوصل بين منطق البيزنس المعقد وتصميم مريح للناس. بستخدم الـ AI عشان أسرع التسليم 10 أضعاف — كل بكسل له دور.',
    it: 'UI/UX Designer che unisce la complessa logica aziendale e il design orientato all\'uomo. Sfrutto l\'intelligenza artificialه per accelerare la consegna di 10 volte — ogni pixel ha uno scopo.'
  },
  socials: {
    x: 'https://x.com/Rakeeeeeeen',
    linkedin: 'https://www.linkedin.com/in/rakeeen/',
    behance: 'https://www.behance.net/rakeeen',
  },
  siteImages: {
    aboutPortrait: '/hamed_portrait.jpg',
    contactBackground: '/old_road.png',
    projectDetail1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9klW_cfF-8n7D00AzX-du6k2WKlgyizY5r0r-IbdUqg3jGjNYVKT-XoEU1io1hP38fyahcRohwIxj-rGZD0-3siP5X9uBJIDjB3rnYw_-iJCD1gRIF2CGZIJp0PjsbHseVKAxnI_1OlRSLeEtPrsECulquUw7evmH-i-BYCubQzuQBrRv83ZUHL6qStpEosQEz2lpFQXWKtr_8pkvo5ZQx4hZLQ-dI4Yh3m5CSGB9_yLp4sXlXOEq40w8FDUVwGZXpIDst7QmkDRY',
    projectDetail2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdPDBofmGncyBE1srfqvQUTU_2KsUl0uEZldTpxbTr_esn2ulmOTibDs8RzQ28jn1gwSyEXRWPhmvL5GUceC1YG80_alVDGyPotOm2XUKp4rbqs4BiDsYFnKq9h1ZPT_NkeDMrloMurZtqLeI3yglNn5s5bjwedQYZItSG1D1wVcBS2-_63A6_Zqc0Vn3A1Xfr0dlEZT7k9eQIfCtZA_h5mxiCNGzi_IT3H369vmbUvkN8c6seipTbP4Cf3sbYT3QZ5K_In9UEtU-Y',
    projectDetail3: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkirkdA-zx8jyVgU0OLGKWvcSxPqbo80BGe5RaVTi_4hziPm6GOLUvl1Au_dMSgLGmfKy1qHEiP_jDzYBdXVA2fwHfZL0y8ed8SXhi_zB2n6BdY6Jt3BexA0ZdZ2Xd4fj0Ks8AF9xZ2QZPD2fKyzKgdsULwzSKDJ7sBE17pDHsQH9U7AGlolE2FzSfaYOwDsIaO3T3uIp1H4ncXnh3PsKT8aFdcP5lhVMpxgIhrO66hj63QS_ZUGDaz1dLJCpBcWd-Lq9-DqCDOkp6'
  },
  tools: ['Figma', 'ADOBEs', 'Framer']
};

export const PROJECTS: Project[] = [
  {
    id: 'alhayat-app',
    title: { en: 'Alhayat App', ar: 'تطبيق الحياة', it: 'App Alhayat' },
    description: { 
        en: 'Led end-to-end UI/UX for a Saudi-based family-centric platform. Designed the "Family Management" feature enabling bookings for non-tech-savvy family members, expanding accessibility to older generations.',
        ar: 'محطة الـ UI/UX لمشروع "الحياة" في السعودية للعائلات. صممت ميزة "إدارة العيلة" اللي بتخلي أي حد يحجز للأفراد اللي ملهومش في التكنولوجيا، وده سهل الدنيا جداً لكبار السن.',
        it: 'Ho guidato UI/UX dall\'inizio alla fine per una piattaforma saudita focalizzata sulla famiglia. Ho progettato la funzione "Gestione Famiglia" che consente le prenotazioni ai membri meno esperti.'
    },
    tags: [
        { en: 'UI/UX Design', ar: 'تجربة المستخدم', it: 'Design UI/UX' },
        { en: 'Mobile App', ar: 'تطبيقات موبايل', it: 'App Mobile' },
        { en: 'Saudi Arabia', ar: 'السعودية', it: 'Arabia Saudita' }
    ],
    category: { en: 'Enterprise', ar: 'تطبيقات شركات', it: 'Aziendale' },
    client: { en: 'Alhayat Co.', ar: 'شركة الحياة', it: 'Alhayat Co.' },
    duration: { en: '6 Months', ar: '6 شهور', it: '6 Mesi' },
    image: 'https://picsum.photos/seed/alhayat/1200/800',
    featured: true
  },
  {
    id: 'revenue-dashboard',
    title: { en: 'Revenue Management Dashboard', ar: 'لوحة إدارة الإيرادات', it: 'Dashboard di Gestione Ricavi' },
    description: {
        en: 'Designed a private revenue management system used by 1,500+ users, transforming complex financial data into intuitive, actionable visual insights.',
        ar: 'صممت نظام خاص لإدارة الإيرادات بيستخدمه أكتر من 1500 مستخدم، وحولت فيه البيانات المالية المعقدة لرسومات واضحة وسهلة.',
        it: 'Ho progettato un sistema privato di gestione ricavi utilizzato da 1.500+ utenti.'
    },
    tags: [
        { en: 'Dashboards', ar: 'لوحات تحكم', it: 'Dashboard' },
        { en: 'Data Viz', ar: 'تحليل بيانات', it: 'Data Viz' }
    ],
    category: { en: 'Enterprise', ar: 'تطبيقات شركات', it: 'Aziendale' },
    client: { en: 'Private FinTech', ar: 'شركة فين-تيك خاصة', it: 'FinTech Privata' },
    duration: { en: '4 Months', ar: '4 شهور', it: '4 Mesi' },
    image: 'https://picsum.photos/seed/dashboard/800/800',
    featured: true
  },
  {
    id: 'tamam-app',
    title: { en: 'Tamam — On-Demand Services', ar: 'تطبيق تمام للخدمات', it: 'Tamam — Servizi On-Demand' },
    description: {
        en: 'Built the full user experience for a geo-location service app connecting technicians with households, focusing on reliability and ease of use.',
        ar: 'عملت تجربة المستخدم كاملة لتطبيق خدمات منزلة بيوصل الفنيين بالبيوت عن طريق الـ GPS.',
        it: 'Costruito l\'esperienza utente completa per un\'app di servizi basata sulla geolocalizzazione.'
    },
    tags: [
        { en: 'Mobile UX', ar: 'موبايل UX', it: 'UX Mobile' },
        { en: 'On-Demand', ar: 'عند الطلب', it: 'Su Richiesta' }
    ],
    category: { en: 'Consumer', ar: 'تطبيقات أفراد', it: 'Consumatore' },
    client: { en: 'Tamam Startup', ar: 'ستارت-أب تمام', it: 'Startup Tamam' },
    duration: { en: '8 Months', ar: '8 شهور', it: '8 Mesi' },
    image: 'https://picsum.photos/seed/tamam/800/800',
    featured: true
  },
  {
    id: 'wiqaa',
    title: { en: 'Wiqaa (وِقْعَة)', ar: 'وِقْعَة (Wiqaa)', it: 'Wiqaa' },
    description: {
        en: 'Founded and built an end-to-end internal system and customer journey for a startup solving daily life challenges. Managed team workflows and led "Design for Business" strategy.',
        ar: 'أسست وبنيت نظام داخلي كامل ورحلة عميل لشركة ناشئة بتقدم حلول لتحديات الحياة اليومية.',
        it: 'Ho fondato e costruito un sistema interno end-to-end e il customer journey per una startup.'
    },
    tags: [
        { en: 'Startup', ar: 'شركة ناشئة', it: 'Startup' },
        { en: 'Product Design', ar: 'تصميم منتج', it: 'Design Prodotto' }
    ],
    category: { en: 'Productivity', ar: 'إنتاجية', it: 'Produttività' },
    client: { en: 'Wiqaa Systems', ar: 'شركة وِقْعَة', it: 'Sistemi Wiqaa' },
    duration: { en: '1.5 Years', ar: 'سنة ونص', it: '1.5 Anni' },
    image: 'https://picsum.photos/seed/wiqaa/800/800',
    featured: true
  }
];

export const TIMELINE: TimelineItem[] = [
  {
    year: { en: 'Sept 2025 — Present', ar: 'سبتمبر ٢٠٢٥ — الآن', it: 'Sett 2025 — Presente' },
    role: { en: 'UI/UX Designer', ar: 'UI/UX ديزاينر', it: 'Design UI/UX' },
    company: { en: 'Alhayat Company', ar: 'شركة الحياة', it: 'Azienda Alhayat' },
    description: { 
        en: 'Led the UI/UX phase for the "Alhayat" app from scratch, collaborating with cross-functional teams. Designed the "Family Management" feature expanding accessibility to older generations. Simplified complex navigation flows, ensuring a seamless experience for a growing user base in KSA.',
        ar: 'مسكت مرحلة الـ UI/UX لتطبيق "الحياة" من الصفر بالشراكة مع فرق تانية. صممت ميزة "إدارة العيلة" اللي سهلت الدنيا لكبار السن.',
        it: 'Ho guidato la fase UI/UX dell\'app "Alhayat" da zero, collaborando con team multifunzionali.'
    },
    tags: [
        { en: 'Saudi Arabia', ar: 'السعودية', it: 'Arabia Saudita' },
        { en: 'Full-Time', ar: 'دوام كامل', it: 'Tempo Pieno' }
    ]
  },
  {
    year: { en: '2022 — Sept 2025', ar: '٢٠٢٢ — سبتمبر ٢٠٢٥', it: '2022 — Sett 2025' },
    role: { en: 'Freelance UI/UX Designer', ar: 'UI/UX ديزاينر حر (Freelance)', it: 'Designer UI/UX Freelance' },
    company: { en: 'International Projects', ar: 'مشاريع دولية', it: 'Progetti Internazionali' },
    description: {
        en: 'Delivered high-impact designs across Egypt, KSA, and Canada. Designed a revenue management system for 1,500+ users. Built Tamam App UX for on-demand geo-location services. Integrated AI Prompt Engineering into design cycles for rapid prototyping, reducing time-to-market significantly.',
        ar: 'خلصت مشاريع تقيلة في مصر والسعودية وكندا. صممت نظام لإدارة الأرباح لـ 1500 مستخدم.',
        it: 'Ho fornito design di grande impatto in Egitto, Arabia Saudita e Canada.'
    },
    tags: [
        { en: 'Egypt', ar: 'مصر', it: 'Egitto' },
        { en: 'KSA', ar: 'السعودية', it: 'Arabia Saudita' },
        { en: 'Canada', ar: 'كندا', it: 'Canada' }
    ]
  }
];

export const COMPETENCIES: Competency[] = [
  {
    title: { en: 'UX Mastery', ar: 'أساسيات الـ UX', it: 'Padronanza UX' },
    description: { 
        en: 'User Research, Wireframing, Information Architecture, Usability Testing, Problem Solving, User Flows, Responsive Web Design.',
        ar: 'أبحاث المستخدمين، Wireframing، بنية المعلومات، اختبار سهولة الاستخدام.',
        it: 'Ricerca degli utenti, Wireframing, Architettura dell\'informazione.'
    },
    icon: 'design_services'
  },
  {
    title: { en: 'UI & Visuals', ar: 'الـ UI والمرئيات', it: 'UI e Visuals' },
    description: {
        en: 'Minimalist Design, Color Theory, Typography, Visual Storytelling, Design Systems, Brand Identity.',
        ar: 'التصميم المينيماليست، نظرية الألوان، التيبوجرافي، سرد القصة بالمرئيات.',
        it: 'Design Minimalista, Teoria dei colori, Tipografia.'
    },
    icon: 'palette'
  },
  {
    title: { en: 'AI Productivity', ar: 'إنتاجية الـ AI', it: 'Produttività IA' },
    description: {
        en: 'AI-Assisted Prototyping, Prompt Engineering (Layouts & Copywriting), Design Automation, 10X delivery acceleration.',
        ar: 'تصميم البروتوتايب بمساعدة الـ AI، الـ Prompt Engineering، أتمتة التصميم.',
        it: 'Prototipazione assistita dall\'IA, Ingegneria dei prompt.'
    },
    icon: 'auto_awesome'
  },
  {
    title: { en: 'Tools', ar: 'الأدوات اللي بستخدمها', it: 'Strumenti' },
    description: {
        en: 'Figma (Power User), Adobe Creative Suite (PS, AI, PR, AE), ADOBEs, Zeplin, VS Code, Framer (Beginner).',
        ar: 'فيجما (مستخدم متمكن)، أدوات أدوبي، زيبلاين، وفريمر.',
        it: 'Figma (Power User), Adobe Creative Suite, VS Code.'
    },
    icon: 'construction'
  },
  {
    title: { en: 'Soft Skills', ar: 'مهارات التواصل وشخصيتي', it: 'Competenze Trasversali' },
    description: {
        en: 'Communication, Collaboration, Problem-Solving, Time Management, Critical Thinking.',
        ar: 'التواصل، الشغل في فريق، حل المشاكل، إدارة الوقت.',
        it: 'Comunicazione, Collaborazione, Risoluzione dei problemi.'
    },
    icon: 'psychology'
  },
  {
    title: { en: 'Languages & Certifications', ar: 'اللغات والشهادات', it: 'Lingue e Certificazioni' },
    description: {
        en: 'Arabic (Native), English (Good). Google Foundations of UX Design (Professional Certificate).',
        ar: 'العربية (لغتي الأم)، الإنجليزية (جيد جداً).',
        it: 'Arabo (Madrelingua), Inglese (Buono).'
    },
    icon: 'language'
  }
];
