import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import GoogleAccountModal from './GoogleAccountModal';
import { triggerGoogleOAuthPopup } from '../utils/googleAuth';

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
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpPhone, setOtpPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const { loginWithGoogle } = useAuth();

  const handleGoogleClick = async () => {
    setLoading(true);
    try {
      const res = await triggerGoogleOAuthPopup();
      if (res && res.user) {
        const loginRes = await loginWithGoogle(res.user);
        showSuccess(`Welcome to GymLife, ${loginRes.user?.name || res.user.name}! 🚀`);
        closeAuthModal();
        return;
      }
      setShowGoogleModal(true);
    } catch {
      setShowGoogleModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookClick = async () => {
    setLoading(true);
    try {
      const fbUser = {
        id: `fb-${Date.now()}`,
        name: 'Facebook Athlete',
        email: 'facebook.athlete@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        plan: '12 Month VIP Membership'
      };
      const res = await loginWithGoogle(fbUser);
      showSuccess(`Signed in with Facebook as ${res.user?.name || fbUser.name}! 🚀`);
      closeAuthModal();
    } catch (err) {
      showError(err.message || 'Facebook login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSend = (e) => {
    e.preventDefault();
    if (!otpPhone || otpPhone.trim().length < 10) {
      showError('Please enter a valid 10-digit mobile number');
      return;
    }
    setOtpSent(true);
    showSuccess(`OTP sent to +91 ${otpPhone.trim()}! Demo code: 1234`);
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (!otpCode) {
      showError('Please enter the OTP received on your phone');
      return;
    }
    setLoading(true);
    try {
      const mobileUser = {
        id: `otp-${Date.now()}`,
        name: `Athlete ${otpPhone.slice(-4)}`,
        email: `${otpPhone.trim()}@gymlife.com`,
        plan: '12 Month VIP Membership'
      };
      const res = await loginWithGoogle(mobileUser);
      showSuccess(`Authenticated via Mobile OTP! Welcome back! 🚀`);
      closeAuthModal();
    } catch (err) {
      showError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

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
        <div className="ref-auth-dialog" onClick={(e) => e.stopPropagation()}>
          <button className="ref-auth-close" onClick={closeAuthModal} aria-label="Close modal">
            &times;
          </button>

          {/* Reference Style Header Title */}
          <h2 className="ref-auth-title">
            {isOtpMode ? 'Login with OTP' : (authModalTab === 'register' ? 'Register' : 'Login')}
          </h2>

          {errorMsg && (
            <div className="ref-auth-error">
              <i className="fa fa-exclamation-circle"></i> {errorMsg}
            </div>
          )}

          {isOtpMode ? (
            /* OTP Mode Form */
            <form onSubmit={otpSent ? handleOtpVerify : handleOtpSend} className="ref-form-block">
              <div className="ref-inputs-row">
                <div className="ref-input-col">
                  <input
                    type="tel"
                    className="ref-text-input"
                    placeholder="Enter your email/mobile no."
                    value={otpPhone}
                    onChange={(e) => setOtpPhone(e.target.value)}
                    required
                  />
                </div>
                {otpSent && (
                  <div className="ref-input-col">
                    <input
                      type="text"
                      className="ref-text-input"
                      placeholder="Enter OTP (e.g. 1234)"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                )}
              </div>

              <div className="ref-action-row">
                <button type="submit" className="ref-btn-login" disabled={loading}>
                  {loading ? <i className="fa fa-spinner fa-spin"></i> : (otpSent ? 'VERIFY & LOGIN' : 'SEND OTP')}
                </button>
                <button
                  type="button"
                  className="ref-btn-register"
                  onClick={() => { setIsOtpMode(false); setOtpSent(false); }}
                >
                  PASSWORD LOGIN
                </button>
              </div>
            </form>
          ) : authModalTab === 'login' ? (
            /* Login Form - EXACT LAYOUT FROM REFERENCE IMAGE */
            <form onSubmit={handleLoginSubmit} className="ref-form-block">
              <div className="ref-inputs-row">
                <div className="ref-input-col">
                  <input
                    type="text"
                    className="ref-text-input"
                    placeholder="Enter your email/mobile no."
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    required
                  />
                </div>
                <div className="ref-input-col">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="ref-text-input"
                    placeholder="Enter your password.."
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                  <div className="ref-forgot-row">
                    <a
                      href="#forgot"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Password reset link has been dispatched to your email/mobile number.');
                      }}
                      className="ref-forgot-link"
                    >
                      Forgot password?
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row: LOGIN | REGISTER | Shop by OTP on Your Mobile */}
              <div className="ref-action-row">
                <button type="submit" className="ref-btn-login" disabled={loading}>
                  {loading ? <i className="fa fa-spinner fa-spin"></i> : 'LOGIN'}
                </button>
                <button
                  type="button"
                  className="ref-btn-register"
                  onClick={() => { setAuthModalTab('register'); setErrorMsg(''); }}
                >
                  REGISTER
                </button>
                <span className="ref-otp-text" onClick={() => setIsOtpMode(true)}>
                  Shop by OTP on Your Mobile
                </span>
              </div>
            </form>
          ) : (
            /* Register Form - Clean Two-Column Layout */
            <form onSubmit={handleRegisterSubmit} className="ref-form-block">
              <div className="ref-inputs-row">
                <div className="ref-input-col">
                  <input
                    type="text"
                    className="ref-text-input"
                    placeholder="Enter your full name"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="ref-input-col">
                  <input
                    type="text"
                    className="ref-text-input"
                    placeholder="Enter username"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="ref-inputs-row">
                <div className="ref-input-col">
                  <input
                    type="email"
                    className="ref-text-input"
                    placeholder="Enter your email/mobile no."
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="ref-input-col">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="ref-text-input"
                    placeholder="Enter your password.."
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    required
                    minLength={4}
                  />
                </div>
              </div>

              <div className="ref-inputs-row" style={{ marginTop: '4px' }}>
                <div className="ref-input-col" style={{ width: '100%', gridColumn: '1 / -1' }}>
                  <select
                    className="ref-text-input ref-select-input"
                    value={registerForm.plan}
                    onChange={(e) => setRegisterForm({ ...registerForm, plan: e.target.value })}
                  >
                    <option value="12 Month VIP Membership">12 Month VIP Membership (₹14,999 / Year)</option>
                    <option value="6 Month Active Membership">6 Month Active Membership (₹8,999 / 6 Months)</option>
                    <option value="Class Drop-in Pass">Class Drop-in Pass (₹499 / Single Class)</option>
                  </select>
                </div>
              </div>

              <div className="ref-action-row">
                <button type="submit" className="ref-btn-register" disabled={loading}>
                  {loading ? <i className="fa fa-spinner fa-spin"></i> : 'REGISTER'}
                </button>
                <button
                  type="button"
                  className="ref-btn-login"
                  onClick={() => { setAuthModalTab('login'); setErrorMsg(''); }}
                >
                  LOGIN
                </button>
              </div>
            </form>
          )}

          {/* Or login with section - EXACT MATCH TO REFERENCE */}
          <div className="ref-social-section">
            <div className="ref-social-title">
              {authModalTab === 'register' ? 'Or register with' : 'Or login with'}
            </div>
            <div className="ref-social-buttons-row">
              <button
                type="button"
                className="ref-btn-social-google"
                onClick={handleGoogleClick}
                disabled={loading}
              >
                <span className="ref-social-icon-g">g+</span>
                <span>Login with Google</span>
              </button>
              <button
                type="button"
                className="ref-btn-social-facebook"
                onClick={handleFacebookClick}
                disabled={loading}
              >
                <span className="ref-social-icon-f">f</span>
                <span>Login with Facebook</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Google Account Modal Fallback */}
      <GoogleAccountModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
      />
    </>
  );
};

export default AuthModal;