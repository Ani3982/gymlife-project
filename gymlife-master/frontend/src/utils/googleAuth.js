/**
 * GymLife Real-World Google Authentication Service
 * -------------------------------------------------
 * Uses official Google Identity Services (GIS) OAuth 2.0 & Google UserInfo APIs.
 */

// Retrieve Google Client ID from environment or saved settings
export const getGoogleClientId = () => {
  return (
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    localStorage.getItem('gymlife_google_client_id') ||
    ''
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
 * Initiates the real Google OAuth 2.0 popup flow.
 * Prompts user to select or log into their actual Google account on accounts.google.com.
 * Returns decoded profile: { id, name, email, avatar, token }
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

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        prompt: 'select_account',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            return reject(new Error(tokenResponse.error_description || tokenResponse.error));
          }

          if (!tokenResponse.access_token) {
            return reject(new Error('No access token received from Google.'));
          }

          try {
            // Fetch real user profile from Google's official endpoint
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`
              }
            });

            if (!res.ok) {
              throw new Error('Failed to fetch user profile from Google.');
            }

            const profile = await res.json();
            resolve({
              success: true,
              user: {
                id: profile.sub || `google-${Date.now()}`,
                name: profile.name || (profile.email ? profile.email.split('@')[0] : 'Member'),
                email: profile.email,
                avatar: profile.picture || '',
                role: 'member',
                plan: '12 Month VIP Membership'
              },
              token: tokenResponse.access_token
            });
          } catch (fetchErr) {
            reject(fetchErr);
          }
        },
        error_callback: (err) => {
          reject(new Error(err.message || 'Google Sign-In popup was closed or cancelled.'));
        }
      });

      // Launch Google's authentic account selection & sign-in popup
      client.requestAccessToken();
    } catch (err) {
      reject(err);
    }
  });
};
