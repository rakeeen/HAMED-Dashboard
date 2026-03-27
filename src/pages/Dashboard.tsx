import React, { useState } from 'react';
import { useSiteContext } from '../context/SiteContext';
import { DASHBOARD_I18N } from '../dashboard_i18n';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, Users, FolderKanban, FileText, 
  Save, Plus, Trash2, Globe, Briefcase, Star, X, Pencil
} from 'lucide-react';
import { Project, TimelineItem, Competency } from '../types';
import { db, storage } from '../firebase';
import { doc, setDoc, collection, query, orderBy, onSnapshot, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

type DashboardTab = 'content' | 'projects' | 'experience' | 'competencies' | 'clients' | 'settings';
type DashboardLang = 'en' | 'ar' | 'it';

export const Dashboard = () => {
  const { 
    siteConfig, updateConfig, 
    projects, updateProjects, 
    timeline, updateTimeline,
    competencies, updateCompetencies,
    settings, updateSettings 
  } = useSiteContext();
  
  const [activeTab, setActiveTab] = useState<DashboardTab>('content');
  const [lang, setLang] = useState<DashboardLang>('en');
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

  React.useEffect(() => {
    const unsubInq = onSnapshot(query(collection(db, 'inquiries'), orderBy('createdAt', 'desc')), (snap) => {
      setInquiries(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubAna = onSnapshot(doc(db, 'analytics', 'main'), (snap) => {
      if(snap.exists()) setAnalytics(snap.data() as any);
    });
    return () => { unsubInq(); unsubAna(); };
  }, []);

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
      alert("❌ فشل الحفظ في السحابة!\nفايربيز يرفض تعديلك لأنك لم تقم بتفعيل صلاحيات القراءة والكتابة في قاعدة البيانات.\n\nمن فضلك اذهب إلى:\nFirebase Console > Firestore Database > Rules\nوغيّر السطر إلى:\nallow read, write: if true;\n\nالخطأ الفني: " + e.message);
      setSaveStatus('Failed to Save');
      setTimeout(() => setSaveStatus(null), 3000);
    }
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
    if (window.confirm('Delete this project?')) {
      updateProjects(projects.filter(p => p.id !== id));
    }
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
    if (window.confirm('Delete this experience?')) {
      updateTimeline(timeline.filter(t => t.role !== item.role || t.company !== item.company));
    }
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
    if (window.confirm('Delete this competency?')) {
      updateCompetencies(competencies.filter(c => c.title !== title));
    }
  };

  const tabs: { id: DashboardTab; label: string; icon: any; badge?: number }[] = [
    { id: 'content', label: isRTL ? 'المحتوى' : 'Site Content', icon: FileText },
    { id: 'projects', label: t.nav_projects, icon: FolderKanban },
    { id: 'clients', label: isRTL ? 'العملاء والتحليلات' : 'Clients & Analytics', icon: Users, badge: inquiries.filter(i => !i.read).length },
    { id: 'experience', label: t.nav_experience, icon: Briefcase },
    { id: 'competencies', label: isRTL ? 'المهارات' : 'Competencies', icon: Star },
    { id: 'settings', label: t.nav_settings, icon: Settings },
  ];

  return (
    <div className={`min-h-screen pt-24 pb-12 px-4 md:px-8 w-full max-w-[1400px] mx-auto flex flex-col md:flex-row gap-8 ${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Sidebar - hidden when printing */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-2 print:hidden">
        <div className="mb-8 px-4">
          <h1 className="text-2xl font-black uppercase tracking-tighter">{t.title}</h1>
          <div className="flex gap-2 mt-4">
            {(['en', 'ar', 'it'] as DashboardLang[]).map(l => (
              <button 
                key={l}
                onClick={() => setLang(l)}
                className={`text-[10px] uppercase font-bold px-3 py-1.5 rounded-full border ${lang === l ? 'bg-white text-black border-white' : 'border-white/20 text-secondary'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center justify-between px-5 py-3.5 rounded-full transition-all ${
              activeTab === tab.id ? 'bg-white/10 text-white' : 'text-secondary hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <tab.icon size={18} />
              <span className="font-medium">{tab.label}</span>
            </div>
            {tab.badge ? (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{tab.badge}</span>
            ) : null}
          </button>
        ))}
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 bg-surface-container rounded-[2.5rem] p-6 md:p-10 border border-white/5 min-h-[600px] relative">
        <div className="absolute top-8 right-8 flex items-center gap-4">
          {saveStatus && <span className="text-xs text-secondary animate-pulse">{saveStatus}</span>}
          
          {['projects', 'experience', 'competencies'].includes(activeTab) && (
            <button 
              onClick={() => {
                if (activeTab === 'projects') { setCurrentProject({}); setIsEditingProject(true); }
                if (activeTab === 'experience') { setCurrentTimeline({}); setIsEditingTimeline(true); }
                if (activeTab === 'competencies') { setCurrentCompetency({}); setIsEditingCompetency(true); }
              }}
              className="text-white border border-white/20 px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-white/10 transition-all cursor-pointer z-10"
            >
              <Plus size={14} />
              {t.add_new}
            </button>
          )}

          <button 
            onClick={handleSave}
            className="bg-white text-on-primary px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-neutral-200 transition-all cursor-pointer z-10 print:hidden"
          >
            <Save size={14} />
            {t.save}
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-8 relative z-0">
          
          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-12 max-w-3xl">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-tight mb-6">{isRTL ? 'معلومات أساسية' : 'Basic Information'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-secondary">{t.site_name}</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-white/30 outline-none"
                      value={siteConfig.name} onChange={(e) => updateConfig({ name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-secondary">{t.site_role}</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-white/30 outline-none"
                      value={siteConfig.role} onChange={(e) => updateConfig({ role: e.target.value })} />
                  </div>
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <label className="text-[10px] uppercase tracking-widest text-secondary">{t.site_summary}</label>
                    <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-white/30 outline-none min-h-[100px]"
                      value={siteConfig.summary} onChange={(e) => updateConfig({ summary: e.target.value })} />
                  </div>
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <label className="text-[10px] uppercase tracking-widest text-secondary">Detailed Bio</label>
                    <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-white/30 outline-none min-h-[100px]"
                      value={siteConfig.detailed_summary} onChange={(e) => updateConfig({ detailed_summary: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/10">
                <h2 className="text-xl font-bold uppercase tracking-tight mb-6">{isRTL ? 'التواصل والروابط' : 'Contact & Socials'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-secondary">Location</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-white/30 outline-none"
                      value={siteConfig.location} onChange={(e) => updateConfig({ location: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-secondary">Email</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-white/30 outline-none"
                      value={siteConfig.email} onChange={(e) => updateConfig({ email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-secondary">Behance URL</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-white/30 outline-none"
                      value={siteConfig.socials?.behance || ''} onChange={(e) => updateConfig({ socials: { ...siteConfig.socials, behance: e.target.value }})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-secondary">LinkedIn URL</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-white/30 outline-none"
                      value={siteConfig.socials?.linkedin || ''} onChange={(e) => updateConfig({ socials: { ...siteConfig.socials, linkedin: e.target.value }})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-secondary">X (Twitter) URL</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-white/30 outline-none"
                      value={siteConfig.socials?.x || ''} onChange={(e) => updateConfig({ socials: { ...siteConfig.socials, x: e.target.value }})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-secondary">Tools (Comma separated)</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-white/30 outline-none"
                      value={siteConfig.tools?.join(', ') || ''} onChange={(e) => updateConfig({ tools: e.target.value.split(',').map(t=>t.trim()) })} />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/10 space-y-4">
                <h2 className="text-xl font-bold uppercase tracking-tight mb-6">{isRTL ? 'صور الموقع الرئيسية' : 'Global Site Images'}</h2>
                
                <ImageInput 
                  label="About Portrait Image" 
                  value={siteConfig.siteImages?.aboutPortrait || ''} 
                  onChange={(e: any) => updateConfig({ siteImages: { ...siteConfig.siteImages, aboutPortrait: e.target.value }})} 
                />
                <ImageInput 
                  label="Contact Background Image" 
                  value={siteConfig.siteImages?.contactBackground || ''} 
                  onChange={(e: any) => updateConfig({ siteImages: { ...siteConfig.siteImages, contactBackground: e.target.value }})} 
                />
              </div>
            </div>
          )}

          {/* Clients Tab */}
          {activeTab === 'clients' && (
            <div className="space-y-8">
              <h2 className="text-xl font-bold uppercase tracking-tight">{isRTL ? 'العملاء والتحليلات' : 'Clients & Analytics'}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex flex-col justify-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all" />
                  <span className="text-sm text-secondary uppercase tracking-widest mb-2 z-10">Total Visitors</span>
                  <span className="text-5xl font-black z-10">{analytics?.visitors || 0}</span>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex flex-col justify-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/20 transition-all" />
                  <span className="text-sm text-secondary uppercase tracking-widest mb-2 z-10">Total Inquiries</span>
                  <span className="text-5xl font-black z-10">{analytics?.inquiries || 0}</span>
                </div>
              </div>

              <div className="rounded-3xl border border-white/5 bg-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                  <h3 className="font-bold uppercase tracking-widest text-sm text-white/70">Recent Inquiries</h3>
                </div>
                <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
                  {inquiries.map(inq => (
                    <div 
                      key={inq.id} 
                      onClick={() => {
                         setCurrentInquiry(inq);
                         if(!inq.read) updateDoc(doc(db, 'inquiries', inq.id), { read: true }).catch(console.error);
                      }}
                      className="p-5 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`font-bold ${!inq.read ? 'text-white' : 'text-secondary'}`}>{inq.name}</h4>
                          {!inq.read && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />}
                        </div>
                        <p className="text-xs text-secondary mt-1">{inq.email}</p>
                      </div>
                      <div className="text-xs text-secondary font-mono">
                        {inq.createdAt ? new Date(inq.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                      </div>
                    </div>
                  ))}
                  {inquiries.length === 0 && (
                    <div className="p-10 text-center text-secondary text-sm">No inquiries yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold uppercase tracking-tight">{t.nav_projects}</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {projects.map(project => (
                  <div key={project.id} className="bg-white/5 p-5 rounded-3xl border border-white/5 flex justify-between items-center group">
                    <div>
                      <h3 className="font-bold">{project.title}</h3>
                      <p className="text-xs text-secondary mt-1">{project.category} • {project.featured ? 'Featured' : 'Standard'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setCurrentProject(project); setIsEditingProject(true); }} className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 cursor-pointer"><Pencil size={16} /></button>
                      <button onClick={() => deleteProject(project.id)} className="p-3 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500/40 cursor-pointer"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'experience' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold uppercase tracking-tight">{isRTL ? 'الخبرات العملية' : 'Experience'}</h2>
              </div>
              <div className="space-y-4">
                {timeline.map((item, i) => (
                  <div key={i} className="bg-white/5 p-5 rounded-3xl border border-white/5 flex justify-between items-center group">
                    <div>
                      <h3 className="font-bold">{item.role} <span className="text-secondary font-normal ml-1">@ {item.company}</span></h3>
                      <p className="text-xs text-secondary mt-1">{item.year}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setCurrentTimeline(item); setIsEditingTimeline(true); }} className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 cursor-pointer"><Pencil size={16} /></button>
                      <button onClick={() => deleteTimeline(item)} className="p-3 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500/40 cursor-pointer"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Competencies Tab */}
          {activeTab === 'competencies' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold uppercase tracking-tight">{isRTL ? 'المهارات' : 'Competencies'}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {competencies.map((item, i) => (
                  <div key={i} className="bg-white/5 p-6 rounded-3xl border border-white/5 flex justify-between items-start group">
                    <div>
                      <h3 className="font-bold mb-2">{item.title}</h3>
                      <p className="text-xs text-secondary leading-relaxed">{item.description}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 ml-4">
                      <button onClick={() => { setCurrentCompetency(item); setIsEditingCompetency(true); }} className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 cursor-pointer"><Pencil size={14} /></button>
                      <button onClick={() => deleteCompetency(item.title)} className="p-3 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500/40 cursor-pointer"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-8 max-w-2xl">
              <h2 className="text-xl font-bold uppercase tracking-tight">{t.nav_settings}</h2>
              <div className="space-y-4">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-6">
                  <div className="space-y-1">
                    <h3 className="font-bold">Dashboard Security</h3>
                    <p className="text-xs text-secondary opacity-60">Update the credentials required to access this dashboard.</p>
                  </div>
                  
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-secondary">Dashboard Login Email</label>
                      <input 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-white/30 outline-none"
                        type="email"
                        value={adminEmail} 
                        onChange={(e) => {
                          setAdminEmail(e.target.value);
                          localStorage.setItem('hamed_admin_email', e.target.value);
                        }} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-secondary">Dashboard Password</label>
                      <input 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-white/30 outline-none"
                        type="text"
                        value={adminPass} 
                        onChange={(e) => {
                          setAdminPass(e.target.value);
                          localStorage.setItem('hamed_admin_pass', e.target.value);
                        }} 
                      />
                    </div>
                  </div>
                  <p className="text-xs text-secondary mt-2 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Changes to credentials save automatically to this device.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isEditingProject && currentProject && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-surface-container w-full max-w-2xl rounded-3xl p-8 md:p-10 border border-white/10 max-h-[90vh] overflow-y-auto min-w-0">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold">{isRTL ? 'تعديل المشروع' : 'Edit Project'}</h3>
                <button onClick={() => setIsEditingProject(false)} className="p-3 cursor-pointer bg-white/10 rounded-full hover:bg-white/20"><X size={18} /></button>
              </div>
              <div className="space-y-5">
                <input placeholder="Title" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none" value={currentProject.title || ''} onChange={e => setCurrentProject({...currentProject, title: e.target.value})} />
                <textarea placeholder="Description" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none min-h-[120px]" value={currentProject.description || ''} onChange={e => setCurrentProject({...currentProject, description: e.target.value})} />
                <input placeholder="Category" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none" value={currentProject.category || ''} onChange={e => setCurrentProject({...currentProject, category: e.target.value})} />
                
                <h4 className="pt-2 font-bold text-sm uppercase tracking-widest text-white/50 border-t border-white/10">Project Images</h4>
                <ImageInput placeholder="Card Cover Image URL" value={currentProject.image || ''} onChange={(e: any) => setCurrentProject({...currentProject, image: e.target.value})} />
                <ImageInput placeholder="Detail Preview Image 1 URL" value={currentProject.detailImages?.[0] || ''} onChange={(e: any) => setCurrentProject({...currentProject, detailImages: [e.target.value, currentProject.detailImages?.[1] || '', currentProject.detailImages?.[2] || '']})} />
                <ImageInput placeholder="Detail Preview Image 2 URL" value={currentProject.detailImages?.[1] || ''} onChange={(e: any) => setCurrentProject({...currentProject, detailImages: [currentProject.detailImages?.[0] || '', e.target.value, currentProject.detailImages?.[2] || '']})} />
                <ImageInput placeholder="Detail Preview Image 3 URL" value={currentProject.detailImages?.[2] || ''} onChange={(e: any) => setCurrentProject({...currentProject, detailImages: [currentProject.detailImages?.[0] || '', currentProject.detailImages?.[1] || '', e.target.value]})} />
                
                <h4 className="pt-2 font-bold text-sm uppercase tracking-widest text-white/50 border-t border-white/10">Publishing</h4>
                <input placeholder="Tags (comma separated)" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none" value={currentProject.tags?.join(', ') || ''} onChange={e => setCurrentProject({...currentProject, tags: e.target.value.split(',').map(t=>t.trim())})} />
                <label className="flex items-center gap-4 cursor-pointer p-5 bg-white/5 rounded-2xl border border-white/10">
                  <input type="checkbox" checked={!!currentProject.featured} onChange={e => setCurrentProject({...currentProject, featured: e.target.checked})} className="w-6 h-6 accent-primary rounded-md" />
                  <span className="font-medium">Featured Project</span>
                </label>
                <button onClick={saveProject} className="w-full bg-white text-black py-4 rounded-full font-bold uppercase tracking-wider mt-6 cursor-pointer hover:bg-neutral-200">Save Project</button>
              </div>
            </motion.div>
          </div>
        )}

        {isEditingTimeline && currentTimeline && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-surface-container w-full max-w-2xl rounded-3xl p-8 md:p-10 border border-white/10 max-h-[90vh] overflow-y-auto min-w-0">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold">{isRTL ? 'تعديل الخبرة' : 'Edit Experience'}</h3>
                <button onClick={() => setIsEditingTimeline(false)} className="p-3 cursor-pointer bg-white/10 rounded-full hover:bg-white/20"><X size={18} /></button>
              </div>
              <div className="space-y-5">
                <div className="flex flex-col md:flex-row gap-5">
                  <input placeholder="Role / Title" className="w-full md:w-1/2 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none" value={currentTimeline.role || ''} onChange={e => setCurrentTimeline({...currentTimeline, role: e.target.value})} />
                  <input placeholder="Year (e.g. 2022 - 2024)" className="w-full md:w-1/2 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none" value={currentTimeline.year || ''} onChange={e => setCurrentTimeline({...currentTimeline, year: e.target.value})} />
                </div>
                <input placeholder="Company Name" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none" value={currentTimeline.company || ''} onChange={e => setCurrentTimeline({...currentTimeline, company: e.target.value})} />
                <textarea placeholder="Description" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none min-h-[120px]" value={currentTimeline.description || ''} onChange={e => setCurrentTimeline({...currentTimeline, description: e.target.value})} />
                <input placeholder="Tags (comma separated)" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none" value={currentTimeline.tags?.join(', ') || ''} onChange={e => setCurrentTimeline({...currentTimeline, tags: e.target.value.split(',').map(t=>t.trim())})} />
                <button onClick={saveTimeline} className="w-full bg-white text-black py-4 rounded-full font-bold uppercase tracking-wider mt-6 cursor-pointer hover:bg-neutral-200">Save Experience</button>
              </div>
            </motion.div>
          </div>
        )}

        {isEditingCompetency && currentCompetency && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-surface-container w-full max-w-2xl rounded-3xl p-8 md:p-10 border border-white/10 max-h-[90vh] overflow-y-auto min-w-0">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold">{isRTL ? 'تعديل المهارة' : 'Edit Competency'}</h3>
                <button onClick={() => setIsEditingCompetency(false)} className="p-3 cursor-pointer bg-white/10 rounded-full hover:bg-white/20"><X size={18} /></button>
              </div>
              <div className="space-y-5">
                <input placeholder="Title" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none" value={currentCompetency.title || ''} onChange={e => setCurrentCompetency({...currentCompetency, title: e.target.value})} />
                <textarea placeholder="Description" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none min-h-[120px]" value={currentCompetency.description || ''} onChange={e => setCurrentCompetency({...currentCompetency, description: e.target.value})} />
                <input placeholder="Icon Name (Material Symbols)" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none" value={currentCompetency.icon || ''} onChange={e => setCurrentCompetency({...currentCompetency, icon: e.target.value})} />
                <button onClick={saveCompetency} className="w-full bg-white text-black py-4 rounded-full font-bold uppercase tracking-wider mt-6 cursor-pointer hover:bg-neutral-200">Save Competency</button>
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
      </AnimatePresence>
    </div>
  );
};

const ImageInput = ({ label, value, onChange, placeholder }: any) => {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed", error);
        setUploadProgress(null);
        alert("Upload failed. Make sure Firebase Storage is enabled.");
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        onChange({ target: { value: downloadURL } });
        setUploadProgress(null);
      }
    );
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
