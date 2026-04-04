import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SITE_CONFIG as DEFAULT_CONFIG, PROJECTS as DEFAULT_PROJECTS, TIMELINE as DEFAULT_TIMELINE, COMPETENCIES as DEFAULT_COMPETENCIES } from '../constants';
import { Project, TimelineItem, Competency } from '../types';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

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
  isSyncing: boolean;
  hasUnpublishedChanges: boolean;
  updateConfig: (config: Partial<typeof DEFAULT_CONFIG>) => void;
  updateProjects: (projects: Project[]) => void;
  updateTimeline: (timeline: TimelineItem[]) => void;
  updateCompetencies: (competencies: Competency[]) => void;
  updateSettings: (settings: Partial<UISettings>) => void;
  publishContent: () => Promise<void>;
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
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);

  // Initial Load from Firestore
  useEffect(() => {
    const docRef = doc(db, 'content', 'main');
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.siteConfig) setSiteConfig(data.siteConfig);
        if (data.projects) setProjects(data.projects);
        if (data.timeline) setTimeline(data.timeline);
        if (data.competencies) setCompetencies(data.competencies);
        if (data.settings) setSettings(data.settings);
      }
    });
    return () => unsub();
  }, []);

  // Debounced Auto-save for Site Config & Settings
  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsSyncing(true);
      try {
        const docRef = doc(db, 'content', 'main');
        await setDoc(docRef, { 
          siteConfig, 
          settings 
        }, { merge: true });
      } catch (err) {
        console.error('Auto-save failed:', err);
      } finally {
        setIsSyncing(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [siteConfig, settings]);

  const updateConfig = (config: Partial<typeof DEFAULT_CONFIG>) => setSiteConfig(prev => ({ ...prev, ...config }));
  
  const updateProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    setHasUnpublishedChanges(true);
  };
  
  const updateTimeline = (newTimeline: TimelineItem[]) => {
    setTimeline(newTimeline);
    setHasUnpublishedChanges(true);
  };
  
  const updateCompetencies = (newCompetencies: Competency[]) => {
    setCompetencies(newCompetencies);
    setHasUnpublishedChanges(true);
  };
  
  const updateSettings = (newSettings: Partial<UISettings>) => setSettings(prev => ({ ...prev, ...newSettings }));
  
  const publishContent = async () => {
    setIsSyncing(true);
    try {
      const docRef = doc(db, 'content', 'main');
      await setDoc(docRef, { 
        projects, 
        timeline, 
        competencies 
      }, { merge: true });
      setHasUnpublishedChanges(false);
    } catch (err) {
      console.error('Publish failed:', err);
      alert('Failed to publish changes. Check your connection.');
    } finally {
      setIsSyncing(false);
    }
  };

  const addInquiry = (inquiry: Omit<Inquiry, 'id' | 'date' | 'status'>) => {
    // Inquiries are handled separately (usually incoming from the main site)
    // For now, we just update local state
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
      isSyncing,
      hasUnpublishedChanges,
      updateConfig,
      updateProjects,
      updateTimeline,
      updateCompetencies,
      updateSettings,
      publishContent,
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
