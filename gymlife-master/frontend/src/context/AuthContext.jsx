import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import {
  signInWithGoogle,
  registerWithEmail,
  loginWithEmail,
  logoutFirebase
} from '../utils/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('gymlife_user');
      return saved ? JSON.parse(saved) : null;
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
    if (token && !user) {
      api.getAuthMe(token).then((res) => {
        if (res && res.status === 'success' && res.user) {
          setUser(res.user);
          localStorage.setItem('gymlife_user', JSON.stringify(res.user));
        }
      }).catch(() => {});
    }
  }, [token, user]);

  const login = async (credentials) => {
    const data = await api.authLogin(credentials);
    if (data && data.status === 'success') {
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('gymlife_token', data.token);
      localStorage.setItem('gymlife_user', JSON.stringify(data.user));
      setIsAuthModalOpen(false);
      return data;
    }
    throw new Error(data?.message || 'Login failed');
  };

  const register = async (userData) => {
    const data = await api.authRegister(userData);
    if (data && data.status === 'success') {
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('gymlife_token', data.token);
      localStorage.setItem('gymlife_user', JSON.stringify(data.user));
      setIsAuthModalOpen(false);
      return data;
    }
    throw new Error(data?.message || 'Registration failed');
  };

  // Google Sign-In with selected account or popup
  const loginWithGoogle = async (selectedAccount = null) => {
    if (selectedAccount && selectedAccount.email) {
      const userPayload = {
        id: selectedAccount.id || `google-${Date.now()}`,
        name: selectedAccount.name || selectedAccount.email.split('@')[0],
        email: selectedAccount.email,
        photoURL: selectedAccount.avatar,
        role: 'member',
        plan: selectedAccount.plan || '12 Month VIP Membership',
        joined_date: 'August 2026'
      };
      const generatedToken = `google-token-${userPayload.id}`;
      setUser(userPayload);
      setToken(generatedToken);
      localStorage.setItem('gymlife_token', generatedToken);
      localStorage.setItem('gymlife_user', JSON.stringify(userPayload));
      setIsAuthModalOpen(false);
      return { success: true, user: userPayload };
    }

    const res = await signInWithGoogle();
    if (res && res.success && res.user) {
      const generatedToken = `google-token-${res.user.id}`;
      setUser(res.user);
      setToken(generatedToken);
      localStorage.setItem('gymlife_token', generatedToken);
      localStorage.setItem('gymlife_user', JSON.stringify(res.user));
      setIsAuthModalOpen(false);
      return res;
    }
    throw new Error('Google Sign-In was cancelled or failed');
  };

  // Firebase Email Sign-In
  const firebaseLogin = async (email, password) => {
    const res = await loginWithEmail(email, password);
    if (res && res.success && res.user) {
      const generatedToken = `firebase-token-${res.user.id}`;
      setUser(res.user);
      setToken(generatedToken);
      localStorage.setItem('gymlife_token', generatedToken);
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
      const generatedToken = `firebase-token-${res.user.id}`;
      setUser(res.user);
      setToken(generatedToken);
      localStorage.setItem('gymlife_token', generatedToken);
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
