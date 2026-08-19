import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import GoogleAccountModal from './GoogleAccountModal';

export const AuthModal = () => {
  const { isAuthModalOpen, authModalTab, closeAuthModal, setAuthModalTab, login, register } = useAuth();
  const { showSuccess, showError } = useToast();
  const { t } = useLanguage();

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    plan: '12 Month VIP Membership',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await login(loginForm);
      showSuccess(`Welcome back, ${res.user?.name || res.user?.username}!`);
      closeAuthModal();
    } catch (err) {
      setErrorMsg(err.message || 'Invalid username or password. Please try again.');
      showError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await register(registerForm);
      showSuccess(`Welcome to GymLife, ${res.user?.name || res.user?.username}! Membership active.`);
      closeAuthModal();
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please check your information.');
      showError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-modal-overlay" onClick={closeAuthModal}>
        <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="auth-close-btn" onClick={closeAuthModal} aria-label="Close modal">
            <i className="fa fa-times"></i>
          </button>

          {/* Modal Header */}
          <div className="auth-modal-header">
            <div className="auth-brand-badge">
              <span className="badge-dot"></span> SECURE MEMBER ACCESS
            </div>
            <h2>{authModalTab === 'login' ? 'Sign In to GymLife' : 'Create Free Account'}</h2>
            <p className="auth-subtitle">
              {authModalTab === 'login' 
                ? 'Access your workouts, trainer schedules, and membership dashboard' 
                : 'Join GymLife today & claim your complimentary fitness consultation'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="auth-tab-pill-container">
            <button
              type="button"
              className={`auth-tab-btn ${authModalTab === 'login' ? 'active' : ''}`}
              onClick={() => { setAuthModalTab('login'); setErrorMsg(''); }}
            >
              <i className="fa fa-sign-in"></i> Sign In
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${authModalTab === 'register' ? 'active' : ''}`}
              onClick={() => { setAuthModalTab('register'); setErrorMsg(''); }}
            >
              <i className="fa fa-user-plus"></i> Create Account
            </button>
          </div>

          {/* Clean Google Authentication Button */}
          <button 
            type="button" 
            className="btn-google-auth" 
            onClick={() => setShowGoogleModal(true)}
            disabled={loading}
          >
            <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="auth-divider">
            <span>or enter credentials</span>
          </div>

          {errorMsg && (
            <div className="auth-error-banner">
              <i className="fa fa-exclamation-circle"></i> {errorMsg}
            </div>
          )}

          {/* Login Form */}
          {authModalTab === 'login' ? (
            <form className="auth-form" onSubmit={handleLoginSubmit}>
              <div className="auth-field-group">
                <label>Username or Email Address</label>
                <div className="auth-input-wrap">
                  <i className="fa fa-user input-icon"></i>
                  <input
                    type="text"
                    placeholder="e.g. your_username or email"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <div className="field-label-row">
                  <label>Password</label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please use Google sign-in or enter your registered account credentials.'); }} className="forgot-link">
                    Forgot Password?
                  </a>
                </div>
                <div className="auth-input-wrap">
                  <i className="fa fa-lock input-icon"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <i className="fa fa-spinner fa-spin"></i> Signing In...
                  </>
                ) : (
                  <>
                    <span>Sign In to GymLife</span>
                    <i className="fa fa-arrow-right"></i>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form className="auth-form" onSubmit={handleRegisterSubmit}>
              <div className="auth-form-row">
                <div className="auth-field-group">
                  <label>Full Name</label>
                  <div className="auth-input-wrap">
                    <i className="fa fa-id-card input-icon"></i>
                    <input
                      type="text"
                      placeholder="e.g. Jordan Lee"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="auth-field-group">
                  <label>Username</label>
                  <div className="auth-input-wrap">
                    <i className="fa fa-at input-icon"></i>
                    <input
                      type="text"
                      placeholder="Choose username"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="auth-field-group">
                <label>Email Address</label>
                <div className="auth-input-wrap">
                  <i className="fa fa-envelope input-icon"></i>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <label>Password</label>
                <div className="auth-input-wrap">
                  <i className="fa fa-lock input-icon"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create strong password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    required
                    minLength={4}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="auth-field-group">
                <label>Select Membership Plan</label>
                <div className="auth-input-wrap select-wrap">
                  <i className="fa fa-trophy input-icon"></i>
                  <select
                    value={registerForm.plan}
                    onChange={(e) => setRegisterForm({ ...registerForm, plan: e.target.value })}
                  >
                    <option value="12 Month VIP Membership">12 Month VIP Membership (₹14,999 / Year Unlimited)</option>
                    <option value="6 Month Active Membership">6 Month Active Membership (₹8,999 / 6 Months)</option>
                    <option value="Class Drop-in Pass">Class Drop-in Pass (₹499 / Single Session)</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <i className="fa fa-spinner fa-spin"></i> Creating Account...
                  </>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <i className="fa fa-arrow-right"></i>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="auth-modal-footer">
            <span><i className="fa fa-shield" style={{ color: '#f36100', marginRight: '5px' }}></i> Secured by 256-Bit SSL Encryption • Instant Cloud Access</span>
          </div>
        </div>
      </div>

      {/* Interactive Google Account Picker Modal */}
      <GoogleAccountModal 
        isOpen={showGoogleModal} 
        onClose={() => setShowGoogleModal(false)} 
      />
    </>
  );
};

export default AuthModal;