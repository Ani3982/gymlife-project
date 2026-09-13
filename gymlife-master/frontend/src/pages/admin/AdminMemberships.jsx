import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import DataTable from '../../components/admin/DataTable';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { useToast } from '../../context/ToastContext';

const AdminMemberships = () => {
  const { showSuccess, showError } = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    price: 499.0,
    period: 'SINGLE PASS',
    description: '',
    features: 'Full gym floor access, Locker & steam room, 1 group class included',
    status: 'ACTIVE',
    max_members: 500,
    order: 1
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await api.adminGetPlans();
      if (res && res.status === 'success') {
        setPlans(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      showError('Failed to load membership plans.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedPlan(null);
    setFormData({
      name: '',
      price: 4999.0,
      period: '3 MONTHS ACCESS',
      description: 'Comprehensive fitness pass with group coaching.',
      features: 'Full gym access, Locker amenities, Group HIIT classes, Free guest pass',
      status: 'ACTIVE',
      max_members: 300,
      order: plans.length + 1
    });
    setShowModal(true);
  };

  const openEditModal = (plan) => {
    setModalMode('edit');
    setSelectedPlan(plan);
    setFormData({
      name: plan.name || '',
      price: parseFloat(plan.price) || 0.0,
      period: plan.period || '',
      description: plan.description || '',
      features: plan.features_raw || (Array.isArray(plan.features) ? plan.features.join(', ') : ''),
      status: plan.status || 'ACTIVE',
      max_members: plan.max_members || 500,
      order: plan.order || 0
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.period || formData.price < 0) {
      showError('Plan name, billing period, and valid price are required.');
      return;
    }

    setSaving(true);
    try {
      if (modalMode === 'add') {
        await api.adminCreatePlan(formData);
        showSuccess(`Plan "${formData.name}" created! Public membership cards updated.`);
      } else {
        await api.adminUpdatePlan(selectedPlan.id, formData);
        showSuccess(`Plan "${formData.name}" updated successfully!`);
      }
      setShowModal(false);
      loadPlans();
    } catch (err) {
      showError(err.message || 'Error saving membership plan.');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (plan) => {
    setPlanToDelete(plan);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    setSaving(true);
    try {
      await api.adminDeletePlan(planToDelete.id);
      showSuccess(`Plan "${planToDelete.name}" deleted.`);
      setShowDeleteModal(false);
      loadPlans();
    } catch (err) {
      showError(err.message || 'Error deleting plan.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'Plan Name',
      key: 'name',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="table-main-text">{val}</span>
          <span className="table-sub-text">{row.period}</span>
        </div>
      )
    },
    {
      header: 'Price (₹)',
      key: 'price',
      sortable: true,
      render: (val) => (
        <span className="price-tag-highlight">₹{parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
      )
    },
    {
      header: 'Features Included',
      key: 'features',
      render: (val) => (
        <div className="plan-features-preview">
          {Array.isArray(val) ? (
            val.slice(0, 3).map((f, i) => (
              <span key={i} className="feature-mini-pill">✓ {f}</span>
            ))
          ) : '-'}
          {Array.isArray(val) && val.length > 3 && (
            <span className="feature-more-tag">+{val.length - 3} more</span>
          )}
        </div>
      )
    },
    {
      header: 'Max Capacity',
      key: 'max_members',
      sortable: true,
      render: (val) => `${val || 'Unlimited'} Members`
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
            title="Edit Plan"
            onClick={() => openEditModal(row)}
          >
            <i className="fa fa-pencil"></i>
          </button>
          <button 
            type="button" 
            className="action-icon-btn delete" 
            title="Delete Plan"
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
          <h2 className="module-title">MEMBERSHIP TIERS & PRICING PLANS</h2>
          <p className="module-subtitle">Manage subscription pricing, included perks, duration terms, and capacity limits.</p>
        </div>
        <button type="button" onClick={openAddModal} className="admin-btn primary">
          <i className="fa fa-plus-circle"></i> Create New Plan
        </button>
      </div>

      <DataTable
        columns={columns}
        data={plans}
        loading={loading}
        searchPlaceholder="Search plans by name or period..."
        defaultSortField="order"
        emptyMessage="No membership plans configured."
      />

      {/* Add / Edit Plan Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal-dialog modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 className="modal-title">{modalMode === 'add' ? 'CREATE MEMBERSHIP PLAN' : 'EDIT PLAN DETAILS'}</h3>
                <p className="modal-subtitle">Changes will appear immediately on the public website pricing cards.</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowModal(false)}>
                <i className="fa fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="admin-form-label">Plan Name *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. 12 Month VIP Membership"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Billing Period / Duration *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.period}
                      onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                      placeholder="e.g. 12 MONTHS UNLIMITED"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="admin-form-input"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Max Members Cap</label>
                    <input
                      type="number"
                      min="1"
                      max="5000"
                      className="admin-form-input"
                      value={formData.max_members}
                      onChange={(e) => setFormData({ ...formData, max_members: e.target.value })}
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
                    <label className="admin-form-label">Display Order</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label className="admin-form-label">Features & Amenities (Comma-separated) *</label>
                  <textarea
                    className="admin-form-input"
                    rows="3"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    placeholder="Full gym floor access, Locker & steam room, 1 group class included, InBody scan..."
                    required
                  />
                  <span className="input-hint">Separate each benefit with a comma.</span>
                </div>

                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label className="admin-form-label">Short Marketing Description</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g. All-inclusive luxury pass for dedicated fitness enthusiasts."
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn primary" disabled={saving}>
                  {saving ? 'Saving...' : modalMode === 'add' ? 'Publish Plan' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Membership Plan"
        message={`Are you sure you want to delete plan "${planToDelete?.name}"?`}
        warning="If members are currently subscribed to this plan, you should set the status to INACTIVE instead to protect active member records."
        confirmText="Delete Plan"
        loading={saving}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default AdminMemberships;
