import React from 'react';

const ConfirmModal = ({
  isOpen = false,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  warning = '',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmVariant = 'danger', // 'danger' | 'warning' | 'primary'
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onCancel}>
      <div 
        className="admin-modal-dialog confirm-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <div className="confirm-icon-col">
            {confirmVariant === 'danger' && (
              <div className="confirm-icon danger">
                <i className="fa fa-exclamation-triangle"></i>
              </div>
            )}
            {confirmVariant === 'warning' && (
              <div className="confirm-icon warning">
                <i className="fa fa-info-circle"></i>
              </div>
            )}
            {confirmVariant === 'primary' && (
              <div className="confirm-icon primary">
                <i className="fa fa-check-circle"></i>
              </div>
            )}
          </div>
          <div>
            <h3 className="confirm-title">{title}</h3>
            <p className="confirm-message">{message}</p>
          </div>
        </div>

        {warning && (
          <div className="confirm-warning-box">
            <i className="fa fa-shield"></i>
            <span>{warning}</span>
          </div>
        )}

        <div className="admin-modal-footer">
          <button
            type="button"
            className="admin-btn secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`admin-btn ${confirmVariant}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
