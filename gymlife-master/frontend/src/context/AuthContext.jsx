import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import {
  signInWithGoogle,
  registerWithEmail,
  loginWithEmail,
  logoutFirebase
} from '../utils/firebase';

const AuthContext = createContext();

const sanitizeUser = (rawUser) => {
  if (!rawUser) return null;
  let name = rawUser.name || rawUser.username || '';
  if (!name || name.toLowerCase().includes('google athlete') || name.toLowerCase() === 'athlete') {
    if (rawUser.email) {
      const clean = rawUser.email.split('@')[0].replace('athlete.', '').replace('google.', '');
      const parts = clean.split(/[\._\-]/).filter(Boolean);
      name = parts.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') || rawUser.email.split('@')[0];
    } else {
      name = 'Member';
    }
  }
  return { ...rawUser, name };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('gymlife_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        const clean = sanitizeUser(parsed);
        if (clean && clean.name !== parsed.name) {
          localStorage.setItem('gymlife_user', JSON.stringify(clean));
        }
        return clean;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('gymlife_token') || null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'

  useEffect(() => {
    if (token) {
      api.getAuthMe(token).then((res) => {
        if (res && res.status === 'success' && res.user) {
          const clean = sanitizeUser(res.user);
          setUser(clean);
          localStorage.setItem('gymlife_user', JSON.stringify(clean));
        }
      }).catch(() => {});
    }
  }, [token]);

  const login = async (credentials) => {
    const data = await api.authLogin(credentials);
    if (data && data.status === 'success') {
      const clean = sanitizeUser(data.user);
      setUser(clean);
      setToken(data.token);
      localStorage.setItem('gymlife_token', data.token);
      localStorage.setItem('gymlife_user', JSON.stringify(clean));
      setIsAuthModalOpen(false);
      return data;
    }
    throw new Error(data?.message || 'Login failed');
  };

  const register = async (userData) => {
    const data = await api.authRegister(userData);
    if (data && data.status === 'success') {
      const clean = sanitizeUser(data.user);
      setUser(clean);
      setToken(data.token);
      localStorage.setItem('gymlife_token', data.token);
      localStorage.setItem('gymlife_user', JSON.stringify(clean));
      setIsAuthModalOpen(false);
      return data;
    }
    throw new Error(data?.message || 'Registration failed');
  };

  // Google Sign-In with selected account or popup
  const loginWithGoogle = async (selectedAccount = null) => {
    if (selectedAccount && selectedAccount.email) {
      const generatedToken = `google-token-${selectedAccount.id || Date.now()}`;
      const payload = {
        id: selectedAccount.id || `google-${Date.now()}`,
        name: selectedAccount.name || selectedAccount.email.split('@')[0],
        email: selectedAccount.email,
        photoURL: selectedAccount.avatar,
        role: 'member',
        plan: selectedAccount.plan || '12 Month VIP Membership',
        joined_date: 'August 2026'
      };

      try {
        const backendRes = await api.authFirebase(generatedToken, {
          name: payload.name,
          email: payload.email,
          avatar: payload.photoURL,
          plan: payload.plan
        });
        if (backendRes && backendRes.status === 'success' && backendRes.token) {
          const cleanBackendUser = sanitizeUser({
            ...backendRes.user,
            name: (backendRes.user?.name && !backendRes.user.name.toLowerCase().includes('google athlete'))
              ? backendRes.user.name
              : payload.name,
            photoURL: payload.photoURL || backendRes.user?.photoURL
          });
          setUser(cleanBackendUser);
          setToken(backendRes.token);
          localStorage.setItem('gymlife_token', backendRes.token);
          localStorage.setItem('gymlife_user', JSON.stringify(cleanBackendUser));
          setIsAuthModalOpen(false);
          return { success: true, user: cleanBackendUser };
        }
      } catch (err) {
        console.warn('Backend Firebase token exchange note:', err);
      }

      const cleanPayload = sanitizeUser(payload);
      setUser(cleanPayload);
      setToken(generatedToken);
      localStorage.setItem('gymlife_token', generatedToken);
      localStorage.setItem('gymlife_user', JSON.stringify(cleanPayload));
      setIsAuthModalOpen(false);
      return { success: true, user: cleanPayload };
    }

    const res = await signInWithGoogle();
    if (res && res.success && res.user) {
      const rawToken = `google-token-${res.user.id}`;
      try {
        const backendRes = await api.authFirebase(rawToken, {
          name: res.user.name,
          email: res.user.email,
          avatar: res.user.photoURL
        });
        if (backendRes && backendRes.status === 'success' && backendRes.token) {
          const cleanBackendUser = sanitizeUser({
            ...backendRes.user,
            name: (backendRes.user?.name && !backendRes.user.name.toLowerCase().includes('google athlete'))
              ? backendRes.user.name
              : res.user.name,
            photoURL: res.user.photoURL || backendRes.user?.photoURL
          });
          setUser(cleanBackendUser);
          setToken(backendRes.token);
          localStorage.setItem('gymlife_token', backendRes.token);
          localStorage.setItem('gymlife_user', JSON.stringify(cleanBackendUser));
          setIsAuthModalOpen(false);
          return { success: true, user: cleanBackendUser };
        }
      } catch (err) {
        console.warn('Backend Firebase token exchange note:', err);
      }

      const cleanUser = sanitizeUser(res.user);
      setUser(cleanUser);
      setToken(rawToken);
      localStorage.setItem('gymlife_token', rawToken);
      localStorage.setItem('gymlife_user', JSON.stringify(cleanUser));
      setIsAuthModalOpen(false);
      return { success: true, user: cleanUser };
    }
    throw new Error('Google Sign-In was cancelled or failed');
  };

  // Firebase Email Sign-In
  const firebaseLogin = async (email, password) => {
    const res = await loginWithEmail(email, password);
    if (res && res.success && res.user) {
      const rawToken = `firebase-token-${res.user.id}`;
      try {
        const backendRes = await api.authFirebase(rawToken);
        if (backendRes && backendRes.status === 'success' && backendRes.token) {
          setUser(backendRes.user);
          setToken(backendRes.token);
          localStorage.setItem('gymlife_token', backendRes.token);
          localStorage.setItem('gymlife_user', JSON.stringify(backendRes.user));
          setIsAuthModalOpen(false);
          return { success: true, user: backendRes.user };
        }
      } catch (err) {
        console.warn('Backend Firebase login exchange note:', err);
      }

      setUser(res.user);
      setToken(rawToken);
      localStorage.setItem('gymlife_token', rawToken);
      localStorage.setItem('gymlife_user', JSON.stringify(res.user));
      setIsAuthModalOpen(false);
      return res;
    }
    throw new Error('Firebase login failed');
  };

  // Firebase Email Registration
  const firebaseRegister = async (name, email, password) => {
    const res = await registerWithEmail(email, password, name);
    if (res && res.success && res.user) {
      const rawToken = `firebase-token-${res.user.id}`;
      try {
        const backendRes = await api.authFirebase(rawToken);
        if (backendRes && backendRes.status === 'success' && backendRes.token) {
          setUser(backendRes.user);
          setToken(backendRes.token);
          localStorage.setItem('gymlife_token', backendRes.token);
          localStorage.setItem('gymlife_user', JSON.stringify(backendRes.user));
          setIsAuthModalOpen(false);
          return { success: true, user: backendRes.user };
        }
      } catch (err) {
        console.warn('Backend Firebase register exchange note:', err);
      }

      setUser(res.user);
      setToken(rawToken);
      localStorage.setItem('gymlife_token', rawToken);
      localStorage.setItem('gymlife_user', JSON.stringify(res.user));
      setIsAuthModalOpen(false);
      return res;
    }
    throw new Error('Firebase registration failed');
  };

  const logout = () => {
    logoutFirebase();
    setUser(null);
    setToken(null);
    localStorage.removeItem('gymlife_token');
    localStorage.removeItem('gymlife_user');
  };

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const isAdmin = Boolean(user && (user.role === 'admin' || user.is_staff || user.is_superuser));
  const isMember = Boolean(user && !isAdmin);
  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isMember,
        login,
        register,
        loginWithGoogle,
        firebaseLogin,
        firebaseRegister,
        logout,
        isAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
