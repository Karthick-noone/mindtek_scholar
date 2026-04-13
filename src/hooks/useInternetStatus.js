import { useState, useEffect } from 'react';

const useInternetStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setHasChecked(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setHasChecked(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, hasChecked };
};

export default useInternetStatus;