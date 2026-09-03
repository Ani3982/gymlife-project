import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import DataTable from '../../components/admin/DataTable';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { useToast } from '../../context/ToastContext';

const AdminTrainers = () => {
  const { showSuccess, showError } = useToast();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [trainerToDelete, setTrainerToDelete] = useState(null);
  const [deleteWarning, setDeleteWarning] = useState('');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    specialization: 'Fitness & Strength',
    experience_years: 4,
    qualification: 'Certified Personal Trainer (CPT)',
    bio: '',
    availability: 'Mon - Sat (07:00 - 19:00)',
    status: 'ACTIVE',
    image_url: '/img/team/team-1.jpg',
    facebook_url: 'https://facebook.com',
    twitter_url: 'https://twitter.com',
    instagram_url: 'https://instagram.com',
    youtube_url: 'https://youtube.com',
    order: 0
  });

  useEffect(() => {
    loadTrainers();
  }, []);

  const loadTrainers = async () => {
    setLoading(true);
    try {
      const res = await api.adminGetTrainers();
      if (res && res.status === 'success') {
        setTrainers(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching trainers:', err);
      showError('Failed to load trainers.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedTrainer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: '',
      specialization: 'Powerlifting & Hypertrophy',
      experience_years: 4,
      qualification: 'NSCA-CPT / CSCS Certified',
      bio: '',
      availability: 'Mon - Sat (07:00 - 19:00)',
      status: 'ACTIVE',
      image_url: `/img/team/team-${(trainers.length % 4) + 1}.jpg`,
      facebook_url: 'https://facebook.com',
      twitter_url: 'https://twitter.com',
      instagram_url: 'https://instagram.com',
      youtube_url: 'https://youtube.com',
      order: trainers.length + 1
    });
    setShowModal(true);
  };

  const openEditModal = (trainer) => {
    setModalMode('edit');
    setSelectedTrainer(trainer);
    setFormData({
      name: trainer.name || '',
      email: trainer.email || '',
      phone: trainer.phone || '',
      role: trainer.role || '',
      specialization: trainer.specialization || '',
      experience_years: trainer.experience_years || 3,
      qualification: trainer.qualification || '',
      bio: trainer.bio || '',
      availability: trainer.availability || '',
      status: trainer.status || 'ACTIVE',
      image_url: trainer.image_url || '/img/team/team-1.jpg',
      facebook_url: trainer.facebook_url || '',
      twitter_url: trainer.twitter_url || '',
      instagram_url: trainer.instagram_url || '',
      youtube_url: trainer.youtube_url || '',
      order: trainer.order || 0
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.role) {
      showError('Trainer Name and Role are required.');
      return;
    }

    setSaving(true);
    try {
      if (modalMode === 'add') {
        await api.adminCreateTrainer(formData);
        showSuccess(`Trainer ${formData.name} added successfully! Public Team page updated.`);
      } else {
        await api.adminUpdateTrainer(selectedTrainer.id, formData);
        showSuccess(`Trainer ${formData.name} updated successfully!`);
      }
      setShowModal(false);
      loadTrainers();
    } catch (err) {
      showError(err.message || 'Error saving trainer.');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (trainer) => {
    setTrainerToDelete(trainer);
    setDeleteWarning('If this trainer is assigned to active classes or timetable slots, the system will prevent deletion to preserve schedules.');
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!trainerToDelete) return;
    setSaving(true);
    try {
      await api.adminDeleteTrainer(trainerToDelete.id);
      showSuccess(`Trainer ${trainerToDelete.name} was removed.`);
      setShowDeleteModal(false);
      loadTrainers();
    } catch (err) {
      showError(err.message || 'Error deleting trainer.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (trainer) => {
    const nextStatus = trainer.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.adminUpdateTrainer(trainer.id, { status: nextStatus });
      showSuccess(`Coach ${trainer.name} set to ${nextStatus}`);
      loadTrainers();
    } catch (err) {
      showError('Failed to change trainer status');
    }
  };

  const columns = [
    {
      header: 'Trainer',
      key: 'name',
      sortable: true,
      render: (val, row) => (
        <div className="table-member-cell">
          <img 
            src={row.image_url || '/img/team/team-1.jpg'} 
            alt={val} 
            className="table-avatar"
          />
          <div>
            <span className="table-main-text">{val}</span>
            <span className="table-sub-text">{row.role}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Specialization',
      key: 'specialization',
      sortable: true
    },
    {
      header: 'Experience',
      key: 'experience_years',
      sortable: true,
      render: (val) => `${val} Years`
    },
    {
      header: 'Contact',
      key: 'phone',
      render: (_, row) => (
        <div>
          <span className="table-main-text">{row.phone || '-'}</span>
          <span className="table-sub-text">{row.email || '-'}</span>
        </div>
      )
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (val, row) => (
        <button 
          type="button"
          onClick={() => toggleStatus(row)}
          className={`status-badge-pill ${val.toLowerCase()} clickable`}
          title="Click to toggle status"
        >
          {val}
        </button>
      )
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
            title="Edit Coach"
            onClick={() => openEditModal(row)}
          >
            <i className="fa fa-pencil"></i>
          </button>
          <button 
            type="button" 
            className="action-icon-btn delete" 
            title="Delete Coach"
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
          <h2 className="module-title">COACHING STAFF & TRAINERS</h2>
          <p className="module-subtitle">Manage personal trainers, credentials, bios, and active coaching rosters.</p>
        </div>
        <button type="button" onClick={openAddModal} className="admin-btn primary">
          <i className="fa fa-user-plus"></i> Add New Trainer
        </button>
      </div>

      <DataTable
        columns={columns}
        data={trainers}
        loading={loading}
        searchPlaceholder="Search trainers by name, specialization, or role..."
        defaultSortField="name"
        emptyMessage="No trainers found."
      />

      {/* Add / Edit Trainer Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal-dialog modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 className="modal-title">{modalMode === 'add' ? 'ADD NEW TRAINER' : 'EDIT TRAINER PROFILE'}</h3>
                <p className="modal-subtitle">Updates reflect dynamically across the public website.</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowModal(false)}>
                <i className="fa fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="admin-form-label">Full Name *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Smith"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Role / Title *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g. Head Strength Coach"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Email Address</label>
                    <input
                      type="email"
                      className="admin-form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="coach@gymlife.com"
                    />
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Phone Number</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 019-2834"
                    />
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Specialization</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      placeholder="e.g. Powerlifting, Hypertrophy & Biomechanics"
                    />
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Years of Experience</label>
                    <input
                      type="number"
                      min="0"
                      max="40"
                      className="admin-form-input"
                      value={formData.experience_years}
                      onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Qualifications & Certifications</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      placeholder="e.g. CSCS, NSCA-CPT, USAW Level 2"
                    />
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Availability Schedule</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                      placeholder="Mon - Sat (07:00 - 19:00)"
                    />
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Status</label>
                    <select
                      className="admin-form-input"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="ACTIVE">ACTIVE (Visible on Website)</option>
                      <option value="INACTIVE">INACTIVE (Hidden)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Profile Image URL</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="/img/team/team-1.jpg"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label className="admin-form-label">Coach Biography</label>
                  <textarea
                    className="admin-form-input"
                    rows="3"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Short summary of background, athletic achievements, and coaching philosophy..."
                  />
                </div>

                <div className="form-grid-2" style={{ marginTop: '12px' }}>
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
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn primary" disabled={saving}>
                  {saving ? 'Saving...' : modalMode === 'add' ? 'Add Trainer' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Trainer"
        message={`Are you sure you want to delete Coach "${trainerToDelete?.name}"?`}
        warning={deleteWarning}
        confirmText="Delete Coach"
        loading={saving}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default AdminTrainers;
