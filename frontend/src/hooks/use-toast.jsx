import { useState, useCallback } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, variant = 'success' }) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, variant }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const ToastContainer = () => (
    <div className="toast-container position-fixed bottom-0 end-0 p-3">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          onClose={() => removeToast(toast.id)}
          show={true}
          delay={3000}
          autohide
          bg={toast.variant}
        >
          <Toast.Header>
            <strong className="me-auto">{toast.title}</strong>
          </Toast.Header>
          <Toast.Body className={toast.variant === 'dark' ? 'text-white' : ''}>
            {toast.message}
          </Toast.Body>
        </Toast>
      ))}
    </div>
  );

  return {
    addToast,
    removeToast,
    ToastContainer
  };
}; 