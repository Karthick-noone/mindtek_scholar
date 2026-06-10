// App.js - Fixed Version (No Loading Screen)
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
import { useScholar } from './hooks/useScholar';
import { useAccountStatus } from './hooks/useAccountStatus';
import { secureStorage } from './utils/secureStorage';
import { InfoIcon, RefreshCw } from 'lucide-react';

function App() {
  const { theme } = useTheme();
  const location = useLocation();
  const { isOnline } = useInternetStatus();
  const { isActive, message, showPopup, checkStatus, handleLogout, isServerError, handleRefresh } = useAccountStatus();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthenticated = !!secureStorage.getToken();

  // Check status when app loads and on navigation
  useEffect(() => {
    if (isAuthenticated) {
      checkStatus();
    }
  }, [isAuthenticated, location.pathname, checkStatus]);

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

  const publicRoutes = ['/login', '/forgot-password'];
  const isPublicPage = publicRoutes.some(route =>
    location.pathname === route || location.pathname.startsWith(route + '/')
  );

  const shouldFetch = isAuthenticated && !isPublicPage && isActive;

  // Fetch data only if account is active
  const { error: scholarError, isLoading: scholarLoading } = useScholar(shouldFetch);

  if (!isOnline) {
    return <NoInternet />;
  }

  return (
    <div className={`app ${theme}`}>
      {/* Status Popup */}
      {showPopup && isServerError && (
        <div className="deactivated-modal-overlay">
          <div className="deactivated-modal-content">
            <div className="deactivated-modal-header">
              <div className="deactivated-icon">
                <InfoIcon size={55} />
              </div>
              <h3>Server Issue</h3>
            </div>
            <div className="deactivated-modal-body">
              <p>{message || "Server is currently unavailable. Please refresh the page."}</p>
            </div>
            <div className="deactivated-modal-footer">
              <button className="deactivated-ok-btn" onClick={handleRefresh}>
                <RefreshCw size={20}/> <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showPopup && !isServerError && (
        <div className="deactivated-modal-overlay">
          <div className="deactivated-modal-content">
            <div className="deactivated-modal-header">
              <div className="deactivated-icon">
                <InfoIcon size={55} />
              </div>
              <h3>Account Deactivated</h3>
            </div>
            <div className="deactivated-modal-body">
              <p>{message || "Your account has been deactivated. Please contact Admin."}</p>
            </div>
            <div className="deactivated-modal-footer">
              <button className="deactivated-ok-btn" onClick={handleLogout}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main App Content */}
      {!showPopup && !isPublicPage && isAuthenticated && isActive && (
        <div className="app-layout">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
          />
          <div className={`main-content ${sidebarCollapsed && !isMobile ? 'expanded' : ''}`}>
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

      {/* Public Routes */}
      {!showPopup && (isPublicPage || !isAuthenticated || !isActive) && (
        <AppRoutes isAuthenticated={isAuthenticated} />
      )}
    </div>
  );
}

function AppRoutes({ isAuthenticated }) {
  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/forgot-password"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />}
      />
      <Route path="/dashboard" element={
        <PrivateRoute><Dashboard /></PrivateRoute>
      } />
      <Route path="/profile" element={
        <PrivateRoute><Profile /></PrivateRoute>
      } />
      <Route path="/change-password" element={
        <PrivateRoute><ChangePassword /></PrivateRoute>
      } />
      <Route path="/payment-history" element={
        <PrivateRoute><PaymentHistory /></PrivateRoute>
      } />
      <Route path="/complain-register" element={
        <PrivateRoute><ComplainRegister /></PrivateRoute>
      } />
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;