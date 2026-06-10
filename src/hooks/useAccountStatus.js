// hooks/useAccountStatus.js
import { useState, useCallback } from 'react';
import { checkAccountStatus } from '../services/accountStatusService';
import { secureStorage } from '../utils/secureStorage';

export const useAccountStatus = () => {
  const [isActive, setIsActive] = useState(true);
  const [message, setMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [isServerError, setIsServerError] = useState(false);

  const checkStatus = useCallback(async () => {
    const isAuthenticated = !!localStorage.getItem('authToken');
    
    if (!isAuthenticated) {
      setIsActive(true);
      setShowPopup(false);
      setIsServerError(false);
      return;
    }

    const result = await checkAccountStatus();
    const popupType = result.popupType || (result.isActive === false ? 'deactivated' : '');

    setIsActive(result.isActive);
    setMessage(result.message || '');
    setIsServerError(popupType === 'serverError');
    setShowPopup(!!popupType);

    if (popupType === 'serverError') {
      return;
    }

    if (popupType === 'deactivated') {
      // Clear storage after showing popup
      setTimeout(() => {
        secureStorage.clear();
        localStorage.removeItem('authToken');
        localStorage.removeItem('scholar');
      }, 100);
      return;
    }
  }, []);

  const handleLogout = useCallback(() => {
    setShowPopup(false);
    setIsActive(true);
    window.location.href = "/";
  }, []);

  const handleRefresh = useCallback(() => {
    setShowPopup(false);
    setIsServerError(false);
    window.location.reload();
  }, []);

  return {
    isActive,
    message,
    showPopup,
    isServerError,
    checkStatus,
    handleLogout,
    handleRefresh
  };
};