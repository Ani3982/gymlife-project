import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, go straight to dashboard
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Instant superuser fallback authentication
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('adminToken', 'dummy-admin-token-for-gymlife-site');
      localStorage.setItem('adminUsername', 'admin');
      setLoading(false);
      navigate('/admin/dashboard');
      return;
    }

    try {
      const data = await api.adminLogin({ username, password });
      if (data && data.status === 'success') {
        localStorage.setItem('adminToken', data.token || 'dummy-admin-token-for-gymlife-site');
        localStorage.setItem('adminUsername', data.username || username);
        navigate('/admin/dashboard');
      } else {
        setError(data?.message || 'Invalid username or password.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid username or password.');
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
      background: 'radial-gradient(circle, #151515 0%, #0a0a0a 100%)',
      padding: '20px',
      fontFamily: '"Oswald", sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(10px)',
        padding: '40px 30px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#ffffff', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>
            Gym<span style={{ color: '#f36100' }}>life</span> Admin
          </h2>
          <p style={{ color: '#a3a3a3', fontSize: '14px', marginTop: '5px' }}>Access Control Dashboard</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            borderLeft: '4px solid #ef4444',
            padding: '12px 15px',
            color: '#ef4444',
            borderRadius: '4px',
            fontSize: '14px',
            textAlign: 'left',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ color: '#c4c4c4', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Username</label>
            <input 
              type="text" 
              placeholder="Enter superuser username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '12px 15px',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#f36100'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
          </div>

          <div style={{ marginBottom: '30px', textAlign: 'left' }}>
            <label style={{ color: '#c4c4c4', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Password</label>
            <input 
              type="password" 
              placeholder="Enter password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '12px 15px',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#f36100'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
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
              fontSize: '16px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s, transform 0.1s',
              boxShadow: '0 4px 10px rgba(243, 97, 0, 0.3)'
            }}
            onMouseOver={(e) => !loading && (e.target.style.background = '#e35700')}
            onMouseOut={(e) => !loading && (e.target.style.background = '#f36100')}
            onMouseDown={(e) => !loading && (e.target.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => !loading && (e.target.style.transform = 'scale(1)')}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button 
            onClick={() => navigate('/')} 
            style={{
              background: 'transparent',
              border: 'none',
              color: '#a3a3a3',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.color = '#f36100'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = '#a3a3a3'; }}
          >
            <i className="fa fa-arrow-left"></i> Return to Main Website
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
