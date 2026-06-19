import { useEffect, useRef, useState } from 'react';
import { AlertCircle, AlertTriangle, HelpCircle, Info } from 'lucide-react';
import './AppDialog.css';

const icons = {
  info: Info,
  error: AlertCircle,
  warn: AlertTriangle,
  danger: AlertTriangle,
  primary: HelpCircle,
};

export default function AppDialog({
  type = 'alert',
  title,
  message,
  variant = 'info',
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  placeholder = '',
  defaultValue = '',
  onClose,
}) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef(null);
  const confirmRef = useRef(null);
  const Icon = icons[variant] || Info;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (type === 'alert') onClose(true);
        else if (type === 'confirm') onClose(false);
        else onClose(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    if (type === 'prompt') {
      inputRef.current?.focus();
    } else {
      confirmRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [type, onClose]);

  const handleBackdrop = () => {
    if (type === 'alert') onClose(true);
    else if (type === 'confirm') onClose(false);
    else onClose(null);
  };

  const handleConfirm = () => {
    if (type === 'prompt') onClose(value);
    else if (type === 'confirm') onClose(true);
    else onClose(true);
  };

  return (
    <div className="app-dialog" role="presentation">
      <button type="button" className="app-dialog__backdrop" onClick={handleBackdrop} aria-label="Close dialog" />
      <div
        className={`app-dialog__panel app-dialog__panel--${variant}`}
        role={type === 'alert' ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby="app-dialog-title"
        aria-describedby={message ? 'app-dialog-message' : undefined}
      >
        <div className="app-dialog__body">
          <div className={`app-dialog__icon app-dialog__icon--${variant}`} aria-hidden="true">
            <Icon size={24} strokeWidth={2.2} />
          </div>

          <div className="app-dialog__content">
            <h2 id="app-dialog-title" className="app-dialog__title">{title}</h2>
            {message && <p id="app-dialog-message" className="app-dialog__message">{message}</p>}

            {type === 'prompt' && (
              <input
                ref={inputRef}
                type="text"
                className="app-dialog__input"
                value={value}
                placeholder={placeholder}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleConfirm();
                  }
                }}
              />
            )}
          </div>
        </div>

        <div className="app-dialog__actions">
          {type !== 'alert' && (
            <button type="button" className="app-dialog__btn app-dialog__btn--ghost" onClick={handleBackdrop}>
              {cancelLabel}
            </button>
          )}
          <button
            ref={confirmRef}
            type="button"
            className={`app-dialog__btn ${variant === 'danger' ? 'app-dialog__btn--danger' : 'app-dialog__btn--primary'}`}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
