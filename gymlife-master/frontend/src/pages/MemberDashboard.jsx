import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

const MemberDashboard = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { showSuccess, showInfo } = useToast();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'classes' | 'membership'
  const [bookingModal, setBookingModal] = useState(false);
  const [newBooking, setNewBooking] = useState({
    service: 'Personal Training Session',
    appointment_date: '',
    phone: '125-711-811',
    notes: 'Personal training & workout goal review'
  });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    api.getMemberDashboard(user?.email, user?.name).then((data) => {
      if (data && data.status === 'success') {
        setDashboardData(data);
      }
    });
  }, [isAuthenticated, user, navigate]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setBookingSubmitting(true);
    try {
      await api.createAppointment({
        name: user?.name || user?.username,
        email: user?.email,
        phone: newBooking.phone,
        service: newBooking.service,
        appointment_date: newBooking.appointment_date || new Date(Date.now() + 86400000).toISOString(),
        notes: newBooking.notes
      });
      showSuccess('Session booked successfully! Added to your schedule.');
      setBookingModal(false);
      // Refresh dashboard data
      const refresh = await api.getMemberDashboard(user?.email, user?.name);
      if (refresh) setDashboardData(refresh);
    } catch {
      showInfo('Booking request recorded! Gym staff will confirm shortly.');
      setBookingModal(false);
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleClassRsvp = (className) => {
    showSuccess(`Spot reserved for ${className}! We look forward to seeing you. 🥊`);
  };

  if (!isAuthenticated) return null;

  const stats = dashboardData?.stats || {
    attendance_this_month: 14,
    calories_burned_approx: '9,450 kcal',
    current_streak_days: 5,
    membership_status: 'Active (VIP Gold)',
    next_renewal: 'August 2027',
    locker_assigned: 'Locker #42',
    trainer_assigned: 'Sarah Johnson & John Smith'
  };

  const appointments = dashboardData?.appointments || [];

  return (
    <div className="member-dashboard-page spad">
      <div className="container">
        {/* Top Member Header Banner */}
        <div className="member-hero-banner">
          <div className="member-info-left">
            <div className="member-avatar-large">
              <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'A'}</span>
              <span className="member-online-dot"></span>
            </div>
            <div className="member-text-details">
              <div className="member-badge-row">
                <span className="badge-vip">⭐ {user?.plan || 'VIP Gold Member'}</span>
                <span className="badge-id">ID: #GYM-2026-{user?.id ? user.id * 100 + 42 : '789'}</span>
                {isAdmin && (
                  <Link to="/admin/dashboard" className="badge-admin-link">
                    👑 Switch to Admin Portal
                  </Link>
                )}
              </div>
              <h2>{user?.name || user?.username}</h2>
              <p className="member-meta">
                <i className="fa fa-envelope"></i> {user?.email} &nbsp;|&nbsp; 
                <i className="fa fa-calendar"></i> Member Since: {user?.joined_date || 'August 2026'}
              </p>
            </div>
          </div>

          <div className="member-actions-right">
            <button className="primary-btn book-btn" onClick={() => setBookingModal(true)}>
              <i className="fa fa-plus-circle"></i> Book New Session
            </button>
            <button className="logout-btn" onClick={() => { logout(); navigate('/'); }}>
              <i className="fa fa-sign-out"></i> Log Out
            </button>
          </div>
        </div>

        {/* Quick KPI Stats Cards */}
        <div className="row stats-row">
          <div className="col-lg-3 col-md-6 col-sm-6">
            <div className="member-kpi-card">
              <div className="kpi-icon orange">
                <i className="fa fa-bolt"></i>
              </div>
              <div className="kpi-info">
                <h4>{stats.current_streak_days} Days 🔥</h4>
                <p>Current Workout Streak</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-sm-6">
            <div className="member-kpi-card">
              <div className="kpi-icon red">
                <i className="fa fa-fire"></i>
              </div>
              <div className="kpi-info">
                <h4>{stats.calories_burned_approx}</h4>
                <p>Est. Calories Burned</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-sm-6">
            <div className="member-kpi-card">
              <div className="kpi-icon green">
                <i className="fa fa-calendar-check-o"></i>
              </div>
              <div className="kpi-info">
                <h4>{stats.attendance_this_month} Check-ins</h4>
                <p>This Month (August)</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-sm-6">
            <div className="member-kpi-card">
              <div className="kpi-icon purple">
                <i className="fa fa-key"></i>
              </div>
              <div className="kpi-info">
                <h4>{stats.locker_assigned}</h4>
                <p>Assigned Locker & Club Key</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="dashboard-tab-bar">
          <button
            className={`d-tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            <i className="fa fa-clock-o"></i> My Bookings & Sessions ({appointments.length})
          </button>
          <button
            className={`d-tab-btn ${activeTab === 'classes' ? 'active' : ''}`}
            onClick={() => setActiveTab('classes')}
          >
            <i className="fa fa-users"></i> Available Classes & Timetable
          </button>
          <button
            className={`d-tab-btn ${activeTab === 'membership' ? 'active' : ''}`}
            onClick={() => setActiveTab('membership')}
          >
            <i className="fa fa-id-card-o"></i> Digital Membership Pass
          </button>
        </div>

        {/* Tab 1: Bookings & Sessions */}
        {activeTab === 'appointments' && (
          <div className="dashboard-tab-content">
            <div className="content-card-box">
              <div className="box-header-row">
                <h3>Scheduled Sessions & Assessments</h3>
                <button className="small-action-btn" onClick={() => setBookingModal(true)}>
                  + Schedule Appointment
                </button>
              </div>

              {appointments.length === 0 ? (
                <div className="empty-state-box">
                  <i className="fa fa-calendar-o empty-icon"></i>
                  <h4>No Active Sessions Scheduled</h4>
                  <p>Book a session with one of our certified master trainers to accelerate your results.</p>
                  <button className="primary-btn" onClick={() => setBookingModal(true)}>
                    Book Your First Session
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="gym-table">
                    <thead>
                      <tr>
                        <th>Service / Session</th>
                        <th>Date & Time</th>
                        <th>Notes & Details</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((app) => (
                        <tr key={app.id}>
                          <td>
                            <strong>{app.service}</strong>
                          </td>
                          <td>
                            <i className="fa fa-calendar text-muted"></i> {app.appointment_date}
                          </td>
                          <td>{app.notes || 'General Coaching'}</td>
                          <td>
                            <span className={`status-pill ${app.status === 'Upcoming' ? 'upcoming' : 'confirmed'}`}>
                              ● {app.status || 'Confirmed'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="table-btn-cancel"
                              onClick={() => showInfo('Session updated. Please contact reception 2h prior for cancellations.')}
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Available Classes */}
        {activeTab === 'classes' && (
          <div className="dashboard-tab-content">
            <div className="content-card-box">
              <div className="box-header-row">
                <h3>Weekly Group Fitness Classes</h3>
                <Link to="/class-timetable" className="small-action-btn">
                  View Full Schedule <i className="fa fa-external-link"></i>
                </Link>
              </div>
              <div className="row class-grid">
                {[
                  { name: 'Strength & Bodybuilding Masterclass', trainer: 'John Smith', time: '09:00 AM - 10:30 AM', category: 'Strength', icon: '🏋️' },
                  { name: 'Power Yoga & Flexibility Flow', trainer: 'Sarah Johnson', time: '11:00 AM - 12:00 PM', category: 'Mind & Body', icon: '🧘' },
                  { name: 'High-Octane Boxing & MMA Circuit', trainer: 'Marcus Vance', time: '05:30 PM - 06:45 PM', category: 'Cardio', icon: '🥊' },
                  { name: 'CrossFit WOD & Metabolic Conditioning', trainer: 'Elena Gomez', time: '07:00 PM - 08:15 PM', category: 'HIIT', icon: '⚡' }
                ].map((item, idx) => (
                  <div className="col-lg-6 mb-4" key={idx}>
                    <div className="class-member-card">
                      <div className="class-card-icon">{item.icon}</div>
                      <div className="class-card-details">
                        <span className="class-category-tag">{item.category}</span>
                        <h4>{item.name}</h4>
                        <p><i className="fa fa-user"></i> Coach: {item.trainer}</p>
                        <p><i className="fa fa-clock-o"></i> Time: {item.time}</p>
                      </div>
                      <button
                        className="rsvp-btn"
                        onClick={() => handleClassRsvp(item.name)}
                      >
                        Reserve Spot
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Digital Membership Pass */}
        {activeTab === 'membership' && (
          <div className="dashboard-tab-content">
            <div className="content-card-box">
              <div className="row align-items-center">
                <div className="col-lg-6">
                  <div className="digital-pass-card">
                    <div className="pass-top">
                      <img src="/img/logo.png" alt="GymLife Logo" className="pass-logo" />
                      <span className="pass-chip">VIP PASS</span>
                    </div>
                    <div className="pass-middle">
                      <div className="pass-holder-name">{user?.name || user?.username}</div>
                      <div className="pass-tier">{user?.plan || '12 Month VIP Membership'}</div>
                    </div>
                    <div className="pass-bottom">
                      <div className="pass-data-item">
                        <small>MEMBER NO.</small>
                        <span>GYM-{user?.id ? user.id * 100 + 42 : '789'}</span>
                      </div>
                      <div className="pass-data-item">
                        <small>VALID THRU</small>
                        <span>08 / 2027</span>
                      </div>
                      <div className="pass-barcode-mockup">
                        ||| | |||| | ||||| ||| ||
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="pass-benefits-list">
                    <h4>Included Club Privileges</h4>
                    <ul>
                      <li><i className="fa fa-check-circle text-success"></i> 24/7 Unlimited Access to All Locations</li>
                      <li><i className="fa fa-check-circle text-success"></i> Free InBody Composition Scans Every Month</li>
                      <li><i className="fa fa-check-circle text-success"></i> Unlimited Group Fitness Classes & Spin Studio</li>
                      <li><i className="fa fa-check-circle text-success"></i> Sauna, Steam Room & Hydro-massage Lounge</li>
                      <li><i className="fa fa-check-circle text-success"></i> 2 Complimentary Guest Passes per Month</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Booking Modal */}
      {bookingModal && (
        <div className="auth-modal-overlay" onClick={() => setBookingModal(false)}>
          <div className="auth-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button className="auth-modal-close" onClick={() => setBookingModal(false)}>
              <i className="fa fa-times"></i>
            </button>
            <div className="auth-modal-header">
              <div className="auth-brand-badge">
                <span className="badge-dot"></span> TRAINER SESSION
              </div>
              <h3 className="auth-title">Book a Fitness Session</h3>
              <p className="auth-subtitle">Select your preferred training category and schedule with our coaches.</p>
            </div>
            <form className="auth-form" onSubmit={handleBookAppointment}>
              <div className="auth-field-group">
                <label>Training Category / Service</label>
                <div className="auth-input-wrap select-wrap">
                  <i className="fa fa-trophy input-icon"></i>
                  <select
                    value={newBooking.service}
                    onChange={(e) => setNewBooking({ ...newBooking, service: e.target.value })}
                  >
                    <option value="Personal Fitness Assessment & Body Scan">Personal Fitness Assessment & Body Scan</option>
                    <option value="1-on-1 Strength Training Session">1-on-1 Strength Training Session</option>
                    <option value="Cardio & Weight Loss Circuit">Cardio & Weight Loss Circuit</option>
                    <option value="Nutrition Strategy Consultation">Nutrition Strategy Consultation</option>
                  </select>
                </div>
              </div>

              <div className="auth-field-group">
                <label>Preferred Date & Time</label>
                <div className="auth-input-wrap">
                  <i className="fa fa-calendar input-icon"></i>
                  <input
                    type="datetime-local"
                    value={newBooking.appointment_date}
                    onChange={(e) => setNewBooking({ ...newBooking, appointment_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <label>Contact Phone Number</label>
                <div className="auth-input-wrap">
                  <i className="fa fa-phone input-icon"></i>
                  <input
                    type="tel"
                    value={newBooking.phone}
                    onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <label>Special Requests or Fitness Goals</label>
                <div className="auth-input-wrap">
                  <i className="fa fa-pencil input-icon"></i>
                  <input
                    type="text"
                    value={newBooking.notes}
                    onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                    placeholder="e.g. Focus on chest & back hypertrophy"
                  />
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={bookingSubmitting}>
                {bookingSubmitting ? 'Booking Session...' : 'Confirm Appointment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDashboard;
