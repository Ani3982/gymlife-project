import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import DataTable from '../../components/admin/DataTable';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { useToast } from '../../context/ToastContext';

const AdminClasses = () => {
  const { showSuccess, showError } = useToast();
  const [classes, setClasses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedClass, setSelectedClass] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'STRENGTH',
    trainer_id: '',
    duration: '60 mins',
    capacity: 25,
    difficulty: 'All Levels',
    price: 0.0,
    status: 'ACTIVE',
    image_url: '/img/classes/class-1.jpg',
    order: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [clsRes, trnRes] = await Promise.all([
        api.adminGetClasses(),
        api.adminGetTrainers()
      ]);
      if (clsRes && clsRes.status === 'success') {
        setClasses(clsRes.data || []);
      }
      if (trnRes && trnRes.status === 'success') {
        setTrainers(trnRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
      showError('Failed to load classes.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedClass(null);
    setFormData({
      name: '',
      description: '',
      category: 'STRENGTH',
      trainer_id: trainers[0]?.id || '',
      duration: '60 mins',
      capacity: 25,
      difficulty: 'All Levels',
      price: 25.0,
      status: 'ACTIVE',
      image_url: `/img/classes/class-${(classes.length % 5) + 1}.jpg`,
      order: classes.length + 1
    });
    setShowModal(true);
  };

  const openEditModal = (c) => {
    setModalMode('edit');
    setSelectedClass(c);
    setFormData({
      name: c.name || '',
      description: c.description || '',
      category: c.category || 'STRENGTH',
      trainer_id: c.trainer_id || '',
      duration: c.duration || '60 mins',
      capacity: c.capacity || 25,
      difficulty: c.difficulty || 'All Levels',
      price: c.price || 0.0,
      status: c.status || 'ACTIVE',
      image_url: c.image_url || '/img/classes/class-1.jpg',
      order: c.order || 0
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category) {
      showError('Class name and category are required.');
      return;
    }

    setSaving(true);
    try {
      if (modalMode === 'add') {
        await api.adminCreateClass(formData);
        showSuccess(`Class "${formData.name}" created successfully! Public Classes page updated.`);
      } else {
        await api.adminUpdateClass(selectedClass.id, formData);
        showSuccess(`Class "${formData.name}" updated successfully!`);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      showError(err.message || 'Error saving class.');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (c) => {
    setClassToDelete(c);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!classToDelete) return;
    setSaving(true);
    try {
      await api.adminDeleteClass(classToDelete.id);
      showSuccess(`Class "${classToDelete.name}" deleted successfully.`);
      setShowDeleteModal(false);
      loadData();
    } catch (err) {
      showError(err.message || 'Error deleting class.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'Class & Discipline',
      key: 'name',
      sortable: true,
      render: (val, row) => (
        <div className="table-member-cell">
          <img 
            src={row.image_url || '/img/classes/class-1.jpg'} 
            alt={val} 
            className="table-avatar"
          />
          <div>
            <span className="table-main-text">{val}</span>
            <span className="table-sub-text">{row.category} • {row.duration}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Assigned Coach',
      key: 'trainer_name',
      sortable: true,
      render: (val) => (
        <span className="coach-tag">{val || 'Unassigned'}</span>
      )
    },
    {
      header: 'Difficulty',
      key: 'difficulty',
      sortable: true,
      render: (val) => <span className="difficulty-tag">{val}</span>
    },
    {
      header: 'Capacity',
      key: 'capacity',
      sortable: true,
      render: (val) => `${val} Members`
    },
    {
      header: 'Drop-In Price',
      key: 'price',
      sortable: true,
      render: (val) => `$${parseFloat(val || 0).toFixed(2)}`
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (val) => (
        <span className={`status-badge-pill ${val.toLowerCase()}`}>{val}</span>
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
            title="Edit Class"
            onClick={() => openEditModal(row)}
          >
            <i className="fa fa-pencil"></i>
          </button>
          <button 
            type="button" 
            className="action-icon-btn delete" 
            title="Delete Class"
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
          <h2 className="module-title">CLASSES & DISCIPLINES</h2>
          <p className="module-subtitle">Manage group training sessions, discipline categories, and coach assignments.</p>
        </div>
        <button type="button" onClick={openAddModal} className="admin-btn primary">
          <i className="fa fa-plus-circle"></i> Add New Class
        </button>
      </div>

      <DataTable
        columns={columns}
        data={classes}
        loading={loading}
        searchPlaceholder="Search classes by name, category, or coach..."
        defaultSortField="name"
        emptyMessage="No classes found."
      />

      {/* Add / Edit Class Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal-dialog modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 className="modal-title">{modalMode === 'add' ? 'ADD NEW CLASS' : 'EDIT CLASS'}</h3>
                <p className="modal-subtitle">Class details sync automatically with the public website.</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowModal(false)}>
                <i className="fa fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="admin-form-label">Class Name *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Heavyweight Strength Training"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Category *</label>
                    <select
                      className="admin-form-input"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="STRENGTH">STRENGTH TRAINING</option>
                      <option value="CARDIO">CARDIO & HIIT</option>
                      <option value="YOGA">YOGA & MOBILITY</option>
                      <option value="BOXING">BOXING & COMBAT</option>
                      <option value="CROSSFIT">CROSSFIT & FUNCTIONAL</option>
                      <option value="ZUMBA">ZUMBA & DANCE</option>
                      <option value="PILATES">PILATES CORE</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Lead Coach / Trainer</label>
                    <select
                      className="admin-form-input"
                      value={formData.trainer_id}
                      onChange={(e) => setFormData({ ...formData, trainer_id: e.target.value })}
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
                    <label className="admin-form-label">Duration</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g. 60 mins"
                    />
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Difficulty Level</label>
                    <select
                      className="admin-form-input"
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    >
                      <option value="All Levels">All Levels</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Max Class Capacity</label>
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
                    <label className="admin-form-label">Drop-in Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="admin-form-input"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Image URL</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="/img/classes/class-1.jpg"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label className="admin-form-label">Class Description & Workout Overview</label>
                  <textarea
                    className="admin-form-input"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the training structure, target muscle groups, and required gear..."
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn primary" disabled={saving}>
                  {saving ? 'Saving...' : modalMode === 'add' ? 'Create Class' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Class"
        message={`Are you sure you want to delete class "${classToDelete?.name}"?`}
        warning="If this class is currently scheduled in the weekly timetable, you must delete or reassign those timetable slots first."
        confirmText="Delete Class"
        loading={saving}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default AdminClasses;
