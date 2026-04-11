import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { SiteProvider, useSiteContext } from './context/SiteContext';
import { CustomCursor } from './components/ui/CustomCursor';

/** TEMP: set to `false` to require login again */
const AUTH_DISABLED = true;

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  if (AUTH_DISABLED) {
    return <>{children}</>;
  }
  const isAuth = localStorage.getItem('hamed_admin_auth') === 'true' || sessionStorage.getItem('hamed_admin_auth') === 'true';
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Syncs the settings.theme to document.body so CSS variables update
const ThemeSync = () => {
  const { settings } = useSiteContext();
  useEffect(() => {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(settings.theme ?? 'dark');
  }, [settings.theme]);
  return null;
};

export default function App() {
  return (
    <SiteProvider>
      <Router>
        <ScrollToTop />
        <ThemeSync />
        <CustomCursor />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          } />
        </Routes>
      </Router>
    </SiteProvider>
  );
}
