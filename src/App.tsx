import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { CustomCursor } from './components/ui/CustomCursor';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { SiteProvider } from './context/SiteContext';

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
      <Router basename={import.meta.env.BASE_URL}>
        <ScrollToTop />
        <Routes>
          <Route path="/login" element={
            <div className="bg-background text-white selection:bg-primary/30 min-h-screen font-sans flex flex-col">
              <CustomCursor />
              <Login />
            </div>
          } />
          <Route path="/*" element={
            <RequireAuth>
              <div className="bg-background text-white selection:bg-primary/30 min-h-screen font-sans flex flex-col">
                <CustomCursor />
                <Dashboard />
              </div>
            </RequireAuth>
          } />
        </Routes>
      </Router>
    </SiteProvider>
  );
}
