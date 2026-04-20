import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft, Shield, KeyRound, AlertCircle } from 'lucide-react';
import './ForgetPassword.css';

const ResetPassword = ({
  userId,
  onComplete,
  onBack,
  isResetting,
  resetError,
  resetPasswordMutation,
  showSuccessAlertMessage
}) => {
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ new: false, confirm: false });
  const [errors, setErrors] = useState({});
  const [localError, setLocalError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0, hasMinLength: false, hasUpperCase: false,
    hasLowerCase: false, hasNumber: false, hasSpecialChar: false
  });

  const getStrengthColor = () => {
    const colors = ['#e2e8f0', '#ef4444', '#f59e0b', '#eab308', '#10b981', '#059669'];
    return colors[passwordStrength.score];
  };

  const getStrengthText = () => {
    const texts = ['Enter a password', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return texts[passwordStrength.score];
  };

  const checkPasswordStrength = (password) => {
    const strength = {
      score: 0,
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    };
    let score = 0;
    if (strength.hasMinLength) score++;
    if (strength.hasUpperCase) score++;
    if (strength.hasLowerCase) score++;
    if (strength.hasNumber) score++;
    if (strength.hasSpecialChar) score++;
    setPasswordStrength({ ...strength, score });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'newPassword') {
      checkPasswordStrength(value);
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (localError) setLocalError('');
  };

  const togglePassword = (field) => setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));

  const validateForm = () => {
    const newErrors = {};
    if (!formData.newPassword) newErrors.newPassword = 'New password is required';
    else if (formData.newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
    else if (passwordStrength.score < 3) newErrors.newPassword = 'Please choose a stronger password';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      resetPasswordMutation(
        {
          user_id: userId,
          new_pwd: formData.newPassword,
          confirm_pwd: formData.confirmPassword,

        },
        {
          onSuccess: () => {
            //  Show success alert before completing
            if (showSuccessAlertMessage) {
              showSuccessAlertMessage('Password reset successfully!');
            }
            // setTimeout(() => {
              onComplete();
            // }, 1500);
          },
          onError: (error) => {
            const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';
            setLocalError(errorMessage);
          }
        }
      );
    } else {
      setErrors(newErrors);
    }
  };

  const displayError = localError || resetError;

  return (
    <>
      <div className="enhanced-info-side reset-info">
        <div className="info-content">
          <div className="info-badge"><Shield size={20} /><span>Password Tips</span></div>
          <h3>Create a strong password</h3>
          <p>A strong password helps keep your account secure and protected from unauthorized access.</p>
          <div className="info-tip-list">
            <div className="tip-item"><CheckCircle size={16} /><span>Use at least 8 characters</span></div>
            <div className="tip-item"><CheckCircle size={16} /><span>Mix uppercase & lowercase letters</span></div>
            <div className="tip-item"><CheckCircle size={16} /><span>Include numbers and special characters</span></div>
            <div className="tip-item"><CheckCircle size={16} /><span>Avoid common words or personal info</span></div>
          </div>
        </div>
      </div>

      <div className="enhanced-form-side reset-side">
        <div className="enhanced-form-header">
          <button className="back-btn-enhanced" onClick={onBack}>
            <ArrowLeft size={18} />
          </button>
          <div className="step-indicator">
            <span className="step completed">✓</span>
            <span className="step-line"></span>
            <span className="step completed">✓</span>
            <span className="step-line"></span>
            <span className="step active">03</span>
          </div>
          <h2>Create new password</h2>
          <p>Your new password must be different from previous ones</p>
        </div>

        <form onSubmit={handleSubmit} className="enhanced-form">
          <div className="input-enhanced-group">
            <label>New Password <span className='mandatory'>*</span></label>
            <div className="input-enhanced-wrapper">
              <Lock size={18} />
              <input type={showPasswords.new ? 'text' : 'password'} name="newPassword" value={formData.newPassword} onChange={handleChange} autoFocus placeholder="Enter new password" className={errors.newPassword ? 'error' : ''} />
              <button type="button" className="toggle-password" onClick={() => togglePassword('new')}>
                {showPasswords.new ? <Eye size={18} className='eye-icons' /> : <EyeOff size={18} className='eye-icons' />}
              </button>
            </div>
            {errors.newPassword && <span className="err-msg">{errors.newPassword}</span>}
          </div>

          {formData.newPassword && (
            <div className="strength-enhanced">
              <div className="strength-bar"><div className="strength-fill" style={{ width: `${(passwordStrength.score / 5) * 100}%`, backgroundColor: getStrengthColor() }} /></div>
              <div className="strength-text" style={{ color: getStrengthColor() }}>{getStrengthText()}</div>
              <div className="requirements-enhanced">
                <div className={`req ${passwordStrength.hasMinLength ? 'met' : ''}`}><span>{passwordStrength.hasMinLength ? '✓' : '○'}</span>8+ characters</div>
                <div className={`req ${passwordStrength.hasUpperCase ? 'met' : ''}`}><span>{passwordStrength.hasUpperCase ? '✓' : '○'}</span>Uppercase</div>
                <div className={`req ${passwordStrength.hasLowerCase ? 'met' : ''}`}><span>{passwordStrength.hasLowerCase ? '✓' : '○'}</span>Lowercase</div>
                <div className={`req ${passwordStrength.hasNumber ? 'met' : ''}`}><span>{passwordStrength.hasNumber ? '✓' : '○'}</span>Number</div>
                <div className={`req ${passwordStrength.hasSpecialChar ? 'met' : ''}`}><span>{passwordStrength.hasSpecialChar ? '✓' : '○'}</span>Special char</div>
              </div>
            </div>
          )}

          <div className="input-enhanced-group">
            <label>Confirm New Password <span className='mandatory'>*</span></label>
            <div className="input-enhanced-wrapper">
              <Lock size={18} />
              <input type={showPasswords.confirm ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm new password" className={errors.confirmPassword ? 'error' : ''} />
              <button type="button" className="toggle-password" onClick={() => togglePassword('confirm')}>
                {showPasswords.confirm ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="err-msg">{errors.confirmPassword}</span>}
            {formData.confirmPassword && formData.newPassword === formData.confirmPassword && formData.newPassword && (
              <div className="match-success"><CheckCircle size={14} /> Passwords match!</div>
            )}
          </div>

          {displayError && (
            <div className="api-error-message">
              <AlertCircle size={16} />
              <span>{displayError}</span>
            </div>
          )}

          <button type="submit" className="enhanced-submit-btn" disabled={isResetting}>
            {isResetting ? (<><div className="btn-spinner"></div><span>Resetting Password...</span></>) : (<><KeyRound size={18} /><span>Reset Password</span></>)}
          </button>
        </form>
      </div>
    </>
  );
};

export default ResetPassword;