import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const DEFAULT_GOOGLE_ACCOUNTS = [
  {
    id: 'google-acct-1',
    name: 'Jordan Lee',
    email: 'jordan.lee.fitness@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    plan: '12 Month VIP Membership'
  },
  {
    id: 'google-acct-2',
    name: 'Alex Rivers',
    email: 'alex.rivers@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    plan: '6 Month Active Membership'
  },
  {
    id: 'google-acct-3',
    name: 'Priya Sharma',
    email: 'priya.sharma2026@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    plan: '12 Month VIP Membership'
  }
];

const GoogleAccountModal = ({ isOpen, onClose }) => {
  const { loginWithGoogle } = useAuth();
  const { showSuccess, showError } = useToast();

  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSelectAccount = async (acct) => {
    setLoading(true);
    try {
      const res = await loginWithGoogle(acct);
      showSuccess(`Signed in with Google as ${res.user?.name || acct.name}! 🚀`);
      onClose();
    } catch (err) {
      showError(err.message || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) {
      showError('Please enter a valid Gmail address');
      return;
    }
    const name = customName.trim() || customEmail.split('@')[0];
    const newAcct = {
      id: `google-${Date.now()}`,
      name: name,
      email: customEmail.trim(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      plan: '12 Month VIP Membership'
    };
    handleSelectAccount(newAcct);
  };

  return (
    <div className="google-modal-overlay" onClick={onClose}>
      <div className="google-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Google Header */}
        <div className="google-modal-top">
          <svg className="google-large-logo" viewBox="0 0 24 24" width="36" height="36">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <h3 className="google-modal-title">Sign in with Google</h3>
          <p className="google-modal-sub">Choose an account to continue to <strong>GymLife</strong></p>
        </div>

        {/* Account Selector List */}
        {!customMode ? (
          <div className="google-account-list">
            {DEFAULT_GOOGLE_ACCOUNTS.map((acct) => (
              <button
                key={acct.id}
                type="button"
                className="google-account-item"
                onClick={() => handleSelectAccount(acct)}
                disabled={loading}
              >
                <img src={acct.avatar} alt={acct.name} className="google-acct-avatar" />
                <div className="google-acct-info">
                  <div className="google-acct-name">{acct.name}</div>
                  <div className="google-acct-email">{acct.email}</div>
                </div>
                <i className="fa fa-chevron-right text-muted"></i>
              </button>
            ))}

            {/* Use Another Account Button */}
            <button
              type="button"
              className="google-account-item use-another"
              onClick={() => setCustomMode(true)}
              disabled={loading}
            >
              <div className="google-acct-avatar-icon">
                <i className="fa fa-user-plus"></i>
              </div>
              <div className="google-acct-info">
                <div className="google-acct-name">Use another account</div>
                <div className="google-acct-email">Sign in with any other Gmail address</div>
              </div>
            </button>
          </div>
        ) : (
          /* Custom Gmail Input Form */
          <form className="google-custom-form" onSubmit={handleCustomSubmit}>
            <div className="google-input-field">
              <label>Your Full Name</label>
              <input
                type="text"
                placeholder="e.g. Rahul Verma"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="google-input-field">
              <label>Gmail Address</label>
              <input
                type="email"
                placeholder="yourname@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                required
              />
            </div>

            <div className="google-form-actions">
              <button
                type="button"
                className="google-btn-back"
                onClick={() => setCustomMode(false)}
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                className="google-btn-next"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="google-modal-footer">
          <p>
            To continue, Google will share your name, email address, and profile picture with GymLife. 
            See GymLife's <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a> and <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a>.
          </p>
          <button type="button" className="google-cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleAccountModal;
