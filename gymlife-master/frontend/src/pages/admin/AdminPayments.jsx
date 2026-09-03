import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import DataTable from '../../components/admin/DataTable';
import { useToast } from '../../context/ToastContext';

const AdminPayments = () => {
  const { showSuccess, showError } = useToast();
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    member_id: '',
    plan_id: '',
    amount: 499.0,
    payment_method: 'Credit Card',
    transaction_id: '',
    status: 'PAID',
    notes: ''
  });

  useEffect(() => {
    loadPayments();
    loadAuxData();
  }, [currentFilter]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (currentFilter !== 'ALL') params.status = currentFilter;
      const res = await api.adminGetPayments(params);
      if (res && res.status === 'success') {
        setPayments(res.data || []);
      }
    } catch (err) {
      console.error('Error loading payments:', err);
      showError('Failed to load payments.');
    } finally {
      setLoading(false);
    }
  };

  const loadAuxData = async () => {
    try {
      const [memRes, plnRes] = await Promise.all([
        api.adminGetMembers(),
        api.adminGetPlans()
      ]);
      if (memRes && memRes.status === 'success') setMembers(memRes.data || []);
      if (plnRes && plnRes.status === 'success') setPlans(plnRes.data || []);
    } catch (err) {
      console.error('Error loading aux data:', err);
    }
  };

  const openAddModal = () => {
    const defaultMember = members[0];
    setFormData({
      member_id: defaultMember?.id || '',
      plan_id: defaultMember?.plan_id || plans[0]?.id || '',
      amount: defaultMember?.plan_price ? parseFloat(defaultMember.plan_price) : 499.0,
      payment_method: 'Credit Card',
      transaction_id: `TXN_${Date.now().toString().slice(-6)}`,
      status: 'PAID',
      notes: ''
    });
    setShowModal(true);
  };

  const handleMemberSelect = (e) => {
    const memId = e.target.value;
    const foundMem = members.find(m => String(m.id) === String(memId));
    setFormData(prev => ({
      ...prev,
      member_id: memId,
      plan_id: foundMem?.plan_id || prev.plan_id,
      amount: foundMem?.plan_price ? parseFloat(foundMem.plan_price) : prev.amount
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.member_id || formData.amount <= 0) {
      showError('Please select a member and enter a valid payment amount.');
      return;
    }

    setSaving(true);
    try {
      await api.adminCreatePayment(formData);
      showSuccess('Payment transaction recorded successfully!');
      setShowModal(false);
      loadPayments();
    } catch (err) {
      showError(err.message || 'Error recording payment.');
    } finally {
      setSaving(false);
    }
  };

  const exportCSV = () => {
    if (payments.length === 0) {
      showError('No payment records to export.');
      return;
    }

    const headers = ['Payment ID', 'Member Name', 'Member Email', 'Plan', 'Amount', 'Payment Method', 'Transaction ID', 'Status', 'Date'];
    const rows = payments.map(p => [
      p.payment_id,
      `"${p.member_name}"`,
      p.member_email,
      `"${p.plan_name}"`,
      p.amount,
      p.payment_method,
      p.transaction_id,
      p.status,
      p.payment_date
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GymLife_Payments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('CSV export downloaded successfully!');
  };

  const columns = [
    {
      header: 'Payment Ref',
      key: 'payment_id',
      sortable: true,
      render: (val) => <span className="payment-ref-pill">{val}</span>
    },
    {
      header: 'Member',
      key: 'member_name',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="table-main-text">{val}</span>
          <span className="table-sub-text">{row.member_email}</span>
        </div>
      )
    },
    {
      header: 'Plan / Service',
      key: 'plan_name',
      sortable: true
    },
    {
      header: 'Amount',
      key: 'amount',
      sortable: true,
      render: (val) => (
        <span className="payment-amount-bold">${parseFloat(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      )
    },
    {
      header: 'Method',
      key: 'payment_method',
      sortable: true
    },
    {
      header: 'Transaction ID',
      key: 'transaction_id',
      render: (val) => val || '-'
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (val) => (
        <span className={`payment-status-tag ${val.toLowerCase()}`}>{val}</span>
      )
    },
    {
      header: 'Date & Time',
      key: 'payment_date',
      sortable: true
    }
  ];

  return (
    <div className="admin-module-page">
      <div className="module-top-header">
        <div>
          <h2 className="module-title">PAYMENTS & BILLING LEDGER</h2>
          <p className="module-subtitle">Track membership receipts, drop-in passes, offline billing, and financial logs.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={exportCSV} className="admin-btn secondary">
            <i className="fa fa-download"></i> Export CSV
          </button>
          <button type="button" onClick={openAddModal} className="admin-btn primary">
            <i className="fa fa-money"></i> Record New Payment
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        loading={loading}
        searchPlaceholder="Search by member, payment ID, or transaction code..."
        filterOptions={[
          { label: 'All Statuses', value: 'ALL' },
          { label: 'Paid', value: 'PAID' },
          { label: 'Pending', value: 'PENDING' },
          { label: 'Failed', value: 'FAILED' },
          { label: 'Refunded', value: 'REFUNDED' },
        ]}
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
        filterLabel="Payment Status"
        defaultSortField="payment_date"
        defaultSortAsc={false}
        emptyMessage="No payment transactions logged."
      />

      {/* Record Payment Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 className="modal-title">RECORD NEW PAYMENT</h3>
                <p className="modal-subtitle">Log an in-person, bank, or online payment transaction.</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowModal(false)}>
                <i className="fa fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="form-group">
                  <label className="admin-form-label">Member *</label>
                  <select
                    className="admin-form-input"
                    value={formData.member_id}
                    onChange={handleMemberSelect}
                    required
                  >
                    <option value="">-- Select Member --</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name} ({m.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-grid-2" style={{ marginTop: '12px' }}>
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
                          {p.name} (${p.price})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Amount Paid ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      className="admin-form-input"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Payment Method</label>
                    <select
                      className="admin-form-input"
                      value={formData.payment_method}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    >
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="UPI / Google Pay">UPI / Google Pay</option>
                      <option value="Cash">Cash (Front Desk)</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Online Gateway">Online Gateway</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Payment Status</label>
                    <select
                      className="admin-form-input"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="PAID">PAID</option>
                      <option value="PENDING">PENDING</option>
                      <option value="FAILED">FAILED</option>
                      <option value="REFUNDED">REFUNDED</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label className="admin-form-label">Transaction Reference Code</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.transaction_id}
                    onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                    placeholder="e.g. TXN_991823"
                  />
                </div>

                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label className="admin-form-label">Notes & Billing Comments</label>
                  <textarea
                    className="admin-form-input"
                    rows="2"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Invoice notes, discount codes applied..."
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn primary" disabled={saving}>
                  {saving ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
