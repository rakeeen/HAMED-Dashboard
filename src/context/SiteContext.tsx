import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SITE_CONFIG as DEFAULT_CONFIG, PROJECTS as DEFAULT_PROJECTS, TIMELINE as DEFAULT_TIMELINE, COMPETENCIES as DEFAULT_COMPETENCIES } from '../constants';
import { Project, TimelineItem, Competency } from '../types';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
  status: 'new' | 'read' | 'replied';
}

interface UISettings {
  showCursor: boolean;
  theme: 'dark' | 'light';
}

interface SiteContextType {
  siteConfig: typeof DEFAULT_CONFIG;
  projects: Project[];
  timeline: TimelineItem[];
  competencies: Competency[];
  inquiries: Inquiry[];
  settings: UISettings;
  updateConfig: (config: Partial<typeof DEFAULT_CONFIG>) => void;
  updateProjects: (projects: Project[]) => void;
  updateTimeline: (timeline: TimelineItem[]) => void;
  updateCompetencies: (competencies: Competency[]) => void;
  updateSettings: (settings: Partial<UISettings>) => void;
  addInquiry: (inquiry: Omit<Inquiry, 'id' | 'date' | 'status'>) => void;
  markInquiryRead: (id: string) => void;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider = ({ children }: { children: ReactNode }) => {
  const [siteConfig, setSiteConfig] = useState(DEFAULT_CONFIG);
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [timeline, setTimeline] = useState(DEFAULT_TIMELINE);
  const [competencies, setCompetencies] = useState(DEFAULT_COMPETENCIES);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [settings, setSettings] = useState<UISettings>({ showCursor: true, theme: 'dark' });

  // Load from localStorage on mount and sync across tabs
  useEffect(() => {
    const loadData = () => {
      const saved = localStorage.getItem('site_data');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (data.siteConfig) setSiteConfig(data.siteConfig);
          if (data.projects) setProjects(data.projects);
          if (data.timeline) setTimeline(data.timeline);
          if (data.competencies) setCompetencies(data.competencies);
          if (data.inquiries) setInquiries(data.inquiries);
          if (data.settings) setSettings(data.settings);
        } catch (e) { console.error(e); }
      }
    };

    loadData();

    // Listen for cross-tab changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'site_data') {
        loadData();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('site_data', JSON.stringify({
      siteConfig,
      projects,
      timeline,
      competencies,
      inquiries,
      settings
    }));
  }, [siteConfig, projects, timeline, competencies, inquiries, settings]);

  const updateConfig = (config: Partial<typeof DEFAULT_CONFIG>) => setSiteConfig(prev => ({ ...prev, ...config }));
  const updateProjects = (newProjects: Project[]) => setProjects(newProjects);
  const updateTimeline = (newTimeline: TimelineItem[]) => setTimeline(newTimeline);
  const updateCompetencies = (newCompetencies: Competency[]) => setCompetencies(newCompetencies);
  const updateSettings = (newSettings: Partial<UISettings>) => setSettings(prev => ({ ...prev, ...newSettings }));
  
  const addInquiry = (inquiry: Omit<Inquiry, 'id' | 'date' | 'status'>) => {
    const newInquiry: Inquiry = {
      ...inquiry,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      status: 'new'
    };
    setInquiries(prev => [newInquiry, ...prev]);
  };

  const markInquiryRead = (id: string) => {
    setInquiries(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'read' } : inv));
  };

  return (
    <SiteContext.Provider value={{
      siteConfig,
      projects,
      timeline,
      competencies,
      inquiries,
      settings,
      updateConfig,
      updateProjects,
      updateTimeline,
      updateCompetencies,
      updateSettings,
      addInquiry,
      markInquiryRead
    }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSiteContext = () => {
  const context = useContext(SiteContext);
  if (!context) throw new Error('useSiteContext must be used within a SiteProvider');
  return context;
};
