import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import './ChangePassword.css';

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [message, setMessage] = useState(null);
    const [errors, setErrors] = useState({});
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        hasMinLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false
    });

    const getStrengthColor = () => {
        switch (passwordStrength.score) {
            case 0: return '#e2e8f0';
            case 1: return '#f56565';
            case 2: return '#ed8936';
            case 3: return '#ecc94b';
            case 4: return '#48bb78';
            case 5: return '#38a169';
            default: return '#e2e8f0';
        }
    };

    const getStrengthText = () => {
        switch (passwordStrength.score) {
            case 0: return 'Not entered';
            case 1: return 'Very Weak';
            case 2: return 'Weak';
            case 3: return 'Fair';
            case 4: return 'Good';
            case 5: return 'Strong';
            default: return '';
        }
    };

    const getStrengthWidth = () => {
        return `${(passwordStrength.score / 5) * 100}%`;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        if (name === 'newPassword') {
            checkPasswordStrength(value);
        }
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

        // Calculate score
        let score = 0;
        if (strength.hasMinLength) score += 1;
        if (strength.hasUpperCase) score += 1;
        if (strength.hasLowerCase) score += 1;
        if (strength.hasNumber) score += 1;
        if (strength.hasSpecialChar) score += 1;

        strength.score = score;
        setPasswordStrength(strength);
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords({
            ...showPasswords,
            [field]: !showPasswords[field]
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.currentPassword) {
            newErrors.currentPassword = 'Current password is required';
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = validateForm();

        if (Object.keys(newErrors).length === 0) {
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setTimeout(() => setMessage(null), 3000);
        } else {
            setErrors(newErrors);
        }
    };

    return (
        <div className="change-password-page">
            <div className="page-header">
                <h1>Change Password</h1>
                <p>Update your password to keep your account secure</p>
            </div>

            <div className="password-container">
                <div className="password-card">
                    <div className="password-icon">
                        <Lock size={32} />
                    </div>

                    <form onSubmit={handleSubmit} className="profile-password-form">
                        <div className="password-form-group">
                            <label className="password-form-label">Current Password</label>
                            <div className="password-input-container">
                                <input
                                    type={showPasswords.current ? 'text' : 'password'}
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    placeholder="Enter current password"
                                    className="password-form-input"
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => togglePasswordVisibility('current')}
                                >
                                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.currentPassword && <span className="password-error-text">{errors.currentPassword}</span>}
                        </div>

                        <div className="password-form-group">
                            <label className="password-form-label">New Password</label>
                            <div className="password-input-container">
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="Enter new password"
                                    className="password-form-input"
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => togglePasswordVisibility('new')}
                                >
                                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.newPassword && <span className="password-error-text">{errors.newPassword}</span>}

                            {formData.newPassword && (
                                <div className="password-strength">
                                    <div className="strength-bar">
                                        <div
                                            className="strength-fill"
                                            style={{
                                                width: getStrengthWidth(),
                                                backgroundColor: getStrengthColor()
                                            }}
                                        ></div>
                                    </div>
                                    <span className="strength-text" style={{ color: getStrengthColor() }}>
                                        {getStrengthText()}
                                    </span>

                                    <div className="strength-requirements">
                                        <div className={`requirement ${passwordStrength.hasMinLength ? 'met' : ''}`}>
                                            <span className="requirement-icon">
                                                {passwordStrength.hasMinLength ? '✓' : '○'}
                                            </span>
                                            <span>At least 8 characters</span>
                                        </div>
                                        <div className={`requirement ${passwordStrength.hasUpperCase ? 'met' : ''}`}>
                                            <span className="requirement-icon">
                                                {passwordStrength.hasUpperCase ? '✓' : '○'}
                                            </span>
                                            <span>Uppercase letter</span>
                                        </div>
                                        <div className={`requirement ${passwordStrength.hasLowerCase ? 'met' : ''}`}>
                                            <span className="requirement-icon">
                                                {passwordStrength.hasLowerCase ? '✓' : '○'}
                                            </span>
                                            <span>Lowercase letter</span>
                                        </div>
                                        <div className={`requirement ${passwordStrength.hasNumber ? 'met' : ''}`}>
                                            <span className="requirement-icon">
                                                {passwordStrength.hasNumber ? '✓' : '○'}
                                            </span>
                                            <span>Number</span>
                                        </div>
                                        <div className={`requirement ${passwordStrength.hasSpecialChar ? 'met' : ''}`}>
                                            <span className="requirement-icon">
                                                {passwordStrength.hasSpecialChar ? '✓' : '○'}
                                            </span>
                                            <span>Special character</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="password-form-group">
                            <label className="password-form-label">Confirm New Password</label>
                            <div className="password-input-container">
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm new password"
                                    className="password-form-input"
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => togglePasswordVisibility('confirm')}
                                >
                                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.confirmPassword && <span className="password-error-text">{errors.confirmPassword}</span>}
                        </div>

                        <button type="submit" className="password-submit-btn">
                            Update Password
                        </button>

                        {message && (
                            <div className={`password-message password-message-${message.type}`}>
                                <CheckCircle size={18} />
                                <span>{message.text}</span>
                            </div>
                        )}
                    </form>
                    {/* 
                    <div className="password-tips">
                        <h4>Password Tips:</h4>
                        <ul>
                            <li>Use at least 8 characters</li>
                            <li>Include numbers and special characters</li>
                            <li>Avoid common passwords</li>
                            <li>Don't reuse old passwords</li>
                        </ul>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;