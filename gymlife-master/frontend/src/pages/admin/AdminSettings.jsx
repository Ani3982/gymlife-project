import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const AdminSettings = () => {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    gym_name: 'GymLife Fitness Center',
    tagline: 'Shape Your Ideal Body With Elite Coaching',
    contact_email: 'Support.gymcenter@gmail.com',
    phone: '125-711-811 / 125-668-886',
    address: '333 Middle Winchendon Rd, Rindge, NH 03461',
    working_hours_weekday: 'Monday - Friday: 06:00 - 22:00',
    working_hours_weekend: 'Saturday - Sunday: 07:00 - 20:00',
    logo_url: '/img/logo.png',
    google_map_url: 'https://maps.google.com/maps?q=333%20Middle%20Winchendon%20Rd%2C%20Rindge%2C%20NH%2003461&t=&z=14&ie=UTF8&iwloc=&output=embed',
    facebook_url: 'https://www.facebook.com',
    twitter_url: 'https://www.twitter.com',
    instagram_url: 'https://www.instagram.com',
    youtube_url: 'https://www.youtube.com',
    currency_symbol: '$',
    tax_percentage: '5.00'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.adminGetSettings();
      if (res && res.status === 'success' && res.data) {
        setFormData(prev => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      showError('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.adminUpdateSettings(formData);
      showSuccess('Gym operational settings and public branding updated successfully!');
    } catch (err) {
      showError(err.message || 'Error updating settings. (Super Admin privileges required)');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-module-page">
      <div className="module-top-header">
        <div>
          <h2 className="module-title">GYM SETTINGS & BRANDING</h2>
          <p className="module-subtitle">Configure studio operating hours, public contact information, and social connectivity.</p>
        </div>
      </div>

      {loading ? (
        <div className="admin-empty-state" style={{ padding: '60px' }}>
          <p>Loading configuration settings...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="admin-settings-form-card">
          {/* Section 1: General Business Info */}
          <div className="settings-form-section">
            <h3 className="settings-section-title">
              <i className="fa fa-building-o"></i> General Facility Information
            </h3>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="admin-form-label">Facility / Gym Name *</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.gym_name}
                  onChange={(e) => setFormData({ ...formData, gym_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="admin-form-label">Marketing Tagline</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="admin-form-label">Support & Inquiries Email *</label>
                <input
                  type="email"
                  className="admin-form-input"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="admin-form-label">Telephone Numbers *</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label className="admin-form-label">Physical Address (Displays on Footer & Contact)</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Operating Hours */}
          <div className="settings-form-section">
            <h3 className="settings-section-title">
              <i className="fa fa-clock-o"></i> Facility Operating Hours
            </h3>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="admin-form-label">Weekday Hours (Mon - Fri)</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.working_hours_weekday}
                  onChange={(e) => setFormData({ ...formData, working_hours_weekday: e.target.value })}
                  placeholder="e.g. Monday - Friday: 06:00 - 22:00"
                />
              </div>

              <div className="form-group">
                <label className="admin-form-label">Weekend Hours (Sat - Sun)</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.working_hours_weekend}
                  onChange={(e) => setFormData({ ...formData, working_hours_weekend: e.target.value })}
                  placeholder="e.g. Saturday - Sunday: 07:00 - 20:00"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Social Connectivity & Map */}
          <div className="settings-form-section">
            <h3 className="settings-section-title">
              <i className="fa fa-globe"></i> Social Channels & Google Maps Embed
            </h3>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="admin-form-label">Facebook URL</label>
                <input
                  type="url"
                  className="admin-form-input"
                  value={formData.facebook_url}
                  onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="admin-form-label">Instagram URL</label>
                <input
                  type="url"
                  className="admin-form-input"
                  value={formData.instagram_url}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="admin-form-label">Twitter / X URL</label>
                <input
                  type="url"
                  className="admin-form-input"
                  value={formData.twitter_url}
                  onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="admin-form-label">YouTube URL</label>
                <input
                  type="url"
                  className="admin-form-input"
                  value={formData.youtube_url}
                  onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label className="admin-form-label">Google Maps Iframe Embed URL</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.google_map_url}
                  onChange={(e) => setFormData({ ...formData, google_map_url: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="settings-form-actions">
            <button type="submit" className="admin-btn primary" disabled={saving}>
              <i className="fa fa-floppy-o"></i> {saving ? 'Saving...' : 'Save Configuration Changes'}
            </button>
          </div>
        </form>
      )}

      {/* ==============================================================
          REAL-LIFE EMAIL & SMS GATEWAY DISPATCH & TEST CENTER
          ============================================================== */}
      <div className="settings-card" style={{ marginTop: '28px' }}>
        <h3 className="settings-card-title">
          <i className="fa fa-paper-plane" style={{ color: '#f36100' }}></i> Real-Life Client Notification Gateway & Live Dispatch Center
        </h3>
        <p style={{ color: '#a4a5b0', fontSize: '13px', marginBottom: '20px', lineHeight: '1.6' }}>
          Test and verify real-life SMS alerts and Gmail SMTP email delivery to physical mobile phones and real email inboxes.
        </p>

        <div className="gateway-dispatch-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Email Gateway Test */}
          <div className="gateway-box" style={{ background: '#0d0d10', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '18px' }}>
            <h4 style={{ color: '#ffffff', fontSize: '15px', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa fa-envelope" style={{ color: '#3b82f6' }}></i> Gmail SMTP Email Gateway
            </h4>
            <p style={{ color: '#8e909d', fontSize: '12px', marginBottom: '14px' }}>
              Sends real HTML booking vouchers directly from your configured SMTP server in <code>backend/.env</code>.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                placeholder="Enter client test email (e.g. shindeaniket7744@gmail.com)"
                className="admin-form-input"
                id="test-email-input"
                defaultValue="shindeaniket7744@gmail.com"
                style={{ flex: 1, fontSize: '13px' }}
              />
              <button
                type="button"
                className="admin-btn primary"
                onClick={async () => {
                  const email = document.getElementById('test-email-input')?.value;
                  if (!email) return showError('Please enter a valid email address.');
                  try {
                    const d = await api.adminGatewayTest({ type: 'EMAIL', email });
                    if (d && d.status === 'success') {
                      showSuccess(d.message);
                    } else {
                      showError(d?.message || 'Email test failed.');
                    }
                  } catch (e) {
                    showError(e.message || 'Network error.');
                  }
                }}
              >
                <i className="fa fa-send"></i> Send Email
              </button>
            </div>
          </div>

          {/* SMS / WhatsApp Gateway Test */}
          <div className="gateway-box" style={{ background: '#0d0d10', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '18px' }}>
            <h4 style={{ color: '#ffffff', fontSize: '15px', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa fa-mobile" style={{ color: '#22c55e', fontSize: '18px' }}></i> Real SMS & WhatsApp Gateway
            </h4>
            <p style={{ color: '#8e909d', fontSize: '12px', marginBottom: '14px' }}>
              Sends telecom SMS via Fast2SMS / Twilio or generates instant WhatsApp direct dispatch links.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="tel"
                placeholder="Enter mobile number (e.g. 7744963982)"
                className="admin-form-input"
                id="test-phone-input"
                defaultValue="7744963982"
                style={{ flex: 1, fontSize: '13px' }}
              />
              <button
                type="button"
                className="admin-btn primary"
                style={{ background: '#25D366', borderColor: '#25D366' }}
                onClick={async () => {
                  const phone = document.getElementById('test-phone-input')?.value;
                  if (!phone) return showError('Please enter a phone number.');
                  try {
                    const d = await api.adminGatewayTest({ type: 'SMS', phone });
                    if (d && d.status === 'success') {
                      showSuccess(d.message);
                      if (d.whatsapp_url) {
                        window.open(d.whatsapp_url, '_blank');
                      }
                    } else {
                      showError(d?.message || 'SMS test failed.');
                    }
                  } catch (e) {
                    showError(e.message || 'Network error.');
                  }
                }}
              >
                <i className="fa fa-whatsapp"></i> Send Test
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
