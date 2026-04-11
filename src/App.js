import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext';
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

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileOpen, setMobileOpen] = useState(false);
  //  auth directly from localStorage (IMPORTANT FIX)
  const isAuthenticated = !!localStorage.getItem('authToken');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = (scholarId, password) => {
    if (scholarId === 'user' && password === 'user123') {
      localStorage.setItem('authToken', 'dummy-token');
      localStorage.setItem(
        'user',
        JSON.stringify({ scholarId, name: 'Karthick Scholar' })
      );
      window.location.href = '/'; // force redirect cleanly
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const isLoginPage = location.pathname === '/login';

  return (
    <div className={`app ${theme}`}>
      {/*  Show layout only when NOT on login */}
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
              <AppRoutes isAuthenticated={isAuthenticated} handleLogin={handleLogin} />
            </div>
          </div>
        </div>
      )}

      {/*  Login page (no layout) */}
      {(isLoginPage || !isAuthenticated) && (
        <AppRoutes isAuthenticated={isAuthenticated} handleLogin={handleLogin} />
      )}
    </div>
  );
}

function AppRoutes({ isAuthenticated, handleLogin }) {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login onLogin={handleLogin} />} />

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

      {/* Default Routes */}
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