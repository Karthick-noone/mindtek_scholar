import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, GraduationCap, Eye, EyeOff, LogIn } from 'lucide-react';
import './Login.css';
import logo from './../../assets/img/logo.png';
import { loginUser } from './../../services/authService';
import { secureStorage } from "../../utils/secureStorage";

const Login = ({ onLogin }) => {
  const [scholarId, setScholarId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

   const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginUser({
        user_id: scholarId,
        pwd: password,
      });

      const { token, user, scholar,  company_details, last_work_details } = res.data;

      secureStorage.setToken(token);
      secureStorage.setUser(user);
      secureStorage.setScholar(scholar);
      secureStorage.setCompany(company_details);
      secureStorage.setWork(last_work_details);

      
      navigate("/dashboard");

    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
          
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
          <div className="logo-circle">
            <GraduationCap size={30} /> 
          </div>
          <img src={logo} alt="Logo" className="login-logo-image" />
          </div>

          <h1>Welcome Back</h1>
          <p>Sign in to continue to your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Scholar ID</label>
            <div className="input-field">
              <User size={18} className="field-icon" />
              <input
                type="text"
                value={scholarId}
                onChange={(e) => setScholarId(e.target.value)}
                placeholder="Enter your scholar ID"
                required
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-field">
              <Lock size={18} className="field-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              <div className="spinner"></div>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>

          <div className="demo-info">
            <p>Demo: user / user123</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;