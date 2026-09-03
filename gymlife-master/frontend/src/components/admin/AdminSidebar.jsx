import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';

const AdminSidebar = ({ isOpen, onClose, unreadMessages = 0 }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('gymlife_token');
    localStorage.removeItem('gymlife_user');
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin/dashboard', icon: 'fa-tachometer', label: 'Dashboard' },
    { to: '/admin/appointments', icon: 'fa-calendar-check-o', label: 'Appointments' },
    { to: '/admin/members', icon: 'fa-users', label: 'Members' },
    { to: '/admin/trainers', icon: 'fa-user-secret', label: 'Trainers' },

    { to: '/admin/classes', icon: 'fa-dumbbell', label: 'Classes', customIcon: true },
    { to: '/admin/timetable', icon: 'fa-calendar', label: 'Timetable' },
    { to: '/admin/memberships', icon: 'fa-id-card', label: 'Memberships' },
    { to: '/admin/payments', icon: 'fa-credit-card', label: 'Payments' },
    { to: '/admin/messages', icon: 'fa-envelope', label: 'Messages', badge: unreadMessages },
    { to: '/admin/blog', icon: 'fa-newspaper-o', label: 'Blog Posts' },
    { to: '/admin/reports', icon: 'fa-line-chart', label: 'Reports' },
    { to: '/admin/notifications', icon: 'fa-bell', label: 'Notification Logs' },
    { to: '/admin/audit-logs', icon: 'fa-history', label: 'Audit Logs' },

    { to: '/admin/settings', icon: 'fa-cog', label: 'Settings' },
    { to: '/admin/profile', icon: 'fa-user-circle-o', label: 'My Profile' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="admin-sidebar-backdrop"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 998,
            display: 'block'
          }}
        />
      )}

      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="admin-sidebar-header">
          <Link to="/admin/dashboard" className="admin-brand-link" onClick={onClose}>
            <span className="brand-text">
              GYM<span className="brand-accent">LIFE</span>
            </span>
            <span className="brand-badge">ADMIN</span>
          </Link>
          <button 
            type="button" 
            className="sidebar-close-btn" 
            onClick={onClose} 
            aria-label="Close Sidebar"
          >
            <i className="fa fa-times"></i>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="admin-sidebar-nav">
          <div className="nav-section-label">MANAGEMENT</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">
                {item.customIcon ? (
                  <i className="fa fa-cubes"></i>
                ) : (
                  <i className={`fa ${item.icon}`}></i>
                )}
              </span>
              <span className="nav-label">{item.label}</span>
              {item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="admin-sidebar-footer">
          <Link to="/" className="live-site-btn" target="_blank" rel="noopener noreferrer">
            <i className="fa fa-external-link"></i> Live Website
          </Link>
          <button type="button" onClick={handleLogout} className="admin-logout-btn">
            <i className="fa fa-sign-out"></i> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
