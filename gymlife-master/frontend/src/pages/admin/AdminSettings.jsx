import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const AdminSettings = () => {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form Configuration State
  const [formData, setFormData] = useState({
    gym_name: 'GymLife Fitness Center',
    tagline: 'Shape Your Ideal Body With Elite Coaching',
    contact_email: 'support.gymcenter@gmail.com',
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
    currency_symbol: '₹',
    tax_percentage: '5.00',

    // Outbound SMTP Gateway Settings
    smtp_provider: 'GMAIL',
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    smtp_from_email: '',
    smtp_use_tls: true,
    smtp_use_ssl: false,
  });

  // Live Gateway Diagnostic Testing States
  const [testEmail, setTestEmail] = useState('shindeaniket7744@gmail.com');
  const [emailTestLoading, setEmailTestLoading] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState(null);

  const [testPhone, setTestPhone] = useState('7744963982');
  const [smsTestLoading, setSmsTestLoading] = useState(false);
  const [smsTestResult, setSmsTestResult] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.adminGetSettings();
      if (res && res.status === 'success' && res.data) {
        setFormData(prev => ({
          ...prev,
          ...res.data,
          // If no user configured yet, prefill suggestion
          smtp_user: res.data.smtp_user || prev.smtp_user || '',
          smtp_from_email: res.data.smtp_from_email || prev.smtp_from_email || ''
        }));
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      showError('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  const applyProviderPreset = (provider) => {
    if (provider === 'GMAIL') {
      setFormData(prev => {
        const gmailUser = prev.smtp_user && prev.smtp_user.includes('@gmail.com') ? prev.smtp_user : 'shindeaniket7744@gmail.com';
        return {
          ...prev,
          smtp_provider: 'GMAIL',
          smtp_host: 'smtp.gmail.com',
          smtp_port: 587,
          smtp_use_tls: true,
          smtp_use_ssl: false,
          smtp_user: gmailUser,
          smtp_from_email: `GymLife Fitness Arena <${gmailUser}>`
        };
      });
    } else if (provider === 'BREVO') {
      setFormData(prev => ({
        ...prev,
        smtp_provider: 'BREVO',
        smtp_host: 'smtp-relay.brevo.com',
        smtp_port: 587,
        smtp_use_tls: true,
        smtp_use_ssl: false,
        smtp_user: prev.smtp_user || '',
        smtp_password: prev.smtp_password || '',
        smtp_from_email: prev.smtp_from_email || 'GymLife Fitness Arena <support@gymlife.com>'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        smtp_provider: 'CUSTOM'
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.adminUpdateSettings(formData);
      showSuccess('Gym settings & Email Gateway configuration saved successfully!');
    } catch (err) {
      showError(err.message || 'Error updating settings. (Super Admin privileges required)');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      showError('Please enter a valid recipient email address.');
      return;
    }

    setEmailTestLoading(true);
    setEmailTestResult(null);

    try {
      const res = await api.adminGatewayTest({
        type: 'EMAIL',
        email: testEmail.trim(),
        smtp_provider: formData.smtp_provider,
        smtp_host: formData.smtp_host,
        smtp_port: formData.smtp_port,
        smtp_user: formData.smtp_user,
        smtp_password: formData.smtp_password,
        smtp_from_email: formData.smtp_from_email,
        smtp_use_tls: formData.smtp_use_tls,
        smtp_use_ssl: formData.smtp_use_ssl
      });

      if (res && res.status === 'success') {
        setEmailTestResult({
          success: true,
          message: res.message || `Test email dispatched to ${testEmail}! Check your inbox and spam folder.`
        });
        showSuccess(res.message);
      } else {
        setEmailTestResult({
          success: false,
          message: res?.message || 'Email test execution failed.',
          hint: res?.hint,
          errorType: res?.error_type,
          technicalDetails: res?.technical_details
        });
        showError(res?.message || 'Email test failed.');
      }
    } catch (err) {
      setEmailTestResult({
        success: false,
        message: err.message || 'Network error executing email test.',
        hint: err.hint
      });
      showError(err.message || 'Email test failed.');
    } finally {
      setEmailTestLoading(false);
    }
  };

  const handleSendTestSMS = async () => {
    if (!testPhone) {
      showError('Please enter a phone number.');
      return;
    }
    setSmsTestLoading(true);
    setSmsTestResult(null);
    try {
      const res = await api.adminGatewayTest({ type: 'SMS', phone: testPhone.trim() });
      if (res && res.status === 'success') {
        setSmsTestResult({
          success: true,
          message: res.message,
          whatsapp_url: res.whatsapp_url
        });
        showSuccess(res.message);
        if (res.whatsapp_url) {
          window.open(res.whatsapp_url, '_blank');
        }
      } else {
        setSmsTestResult({
          success: false,
          message: res?.message || 'SMS test failed.'
        });
        showError(res?.message || 'SMS test failed.');
      }
    } catch (err) {
      setSmsTestResult({
        success: false,
        message: err.message || 'Network error.'
      });
      showError(err.message || 'Network error.');
    } finally {
      setSmsTestLoading(false);
    }
  };

  return (
    <div className="admin-module-page">
      <div className="module-top-header">
        <div>
          <h2 className="module-title">GYM SETTINGS & BRANDING</h2>
          <p className="module-subtitle">Configure studio operating hours, public contact information, and client notification gateway.</p>
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

          {/* Section 4: Email Gateway (SMTP) Configuration */}
          <div className="settings-form-section" style={{ borderTop: '2px solid rgba(243,97,0,0.3)', paddingTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
              <div>
                <h3 className="settings-section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa fa-envelope" style={{ color: '#f36100' }}></i> Outbound Email Gateway (SMTP Configuration)
                </h3>
                <p style={{ color: '#8e909d', fontSize: '13px', margin: '4px 0 0 0' }}>
                  Configure your Gmail or custom SMTP server to dispatch live booking passes, receipts, and member confirmations.
                </p>
              </div>

              {/* Provider Selector Badges */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => applyProviderPreset('GMAIL')}
                  style={{
                    background: formData.smtp_provider === 'GMAIL' ? '#f36100' : '#18191f',
                    border: `1px solid ${formData.smtp_provider === 'GMAIL' ? '#f36100' : 'rgba(255,255,255,0.12)'}`,
                    color: '#ffffff',
                    padding: '7px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <i className="fa fa-google" style={{ color: formData.smtp_provider === 'GMAIL' ? '#ffffff' : '#ea4335' }}></i>
                  Gmail SMTP (Recommended)
                </button>

                <button
                  type="button"
                  onClick={() => applyProviderPreset('BREVO')}
                  style={{
                    background: formData.smtp_provider === 'BREVO' ? '#0092ff' : '#18191f',
                    border: `1px solid ${formData.smtp_provider === 'BREVO' ? '#0092ff' : 'rgba(255,255,255,0.12)'}`,
                    color: '#ffffff',
                    padding: '7px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Brevo SMTP
                </button>

                <button
                  type="button"
                  onClick={() => applyProviderPreset('CUSTOM')}
                  style={{
                    background: formData.smtp_provider === 'CUSTOM' ? '#4b5563' : '#18191f',
                    border: `1px solid ${formData.smtp_provider === 'CUSTOM' ? '#9ca3af' : 'rgba(255,255,255,0.12)'}`,
                    color: '#ffffff',
                    padding: '7px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Custom SMTP
                </button>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="admin-form-label">SMTP Server / Host *</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.smtp_host}
                  onChange={(e) => setFormData({ ...formData, smtp_host: e.target.value })}
                  placeholder="smtp.gmail.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="admin-form-label">SMTP Port * (587 for TLS, 465 for SSL)</label>
                <input
                  type="number"
                  className="admin-form-input"
                  value={formData.smtp_port}
                  onChange={(e) => setFormData({ ...formData, smtp_port: e.target.value })}
                  placeholder="587"
                  required
                />
              </div>

              <div className="form-group">
                <label className="admin-form-label">SMTP Sender Email / Username *</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.smtp_user}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      smtp_user: val,
                      smtp_from_email: (!prev.smtp_from_email || prev.smtp_from_email.includes('@'))
                        ? `GymLife Fitness Arena <${val}>`
                        : prev.smtp_from_email
                    }));
                  }}
                  placeholder="e.g. shindeaniket7744@gmail.com"
                  required
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="admin-form-label" style={{ margin: 0 }}>
                    SMTP Password / App Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#f36100',
                      cursor: 'pointer',
                      fontSize: '11px',
                      padding: 0,
                      fontWeight: 'bold'
                    }}
                  >
                    <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i> {showPassword ? 'Hide Password' : 'Show Password'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="admin-form-input"
                  value={formData.smtp_password}
                  onChange={(e) => setFormData({ ...formData, smtp_password: e.target.value })}
                  placeholder="16-character Google App Password (e.g. abcd efgh ijkl mnop)"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label className="admin-form-label">Sender Display Name & Address (Delivered In Client Inbox)</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.smtp_from_email}
                  onChange={(e) => setFormData({ ...formData, smtp_from_email: e.target.value })}
                  placeholder="GymLife Fitness Arena <support.gymcenter@gmail.com>"
                />
              </div>
            </div>

            {/* Quick Gmail 30-Second Setup Guide */}
            <div style={{
              background: 'rgba(243, 97, 0, 0.08)',
              border: '1px solid rgba(243, 97, 0, 0.25)',
              borderRadius: '8px',
              padding: '16px 20px',
              marginTop: '16px',
              fontSize: '13px',
              color: '#d1d5db'
            }}>
              <div style={{ fontWeight: 'bold', color: '#f36100', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <i className="fa fa-lightbulb-o"></i> How to Connect Your Gmail SMTP in 30 Seconds:
              </div>
              <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                <li>Make sure <strong>2-Step Verification</strong> is enabled on your Google Account: <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" style={{ color: '#f36100', textDecoration: 'underline' }}>Google Account Security ↗</a></li>
                <li>Go to <strong>Google App Passwords</strong>: <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" style={{ color: '#f36100', textDecoration: 'underline' }}>myaccount.google.com/apppasswords ↗</a></li>
                <li>Under "App Name", type <strong>GymLife</strong>, click <strong>Create</strong>, and copy the 16-character password (e.g. <code>abcd efgh ijkl mnop</code>).</li>
                <li>Paste it into the <strong>SMTP Password</strong> field above and click <strong>Save Configuration Changes</strong>.</li>
              </ol>
            </div>
          </div>

          {/* Submit Action */}
          <div className="settings-form-actions" style={{ marginTop: '24px' }}>
            <button type="submit" className="admin-btn primary" disabled={saving} style={{ padding: '12px 28px', fontSize: '14px' }}>
              <i className="fa fa-floppy-o"></i> {saving ? 'Saving Changes...' : 'Save Configuration Changes'}
            </button>
          </div>
        </form>
      )}

      {/* ==============================================================
          REAL-LIFE EMAIL & SMS GATEWAY DISPATCH & TEST CENTER
          ============================================================== */}
      <div className="settings-card" style={{ marginTop: '32px' }}>
        <h3 className="settings-card-title">
          <i className="fa fa-paper-plane" style={{ color: '#f36100' }}></i> Real-Life Client Notification Gateway & Live Dispatch Center
        </h3>
        <p style={{ color: '#a4a5b0', fontSize: '13px', marginBottom: '20px', lineHeight: '1.6' }}>
          Test and verify real-life SMS alerts and live SMTP email delivery directly to real mobile phones and email inboxes.
        </p>

        <div className="gateway-dispatch-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          
          {/* Email Gateway Test Card */}
          <div className="gateway-box" style={{ background: '#0d0d10', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ color: '#ffffff', fontSize: '15px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa fa-envelope" style={{ color: '#3b82f6' }}></i> Outbound Email Gateway
              </h4>
              <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(243,97,0,0.15)', color: '#f36100', fontWeight: 'bold' }}>
                {formData.smtp_host || 'smtp.gmail.com'}:{formData.smtp_port || 587}
              </span>
            </div>

            <p style={{ color: '#8e909d', fontSize: '12px', marginBottom: '14px', lineHeight: '1.4' }}>
              Dispatches a branded HTML booking voucher pass to verify live connection and authentication.
            </p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <input
                type="email"
                placeholder="Enter client test email (e.g. shindeaniket7744@gmail.com)"
                className="admin-form-input"
                id="test-email-input"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                style={{ flex: 1, fontSize: '13px' }}
              />
              <button
                type="button"
                className="admin-btn primary"
                disabled={emailTestLoading}
                onClick={handleSendTestEmail}
                style={{ minWidth: '130px', whiteSpace: 'nowrap' }}
              >
                {emailTestLoading ? (
                  <span><i className="fa fa-spinner fa-spin"></i> Dispatching...</span>
                ) : (
                  <span><i className="fa fa-send"></i> Send Email</span>
                )}
              </button>
            </div>

            {/* Live Diagnostic Result */}
            {emailTestResult && (
              <div style={{
                borderRadius: '8px',
                padding: '14px 16px',
                fontSize: '12px',
                lineHeight: '1.5',
                background: emailTestResult.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${emailTestResult.success ? '#22c55e' : '#ef4444'}`,
                color: emailTestResult.success ? '#4ade80' : '#fca5a5',
                marginTop: '10px'
              }}>
                <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '13px' }}>
                  <i className={`fa ${emailTestResult.success ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
                  <span>{emailTestResult.success ? 'Test Email Dispatched Successfully!' : 'Gateway Authentication / Delivery Error'}</span>
                </div>
                <div>{emailTestResult.message}</div>

                {emailTestResult.hint && (
                  <div style={{
                    marginTop: '10px',
                    color: '#fef08a',
                    background: 'rgba(0,0,0,0.4)',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    borderLeft: '3px solid #eab308'
                  }}>
                    <strong style={{ color: '#eab308', display: 'block', marginBottom: '3px' }}>Resolution Guide:</strong>
                    {emailTestResult.hint}
                  </div>
                )}

                {emailTestResult.technicalDetails && (
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>
                    Error details: {emailTestResult.technicalDetails}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SMS / WhatsApp Gateway Test Card */}
          <div className="gateway-box" style={{ background: '#0d0d10', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '20px' }}>
            <h4 style={{ color: '#ffffff', fontSize: '15px', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa fa-mobile" style={{ color: '#22c55e', fontSize: '18px' }}></i> Real SMS & WhatsApp Gateway
            </h4>
            <p style={{ color: '#8e909d', fontSize: '12px', marginBottom: '14px', lineHeight: '1.4' }}>
              Sends carrier SMS via Fast2SMS / Twilio or prepares direct WhatsApp booking dispatch links.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <input
                type="tel"
                placeholder="Enter mobile number (e.g. 7744963982)"
                className="admin-form-input"
                id="test-phone-input"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                style={{ flex: 1, fontSize: '13px' }}
              />
              <button
                type="button"
                className="admin-btn primary"
                style={{ background: '#25D366', borderColor: '#25D366', minWidth: '130px', whiteSpace: 'nowrap' }}
                disabled={smsTestLoading}
                onClick={handleSendTestSMS}
              >
                {smsTestLoading ? (
                  <span><i className="fa fa-spinner fa-spin"></i> Sending...</span>
                ) : (
                  <span><i className="fa fa-whatsapp"></i> Send Test</span>
                )}
              </button>
            </div>

            {smsTestResult && (
              <div style={{
                borderRadius: '8px',
                padding: '14px 16px',
                fontSize: '12px',
                lineHeight: '1.5',
                background: smsTestResult.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${smsTestResult.success ? '#22c55e' : '#ef4444'}`,
                color: smsTestResult.success ? '#4ade80' : '#fca5a5',
                marginTop: '10px'
              }}>
                <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <i className={`fa ${smsTestResult.success ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
                  <span>{smsTestResult.success ? 'SMS / WhatsApp Dispatched!' : 'Dispatch Error'}</span>
                </div>
                <div>{smsTestResult.message}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
