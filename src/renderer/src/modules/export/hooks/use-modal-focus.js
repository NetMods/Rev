import { useEffect } from 'react';

export default function useModalFocus(modalRef) {
  useEffect(() => {
    if (!modalRef.current) return;

    // Prevent Ctrl+A (or Cmd+A) from selecting text outside modal
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        event.preventDefault();
      }
    };

    // Focus trapping
    const handleTabKey = (event) => {
      if (event.key === 'Tab') {
        const focusableElements = modalRef.current.querySelectorAll(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleTabKey);

    // Set initial focus to the modal
    const firstFocusable = modalRef.current.querySelector(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (firstFocusable) {
      firstFocusable.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [modalRef]);
}
