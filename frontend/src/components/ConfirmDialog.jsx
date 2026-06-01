import { createPortal } from 'react-dom';
import { IconAlert } from './Icons';
import './ConfirmDialog.css';

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return createPortal(
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-dialog__icon-wrapper">
          <IconAlert size={28} className="confirm-dialog__icon" />
        </div>
        <h3 className="confirm-dialog__title">Are you sure?</h3>
        <p className="confirm-dialog__message">{message}</p>
        <div className="confirm-dialog__actions">
          <button className="btn btn--secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn--danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmDialog;
