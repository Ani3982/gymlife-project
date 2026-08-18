import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import GoogleAccountModal from '../components/GoogleAccountModal';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  if (isAuthenticated) {
    navigate('/dashboard');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await login(form);
      showSuccess(`Welcome back, ${res.user?.name || res.user?.username}!`);
      if (res.user?.role === 'admin' || res.user?.is_staff) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid credentials');
      showError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role) => {
    setErrorMsg('');
    setLoading(true);
    try {
      if (role === 'member') {
        const res = await login({ username: 'demo_member', password: 'demo123' });
        showSuccess(`Welcome, ${res.user?.name}!`);
        navigate('/dashboard');
      } else {
        const res = await login({ username: 'admin', password: 'admin123' });
        showSuccess('Welcome Administrator!');
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-page-container">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-9">
              <div className="auth-card-wrapper">
                <div className="auth-card-header">
                  <div className="auth-brand-badge">
                    <span className="badge-dot"></span> SECURE MEMBER PORTAL
                  </div>
                  <h2>Sign In to GymLife</h2>
                  <p>Welcome back! Sign in to manage your workouts, schedule, and trainer sessions.</p>

                  {/* Clean Continue with Google */}
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

                  {/* 1-Click Fast Logins */}
                  <div className="quick-demo-section mt-3">
                    <div className="quick-demo-title">⚡ 1-Click Instant Demo Login</div>
                    <div className="quick-demo-buttons">
                      <button
                        type="button"
                        className="demo-pill-btn member"
                        onClick={() => handleDemo('member')}
                        disabled={loading}
                      >
                        <span className="demo-icon">🏋️</span>
                        <span className="demo-text">
                          <strong>Member Demo</strong>
                          <small>Alex Rivers</small>
                        </span>
                      </button>
                      <button
                        type="button"
                        className="demo-pill-btn admin"
                        onClick={() => handleDemo('admin')}
                        disabled={loading}
                      >
                        <span className="demo-icon">👑</span>
                        <span className="demo-text">
                          <strong>Admin Demo</strong>
                          <small>Staff Portal</small>
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="auth-divider">
                    <span>or enter credentials</span>
                  </div>
                </div>

                {errorMsg && (
                  <div className="auth-error-banner">
                    <i className="fa fa-exclamation-circle"></i> {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="auth-field-group">
                    <label>Username or Email</label>
                    <div className="auth-input-wrap">
                      <i className="fa fa-user input-icon"></i>
                      <input
                        type="text"
                        placeholder="Username or email"
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-field-group">
                    <div className="field-label-row">
                      <label>Password</label>
                      <a href="#reset" onClick={(e) => { e.preventDefault(); alert('Please use demo login or Google sign-in.'); }} className="forgot-link">
                        Forgot?
                      </a>
                    </div>
                    <div className="auth-input-wrap">
                      <i className="fa fa-lock input-icon"></i>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
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
                        <span>Sign In</span>
                        <i className="fa fa-arrow-right"></i>
                      </>
                    )}
                  </button>
                </form>

                <div className="auth-card-footer">
                  <p>
                    Don't have an account yet?{' '}
                    <Link to="/signup" className="highlight-link">
                      Sign Up / Join Now
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GoogleAccountModal 
        isOpen={showGoogleModal} 
        onClose={() => setShowGoogleModal(false)} 
      />
    </>
  );
};

export default Login;
