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

  // Logout only
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('scholar');
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    window.location.href = '/';
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const isLoginPage = location.pathname === '/login';

  // Show No Internet component if offline
  if (!isOnline) {
    return <NoInternet />;
  }

  return (
    <div className={`app ${theme}`}>
      {/* Protected Layout */}
      {!isLoginPage && isAuthenticated && (
        <div className="app-layout">
          <Sidebar
            collapsed={sidebarCollapsed}
            onLogout={handleLogout}
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
              onLogout={handleLogout}
              setMobileOpen={setMobileOpen}
            />

            <div className="page-container">
              <AppRoutes isAuthenticated={isAuthenticated} />
            </div>
          </div>
        </div>
      )}

      {/* Public/Login */}
      {(isLoginPage || !isAuthenticated) && (
        <AppRoutes isAuthenticated={isAuthenticated} />
      )}
    </div>
  );
}

function AppRoutes({ isAuthenticated }) {
  
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Private */}
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
            <ChangePassword
            />
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

      {/* Default */}
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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;