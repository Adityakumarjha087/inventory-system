import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconCheck, IconAlert, IconInfo, IconClose } from './Icons';
import './Notification.css';

function Notification({ message, type = 'success', onClose }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const totalTime = 4000;
    const intervalTime = 40; // update every 40ms
    const step = (intervalTime / totalTime) * 100;

    const timer = setTimeout(onClose, totalTime);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.max(prev - step, 0));
    }, intervalTime);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <IconCheck size={18} className="notification__icon" />;
      case 'error':
        return <IconAlert size={18} className="notification__icon" />;
      case 'info':
      default:
        return <IconInfo size={18} className="notification__icon" />;
    }
  };

  return createPortal(
    <div className={`notification notification--${type}`}>
      <div className="notification__body">
        <div className="notification__icon-container">
          {getIcon()}
        </div>
        <span className="notification__message">{message}</span>
        <button className="notification__close" onClick={onClose} aria-label="Dismiss">
          <IconClose size={14} />
        </button>
      </div>
      <div className="notification__progress" style={{ width: `${progress}%` }}></div>
    </div>,
    document.body
  );
}

export default Notification;
