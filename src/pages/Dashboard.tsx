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
import { doc, setDoc, collection, query, orderBy, onSnapshot, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

import { MascotFace } from '../components/ui/MascotFace';
import { SketchySidebar } from '../components/dashboard/SketchySidebar';
import { SketchyCard } from '../components/dashboard/SketchyCard';
import { SketchyInput } from '../components/dashboard/SketchyInput';
import { SketchyTextarea } from '../components/dashboard/SketchyTextarea';
import { LocalizedInput, LocalizedTextarea, ImageInput } from '../components/dashboard/LocalizedInput';
import { CustomCursor } from '../components/ui/CustomCursor';
import { RollingNumber } from '../components/ui/RollingNumber';

type DashboardTab = 'analytics' | 'branding' | 'projects' | 'resume' | 'settings';
type DashboardLang = 'en' | 'ar' | 'it';

export const Dashboard = () => {
  const { 
    siteConfig, updateConfig, 
    projects, updateProjects, 
    timeline, updateTimeline,
    competencies, updateCompetencies,
    settings, updateSettings,
    isSyncing, hasUnpublishedChanges, publishContent
  } = useSiteContext();
  
  const [activeTab, setActiveTab] = useState<DashboardTab>('analytics');
  const [lang, setLang] = useState<DashboardLang>('en');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const [adminEmail, setAdminEmail] = useState(localStorage.getItem('hamed_admin_email') || 'hamed@design.com');
  const [adminPass, setAdminPass] = useState(localStorage.getItem('hamed_admin_pass') || 'hamed2024');

  // Modals state
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project> | null>(null);

  const [isEditingTimeline, setIsEditingTimeline] = useState(false);
  const [currentTimeline, setCurrentTimeline] = useState<Partial<TimelineItem> | null>(null);

  const [isEditingCompetency, setIsEditingCompetency] = useState(false);
  const [currentCompetency, setCurrentCompetency] = useState<Partial<Competency> | null>(null);

  const [inquiries, setInquiries] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState({ visitors: 0, totalVisits: 0, uniqueVisitors: 0, inquiries: 0 });
  const [currentInquiry, setCurrentInquiry] = useState<any>(null);

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; desc: string; onConfirm: () => void } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  React.useEffect(() => {
    const unsubInq = onSnapshot(query(collection(db, 'inquiries'), orderBy('createdAt', 'desc')), (snap) => {
      setInquiries(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubAna = onSnapshot(doc(db, 'analytics', 'main'), (snap) => {
      if(snap.exists()) setAnalytics(snap.data() as any);
    });
    return () => { unsubInq(); unsubAna(); };
  }, []);

  // Auto-save logic is now handled in SiteContext.tsx for siteConfig/settings.
  // Manual publish is required for Projects and Timeline.

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
      title: isRTL ? 'تفريغ الوارد' : "Clear Inbox",
      desc: isRTL ? 'هل أنت متأكد من حذف جميع رسائل العملاء نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.' : "Are you absolutely sure you want to permanently delete all client messages? This action cannot be undone.",
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
  const resetAnalytics = async () => {
    setConfirmDialog({
      title: isRTL ? 'تصفير العداد' : "Reset Analytics",
      desc: isRTL ? 'هل أنت متأكد من تصفير عداد الزوار؟ سيتم حذف جميع البيانات الإحصائية.' : "Are you sure you want to reset all visitor data? This will zero out all current analytics counters.",
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await setDoc(doc(db, 'analytics', 'main'), {
            visitors: 0,
            totalVisits: 0,
            uniqueVisitors: 0,
            lastReset: serverTimestamp()
          }, { merge: true });
        } catch (e: any) {
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
      title: isRTL ? 'حذف المشروع' : "Delete Project",
      desc: isRTL ? 'هل أنت متأكد من حذف هذا المشروع؟ لا يمكن التراجع عن هذا الفعل.' : "Are you sure you want to delete this project? This cannot be undone.",
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
      title: isRTL ? 'حذف الخبرة' : "Delete Experience",
      desc: isRTL ? 'هل أنت متأكد من حذف هذا السجل المهني؟' : "Are you sure you want to delete this experience entry?",
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
      title: isRTL ? 'حذف المهارة' : "Delete Competency",
      desc: isRTL ? 'هل أنت متأكد من حذف هذه المهارة؟' : "Are you sure you want to delete this competency?",
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
    { id: 'resume', label: t.nav_experience, icon: Briefcase },
    { id: 'settings', label: t.nav_settings, icon: Settings },
  ];

  return (
    <div className={`flex min-h-screen bg-paper text-ink selection:bg-sepia/20 ${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <SketchySidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        lang={lang} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <main className="flex-1 min-h-screen p-6 md:p-12 overflow-y-auto">
        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between mb-8 pb-4 border-b border-ink/5">
           <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 sketchy-border hover:bg-ink/5"
           >
             <Pencil size={20} /> {/* Using Pencil as a sketchy menu icon or Menu if available */}
           </button>
           <div className="flex items-center gap-2">
              <div className="w-8 h-8"><MascotFace /></div>
              <h1 className="sketch-font text-xl font-bold">Hamed.</h1>
           </div>
           <div className="w-10" /> {/* Spacer */}
        </div>

        <header className="flex justify-between items-center mb-16">
          <div>
             <h2 className="sketch-font text-5xl font-black lowercase tracking-tighter">
               {tabs.find(t => t.id === activeTab)?.label}
             </h2>
             <div className="flex items-center gap-3 mt-4">
                <div className="flex gap-1">
                   {(['en', 'ar', 'it'] as DashboardLang[]).map(l => (
                      <button key={l} onClick={() => setLang(l)} className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 sketchy-border transition-all ${lang === l ? 'bg-ink text-paper' : 'opacity-30 hover:opacity-100'}`}>{l}</button>
                   ))}
                </div>
                <div className="w-[1px] h-3 bg-ink/10 mx-2" />
                 <span className="text-[9px] uppercase tracking-widest font-black opacity-80">
                    {lang === 'ar' ? 'لغة المحتوى' : lang === 'it' ? 'Lingua dei contenuti' : 'Content Language'}
                 </span>
             </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex gap-3">
               {['projects', 'resume'].includes(activeTab) && (
                 <button onClick={() => {
                   if (activeTab === 'projects') { setCurrentProject({}); setIsEditingProject(true); }
                   if (activeTab === 'resume') { setCurrentTimeline({}); setIsEditingTimeline(true); }
                 }} className="sketchy-btn px-6 py-2">
                   {t.btn_add_entry}
                 </button>
               )}
            </div>
          </div>
        </header>

        <div className="max-w-[1200px]">

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {/* Analytics & Leads Tab */}
              {activeTab === 'analytics' && (
                <div className="space-y-12">
              <div className="flex justify-end pr-4">
                 <button 
                  onClick={resetAnalytics}
                  className="sketchy-border border-ink/10 px-4 py-2 text-[9px] uppercase tracking-widest font-black opacity-50 hover:opacity-100 hover:border-rust hover:text-rust transition-all flex items-center gap-2"
                 >
                   <Trash size={12} />
                   {isRTL ? 'تصفير كافة الإحصائيات' : 'Reset All Counters'}
                 </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <SketchyCard title="" subtitle="" className="min-h-[200px] flex flex-col justify-between p-8 bg-paper transition-transform hover:scale-[1.01] shadow-sm">
                  <div className="space-y-1">
                    <h3 className="text-[10px] uppercase tracking-[0.25em] font-black text-ink/30">{isRTL ? 'زوار جدد (Unique)' : 'Unique People'}</h3>
                    <div className="w-6 h-[2px] bg-sepia/20" />
                  </div>
                  
                  <div className="flex items-start my-4">
                    <RollingNumber value={analytics.uniqueVisitors || analytics.visitors} fontSize="text-6xl" className="tracking-tighter" />
                  </div>

                  <div className="flex items-center gap-3 opacity-50 mt-6 pt-4 border-t border-ink/5">
                    <Star size={12} className="text-sepia" />
                    <span className="text-[9px] uppercase tracking-widest font-bold">
                       {isRTL ? 'أشخاص حقيقيون دخلوا الموقع' : 'Individual humans reached'}
                    </span>
                  </div>
                </SketchyCard>

                <SketchyCard title="" subtitle="" className="min-h-[200px] flex flex-col justify-between p-8 bg-paper transition-transform hover:scale-[1.01] shadow-sm">
                  <div className="space-y-1">
                    <h3 className="text-[10px] uppercase tracking-[0.25em] font-black text-ink/30">{isRTL ? 'إجمالي الدخول (Total)' : 'Total Sessions'}</h3>
                    <div className="w-6 h-[2px] bg-sepia/20" />
                  </div>
                  
                  <div className="flex items-start my-4">
                    <RollingNumber value={analytics.totalVisits || analytics.visitors} fontSize="text-6xl" className="tracking-tighter" />
                  </div>

                  <div className="flex items-center gap-3 opacity-50 mt-6 pt-4 border-t border-ink/5">
                    <Users size={12} />
                    <span className="text-[9px] uppercase tracking-widest font-bold">
                       {isRTL ? 'إجمالي عدد مرات فتح الرابط' : 'Total Raw Site Impressions'}
                    </span>
                  </div>
                </SketchyCard>
                
                <SketchyCard title="" subtitle="" className="min-h-[200px] flex flex-col justify-between p-8 bg-paper transition-transform hover:scale-[1.01] shadow-sm">
                   <div className="space-y-1">
                    <h3 className="text-[10px] uppercase tracking-[0.25em] font-black text-ink/30">{isRTL ? 'طلبات العملاء' : 'Client Inquiries'}</h3>
                    <div className="w-6 h-[2px] bg-sepia/20" />
                  </div>

                  <div className="flex items-start my-4">
                    <RollingNumber value={inquiries.length} fontSize="text-6xl" className="tracking-tighter" />
                  </div>

                  <div className="flex items-center gap-3 opacity-50 mt-6 pt-4 border-t border-ink/5">
                    <FileText size={12} />
                    <span className="text-[9px] uppercase tracking-widest font-bold">
                       {t.subtitle_leads}
                    </span>
                  </div>
                </SketchyCard>
              </div>

              <SketchyCard 
                title={t.title_leads_card} 
                subtitle={t.subtitle_leads_card}
                headerAction={
                  inquiries.length > 0 && (
                    <button onClick={clearInquiries} className="flex items-center gap-2 text-[10px] uppercase font-black text-rust hover:underline transition-colors">
                      <Trash2 size={12} /> {t.btn_clear}
                    </button>
                  )
                }
              >
                {inquiries.length === 0 ? (
                  <div className="py-20 text-center opacity-40 sketchbook-pattern">
                    <p className="sketch-font text-2xl">{t.no_inquiries}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {inquiries.map((inq) => (
                      <div 
                        key={inq.id} 
                        onClick={() => {
                           setCurrentInquiry(inq);
                           if(!inq.read) updateDoc(doc(db, 'inquiries', inq.id), { read: true }).catch(console.error);
                        }}
                        className={`p-6 sketchy-border bg-ink/5 flex items-center justify-between hover:translate-x-2 transition-all cursor-pointer ${!inq.read ? 'border-sepia shadow-lg' : 'border-ink/5'}`}
                      >
                        <div className="flex items-center gap-6">
                            <div className={`w-2 h-2 rounded-full ${!inq.read ? 'bg-sepia animate-pulse' : 'bg-ink/10'}`} />
                            <div>
                                <h4 className="font-bold text-lg sketch-font">{inq.name}</h4>
                                <p className="text-[10px] text-ink opacity-40 tracking-wider uppercase font-bold">{inq.email}</p>
                            </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[9px] uppercase font-black opacity-60">
                             {inq.createdAt ? new Date(inq.createdAt.seconds * 1000).toLocaleDateString() : (lang === 'ar' ? 'الآن' : lang === 'it' ? 'Proprio ora' : 'Just now')}
                           </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SketchyCard>
            </div>
          )}

          {/* Identity & Branding Tab */}
          {activeTab === 'branding' && (
            <div className="space-y-12">
              <SketchyCard title={t.title_identity} subtitle={t.subtitle_identity}>
                 <div className="space-y-10">
                    <LocalizedInput label={t.label_site_name} value={siteConfig.name} onChange={(val: any) => updateConfig({ name: val })} />
                    <LocalizedInput label={t.label_site_role} value={siteConfig.role} onChange={(val: any) => updateConfig({ role: val })} />
                    <LocalizedTextarea label={t.label_site_summary} value={siteConfig.summary} onChange={(val: any) => updateConfig({ summary: val })} />
                    <LocalizedInput label={(t as any).label_hero_giant} value={(siteConfig as any).heroGiantText || {en:'', ar:'', it:''}} onChange={(val: any) => updateConfig({ heroGiantText: val })} />
                    <div className="grid grid-cols-2 gap-4">
                       <LocalizedInput label={(t as any).label_btn1} value={(siteConfig as any).button1Text || {en:'', ar:'', it:''}} onChange={(val: any) => updateConfig({ button1Text: val })} />
                       <LocalizedInput label={(t as any).label_btn2} value={(siteConfig as any).button2Text || {en:'', ar:'', it:''}} onChange={(val: any) => updateConfig({ button2Text: val })} />
                    </div>
                 </div>
              </SketchyCard>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SketchyCard title={t.title_contact} subtitle={t.subtitle_contact}>
                   <div className="space-y-6">
                      <SketchyInput label={t.label_location} value={siteConfig.location} onChange={(e) => updateConfig({ location: e.target.value })} />
                      <SketchyInput label={t.label_email} value={siteConfig.email} onChange={(e) => updateConfig({ email: e.target.value })} />
                   </div>
                </SketchyCard>

                <SketchyCard title={t.title_social} subtitle={t.subtitle_social}>
                   <div className="space-y-6">
                      <SketchyInput label="Behance" value={siteConfig.socials?.behance || ''} onChange={(e) => updateConfig({ socials: { ...siteConfig.socials, behance: e.target.value }})} />
                      <SketchyInput label="LinkedIn" value={siteConfig.socials?.linkedin || ''} onChange={(e) => updateConfig({ socials: { ...siteConfig.socials, linkedin: e.target.value }})} />
                      <SketchyInput label="X (Twitter)" value={siteConfig.socials?.x || ''} onChange={(e) => updateConfig({ socials: { ...siteConfig.socials, x: e.target.value }})} />
                   </div>
                </SketchyCard>
              </div>

              <SketchyCard title={t.title_assets} subtitle={t.subtitle_assets}>
                <div className="grid grid-cols-1 gap-10">
                   <ImageInput 
                    label={t.label_about_portrait} 
                    value={siteConfig.siteImages?.aboutPortrait || ''} 
                    onChange={(e: any) => updateConfig({ siteImages: { ...siteConfig.siteImages, aboutPortrait: e.target.value }})} 
                    onError={setAlertMessage}
                   />
                </div>
              </SketchyCard>
            </div>
          )}

          {/* Portfolio Projects Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-8">
              <SketchyCard title={t.title_portfolio} subtitle={`${projects.length} ${t.subtitle_projects}`} headerAction={
                <button onClick={() => { setCurrentProject({}); setIsEditingProject(true); }} className="flex items-center gap-2 text-[10px] uppercase font-black px-4 py-2 sketchy-border hover:bg-sepia/10 transition-all">
                  <Plus size={14} /> {t.btn_new_project}
                </button>
              }>
                {projects.length === 0 ? (
                  <div className="py-20 text-center opacity-40">
                    <p className="sketch-font text-2xl">{isRTL ? 'لا توجد مشاريع مضافة' : 'Portfolio is empty...'}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-5 sketchy-border bg-ink/5 hover:bg-ink/10 transition-all group">
                        <div className="flex items-center gap-5">
                          {project.image && <img src={project.image} alt="" className="w-16 h-12 object-cover opacity-80 sketchy-border" />}
                          <div>
                            <h4 className="font-bold sketch-font text-lg">{typeof project.title === 'object' ? (project.title as any)[lang] : project.title}</h4>
                            <p className="text-[9px] uppercase font-black opacity-60 mt-1">{typeof project.category === 'object' ? (project.category as any)[lang] : project.category}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setCurrentProject(project); setIsEditingProject(true); }} className="p-2 sketchy-border hover:bg-sepia/10 transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => deleteProject(project.id)} className="p-2 sketchy-border hover:bg-rust/10 text-rust transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SketchyCard>
              {hasUnpublishedChanges && (
                <div className="flex justify-end">
                  <button onClick={publishContent} disabled={isSyncing} className="sketchy-btn filled px-10 py-3">
                    {t.btn_push_live}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Resume & Skills Tab */}
          {activeTab === 'resume' && (
            <div className="space-y-8">
              <SketchyCard title={t.title_timeline} subtitle={`${timeline.length} ${t.subtitle_timeline}`} headerAction={
                <button onClick={() => { setCurrentTimeline({}); setIsEditingTimeline(true); }} className="flex items-center gap-2 text-[10px] uppercase font-black px-4 py-2 sketchy-border hover:bg-sepia/10 transition-all">
                  <Plus size={14} /> {t.btn_add_entry}
                </button>
              }>
                <div className="space-y-3">
                  {timeline.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-5 sketchy-border bg-ink/5 hover:bg-ink/10 transition-all group">
                      <div>
                        <h4 className="font-bold sketch-font text-lg">{typeof item.role === 'object' ? (item.role as any)[lang] : item.role}</h4>
                        <p className="text-[10px] uppercase font-black opacity-60 mt-1">
                          {typeof item.company === 'object' ? (item.company as any)[lang] : item.company}
                          {' · '}
                          {typeof item.year === 'object' ? (item.year as any)[lang] : item.year}
                        </p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setCurrentTimeline(item); setIsEditingTimeline(true); }} className="p-2 sketchy-border hover:bg-sepia/10 transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => deleteTimeline(item)} className="p-2 sketchy-border hover:bg-rust/10 text-rust transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </SketchyCard>

              <SketchyCard title={t.title_skills} subtitle={`${competencies.length} ${t.subtitle_skills}`} headerAction={
                <button onClick={() => { setCurrentCompetency({}); setIsEditingCompetency(true); }} className="flex items-center gap-2 text-[10px] uppercase font-black px-4 py-2 sketchy-border hover:bg-sepia/10 transition-all">
                  <Plus size={14} /> {t.btn_add_skill}
                </button>
              }>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {competencies.map((comp, i) => (
                    <div key={i} className="flex items-center justify-between p-5 sketchy-border bg-ink/5 hover:bg-ink/10 transition-all group">
                      <div>
                        <h4 className="font-bold sketch-font">{typeof comp.title === 'object' ? (comp.title as any)[lang] : comp.title}</h4>
                        <p className="text-[9px] uppercase opacity-60 font-black mt-1">{comp.icon}</p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setCurrentCompetency(comp); setIsEditingCompetency(true); }} className="p-2 sketchy-border hover:bg-sepia/10 transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => deleteCompetency(typeof comp.title === 'object' ? (comp.title as any).en : comp.title as string)} className="p-2 sketchy-border hover:bg-rust/10 text-rust transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </SketchyCard>

              {hasUnpublishedChanges && (
                <div className="flex justify-end">
                  <button onClick={publishContent} disabled={isSyncing} className="sketchy-btn filled px-10 py-3">
                    {t.btn_push_live}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-12">
              <SketchyCard title={t.title_settings} subtitle={t.subtitle_settings}>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-ink/5 sketchy-border">
                       <div>
                          <h4 className="font-bold text-sm uppercase tracking-widest">{t.setting_theme}</h4>
                          <p className="text-[9px] opacity-70 font-black uppercase mt-1">{t.setting_theme_desc}</p>
                       </div>
                       <button 
                          onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                          className="px-4 py-2 sketchy-border text-[10px] font-black uppercase tracking-widest hover:bg-ink/5 transition-all"
                       >
                          {settings.theme}
                       </button>
                    </div>
                 </div>
              </SketchyCard>

              <SketchyCard title={t.title_danger} subtitle={t.subtitle_danger} className="border-rust/40 bg-rust/5">
                 <div className="space-y-4">
                    <p className="text-[10px] uppercase font-black text-rust opacity-90 leading-loose">
                       {t.danger_desc}
                    </p>
                    <button 
                      onClick={() => {
                          setConfirmDialog({
                              title: isRTL ? 'تهيئة السحابة؟' : "Initialize Cloud Sync?",
                              desc: t.danger_desc,
                              onConfirm: async () => {
                                  setConfirmDialog(null);
                                  try {
                                      await setDoc(doc(db, 'content', 'main'), {
                                          siteConfig: DEFAULT_CONFIG, projects: DEFAULT_PROJECTS,
                                          timeline: DEFAULT_TIMELINE, competencies: DEFAULT_COMPETENCIES,
                                          settings: { showCursor: true, theme: 'dark' }
                                      });
                                      window.location.reload();
                                  } catch (e: any) { setAlertMessage(e.message); }
                              }
                          });
                      }}
                      className="px-8 py-3 sketchy-border border-rust text-rust hover:bg-rust hover:text-white transition-all text-xs font-black uppercase tracking-widest"
                    >
                      {t.btn_factory_reset}
                    </button>
                 </div>
              </SketchyCard>
            </div>
          )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isEditingProject && currentProject && (
          <div className="fixed inset-0 bg-ink/70 z-[100] flex items-center justify-center p-6 overflow-y-auto backdrop-blur-xl">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="w-full max-w-5xl">
              <SketchyCard 
                title=""
                subtitle=""
                headerAction={null}
                className="bg-paper !opacity-100 shadow-[0_0_120px_rgba(0,0,0,0.8)] relative border-[3px] border-sepia/40 overflow-hidden !p-0"
              >
                <div className="bg-[#12100e] px-8 py-6 border-b border-white/5 flex justify-between items-center text-paper">
                  <div>
                    <h2 className="sketch-font text-2xl font-black">{t.modal_project}</h2>
                    <p className="text-[10px] uppercase font-bold opacity-60 tracking-wider">
                      {isRTL ? 'إدارة محتوى المشروع' : 'Project Content Manager'}
                    </p>
                  </div>
                  <button onClick={() => setIsEditingProject(false)} className="p-3 sketchy-border border-white/20 hover:bg-rust hover:text-white transition-all shadow-lg text-paper"><X size={20} /></button>
                </div>
                
                <div className="p-4 md:p-8 space-y-12 max-h-[85vh] overflow-y-auto scrollbar-thin bg-paper">
                  <div className="grid grid-cols-1 gap-10">
                    <LocalizedInput label={isRTL ? 'اسم المشروع' : "Project Title"} value={currentProject.title} onChange={(val: any) => setCurrentProject({...currentProject, title: val})} />
                    <LocalizedTextarea label={isRTL ? 'وصف مختصر' : "Short Pitch"} value={currentProject.description} onChange={(val: any) => setCurrentProject({...currentProject, description: val})} />
                    <LocalizedInput label={isRTL ? 'التصنيف' : "Category"} value={currentProject.category} onChange={(val: any) => setCurrentProject({...currentProject, category: val})} />
                  </div>

                  <SketchyCard title={isRTL ? 'الأصول المرئية' : "Visual Payload"} subtitle={isRTL ? 'الصور الأساسية' : "Main showcase assets"} className="bg-ink/5 border-none shadow-none translate-x-0 translate-y-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <ImageInput label={isRTL ? 'الغلاف الأساسي' : "Primary Cover"} value={currentProject.image || ''} onChange={(e: any) => setCurrentProject({...currentProject, image: e.target.value})} onError={setAlertMessage} />
                       <div className="space-y-4">
                          <ImageInput placeholder={isRTL ? 'تفاصيل 1' : "Detail 1"} value={currentProject.detailImages?.[0] || ''} onChange={(e: any) => setCurrentProject({...currentProject, detailImages: [e.target.value, currentProject.detailImages?.[1] || '', currentProject.detailImages?.[2] || '']})} onError={setAlertMessage} />
                          <ImageInput placeholder={isRTL ? 'تفاصيل 2' : "Detail 2"} value={currentProject.detailImages?.[1] || ''} onChange={(e: any) => setCurrentProject({...currentProject, detailImages: [currentProject.detailImages?.[0] || '', e.target.value, currentProject.detailImages?.[2] || '']})} onError={setAlertMessage} />
                       </div>
                    </div>
                  </SketchyCard>

                  <div className="grid grid-cols-3 gap-6">
                    <LocalizedInput label={isRTL ? 'العميل' : "Client"} value={currentProject.client} onChange={(val: any) => setCurrentProject({...currentProject, client: val})} />
                    <LocalizedInput label={isRTL ? 'الدور' : "Role"} value={currentProject.role} onChange={(val: any) => setCurrentProject({...currentProject, role: val})} />
                    <LocalizedInput label={isRTL ? 'الفترة' : "Period"} value={currentProject.duration} onChange={(val: any) => setCurrentProject({...currentProject, duration: val})} />
                  </div>

                  <div className="pt-8 border-t border-white/5 flex justify-end gap-4">
                    <button onClick={() => setIsEditingProject(false)} className="px-8 py-3 sketchy-border font-black uppercase text-xs hover:bg-white/5">{isRTL ? 'إلغاء' : 'Cancel'}</button>
                    <button onClick={saveProject} className="sketchy-btn filled px-12 py-3 text-lg font-black uppercase">{t.btn_save}</button>
                  </div>
                </div>
              </SketchyCard>
            </motion.div>
          </div>
        )}

        {isEditingTimeline && currentTimeline && (
          <div className="fixed inset-0 bg-ink/70 z-[100] flex items-center justify-center p-6 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl text-ink">
              <SketchyCard 
                title=""
                subtitle=""
                headerAction={null}
                className="bg-paper !opacity-100 shadow-[0_0_120px_rgba(0,0,0,0.8)] border-[3px] border-sepia/40 overflow-hidden !p-0"
              >
                <div className="bg-[#12100e] px-8 py-6 border-b border-white/5 flex justify-between items-center text-paper">
                   <h2 className="sketch-font text-2xl font-black">{t.modal_experience}</h2>
                   <button onClick={() => setIsEditingTimeline(false)} className="p-3 sketchy-border border-white/20 hover:bg-rust hover:text-white transition-all shadow-lg text-paper"><X size={20} /></button>
                </div>
                <div className="p-8 space-y-8 bg-paper">
                  <LocalizedInput label={isRTL ? 'المسمى الوظيفي' : "Role Title"} value={currentTimeline.role} onChange={(val: any) => setCurrentTimeline({...currentTimeline, role: val})} />
                  <LocalizedInput label={isRTL ? 'الشركة / الجهة' : "Entity Name"} value={currentTimeline.company} onChange={(val: any) => setCurrentTimeline({...currentTimeline, company: val})} />
                  <LocalizedInput label={isRTL ? 'المدة' : "Duration"} value={currentTimeline.year} onChange={(val: any) => setCurrentTimeline({...currentTimeline, year: val})} />
                  <LocalizedTextarea label={(t as any).label_timeline_desc} value={currentTimeline.description || {en:'', ar:'', it:''}} onChange={(val: any) => setCurrentTimeline({...currentTimeline, description: val})} />
                <div className="flex gap-4">
                  <button onClick={() => setIsEditingTimeline(false)} className="flex-1 py-3 sketchy-border font-black uppercase text-xs hover:bg-white/5">{isRTL ? 'إلغاء' : 'Cancel'}</button>
                  <button onClick={saveTimeline} className="sketchy-btn filled flex-[2] py-3 text-lg font-black uppercase">{t.btn_update}</button>
                </div>
              </div>
            </SketchyCard>
            </motion.div>
          </div>
        )}

        {isEditingCompetency && currentCompetency && (
          <div className="fixed inset-0 bg-ink/70 z-[100] flex items-center justify-center p-6 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl text-ink">
              <SketchyCard
                title=""
                subtitle=""
                headerAction={null}
                className="bg-paper !opacity-100 shadow-[0_0_120px_rgba(0,0,0,0.8)] border-[3px] border-sepia/40 overflow-hidden !p-0"
              >
                <div className="bg-[#12100e] px-8 py-6 border-b border-white/5 flex justify-between items-center text-paper">
                   <h2 className="sketch-font text-2xl font-black">{t.modal_skill}</h2>
                   <button onClick={() => setIsEditingCompetency(false)} className="p-3 sketchy-border border-white/20 hover:bg-rust hover:text-white transition-all shadow-lg text-paper"><X size={20} /></button>
                </div>
                <div className="p-8 space-y-8 bg-paper">
                  <LocalizedInput label={isRTL ? 'عنوان المهارة' : "Competency Title"} value={currentCompetency.title || ''} onChange={(val: any) => setCurrentCompetency({...currentCompetency, title: val})} />
                  <LocalizedTextarea label={isRTL ? 'الوصف' : "Description"} value={currentCompetency.description || ''} onChange={(val: any) => setCurrentCompetency({...currentCompetency, description: val})} />
                  <SketchyInput label={isRTL ? 'أيقونة (اسم)' : "Icon Name"} value={currentCompetency.icon || ''} onChange={(e) => setCurrentCompetency({...currentCompetency, icon: e.target.value})} />
                <div className="flex gap-4">
                  <button onClick={() => setIsEditingCompetency(false)} className="flex-1 py-3 sketchy-border font-black uppercase text-xs hover:bg-white/5">{isRTL ? 'إلغاء' : 'Cancel'}</button>
                  <button onClick={saveCompetency} className="sketchy-btn filled flex-[2] py-3 text-lg font-black uppercase">{isRTL ? 'حفظ المهارة' : 'Save Competency'}</button>
                </div>
              </div>
            </SketchyCard>
            </motion.div>
          </div>
        )}

        {currentInquiry && (
          <div className="fixed inset-0 bg-ink/80 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl">
              <SketchyCard 
                title={currentInquiry.name} 
                subtitle={currentInquiry.email}
                headerAction={<button onClick={() => setCurrentInquiry(null)} className="p-3 sketchy-border border-ink/20 hover:bg-ink hover:text-paper transition-all"><X size={20} /></button>}
                className="border-[3px] border-sepia/20 shadow-2xl"
              >
                <div className="bg-ink/5 p-8 sketchy-border border-dashed min-h-[200px] mb-8 text-lg leading-relaxed font-bold">
                   "{currentInquiry.message}"
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[9px] uppercase font-black opacity-60">Timestamp: {currentInquiry.createdAt ? new Date(currentInquiry.createdAt.seconds * 1000).toLocaleString() : 'Live'}</span>
                   <a href={`mailto:${currentInquiry.email}`} className="text-sepia font-black text-[10px] uppercase tracking-widest hover:underline">Reply via Mail</a>
                </div>
              </SketchyCard>
            </motion.div>
          </div>
        )}

        {confirmDialog && (
          <div className="fixed inset-0 bg-ink/80 z-[200] flex items-center justify-center p-6 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm">
              <SketchyCard title={isRTL ? 'تأكيد الأمان' : "Security Check"} subtitle={isRTL ? 'تأكيد الإجراء' : "Confirm Action"} className="bg-paper shadow-2xl border-[4px] border-rust/30">
                <p className="text-sm font-black opacity-80 mb-8">{confirmDialog.desc}</p>
                <div className="grid grid-cols-2 gap-4">
                   <button onClick={() => setConfirmDialog(null)} className="py-3 sketchy-border font-black uppercase tracking-widest text-[10px] hover:bg-ink/5">{isRTL ? 'إلغاء' : 'Abort'}</button>
                   <button onClick={confirmDialog.onConfirm} className="py-3 sketchy-border bg-rust text-white border-rust font-black uppercase tracking-widest text-[10px] hover:shadow-lg transition-all">{isRTL ? 'متابعة' : 'Proceed'}</button>
                </div>
              </SketchyCard>
            </motion.div>
          </div>
        )}
        {alertMessage && (
          <div className="fixed inset-0 bg-ink/80 z-[300] flex items-center justify-center p-6 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm">
              <SketchyCard title={isRTL ? 'تنبيه النظام' : "System Alert"} subtitle={isRTL ? 'إخطار هام' : "Important Notification"} className="bg-paper shadow-2xl border-[4px] border-sepia/30">
                <div className="flex items-start gap-4 mb-8">
                   <div className="p-2 sketchy-border bg-rust/10 text-rust">
                      <AlertTriangle size={20} />
                   </div>
                   <p className="text-sm font-black opacity-80 leading-relaxed">{alertMessage}</p>
                </div>
                <button onClick={() => setAlertMessage(null)} className="w-full py-4 sketchy-border bg-ink text-paper font-black uppercase tracking-widest text-[10px] hover:shadow-lg transition-all">{isRTL ? 'فهمت' : 'Understood'}</button>
              </SketchyCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

