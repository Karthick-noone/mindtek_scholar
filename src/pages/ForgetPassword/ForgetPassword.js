import React, { useState } from 'react';
import { Mail, User, ArrowRight, Shield, Lock, KeyRound, Sparkles, CheckCircle, AlertCircle, Send } from 'lucide-react';
import OtpVerification from './OtpVerification';
import ResetPassword from './ResetPassword';
import './ForgetPassword.css';
import { Link } from 'react-router-dom';
import { useResetPassword, useSendOtp, useVerifyOtp, useVerifyOtpLocally } from '../../hooks/useForgotPassword';
import { secureStorage } from '../../utils/secureStorage';

const ForgetPassword = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    scholarId: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [verificationData, setVerificationData] = useState(null);
  const [encryptedOtp, setEncryptedOtp] = useState(null);
  const [resetData, setResetData] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Hooks
  const { mutate: sendOtpMutation, isPending: isSendingOtp, error: sendOtpError } = useSendOtp();
  // const { verifyOtp } = useVerifyOtpLocally();
  const { mutate: resetPasswordMutation, isPending: isResettingPassword, error: resetError } = useResetPassword();
  const [userData, setUserData] = useState(null);
  const { mutateAsync: verifyOtp } = useVerifyOtp();
  const scholar = secureStorage.getScholar();

  const userId = scholar?.user_id

  const validateForm = () => {
    const newErrors = {};
    if (!formData.scholarId.trim()) {
      newErrors.scholarId = 'Scholar ID is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const showSuccessAlertMessage = (message) => {
    setSuccessMessage(message);
    setShowSuccessAlert(true);
    setTimeout(() => {
      setShowSuccessAlert(false);
      setSuccessMessage('');
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      sendOtpMutation(
        {
          user_id: formData.scholarId,
          email: formData.email,
          com_url_code: process.env.REACT_APP_COMPANY_CODE || "http://mindtekscholar.seasense.in/"
        },
        {
          onSuccess: (response) => {
            const encryptedData = response.data?.data?.encrypted_otp;
            const userId = response.data?.data?.user_id;
            const userName = response.data?.data?.name;

            setEncryptedOtp(encryptedData);
            setUserData({
              userId: userId,
              name: userName,
              scholarId: formData.scholarId,
              email: formData.email
            });

            setVerificationData({
              scholarId: formData.scholarId,
              email: formData.email,
              otpSent: true
            });

            // Show success alert before redirecting
            showSuccessAlertMessage('OTP sent successfully to your registered email!');

            // Redirect to OTP verification page after alert
            // setTimeout(() => {
            setStep(2);
            // }, 1000);
          },
          onError: (error) => {
            const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.';
            setErrors({ form: errorMessage });
            setTimeout(() => setErrors({}), 3000);
          }
        }
      );
    } else {
      setErrors(newErrors);
    }
  };

const handleOtpVerified = async ({ otp, user_id }) => {
  if (!otp) {
    const error = new Error("Please enter OTP");
    setErrors({ otp: error.message });
    throw error;
  }

  try {
    const response = await verifyOtp({
      user_id,
      otp,
    });

    if (response?.data?.status_code === 200 || response?.data?.status === "success") {
      showSuccessAlertMessage("OTP verified successfully!");

      // setTimeout(() => {
        setStep(3);
      // }, 1500);
    } else {
      throw new Error(response?.data?.message || "Invalid OTP");
    }

  } catch (error) {
    setErrors({
      otp:
        error?.response?.data?.message ||
        error.message ||
        "OTP verification failed",
    });
    throw error;
  }
};

  const handleBackToRequest = () => {
    setStep(1);
    setVerificationData(null);
    setEncryptedOtp(null);
    setResetData(null);
  };

  const handleResetComplete = () => {
    // Show success alert before redirecting
    // showSuccessAlertMessage('Password reset successfully! Redirecting to login...');

    // Redirect to login after alert
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  const clearOtpError = () => {
    setErrors(prev => ({ ...prev, otp: '' }));
  };

  const apiError = sendOtpError?.response?.data?.message || errors.form;

  return (
    <div className="forget-enhanced">
      <div className="forget-enhanced-container">

        {/* Success Alert Toast */}
        {showSuccessAlert && (
          <div className="success-alert-toast">
            <CheckCircle size={20} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Step 1 - Request Form */}
        {step === 1 && (
          <div className="enhanced-card">
            {/* Rest of your JSX remains the same */}
            <div className="enhanced-info-side">
              <div className="info-content">
                <div className="info-badge">
                  <Shield size={20} />
                  <span>Secure Recovery</span>
                </div>
                <h3>Verify your identity</h3>

                <div className="info-steps">
                  <div className="info-step-item">
                    <div className="step-number">1</div>
                    <div>
                      <strong>Enter credentials</strong>
                      <span>Provide your Scholar ID and registered email</span>
                    </div>
                  </div>
                  <div className="info-step-item">
                    <div className="step-number">2</div>
                    <div>
                      <strong>Verify with OTP</strong>
                      <span>Enter the 6-digit code sent to your email</span>
                    </div>
                  </div>
                  <div className="info-step-item">
                    <div className="step-number">3</div>
                    <div>
                      <strong>Create new password</strong>
                      <span>Set a strong, unique password for your account</span>
                    </div>
                  </div>
                </div>

                <div className="info-tip">
                  <Shield size={18} />
                  <span>This process is encrypted and secure. Your data is protected.</span>
                </div>
              </div>
            </div>

            <div className="enhanced-form-side">
              <div className="enhanced-form-header">
                <div className="step-indicator">
                  <span className="step active">01</span>
                  <span className="step-line"></span>
                  <span className="step">02</span>
                  <span className="step-line"></span>
                  <span className="step">03</span>
                </div>
                <h2>Reset your password</h2>
                <p>Enter your Scholar ID and registered email to receive a verification code</p>
              </div>

              <form onSubmit={handleSubmit} className="enhanced-form">
                <div className="input-enhanced-group">
                  <label>Scholar ID <span className='mandatory'>*</span></label>
                  <div className="input-enhanced-wrapper">
                    <User size={18} />
                    <input
                      type="text"
                      name="scholarId"
                      value={formData.scholarId}
                      onChange={handleChange}
                      placeholder="Enter your scholar ID"
                      className={errors.scholarId ? 'error' : ''}
                      autoFocus
                    />
                  </div>
                  {errors.scholarId && <span className="err-msg">{errors.scholarId}</span>}
                </div>

                <div className="input-enhanced-group">
                  <label>Email Address <span className='mandatory'>*</span></label>
                  <div className="input-enhanced-wrapper">
                    <Mail size={18} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your registered email"
                      className={errors.email ? 'error' : ''}
                    />
                  </div>
                  {errors.email && <span className="err-msg">{errors.email}</span>}
                </div>

                {apiError && (
                  <div className="api-error-message">
                    <AlertCircle size={16} />
                    <span>{apiError}</span>
                  </div>
                )}

                <button type="submit" className="enhanced-submit-btn" disabled={isSendingOtp}>
                  {isSendingOtp ? (
                    <>
                      <div className="btn-spinner"></div>
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <Send size={18} />
                    </>
                  )}
                </button>

                <div className="enhanced-form-footer">
                  <Link to={"/"} className="back-to-login">← Back to Login</Link>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Step 2 - OTP Verification */}
        {step === 2 && verificationData && (
          <div className="enhanced-card otp-card-step">
            <OtpVerification
              email={verificationData.email}
              scholarId={verificationData.scholarId}
              userId={userData?.userId}
              onVerified={handleOtpVerified}
              onBack={handleBackToRequest}
              isVerifying={false}
              verifyError={errors.otp}
              onClearError={clearOtpError}  //  Add this prop

            />
          </div>
        )}

        {/* Step 3 - Reset Password */}
        {step === 3 && (
          <div className="enhanced-card reset-card-step">
            <ResetPassword
              userId={userData?.userId}
              onComplete={handleResetComplete}
              onBack={handleBackToRequest}
              isResetting={isResettingPassword}
              resetError={resetError?.response?.data?.message}
              resetPasswordMutation={resetPasswordMutation}
              showSuccessAlertMessage={showSuccessAlertMessage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgetPassword;