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
import { secureStorage } from './utils/secureStorage';
import { useWorkDetails } from './hooks/useWorkDetails';
import { usePayments } from './hooks/usePayments';
import { useComplaints } from './hooks/useComplaints';

function App() {
  const { theme } = useTheme();
  const location = useLocation();
  const { isOnline } = useInternetStatus();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showDeactivatedModal, setShowDeactivatedModal] = useState(false);
  const [deactivationMessage, setDeactivationMessage] = useState('');
  const [hasProcessedError, setHasProcessedError] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

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

  // ✅ Only fetch these if authenticated
  const shouldFetch = isAuthenticated && !isPublicPage && !showDeactivatedModal;
  
  const { error: scholarError, isLoading: scholarLoading } = useScholar(shouldFetch);
  const { error: workError, isLoading: workLoading } = useWorkDetails(shouldFetch);
  const { error: paymentError, isLoading: paymentLoading } = usePayments(shouldFetch);
  const { error: complaintError, isLoading: complaintLoading } = useComplaints(1, 10, "all", "", shouldFetch);

  // Track loading state
  useEffect(() => {
    if (!shouldFetch) {
      setIsCheckingStatus(false);
      return;
    }
    
    const allLoaded = !scholarLoading && !workLoading && !paymentLoading && !complaintLoading;
    if (allLoaded) {
      setIsCheckingStatus(false);
    }
  }, [scholarLoading, workLoading, paymentLoading, complaintLoading, shouldFetch]);

  // Handle deactivation popup - Show popup first, then redirect
  useEffect(() => {
    // Don't process if already shown or still loading
    if (hasProcessedError || isCheckingStatus) return;

    const errors = [
      scholarError,
      workError,
      paymentError,
      complaintError,
    ];

    // Check for 404 error with scholar not found / deactivated message
    const deactivatedError = errors.find(
      (err) =>
        err?.response?.status === 404 &&
        (err?.response?.data?.message?.toLowerCase().includes("scholar") ||
         err?.response?.data?.message?.toLowerCase().includes("deactivated") ||
         err?.response?.data?.message?.toLowerCase().includes("inactive") ||
         err?.response?.data?.message?.toLowerCase().includes("not found"))
    );

    if (deactivatedError) {
      setHasProcessedError(true);
      const message = deactivatedError?.response?.data?.message || "Your account has been deactivated. Please contact support.";
      setDeactivationMessage(message);
      setShowDeactivatedModal(true);
    }
  }, [
    scholarError,
    workError,
    paymentError,
    complaintError,
    hasProcessedError,
    isCheckingStatus,
  ]);

  const handleCloseModal = () => {
    setShowDeactivatedModal(false);
    // Clear storage and redirect after popup is closed
    secureStorage.clear();
    window.location.href = "/";
  };

  // Show No Internet component if offline
  if (!isOnline) {
    return <NoInternet />;
  }

  return (
    <div className={`app ${theme}`}>
      {/* Deactivated Account Modal */}
      {showDeactivatedModal && (
        <div className="deactivated-modal-overlay">
          <div className="deactivated-modal-content">
            <div className="deactivated-modal-header">
              <div className="deactivated-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <h3>Account Deactivated</h3>
            </div>
            <div className="deactivated-modal-body">
              {/* <p>{deactivationMessage}</p> */}
              <p className="deactivated-subtext">Please contact the administrator for further assistance.</p>
            </div>
            <div className="deactivated-modal-footer">
              <button className="deactivated-ok-btn" onClick={handleCloseModal}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Protected Layout - Only show when NOT on public page AND authenticated AND no deactivation modal */}
      {!showDeactivatedModal && !isPublicPage && isAuthenticated && (
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
      {!showDeactivatedModal && (isPublicPage || !isAuthenticated) && (
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