import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../utils/api';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If already logged in with admin privileges, redirect immediately to dashboard
    const token = localStorage.getItem('adminToken') || localStorage.getItem('gymlife_token');
    const userStr = localStorage.getItem('gymlife_user');
    if (token) {
      try {
        if (userStr) {
          const u = JSON.parse(userStr);
          if (u.role === 'SUPER_ADMIN' || u.role === 'ADMIN' || u.role === 'STAFF' || u.is_staff || u.is_superuser) {
            navigate('/admin/dashboard', { replace: true });
            return;
          }
        }
      } catch {
        // ignore
      }
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.adminLogin({ username: username.trim(), password });
      if (data && data.status === 'success') {
        const token = data.token || 'dummy-admin-token-for-gymlife-site';
        const userObj = data.user || {
          id: 1,
          username: username.trim(),
          name: data.username || username.trim(),
          role: 'ADMIN',
          is_staff: true,
          is_superuser: false
        };

        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUsername', userObj.username);
        localStorage.setItem('gymlife_token', token);
        localStorage.setItem('gymlife_user', JSON.stringify(userObj));

        const destination = location.state?.from?.pathname || '/admin/dashboard';
        navigate(destination, { replace: true });
      } else {
        setError(data?.message || 'Invalid administrator username or password.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid administrator username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #151518 0%, #0a0a0c 100%)',
      padding: '20px',
      fontFamily: '"Oswald", sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(21, 21, 24, 0.95)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(243, 97, 0, 0.15)',
        padding: '40px 32px',
        textAlign: 'center'
      }}>
        {/* Brand Header */}
        <div style={{ marginBottom: '32px' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <h2 style={{ color: '#ffffff', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '28px', fontWeight: 'bold' }}>
              GYM<span style={{ color: '#f36100' }}>LIFE</span>
            </h2>
          </Link>
          <div style={{
            display: 'inline-block',
            background: 'rgba(243, 97, 0, 0.12)',
            color: '#f36100',
            border: '1px solid rgba(243, 97, 0, 0.3)',
            borderRadius: '4px',
            fontSize: '11px',
            letterSpacing: '2px',
            padding: '3px 8px',
            marginTop: '8px',
            fontWeight: 'bold'
          }}>
            ADMINISTRATION PORTAL
          </div>
          <p style={{ color: '#a4a5b0', fontSize: '13px', marginTop: '8px', fontFamily: '"Muli", sans-serif' }}>
            Sign in with authorized staff or administrator credentials
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            borderLeft: '4px solid #ef4444',
            padding: '12px 14px',
            color: '#f87171',
            borderRadius: '4px',
            fontSize: '13px',
            textAlign: 'left',
            marginBottom: '20px',
            fontFamily: '"Muli", sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className="fa fa-exclamation-circle" style={{ fontSize: '16px', flexShrink: 0 }}></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{
              color: '#c4c4c4',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              display: 'block',
              marginBottom: '6px'
            }}>
              Username or Email
            </label>
            <input 
              type="text" 
              placeholder="e.g. admin or admin@gymlife.com" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              style={{
                width: '100%',
                background: 'rgba(10, 10, 12, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '12px 15px',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
                fontFamily: '"Muli", sans-serif',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#f36100';
                e.target.style.boxShadow = '0 0 10px rgba(243, 97, 0, 0.25)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '28px', textAlign: 'left' }}>
            <label style={{
              color: '#c4c4c4',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              display: 'block',
              marginBottom: '6px'
            }}>
              Password
            </label>
            <input 
              type="password" 
              placeholder="Enter administrator password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                background: 'rgba(10, 10, 12, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '12px 15px',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
                fontFamily: '"Muli", sans-serif',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#f36100';
                e.target.style.boxShadow = '0 0 10px rgba(243, 97, 0, 0.25)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              background: '#f36100',
              color: '#ffffff',
              border: 'none',
              padding: '14px',
              borderRadius: '6px',
              fontSize: '15px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s, transform 0.1s, box-shadow 0.2s',
              boxShadow: '0 4px 15px rgba(243, 97, 0, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => !loading && (e.currentTarget.style.background = '#e35700')}
            onMouseOut={(e) => !loading && (e.currentTarget.style.background = '#f36100')}
          >
            {loading ? (
              <>
                <i className="fa fa-spinner fa-spin"></i> Authenticating...
              </>
            ) : (
              <>
                <i className="fa fa-sign-in"></i> Sign In to Admin Panel
              </>
            )}
          </button>
        </form>

        <div style={{
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          fontFamily: '"Muli", sans-serif'
        }}>
          <Link 
            to="/" 
            style={{
              color: '#a4a5b0',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#f36100')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#a4a5b0')}
          >
            <i className="fa fa-arrow-left"></i> Public Website
          </Link>
          <span style={{ color: '#555' }}>GymLife v2.0 Secured</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
