// hooks/useAccountStatus.js
import { useState, useEffect, useCallback } from 'react';
import { checkAccountStatus } from '../services/accountStatusService';
import { secureStorage } from '../utils/secureStorage';

export const useAccountStatus = () => {
  const [isActive, setIsActive] = useState(true);
  const [message, setMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const checkStatus = useCallback(async () => {
    const isAuthenticated = !!localStorage.getItem('authToken');
    
    if (!isAuthenticated) {
      setIsActive(true);
      return;
    }

    const result = await checkAccountStatus();
    setIsActive(result.isActive);
    setMessage(result.message);
    
    if (!result.isActive) {
      setShowPopup(true);
      // Clear storage after showing popup
      setTimeout(() => {
        secureStorage.clear();
        localStorage.removeItem('authToken');
        localStorage.removeItem('scholar');
      }, 100);
    }
  }, []);

  const handleLogout = useCallback(() => {
    setShowPopup(false);
    setIsActive(true);
    window.location.href = "/";
  }, []);

  return {
    isActive,
    message,
    showPopup,
    checkStatus,
    handleLogout
  };
};