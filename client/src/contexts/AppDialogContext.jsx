import { createContext, useCallback, useContext, useRef, useState } from 'react';
import AppDialog from '../components/app/AppDialog';

const AppDialogContext = createContext(null);

export function AppDialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolverRef = useRef(null);

  const close = useCallback((result) => {
    setDialog(null);
    const resolve = resolverRef.current;
    resolverRef.current = null;
    resolve?.(result);
  }, []);

  const alert = useCallback((options) => {
    const config =
      typeof options === 'string'
        ? { message: options }
        : options || {};

    return new Promise((resolve) => {
      resolverRef.current = () => resolve(true);
      setDialog({
        type: 'alert',
        title: config.title || 'Notice',
        message: config.message || '',
        variant: config.variant || 'info',
        confirmLabel: config.confirmLabel || 'OK',
      });
    });
  }, []);

  const confirm = useCallback((options) => {
    const config = typeof options === 'string' ? { message: options } : options || {};

    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog({
        type: 'confirm',
        title: config.title || 'Confirm',
        message: config.message || '',
        confirmLabel: config.confirmLabel || 'Confirm',
        cancelLabel: config.cancelLabel || 'Cancel',
        variant: config.variant || 'primary',
      });
    });
  }, []);

  const prompt = useCallback((options) => {
    const config = typeof options === 'string' ? { message: options } : options || {};

    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog({
        type: 'prompt',
        title: config.title || 'Input required',
        message: config.message || '',
        placeholder: config.placeholder || '',
        defaultValue: config.defaultValue || '',
        confirmLabel: config.confirmLabel || 'Submit',
        cancelLabel: config.cancelLabel || 'Cancel',
      });
    });
  }, []);

  return (
    <AppDialogContext.Provider value={{ alert, confirm, prompt }}>
      {children}
      {dialog && <AppDialog {...dialog} onClose={close} />}
    </AppDialogContext.Provider>
  );
}

export function useAppDialog() {
  const context = useContext(AppDialogContext);
  if (!context) {
    throw new Error('useAppDialog must be used within AppDialogProvider');
  }
  return context;
}
