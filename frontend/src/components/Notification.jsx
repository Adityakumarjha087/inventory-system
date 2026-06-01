import { useEffect } from 'react';
import './Notification.css';

function Notification({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification notification--${type}`}>
      <span className="notification__message">{message}</span>
      <button className="notification__close" onClick={onClose} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}

export default Notification;
