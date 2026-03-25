import { Project, TimelineItem, Competency } from './types';

export const SITE_CONFIG = {
  name: 'Hamed Walid',
  role: 'Product-Focused UI/UX Designer | AI Integrator',
  location: 'Cairo, Egypt',
  email: 'Hamed.rakeeen@gmail.com',
  summary: 'UI/UX Designer with 3+ years of experience bridging the gap between complex business logic and human-centered design. From an early start in graphic design to building scalable digital products in Egypt and Saudi Arabia — my focus has always been Simplicity. I leverage AI workflows to accelerate prototyping and delivery by 10X, ensuring that every pixel serves a purpose and every journey is frictionless.',
  detailed_summary: 'UI/UX Designer with 3+ years of experience bridging complex business logic and human-centered design. Leveraging AI workflows to accelerate delivery by 10X — every pixel serves a purpose.',
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
    title: 'Alhayat App',
    description: 'Led end-to-end UI/UX for a Saudi-based family-centric platform. Designed the "Family Management" feature enabling bookings for non-tech-savvy family members, expanding accessibility to older generations.',
    tags: ['UI/UX Design', 'Mobile App', 'Saudi Arabia'],
    category: 'Enterprise',
    image: 'https://picsum.photos/seed/alhayat/1200/800',
    featured: true
  },
  {
    id: 'revenue-dashboard',
    title: 'Revenue Management Dashboard',
    description: 'Designed a private revenue management system used by 1,500+ users, transforming complex financial data into intuitive, actionable visual insights.',
    tags: ['Dashboards', 'Data Visualization', 'UX Research'],
    category: 'Enterprise',
    image: 'https://picsum.photos/seed/dashboard/800/800',
    featured: true
  },
  {
    id: 'tamam-app',
    title: 'Tamam — On-Demand Services',
    description: 'Built the full user experience for a geo-location service app connecting technicians with households, focusing on reliability and ease of use.',
    tags: ['Mobile UX', 'Geo-Location', 'On-Demand'],
    category: 'Consumer',
    image: 'https://picsum.photos/seed/tamam/800/800',
    featured: true
  },
  {
    id: 'wiqaa',
    title: 'Wiqaa (وِقْعَة)',
    description: 'Founded and built an end-to-end internal system and customer journey for a startup solving daily life challenges. Managed team workflows and led "Design for Business" strategy.',
    tags: ['Startup', 'Product Design', 'Brand Identity'],
    category: 'Education',
    image: 'https://picsum.photos/seed/wiqaa/800/800',
    featured: true
  }
];

export const TIMELINE: TimelineItem[] = [
  {
    year: 'Sept 2025 — Present',
    role: 'UI/UX Designer',
    company: 'Alhayat Company',
    description: 'Led the UI/UX phase for the "Alhayat" app from scratch, collaborating with cross-functional teams. Designed the "Family Management" feature expanding accessibility to older generations. Simplified complex navigation flows, ensuring a seamless experience for a growing user base in KSA.',
    tags: ['Saudi Arabia', 'Full-Time', 'On-site']
  },
  {
    year: '2022 — Sept 2025',
    role: 'Freelance UI/UX Designer',
    company: 'International Projects',
    description: 'Delivered high-impact designs across Egypt, KSA, and Canada. Designed a revenue management system for 1,500+ users. Built Tamam App UX for on-demand geo-location services. Integrated AI Prompt Engineering into design cycles for rapid prototyping, reducing time-to-market significantly.',
    tags: ['Egypt', 'KSA', 'Canada', 'Remote']
  }
];

export const COMPETENCIES: Competency[] = [
  {
    title: 'UX Mastery',
    description: 'User Research, Wireframing, Information Architecture, Usability Testing, Problem Solving, User Flows, Responsive Web Design.',
    icon: 'design_services'
  },
  {
    title: 'UI & Visuals',
    description: 'Minimalist Design, Color Theory, Typography, Visual Storytelling, Design Systems, Brand Identity.',
    icon: 'palette'
  },
  {
    title: 'AI Productivity',
    description: 'AI-Assisted Prototyping, Prompt Engineering (Layouts & Copywriting), Design Automation, 10X delivery acceleration.',
    icon: 'auto_awesome'
  },
  {
    title: 'Tools',
    description: 'Figma (Power User), Adobe Creative Suite (PS, AI, PR, AE), ADOBEs, Zeplin, VS Code, Framer (Beginner).',
    icon: 'construction'
  },
  {
    title: 'Soft Skills',
    description: 'Communication, Collaboration, Problem-Solving, Time Management, Critical Thinking.',
    icon: 'psychology'
  },
  {
    title: 'Languages & Certifications',
    description: 'Arabic (Native), English (Good). Google Foundations of UX Design (Professional Certificate).',
    icon: 'language'
  }
];
