import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { CustomCursor } from './components/ui/CustomCursor';
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
  const isAuth = localStorage.getItem('hamed_admin_auth') === 'true';
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <SiteProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/login" element={
            <div className="bg-background text-white selection:bg-primary/30 min-h-screen font-sans flex flex-col">
              <DashboardCursorWrapper />
              <Login />
            </div>
          } />
          <Route path="/*" element={
            <RequireAuth>
              <div className="bg-background text-white selection:bg-primary/30 min-h-screen font-sans flex flex-col">
                <DashboardCursorWrapper />
                <Dashboard />
              </div>
            </RequireAuth>
          } />
        </Routes>
      </Router>
    </SiteProvider>
  );
}

const DashboardCursorWrapper = () => {
  const { settings } = useSiteContext();
  if (!settings.showCursor) return null;
  return <CustomCursor />;
};
