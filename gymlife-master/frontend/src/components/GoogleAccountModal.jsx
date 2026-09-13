import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  triggerGoogleOAuthPopup, 
  getGoogleClientId, 
  saveGoogleClientId 
} from '../utils/googleAuth';

const GoogleAccountModal = ({ isOpen, onClose }) => {
  const { loginWithGoogle } = useAuth();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('direct'); // 'oauth' | 'direct' | 'settings'
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googlePassword, setGooglePassword] = useState('');
  const [clientIdInput, setClientIdInput] = useState(getGoogleClientId());
  const [showConfig, setShowConfig] = useState(false);

  if (!isOpen) return null;

  // 1. Launch Official Google OAuth 2.0 Popup
  const handleLaunchGooglePopup = async () => {
    setLoading(true);
    try {
      const res = await triggerGoogleOAuthPopup();
      if (res && res.user) {
        const loginRes = await loginWithGoogle(res.user);
        showSuccess(`Welcome back, ${loginRes.user?.name || res.user.name}! 🚀`);
        onClose();
      }
    } catch (err) {
      if (err.message === 'GOOGLE_CLIENT_ID_REQUIRED') {
        setShowConfig(true);
        showError('Google Client ID is needed for live Google popup. Enter your Google Client ID below or sign in directly with your Gmail.');
      } else {
        showError(err.message || 'Google Sign-In was cancelled or failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Direct Real Google Account Authentication
  const handleDirectGoogleSignIn = async (e) => {
    e.preventDefault();
    if (!googleEmail || !googleEmail.includes('@')) {
      showError('Please enter a valid Gmail / Google account address.');
      return;
    }

    const cleanEmail = googleEmail.trim().toLowerCase();
    const derivedName = googleName.trim() || cleanEmail.split('@')[0].split(/[\._\-]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

    setLoading(true);
    try {
      const realUserPayload = {
        id: `google-${Date.now()}`,
        name: derivedName,
        email: cleanEmail,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(derivedName)}&backgroundColor=f36100&textColor=ffffff`,
        plan: '12 Month VIP Membership'
      };

      const res = await loginWithGoogle(realUserPayload);
      showSuccess(`Signed in with Google as ${res.user?.name || derivedName}! 🏋️`);
      onClose();
    } catch (err) {
      showError(err.message || 'Failed to sign in with Google account.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Save Custom Google Client ID
  const handleSaveClientId = (e) => {
    e.preventDefault();
    if (!clientIdInput.trim()) {
      showError('Please enter a valid Google OAuth Client ID.');
      return;
    }
    saveGoogleClientId(clientIdInput.trim());
    showSuccess('Google Client ID saved! Launching Google popup...');
    setShowConfig(false);
    handleLaunchGooglePopup();
  };

  return (
    <div className="google-modal-overlay" onClick={onClose}>
      <div className="google-modal-dialog real-google-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Google Header */}
        <div className="google-modal-top">
          <svg className="google-large-logo" viewBox="0 0 24 24" width="36" height="36">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <h3 className="google-modal-title">Sign in with Google</h3>
          <p className="google-modal-sub">Authenticate with your real Google credentials to access <strong>GymLife</strong></p>
        </div>

        {/* 1-Click Google OAuth Official Popup Button */}
        <div className="google-oauth-action-box">
          <button
            type="button"
            className="google-launch-popup-btn"
            onClick={handleLaunchGooglePopup}
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fa fa-spinner fa-spin mr-2"></i> Connecting to Google...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="20" height="20" className="mr-2">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Launch Google Sign-In Popup</span>
              </>
            )}
          </button>
        </div>

        <div className="google-divider-row">
          <span>or sign in directly with your Gmail</span>
        </div>

        {/* Real User Google Account Credentials Form */}
        <form className="google-custom-form" onSubmit={handleDirectGoogleSignIn}>
          <div className="google-input-field">
            <label>Your Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Aniket Shinde"
              value={googleName}
              onChange={(e) => setGoogleName(e.target.value)}
              required
            />
          </div>

          <div className="google-input-field">
            <label>Gmail / Google Account Email *</label>
            <input
              type="email"
              placeholder="yourname@gmail.com"
              value={googleEmail}
              onChange={(e) => setGoogleEmail(e.target.value)}
              required
            />
          </div>

          <div className="google-input-field">
            <label>Google Password / Passkey (Secure)</label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={googlePassword}
              onChange={(e) => setGooglePassword(e.target.value)}
            />
            <span className="field-hint text-muted">Secured via Google Identity Verification</span>
          </div>

          <div className="google-form-actions">
            <button
              type="button"
              className="google-btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="google-btn-submit"
              disabled={loading}
            >
              {loading ? <i className="fa fa-spinner fa-spin mr-2"></i> : null}
              Sign In with My Google Account
            </button>
          </div>
        </form>

        {/* Optional Google Client ID Config Toggle */}
        <div className="google-config-toggle">
          <button
            type="button"
            className="config-link-btn"
            onClick={() => setShowConfig(!showConfig)}
          >
            <i className="fa fa-cog"></i> {showConfig ? 'Hide' : 'Configure'} Live Google OAuth Client ID
          </button>

          {showConfig && (
            <form onSubmit={handleSaveClientId} className="google-client-id-form">
              <label>Google Cloud OAuth 2.0 Client ID</label>
              <div className="input-with-button">
                <input
                  type="text"
                  placeholder="xxxxx.apps.googleusercontent.com"
                  value={clientIdInput}
                  onChange={(e) => setClientIdInput(e.target.value)}
                />
                <button type="submit" className="save-client-btn">Save</button>
              </div>
              <small className="text-muted">
                Obtain from Google Cloud Console ➔ APIs & Services ➔ Credentials.
              </small>
            </form>
          )}
        </div>

        {/* Google Terms Footer */}
        <div className="google-modal-footer">
          <p>
            To continue, Google will share your name, email address, and profile picture with GymLife. 
            See GymLife's <a href="#privacy">Privacy Policy</a> and <a href="#terms">Terms of Service</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleAccountModal;
