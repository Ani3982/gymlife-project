import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import DataTable from '../../components/admin/DataTable';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { useToast } from '../../context/ToastContext';

const AdminMessages = () => {
  const { showSuccess, showError } = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState('ALL');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMessages();
  }, [currentFilter]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const params = {};
      if (currentFilter !== 'ALL') params.status = currentFilter;
      const res = await api.adminGetMessages(params);
      if (res && res.status === 'success') {
        setMessages(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      showError('Failed to load enquiries.');
    } finally {
      setLoading(false);
    }
  };

  const openMessageDetail = async (msg) => {
    setSelectedMessage(msg);
    setShowDetailModal(true);

    // Auto mark as READ if NEW
    if (msg.status === 'NEW') {
      try {
        await api.adminUpdateMessage(msg.id, { status: 'READ' });
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'READ' } : m));
      } catch {
        // silent
      }
    }
  };

  const updateMessageStatus = async (msgId, status) => {
    try {
      await api.adminUpdateMessage(msgId, { status });
      showSuccess(`Enquiry marked as ${status}`);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status } : m));
      if (selectedMessage && selectedMessage.id === msgId) {
        setSelectedMessage(prev => ({ ...prev, status }));
      }
    } catch (err) {
      showError('Failed to update enquiry status.');
    }
  };

  const openDeleteModal = (msg) => {
    setMessageToDelete(msg);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!messageToDelete) return;
    setSaving(true);
    try {
      await api.adminDeleteMessage(messageToDelete.id);
      showSuccess('Enquiry deleted successfully.');
      setShowDeleteModal(false);
      setShowDetailModal(false);
      loadMessages();
    } catch (err) {
      showError(err.message || 'Error deleting enquiry.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'Sender Name',
      key: 'name',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className={`table-main-text ${row.status === 'NEW' ? 'fw-bold text-white' : ''}`}>{val}</span>
          <span className="table-sub-text">{row.email} {row.phone ? `• ${row.phone}` : ''}</span>
        </div>
      )
    },
    {
      header: 'Subject & Inquiry',
      key: 'subject',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="table-main-text">{val}</span>
          <span className="table-sub-text preview-line">{row.message.slice(0, 70)}...</span>
        </div>
      )
    },
    {
      header: 'Submitted Date',
      key: 'submitted_at',
      sortable: true
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
            className="action-icon-btn view" 
            title="Read Message"
            onClick={(e) => { e.stopPropagation(); openMessageDetail(row); }}
          >
            <i className="fa fa-envelope-open-o"></i>
          </button>
          <button 
            type="button" 
            className="action-icon-btn delete" 
            title="Delete Message"
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
          <h2 className="module-title">CONTACT MESSAGES & ENQUIRIES INBOX</h2>
          <p className="module-subtitle">Review prospective member questions, corporate enquiries, and customer requests.</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={messages}
        loading={loading}
        searchPlaceholder="Search enquiries by name, email, subject, or content..."
        filterOptions={[
          { label: 'All Enquiries', value: 'ALL' },
          { label: 'New / Unread', value: 'NEW' },
          { label: 'Read', value: 'READ' },
          { label: 'Replied', value: 'REPLIED' },
          { label: 'Archived', value: 'ARCHIVED' },
        ]}
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
        filterLabel="Message Status"
        defaultSortField="submitted_at"
        defaultSortAsc={false}
        emptyMessage="Inbox is empty."
        onRowClick={openMessageDetail}
      />

      {/* Message Detail Modal */}
      {showDetailModal && selectedMessage && (
        <div className="admin-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="admin-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 className="modal-title">{selectedMessage.subject}</h3>
                <p className="modal-subtitle">Submitted by {selectedMessage.name} on {selectedMessage.submitted_at}</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowDetailModal(false)}>
                <i className="fa fa-times"></i>
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="message-sender-card">
                <div className="sender-meta-row">
                  <span><strong>Sender:</strong> {selectedMessage.name}</span>
                  <span><strong>Email:</strong> <a href={`mailto:${selectedMessage.email}`} style={{ color: '#f36100' }}>{selectedMessage.email}</a></span>
                </div>
                {selectedMessage.phone && (
                  <div className="sender-meta-row" style={{ marginTop: '6px' }}>
                    <span><strong>Phone:</strong> {selectedMessage.phone}</span>
                    {selectedMessage.website && <span><strong>Website:</strong> {selectedMessage.website}</span>}
                  </div>
                )}
              </div>

              <div className="message-content-box">
                <span className="msg-content-label">Message Content:</span>
                <p className="msg-content-text">{selectedMessage.message}</p>
              </div>

              <div className="message-status-actions">
                <span className="action-tag-label">Update Status:</span>
                <div className="status-button-group">
                  <button 
                    type="button" 
                    className={`status-chip-btn ${selectedMessage.status === 'NEW' ? 'active' : ''}`}
                    onClick={() => updateMessageStatus(selectedMessage.id, 'NEW')}
                  >
                    NEW
                  </button>
                  <button 
                    type="button" 
                    className={`status-chip-btn ${selectedMessage.status === 'READ' ? 'active' : ''}`}
                    onClick={() => updateMessageStatus(selectedMessage.id, 'READ')}
                  >
                    READ
                  </button>
                  <button 
                    type="button" 
                    className={`status-chip-btn ${selectedMessage.status === 'REPLIED' ? 'active' : ''}`}
                    onClick={() => updateMessageStatus(selectedMessage.id, 'REPLIED')}
                  >
                    REPLIED
                  </button>
                  <button 
                    type="button" 
                    className={`status-chip-btn ${selectedMessage.status === 'ARCHIVED' ? 'active' : ''}`}
                    onClick={() => updateMessageStatus(selectedMessage.id, 'ARCHIVED')}
                  >
                    ARCHIVED
                  </button>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <a 
                href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                className="admin-btn primary"
                onClick={() => updateMessageStatus(selectedMessage.id, 'REPLIED')}
              >
                <i className="fa fa-reply"></i> Reply via Email
              </a>
              <button 
                type="button" 
                className="admin-btn danger" 
                onClick={() => openDeleteModal(selectedMessage)}
              >
                <i className="fa fa-trash-o"></i> Delete
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
        title="Delete Enquiry"
        message={`Are you sure you want to delete the enquiry from ${messageToDelete?.name}?`}
        confirmText="Delete Message"
        loading={saving}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default AdminMessages;
