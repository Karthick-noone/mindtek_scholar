import React, { useState, useEffect, useRef } from 'react';
import { Mail, User, RefreshCw, Clock, ArrowLeft, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import './ForgetPassword.css';
import { useSendOtp } from '../../hooks/useForgotPassword';

const OtpVerification = ({
  email,
  scholarId,
  onVerified,
  onBack,
  verifyError,
  onClearError
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300);  // 5 minutes in seconds
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [localError, setLocalError] = useState('');
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [changeData, setChangeData] = useState({ email: email, scholarId: scholarId });
  const [isOtpExpired, setIsOtpExpired] = useState(false);
  const inputRefs = useRef([]);

  const { mutate: resendOtpMutation, isPending: isResending } = useSendOtp();

  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsResendDisabled(false);
      setIsOtpExpired(true);
      // ✅ Clear OTP fields when expired
      setOtp(['', '', '', '', '', '']);
      // ✅ Clear any existing errors
      setLocalError('');
      if (onClearError) onClearError();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setLocalError('');
    if (onClearError) onClearError();
    if (value && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join('');

    if (enteredOtp.length !== 6) {
      setLocalError('Please enter the complete 6-digit OTP');
      setIsVerifying(false);
      return;
    }

    setIsVerifying(true);

    try {
      await onVerified(enteredOtp);
    } catch (error) {
      console.error("Verification error:", error);
      setIsVerifying(false);
      setLocalError(error?.message || 'Verification failed. Please try again.');
    }
  };

  const handleResendOnExpiry = () => {
    if (onClearError) onClearError();

    resendOtpMutation(
      {
        user_id: scholarId,
        email: email,
        com_url_code: process.env.REACT_APP_COMPANY_CODE || "http://mindtekscholar.seasense.in/"

      },
      {
        onSuccess: (response) => {
          setIsResendDisabled(true);
          setIsOtpExpired(false);
          setTimeLeft(300);
          setLocalError('');
          setOtp(['', '', '', '', '', '']);
          setIsVerifying(false);
          //  Focus on first input after resend
          setTimeout(() => {
            if (inputRefs.current[0]) inputRefs.current[0].focus();
          }, 100);
        },
        onError: (error) => {
          setLocalError(error.response?.data?.message || 'Failed to resend OTP');
        }
      }
    );
  };

  const handleResendOtp = () => {
    if (onClearError) onClearError();

    resendOtpMutation(
      {
        user_id: scholarId,
        email: email,
        com_url_code: process.env.REACT_APP_COMPANY_CODE || "http://mindtekscholar.seasense.in/"

      },
      {
        onSuccess: (response) => {
          setIsResendDisabled(true);
          setIsOtpExpired(false);
          setTimeLeft(300);
          setLocalError('');
          setOtp(['', '', '', '', '', '']);
          // ✅ Focus on first input after resend
          setTimeout(() => {
            if (inputRefs.current[0]) inputRefs.current[0].focus();
          }, 100);
        },
        onError: (error) => {
          setLocalError(error.response?.data?.message || 'Failed to resend OTP');
        }
      }
    );
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const otpArray = pastedData.split('');
      const newOtp = [...otp];
      for (let i = 0; i < Math.min(otpArray.length, 6); i++) newOtp[i] = otpArray[i];
      setOtp(newOtp);
      const lastIndex = Math.min(otpArray.length, 5);
      if (inputRefs.current[lastIndex]) inputRefs.current[lastIndex].focus();
    }
  };

  const displayError = !isOtpExpired && (localError || verifyError);

  return (
    <>
      <div className="enhanced-info-side otp-info">
        <div className="info-content">
          <div className="info-badge">
            <Shield size={20} />
            <span>Security Check</span>
          </div>
          <h3>Verify OTP</h3>
          <p>We use this verification to ensure account security. The OTP is valid for 2 minutes.</p>

          <div className="info-tip-list">
            <div className="tip-item">
              <CheckCircle size={16} />
              <span>Check your spam/junk folder if you don't see the email</span>
            </div>
            <div className="tip-item">
              <CheckCircle size={16} />
              <span>Make sure you have access to your registered email</span>
            </div>
            <div className="tip-item">
              <CheckCircle size={16} />
              <span>You can request a new code after 5 minutes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="enhanced-form-side otp-side">
        <div className="enhanced-form-header">
          <button className="back-btn-enhanced" onClick={onBack}>
            <ArrowLeft size={18} />
          </button>
          <div className="step-indicator">
            <span className="step completed">✓</span>
            <span className="step-line"></span>
            <span className="step active">02</span>
            <span className="step-line"></span>
            <span className="step">03</span>
          </div>
          <h2>Enter 6 digit OTP</h2>
          <p>Enter the 6-digit verification code sent to your email</p>
        </div>

        <div className="otp-input-section">
          <label>Verification Code</label>
          <div className="otp-inputs-enhanced" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={displayError ? 'error' : ''}
                autoFocus={index === 0}
                disabled={isOtpExpired}
              />
            ))}
          </div>
          {displayError && <span className="err-msg">{displayError}</span>}
        </div>

        {!isOtpExpired && (
          <div className="timer-enhanced">
            <Clock size={16} />
            <span>OTP expires in <strong>{formatTime(timeLeft)}</strong></span>
          </div>
        )}

        {isOtpExpired && (
          <div className="otp-expired-message">
            <AlertCircle size={16} />
            <span>OTP has expired. Please request a new code.</span>
          </div>
        )}

        {!isOtpExpired ? (
          <button
            className="enhanced-submit-btn verify"
            onClick={handleVerify}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <>
                <div className="btn-spinner"></div>
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                <span>Verify & Continue</span>
              </>
            )}
          </button>
        ) : (
          <button
            className="enhanced-submit-btn resend"
            onClick={handleResendOnExpiry}
            disabled={isResending}
          >
            {isResending ? (
              <>
                <div className="btn-spinner"></div>
                <span>Sending Code...</span>
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                <span>Resend OTP</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Change Credentials Modal */}
      {showChangeModal && (
        <div className="modal-enhanced-overlay" onClick={() => setShowChangeModal(false)}>
          <div className="modal-enhanced" onClick={(e) => e.stopPropagation()}>
            <div className="modal-enhanced-header">
              <AlertCircle size={24} color="#2563eb" />
              <h3>Update Contact Information</h3>
            </div>
            <div className="modal-enhanced-body">
              <div className="change-field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={changeData.email}
                  onChange={(e) => setChangeData({ ...changeData, email: e.target.value })}
                  placeholder="Enter new email"
                />
              </div>
              <div className="change-field">
                <label>Scholar ID</label>
                <input
                  type="text"
                  value={changeData.scholarId}
                  onChange={(e) => setChangeData({ ...changeData, scholarId: e.target.value })}
                  placeholder="Enter Scholar ID"
                />
              </div>
              <p className="warning-text">A new OTP will be sent to the updated email address.</p>
            </div>
            <div className="modal-enhanced-footer">
              <button className="modal-btn cancel" onClick={() => setShowChangeModal(false)}>Cancel</button>
              <button className="modal-btn submit" onClick={() => {
                setShowChangeModal(false);
                handleResendOtp();
              }}>Update & Resend</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OtpVerification;