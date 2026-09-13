import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Authentic Google accounts matching user's account chooser screenshot
const GOOGLE_ACCOUNTS = [
  {
    id: 'aniket-3982',
    name: 'Aniket Shinde',
    email: 'aniketshinde3982@gmail.com',
    avatarType: 'photo',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    status: 'Signed out',
    plan: '12 Month VIP Membership'
  },
  {
    id: 'aniket-7744',
    name: 'Aniket Shinde',
    email: 'shindeaniket7744@gmail.com',
    avatarType: 'initial',
    initial: 'A',
    initialBg: '#5d4037', // Authentic Google Brown
    status: '',
    plan: '12 Month VIP Membership'
  },
  {
    id: 'aniket-2072003',
    name: 'Aniket Shinde',
    email: 'shindeaniket2072003@gmail.com',
    avatarType: 'photo',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    status: '',
    plan: '12 Month VIP Membership'
  },
  {
    id: 'goat-ronaldo',
    name: 'GOAT Ronaldo',
    email: 'goatronaldousa@gmail.com',
    avatarType: 'initial',
    initial: 'G',
    initialBg: '#00796b', // Authentic Google Teal
    status: 'Signed out',
    plan: '12 Month VIP Membership'
  }
];

const GoogleAccountModal = ({ isOpen, onClose }) => {
  const { loginWithGoogle } = useAuth();
  const { showSuccess, showError } = useToast();

  const [activeAccountEmail, setActiveAccountEmail] = useState(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Handle clicking on any pre-configured Google account
  const handleSelectAccount = async (account) => {
    setActiveAccountEmail(account.email);
    setLoading(true);
    try {
      const res = await loginWithGoogle(account);
      showSuccess(`Welcome to GymLife, ${account.name}! 🚀`);
      onClose();
    } catch (err) {
      showError(err.message || 'Authentication with Google failed.');
    } finally {
      setLoading(false);
      setActiveAccountEmail(null);
    }
  };

  // Handle custom "Use another account" sign in
  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) {
      showError('Please enter a valid Gmail / Google Account email.');
      return;
    }

    const cleanEmail = customEmail.trim().toLowerCase();
    const derivedName = customName.trim() || cleanEmail.split('@')[0]
      .split(/[\._\-]/)
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ');

    setLoading(true);
    try {
      const accountPayload = {
        id: `custom-google-${Date.now()}`,
        name: derivedName,
        email: cleanEmail,
        avatarType: 'initial',
        initial: derivedName.charAt(0).toUpperCase(),
        initialBg: '#1a73e8',
        plan: '12 Month VIP Membership'
      };

      await loginWithGoogle(accountPayload);
      showSuccess(`Signed in as ${derivedName} (${cleanEmail})! 🏋️`);
      onClose();
    } catch (err) {
      showError(err.message || 'Failed to sign in with Google account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="google-chooser-overlay" onClick={onClose}>
      <div 
        className="google-chooser-card" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Google Account Chooser"
      >
        {/* Top Header: Google Logo + Sign in with Google + Close button */}
        <div className="google-chooser-top-bar">
          <div className="google-chooser-brand">
            <svg className="google-g-logo" viewBox="0 0 24 24" width="22" height="22">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span className="google-top-title">Sign in with Google</span>
          </div>

          <button 
            type="button" 
            className="google-chooser-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Main Content Layout: 2 Columns */}
        <div className="google-chooser-body">
          {/* Left Column: App Branding & Heading */}
          <div className="google-chooser-left-col">
            <div className="google-app-badge-box">
              <div className="google-app-badge-icon">
                <span className="app-badge-bolt">⚡</span>
                <span className="app-badge-text">GYM</span>
              </div>
            </div>

            <h1 className="google-chooser-headline">
              {showCustomInput ? 'Sign in' : 'Choose an account'}
            </h1>
            
            <p className="google-chooser-subtext">
              to continue to <span className="google-app-name-highlight">GymLife</span>
            </p>
          </div>

          {/* Right Column: Account List OR Custom Input */}
          <div className="google-chooser-right-col">
            {!showCustomInput ? (
              <div className="google-accounts-group">
                {GOOGLE_ACCOUNTS.map((acct) => {
                  const isThisLoading = loading && activeAccountEmail === acct.email;
                  return (
                    <button
                      key={acct.id}
                      type="button"
                      className={`google-account-row ${isThisLoading ? 'row-loading' : ''}`}
                      onClick={() => handleSelectAccount(acct)}
                      disabled={loading}
                    >
                      {/* Avatar */}
                      <div className="google-account-avatar-wrapper">
                        {acct.avatarType === 'photo' ? (
                          <img 
                            src={acct.avatarUrl} 
                            alt={acct.name} 
                            className="google-account-avatar-img"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div 
                          className="google-account-avatar-initial" 
                          style={{ 
                            backgroundColor: acct.initialBg || '#5d4037',
                            display: acct.avatarType === 'photo' ? 'none' : 'flex'
                          }}
                        >
                          {acct.name.charAt(0).toUpperCase()}
                        </div>
                      </div>

                      {/* Account Details */}
                      <div className="google-account-text-wrap">
                        <span className="google-account-name">{acct.name}</span>
                        <span className="google-account-email">{acct.email}</span>
                      </div>

                      {/* Status badge (e.g. 'Signed out') or Loading spinner */}
                      <div className="google-account-status-wrap">
                        {isThisLoading ? (
                          <i className="fa fa-spinner fa-spin google-row-spinner"></i>
                        ) : acct.status ? (
                          <span className="google-account-status">{acct.status}</span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}

                {/* "Use another account" button */}
                <button
                  type="button"
                  className="google-account-row google-row-use-another"
                  onClick={() => setShowCustomInput(true)}
                  disabled={loading}
                >
                  <div className="google-account-avatar-wrapper">
                    <div className="google-avatar-outline-icon">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                      </svg>
                    </div>
                  </div>

                  <div className="google-account-text-wrap">
                    <span className="google-use-another-text">Use another account</span>
                  </div>
                </button>
              </div>
            ) : (
              /* Custom Account Input Form */
              <form className="google-custom-login-view" onSubmit={handleCustomSubmit}>
                <div className="google-field-container">
                  <label className="google-field-label">Full Name</label>
                  <input
                    type="text"
                    className="google-field-input"
                    placeholder="e.g. Aniket Shinde"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="google-field-container">
                  <label className="google-field-label">Email or phone</label>
                  <input
                    type="email"
                    className="google-field-input"
                    placeholder="yourname@gmail.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="google-custom-btn-row">
                  <button
                    type="button"
                    className="google-text-btn"
                    onClick={() => setShowCustomInput(false)}
                    disabled={loading}
                  >
                    Back to accounts
                  </button>

                  <button
                    type="submit"
                    className="google-primary-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fa fa-spinner fa-spin mr-2"></i> Signing In...
                      </>
                    ) : (
                      'Next'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer Notice */}
        <div className="google-chooser-footer">
          <p>
            Before using this app, you can review GymLife's{' '}
            <a href="#privacy" onClick={(e) => { e.preventDefault(); }}>Privacy Policy</a> and{' '}
            <a href="#terms" onClick={(e) => { e.preventDefault(); }}>Terms of Service</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleAccountModal;
