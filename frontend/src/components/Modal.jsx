import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IconClose } from './Icons';
import './Modal.css';

function Modal({ title, children, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close">
            <IconClose size={18} />
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export default Modal;
