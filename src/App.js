import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext';
import useInternetStatus from './hooks/useInternetStatus';
import NoInternet from './components/NoInternet/NoInternet';
import './App.css';

import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';

import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';
import ChangePassword from './pages/ChangePassword/ChangePassword';
import PaymentHistory from './pages/PaymentHistory/PaymentHistory';
import ComplainRegister from './pages/ComplainRegister/ComplainRegister';
import ForgotPassword from './pages/ForgetPassword/ForgetPassword';

import PrivateRoute from './components/PrivateRoute/PrivateRoute';

function App() {
  const { theme } = useTheme();
  const location = useLocation();
  const { isOnline } = useInternetStatus();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auth check
  const isAuthenticated = !!localStorage.getItem('authToken');

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) setSidebarCollapsed(true);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Public routes that should NOT show sidebar/header
  const publicRoutes = ['/login', '/forgot-password'];
  const isPublicPage = publicRoutes.some(route =>
    location.pathname === route || location.pathname.startsWith(route + '/')
  );

  // Show No Internet component if offline
  if (!isOnline) {
    return <NoInternet />;
  }

  return (
    <div className={`app ${theme}`}>
      {/* Protected Layout - Only show when NOT on public page AND authenticated */}
      {!isPublicPage && isAuthenticated && (
        <div className="app-layout">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
          />

          <div
            className={`main-content ${sidebarCollapsed && !isMobile ? 'expanded' : ''
              }`}
          >
            <Header
              onToggleSidebar={toggleSidebar}
              sidebarCollapsed={sidebarCollapsed}
              setMobileOpen={setMobileOpen}
            />

            <div className="page-container">
              <AppRoutes isAuthenticated={isAuthenticated} />
            </div>
          </div>
        </div>
      )}

      {/* Public Routes - Show when on public page OR not authenticated */}
      {(isPublicPage || !isAuthenticated) && (
        <AppRoutes isAuthenticated={isAuthenticated} />
      )}
    </div>
  );
}

function AppRoutes({ isAuthenticated }) {
  return (
    <Routes>
      {/* Public Routes - No sidebar/header */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Private Routes - With sidebar/header */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/change-password"
        element={
          <PrivateRoute>
            <ChangePassword />
          </PrivateRoute>
        }
      />
      <Route
        path="/payment-history"
        element={
          <PrivateRoute>
            <PaymentHistory />
          </PrivateRoute>
        }
      />
      <Route
        path="/complain-register"
        element={
          <PrivateRoute>
            <ComplainRegister />
          </PrivateRoute>
        }
      />

      {/* Default Redirect - Root path */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Catch all - 404 redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;