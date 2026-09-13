import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.adminGetDashboard();
      if (res && res.status === 'success') {
        setData(res);
      } else {
        setError(res?.message || 'Failed to load dashboard data.');
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(err.message || 'Unable to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  const kpis = data?.kpis || {};
  const recentMembers = data?.recent_members || [];
  const recentPayments = data?.recent_payments || [];
  const recentEnquiries = data?.recent_enquiries || [];
  const recentBookings = data?.recent_bookings || [];
  const upcomingClasses = data?.upcoming_classes || [];
  const expiryAlerts = data?.expiry_alerts || [];

  return (
    <div className="admin-dashboard-view">
      {/* Quick Action Bar */}
      <div className="admin-quick-actions-bar">
        <div className="quick-actions-title">
          <i className="fa fa-bolt"></i>
          <span>QUICK ACTIONS</span>
        </div>
        <div className="quick-action-buttons">
          <Link to="/admin/appointments" className="quick-btn orange">
            <i className="fa fa-calendar-check-o"></i> Appointments
          </Link>
          <Link to="/admin/members" className="quick-btn">
            <i className="fa fa-user-plus"></i> Add Member
          </Link>
          <Link to="/admin/trainers" className="quick-btn">
            <i className="fa fa-user-secret"></i> Add Trainer
          </Link>
          <Link to="/admin/classes" className="quick-btn">
            <i className="fa fa-plus-circle"></i> Add Class
          </Link>
          <Link to="/admin/timetable" className="quick-btn">
            <i className="fa fa-calendar-plus-o"></i> Add Schedule
          </Link>
          <Link to="/admin/payments" className="quick-btn green">
            <i className="fa fa-money"></i> Record Payment
          </Link>
          <Link to="/admin/blog" className="quick-btn">
            <i className="fa fa-pencil-square-o"></i> Write Blog
          </Link>
        </div>
      </div>


      {error && (
        <div className="admin-alert-box error">
          <i className="fa fa-exclamation-circle"></i>
          <span>{error}</span>
          <button type="button" onClick={fetchDashboardData} className="alert-retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* KPI Statistic Grid */}
      <div className="admin-kpi-grid">
        <div className="kpi-card accent-orange" onClick={() => navigate('/admin/appointments')} style={{ cursor: 'pointer' }}>
          <div className="kpi-icon-wrap">
            <i className="fa fa-calendar-check-o"></i>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">APPOINTMENTS</span>
            <h3 className="kpi-value">{loading ? '...' : kpis.total_bookings ?? 0}</h3>
            <span className="kpi-subtext">
              <strong style={{ color: '#22c55e' }}>{kpis.confirmed_bookings ?? 0} Confirmed</strong> • {kpis.today_bookings ?? 0} Today
            </span>
          </div>
        </div>

        <div className="kpi-card accent-orange" onClick={() => navigate('/admin/members')}>
          <div className="kpi-icon-wrap">
            <i className="fa fa-users"></i>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">TOTAL MEMBERS</span>
            <h3 className="kpi-value">{loading ? '...' : kpis.total_members ?? 0}</h3>
            <span className="kpi-subtext">
              <strong style={{ color: '#22c55e' }}>{kpis.active_members ?? 0} Active</strong> • {kpis.expired_members ?? 0} Expired
            </span>
          </div>
        </div>

        <div className="kpi-card accent-green" onClick={() => navigate('/admin/payments')}>
          <div className="kpi-icon-wrap">
            <i className="fa fa-inr"></i>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">TOTAL REVENUE</span>
            <h3 className="kpi-value">
              {loading ? '...' : `₹${(kpis.total_revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`}
            </h3>
            <span className="kpi-subtext">
              {kpis.pending_payments > 0 ? (
                <span style={{ color: '#f59e0b' }}>{kpis.pending_payments} Pending Payments</span>
              ) : (
                'All collections updated'
              )}
            </span>
          </div>
        </div>

        <div className="kpi-card accent-blue" onClick={() => navigate('/admin/trainers')}>
          <div className="kpi-icon-wrap">
            <i className="fa fa-id-badge"></i>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">COACHING STAFF</span>
            <h3 className="kpi-value">{loading ? '...' : kpis.total_trainers ?? 0}</h3>
            <span className="kpi-subtext">Certified Elite Trainers</span>
          </div>
        </div>

        <div className="kpi-card accent-purple" onClick={() => navigate('/admin/timetable')}>
          <div className="kpi-icon-wrap">
            <i className="fa fa-calendar"></i>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">TODAY'S CLASSES</span>
            <h3 className="kpi-value">{loading ? '...' : kpis.today_classes ?? 0}</h3>
            <span className="kpi-subtext">{kpis.total_classes ?? 0} Active Disciplines</span>
          </div>
        </div>

        <div className="kpi-card accent-yellow" onClick={() => navigate('/admin/messages')}>
          <div className="kpi-icon-wrap">
            <i className="fa fa-envelope-o"></i>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">NEW ENQUIRIES</span>
            <h3 className="kpi-value">{loading ? '...' : kpis.new_enquiries ?? 0}</h3>
            <span className="kpi-subtext">
              {kpis.new_enquiries > 0 ? (
                <span style={{ color: '#f36100' }}>Requires coaching reply</span>
              ) : (
                'Inbox up to date'
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Two-Column Grid */}
      <div className="admin-dash-grid">
        {/* Left Column: Recent Appointments & Recent Members */}
        <div className="dash-col">
          {/* Recent Appointments Card */}
          <div className="dash-section-card">
            <div className="section-card-header">
              <div className="header-left">
                <i className="fa fa-calendar-check-o card-header-icon" style={{ color: '#f36100' }}></i>
                <h4>RECENT APPOINTMENTS & BOOKINGS</h4>
              </div>
              <Link to="/admin/appointments" className="view-all-link">
                View All Passes <i className="fa fa-angle-right"></i>
              </Link>
            </div>

            <div className="section-card-body">
              {recentBookings.length === 0 ? (
                <div className="dash-empty-feed">
                  <p>No appointments booked yet.</p>
                </div>
              ) : (
                <div className="recent-list">
                  {recentBookings.map((b) => (
                    <div key={b.id} className="recent-list-item" onClick={() => navigate('/admin/appointments')}>
                      <div className="booking-avatar-icon" style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: 'rgba(243, 97, 0, 0.15)',
                        color: '#f36100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>
                        <i className="fa fa-ticket"></i>
                      </div>
                      <div className="recent-item-meta" style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="item-main-title">{b.name}</span>
                          <span style={{ fontSize: '11px', color: '#f36100', fontWeight: 'bold' }}>#{b.ref_id}</span>
                        </div>
                        <span className="item-sub-title">
                          {b.service} • {b.display_time || b.scheduled_time}
                        </span>
                      </div>
                      <div className="recent-item-badge-col">
                        <span className={`status-badge-pill ${b.status?.toLowerCase()}`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Members Card */}
          <div className="dash-section-card">
            <div className="section-card-header">
              <div className="header-left">
                <i className="fa fa-user-circle-o card-header-icon"></i>
                <h4>RECENTLY REGISTERED MEMBERS</h4>
              </div>
              <Link to="/admin/members" className="view-all-link">
                View All <i className="fa fa-angle-right"></i>
              </Link>
            </div>

            <div className="section-card-body">
              {recentMembers.length === 0 ? (
                <div className="dash-empty-feed">
                  <p>No members registered yet.</p>
                </div>
              ) : (
                <div className="recent-list">
                  {recentMembers.map((m) => (
                    <div key={m.id} className="recent-list-item" onClick={() => navigate('/admin/members')}>
                      <img 
                        src={m.profile_photo_url || '/img/team/team-1.jpg'} 
                        alt={m.full_name} 
                        className="member-avatar-micro"
                      />
                      <div className="recent-item-meta">
                        <span className="item-main-title">{m.full_name}</span>
                        <span className="item-sub-title">{m.email} • {m.plan_name}</span>
                      </div>
                      <div className="recent-item-badge-col">
                        <span className={`status-badge-pill ${m.status.toLowerCase()}`}>
                          {m.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Today's Class Schedule Timeline */}
          <div className="dash-section-card">
            <div className="section-card-header">
              <div className="header-left">
                <i className="fa fa-calendar-o card-header-icon"></i>
                <h4>TODAY'S CLASS SCHEDULE</h4>
              </div>
              <Link to="/admin/timetable" className="view-all-link">
                Full Timetable <i className="fa fa-angle-right"></i>
              </Link>
            </div>

            <div className="section-card-body">
              {upcomingClasses.length === 0 ? (
                <div className="dash-empty-feed">
                  <p>No scheduled classes found for today.</p>
                </div>
              ) : (
                <div className="schedule-timeline-list">
                  {upcomingClasses.map((s) => (
                    <div key={s.id} className="timeline-item">
                      <div className="timeline-time-badge">
                        <i className="fa fa-clock-o"></i>
                        <span>{s.time_display}</span>
                      </div>
                      <div className="timeline-content">
                        <span className="timeline-class-name">{s.class_name}</span>
                        <span className="timeline-details">
                          Coach: <strong>{s.trainer_name}</strong> • Room: {s.room}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Payments, Enquiries & Expiry Warnings */}
        <div className="dash-col">
          {/* Recent Payments Card */}
          <div className="dash-section-card">
            <div className="section-card-header">
              <div className="header-left">
                <i className="fa fa-credit-card card-header-icon"></i>
                <h4>RECENT PAYMENTS & BILLING</h4>
              </div>
              <Link to="/admin/payments" className="view-all-link">
                All Transactions <i className="fa fa-angle-right"></i>
              </Link>
            </div>

            <div className="section-card-body">
              {recentPayments.length === 0 ? (
                <div className="dash-empty-feed">
                  <p>No payment records logged yet.</p>
                </div>
              ) : (
                <div className="recent-list">
                  {recentPayments.map((p) => (
                    <div key={p.id} className="recent-list-item" onClick={() => navigate('/admin/payments')}>
                      <div className="payment-icon-chip">
                        <i className="fa fa-check-circle"></i>
                      </div>
                      <div className="recent-item-meta">
                        <span className="item-main-title">{p.member_name}</span>
                        <span className="item-sub-title">{p.payment_id} • {p.payment_method}</span>
                      </div>
                      <div className="recent-item-amount-col">
                        <span className="payment-amount">₹{parseFloat(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
                        <span className="payment-date">{p.payment_date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Membership Expiry Warnings */}
          {expiryAlerts.length > 0 && (
            <div className="dash-section-card warning-accent">
              <div className="section-card-header">
                <div className="header-left">
                  <i className="fa fa-exclamation-triangle card-header-icon" style={{ color: '#ef4444' }}></i>
                  <h4 style={{ color: '#ef4444' }}>MEMBERSHIP EXPIRATION ALERTS</h4>
                </div>
                <Link to="/admin/members" className="view-all-link">
                  Manage <i className="fa fa-angle-right"></i>
                </Link>
              </div>

              <div className="section-card-body">
                <div className="recent-list">
                  {expiryAlerts.map((m) => (
                    <div key={m.id} className="recent-list-item" onClick={() => navigate('/admin/members')}>
                      <div className="recent-item-meta">
                        <span className="item-main-title">{m.full_name}</span>
                        <span className="item-sub-title">{m.phone} • {m.plan_name}</span>
                      </div>
                      <div className="recent-item-badge-col">
                        <span className="expiry-date-tag">
                          Expires: {m.expiry_date || 'Expired'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Contact Enquiries */}
          <div className="dash-section-card">
            <div className="section-card-header">
              <div className="header-left">
                <i className="fa fa-comments-o card-header-icon"></i>
                <h4>LATEST WEBSITE ENQUIRIES</h4>
              </div>
              <Link to="/admin/messages" className="view-all-link">
                View Inbox <i className="fa fa-angle-right"></i>
              </Link>
            </div>

            <div className="section-card-body">
              {recentEnquiries.length === 0 ? (
                <div className="dash-empty-feed">
                  <p>No new customer enquiries.</p>
                </div>
              ) : (
                <div className="recent-list">
                  {recentEnquiries.map((msg) => (
                    <div key={msg.id} className="recent-list-item" onClick={() => navigate('/admin/messages')}>
                      <div className="recent-item-meta">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="item-main-title">{msg.name}</span>
                          <span className={`status-badge-pill ${msg.status.toLowerCase()}`}>{msg.status}</span>
                        </div>
                        <span className="item-sub-title">{msg.subject}</span>
                      </div>
                      <span className="msg-date-micro">{msg.submitted_at}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
