import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const AdminNotifications = () => {
  const { showSuccess, showError } = useToast();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resendingId, setResendingId] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modals
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const [diagnosticRunning, setDiagnosticRunning] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState(null);
  const [diagnosticType, setDiagnosticType] = useState('EMAIL');
  const [diagnosticTarget, setDiagnosticTarget] = useState('');

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [channelFilter, statusFilter, typeFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (channelFilter !== 'ALL') params.channel = channelFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (typeFilter !== 'ALL') params.type = typeFilter;

      const res = await api.adminGetNotificationLogs(params);
      if (res && res.status === 'success') {
        setLogs(res.data || []);
      } else {
        showError(res?.message || 'Failed to load notification logs.');
      }
    } catch (err) {
      console.error('Notification log fetch error:', err);
      showError('Unable to connect to notification backend service.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.adminGetNotificationStats();
      if (res && res.status === 'success') {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleResend = async (log) => {
    setResendingId(log.id);
    try {
      const res = await api.adminResendNotification(log.id);
      if (res && res.status === 'success') {
        showSuccess(`Notification #${log.id} resent successfully!`);
        fetchLogs();
        fetchStats();
      } else {
        showError(res?.message || 'Failed to resend notification.');
      }
    } catch (err) {
      showError('Error triggering resend.');
    } finally {
      setResendingId(null);
    }
  };

  const handleRunDiagnostic = async (e) => {
    e.preventDefault();
    setDiagnosticRunning(true);
    setDiagnosticResult(null);
    try {
      const res = await api.adminRunNotificationDiagnostic({
        test_type: diagnosticType,
        target: diagnosticTarget
      });
      setDiagnosticResult(res);
      if (res && res.status === 'success') {
        showSuccess(`${diagnosticType} diagnostic test passed!`);
      } else {
        showError(res?.message || `${diagnosticType} diagnostic reported errors.`);
      }
    } catch (err) {
      showError('Diagnostic request failed.');
    } finally {
      setDiagnosticRunning(false);
    }
  };

  const getChannelBadge = (channel) => {
    switch (channel) {
      case 'EMAIL':
        return (
          <span className="channel-pill email">
            <i className="fa fa-envelope-o"></i> EMAIL
          </span>
        );
      case 'SMS':
        return (
          <span className="channel-pill sms">
            <i className="fa fa-commenting-o"></i> SMS
          </span>
        );
      case 'WHATSAPP':
        return (
          <span className="channel-pill whatsapp">
            <i className="fa fa-whatsapp"></i> WHATSAPP
          </span>
        );
      default:
        return <span className="channel-pill">{channel}</span>;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'BOOKING_CONFIRMATION':
        return <span className="type-badge-pill green">Confirmation</span>;
      case 'BOOKING_CANCELLATION':
        return <span className="type-badge-pill red">Cancellation</span>;
      case 'BOOKING_RESCHEDULED':
        return <span className="type-badge-pill blue">Rescheduled</span>;
      case 'BOOKING_REMINDER':
        return <span className="type-badge-pill orange">Reminder</span>;
      default:
        return <span className="type-badge-pill">{type}</span>;
    }
  };

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="page-header-left">
          <div className="page-header-icon orange">
            <i className="fa fa-bell"></i>
          </div>
          <div>
            <h2 className="page-title">NOTIFICATION LOGS & AUDIT</h2>
            <p className="page-subtitle">
              Real-time audit history of Brevo SMTP transactional emails, Fast2SMS alerts, and WhatsApp delivery passes
            </p>
          </div>
        </div>
        <div className="page-header-actions">
          <button
            type="button"
            className="admin-btn secondary"
            onClick={() => {
              setDiagnosticResult(null);
              setShowDiagnosticModal(true);
            }}
          >
            <i className="fa fa-stethoscope"></i> SMTP & SMS Diagnostics
          </button>
          <button
            type="button"
            className="admin-btn primary"
            onClick={() => {
              fetchLogs();
              fetchStats();
            }}
          >
            <i className="fa fa-refresh"></i> Refresh Logs
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="admin-kpi-grid mb-4">
        <div className="kpi-card accent-orange">
          <div className="kpi-icon-wrap">
            <i className="fa fa-paper-plane"></i>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">TOTAL DISPATCHES</span>
            <h3 className="kpi-value">{stats ? stats.total_dispatches : '...'}</h3>
            <span className="kpi-subtext">All-time notification records</span>
          </div>
        </div>

        <div className="kpi-card accent-green">
          <div className="kpi-icon-wrap">
            <i className="fa fa-envelope"></i>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">EMAILS SENT (BREVO)</span>
            <h3 className="kpi-value">{stats ? stats.email_sent : '...'}</h3>
            <span className="kpi-subtext">
              <strong style={{ color: stats?.email_failed > 0 ? '#ff4757' : '#2ed573' }}>
                {stats ? stats.email_failed : 0} Failed
              </strong>
            </span>
          </div>
        </div>

        <div className="kpi-card accent-blue">
          <div className="kpi-icon-wrap">
            <i className="fa fa-mobile"></i>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">SMS SENT (FAST2SMS)</span>
            <h3 className="kpi-value">{stats ? stats.sms_sent : '...'}</h3>
            <span className="kpi-subtext">
              <strong style={{ color: stats?.sms_failed > 0 ? '#ff4757' : '#2ed573' }}>
                {stats ? stats.sms_failed : 0} Failed
              </strong>
            </span>
          </div>
        </div>

        <div className="kpi-card accent-purple">
          <div className="kpi-icon-wrap">
            <i className="fa fa-shield"></i>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">DELIVERY SUCCESS RATE</span>
            <h3 className="kpi-value">{stats ? `${stats.success_rate}%` : '...'}</h3>
            <span className="kpi-subtext">Transactional reliability</span>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="admin-filter-card">
        <form onSubmit={handleSearchSubmit} className="filter-form">
          <div className="filter-input-wrap search">
            <i className="fa fa-search"></i>
            <input
              type="text"
              placeholder="Search recipient, athlete, Ref #, message ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-form-input"
            />
          </div>

          <div className="filter-select-wrap">
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="admin-form-select"
            >
              <option value="ALL">All Channels</option>
              <option value="EMAIL">Email (Brevo SMTP)</option>
              <option value="SMS">SMS (Fast2SMS)</option>
              <option value="WHATSAPP">WhatsApp</option>
            </select>
          </div>

          <div className="filter-select-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-form-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="SENT">Delivered / Sent</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
              <option value="RETRYING">Retrying</option>
            </select>
          </div>

          <div className="filter-select-wrap">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="admin-form-select"
            >
              <option value="ALL">All Event Types</option>
              <option value="BOOKING_CONFIRMATION">Booking Confirmation</option>
              <option value="BOOKING_CANCELLATION">Booking Cancellation</option>
              <option value="BOOKING_RESCHEDULED">Booking Rescheduled</option>
              <option value="BOOKING_REMINDER">Booking Reminder</option>
            </select>
          </div>

          <button type="submit" className="admin-btn secondary">
            <i className="fa fa-filter"></i> Apply Filter
          </button>

          {(search || channelFilter !== 'ALL' || statusFilter !== 'ALL' || typeFilter !== 'ALL') && (
            <button
              type="button"
              className="admin-btn outline"
              onClick={() => {
                setSearch('');
                setChannelFilter('ALL');
                setStatusFilter('ALL');
                setTypeFilter('ALL');
              }}
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Logs Table Card */}
      <div className="admin-card">
        <div className="card-body-table">
          {loading ? (
            <div className="admin-table-loading">
              <i className="fa fa-spinner fa-spin"></i> Fetching real-time notification audit trail...
            </div>
          ) : logs.length === 0 ? (
            <div className="admin-table-empty">
              <i className="fa fa-bell-slash-o"></i>
              <h4>No notification logs found</h4>
              <p>When emails or SMS alerts are dispatched, their logs and delivery proofs will appear here.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>LOG ID</th>
                    <th>BOOKING REF</th>
                    <th>ATHLETE / RECIPIENT</th>
                    <th>CHANNEL</th>
                    <th>EVENT TYPE</th>
                    <th>STATUS</th>
                    <th>PROVIDER</th>
                    <th>SENT TIME</th>
                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <span className="text-muted text-xs font-mono">#{log.id}</span>
                      </td>
                      <td>
                        <span className="badge-ref-orange">
                          {log.booking_ref}
                        </span>
                      </td>
                      <td>
                        <div className="athlete-cell">
                          <strong>{log.customer_name}</strong>
                          <span className="text-muted text-xs font-mono">
                            {log.recipient}
                          </span>
                        </div>
                      </td>
                      <td>{getChannelBadge(log.channel)}</td>
                      <td>{getTypeBadge(log.notification_type)}</td>
                      <td>
                        <span className={`status-badge-pill ${log.status.toLowerCase()}`}>
                          {log.status === 'SENT' ? 'Delivered ✓' : log.status}
                        </span>
                      </td>
                      <td>
                        <span className="text-muted text-xs font-semibold">
                          {log.provider_display}
                        </span>
                      </td>
                      <td>
                        <div className="time-cell">
                          <span>{log.sent_at || log.created_at}</span>
                          {log.retry_count > 0 && (
                            <span className="text-warning text-xs font-mono">
                              Retried ({log.retry_count}x)
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-action-btns">
                          <button
                            type="button"
                            className="action-icon-btn view"
                            onClick={() => setSelectedLog(log)}
                            title="Inspect Log & Raw Response"
                          >
                            <i className="fa fa-eye"></i>
                          </button>
                          <button
                            type="button"
                            className="action-icon-btn resend"
                            onClick={() => handleResend(log)}
                            disabled={resendingId === log.id}
                            title="Resend Notification"
                          >
                            {resendingId === log.id ? (
                              <i className="fa fa-spinner fa-spin"></i>
                            ) : (
                              <i className="fa fa-repeat"></i>
                            )}
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

      {/* Inspect Log Detail Modal */}
      {selectedLog && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedLog(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="admin-modal-header">
              <div className="modal-title-wrap">
                <i className="fa fa-info-circle text-orange mr-2"></i>
                <h3>NOTIFICATION LOG #{selectedLog.id}</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setSelectedLog(null)}>
                <i className="fa fa-times"></i>
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="session-summary-box mb-4">
                <div className="summary-row">
                  <span>Booking Reference:</span>
                  <strong style={{ color: '#f36100' }}>{selectedLog.booking_ref}</strong>
                </div>
                <div className="summary-row">
                  <span>Athlete Name:</span>
                  <strong>{selectedLog.customer_name}</strong>
                </div>
                <div className="summary-row">
                  <span>Recipient Target:</span>
                  <strong>{selectedLog.recipient}</strong>
                </div>
                <div className="summary-row">
                  <span>Channel:</span>
                  <div>{getChannelBadge(selectedLog.channel)}</div>
                </div>
                <div className="summary-row">
                  <span>Event Type:</span>
                  <div>{getTypeBadge(selectedLog.notification_type)}</div>
                </div>
                <div className="summary-row">
                  <span>Status:</span>
                  <span className={`status-badge-pill ${selectedLog.status.toLowerCase()}`}>
                    {selectedLog.status}
                  </span>
                </div>
                <div className="summary-row">
                  <span>Provider / Gateway:</span>
                  <strong>{selectedLog.provider_display}</strong>
                </div>
                <div className="summary-row">
                  <span>Created / Sent At:</span>
                  <span>{selectedLog.created_at} → {selectedLog.sent_at || 'Pending'}</span>
                </div>
                <div className="summary-row">
                  <span>Retry Count:</span>
                  <strong>{selectedLog.retry_count} attempts</strong>
                </div>
                {selectedLog.error_message && (
                  <div className="summary-row" style={{ color: '#ff4757' }}>
                    <span>Error Reason:</span>
                    <em>{selectedLog.error_message}</em>
                  </div>
                )}
              </div>

              {selectedLog.response_data && Object.keys(selectedLog.response_data).length > 0 && (
                <div className="raw-response-box">
                  <span className="raw-response-title">Raw Provider Response Data:</span>
                  <pre className="raw-json-block">
                    {JSON.stringify(selectedLog.response_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn outline"
                onClick={() => setSelectedLog(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="admin-btn primary"
                onClick={() => handleResend(selectedLog)}
                disabled={resendingId === selectedLog.id}
              >
                {resendingId === selectedLog.id ? (
                  <>
                    <i className="fa fa-spinner fa-spin"></i> Resending...
                  </>
                ) : (
                  <>
                    <i className="fa fa-repeat"></i> Resend Notification Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMTP & SMS Diagnostic Modal */}
      {showDiagnosticModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowDiagnosticModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="admin-modal-header">
              <div className="modal-title-wrap">
                <i className="fa fa-stethoscope text-orange mr-2"></i>
                <h3>NOTIFICATION GATEWAY DIAGNOSTICS</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowDiagnosticModal(false)}>
                <i className="fa fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleRunDiagnostic}>
              <div className="admin-modal-body">
                <p style={{ fontSize: '13px', color: '#a4a4ab', marginBottom: '16px' }}>
                  Verify live connection and transactional dispatch to Brevo SMTP or Fast2SMS without exposing master keys.
                </p>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="admin-field-label">Provider Channel to Test</label>
                    <select
                      className="admin-form-select"
                      value={diagnosticType}
                      onChange={(e) => setDiagnosticType(e.target.value)}
                    >
                      <option value="EMAIL">Brevo SMTP Email (Port 587)</option>
                      <option value="SMS">Fast2SMS Gateway (bulkV2)</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="admin-field-label">
                      {diagnosticType === 'EMAIL' ? 'Recipient Test Email' : 'Recipient Test Mobile'}
                    </label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder={diagnosticType === 'EMAIL' ? 'your-email@gmail.com' : '9876543210'}
                      value={diagnosticTarget}
                      onChange={(e) => setDiagnosticTarget(e.target.value)}
                    />
                  </div>
                </div>

                {diagnosticResult && (
                  <div className={`diagnostic-result-box ${diagnosticResult.status}`}>
                    <div className="diag-header">
                      <strong>Diagnostic Result: {diagnosticResult.status.toUpperCase()}</strong>
                    </div>
                    <pre className="raw-json-block mt-2">
                      {JSON.stringify(diagnosticResult.diagnostic, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn outline"
                  onClick={() => setShowDiagnosticModal(false)}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="admin-btn primary"
                  disabled={diagnosticRunning}
                >
                  {diagnosticRunning ? (
                    <>
                      <i className="fa fa-spinner fa-spin"></i> Running Connection Check...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-bolt"></i> Run Live Diagnostic
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
