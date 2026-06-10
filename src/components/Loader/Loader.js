// Loader.js - Clean Rounded Style
import React from 'react';
import './Loader.css';

const Loader = ({ 
  type = 'scholar',
  size = 'medium',
  fullScreen = false,
  text = 'loading....',
  overlay = false
}) => {
  
  const renderLoader = () => {
    switch(type) {
      case 'scholar':
        return (
          <div className={`loader-scholar loader-${size}`}>
            <div className="scholar-spinner-container">
              {/* Standard rounded spinner ring */}
              <div className="scholar-rounded-ring"></div>
              
              {/* Scholar Icon in center */}
              <div className="scholar-icon-center">
                <svg className="scholar-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3L1 9L12 15L23 9L12 3Z" />
                  <path d="M5 12V16L12 20L19 16V12" />
                  <path d="M19 12V19" />
                  <circle cx="19" cy="16" r="2" />
                  <path d="M9 9L12 11L15 9" />
                </svg>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className={`loader-spinner loader-${size}`}>
            <div className="spinner-ring"></div>
          </div>
        );
    }
  };

  const loaderContent = (
    <div className={`loader-container ${type}`}>
      {renderLoader()}
      {text && <p className="loader-text">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        {loaderContent}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="loader-overlay">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};

export default Loader;