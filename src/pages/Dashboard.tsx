import React, { useState } from 'react';
import { useSiteContext } from '../context/SiteContext';
import { DASHBOARD_I18N } from '../dashboard_i18n';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, Users, FolderKanban, FileText, 
  Save, Plus, Trash2, Globe, Briefcase, Star, X, Pencil
} from 'lucide-react';
import { Project, TimelineItem, Competency } from '../types';

type DashboardTab = 'content' | 'projects' | 'experience' | 'competencies' | 'clients' | 'settings';
type DashboardLang = 'en' | 'ar' | 'it';

export const Dashboard = () => {
  const { 
    siteConfig, updateConfig, 
    projects, updateProjects, 
    timeline, updateTimeline,
    competencies, updateCompetencies,
    inquiries, markInquiryRead,
    settings, updateSettings 
  } = useSiteContext();
  
  const [activeTab, setActiveTab] = useState<DashboardTab>('content');
  const [lang, setLang] = useState<DashboardLang>('en');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Modals state
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project> | null>(null);

  const [isEditingTimeline, setIsEditingTimeline] = useState(false);
  const [currentTimeline, setCurrentTimeline] = useState<Partial<TimelineItem> | null>(null);

  const [isEditingCompetency, setIsEditingCompetency] = useState(false);
  const [currentCompetency, setCurrentCompetency] = useState<Partial<Competency> | null>(null);

  const t = DASHBOARD_I18N[lang];
  const isRTL = lang === 'ar';

  const handleSave = () => {
    setSaveStatus('Saving...');
    setTimeout(() => {
      setSaveStatus('Changes Saved!');
      setTimeout(() => setSaveStatus(null), 2000);
    }, 500);
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

  const tabs: { id: DashboardTab; label: string; icon: any }[] = [
    { id: 'content', label: isRTL ? 'المحتوى' : 'Site Content', icon: FileText },
    { id: 'projects', label: t.nav_projects, icon: FolderKanban },
    { id: 'experience', label: t.nav_experience, icon: Briefcase },
    { id: 'competencies', label: isRTL ? 'المهارات' : 'Competencies', icon: Star },
    { id: 'clients', label: t.nav_clients, icon: Users },
    { id: 'settings', label: t.nav_settings, icon: Settings },
  ];

  return (
    <div className={`min-h-screen pt-24 pb-12 px-4 md:px-8 w-full max-w-[1400px] mx-auto flex flex-col md:flex-row gap-8 ${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-2">
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
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-full transition-all ${
              activeTab === tab.id ? 'bg-white/10 text-white' : 'text-secondary hover:bg-white/5 hover:text-white'
            }`}
          >
            <tab.icon size={18} />
            <span className="font-medium">{tab.label}</span>
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
            className="bg-white text-on-primary px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-neutral-200 transition-all cursor-pointer z-10"
          >
            <Save size={14} />
            {t.save}
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-8 relative z-0">
          
          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-8 max-w-2xl">
              <h2 className="text-xl font-bold uppercase tracking-tight">{isRTL ? 'تعديل بيانات الموقع' : 'Edit Site Content'}</h2>
              <div className="space-y-6">
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
                  <label className="text-[10px] uppercase tracking-widest text-secondary">{t.site_summary}</label>
                  <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-white/30 outline-none min-h-[100px]"
                    value={siteConfig.summary} onChange={(e) => updateConfig({ summary: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-secondary">Detailed Bio</label>
                  <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-white/30 outline-none min-h-[100px]"
                    value={siteConfig.detailed_summary} onChange={(e) => updateConfig({ detailed_summary: e.target.value })} />
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
                
                <div className="space-y-4 pt-6 border-t border-white/10">
                  <h3 className="font-bold text-lg uppercase tracking-tight text-white/50">{isRTL ? 'صور الموقع (روابط)' : 'Global Images (URLs)'}</h3>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-secondary">About Portrait Image</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-white/30 outline-none"
                      value={siteConfig.siteImages?.aboutPortrait || ''} onChange={(e) => updateConfig({ siteImages: { ...siteConfig.siteImages, aboutPortrait: e.target.value }})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-secondary">Contact Background Image</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-white/30 outline-none"
                      value={siteConfig.siteImages?.contactBackground || ''} onChange={(e) => updateConfig({ siteImages: { ...siteConfig.siteImages, contactBackground: e.target.value }})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-secondary">Project Details Canvas 1</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-white/30 outline-none"
                      value={siteConfig.siteImages?.projectDetail1 || ''} onChange={(e) => updateConfig({ siteImages: { ...siteConfig.siteImages, projectDetail1: e.target.value }})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-secondary">Project Details Canvas 2</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-white/30 outline-none"
                      value={siteConfig.siteImages?.projectDetail2 || ''} onChange={(e) => updateConfig({ siteImages: { ...siteConfig.siteImages, projectDetail2: e.target.value }})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-secondary">Project Details Canvas 3</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:border-white/30 outline-none"
                      value={siteConfig.siteImages?.projectDetail3 || ''} onChange={(e) => updateConfig({ siteImages: { ...siteConfig.siteImages, projectDetail3: e.target.value }})} />
                  </div>
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

          {/* Clients Tab */}
          {activeTab === 'clients' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold uppercase tracking-tight mb-8">{t.nav_clients}</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-left rtl:text-right text-[10px] uppercase tracking-widest text-secondary">
                      <th className="py-4 px-4">{t.client_name}</th>
                      <th className="py-4 px-4">{t.client_email}</th>
                      <th className="py-4 px-4">{t.client_message}</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {inquiries.length > 0 ? inquiries.map(inq => (
                      <tr key={inq.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                        <td className="py-4 px-4 font-medium rounded-l-2xl">{inq.name}</td>
                        <td className="py-4 px-4 text-secondary">{inq.email}</td>
                        <td className="py-4 px-4 text-secondary max-w-xs truncate">{inq.message}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-secondary opacity-50 italic">
                          {t.no_inquiries}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-8 max-w-2xl">
              <h2 className="text-xl font-bold uppercase tracking-tight">{t.nav_settings}</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white/5 p-6 rounded-3xl border border-white/5">
                  <div className="space-y-1">
                    <p className="font-bold">{t.toggle_cursor}</p>
                    <p className="text-xs text-secondary opacity-60">Enable the high-performance lerp cursor</p>
                  </div>
                  <button onClick={() => updateSettings({ showCursor: !settings.showCursor })} className={`w-14 h-8 rounded-full transition-all relative ${settings.showCursor ? 'bg-primary' : 'bg-white/10'}`}>
                    <div className={`absolute top-1.5 w-5 h-5 rounded-full bg-white transition-all ${settings.showCursor ? 'right-1.5' : 'left-1.5'}`} />
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
                <input placeholder="Image URL (e.g. /images/proj.jpg)" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none" value={currentProject.image || ''} onChange={e => setCurrentProject({...currentProject, image: e.target.value})} />
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
      </AnimatePresence>
    </div>
  );
};
