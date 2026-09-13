import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  triggerGoogleOAuthPopup, 
  getGoogleClientId, 
  saveGoogleClientId 
} from '../utils/googleAuth';

// Helper to get accounts saved specifically on THIS browser/device
const getDeviceSavedAccounts = () => {
  try {
    const saved = localStorage.getItem('gymlife_device_google_accounts');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveDeviceAccount = (account) => {
  try {
    const existing = getDeviceSavedAccounts();
    const filtered = existing.filter(a => a.email.toLowerCase() !== account.email.toLowerCase());
    const updated = [account, ...filtered].slice(0, 5); // Keep up to 5 recent accounts
    localStorage.setItem('gymlife_device_google_accounts', JSON.stringify(updated));
    return updated;
  } catch {
    return [account];
  }
};

const removeDeviceAccount = (emailToRemove) => {
  try {
    const existing = getDeviceSavedAccounts();
    const updated = existing.filter(a => a.email.toLowerCase() !== emailToRemove.toLowerCase());
    localStorage.setItem('gymlife_device_google_accounts', JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

const GoogleAccountModal = ({ isOpen, onClose }) => {
  const { loginWithGoogle } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [deviceAccounts, setDeviceAccounts] = useState([]);
  const [activeAccountEmail, setActiveAccountEmail] = useState(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(getGoogleClientId());

  // Refresh saved accounts whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const saved = getDeviceSavedAccounts();
      setDeviceAccounts(saved);
      // If no saved accounts on this device, default directly to input form
      if (saved.length === 0) {
        setShowCustomInput(true);
      } else {
        setShowCustomInput(false);
      }
      setClientIdInput(getGoogleClientId());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Sign in with one of the accounts saved on this device
  const handleSelectAccount = async (account) => {
    setActiveAccountEmail(account.email);
    setLoading(true);
    try {
      const res = await loginWithGoogle(account);
      // Update account in local device storage
      saveDeviceAccount(account);
      showSuccess(`Welcome back, ${account.name}! 🚀`);
      onClose();
    } catch (err) {
      showError(err.message || 'Authentication with Google failed.');
    } finally {
      setLoading(false);
      setActiveAccountEmail(null);
    }
  };

  // 2. Sign in with user's Google credentials (dynamic for ANY user)
  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) {
      showError('Please enter a valid Gmail / Google Account email address.');
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
        id: `google-${Date.now()}`,
        name: derivedName,
        email: cleanEmail,
        avatarType: 'initial',
        initial: derivedName.charAt(0).toUpperCase(),
        initialBg: '#1a73e8',
        plan: '12 Month VIP Membership'
      };

      await loginWithGoogle(accountPayload);
      // Remember this user's account for this browser/device
      const updated = saveDeviceAccount(accountPayload);
      setDeviceAccounts(updated);

      showSuccess(`Signed in as ${derivedName} (${cleanEmail})! 🏋️`);
      onClose();
    } catch (err) {
      showError(err.message || 'Failed to sign in with Google account.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Launch live Google OAuth 2.0 popup via Google Identity Services
  const handleLiveGoogleOAuth = async () => {
    setLoading(true);
    try {
      const res = await triggerGoogleOAuthPopup();
      if (res && res.user) {
        const liveAccount = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          avatarUrl: res.user.avatar,
          avatarType: res.user.avatar ? 'photo' : 'initial',
          initial: res.user.name ? res.user.name.charAt(0).toUpperCase() : 'G',
          initialBg: '#1a73e8',
          plan: '12 Month VIP Membership'
        };
        await loginWithGoogle(liveAccount);
        saveDeviceAccount(liveAccount);
        showSuccess(`Welcome to GymLife, ${res.user.name}! 🚀`);
        onClose();
      }
    } catch (err) {
      if (err.message === 'GOOGLE_CLIENT_ID_REQUIRED') {
        setShowConfig(true);
        showInfo('Enter your Google Cloud Client ID to enable live Google popup, or sign in directly with your Gmail.');
      } else {
        showError(err.message || 'Google Sign-In was cancelled or failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 4. Save Google Client ID
  const handleSaveClientId = (e) => {
    e.preventDefault();
    if (!clientIdInput.trim()) {
      showError('Please enter a valid Google OAuth Client ID.');
      return;
    }
    saveGoogleClientId(clientIdInput.trim());
    showSuccess('Google Client ID saved! Launching Google popup...');
    setShowConfig(false);
    handleLiveGoogleOAuth();
  };

  // 5. Remove an account from this device
  const handleRemoveAccount = (e, email) => {
    e.stopPropagation();
    const updated = removeDeviceAccount(email);
    setDeviceAccounts(updated);
    if (updated.length === 0) {
      setShowCustomInput(true);
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
              {showCustomInput && deviceAccounts.length === 0 ? 'Sign in' : 'Choose an account'}
            </h1>
            
            <p className="google-chooser-subtext">
              to continue to <span className="google-app-name-highlight">GymLife</span>
            </p>

            {/* Quick Live Google OAuth Trigger */}
            <div className="google-live-oauth-trigger">
              <button
                type="button"
                className="google-live-popup-btn"
                onClick={handleLiveGoogleOAuth}
                disabled={loading}
              >
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Launch Official Google Popup</span>
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic User Accounts OR Sign-in Form */}
          <div className="google-chooser-right-col">
            {!showCustomInput && deviceAccounts.length > 0 ? (
              <div className="google-accounts-group">
                {deviceAccounts.map((acct) => {
                  const isThisLoading = loading && activeAccountEmail === acct.email;
                  return (
                    <button
                      key={acct.email}
                      type="button"
                      className={`google-account-row ${isThisLoading ? 'row-loading' : ''}`}
                      onClick={() => handleSelectAccount(acct)}
                      disabled={loading}
                    >
                      {/* Avatar */}
                      <div className="google-account-avatar-wrapper">
                        {acct.avatarUrl ? (
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
                            backgroundColor: acct.initialBg || '#1a73e8',
                            display: acct.avatarUrl ? 'none' : 'flex'
                          }}
                        >
                          {acct.name ? acct.name.charAt(0).toUpperCase() : 'G'}
                        </div>
                      </div>

                      {/* Account Details */}
                      <div className="google-account-text-wrap">
                        <span className="google-account-name">{acct.name}</span>
                        <span className="google-account-email">{acct.email}</span>
                      </div>

                      {/* Status / Spinner / Remove */}
                      <div className="google-account-status-wrap">
                        {isThisLoading ? (
                          <i className="fa fa-spinner fa-spin google-row-spinner"></i>
                        ) : (
                          <button
                            type="button"
                            className="google-account-remove-btn"
                            title="Remove account from this device"
                            onClick={(e) => handleRemoveAccount(e, acct.email)}
                            aria-label="Remove account"
                          >
                            ×
                          </button>
                        )}
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
              /* Custom User Google Account Sign-In Form */
              <form className="google-custom-login-view" onSubmit={handleCustomSubmit}>
                <div className="google-field-container">
                  <label className="google-field-label">Email or phone</label>
                  <input
                    type="email"
                    className="google-field-input"
                    placeholder="e.g. yourname@gmail.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="google-field-container">
                  <label className="google-field-label">Your Name (Optional)</label>
                  <input
                    type="text"
                    className="google-field-input"
                    placeholder="Enter your name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                  />
                  <small className="google-input-hint">Enter your Google account details to sign in instantly.</small>
                </div>

                <div className="google-custom-btn-row">
                  {deviceAccounts.length > 0 ? (
                    <button
                      type="button"
                      className="google-text-btn"
                      onClick={() => setShowCustomInput(false)}
                      disabled={loading}
                    >
                      Back to accounts
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="google-text-btn"
                      onClick={() => setShowConfig(!showConfig)}
                    >
                      <i className="fa fa-cog mr-1"></i> OAuth Settings
                    </button>
                  )}

                  <button
                    type="submit"
                    className="google-primary-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fa fa-spinner fa-spin mr-2"></i> Signing in...
                      </>
                    ) : (
                      'Next'
                    )}
                  </button>
                </div>

                {/* Google OAuth Client ID Configuration */}
                {showConfig && (
                  <div className="google-oauth-config-drawer">
                    <label className="config-drawer-label">Google Cloud OAuth 2.0 Client ID</label>
                    <div className="config-drawer-input-row">
                      <input
                        type="text"
                        className="config-drawer-input"
                        placeholder="xxxx.apps.googleusercontent.com"
                        value={clientIdInput}
                        onChange={(e) => setClientIdInput(e.target.value)}
                      />
                      <button 
                        type="button" 
                        className="config-drawer-save-btn"
                        onClick={handleSaveClientId}
                      >
                        Save & Launch
                      </button>
                    </div>
                    <p className="config-drawer-note">
                      From Google Cloud Console ➔ APIs & Services ➔ Credentials. When set, "Launch Official Google Popup" opens Google's live account chooser directly on accounts.google.com.
                    </p>
                  </div>
                )}
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
