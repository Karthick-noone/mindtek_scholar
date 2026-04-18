import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './ImagePreviewModal.css';

const ImagePreviewModal = ({ imageUrl, onClose, onDelete }) => {
  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="image-preview-overlay" onClick={onClose}>
      <div className="image-preview-container" onClick={(e) => e.stopPropagation()}>
        {/* Image Area with Close Button on Top Right */}
        <div className="image-preview-body">
          
          <div className="image-preview-wrapper">
            <button className="image-close-btn" onClick={onClose} title="Close">
            <X size={16} />
          </button>
            <img src={imageUrl} alt="Profile Preview" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;