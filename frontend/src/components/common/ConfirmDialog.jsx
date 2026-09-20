import Modal from './Modal';

function ConfirmDialog({ isOpen, onClose, onConfirm, title = 'Confirm Delete', message, confirmText = 'Delete', danger = true }) {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p style={{ color: '#4a5568', marginBottom: 24, lineHeight: 1.6 }}>
        {message || 'Are you sure you want to proceed? This action cannot be undone.'}
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={onClose} type="button">Cancel</button>
        <button
          className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
          onClick={() => { onConfirm(); onClose(); }}
          type="button"
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
