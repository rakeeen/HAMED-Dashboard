import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { SiteProvider, useSiteContext } from './context/SiteContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
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
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <RequireAuth>
              <ThemeSync />
              <Dashboard />
            </RequireAuth>
          } />
        </Routes>
      </Router>
    </SiteProvider>
  );
}
