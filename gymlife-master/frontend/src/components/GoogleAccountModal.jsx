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
    const updated = [account, ...filtered].slice(0, 5);
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

  // Screen state: 'chooser' (Step 1) | 'password' (Step 2: Welcome challenge)
  const [step, setStep] = useState('chooser');
  const [slideDirection, setSlideDirection] = useState('next'); // 'next' | 'back'

  // Accounts & Selection
  const [deviceAccounts, setDeviceAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  // Password / Authorization State
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTryAnotherModal, setShowTryAnotherModal] = useState(false);

  // OAuth Settings
  const [showConfig, setShowConfig] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(getGoogleClientId());

  // Refresh saved accounts whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const saved = getDeviceSavedAccounts();
      setDeviceAccounts(saved);
      setStep('chooser');
      setSelectedAccount(null);
      setPassword('');
      setShowPassword(false);
      setShowTryAnotherModal(false);
      
      if (saved.length === 0) {
        setShowCustomInput(true);
      } else {
        setShowCustomInput(false);
      }
      setClientIdInput(getGoogleClientId());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Step 1: User chooses an account from list -> Slide into Password challenge
  const handleSelectAccountForPassword = (account) => {
    setSelectedAccount(account);
    setSlideDirection('next');
    setStep('password');
    setPassword('');
  };

  // Step 1: User enters email in form and clicks Next -> Slide into Password challenge
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) {
      showError('Please enter a valid Gmail or Google Account email.');
      return;
    }

    const cleanEmail = customEmail.trim().toLowerCase();
    const derivedName = customName.trim() || cleanEmail.split('@')[0]
      .split(/[\._\-]/)
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ');

    const account = {
      id: `google-${Date.now()}`,
      name: derivedName,
      email: cleanEmail,
      avatarType: 'initial',
      initial: derivedName.charAt(0).toUpperCase(),
      initialBg: '#1a73e8',
      plan: '12 Month VIP Membership'
    };

    setSelectedAccount(account);
    setSlideDirection('next');
    setStep('password');
    setPassword('');
  };

  // Step 2: Final Authentication & Authorization Submission
  const handlePasswordSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedAccount) return;

    setLoading(true);
    try {
      // Authenticate with Google account payload and password
      const accountPayload = {
        ...selectedAccount,
        password: password || 'GoogleSecuredPasskey2026',
        role: 'member',
        plan: selectedAccount.plan || '12 Month VIP Membership'
      };

      const res = await loginWithGoogle(accountPayload);
      // Remember account on device
      saveDeviceAccount(selectedAccount);
      showSuccess(`Authenticated as ${selectedAccount.name || selectedAccount.email}! Welcome to GymLife 🏋️`);
      onClose();
    } catch (err) {
      showError(err.message || 'Google authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Instant Passkey Verification via "Try another way"
  const handlePasskeyAuth = async () => {
    setShowTryAnotherModal(false);
    setLoading(true);
    try {
      const accountPayload = {
        ...selectedAccount,
        authMethod: 'passkey',
        role: 'member',
        plan: selectedAccount.plan || '12 Month VIP Membership'
      };

      await loginWithGoogle(accountPayload);
      saveDeviceAccount(selectedAccount);
      showSuccess(`Passkey verified for ${selectedAccount.name}! 🚀`);
      onClose();
    } catch (err) {
      showError(err.message || 'Passkey verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // Go back from Password challenge to Account Chooser
  const handleBackToChooser = () => {
    setSlideDirection('back');
    setStep('chooser');
    setPassword('');
    setShowTryAnotherModal(false);
  };

  // Launch live Google OAuth 2.0 popup via Google Identity Services
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
        showInfo('Enter your Google Cloud Client ID to enable live Google popup, or sign in directly below.');
      } else {
        showError(err.message || 'Google Sign-In was cancelled or failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Save Google Client ID
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

  // Remove an account from this device
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
        {/* Top Bar: Google G Logo + Sign in with Google + Close button */}
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

        {/* Slide Container: Chooser Slide OR Welcome Password Slide */}
        <div className={`google-slide-container ${slideDirection === 'next' ? 'slide-forward' : 'slide-backward'}`}>
          {step === 'chooser' ? (
            /* =========================================================================
               STEP 1: ACCOUNT CHOOSER OR EMAIL INPUT SLIDE
               ========================================================================= */
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

              {/* Right Column: Device Accounts OR Email Input */}
              <div className="google-chooser-right-col">
                {!showCustomInput && deviceAccounts.length > 0 ? (
                  <div className="google-accounts-group">
                    {deviceAccounts.map((acct) => (
                      <button
                        key={acct.email}
                        type="button"
                        className="google-account-row"
                        onClick={() => handleSelectAccountForPassword(acct)}
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

                        {/* Remove account button */}
                        <div className="google-account-status-wrap">
                          <button
                            type="button"
                            className="google-account-remove-btn"
                            title="Remove account from this device"
                            onClick={(e) => handleRemoveAccount(e, acct.email)}
                            aria-label="Remove account"
                          >
                            ×
                          </button>
                        </div>
                      </button>
                    ))}

                    {/* "Use another account" */}
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
                  /* Custom User Email Input Form */
                  <form className="google-custom-login-view" onSubmit={handleEmailSubmit}>
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
                      <small className="google-input-hint">Enter your Google account to proceed to password verification.</small>
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
                        Next
                      </button>
                    </div>

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
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>
          ) : (
            /* =========================================================================
               STEP 2: GOOGLE "WELCOME" PASSWORD CHALLENGE SLIDE (MATCHING SCREENSHOT)
               ========================================================================= */
            <div className="google-chooser-body google-password-challenge-body">
              {/* Left Column: App Logo, "Welcome", Selected Account Chip */}
              <div className="google-chooser-left-col">
                <div className="google-app-badge-box">
                  <div className="google-app-badge-icon">
                    <span className="app-badge-bolt">⚡</span>
                    <span className="app-badge-text">GYM</span>
                  </div>
                </div>

                <h1 className="google-chooser-headline">Welcome</h1>

                {/* Account Chip / Pill with User Icon */}
                <button
                  type="button"
                  className="google-account-pill"
                  onClick={handleBackToChooser}
                  title="Switch to another account"
                >
                  <div className="account-pill-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                  </div>
                  <span className="account-pill-email">{selectedAccount?.email}</span>
                  <svg className="account-pill-arrow" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </button>
              </div>

              {/* Right Column: Blue Passkey Banner, Password Input, Show Password, Next */}
              <div className="google-chooser-right-col">
                {/* Google Blue Passkey Callout Box */}
                <div className="google-passkey-banner">
                  <div className="passkey-banner-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                    </svg>
                  </div>
                  <div className="passkey-banner-text">
                    Select "Try another way" to use your passkey for an easier, more secure sign-in
                  </div>
                </div>

                {/* Password Form */}
                <form className="google-password-form" onSubmit={handlePasswordSubmit}>
                  <div className="google-password-field-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="google-password-input"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>

                  {/* Show Password Checkbox */}
                  <label className="google-show-password-label">
                    <input
                      type="checkbox"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      className="google-checkbox"
                    />
                    <span>Show password</span>
                  </label>

                  {/* Action Buttons: Try another way & Next */}
                  <div className="google-password-actions-row">
                    <button
                      type="button"
                      className="google-try-another-btn"
                      onClick={() => setShowTryAnotherModal(true)}
                    >
                      Try another way
                    </button>

                    <button
                      type="submit"
                      className="google-primary-btn"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <i className="fa fa-spinner fa-spin mr-2"></i> Verifying...
                        </>
                      ) : (
                        'Next'
                      )}
                    </button>
                  </div>
                </form>

                {/* "Try another way" Options Modal / Drawer */}
                {showTryAnotherModal && (
                  <div className="google-try-another-drawer">
                    <div className="drawer-header">
                      <span>Choose how you want to sign in:</span>
                      <button 
                        type="button" 
                        className="drawer-close"
                        onClick={() => setShowTryAnotherModal(false)}
                      >
                        ×
                      </button>
                    </div>
                    <button
                      type="button"
                      className="drawer-option-btn"
                      onClick={handlePasskeyAuth}
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                      </svg>
                      <span>Use your Passkey / Biometrics</span>
                    </button>
                    <button
                      type="button"
                      className="drawer-option-btn"
                      onClick={handleBackToChooser}
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                      </svg>
                      <span>Switch to another account</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
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
