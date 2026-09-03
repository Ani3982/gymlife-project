import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const AdminProfile = () => {
  const { showSuccess, showError } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    avatar_url: '/img/team/team-1.jpg'
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await api.adminGetProfile();
      if (res && res.status === 'success' && res.data) {
        setProfile(res.data);
        setProfileForm({
          first_name: res.data.first_name || '',
          last_name: res.data.last_name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          avatar_url: res.data.avatar_url || '/img/team/team-1.jpg'
        });
      }
    } catch (err) {
      console.error('Error fetching admin profile:', err);
      showError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.adminUpdateProfile(profileForm);
      showSuccess('Profile information updated successfully!');
      // Update local storage user
      const stored = localStorage.getItem('gymlife_user');
      if (stored) {
        try {
          const userObj = JSON.parse(stored);
          userObj.name = `${profileForm.first_name} ${profileForm.last_name}`.trim() || userObj.name;
          userObj.email = profileForm.email;
          userObj.avatar_url = profileForm.avatar_url;
          localStorage.setItem('gymlife_user', JSON.stringify(userObj));
        } catch {
          // ignore
        }
      }
      loadProfile();
    } catch (err) {
      showError(err.message || 'Error updating profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.current_password || !passwordForm.new_password) {
      showError('Please enter your current and new password.');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      showError('New password must be at least 6 characters.');
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showError('New password and confirmation do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await api.adminUpdateProfile(passwordForm);
      showSuccess('Password updated successfully!');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      showError(err.message || 'Error changing password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="admin-module-page">
      <div className="module-top-header">
        <div>
          <h2 className="module-title">ADMINISTRATOR ACCOUNT & PROFILE</h2>
          <p className="module-subtitle">Manage personal profile credentials, contact info, and security passwords.</p>
        </div>
      </div>

      {loading ? (
        <div className="admin-empty-state" style={{ padding: '60px' }}>
          <p>Loading profile details...</p>
        </div>
      ) : (
        <div className="profile-layout-grid">
          {/* Profile Overview Card */}
          <div className="profile-overview-card">
            <img 
              src={profile?.avatar_url || '/img/team/team-1.jpg'} 
              alt={profile?.full_name || 'Admin'} 
              className="profile-avatar-large"
            />
            <h3 className="profile-full-name">{profile?.full_name || profile?.username}</h3>
            <span className="profile-username">@{profile?.username}</span>
            <div className="profile-role-pill">
              <span className={`admin-role-badge ${profile?.role?.toLowerCase() || 'admin'}`}>
                {profile?.role === 'SUPER_ADMIN' ? 'SUPER ADMINISTRATOR' : (profile?.role || 'ADMIN')}
              </span>
            </div>

            <div className="profile-stats-mini">
              <div className="stat-row">
                <span className="stat-label">Email:</span>
                <span className="stat-val">{profile?.email}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Phone:</span>
                <span className="stat-val">{profile?.phone || 'Not provided'}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Member Since:</span>
                <span className="stat-val">{profile?.date_joined}</span>
              </div>
            </div>
          </div>

          {/* Edit Forms Column */}
          <div className="profile-forms-column">
            {/* Personal Details Form */}
            <div className="dash-section-card">
              <div className="section-card-header">
                <div className="header-left">
                  <i className="fa fa-user-circle card-header-icon"></i>
                  <h4>PERSONAL PROFILE INFORMATION</h4>
                </div>
              </div>

              <div className="section-card-body">
                <form onSubmit={handleProfileSubmit}>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="admin-form-label">First Name</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={profileForm.first_name}
                        onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="admin-form-label">Last Name</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={profileForm.last_name}
                        onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="admin-form-label">Email Address *</label>
                      <input
                        type="email"
                        className="admin-form-input"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="admin-form-label">Direct Phone</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="+1 (555) 019-2834"
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '12px' }}>
                    <label className="admin-form-label">Avatar Image URL</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={profileForm.avatar_url}
                      onChange={(e) => setProfileForm({ ...profileForm, avatar_url: e.target.value })}
                    />
                  </div>

                  <div style={{ marginTop: '16px', textAlign: 'right' }}>
                    <button type="submit" className="admin-btn primary" disabled={savingProfile}>
                      <i className="fa fa-check"></i> {savingProfile ? 'Saving...' : 'Save Profile Details'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Change Password Form */}
            <div className="dash-section-card" style={{ marginTop: '24px' }}>
              <div className="section-card-header">
                <div className="header-left">
                  <i className="fa fa-lock card-header-icon"></i>
                  <h4>SECURITY & PASSWORD UPDATE</h4>
                </div>
              </div>

              <div className="section-card-body">
                <form onSubmit={handlePasswordSubmit}>
                  <div className="form-group">
                    <label className="admin-form-label">Current Password *</label>
                    <input
                      type="password"
                      className="admin-form-input"
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                      placeholder="Enter existing password"
                      required
                    />
                  </div>

                  <div className="form-grid-2" style={{ marginTop: '12px' }}>
                    <div className="form-group">
                      <label className="admin-form-label">New Password *</label>
                      <input
                        type="password"
                        className="admin-form-input"
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                        placeholder="Min 6 characters"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="admin-form-label">Confirm New Password *</label>
                      <input
                        type="password"
                        className="admin-form-input"
                        value={passwordForm.confirm_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                        placeholder="Repeat new password"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', textAlign: 'right' }}>
                    <button type="submit" className="admin-btn secondary" disabled={savingPassword}>
                      <i className="fa fa-key"></i> {savingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
