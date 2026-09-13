/**
 * GymLife Real-World Google Authentication Service
 * -------------------------------------------------
 * Uses official Google Identity Services (GIS) OAuth 2.0 & Google UserInfo APIs.
 * Supports both direct popup and full redirect flow (for popup-blocked browsers).
 */

// Official Google Cloud OAuth 2.0 Web Client ID for GymLife
const OFFICIAL_GOOGLE_CLIENT_ID = '845603149869-jpdaoj3o1gim3vvgta8j8os3705m89k9.apps.googleusercontent.com';

// Retrieve Google Client ID from environment variable, saved storage, or official project ID
export const getGoogleClientId = () => {
  return (
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    localStorage.getItem('gymlife_google_client_id') ||
    OFFICIAL_GOOGLE_CLIENT_ID
  );
};

export const saveGoogleClientId = (clientId) => {
  if (clientId) {
    localStorage.setItem('gymlife_google_client_id', clientId.trim());
  }
};

/**
 * Checks if Google Identity Services SDK is loaded in the browser.
 */
export const isGoogleSDKLoaded = () => {
  return typeof window !== 'undefined' && Boolean(window.google?.accounts?.oauth2);
};

/**
 * Opens the official Google Account Chooser in a standalone popup window.
 */
export const openOfficialGooglePopup = () => {
  const clientId = getGoogleClientId();
  if (!clientId) return null;

  const width = 500;
  const height = 620;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;

  const targetUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    window.location.origin
  )}&response_type=token&scope=openid%20profile%20email&prompt=select_account`;

  return window.open(
    targetUrl,
    'GoogleSignInWindow',
    `width=${width},height=${height},top=${top},left=${left},status=no,toolbar=no,menubar=no,location=yes,resizable=yes,scrollbars=yes`
  );
};

/**
 * Fetches the user profile from Google's official userinfo endpoint.
 */
export const fetchGoogleUserProfile = async (accessToken) => {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    throw new Error('Failed to fetch user profile from Google.');
  }

  const profile = await res.json();
  return {
    id: profile.sub || `google-${Date.now()}`,
    name: profile.name || (profile.email ? profile.email.split('@')[0] : 'Member'),
    email: profile.email,
    avatar: profile.picture || '',
    role: 'member',
    plan: '12 Month VIP Membership'
  };
};

/**
 * Redirects the current browser window directly to Google OAuth 2.0.
 * Completely bypasses browser popup blockers (works on Edge, Chrome, Safari, mobile).
 */
export const redirectToGoogleOAuth = () => {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID_REQUIRED');
  }

  const redirectUri = window.location.origin;
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=token&scope=openid%20profile%20email&prompt=select_account`;

  window.location.href = authUrl;
};

/**
 * Reads and parses access_token from the URL hash after a redirect from Google OAuth.
 */
export const parseOAuthRedirectToken = () => {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash;
  if (!hash || !hash.includes('access_token=')) return null;

  try {
    const cleanHash = hash.startsWith('#') ? hash.substring(1) : hash;
    const params = new URLSearchParams(cleanHash);
    return params.get('access_token');
  } catch {
    return null;
  }
};

// Singleton pre-initialized token client to maintain immediate user activation
let cachedTokenClient = null;
let activeCallback = null;
let activeErrorCallback = null;

export const initGoogleTokenClient = () => {
  if (typeof window === 'undefined' || !window.google?.accounts?.oauth2) return null;
  const clientId = getGoogleClientId();
  if (!clientId) return null;

  try {
    cachedTokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'email profile openid',
      prompt: 'select_account',
      callback: async (tokenResponse) => {
        if (tokenResponse.error) {
          if (activeErrorCallback) {
            activeErrorCallback(new Error(tokenResponse.error_description || tokenResponse.error));
          }
          return;
        }

        if (!tokenResponse.access_token) {
          if (activeErrorCallback) {
            activeErrorCallback(new Error('No access token received from Google.'));
          }
          return;
        }

        try {
          const user = await fetchGoogleUserProfile(tokenResponse.access_token);
          if (activeCallback) {
            activeCallback({
              success: true,
              user,
              token: tokenResponse.access_token
            });
          }
        } catch (fetchErr) {
          if (activeErrorCallback) activeErrorCallback(fetchErr);
        }
      },
      error_callback: (err) => {
        const errorMsg = err?.message || err?.type || 'Google Sign-In popup was closed or cancelled.';
        if (activeErrorCallback) {
          activeErrorCallback(new Error(errorMsg));
        }
      }
    });

    return cachedTokenClient;
  } catch (err) {
    console.warn('Google Identity Token Client init note:', err);
    return null;
  }
};

/**
 * Initiates the Google OAuth 2.0 popup flow.
 * Uses pre-initialized token client for instant user-gesture execution.
 */
export const triggerGoogleOAuthPopup = () => {
  return new Promise((resolve, reject) => {
    const clientId = getGoogleClientId();

    if (!clientId) {
      return reject(new Error('GOOGLE_CLIENT_ID_REQUIRED'));
    }

    if (!window.google?.accounts?.oauth2) {
      return reject(new Error('Google Identity Services SDK is still loading. Please try again in a few seconds.'));
    }

    activeCallback = resolve;
    activeErrorCallback = reject;

    if (!cachedTokenClient) {
      initGoogleTokenClient();
    }

    if (!cachedTokenClient) {
      return reject(new Error('Failed to initialize Google Token Client.'));
    }

    try {
      cachedTokenClient.requestAccessToken();
    } catch (err) {
      reject(err);
    }
  });
};

// Automatically attempt to pre-initialize the token client once Google SDK is available
if (typeof window !== 'undefined') {
  if (window.google?.accounts?.oauth2) {
    initGoogleTokenClient();
  } else {
    window.addEventListener('load', () => {
      setTimeout(initGoogleTokenClient, 300);
    });
  }
}
