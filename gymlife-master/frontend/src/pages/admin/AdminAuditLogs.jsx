import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import DataTable from '../../components/admin/DataTable';
import { useToast } from '../../context/ToastContext';

const AdminAuditLogs = () => {
  const { showError } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    loadLogs();
  }, [selectedEntity]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedEntity !== 'ALL') params.entity = selectedEntity;
      const res = await api.adminGetAuditLogs(params);
      if (res && res.status === 'success') {
        setLogs(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      showError(err.message || 'Super Admin privileges required to view audit logs.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Timestamp',
      key: 'timestamp',
      sortable: true,
      render: (val) => <span className="time-display-pill"><i className="fa fa-clock-o"></i> {val}</span>
    },
    {
      header: 'Admin User',
      key: 'user',
      sortable: true,
      render: (val) => <strong>{val}</strong>
    },
    {
      header: 'Action Executed',
      key: 'action',
      sortable: true,
      render: (val) => <span className="audit-action-tag">{val}</span>
    },
    {
      header: 'Target Entity',
      key: 'entity',
      sortable: true,
      render: (val, row) => (
        <span>
          {val} {row.entity_id ? `(#${row.entity_id})` : ''}
        </span>
      )
    },
    {
      header: 'IP Address',
      key: 'ip_address',
      render: (val) => <span className="ip-pill">{val}</span>
    },
    {
      header: 'Details',
      key: 'details',
      render: (val) => (
        <span className="table-sub-text" style={{ maxWidth: '280px', display: 'inline-block' }}>
          {val ? (val.length > 50 ? `${val.slice(0, 50)}...` : val) : '-'}
        </span>
      )
    }
  ];

  return (
    <div className="admin-module-page">
      <div className="module-top-header">
        <div>
          <h2 className="module-title">SYSTEM SECURITY & AUDIT TRAIL</h2>
          <p className="module-subtitle">Chronological ledger of administrative activities, logins, and database alterations.</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        searchPlaceholder="Search audit log by admin, action, or details..."
        filterOptions={[
          { label: 'All Entities', value: 'ALL' },
          { label: 'Member', value: 'Member' },
          { label: 'Trainer', value: 'Trainer' },
          { label: 'Class', value: 'Class' },
          { label: 'Timetable', value: 'Timetable' },
          { label: 'PricingPlan', value: 'PricingPlan' },
          { label: 'Payment', value: 'Payment' },
          { label: 'BlogPost', value: 'BlogPost' },
          { label: 'Settings', value: 'Settings' },
          { label: 'Auth', value: 'Auth' },
        ]}
        currentFilter={selectedEntity}
        onFilterChange={setSelectedEntity}
        filterLabel="Entity Type"
        defaultSortField="timestamp"
        defaultSortAsc={false}
        emptyMessage="No audit log entries recorded."
        onRowClick={(row) => setSelectedLog(row)}
      />

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="admin-modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="admin-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 className="modal-title">AUDIT LOG ENTRY #{selectedLog.id}</h3>
                <p className="modal-subtitle">{selectedLog.timestamp}</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setSelectedLog(null)}>
                <i className="fa fa-times"></i>
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="details-card-grid">
                <div className="detail-item">
                  <span className="detail-label">Admin Operator</span>
                  <span className="detail-val">{selectedLog.user}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Action</span>
                  <span className="audit-action-tag">{selectedLog.action}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Target Entity</span>
                  <span className="detail-val">{selectedLog.entity} (ID: {selectedLog.entity_id || 'N/A'})</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Client IP</span>
                  <span className="ip-pill">{selectedLog.ip_address}</span>
                </div>
              </div>

              <div className="detail-full-row" style={{ marginTop: '16px' }}>
                <span className="detail-label">Operation Payload & Comments:</span>
                <p className="detail-notes-box" style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                  {selectedLog.details || 'No additional metadata logged.'}
                </p>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button type="button" className="admin-btn secondary" onClick={() => setSelectedLog(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;
