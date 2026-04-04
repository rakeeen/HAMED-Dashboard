import React from 'react';
import { MascotFace } from '../ui/MascotFace';
import { 
  BarChart3, 
  Palette, 
  Briefcase, 
  FileText, 
  Settings, 
  LogOut, 
  Cloud,
  Sun,
  Moon
} from 'lucide-react';
import { useSiteContext } from '../../context/SiteContext';
import { DASHBOARD_I18N } from '../../dashboard_i18n';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  lang: 'en' | 'ar' | 'it';
}

export const SketchySidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, lang }) => {
  const { isSyncing, hasUnpublishedChanges, publishContent, settings, updateSettings } = useSiteContext();
  const t = DASHBOARD_I18N[lang];

  const menuItems = [
    { id: 'analytics', label: t.nav_analytics, icon: BarChart3 },
    { id: 'branding', label: t.nav_branding, icon: Palette },
    { id: 'projects', label: t.nav_projects, icon: Briefcase },
    { id: 'resume', label: t.nav_experience, icon: FileText },
    { id: 'settings', label: t.nav_settings, icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('hamed_admin_auth');
    window.location.reload();
  };

  const isLight = settings.theme === 'light';

  return (
    <aside className="w-72 border-r-2 border-[color:var(--ink-light)] border-opacity-20 bg-[color:var(--paper-dark)] flex flex-col h-screen sticky top-0 overflow-hidden" style={{ borderColor: 'var(--ink-light)', opacity: 1 }}>
      {/* Branding Header */}
      <div className="p-8 pb-4">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12">
             <MascotFace />
          </div>
          <div>
            <h1 className="sketch-font text-2xl font-bold tracking-tight" style={{ color: 'var(--ink)' }}>Hamed.</h1>
            <p className="text-[10px] uppercase tracking-widest font-black" style={{ color: 'var(--ink-faded)', opacity: 0.8 }}>{t.admin_workspace}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 transition-all relative group rounded-lg`}
            style={{
              color: activeTab === item.id ? 'var(--ink)' : 'var(--ink-faded)',
              background: activeTab === item.id ? 'color-mix(in srgb, var(--ink) 8%, transparent)' : 'transparent',
            }}
          >
            <item.icon size={18} style={{ color: activeTab === item.id ? 'var(--sepia)' : 'var(--ink-light)', flexShrink: 0 }} />
            <span className="text-sm font-black uppercase tracking-widest" style={{ opacity: activeTab === item.id ? 1 : 0.85 }}>
              {item.label}
            </span>
            {activeTab === item.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full" style={{ background: 'var(--sepia)' }} />
            )}
          </button>
        ))}
      </nav>

      {/* Sync Status & Actions */}
      <div className="p-6 space-y-4" style={{ borderTop: '1px solid color-mix(in srgb, var(--ink) 10%, transparent)' }}>
        {/* Sync Indicator */}
        <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full" style={{ background: isSyncing ? 'var(--forest)' : 'var(--ink-light)', animation: isSyncing ? 'pulse 1s infinite' : 'none' }} />
               <span className="text-[9px] uppercase tracking-widest font-black" style={{ color: 'var(--ink-faded)', opacity: 0.7 }}>
                 {isSyncing ? t.syncing : t.ready}
               </span>
            </div>
            {hasUnpublishedChanges && (
                <span className="text-[9px] uppercase tracking-widest font-black" style={{ color: 'var(--rust)' }}>● {t.pending}</span>
            )}
        </div>

        {/* Publish Button */}
        <button
           onClick={publishContent}
           disabled={!hasUnpublishedChanges || isSyncing}
           className="w-full py-3 flex items-center justify-center gap-2 transition-all font-bold text-sm uppercase tracking-widest"
           style={{
             border: '2px solid',
             borderColor: hasUnpublishedChanges && !isSyncing ? 'var(--sepia)' : 'var(--ink-light)',
             borderRadius: 'var(--radius-btn)',
             background: hasUnpublishedChanges && !isSyncing ? 'var(--sepia)' : 'transparent',
             color: hasUnpublishedChanges && !isSyncing ? 'white' : 'var(--ink-light)',
             opacity: hasUnpublishedChanges && !isSyncing ? 1 : 0.4,
             cursor: hasUnpublishedChanges && !isSyncing ? 'pointer' : 'not-allowed',
           }}
        >
          <Cloud size={15} />
          <span className="sketch-font text-base">{t.btn_push_live}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => updateSettings({ theme: isLight ? 'dark' : 'light' })}
          className="w-full flex items-center justify-center gap-2 py-2 transition-all"
          style={{ color: 'var(--ink-faded)', opacity: 0.7 }}
          title="Toggle Light/Dark"
        >
          {isLight ? <Moon size={14} /> : <Sun size={14} />}
          <span className="text-[10px] uppercase tracking-widest font-black">
            {isLight ? t.dark_mode : t.light_mode}
          </span>
        </button>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 transition-all"
          style={{ color: 'var(--ink-faded)', opacity: 0.6 }}
        >
          <LogOut size={14} />
          <span className="text-[10px] uppercase tracking-widest font-black">{t.log_exit}</span>
        </button>
      </div>
    </aside>
  );
};
