import React, { useState } from 'react';
import { useSiteContext } from '../context/SiteContext';
import { SITE_CONFIG as DEFAULT_CONFIG, PROJECTS as DEFAULT_PROJECTS, TIMELINE as DEFAULT_TIMELINE, COMPETENCIES as DEFAULT_COMPETENCIES } from '../constants';
import { DASHBOARD_I18N } from '../dashboard_i18n';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, Users, FolderKanban, FileText, Download, Trash, AlertTriangle,
  Save, Plus, Trash2, Globe, Briefcase, Star, X, Pencil
} from 'lucide-react';
import { Project, TimelineItem, Competency } from '../types';
import { db, storage } from '../firebase';
import { doc, setDoc, collection, query, orderBy, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

import { MascotFace } from '../components/ui/MascotFace';

type DashboardTab = 'analytics' | 'branding' | 'projects' | 'resume' | 'settings';
type DashboardLang = 'en' | 'ar' | 'it';

export const Dashboard = () => {
  const { 
    siteConfig, updateConfig, 
    projects, updateProjects, 
    timeline, updateTimeline,
    competencies, updateCompetencies,
    settings, updateSettings 
  } = useSiteContext();
  
  const [activeTab, setActiveTab] = useState<DashboardTab>('analytics');
  const [lang, setLang] = useState<DashboardLang>('en');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const [adminEmail, setAdminEmail] = useState(localStorage.getItem('hamed_admin_email') || 'admin@admin.com');
  const [adminPass, setAdminPass] = useState(localStorage.getItem('hamed_admin_pass') || 'admin');

  // Modals state
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project> | null>(null);

  const [isEditingTimeline, setIsEditingTimeline] = useState(false);
  const [currentTimeline, setCurrentTimeline] = useState<Partial<TimelineItem> | null>(null);

  const [isEditingCompetency, setIsEditingCompetency] = useState(false);
  const [currentCompetency, setCurrentCompetency] = useState<Partial<Competency> | null>(null);

  const [inquiries, setInquiries] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState({ visitors: 0, inquiries: 0 });
  const [currentInquiry, setCurrentInquiry] = useState<any>(null);

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; desc: string; onConfirm: () => void } | null>(null);

  React.useEffect(() => {
    const unsubInq = onSnapshot(query(collection(db, 'inquiries'), orderBy('createdAt', 'desc')), (snap) => {
      setInquiries(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubAna = onSnapshot(doc(db, 'analytics', 'main'), (snap) => {
      if(snap.exists()) setAnalytics(snap.data() as any);
    });
    return () => { unsubInq(); unsubAna(); };
  }, []);

  React.useEffect(() => {
    if (settings?.theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [settings?.theme]);

  const lastSavedData = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (projects.length === 0 && !siteConfig.name) return; // Ignore unmounted state
    
    // Stringify heavy snapshot
    const currentData = JSON.stringify({ siteConfig, projects, timeline, competencies, settings });
    if (lastSavedData.current === null) {
      lastSavedData.current = currentData;
      return;
    }
    
    if (currentData === lastSavedData.current) return; // No delta

    const timer = setTimeout(async () => {
      try {
        setSaveStatus('Auto-saving...');
        await setDoc(doc(db, 'content', 'main'), {
          siteConfig, projects, timeline, competencies, settings
        });
        lastSavedData.current = currentData;
        setSaveStatus('All changes saved');
        setTimeout(() => setSaveStatus(null), 2500);
      } catch (e) {
        console.error("Auto-save failed", e);
        setSaveStatus('Auto-save failed');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [siteConfig, projects, timeline, competencies, settings]);

  const t = DASHBOARD_I18N[lang];
  const isRTL = lang === 'ar';

  const handleSave = async () => {
    try {
      setSaveStatus('Saving to Cloud...');
      await setDoc(doc(db, 'content', 'main'), {
        siteConfig,
        projects,
        timeline,
        competencies,
        settings
      });
      setSaveStatus('Changes Saved!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (e: any) {
      console.error("Firebase save error", e);
      setAlertMessage("❌ فشل الحفظ في السحابة!\nفايربيز يرفض تعديلك لأنك لم تقم بتفعيل صلاحيات القراءة والكتابة في قاعدة البيانات.\n\nمن فضلك اذهب إلى:\nFirebase Console > Firestore Database > Rules\nوغيّر السطر إلى:\nallow read, write: if true;\n\nالخطأ الفني: " + e.message);
      setSaveStatus('Failed to Save');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const clearInquiries = async () => {
    setConfirmDialog({
      title: "Clear Inbox",
      desc: "Are you absolutely sure you want to permanently delete all client messages? This action cannot be undone.",
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          // Fire and forget batch drops to clear list quickly
          inquiries.forEach(inq => {
            deleteDoc(doc(db, 'inquiries', inq.id)).catch(console.error);
          });
        } catch(e: any) {
          setAlertMessage(e.message);
        }
      }
    });
  };

  const saveProject = () => {
    if (!currentProject?.title) return;
    if (currentProject.id) {
      updateProjects(projects.map(p => p.id === currentProject.id ? currentProject as Project : p));
    } else {
      updateProjects([{...currentProject as Project, id: Date.now().toString()}, ...projects]);
    }
    setIsEditingProject(false);
  };

  const deleteProject = (id: string) => {
    setConfirmDialog({
      title: "Delete Project",
      desc: "Are you sure you want to delete this project? This cannot be undone.",
      onConfirm: () => {
        updateProjects(projects.filter(p => p.id !== id));
        setConfirmDialog(null);
      }
    });
  };

  const saveTimeline = () => {
    if (!currentTimeline?.role) return;
    const index = timeline.findIndex(t => t.role === currentTimeline.role && t.company === currentTimeline.company);
    if (index >= 0) {
      const newT = [...timeline];
      newT[index] = currentTimeline as TimelineItem;
      updateTimeline(newT);
    } else {
      updateTimeline([currentTimeline as TimelineItem, ...timeline]);
    }
    setIsEditingTimeline(false);
  };

  const deleteTimeline = (item: TimelineItem) => {
    setConfirmDialog({
      title: "Delete Experience",
      desc: "Are you sure you want to delete this experience entry?",
      onConfirm: () => {
        updateTimeline(timeline.filter(t => t.role !== item.role || t.company !== item.company));
        setConfirmDialog(null);
      }
    });
  };

  const saveCompetency = () => {
    if (!currentCompetency?.title) return;
    const index = competencies.findIndex(c => c.title === currentCompetency.title);
    if (index >= 0) {
      const newC = [...competencies];
      newC[index] = currentCompetency as Competency;
      updateCompetencies(newC);
    } else {
      updateCompetencies([...competencies, currentCompetency as Competency]);
    }
    setIsEditingCompetency(false);
  };

  const deleteCompetency = (title: string) => {
    setConfirmDialog({
      title: "Delete Competency",
      desc: "Are you sure you want to delete this competency?",
      onConfirm: () => {
        updateCompetencies(competencies.filter(c => c.title !== title));
        setConfirmDialog(null);
      }
    });
  };

  const tabs: { id: DashboardTab; label: string; icon: any; badge?: number }[] = [
    { id: 'analytics', label: t.nav_analytics, icon: Users, badge: inquiries.filter(i => !i.read).length },
    { id: 'branding', label: t.nav_branding, icon: FileText },
    { id: 'projects', label: t.nav_projects, icon: FolderKanban },
    { id: 'resume', label: t.nav_resume, icon: Briefcase },
    { id: 'settings', label: t.nav_settings, icon: Settings },
  ];

  return (
    <div className={`min-h-screen pt-12 pb-12 px-4 md:px-8 w-full max-w-[1440px] mx-auto flex flex-col md:flex-row gap-8 ${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Sidebar - hidden when printing */}
      <aside className="w-full md:w-72 flex-shrink-0 space-y-4 print:hidden">
        <div className="mb-10 px-4 flex flex-col items-center text-center">
          <div className="mb-4 p-5 sketchy-border bg-white/5 inline-block -rotate-2">
            <MascotFace size={80} color="var(--ink)" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter sketch-font">{siteConfig.name?.en || 'HAMED'}</h1>
          <p className="text-[10px] uppercase tracking-widest text-secondary opacity-50 mt-1">Professional Portfolio CMS</p>
        </div>

        <nav className="space-y-1.5">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all relative group ${activeTab === tab.id ? 'bg-primary text-black font-bold rotate-1 shadow-lg' : 'hover:bg-white/5 text-secondary'}`}
            >
              <tab.icon size={20} className={activeTab === tab.id ? 'text-black' : 'text-secondary/60'} />
              <span className="text-xs uppercase tracking-widest font-black">{tab.label}</span>
              {tab.badge ? (
                <span className="absolute right-4 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="pt-8 mt-8 border-t border-white/5 px-4">
            <div className={`custom-select-container ${isLangOpen ? 'active' : ''}`} onClick={() => setIsLangOpen(!isLangOpen)}>
                <div className="custom-select-trigger uppercase">
                    {lang}
                </div>
                <div className="custom-select-options">
                    {(['en', 'ar', 'it'] as DashboardLang[]).map((l) => (
                        <div 
                            key={l} 
                            className={`custom-select-option ${lang === l ? 'selected' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setLang(l);
                                setIsLangOpen(false);
                            }}
                        >
                            {l.toUpperCase()}
                        </div>
                    ))}
                </div>
            </div>
            <p className="text-[9px] uppercase text-secondary/30 mt-3 tracking-widest">{t.language}</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 bg-cream/5 backdrop-blur-sm rounded-[3rem] p-8 md:p-12 border border-ink/10 min-h-[700px] relative overflow-hidden">
        <div className="absolute inset-0 paper-texture opacity-30 pointer-events-none" />

        <div className="absolute top-8 right-8 flex items-center gap-4">
          {saveStatus && <span className="text-xs text-secondary animate-pulse">{saveStatus}</span>}
          
          <button 
            onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })} 
            className="p-3 sketchy-border bg-white/5 hover:bg-white/10 transition-all text-primary"
            title={t.toggle_theme}
          >
            {settings.theme === 'dark' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454z" />
                </svg>
            ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
            )}
          </button>
          
          {['projects', 'resume'].includes(activeTab) && (
            <button 
              onClick={() => {
                if (activeTab === 'projects') { setCurrentProject({}); setIsEditingProject(true); }
                if (activeTab === 'resume') { setCurrentTimeline({}); setIsEditingTimeline(true); }
              }}
              className="sketchy-btn filled scale-75"
            >
              <Plus size={16} className="inline mr-2" />
              {t.add_new}
            </button>
          )}

          {activeTab === 'analytics' && (
            <div className="flex gap-3">
              <button 
                onClick={async () => {
                  inquiries.forEach(inq => {
                    if (!inq.read) updateDoc(doc(db, 'inquiries', inq.id), { read: true }).catch(console.error);
                  });
                }} 
                className="text-[10px] uppercase font-black text-secondary border border-white/10 px-4 py-2 rounded-full hover:bg-white/5 transition-all"
              >
                Mark All Read
              </button>
              <button onClick={() => window.print()} className="text-[10px] uppercase font-black text-secondary border border-white/10 px-4 py-2 rounded-full hover:bg-white/5 transition-all">
                <Download size={14} className="inline mr-1" /> Export
              </button>
            </div>
          )}

          {activeTab !== 'analytics' && (
            <button 
              onClick={handleSave}
              className="sketchy-btn scale-75"
            >
              <Save size={16} className="inline mr-2" />
              {t.save}
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="mt-12 relative z-0">
          
          {/* Analytics & Leads Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="polaroid -rotate-1 hover:rotate-0 transition-transform">
                  <div className="flex items-center gap-3 mb-2">
                    <Users size={18} className="text-sepia" />
                    <span className="text-[10px] uppercase tracking-widest font-black opacity-50">Total Visitors</span>
                  </div>
                  <div className="text-5xl font-black sketch-font">{analytics.visitors}</div>
                  <p className="text-[9px] uppercase tracking-tighter opacity-30 mt-2">Lifetime traffic analytics</p>
                </div>
                <div className="polaroid rotate-1 hover:rotate-0 transition-transform">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText size={18} className="text-forest" />
                    <span className="text-[10px] uppercase tracking-widest font-black opacity-50">Direct Leads</span>
                  </div>
                  <div className="text-5xl font-black sketch-font">{inquiries.length}</div>
                  <p className="text-[9px] uppercase tracking-tighter opacity-30 mt-2">Inbound inquiries via contact form</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black uppercase tracking-tight sketch-font">{isRTL ? 'طلبات التواصل' : 'Contact Inquiries'}</h2>
                  {inquiries.length > 0 && (
                    <button onClick={clearInquiries} className="flex items-center gap-2 text-[10px] uppercase font-black text-red-500 hover:text-red-400">
                      <Trash2 size={12} /> Clear Inbox
                    </button>
                  )}
                </div>
                
                {inquiries.length === 0 ? (
                  <div className="p-20 text-center sketchy-border border-dashed border-white/10 opacity-20 bg-white/5">
                    <p className="sketch-font text-2xl">Inbox is empty</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {inquiries.map((inq) => (
                      <div 
                        key={inq.id} 
                        onClick={() => {
                           setCurrentInquiry(inq);
                           if(!inq.read) updateDoc(doc(db, 'inquiries', inq.id), { read: true }).catch(console.error);
                        }}
                        className={`p-6 sketchy-border bg-white/5 flex items-center justify-between hover:translate-x-2 transition-all cursor-pointer ${!inq.read ? 'border-primary' : 'border-white/10'}`}
                      >
                        <div className="flex items-center gap-6">
                            <div className={`w-3 h-3 rounded-full ${!inq.read ? 'bg-primary animate-pulse' : 'bg-white/10'}`} />
                            <div>
                                <h4 className="font-bold text-lg">{inq.name}</h4>
                                <p className="text-xs text-secondary opacity-60 tracking-wider uppercase">{inq.email}</p>
                            </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] uppercase font-black opacity-30">{inq.createdAt ? new Date(inq.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Identity & Branding Tab */}
          {activeTab === 'branding' && (
            <div className="space-y-12 max-w-4xl">
              <div className="grid grid-cols-1 gap-10">
                <LocalizedInput label="Site Display Name" value={siteConfig.name} onChange={(val: any) => updateConfig({ name: val })} />
                <LocalizedInput label="Professional Role Title" value={siteConfig.role} onChange={(val: any) => updateConfig({ role: val })} />
                <LocalizedTextarea label="Hero Summary (SEO)" value={siteConfig.summary} onChange={(val: any) => updateConfig({ summary: val })} />
                <LocalizedTextarea label="Detailed Biography" value={siteConfig.detailed_summary} onChange={(val: any) => updateConfig({ detailed_summary: val })} />
              </div>

              <div className="pt-10 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6 sketchy-border bg-white/5 space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4">Contact Info</h3>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[9px] uppercase tracking-widest opacity-40 ml-1">Location</label>
                            <input className="w-full bg-black/20 border-b border-white/10 p-2 text-sm outline-none focus:border-primary"
                                value={siteConfig.location} onChange={(e) => updateConfig({ location: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] uppercase tracking-widest opacity-40 ml-1">Admin Email</label>
                            <input className="w-full bg-black/20 border-b border-white/10 p-2 text-sm outline-none focus:border-primary"
                                value={siteConfig.email} onChange={(e) => updateConfig({ email: e.target.value })} />
                        </div>
                    </div>
                  </div>

                  <div className="p-6 sketchy-border bg-white/5 space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4">Social Presence</h3>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[9px] uppercase tracking-widest opacity-40 ml-1">Behance</label>
                            <input className="w-full bg-black/20 border-b border-white/10 p-2 text-sm outline-none focus:border-primary"
                                value={siteConfig.socials?.behance || ''} onChange={(e) => updateConfig({ socials: { ...siteConfig.socials, behance: e.target.value }})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] uppercase tracking-widest opacity-40 ml-1">LinkedIn</label>
                            <input className="w-full bg-black/20 border-b border-white/10 p-2 text-sm outline-none focus:border-primary"
                                value={siteConfig.socials?.linkedin || ''} onChange={(e) => updateConfig({ socials: { ...siteConfig.socials, linkedin: e.target.value }})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] uppercase tracking-widest opacity-40 ml-1">X (Twitter)</label>
                            <input className="w-full bg-black/20 border-b border-white/10 p-2 text-sm outline-none focus:border-primary"
                                value={siteConfig.socials?.x || ''} onChange={(e) => updateConfig({ socials: { ...siteConfig.socials, x: e.target.value }})} />
                        </div>
                    </div>
                  </div>
              </div>

              <div className="pt-10 border-t border-white/5 space-y-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-primary">Global Assets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="polaroid rotate-1">
                        <ImageInput 
                        label="About Portrait" 
                        value={siteConfig.siteImages?.aboutPortrait || ''} 
                        onChange={(e: any) => updateConfig({ siteImages: { ...siteConfig.siteImages, aboutPortrait: e.target.value }})} 
                        />
                    </div>
                    <div className="polaroid -rotate-1">
                        <ImageInput 
                        label="Contact Section BG" 
                        value={siteConfig.siteImages?.contactBackground || ''} 
                        onChange={(e: any) => updateConfig({ siteImages: { ...siteConfig.siteImages, contactBackground: e.target.value }})} 
                        />
                    </div>
                </div>
              </div>
            </div>
          )}


          {/* Portfolio Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight sketch-font mb-2">{isRTL ? 'معرض الأعمال' : 'Master Portfolio'}</h2>
                <p className="text-xs text-secondary opacity-50 uppercase tracking-widest">Digital case studies and commercial work</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {projects.map((project, i) => (
                  <div key={project.id} className={`polaroid group transition-all hover:rotate-0 ${i % 2 === 0 ? '-rotate-1' : 'rotate-1'}`}>
                    <div className="aspect-video bg-black/40 overflow-hidden mb-4 sketchy-border border-white/5 relative group">
                        <img src={project.image} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <button onClick={() => { setCurrentProject(project); setIsEditingProject(true); }} className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform"><Pencil size={18} /></button>
                            <button onClick={() => deleteProject(project.id)} className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"><Trash2 size={18} /></button>
                        </div>
                    </div>
                    <h3 className="font-bold text-lg mb-1 truncate">{typeof project.title === 'string' ? project.title : project.title?.[lang] || project.title?.en}</h3>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-black opacity-30 tracking-widest">{typeof project.category === 'string' ? project.category : project.category?.[lang] || project.category?.en}</span>
                        {project.featured && <span className="text-[9px] uppercase font-black text-sepia flex items-center gap-1"><Star size={10} fill="currentColor" /> Featured</span>}
                    </div>
                  </div>
                ))}
                
                <button 
                    onClick={() => { setCurrentProject({}); setIsEditingProject(true); }}
                    className="p-12 sketchy-border border-dashed border-white/10 flex flex-col items-center justify-center gap-4 text-secondary/30 hover:text-primary hover:border-primary transition-all group min-h-[250px]"
                >
                    <Plus size={40} className="group-hover:scale-110 transition-transform" />
                    <span className="sketch-font text-xl uppercase font-bold tracking-widest">New Case Study</span>
                </button>
              </div>
            </div>
          )}

          {/* Resume & Skills Tab */}
          {activeTab === 'resume' && (
            <div className="space-y-16">
                {/* Experience Section */}
                <section className="space-y-8">
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tight sketch-font mb-2">{isRTL ? 'الخبرة العملية' : 'Career Timeline'}</h2>
                        <p className="text-xs text-secondary opacity-50 uppercase tracking-widest">Professional journey and roles</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {timeline.map((item, i) => (
                            <div key={i} className="p-8 sketchy-border bg-white/5 group relative hover:bg-white/10 transition-all">
                                <div className="absolute top-6 right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setCurrentTimeline(item); setIsEditingTimeline(true); }} className="text-secondary hover:text-white"><Pencil size={16} /></button>
                                    <button onClick={() => deleteTimeline(item)} className="text-red-500/50 hover:text-red-500"><Trash2 size={16} /></button>
                                </div>
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="space-y-2">
                                        <span className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full font-black uppercase tracking-tighter">
                                            {typeof item.year === 'string' ? item.year : item.year?.[lang] || item.year?.en}
                                        </span>
                                        <h3 className="text-xl font-bold">{typeof item.role === 'string' ? item.role : item.role?.[lang] || item.role?.en}</h3>
                                        <p className="font-black uppercase tracking-widest text-sm text-sepia">{typeof item.company === 'string' ? item.company : item.company?.[lang] || item.company?.en}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Skills Section */}
                <section className="space-y-8 pt-12 border-t border-white/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tight sketch-font mb-2">{isRTL ? 'المهارات' : 'Competencies'}</h2>
                            <p className="text-xs text-secondary opacity-50 uppercase tracking-widest">Technical domain expertise</p>
                        </div>
                        <button onClick={() => { setCurrentCompetency({}); setIsEditingCompetency(true); }} className="p-3 sketchy-border bg-white/5 hover:bg-white/10 transition-all">
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {competencies.map((comp, i) => (
                            <div key={i} className="polaroid -rotate-1 hover:rotate-0 transition-transform group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 sketchy-border bg-primary/5 text-primary">
                                        <span className="material-symbols-rounded text-2xl">{comp.icon}</span>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => { setCurrentCompetency(comp); setIsEditingCompetency(true); }} className="text-paper/50 hover:text-paper"><Pencil size={14} /></button>
                                        <button onClick={() => deleteCompetency(comp.title as string)} className="text-red-400/50 hover:text-red-400"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg">{typeof comp.title === 'string' ? comp.title : comp.title?.[lang] || comp.title?.en}</h3>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-12 max-w-4xl">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight sketch-font mb-2">{t.nav_settings}</h2>
                <p className="text-xs text-secondary opacity-50 uppercase tracking-widest">{t.gatekeeper_desc}</p>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <div className="p-8 sketchy-border bg-white/5 space-y-8">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-widest sketch-font mb-2">{t.gatekeeper}</h3>
                    <p className="text-xs text-secondary opacity-60">{t.gatekeeper_desc}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-secondary opacity-40 ml-1">{t.admin_identity}</label>
                      <input className="w-full bg-black/20 border-b border-white/10 p-3 text-sm outline-none focus:border-primary"
                        type="email" value={adminEmail} 
                        onChange={(e) => { setAdminEmail(e.target.value); localStorage.setItem('hamed_admin_email', e.target.value); }} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-secondary opacity-40 ml-1">{t.secret_key}</label>
                      <input className="w-full bg-black/20 border-b border-white/10 p-3 text-sm outline-none focus:border-primary"
                        type="text" value={adminPass} 
                        onChange={(e) => { setAdminPass(e.target.value); localStorage.setItem('hamed_admin_pass', e.target.value); }} 
                      />
                    </div>
                  </div>
                </div>

                <div className="p-8 sketchy-border bg-white/5 space-y-6">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-widest sketch-font mb-2">{t.interface_prefs}</h3>
                    <p className="text-xs text-secondary opacity-60">{t.interface_desc}</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                            className="sketchy-btn px-10 py-3"
                        >
                            {t.toggle_theme} ({settings.theme === 'dark' ? t.theme_dark : t.theme_light})
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => updateSettings({ showCursor: !settings.showCursor })}
                            className={`sketchy-btn px-10 py-3 ${settings.showCursor ? 'filled' : ''}`}
                        >
                            {t.toggle_cursor} ({settings.showCursor ? 'ON' : 'OFF'})
                        </button>
                    </div>
                  </div>
                </div>

                <div className="p-8 sketchy-border bg-rust/5 border-rust/20 space-y-6">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-widest sketch-font mb-2 text-rust">Sync Engine</h3>
                    <p className="text-xs text-secondary opacity-60">{t.sync_desc}</p>
                  </div>
                  <button 
                    onClick={() => {
                        setConfirmDialog({
                            title: t.sync_warning,
                            desc: t.sync_warning,
                            onConfirm: async () => {
                                setConfirmDialog(null);
                                setSaveStatus('Syncing...');
                                try {
                                    await setDoc(doc(db, 'content', 'main'), {
                                        siteConfig: DEFAULT_CONFIG, projects: DEFAULT_PROJECTS,
                                        timeline: DEFAULT_TIMELINE, competencies: DEFAULT_COMPETENCIES,
                                        settings: { showCursor: true, theme: 'light' }
                                    });
                                    setSaveStatus('Cloud Synced Sucessfully');
                                    setTimeout(() => window.location.reload(), 1500);
                                } catch (e: any) { setAlertMessage(e.message); }
                            }
                        });
                    }}
                    className="sketchy-btn filled w-full md:w-auto"
                    style={{ backgroundColor: 'var(--rust)', borderColor: 'var(--rust)' }}
                  >
                    {t.sync_cloud}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>

        {isEditingProject && currentProject && (
          <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#0e0d0c] w-full max-w-2xl sketchy-border p-8 md:p-10 max-h-[90vh] overflow-y-auto relative">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black uppercase tracking-tight sketch-font">{t.edit_project}</h3>
                <button onClick={() => setIsEditingProject(false)} className="p-3 sketchy-border hover:bg-white/5 transition-colors"><X size={18} /></button>
              </div>
              <div className="space-y-10">
                <LocalizedInput label={t.project_title} value={currentProject.title} onChange={(val: any) => setCurrentProject({...currentProject, title: val})} />
                <LocalizedTextarea label={t.short_desc} value={currentProject.description} onChange={(val: any) => setCurrentProject({...currentProject, description: val})} />
                <LocalizedInput label={t.category} value={currentProject.category} onChange={(val: any) => setCurrentProject({...currentProject, category: val})} />
                
                <h4 className="pt-2 font-bold text-sm uppercase tracking-widest text-white/50 border-t border-white/10">{t.project_images}</h4>
                <ImageInput placeholder="Card Cover Image URL" value={currentProject.image || ''} onChange={(e: any) => setCurrentProject({...currentProject, image: e.target.value})} />
                
                <h4 className="pt-2 font-bold text-sm uppercase tracking-widest text-white/50 border-t border-white/10">{t.project_credits}</h4>
                <div className="grid grid-cols-1 gap-4">
                  <LocalizedInput label={isRTL ? 'العميل' : 'Client'} value={currentProject.client} onChange={(val: any) => setCurrentProject({...currentProject, client: val})} />
                  <LocalizedInput label={isRTL ? 'الدور' : 'Role'} value={currentProject.role} onChange={(val: any) => setCurrentProject({...currentProject, role: val})} />
                  <LocalizedInput label={isRTL ? 'المدة' : 'Duration'} value={currentProject.duration} onChange={(val: any) => setCurrentProject({...currentProject, duration: val})} />
                </div>

                <h4 className="pt-2 font-bold text-sm uppercase tracking-widest text-white/50 border-t border-white/10">{t.deep_dive}</h4>
                <LocalizedTextarea label={isRTL ? 'الاستراتيجية والنهج' : 'Strategy & Approach'} value={currentProject.strategy} onChange={(val: any) => setCurrentProject({...currentProject, strategy: val})} />
                <LocalizedTextarea label={isRTL ? 'التحدي' : 'The Challenge'} value={currentProject.challenge} onChange={(val: any) => setCurrentProject({...currentProject, challenge: val})} />
                <LocalizedTextarea label={isRTL ? 'الحل' : 'The Solution'} value={currentProject.solution} onChange={(val: any) => setCurrentProject({...currentProject, solution: val})} />
                <LocalizedTextarea label={isRTL ? 'أبرز الهياكل' : 'Architecture Highlights'} value={currentProject.architecture} onChange={(val: any) => setCurrentProject({...currentProject, architecture: val})} />

                <h4 className="pt-8 pb-4 font-bold text-sm uppercase tracking-widest text-white border-t border-white/10">{t.dynamic_sections}</h4>
                <div className="space-y-4">
                  {(currentProject.dynamicSections || []).sort((a,b)=>a.order-b.order).map((section, idx, arr) => (
                    <div key={section.id} className="bg-white/5 p-4 rounded-xl border border-white/10 relative group">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs uppercase font-bold text-white/50 tracking-widest">{section.type} Block</span>
                        <div className="flex gap-2">
                           <button onClick={() => {
                             if (idx === 0) return;
                             const newSecs = [...arr];
                             [newSecs[idx].order, newSecs[idx-1].order] = [newSecs[idx-1].order, newSecs[idx].order];
                             setCurrentProject({...currentProject, dynamicSections: newSecs});
                           }} className="p-1 hover:bg-white/10 rounded text-secondary hover:text-white">↑</button>
                           <button onClick={() => {
                             if (idx === arr.length - 1) return;
                             const newSecs = [...arr];
                             [newSecs[idx].order, newSecs[idx+1].order] = [newSecs[idx+1].order, newSecs[idx].order];
                             setCurrentProject({...currentProject, dynamicSections: newSecs});
                           }} className="p-1 hover:bg-white/10 rounded text-secondary hover:text-white">↓</button>
                           <button onClick={() => {
                             setCurrentProject({...currentProject, dynamicSections: arr.filter(s => s.id !== section.id)});
                           }} className="p-1 hover:bg-red-500/20 text-red-500 rounded">✕</button>
                        </div>
                      </div>
                      
                      {section.type === 'text' && (
                         <textarea className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none min-h-[100px] text-white" value={section.content} onChange={e => {
                           const newSecs = [...arr];
                           newSecs[idx] = {...section, content: e.target.value};
                           setCurrentProject({...currentProject, dynamicSections: newSecs});
                         }} placeholder="Markdown / HTML Text Content" />
                      )}
                      {section.type === 'image' && (
                         <div className="mt-2 relative z-50">
                           <ImageInput placeholder="Image URL (Click upload button or paste)" value={section.content} onChange={(e: any) => {
                             const newSecs = [...arr];
                             newSecs[idx] = {...section, content: e.target.value};
                             setCurrentProject({...currentProject, dynamicSections: newSecs});
                           }} />
                         </div>
                      )}
                      {section.type === 'video' && (
                         <input className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none text-white" value={section.content} onChange={e => {
                           const newSecs = [...arr];
                           newSecs[idx] = {...section, content: e.target.value};
                           setCurrentProject({...currentProject, dynamicSections: newSecs});
                         }} placeholder="Video Embed URL (YouTube/Vimeo)" />
                      )}
                    </div>
                  ))}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <button onClick={() => setCurrentProject({...currentProject, dynamicSections: [...(currentProject.dynamicSections||[]), {id: crypto.randomUUID(), type: 'text', content: '', order: (currentProject.dynamicSections?.length||0)}]})} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest">+ Text</button>
                    <button onClick={() => setCurrentProject({...currentProject, dynamicSections: [...(currentProject.dynamicSections||[]), {id: crypto.randomUUID(), type: 'image', content: '', order: (currentProject.dynamicSections?.length||0)}]})} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest">+ Image</button>
                    <button onClick={() => setCurrentProject({...currentProject, dynamicSections: [...(currentProject.dynamicSections||[]), {id: crypto.randomUUID(), type: 'video', content: '', order: (currentProject.dynamicSections?.length||0)}]})} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest">+ Video</button>
                  </div>
                </div>

                <label className="flex items-center gap-4 cursor-pointer p-6 bg-white/5 sketchy-border mt-10">
                  <input type="checkbox" checked={!!currentProject.featured} onChange={e => setCurrentProject({...currentProject, featured: e.target.checked})} className="w-6 h-6 accent-primary rounded-md" />
                  <span className="font-bold uppercase tracking-widest text-xs">{t.featured_home}</span>
                </label>
                <button onClick={saveProject} className="sketchy-btn filled w-full mt-10 py-5 text-xl">{t.deposit_changes}</button>
              </div>
            </motion.div>
          </div>
        )}

        {isEditingTimeline && currentTimeline && (
          <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#0e0d0c] w-full max-w-2xl sketchy-border p-8 md:p-10 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black uppercase tracking-tight sketch-font">{t.edit_experience}</h3>
                <button onClick={() => setIsEditingTimeline(false)} className="p-3 sketchy-border hover:bg-white/5 transition-colors"><X size={18} /></button>
              </div>
              <div className="space-y-8">
                <LocalizedInput label={t.role_title} value={currentTimeline.role} onChange={(val: any) => setCurrentTimeline({...currentTimeline, role: val})} />
                <LocalizedInput label={t.company_name} value={currentTimeline.company} onChange={(val: any) => setCurrentTimeline({...currentTimeline, company: val})} />
                <LocalizedInput label={t.year_duration} value={currentTimeline.year} onChange={(val: any) => setCurrentTimeline({...currentTimeline, year: val})} />
                <LocalizedTextarea label={t.key_contributions} value={currentTimeline.description} onChange={(val: any) => setCurrentTimeline({...currentTimeline, description: val})} />
                <button onClick={saveTimeline} className="sketchy-btn filled w-full mt-10 py-5 text-xl">{t.update_timeline}</button>
              </div>
            </motion.div>
          </div>
        )}

        {isEditingCompetency && currentCompetency && (
          <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#0e0d0c] w-full max-w-xl sketchy-border p-8 md:p-10 overflow-y-auto">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black uppercase tracking-tight sketch-font">{t.edit_skill}</h3>
                <button onClick={() => setIsEditingCompetency(false)} className="p-3 sketchy-border hover:bg-white/5 transition-colors"><X size={18} /></button>
              </div>
              <div className="space-y-8">
                <LocalizedInput label={t.skill_category} value={currentCompetency.title} onChange={(val: any) => setCurrentCompetency({...currentCompetency, title: val})} />
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-secondary opacity-40 ml-1">{t.icon_id}</label>
                    <input className="w-full bg-black/20 border-b border-white/10 p-3 text-sm outline-none focus:border-primary" value={currentCompetency.icon || ''} onChange={e => setCurrentCompetency({...currentCompetency, icon: e.target.value})} />
                </div>
                <button onClick={saveCompetency} className="sketchy-btn filled w-full mt-10 py-5 text-xl">{t.confirm_skill}</button>
              </div>
            </motion.div>
          </div>
        )}

        {currentInquiry && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-surface-container w-full max-w-xl rounded-3xl p-8 border border-white/10 max-h-[90vh] overflow-y-auto min-w-0">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold">{currentInquiry.name}</h3>
                  <a href={`mailto:${currentInquiry.email}`} className="text-sm font-mono text-primary hover:underline">{currentInquiry.email}</a>
                </div>
                <button onClick={() => setCurrentInquiry(null)} className="p-2 cursor-pointer bg-white/10 rounded-full hover:bg-white/20"><X size={16} /></button>
              </div>
              <div className="bg-white/5 rounded-2xl p-6 text-sm text-secondary whitespace-pre-wrap leading-relaxed border border-white/5 font-sans">
                {currentInquiry.message}
              </div>
              <div className="mt-8 text-xs font-mono text-white/30 text-right">
                Received: {currentInquiry.createdAt ? new Date(currentInquiry.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
              </div>
            </motion.div>
          </div>
        )}

        {/* Global Alert Modal */}
        {alertMessage && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-surface-container w-full max-w-lg rounded-3xl p-8 border border-red-500/30 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)] border border-red-500/30">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-2xl font-bold text-red-400 mb-4">{t.system_notice}</h3>
              <div className="bg-red-500/10 rounded-2xl p-5 text-sm text-red-200/80 whitespace-pre-wrap leading-relaxed border border-red-500/20 font-sans text-left mb-8 max-h-64 overflow-y-auto">
                {alertMessage}
              </div>
              <button onClick={() => setAlertMessage(null)} className="w-full bg-red-500/20 text-red-400 border border-red-500/30 py-4 rounded-full font-bold uppercase tracking-wider cursor-pointer hover:bg-red-500/30 active:scale-95 transition-all">
                {t.acknowledge}
              </button>
            </motion.div>
          </div>
        )}

        {/* Global Confirm Modal */}
        {confirmDialog && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-surface-container w-full max-w-sm rounded-3xl p-8 border border-white/10 text-center">
              <h3 className="text-2xl font-bold mb-4">{confirmDialog.title}</h3>
              <p className="text-secondary text-sm leading-relaxed font-sans mb-8">
                {confirmDialog.desc}
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmDialog.onConfirm} className="w-full bg-red-500 text-white py-4 rounded-full font-bold uppercase tracking-wider cursor-pointer hover:bg-red-600 active:scale-95 transition-all">
                   Proceed & Delete
                </button>
                <button onClick={() => setConfirmDialog(null)} className="w-full bg-white/5 text-white py-4 rounded-full font-bold uppercase tracking-wider cursor-pointer hover:bg-white/10 active:scale-95 transition-all">
                   Cancel Action
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LocalizedInput = ({ label, value, onChange, placeholder }: any) => {
    const val = typeof value === 'object' ? value : { en: value || '', ar: value || '', it: value || '' };
    return (
        <div className="space-y-6 p-8 sketchy-border bg-white/5">
            <label className="text-xs uppercase tracking-widest font-black text-sepia">{label}</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                    <span className="text-[10px] uppercase font-black opacity-30">English</span>
                    <input className="w-full bg-black/20 border-b border-white/10 p-2 text-sm outline-none focus:border-primary" 
                        value={val.en || ''} onChange={e => onChange({...val, en: e.target.value})} placeholder={placeholder} />
                </div>
                <div className="space-y-2" dir="rtl">
                    <span className="text-[10px] uppercase font-black opacity-30">العربية</span>
                    <input className="w-full bg-black/20 border-b border-white/10 p-2 text-sm outline-none focus:border-primary font-arabic" 
                        value={val.ar || ''} onChange={e => onChange({...val, ar: e.target.value})} placeholder="النص بالعربي" />
                </div>
                <div className="space-y-2">
                    <span className="text-[10px] uppercase font-black opacity-30">Italiano</span>
                    <input className="w-full bg-black/20 border-b border-white/10 p-2 text-sm outline-none focus:border-primary" 
                        value={val.it || ''} onChange={e => onChange({...val, it: e.target.value})} placeholder="In Italiano" />
                </div>
            </div>
        </div>
    );
};

const LocalizedTextarea = ({ label, value, onChange, placeholder }: any) => {
    const val = typeof value === 'object' ? value : { en: value || '', ar: value || '', it: value || '' };
    return (
        <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5">
            <label className="text-[10px] uppercase tracking-widest text-secondary font-bold">{label}</label>
            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                    <span className="text-[9px] uppercase text-white/30 ml-2">English</span>
                    <textarea className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary/50 min-h-[80px]" 
                        value={val.en || ''} onChange={e => onChange({...val, en: e.target.value})} placeholder={placeholder} />
                </div>
                <div className="space-y-1" dir="rtl">
                    <span className="text-[9px] uppercase text-white/30 mr-2">العربية</span>
                    <textarea className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary/50 font-arabic min-h-[80px]" 
                        value={val.ar || ''} onChange={e => onChange({...val, ar: e.target.value})} placeholder="الوصف بالعربي" />
                </div>
                <div className="space-y-1">
                    <span className="text-[9px] uppercase text-white/30 ml-2">Italiano</span>
                    <textarea className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary/50 min-h-[80px]" 
                        value={val.it || ''} onChange={e => onChange({...val, it: e.target.value})} placeholder="In Italiano" />
                </div>
            </div>
        </div>
    );
};

const ImageInput = ({ label, value, onChange, placeholder }: any) => {

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress(0);
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if(prev === null) return 0;
        const next = prev + Math.random() * 8 + 2;
        return next > 95 ? 95 : next;
      });
    }, 150);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'Hamed Wab');
    
    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dkw7eqxd2/image/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      clearInterval(progressInterval);

      if(data.secure_url) {
        setUploadProgress(100);
        onChange({ target: { value: data.secure_url } });
        setTimeout(() => setUploadProgress(null), 800);
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch(err: any) {
      clearInterval(progressInterval);
      console.error(err);
      alert("Cloudinary Upload Failed: " + err.message);
      setUploadProgress(null);
    }
  };

  return (
    <div className="space-y-2 relative">
      {label && <label className="text-[10px] uppercase tracking-widest text-secondary">{label}</label>}
      <div className="flex items-center gap-3 w-full">
        {value ? (
           <img src={value} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-white/20 flex-shrink-0 bg-white/5 shadow-inner" onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')} />
        ) : (
           <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex-shrink-0 flex items-center justify-center">
             {uploadProgress !== null && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
           </div>
        )}
        <div className="flex-1 min-w-0 relative flex items-center">
          <input className="w-full bg-white/5 border border-white/10 rounded-2xl pl-5 pr-28 py-3.5 focus:border-white/30 outline-none text-sm"
            placeholder={placeholder || 'Paste Image URL or Upload'} value={value} onChange={onChange} disabled={uploadProgress !== null} />
          
          <div className="absolute right-2 flex items-center h-full max-h-[30px]">
            {uploadProgress !== null ? (
              <span className="text-[10px] font-bold text-primary mr-3">{Math.round(uploadProgress)}%</span>
            ) : (
              <label className="bg-white/10 hover:bg-white/20 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-xl cursor-pointer transition-colors flex items-center">
                Upload
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
