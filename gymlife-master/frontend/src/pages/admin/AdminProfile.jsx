import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const AdminProfile = () => {
  const { showSuccess, showError } = useToast();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Avatar upload states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [avatarMode, setAvatarMode] = useState('upload'); // 'upload' | 'url'

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
        const avatar = res.data.avatar_url || '/img/team/team-1.jpg';
        setProfileForm({
          first_name: res.data.first_name || '',
          last_name: res.data.last_name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          avatar_url: avatar
        });
        setAvatarPreview(avatar);
      }
    } catch (err) {
      console.error('Error fetching admin profile:', err);
      showError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  // Handle uploading an image directly from the user's computer/system
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Allowed extensions check
    const validExtensions = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validExtensions.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
      showError('Please select a valid image file (JPG, PNG, WEBP, GIF, SVG).');
      return;
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      showError('Image file size exceeds the 10MB limit.');
      return;
    }

    // Immediate local preview
    const localPreviewUrl = URL.createObjectURL(file);
    setAvatarPreview(localPreviewUrl);
    setSelectedFileName(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);

    // Live dispatch upload to system backend
    setUploadingAvatar(true);
    try {
      const res = await api.adminUploadAvatar(file);
      if (res && res.status === 'success' && res.avatar_url) {
        const newAvatarUrl = res.avatar_url;
        setProfileForm(prev => ({ ...prev, avatar_url: newAvatarUrl }));
        setProfile(prev => ({ ...prev, avatar_url: newAvatarUrl }));
        setAvatarPreview(newAvatarUrl);
        showSuccess('Avatar image uploaded and updated successfully from your system!');

        // Synchronize with local storage
        try {
          const stored = localStorage.getItem('gymlife_user');
          if (stored) {
            const userObj = JSON.parse(stored);
            userObj.avatar_url = newAvatarUrl;
            localStorage.setItem('gymlife_user', JSON.stringify(userObj));
          }
        } catch {}

        // Notify navbar to refresh circular avatar
        window.dispatchEvent(new Event('adminUserUpdated'));
      } else {
        showError(res?.message || 'Failed to upload avatar.');
      }
    } catch (err) {
      showError(err.message || 'Error uploading avatar image.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.adminUpdateProfile(profileForm);
      showSuccess('Profile information updated successfully!');
      
      // Update local storage user
      const stored = localStorage.getItem('gymlife_user');
      if (stored) {
        try {
          const userObj = JSON.parse(stored);
          userObj.name = `${profileForm.first_name} ${profileForm.last_name}`.trim() || userObj.name;
          userObj.email = profileForm.email;
          userObj.avatar_url = res.avatar_url || profileForm.avatar_url;
          localStorage.setItem('gymlife_user', JSON.stringify(userObj));
        } catch {
          // ignore
        }
      }
      window.dispatchEvent(new Event('adminUserUpdated'));
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
      {/* Hidden file input for system file picker */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

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
            {/* Clickable Avatar with Camera Overlay */}
            <div 
              className="profile-avatar-wrapper"
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload avatar from your system"
              style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto 14px', cursor: 'pointer' }}
            >
              <img 
                src={avatarPreview || profile?.avatar_url || '/img/team/team-1.jpg'} 
                alt={profile?.full_name || 'Admin'} 
                className="profile-avatar-large"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: '3px solid #f36100',
                  boxShadow: '0 8px 24px rgba(243, 97, 0, 0.25)'
                }}
              />
              <div 
                className="avatar-hover-overlay" 
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.65)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: uploadingAvatar ? 1 : 0,
                  transition: 'opacity 0.2s ease',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  gap: '4px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => { if (!uploadingAvatar) e.currentTarget.style.opacity = '0'; }}
              >
                {uploadingAvatar ? (
                  <>
                    <i className="fa fa-spinner fa-spin" style={{ fontSize: '22px', color: '#f36100' }}></i>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <i className="fa fa-camera" style={{ fontSize: '20px', color: '#f36100' }}></i>
                    <span>Change Photo</span>
                  </>
                )}
              </div>
            </div>

            {/* Quick Upload from System Button */}
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="admin-btn small"
              style={{
                background: '#1b1c23',
                border: '1px solid rgba(243, 97, 0, 0.4)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '14px',
                padding: '6px 14px',
                borderRadius: '20px',
                cursor: 'pointer'
              }}
            >
              <i className="fa fa-cloud-upload" style={{ color: '#f36100' }}></i>
              {uploadingAvatar ? 'Uploading...' : 'Upload From System'}
            </button>

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

                  {/* Avatar Image System Upload Section */}
                  <div className="form-group" style={{ marginTop: '16px', background: '#0e0f13', padding: '16px 18px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <label className="admin-form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fa fa-picture-o" style={{ color: '#f36100' }}></i> Avatar Image
                      </label>
                      
                      {/* Mode Toggle Buttons */}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setAvatarMode('upload')}
                          style={{
                            background: avatarMode === 'upload' ? '#f36100' : '#1e1f28',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <i className="fa fa-upload"></i> Upload from System
                        </button>
                        <button
                          type="button"
                          onClick={() => setAvatarMode('url')}
                          style={{
                            background: avatarMode === 'url' ? '#f36100' : '#1e1f28',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <i className="fa fa-link"></i> Image URL / Presets
                        </button>
                      </div>
                    </div>

                    {avatarMode === 'upload' ? (
                      <div>
                        {/* Drag and drop / Click upload dropzone */}
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#f36100'; }}
                          onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(243,97,0,0.35)'; }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = 'rgba(243,97,0,0.35)';
                            if (e.dataTransfer.files?.[0]) {
                              handleFileSelect({ target: { files: e.dataTransfer.files } });
                            }
                          }}
                          style={{
                            border: '2px dashed rgba(243,97,0,0.35)',
                            borderRadius: '8px',
                            padding: '20px 16px',
                            textAlign: 'center',
                            background: 'rgba(243,97,0,0.03)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <i className={`fa ${uploadingAvatar ? 'fa-spinner fa-spin' : 'fa-cloud-upload'}`} style={{ fontSize: '32px', color: '#f36100', marginBottom: '8px', display: 'block' }}></i>
                          <div style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>
                            {uploadingAvatar ? 'Uploading image to system...' : 'Click to browse image from your computer, or drag & drop here'}
                          </div>
                          <p style={{ color: '#8e909d', fontSize: '11px', margin: 0 }}>
                            Supports JPG, PNG, WEBP, GIF, SVG (Maximum file size: 10MB)
                          </p>
                          {selectedFileName && (
                            <div style={{ marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.15)', color: '#4ade80', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                              <i className="fa fa-check-circle"></i> {selectedFileName}
                            </div>
                          )}
                        </div>

                        {/* Current Image Path Preview & Browse Button */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
                          <input
                            type="text"
                            className="admin-form-input"
                            value={profileForm.avatar_url}
                            readOnly
                            style={{ flex: 1, fontSize: '12px', background: 'rgba(255,255,255,0.03)', color: '#a4a5b0' }}
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="admin-btn primary"
                            disabled={uploadingAvatar}
                            style={{ whiteSpace: 'nowrap', fontSize: '12px', padding: '8px 16px' }}
                          >
                            <i className="fa fa-folder-open"></i> Browse File
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={profileForm.avatar_url}
                          onChange={(e) => {
                            setProfileForm({ ...profileForm, avatar_url: e.target.value });
                            setAvatarPreview(e.target.value);
                          }}
                          placeholder="e.g. /img/team/team-1.jpg or https://..."
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', color: '#8e909d' }}>Quick Presets:</span>
                          {['/img/team/team-1.jpg', '/img/team/team-2.jpg', '/img/team/team-3.jpg', '/img/team/team-4.jpg'].map((preset, idx) => (
                            <img
                              key={idx}
                              src={preset}
                              alt={`Preset ${idx + 1}`}
                              onClick={() => {
                                setProfileForm({ ...profileForm, avatar_url: preset });
                                setAvatarPreview(preset);
                              }}
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                cursor: 'pointer',
                                border: profileForm.avatar_url === preset ? '2px solid #f36100' : '1px solid rgba(255,255,255,0.2)',
                                transition: 'all 0.2s ease'
                              }}
                              title={`Select Avatar ${idx + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '20px', textAlign: 'right' }}>
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
