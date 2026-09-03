import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import DataTable from '../../components/admin/DataTable';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { useToast } from '../../context/ToastContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AdminTimetable = () => {
  const { showSuccess, showError } = useToast();
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('grid'); // 'grid' | 'table'
  const [selectedDayFilter, setSelectedDayFilter] = useState('ALL');

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [conflictError, setConflictError] = useState('');

  const [formData, setFormData] = useState({
    class_id: '',
    trainer_id: '',
    day_of_week: 'Monday',
    start_time: '06:00',
    end_time: '08:00',
    room: 'Main Gym Studio',
    capacity: 25,
    status: 'ACTIVE'
  });

  useEffect(() => {
    loadData();
  }, [selectedDayFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedDayFilter !== 'ALL') params.day = selectedDayFilter;

      const [schedRes, clsRes, trnRes] = await Promise.all([
        api.adminGetTimetable(params),
        api.adminGetClasses(),
        api.adminGetTrainers()
      ]);

      if (schedRes && schedRes.status === 'success') {
        setSchedules(schedRes.data || []);
      }
      if (clsRes && clsRes.status === 'success') {
        setClasses(clsRes.data || []);
      }
      if (trnRes && trnRes.status === 'success') {
        setTrainers(trnRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching timetable data:', err);
      showError('Failed to load timetable schedules.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = (defaultDay = 'Monday') => {
    setConflictError('');
    setModalMode('add');
    setSelectedSchedule(null);
    setFormData({
      class_id: classes[0]?.id || '',
      trainer_id: trainers[0]?.id || '',
      day_of_week: defaultDay,
      start_time: '06:00',
      end_time: '08:00',
      room: 'Strength Studio A',
      capacity: 25,
      status: 'ACTIVE'
    });
    setShowModal(true);
  };

  const openEditModal = (s) => {
    setConflictError('');
    setModalMode('edit');
    setSelectedSchedule(s);
    setFormData({
      class_id: s.class_id || '',
      trainer_id: s.trainer_id || '',
      day_of_week: s.day_of_week || 'Monday',
      start_time: s.start_time || '06:00',
      end_time: s.end_time || '08:00',
      room: s.room || 'Main Gym Studio',
      capacity: s.capacity || 25,
      status: s.status || 'ACTIVE'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setConflictError('');

    if (!formData.class_id || !formData.trainer_id || !formData.day_of_week || !formData.start_time || !formData.end_time) {
      setConflictError('Please fill in all required schedule fields.');
      return;
    }

    setSaving(true);
    try {
      if (modalMode === 'add') {
        await api.adminCreateTimetable(formData);
        showSuccess('Schedule slot added! Public Timetable page updated.');
      } else {
        await api.adminUpdateTimetable(selectedSchedule.id, formData);
        showSuccess('Schedule slot updated successfully!');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setConflictError(err.message || 'Scheduling conflict detected.');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (s) => {
    setScheduleToDelete(s);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!scheduleToDelete) return;
    setSaving(true);
    try {
      await api.adminDeleteTimetable(scheduleToDelete.id);
      showSuccess('Schedule slot removed from timetable.');
      setShowDeleteModal(false);
      loadData();
    } catch (err) {
      showError(err.message || 'Error removing schedule slot.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'Day',
      key: 'day_of_week',
      sortable: true,
      render: (val) => <span className="day-badge-chip">{val}</span>
    },
    {
      header: 'Time Slot',
      key: 'time_display',
      sortable: true,
      render: (val) => (
        <span className="time-display-pill">
          <i className="fa fa-clock-o"></i> {val}
        </span>
      )
    },
    {
      header: 'Class',
      key: 'class_name',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="table-main-text">{val}</span>
          <span className="table-sub-text">{row.category}</span>
        </div>
      )
    },
    {
      header: 'Coach',
      key: 'trainer_name',
      sortable: true,
      render: (val) => <span className="coach-tag">{val}</span>
    },
    {
      header: 'Room & Location',
      key: 'room',
      sortable: true
    },
    {
      header: 'Capacity',
      key: 'capacity',
      sortable: true,
      render: (val) => `${val} Spots`
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (val) => <span className={`status-badge-pill ${val.toLowerCase()}`}>{val}</span>
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, row) => (
        <div className="table-actions-row">
          <button 
            type="button" 
            className="action-icon-btn edit" 
            title="Edit Slot"
            onClick={() => openEditModal(row)}
          >
            <i className="fa fa-pencil"></i>
          </button>
          <button 
            type="button" 
            className="action-icon-btn delete" 
            title="Delete Slot"
            onClick={() => openDeleteModal(row)}
          >
            <i className="fa fa-trash-o"></i>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="admin-module-page">
      <div className="module-top-header">
        <div>
          <h2 className="module-title">CLASS TIMETABLE & WEEKLY SCHEDULES</h2>
          <p className="module-subtitle">Assign classes and coaches to weekly time slots with automatic overlap conflict prevention.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="view-mode-toggle">
            <button 
              type="button" 
              className={`toggle-tab-btn ${activeTab === 'grid' ? 'active' : ''}`}
              onClick={() => setActiveTab('grid')}
            >
              <i className="fa fa-th-large"></i> Weekly Grid
            </button>
            <button 
              type="button" 
              className={`toggle-tab-btn ${activeTab === 'table' ? 'active' : ''}`}
              onClick={() => setActiveTab('table')}
            >
              <i className="fa fa-list"></i> Table View
            </button>
          </div>
          <button type="button" onClick={() => openAddModal()} className="admin-btn primary">
            <i className="fa fa-calendar-plus-o"></i> Add Schedule Slot
          </button>
        </div>
      </div>

      {/* Grid View */}
      {activeTab === 'grid' && (
        <div className="timetable-weekly-grid-container">
          {DAYS.map((day) => {
            const daySchedules = schedules.filter((s) => s.day_of_week === day);
            return (
              <div key={day} className="timetable-day-column">
                <div className="day-column-header">
                  <h3>{day.toUpperCase()}</h3>
                  <span className="day-slots-count">{daySchedules.length} Sessions</span>
                  <button 
                    type="button" 
                    className="add-slot-micro-btn"
                    title={`Add session on ${day}`}
                    onClick={() => openAddModal(day)}
                  >
                    <i className="fa fa-plus"></i>
                  </button>
                </div>

                <div className="day-column-body">
                  {daySchedules.length === 0 ? (
                    <div className="day-empty-slot">
                      <p>No classes scheduled</p>
                    </div>
                  ) : (
                    daySchedules.map((slot) => (
                      <div key={slot.id} className="timetable-slot-card" onClick={() => openEditModal(slot)}>
                        <div className="slot-time-row">
                          <span className="slot-time">
                            <i className="fa fa-clock-o"></i> {slot.time_display}
                          </span>
                          <button 
                            type="button" 
                            className="slot-delete-btn"
                            onClick={(e) => { e.stopPropagation(); openDeleteModal(slot); }}
                            title="Delete slot"
                          >
                            <i className="fa fa-times"></i>
                          </button>
                        </div>
                        <h4 className="slot-class-title">{slot.class_name}</h4>
                        <div className="slot-meta-row">
                          <span className="slot-coach">
                            <i className="fa fa-user"></i> {slot.trainer_name}
                          </span>
                          <span className="slot-room">{slot.room}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabular View */}
      {activeTab === 'table' && (
        <DataTable
          columns={columns}
          data={schedules}
          loading={loading}
          searchPlaceholder="Search timetable by class, coach, or room..."
          filterOptions={[
            { label: 'All Days', value: 'ALL' },
            ...DAYS.map(d => ({ label: d, value: d }))
          ]}
          currentFilter={selectedDayFilter}
          onFilterChange={setSelectedDayFilter}
          filterLabel="Day of Week"
          defaultSortField="day_of_week"
          emptyMessage="No schedules found matching criteria."
        />
      )}

      {/* Add / Edit Schedule Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 className="modal-title">{modalMode === 'add' ? 'ADD SCHEDULE SLOT' : 'EDIT SCHEDULE SLOT'}</h3>
                <p className="modal-subtitle">Conflict validator ensures coaches and rooms don't overlap.</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowModal(false)}>
                <i className="fa fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                {conflictError && (
                  <div className="admin-alert-box error" style={{ marginBottom: '16px' }}>
                    <i className="fa fa-exclamation-triangle"></i>
                    <span>{conflictError}</span>
                  </div>
                )}

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="admin-form-label">Select Class *</label>
                    <select
                      className="admin-form-input"
                      value={formData.class_id}
                      onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                      required
                    >
                      <option value="">-- Select Class --</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Assigned Coach *</label>
                    <select
                      className="admin-form-input"
                      value={formData.trainer_id}
                      onChange={(e) => setFormData({ ...formData, trainer_id: e.target.value })}
                      required
                    >
                      <option value="">-- Select Coach --</option>
                      {trainers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Day of Week *</label>
                    <select
                      className="admin-form-input"
                      value={formData.day_of_week}
                      onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                      required
                    >
                      {DAYS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Studio / Room Location</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.room}
                      onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                      placeholder="e.g. Strength Studio A"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Start Time (24h or 12h) *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      placeholder="e.g. 06:00 or 6.00am"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">End Time (24h or 12h) *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      placeholder="e.g. 08:00 or 8.00am"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Session Capacity</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="admin-form-input"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Status</label>
                    <select
                      className="admin-form-input"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn primary" disabled={saving}>
                  {saving ? 'Validating...' : modalMode === 'add' ? 'Save Schedule' : 'Update Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Remove Timetable Slot"
        message={`Are you sure you want to remove ${scheduleToDelete?.class_name} (${scheduleToDelete?.day_of_week} ${scheduleToDelete?.time_display}) from the public timetable?`}
        confirmText="Remove Slot"
        loading={saving}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default AdminTimetable;
