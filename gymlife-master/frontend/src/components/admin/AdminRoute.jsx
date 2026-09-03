import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AdminRoute = ({ children, requiredRole = 'STAFF' }) => {
  const location = useLocation();
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('gymlife_token');
    const userStr = localStorage.getItem('gymlife_user');

    if (!token) {
      setAuthorized(false);
      return;
    }

    let user = null;
    try {
      if (userStr) user = JSON.parse(userStr);
    } catch {
      user = null;
    }

    // Role verification
    const roleHierarchy = { SUPER_ADMIN: 3, ADMIN: 2, STAFF: 1 };
    let userRole = 'ADMIN';
    if (user) {
      if (user.is_superuser || user.role === 'SUPER_ADMIN') userRole = 'SUPER_ADMIN';
      else if (user.role === 'STAFF') userRole = 'STAFF';
      else if (user.role === 'admin' || user.is_staff) userRole = 'ADMIN';
    }

    const userLevel = roleHierarchy[userRole] || 1;
    const reqLevel = roleHierarchy[requiredRole] || 1;

    setAuthorized(userLevel >= reqLevel);
  }, [location, requiredRole]);

  if (authorized === null) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0c',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#f36100',
        fontFamily: '"Oswald", sans-serif',
        fontSize: '18px',
        letterSpacing: '1px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(243, 97, 0, 0.2)',
            borderTopColor: '#f36100',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px auto'
          }}></div>
          VERIFYING ACCESS PRIVILEGES...
        </div>
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminRoute;
