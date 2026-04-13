import React, { useState, useEffect } from 'react';
import { 
  WifiOff, 
  Wifi, 
  RefreshCw, 
  AlertCircle, 
  Clock, 
  Globe,
  Zap,
  Shield,
  Database
} from 'lucide-react';
import './NoInternet.css';

const NoInternet = ({ onReconnect }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastChecked, setLastChecked] = useState(null);

  const checkConnection = async () => {
    setIsChecking(true);
    setLastChecked(new Date().toLocaleTimeString());
    
    try {
      // Try to fetch a small resource to check real connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // If we get here without error, connection exists
      if (onReconnect) {
        onReconnect();
      }
      window.location.reload();
    } catch (error) {
      console.log('Still offline:', error);
      setRetryCount(prev => prev + 1);
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Auto-retry every 30 seconds
    const interval = setInterval(() => {
      if (!navigator.onLine) {
        checkConnection();
      }
    }, 30000);

    // Listen for online event
    const handleOnline = () => {
      if (onReconnect) onReconnect();
      window.location.reload();
    };

    window.addEventListener('online', handleOnline);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <div className="nointernet-premium">
      <div className="nointernet-premium-container">
        {/* Animated Background */}
        <div className="nointernet-premium-bg">
          <div className="bg-circle bg-circle-1"></div>
          <div className="bg-circle bg-circle-2"></div>
          <div className="bg-circle bg-circle-3"></div>
        </div>

        {/* Main Content */}
        <div className="nointernet-premium-content">
          {/* Icon with Pulse Animation */}
          <div className="nointernet-premium-icon-wrapper">
            <div className="icon-pulse"></div>
            <div className="icon-ring"></div>
            <WifiOff size={80} />
          </div>

          {/* Title */}
          <h1 className="nointernet-premium-title">No Internet Connection</h1>
          
          {/* Description */}
          <p className="nointernet-premium-description">
            It seems you're offline. Please check your internet connection and try again.
          </p>

          {/* Connection Details Card */}
          {/* <div className="nointernet-premium-details">
            <div className="detail-item">
              <Globe size={18} />
              <span>Network Status:</span>
              <strong className="offline">Disconnected</strong>
            </div>
            <div className="detail-item">
              <Clock size={18} />
              <span>Last Checked:</span>
              <strong>{lastChecked || 'Not checked yet'}</strong>
            </div>
            <div className="detail-item">
              <RefreshCw size={18} />
              <span>Auto-retry:</span>
              <strong>Every 30 seconds</strong>
            </div>
            {retryCount > 0 && (
              <div className="detail-item">
                <AlertCircle size={18} />
                <span>Retry Attempts:</span>
                <strong>{retryCount}</strong>
              </div>
            )}
          </div> */}

          {/* Action Buttons */}
          {/* <div className="nointernet-premium-actions">
            <button 
              className="action-btn primary" 
              onClick={checkConnection}
              disabled={isChecking}
            >
              {isChecking ? (
                <>
                  <div className="btn-spinner"></div>
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  <span>Try Again</span>
                </>
              )}
            </button>
          </div> */}

          {/* Tips Section */}
          {/* <div className="nointernet-premium-tips">
            <h4>
              <Zap size={16} />
              Troubleshooting Tips
            </h4>
            <div className="tips-grid">
              <div className="tip-card">
                <Wifi size={16} />
                <span>Check your Wi-Fi or mobile data</span>
              </div>
              <div className="tip-card">
                <Shield size={16} />
                <span>Disable VPN or proxy if connected</span>
              </div>
              <div className="tip-card">
                <Database size={16} />
                <span>Restart your router or modem</span>
              </div>
              <div className="tip-card">
                <RefreshCw size={16} />
                <span>Try refreshing the page</span>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default NoInternet;