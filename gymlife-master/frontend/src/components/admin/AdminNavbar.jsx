import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';

const AdminNavbar = ({ onToggleSidebar, pageTitle = 'Dashboard' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const notifRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('gymlife_user');
      return saved ? JSON.parse(saved) : { name: 'Admin', role: 'SUPER_ADMIN' };
    } catch {
      return { name: 'Admin', role: 'SUPER_ADMIN' };
    }
  });

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.adminGetNotifications();
      if (res && res.status === 'success') {
        setNotifications(res.data || []);
        setUnreadCount(res.unread_count || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.adminMarkNotificationRead('all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.is_read) {
        await api.adminMarkNotificationRead(notif.id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      }
      setShowNotifMenu(false);
      if (notif.link) {
        navigate(notif.link);
      }
    } catch (err) {
      console.error('Error opening notification:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('gymlife_token');
    localStorage.removeItem('gymlife_user');
    navigate('/admin/login');
  };

  const formatRoleBadge = (role) => {
    if (role === 'SUPER_ADMIN') return <span className="admin-role-badge super">SUPER ADMIN</span>;
    if (role === 'STAFF') return <span className="admin-role-badge staff">STAFF</span>;
    return <span className="admin-role-badge admin">ADMIN</span>;
  };

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <button 
          type="button" 
          className="admin-hamburger-btn" 
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Drawer"
        >
          <i className="fa fa-bars"></i>
        </button>

        <div className="admin-page-header-info">
          <h1 className="admin-page-title">{pageTitle}</h1>
          <div className="admin-breadcrumbs">
            <span>GymLife Admin</span>
            <i className="fa fa-angle-right"></i>
            <span className="current">{pageTitle}</span>
          </div>
        </div>
      </div>

      <div className="admin-topbar-right">
        {/* Quick Link to Live Website */}
        <Link to="/" target="_blank" rel="noopener noreferrer" className="topbar-live-site-link">
          <i className="fa fa-external-link"></i> Live Site
        </Link>

        {/* Notifications Dropdown */}
        <div className="admin-notif-container" ref={notifRef}>
          <button 
            type="button" 
            className={`admin-notif-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            aria-label="View notifications"
          >
            <i className="fa fa-bell"></i>
            {unreadCount > 0 && <span className="notif-pulse-count">{unreadCount}</span>}
          </button>

          {showNotifMenu && (
            <div className="admin-notif-dropdown">
              <div className="notif-dropdown-header">
                <div>
                  <span className="notif-title">NOTIFICATIONS</span>
                  {unreadCount > 0 && <span className="notif-pill">{unreadCount} NEW</span>}
                </div>
                {unreadCount > 0 && (
                  <button type="button" onClick={handleMarkAllRead} className="notif-mark-all">
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notif-dropdown-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">
                    <i className="fa fa-bell-slash-o"></i>
                    <p>No new notifications</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div className="notif-icon-col">
                        {n.type === 'MEMBER_REGISTRATION' && <i className="fa fa-user-plus notif-icon green"></i>}
                        {n.type === 'CONTACT_ENQUIRY' && <i className="fa fa-envelope notif-icon orange"></i>}
                        {n.type === 'PAYMENT_RECEIVED' && <i className="fa fa-credit-card notif-icon green"></i>}
                        {n.type === 'MEMBERSHIP_EXPIRING' && <i className="fa fa-exclamation-triangle notif-icon red"></i>}
                        {n.type === 'APPOINTMENT' && <i className="fa fa-calendar-check-o notif-icon blue"></i>}
                        {!['MEMBER_REGISTRATION', 'CONTACT_ENQUIRY', 'PAYMENT_RECEIVED', 'MEMBERSHIP_EXPIRING', 'APPOINTMENT'].includes(n.type) && (
                          <i className="fa fa-info-circle notif-icon blue"></i>
                        )}
                      </div>
                      <div className="notif-body">
                        <p className="notif-item-title">{n.title}</p>
                        <p className="notif-item-message">{n.message}</p>
                        <span className="notif-time">{n.created_at}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Chip */}
        <div className="admin-profile-chip" onClick={() => navigate('/admin/profile')}>
          <img 
            src={adminUser?.avatar_url || '/img/team/team-1.jpg'} 
            alt={adminUser?.name || 'Admin'} 
            className="admin-avatar-small"
          />
          <div className="admin-profile-info">
            <span className="admin-name">{adminUser?.name || 'GymLife Admin'}</span>
            {formatRoleBadge(adminUser?.role || 'SUPER_ADMIN')}
          </div>
        </div>

        {/* Logout Action */}
        <button type="button" onClick={handleLogout} className="topbar-logout-btn" title="Sign Out">
          <i className="fa fa-sign-out"></i>
        </button>
      </div>
    </header>
  );
};

export default AdminNavbar;
