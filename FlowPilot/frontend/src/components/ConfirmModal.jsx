import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Proceed',
  confirmVariant = 'danger',
  isLoading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="480px">
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: confirmVariant === 'danger' ? '#fef2f2' : '#eff6ff',
            color: confirmVariant === 'danger' ? '#dc2626' : '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <AlertTriangle size={22} />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '15px', color: '#334155', lineHeight: 1.5 }}>
            {message}
          </p>
        </div>
      </div>

      <div
        style={{
          marginTop: '28px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={confirmVariant === 'danger' ? 'btn-danger' : 'btn-primary'}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};
