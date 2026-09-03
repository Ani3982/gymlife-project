import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/admin/ConfirmModal';

const AdminAppointments = () => {
  const { showSuccess, showError } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [serviceFilter, setServiceFilter] = useState('ALL');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Reschedule & Cancellation states
  const [rescheduleData, setRescheduleData] = useState({ scheduled_time: '' });
  const [cancelReason, setCancelReason] = useState('');

  // Form State for Manual Booking Creation
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'Personal Training Assessment',
    scheduled_time: '',
    location: 'GymLife Arena (333 Middle Winchendon Rd)',
    notes: '',
    status: 'CONFIRMED',
    send_email: true,
    send_sms: true,
  });

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, serviceFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (serviceFilter !== 'ALL') params.service = serviceFilter;

      const res = await api.adminGetBookings(params);
      if (res && res.status === 'success') {
        setBookings(res.data || []);
      } else {
        showError(res?.message || 'Failed to load bookings.');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      showError('Unable to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleStatusChange = async (booking, newStatus) => {
    if (newStatus === 'CANCELLED') {
      setSelectedBooking(booking);
      setCancelReason('');
      setShowCancelModal(true);
      return;
    }
    try {
      const res = await api.adminUpdateBooking(booking.id, { status: newStatus });
      if (res && res.status === 'success') {
        showSuccess(`Booking #${booking.ref_id} status updated to ${newStatus}. Notifications dispatched.`);
        fetchBookings();
      } else {
        showError(res?.message || 'Failed to update status.');
      }
    } catch (err) {
      showError('Error updating booking status.');
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBooking || !rescheduleData.scheduled_time) {
      showError('Please select a new date and time.');
      return;
    }
    setSaving(true);
    try {
      const res = await api.adminUpdateBooking(selectedBooking.id, {
        scheduled_time: rescheduleData.scheduled_time
      });
      if (res && res.status === 'success') {
        showSuccess(`Booking #${selectedBooking.ref_id} rescheduled to ${rescheduleData.scheduled_time}. Notifications sent.`);
        setShowRescheduleModal(false);
        fetchBookings();
      } else {
        showError(res?.message || 'Failed to reschedule.');
      }
    } catch (err) {
      showError('Error rescheduling appointment.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setSaving(true);
    try {
      const res = await api.adminUpdateBooking(selectedBooking.id, {
        status: 'CANCELLED',
        cancellation_reason: cancelReason || 'Cancelled by administration'
      });
      if (res && res.status === 'success') {
        showSuccess(`Booking #${selectedBooking.ref_id} cancelled. Cancellation notifications dispatched.`);
        setShowCancelModal(false);
        fetchBookings();
      } else {
        showError(res?.message || 'Failed to cancel.');
      }
    } catch (err) {
      showError('Error cancelling appointment.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await api.adminDeleteBooking(deleteId);
      if (res && res.status === 'success') {
        showSuccess('Booking deleted successfully.');
        setDeleteId(null);
        fetchBookings();
      } else {
        showError(res?.message || 'Failed to delete booking.');
      }
    } catch (err) {
      showError('Error deleting booking.');
    }
  };


  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      showError('Name, email, and phone number are required.');
      return;
    }
    setSaving(true);
    try {
      const res = await api.adminCreateBooking(formData);
      if (res && res.status === 'success') {
        showSuccess(`Booking #${res.data?.ref_id || ''} created successfully!`);
        setShowCreateModal(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          service: 'Personal Training Assessment',
          scheduled_time: '',
          location: 'GymLife Arena (333 Middle Winchendon Rd)',
          notes: '',
          status: 'CONFIRMED',
          send_email: true,
          send_sms: true,
        });
        fetchBookings();
      } else {
        showError(res?.message || 'Failed to create booking.');
      }
    } catch (err) {
      showError('Error creating booking.');
    } finally {
      setSaving(false);
    }
  };

  // KPIs
  const totalCount = bookings.length;
  const confirmedCount = bookings.filter((b) => b.status === 'CONFIRMED').length;
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;
  const cancelledCount = bookings.filter((b) => b.status === 'CANCELLED').length;

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="page-header-left">
          <div className="page-header-icon orange">
            <i className="fa fa-calendar-check-o"></i>
          </div>
          <div>
            <h2 className="page-title">APPOINTMENTS & BOOKINGS</h2>
            <p className="page-subtitle">Manage client training sessions, time slots, and real-time dispatch passes</p>
          </div>
        </div>
        <div className="page-header-actions">
          <button
            type="button"
            className="admin-btn primary"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="fa fa-plus-circle"></i> New Appointment
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="admin-kpi-grid mb-4">
        <div className="kpi-card accent-orange">
          <div className="kpi-icon-wrap">
            <i className="fa fa-ticket"></i>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">TOTAL BOOKINGS</span>
            <h3 className="kpi-value">{totalCount}</h3>
            <span className="kpi-subtext">All-time recorded sessions</span>
          </div>
        </div>

        <div className="kpi-card accent-green">
          <div className="kpi-icon-wrap">
            <i className="fa fa-check-circle"></i>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">CONFIRMED</span>
            <h3 className="kpi-value">{confirmedCount}</h3>
            <span className="kpi-subtext">Upcoming scheduled passes</span>
          </div>
        </div>

        <div className="kpi-card accent-blue">
          <div className="kpi-icon-wrap">
            <i className="fa fa-trophy"></i>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">COMPLETED</span>
            <h3 className="kpi-value">{completedCount}</h3>
            <span className="kpi-subtext">Attended training sessions</span>
          </div>
        </div>

        <div className="kpi-card accent-red">
          <div className="kpi-icon-wrap">
            <i className="fa fa-ban"></i>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">CANCELLED</span>
            <h3 className="kpi-value">{cancelledCount}</h3>
            <span className="kpi-subtext">Cancelled or rescheduled</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-filter-card">
        <form onSubmit={handleSearchSubmit} className="filter-form">
          <div className="filter-input-wrap search">
            <i className="fa fa-search"></i>
            <input
              type="text"
              placeholder="Search by Ref #, athlete name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-form-input"
            />
          </div>

          <div className="filter-select-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-form-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">Confirmed & Scheduled</option>
              <option value="PENDING">Pending Confirmation</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <button type="submit" className="admin-btn secondary">
            <i className="fa fa-filter"></i> Apply Filter
          </button>

          {(search || statusFilter !== 'ALL' || serviceFilter !== 'ALL') && (
            <button
              type="button"
              className="admin-btn outline"
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setServiceFilter('ALL');
              }}
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Bookings Data Table */}
      <div className="admin-card">
        <div className="card-body-table">
          {loading ? (
            <div className="admin-table-loading">
              <i className="fa fa-spinner fa-spin"></i> Loading appointment passes...
            </div>
          ) : bookings.length === 0 ? (
            <div className="admin-table-empty">
              <i className="fa fa-calendar-times-o"></i>
              <h4>No appointments found</h4>
              <p>When athletes book workouts on the website, they will appear here in real time.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>REFERENCE</th>
                    <th>ATHLETE</th>
                    <th>SERVICE / CATEGORY</th>
                    <th>SCHEDULED TIME</th>
                    <th>STATUS</th>
                    <th>DISPATCH</th>
                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <span className="badge-ref-orange">
                          #{b.ref_id || `GYM-2026-${b.id}`}
                        </span>
                      </td>
                      <td>
                        <div className="athlete-cell">
                          <strong>{b.name}</strong>
                          <span className="text-muted text-xs">
                            <i className="fa fa-envelope-o"></i> {b.email}
                          </span>
                          <span className="text-muted text-xs">
                            <i className="fa fa-phone"></i> {b.phone}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="badge-service-pill">
                          {b.service}
                        </span>
                      </td>
                      <td>
                        <div className="time-cell">
                          <strong style={{ color: '#f36100' }}>
                            <i className="fa fa-clock-o"></i> {b.display_time || b.scheduled_time}
                          </strong>
                          <span className="text-muted text-xs">{b.location}</span>
                        </div>
                      </td>
                      <td>
                        <select
                          className={`status-select-badge ${b.status?.toLowerCase()}`}
                          value={b.status}
                          onChange={(e) => handleStatusChange(b, e.target.value)}
                        >
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PENDING">PENDING</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td>
                        <div className="dispatch-tags-wrap">
                          <span className={`dispatch-pill ${b.email_delivered ? 'delivered' : 'pending'}`}>
                            <i className="fa fa-envelope"></i> {b.email_delivered ? 'Email ✓' : 'Email'}
                          </span>
                          <span className={`dispatch-pill ${b.sms_delivered ? 'delivered' : 'pending'}`}>
                            <i className="fa fa-comment"></i> {b.sms_delivered ? 'SMS ✓' : 'SMS'}
                          </span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-action-btns">
                          {b.whatsapp_url && (
                            <a
                              href={b.whatsapp_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="action-icon-btn whatsapp"
                              title="Send WhatsApp Pass"
                            >
                              <i className="fa fa-whatsapp"></i>
                            </a>
                          )}
                          <button
                            type="button"
                            className="action-icon-btn"
                            style={{ color: '#3742fa' }}
                            onClick={() => {
                              setSelectedBooking(b);
                              setRescheduleData({ scheduled_time: '' });
                              setShowRescheduleModal(true);
                            }}
                            title="Reschedule Appointment"
                          >
                            <i className="fa fa-calendar"></i>
                          </button>
                          <button
                            type="button"
                            className="action-icon-btn"
                            style={{ color: '#ff4757' }}
                            onClick={() => {
                              setSelectedBooking(b);
                              setCancelReason('');
                              setShowCancelModal(true);
                            }}
                            title="Cancel Appointment"
                          >
                            <i className="fa fa-ban"></i>
                          </button>
                          <button
                            type="button"
                            className="action-icon-btn view"
                            onClick={() => {
                              setSelectedBooking(b);
                              setShowViewModal(true);
                            }}
                            title="View Full Pass"
                          >
                            <i className="fa fa-eye"></i>
                          </button>
                          <button
                            type="button"
                            className="action-icon-btn delete"
                            onClick={() => setDeleteId(b.id)}
                            title="Delete Booking"
                          >
                            <i className="fa fa-trash-o"></i>
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* View Booking Details Modal */}
      {showViewModal && selectedBooking && (
        <div className="admin-modal-backdrop" onClick={() => setShowViewModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="admin-modal-header">
              <div className="modal-title-wrap">
                <span className="badge-pulse"></span>
                <h3>BOOKING PASS #{selectedBooking.ref_id}</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowViewModal(false)}>
                <i className="fa fa-times"></i>
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="session-summary-box mb-4">
                <div className="summary-row">
                  <span>Athlete Name:</span>
                  <strong>{selectedBooking.name}</strong>
                </div>
                <div className="summary-row">
                  <span>Email:</span>
                  <strong>{selectedBooking.email}</strong>
                </div>
                <div className="summary-row">
                  <span>Phone Number:</span>
                  <strong>{selectedBooking.phone}</strong>
                </div>
                <div className="summary-row">
                  <span>Discipline:</span>
                  <strong style={{ color: '#f36100' }}>{selectedBooking.service}</strong>
                </div>
                <div className="summary-row">
                  <span>Scheduled Time:</span>
                  <strong>{selectedBooking.display_time || selectedBooking.scheduled_time}</strong>
                </div>
                <div className="summary-row">
                  <span>Facility Location:</span>
                  <strong>{selectedBooking.location}</strong>
                </div>
                <div className="summary-row">
                  <span>Current Status:</span>
                  <span className={`status-badge-pill ${selectedBooking.status?.toLowerCase()}`}>
                    {selectedBooking.status}
                  </span>
                </div>
                {selectedBooking.notes && (
                  <div className="summary-row">
                    <span>Notes / Goals:</span>
                    <em>{selectedBooking.notes}</em>
                  </div>
                )}
              </div>

              <div className="ticket-messaging-action-bar">
                {selectedBooking.whatsapp_url && (
                  <a
                    href={selectedBooking.whatsapp_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ticket-msg-btn btn-whatsapp"
                  >
                    <i className="fa fa-whatsapp"></i> Send WhatsApp Pass
                  </a>
                )}
                {selectedBooking.sms_uri && (
                  <a href={selectedBooking.sms_uri} className="ticket-msg-btn btn-sms">
                    <i className="fa fa-comment"></i> Direct SMS
                  </a>
                )}
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn outline"
                onClick={() => setShowViewModal(false)}
              >
                Close Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Booking Creation Modal */}
      {showCreateModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="admin-modal-header">
              <div className="modal-title-wrap">
                <i className="fa fa-calendar-plus-o text-orange mr-2"></i>
                <h3>SCHEDULE NEW APPOINTMENT</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowCreateModal(false)}>
                <i className="fa fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="admin-modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="admin-field-label">Athlete Full Name *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. Jordan Lee"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="admin-field-label">Email Address *</label>
                    <input
                      type="email"
                      className="admin-form-input"
                      placeholder="athlete@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="admin-field-label">Phone Number *</label>
                    <input
                      type="tel"
                      className="admin-form-input"
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="admin-field-label">Training Program / Service *</label>
                    <select
                      className="admin-form-select"
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    >
                      <option value="Personal Training Assessment">Personal Training Assessment</option>
                      <option value="Modern Equipment">Modern Equipment</option>
                      <option value="Cardio & Weight Loss Circuit">Cardio & Weight Loss Circuit</option>
                      <option value="Power Yoga & Core Flow">Power Yoga & Core Flow</option>
                      <option value="Bodybuilding & Hypertrophy">Bodybuilding & Hypertrophy</option>
                      <option value="CrossFit WOD & Kettlebell Power">CrossFit WOD & Kettlebell Power</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="admin-field-label">Date & Time *</label>
                    <input
                      type="datetime-local"
                      className="admin-form-input"
                      value={formData.scheduled_time}
                      onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="admin-field-label">Facility Location</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div className="col-md-12 mb-3">
                    <label className="admin-field-label">Special Notes / Workout Goals</label>
                    <textarea
                      className="admin-form-textarea"
                      rows="2"
                      placeholder="Notes or preferences..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="col-md-12">
                    <div style={{ display: 'flex', gap: '20px', padding: '8px 0' }}>
                      <label style={{ color: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.send_email}
                          onChange={(e) => setFormData({ ...formData, send_email: e.target.checked })}
                        />
                        Send Brevo Confirmation Email
                      </label>
                      <label style={{ color: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.send_sms}
                          onChange={(e) => setFormData({ ...formData, send_sms: e.target.checked })}
                        />
                        Send Fast2SMS Alert
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <i className="fa fa-spinner fa-spin"></i> Creating & Dispatching...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-calendar-check-o"></i> Book & Dispatch Pass
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Appointment Modal */}
      {showRescheduleModal && selectedBooking && (
        <div className="admin-modal-backdrop" onClick={() => setShowRescheduleModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="admin-modal-header">
              <div className="modal-title-wrap">
                <i className="fa fa-calendar text-blue mr-2"></i>
                <h3>RESCHEDULE APPOINTMENT #{selectedBooking.ref_id}</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowRescheduleModal(false)}>
                <i className="fa fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit}>
              <div className="admin-modal-body">
                <div className="session-summary-box mb-3">
                  <div className="summary-row">
                    <span>Athlete:</span>
                    <strong>{selectedBooking.name}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Current Slot:</span>
                    <strong>{selectedBooking.display_time || selectedBooking.scheduled_time}</strong>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="admin-field-label">Select New Date & Time *</label>
                  <input
                    type="datetime-local"
                    className="admin-form-input"
                    value={rescheduleData.scheduled_time}
                    onChange={(e) => setRescheduleData({ scheduled_time: e.target.value })}
                    required
                  />
                  <small style={{ color: '#a4a4ab', display: 'block', marginTop: '6px', fontSize: '12px' }}>
                    Reschedule notices will be automatically dispatched via Brevo Email & Fast2SMS.
                  </small>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn outline"
                  onClick={() => setShowRescheduleModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <i className="fa fa-spinner fa-spin"></i> Updating & Dispatching...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-calendar-check-o"></i> Confirm & Notify Athlete
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Appointment Modal */}
      {showCancelModal && selectedBooking && (
        <div className="admin-modal-backdrop" onClick={() => setShowCancelModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="admin-modal-header">
              <div className="modal-title-wrap">
                <i className="fa fa-ban text-danger mr-2"></i>
                <h3>CANCEL APPOINTMENT #{selectedBooking.ref_id}</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowCancelModal(false)}>
                <i className="fa fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleCancelSubmit}>
              <div className="admin-modal-body">
                <div className="session-summary-box mb-3">
                  <div className="summary-row">
                    <span>Athlete:</span>
                    <strong>{selectedBooking.name}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Program:</span>
                    <strong>{selectedBooking.service}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Scheduled Time:</span>
                    <strong>{selectedBooking.display_time || selectedBooking.scheduled_time}</strong>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="admin-field-label">Cancellation Reason (Sent to Athlete)</label>
                  <textarea
                    className="admin-form-textarea"
                    rows="3"
                    placeholder="e.g. Facility maintenance, coaching staff conflict, or requested by member..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn outline"
                  onClick={() => setShowCancelModal(false)}
                >
                  Keep Appointment
                </button>
                <button
                  type="submit"
                  className="admin-btn danger"
                  style={{ background: '#ff4757', borderColor: '#ff4757', color: '#fff' }}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <i className="fa fa-spinner fa-spin"></i> Cancelling & Notifying...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-ban"></i> Cancel & Send Notification
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <ConfirmModal
          isOpen={true}
          title="Delete Appointment"
          message="Are you sure you want to delete this appointment booking? This action cannot be undone."
          confirmText="Delete Booking"
          confirmType="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
};


export default AdminAppointments;
