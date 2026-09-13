import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import DataTable from '../../components/admin/DataTable';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { useToast } from '../../context/ToastContext';

const AdminMembers = () => {
  const { showSuccess, showError } = useToast();
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState('ALL');

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' | 'edit'
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form inputs
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: 'Male',
    address: '',
    emergency_contact: '',
    profile_photo_url: '/img/team/team-1.jpg',
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    status: 'ACTIVE',
    payment_status: 'PAID',
    notes: ''
  });

  useEffect(() => {
    loadMembers();
    loadPlans();
  }, [currentFilter]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (currentFilter !== 'ALL') params.status = currentFilter;
      const res = await api.adminGetMembers(params);
      if (res && res.status === 'success') {
        setMembers(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
      showError(err.message || 'Failed to load members.');
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      const res = await api.adminGetPlans();
      if (res && res.status === 'success') {
        setPlans(res.data || []);
      }
    } catch (err) {
      console.error('Error loading plans:', err);
    }
  };

  const openAddModal = () => {
    const today = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);

    setFormMode('add');
    setSelectedMember(null);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      date_of_birth: '1995-01-01',
      gender: 'Male',
      address: '',
      emergency_contact: '',
      profile_photo_url: '/img/team/team-1.jpg',
      plan_id: plans[0]?.id || '',
      start_date: today.toISOString().split('T')[0],
      expiry_date: nextYear.toISOString().split('T')[0],
      status: 'ACTIVE',
      payment_status: 'PAID',
      notes: ''
    });
    setShowFormModal(true);
  };

  const openEditModal = (member) => {
    setFormMode('edit');
    setSelectedMember(member);
    setFormData({
      full_name: member.full_name || '',
      email: member.email || '',
      phone: member.phone || '',
      date_of_birth: member.date_of_birth || '',
      gender: member.gender || 'Prefer not to say',
      address: member.address || '',
      emergency_contact: member.emergency_contact || '',
      profile_photo_url: member.profile_photo_url || '/img/team/team-1.jpg',
      plan_id: member.plan_id || '',
      start_date: member.start_date || '',
      expiry_date: member.expiry_date || '',
      status: member.status || 'ACTIVE',
      payment_status: member.payment_status || 'PAID',
      notes: member.notes || ''
    });
    setShowFormModal(true);
  };

  const openDetailModal = async (member) => {
    try {
      const res = await api.adminGetMember(member.id);
      if (res && res.status === 'success') {
        setDetailData(res.data);
        setShowDetailModal(true);
      }
    } catch (err) {
      showError('Unable to load member full details.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.phone) {
      showError('Please fill in required fields: Name, Email, and Phone.');
      return;
    }

    setSaving(true);
    try {
      if (formMode === 'add') {
        await api.adminCreateMember(formData);
        showSuccess(`Member ${formData.full_name} created successfully!`);
      } else {
        await api.adminUpdateMember(selectedMember.id, formData);
        showSuccess(`Member ${formData.full_name} updated successfully!`);
      }
      setShowFormModal(false);
      loadMembers();
    } catch (err) {
      showError(err.message || 'Error saving member details.');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (member) => {
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    setSaving(true);
    try {
      await api.adminDeleteMember(memberToDelete.id);
      showSuccess(`Member ${memberToDelete.full_name} was deleted successfully.`);
      setShowDeleteModal(false);
      loadMembers();
    } catch (err) {
      showError(err.message || 'Error deleting member.');
    } finally {
      setSaving(false);
    }
  };

  const toggleMemberStatus = async (member) => {
    const nextStatus = member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.adminUpdateMember(member.id, { status: nextStatus });
      showSuccess(`Status changed to ${nextStatus}`);
      loadMembers();
    } catch (err) {
      showError('Failed to change status');
    }
  };

  const columns = [
    {
      header: 'Member',
      key: 'full_name',
      sortable: true,
      render: (val, row) => (
        <div className="table-member-cell">
          <img 
            src={row.profile_photo_url || '/img/team/team-1.jpg'} 
            alt={val} 
            className="table-avatar"
          />
          <div>
            <span className="table-main-text">{val}</span>
            <span className="table-sub-text">{row.email}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Phone',
      key: 'phone',
      sortable: true
    },
    {
      header: 'Membership Plan',
      key: 'plan_name',
      sortable: true,
      render: (val, row) => (
        <span className="plan-name-chip">{val}</span>
      )
    },
    {
      header: 'Expiry Date',
      key: 'expiry_date',
      sortable: true,
      render: (val) => val || 'No Expiry'
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (val, row) => (
        <button 
          type="button" 
          onClick={(e) => { e.stopPropagation(); toggleMemberStatus(row); }}
          className={`status-badge-pill ${val.toLowerCase()} clickable`}
          title="Click to toggle status"
        >
          {val}
        </button>
      )
    },
    {
      header: 'Payment',
      key: 'payment_status',
      sortable: true,
      render: (val) => (
        <span className={`payment-status-tag ${val.toLowerCase()}`}>{val}</span>
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
            className="action-icon-btn view" 
            title="View Details"
            onClick={(e) => { e.stopPropagation(); openDetailModal(row); }}
          >
            <i className="fa fa-eye"></i>
          </button>
          <button 
            type="button" 
            className="action-icon-btn edit" 
            title="Edit Member"
            onClick={(e) => { e.stopPropagation(); openEditModal(row); }}
          >
            <i className="fa fa-pencil"></i>
          </button>
          <button 
            type="button" 
            className="action-icon-btn delete" 
            title="Delete Member"
            onClick={(e) => { e.stopPropagation(); openDeleteModal(row); }}
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
          <h2 className="module-title">MEMBERS DIRECTORY</h2>
          <p className="module-subtitle">Manage gym members, membership renewals, and account statuses.</p>
        </div>
        <button type="button" onClick={openAddModal} className="admin-btn primary">
          <i className="fa fa-user-plus"></i> Add New Member
        </button>
      </div>

      <DataTable
        columns={columns}
        data={members}
        loading={loading}
        searchPlaceholder="Search by member name, email, or phone..."
        filterOptions={[
          { label: 'All Statuses', value: 'ALL' },
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Inactive', value: 'INACTIVE' },
          { label: 'Expired', value: 'EXPIRED' },
          { label: 'Suspended', value: 'SUSPENDED' },
        ]}
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
        filterLabel="Filter Status"
        defaultSortField="full_name"
        emptyMessage="No members matching criteria."
        onRowClick={openDetailModal}
      />

      {/* Add / Edit Member Modal */}
      {showFormModal && (
        <div className="admin-modal-overlay" onClick={() => setShowFormModal(false)}>
          <div className="admin-modal-dialog modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 className="modal-title">{formMode === 'add' ? 'ADD NEW MEMBER' : 'EDIT MEMBER DETAILS'}</h3>
                <p className="modal-subtitle">Ensure contact & membership dates are accurate.</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowFormModal(false)}>
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
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="e.g. Alex Rivers"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Email Address *</label>
                    <input
                      type="email"
                      className="admin-form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="member@gymlife.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Phone Number *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 019-2834"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="admin-form-input"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Gender</label>
                    <select
                      className="admin-form-input"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Emergency Contact</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.emergency_contact}
                      onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                      placeholder="Name & Phone Number"
                    />
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Membership Plan</label>
                    <select
                      className="admin-form-input"
                      value={formData.plan_id}
                      onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                    >
                      <option value="">-- Select Plan --</option>
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (₹{Number(p.price).toLocaleString('en-IN')})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Membership Status</label>
                    <select
                      className="admin-form-input"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="EXPIRED">EXPIRED</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Start Date</label>
                    <input
                      type="date"
                      className="admin-form-input"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Expiry Date</label>
                    <input
                      type="date"
                      className="admin-form-input"
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label className="admin-form-label">Residential Address</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street, City, Postal Code"
                  />
                </div>

                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label className="admin-form-label">Coaching & Medical Notes</label>
                  <textarea
                    className="admin-form-input"
                    rows="3"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Injuries, preferences, locker assignments..."
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn secondary" onClick={() => setShowFormModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn primary" disabled={saving}>
                  {saving ? 'Saving...' : formMode === 'add' ? 'Create Member' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Details Modal */}
      {showDetailModal && detailData && (
        <div className="admin-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="admin-modal-dialog modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img 
                  src={detailData.profile_photo_url || '/img/team/team-1.jpg'} 
                  alt={detailData.full_name} 
                  className="modal-member-avatar"
                />
                <div>
                  <h3 className="modal-title">{detailData.full_name}</h3>
                  <p className="modal-subtitle">{detailData.email} • {detailData.phone}</p>
                </div>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowDetailModal(false)}>
                <i className="fa fa-times"></i>
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="details-card-grid">
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className={`status-badge-pill ${detailData.status.toLowerCase()}`}>{detailData.status}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Plan</span>
                  <span className="detail-val">{detailData.plan_name} (₹{Number(detailData.plan_price || 0).toLocaleString('en-IN')})</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Joined On</span>
                  <span className="detail-val">{detailData.join_date}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Membership Expiry</span>
                  <span className="detail-val">{detailData.expiry_date || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Gender / DOB</span>
                  <span className="detail-val">{detailData.gender} • {detailData.date_of_birth || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Emergency Contact</span>
                  <span className="detail-val">{detailData.emergency_contact || 'None Listed'}</span>
                </div>
              </div>

              {detailData.address && (
                <div className="detail-full-row">
                  <span className="detail-label">Address:</span>
                  <span className="detail-val">{detailData.address}</span>
                </div>
              )}

              {detailData.notes && (
                <div className="detail-full-row">
                  <span className="detail-label">Notes:</span>
                  <p className="detail-notes-box">{detailData.notes}</p>
                </div>
              )}

              {/* Payment History */}
              <div className="detail-payments-section">
                <h4 className="section-mini-heading">PAYMENT & BILLING HISTORY</h4>
                {detailData.payments && detailData.payments.length > 0 ? (
                  <div className="detail-payments-table-wrap">
                    <table className="mini-table">
                      <thead>
                        <tr>
                          <th>Payment Ref</th>
                          <th>Amount</th>
                          <th>Method</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailData.payments.map((pay) => (
                          <tr key={pay.id}>
                            <td>{pay.payment_id}</td>
                            <td>₹{Number(pay.amount || 0).toLocaleString('en-IN')}</td>
                            <td>{pay.payment_method}</td>
                            <td>{pay.payment_date}</td>
                            <td><span className={`payment-status-tag ${pay.status.toLowerCase()}`}>{pay.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted" style={{ fontSize: '13px', marginTop: '6px' }}>No recorded billing transactions for this member.</p>
                )}
              </div>
            </div>

            <div className="admin-modal-footer">
              <button 
                type="button" 
                className="admin-btn primary"
                onClick={() => {
                  setShowDetailModal(false);
                  openEditModal(detailData);
                }}
              >
                <i className="fa fa-pencil"></i> Edit Member Profile
              </button>
              <button type="button" className="admin-btn secondary" onClick={() => setShowDetailModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Member Account"
        message={`Are you sure you want to permanently remove member "${memberToDelete?.full_name}"?`}
        warning="All active subscriptions and associated payment histories will be permanently removed."
        confirmText="Delete Member"
        loading={saving}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default AdminMembers;
