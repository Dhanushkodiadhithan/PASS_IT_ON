'use client';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';

export default function Modal({
  open, onClose, title, children,
}: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 bg-on-surface/30 flex items-center justify-center p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bg-white border border-outline-variant rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
          <h3 className="text-headline-sm text-on-surface">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant">
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}